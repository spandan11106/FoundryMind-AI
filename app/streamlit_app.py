import streamlit as st
import joblib
import pandas as pd

import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.casting.optimizer import optimize
from src.llm.assistant import explain_casting

# -----------------------
# Load model
# -----------------------
bundle = joblib.load("models/casting_model.pkl")
model = bundle["model"]
encoders = bundle["encoders"]

# -----------------------
# UI Title
# -----------------------
st.title("🧠 FoundryMind AI — Casting Optimization System")

tab1, tab2, tab3 = st.tabs(["Casting Optimizer", "Factory Analyzer", "AI Assistant"])

# =======================
# TAB 1: CASTING
# =======================
with tab1:

    st.header("Casting Optimization")

    metal = st.selectbox("Metal Type", ["Aluminum", "Steel", "Cast Iron"])
    temp = st.slider("Pouring Temperature", 600, 800, 700)
    mold = st.selectbox("Mold Material", ["sand", "die", "ceramic"])
    cooling = st.selectbox("Cooling Rate", ["low", "medium", "high"])
    thickness = st.slider("Section Thickness", 5, 50, 20)
    speed = st.slider("Pouring Speed", 0.5, 2.0, 1.0)

    if st.button("Optimize Process"):

        best_sample, probs, score = optimize()

        st.subheader("Optimized Parameters")
        st.write(best_sample)

        st.subheader("Defect Probabilities")
        st.write({
            "Porosity": probs[0],
            "Shrinkage": probs[1],
            "Cold Shut": probs[2]
        })

        st.success(f"Final Score: {score:.3f}")

# =======================
# TAB 2: FACTORY (placeholder for now)
# =======================
with tab2:
    st.header("Factory Analyzer")
    st.info("Coming next: Kaggle model integration")

# =======================
# TAB 3: AI ASSISTANT
# =======================
with tab3:

    st.header("AI Manufacturing Assistant")

    user_input = st.text_area("Ask about casting defects...")

    if st.button("Explain"):

        # Dummy example (replace later with real data)
        explanation = explain_casting(
            {"temperature": 700},
            [0.2, 0.3, 0.5]
        )

        st.write(explanation)