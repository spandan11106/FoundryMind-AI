import joblib
import pandas as pd

model = joblib.load("models/factory_model.pkl")

def predict_factory(input_dict):
    df = pd.DataFrame([input_dict])
    pred = model.predict(df)[0]
    prob = model.predict_proba(df)[0][1]

    return pred, prob