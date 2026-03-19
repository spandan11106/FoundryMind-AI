import joblib
import pandas as pd

_model = None


def _load_model():
    global _model
    if _model is None:
        _model = joblib.load("models/factory_model.pkl")
    return _model

def predict_factory(input_dict):
    model = _load_model()
    df = pd.DataFrame([input_dict])
    pred = model.predict(df)[0]
    prob = model.predict_proba(df)[0][1]

    return pred, prob