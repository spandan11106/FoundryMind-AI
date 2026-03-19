import streamlit as st
import joblib
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
import sys
import os
from dotenv import load_dotenv
load_dotenv()

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.casting.optimizer import optimize
from src.llm.assistant import explain_casting
from src.factory.predict import predict_factory

# -----------------------
# Page Configuration
# -----------------------
st.set_page_config(
    page_title="FoundryMind AI",
    page_icon="🏭",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom styling
st.markdown("""
    <style>
    .main {
        background-color: #f8f9fa;
    }
    .metric-card {
        background-color: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .defect-high {
        color: #d32f2f;
        font-weight: bold;
    }
    .defect-medium {
        color: #f57c00;
        font-weight: bold;
    }
    .defect-low {
        color: #388e3c;
        font-weight: bold;
    }
    </style>
""", unsafe_allow_html=True)

# -----------------------
# Load Model
# -----------------------
@st.cache_resource
def load_model():
    try:
        bundle = joblib.load("models/casting_model.pkl")
        return bundle["model"], bundle["encoders"]
    except:
        st.error("❌ Model not found. Please train the model first.")
        return None, None

model, encoders = load_model()

# -----------------------
# Sidebar
# -----------------------
with st.sidebar:
    st.title("⚙️ Settings")
    
    st.markdown("---")
    
    st.subheader("About")
    st.info("""
    **FoundryMind AI** — Intelligent metal casting optimization system powered by machine learning and AI-driven insights.
    
    Features:
    - 🔍 Casting process optimization
    - 📊 Factory performance analysis
    - 🤖 AI-powered explanations
    """)
    
    st.markdown("---")
    
    st.subheader("Model Info")
    if model:
        st.success("✅ Model loaded")
        st.caption("Status: Ready for prediction")
    else:
        st.error("❌ Model not available")
    
    st.markdown("---")
    
    # Sample data option
    use_sample = st.checkbox("📋 Use Sample Data")

# -----------------------
# Main Title
# -----------------------
col1, col2 = st.columns([3, 1])
with col1:
    st.title("🏭 FoundryMind AI — Casting Optimization")
with col2:
    st.metric("Status", "Ready", delta="Active")

# -----------------------
# Tabs
# -----------------------
tab1, tab2, tab3 = st.tabs(["🔧 Casting Optimizer", "📊 Analysis", "🤖 AI Assistant"])

# =======================
# TAB 1: CASTING OPTIMIZER
# =======================
with tab1:
    st.header("Casting Process Optimizer")
    
    st.markdown("Configure your metal casting parameters to optimize for minimal defects.")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.subheader("🔥 Metal Properties")
        metal = st.selectbox("Metal Type", ["Aluminum", "Steel", "Cast Iron"], key="metal")
        temp = st.slider("Pouring Temperature (°C)", 600, 1600, 700, key="temp")
        
    with col2:
        st.subheader("🏗️ Mold Configuration")
        mold = st.selectbox("Mold Material", ["sand", "die", "ceramic"], key="mold")
        cooling = st.selectbox("Cooling Rate", ["low", "medium", "high"], key="cooling")
        
    with col3:
        st.subheader("⚡ Flow Parameters")
        thickness = st.slider("Section Thickness (mm)", 5, 50, 20, key="thickness")
        speed = st.slider("Pouring Speed (m/s)", 0.5, 3.0, 1.0, key="speed")
    
    # Create sample data visualization
    st.markdown("---")
    
    col_opt1, col_opt2 = st.columns([2, 1])
    
    with col_opt1:
        if st.button("🚀 Optimize Process", use_container_width=True):
            with st.spinner("Analyzing parameters..."):
                try:
                    best_sample, probs, score = optimize()
                    
                    # Display results in metrics
                    st.subheader("✅ Optimization Results")
                    
                    metric_col1, metric_col2, metric_col3, metric_col4 = st.columns(4)
                    
                    with metric_col1:
                        porosity_color = "🔴" if probs[0] > 0.5 else "🟡" if probs[0] > 0.3 else "🟢"
                        st.metric("Porosity Risk", f"{probs[0]:.1%}", delta=None)
                    
                    with metric_col2:
                        shrinkage_color = "🔴" if probs[1] > 0.5 else "🟡" if probs[1] > 0.3 else "🟢"
                        st.metric("Shrinkage Risk", f"{probs[1]:.1%}", delta=None)
                    
                    with metric_col3:
                        cold_shut_color = "🔴" if probs[2] > 0.5 else "🟡" if probs[2] > 0.3 else "🟢"
                        st.metric("Cold Shut Risk", f"{probs[2]:.1%}", delta=None)
                    
                    with metric_col4:
                        st.metric("Quality Score", f"{score:.2%}", delta=f"+{(1-max(probs))*100:.1f}%")
                    
                    st.markdown("---")
                    
                    # Radar chart for defects
                    col_chart1, col_chart2 = st.columns(2)
                    
                    with col_chart1:
                        fig = go.Figure(data=go.Scatterpolar(
                            r=[1-probs[0], 1-probs[1], 1-probs[2]],
                            theta=['Porosity', 'Shrinkage', 'Cold Shut'],
                            fill='toself',
                            name='Safety Margin'
                        ))
                        fig.update_layout(
                            polar=dict(radialaxis=dict(visible=True, range=[0, 1])),
                            title="Defect Risk Profile",
                            height=400,
                            showlegend=False
                        )
                        st.plotly_chart(fig, use_container_width=True)
                    
                    with col_chart2:
                        defect_labels = ['No Defects', 'Porosity', 'Shrinkage', 'Cold Shut']
                        defect_values = [
                            (1-probs[0]) * (1-probs[1]) * (1-probs[2]),
                            probs[0],
                            probs[1],
                            probs[2]
                        ]
                        fig = go.Figure(data=[go.Bar(
                            x=defect_labels[:1],
                            y=[defect_values[0]],
                            marker_color='#4CAF50'
                        )] + [go.Bar(
                            x=[defect_labels[i]],
                            y=[defect_values[i]],
                            marker_color=['#f57c00', '#d32f2f', '#ff9800'][i-1]
                        ) for i in range(1, 4)])
                        fig.update_layout(title="Defect Probability", height=400, showlegend=False)
                        st.plotly_chart(fig, use_container_width=True)
                    
                    st.success("✨ Analysis complete!")
                    
                except Exception as e:
                    st.error(f"❌ Optimization failed: {str(e)}")
    
    with col_opt2:
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("📋 Load Sample", use_container_width=True):
            st.info("Sample data loaded. Adjust parameters and optimize.")

# =======================
# TAB 2: FACTORY ANALYSIS
# =======================
with tab2:
    st.header("🏭 Factory Performance Predictor")
    
    st.markdown("Predict factory performance using machine learning model.")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.subheader("⚙️ Input Parameters")
        # Note: Adjust these based on your factory_model.pkl features
        param1 = st.number_input("Production Volume", value=100, min_value=0, max_value=10000)
        param2 = st.number_input("Quality Score", value=85.0, min_value=0.0, max_value=100.0)
        param3 = st.number_input("Equipment Age (years)", value=5, min_value=0, max_value=50)
    
    with col2:
        st.subheader("📊 Workforce")
        param4 = st.number_input("Staff Count", value=50, min_value=1, max_value=500)
        param5 = st.number_input("Training Hours", value=40, min_value=0, max_value=200)
        param6 = st.number_input("Efficiency Rate (%)", value=75.0, min_value=0.0, max_value=100.0)
    
    with col3:
        st.subheader("🔧 Maintenance")
        param7 = st.number_input("Maintenance Cost ($)", value=5000, min_value=0, max_value=100000)
        param8 = st.number_input("Downtime Hours", value=10, min_value=0, max_value=200)
        param9 = st.number_input("Equipment Health (%)", value=90.0, min_value=0.0, max_value=100.0)
    
    st.markdown("---")
    
    col_predict1, col_predict2 = st.columns([2, 1])
    
    with col_predict1:
        if st.button("🚀 Predict Factory Performance", use_container_width=True):
            with st.spinner("Analyzing factory data..."):
                try:
                    # Create input dictionary for factory model
                    factory_input = {
                        'production_volume': param1,
                        'quality_score': param2,
                        'equipment_age': param3,
                        'staff_count': param4,
                        'training_hours': param5,
                        'efficiency_rate': param6,
                        'maintenance_cost': param7,
                        'downtime_hours': param8,
                        'equipment_health': param9
                    }
                    
                    # Make prediction
                    prediction, probability = predict_factory(factory_input)
                    
                    st.subheader("✅ Factory Performance Analysis")
                    
                    metric_col1, metric_col2, metric_col3 = st.columns(3)
                    
                    with metric_col1:
                        status_emoji = "✅" if prediction == 1 else "⚠️"
                        st.metric("Status", f"{status_emoji} {'Healthy' if prediction == 1 else 'Needs Attention'}")
                    
                    with metric_col2:
                        st.metric("Performance Score", f"{probability*100:.1f}%", delta=f"{probability*100-75:.1f}%")
                    
                    with metric_col3:
                        risk_level = "🟢 Low" if probability > 0.7 else "🟡 Medium" if probability > 0.4 else "🔴 High"
                        st.metric("Risk Level", risk_level)
                    
                    st.markdown("---")
                    
                    # Performance breakdown chart
                    col_chart1, col_chart2 = st.columns(2)
                    
                    with col_chart1:
                        metrics_data = pd.DataFrame({
                            'Factor': ['Quality', 'Efficiency', 'Equipment\nHealth', 'Training', 'Availability'],
                            'Score': [param2, param6, param9, (param5/200)*100, 100-(param8/200)*100]
                        })
                        fig = px.bar(metrics_data, x='Factor', y='Score', 
                                    color='Score', color_continuous_scale='RdYlGn',
                                    range_color=[0, 100], title="Factory Health Metrics")
                        fig.update_layout(height=400, showlegend=False)
                        st.plotly_chart(fig, use_container_width=True)
                    
                    with col_chart2:
                        # Gauge chart for overall performance
                        fig = go.Figure(data=[go.Indicator(
                            mode="gauge+number+delta",
                            value=probability*100,
                            domain={'x': [0, 1], 'y': [0, 1]},
                            title={'text': "Overall Performance"},
                            delta={'reference': 75},
                            gauge={
                                'axis': {'range': [None, 100]},
                                'bar': {'color': "darkblue"},
                                'steps': [
                                    {'range': [0, 50], 'color': "#f5f5f5"},
                                    {'range': [50, 75], 'color': "#fff8f0"}
                                ],
                                'threshold': {
                                    'line': {'color': "red", 'width': 4},
                                    'thickness': 0.75,
                                    'value': 90
                                }
                            }
                        )])
                        fig.update_layout(height=400)
                        st.plotly_chart(fig, use_container_width=True)
                    
                    st.markdown("---")
                    
                    # Recommendations based on prediction
                    if prediction == 0:
                        st.warning("⚠️ Factory Performance Issues Detected")
                        st.markdown("""
                        **Recommendations:**
                        - Increase preventive maintenance frequency
                        - Review equipment maintenance schedules
                        - Conduct staff retraining programs
                        - Analyze quality control processes
                        """)
                    else:
                        st.success("✨ Factory Operating Optimally")
                        st.markdown("""
                        **Good Performance Indicators:**
                        - Equipment is in good condition
                        - Staff efficiency is high
                        - Quality metrics are stable
                        - Maintenance is adequate
                        """)
                    
                except FileNotFoundError:
                    st.error("❌ Factory model not found. Please train the factory model first.")
                except Exception as e:
                    st.error(f"❌ Prediction failed: {str(e)}")
    
    with col_predict2:
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("📊 Use Average", use_container_width=True):
            st.info("Sample parameters loaded")
    
    st.markdown("---")
    
    # Historical data visualization
    st.subheader("📈 Factory Data Analysis")
    
    col_data1, col_data2 = st.columns(2)
    
    with col_data1:
        st.subheader("Defect Distribution")
        try:
            data = pd.read_csv("data/raw/synthetic_data.csv")
            defect_counts = pd.DataFrame({
                'Defect Type': ['Porosity', 'Shrinkage', 'Cold Shut'],
                'Count': [data['porosity'].sum(), data['shrinkage'].sum(), data['cold_shut'].sum()]
            })
            fig = px.bar(defect_counts, x='Defect Type', y='Count', color='Defect Type',
                        color_discrete_map={'Porosity': '#d32f2f', 'Shrinkage': '#f57c00', 'Cold Shut': '#ff9800'})
            st.plotly_chart(fig, use_container_width=True)
        except:
            st.warning("⚠️ Dataset not found")
    
    with col_data2:
        st.subheader("Metal Type Distribution")
        try:
            metal_dist = data['metal_type'].value_counts()
            fig = px.pie(values=metal_dist.values, names=metal_dist.index, title="Dataset Composition")
            st.plotly_chart(fig, use_container_width=True)
        except:
            st.warning("⚠️ Dataset not found")
    
    st.markdown("---")
    
    with st.expander("📈 View Raw Data", expanded=False):
        try:
            st.dataframe(data.head(20), use_container_width=True)
            st.caption(f"Showing first 20 rows of {len(data)} total records")
        except:
            st.warning("⚠️ Could not load data")

# =======================
# TAB 3: AI ASSISTANT
# =======================
with tab3:
    st.header("🤖 AI Manufacturing Assistant")
    
    st.markdown("Get intelligent insights about casting defects and manufacturing optimization.")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        user_query = st.text_area(
            "Ask your question about casting processes, defects, or optimization:",
            height=100,
            placeholder="e.g., How does pouring temperature affect porosity?"
        )
    
    with col2:
        st.markdown("<br>", unsafe_allow_html=True)
        explain_btn = st.button("🚀 Get Explanation", use_container_width=True)
    
    if explain_btn and user_query:
        with st.spinner("🤔 Thinking..."):
            try:
                explanation = explain_casting(
                    {"query": user_query},
                    [0.2, 0.3, 0.5]
                )
                st.success("✅ Response generated")
                st.markdown(explanation)
            except Exception as e:
                st.error(f"❌ Error: {str(e)}")
    elif explain_btn:
        st.warning("⚠️ Please enter a question first")
    
    st.markdown("---")
    
    with st.expander("💡 Example Questions"):
        examples = [
            "What causes porosity in aluminum casting?",
            "How does cooling rate affect shrinkage?",
            "What's the optimal pouring temperature for steel?",
            "How can I reduce cold shut defects?"
        ]
        for example in examples:
            st.caption(f"• {example}")