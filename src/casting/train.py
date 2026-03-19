import pandas as pd
import numpy as np
import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report

# Paths
DATA_PATH = "data/raw/synthetic_data.csv"
MODEL_PATH = "models/casting_model.pkl"

# Load data
df = pd.read_csv(DATA_PATH)

# -----------------------
# Encode categorical data
# -----------------------
label_encoders = {}

categorical_cols = ["metal_type", "mold_material", "cooling_rate"]

for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le

# -----------------------
# Features and Targets
# -----------------------
X = df.drop(columns=["porosity", "shrinkage", "cold_shut"])
y = df[["porosity", "shrinkage", "cold_shut"]]

# -----------------------
# Train-test split
# -----------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -----------------------
# Model
# -----------------------
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=8,
    random_state=42
)

model.fit(X_train, y_train)

# -----------------------
# Evaluation
# -----------------------
y_pred = model.predict(X_test)

print("\n=== Model Evaluation ===\n")

for i, col in enumerate(y.columns):
    print(f"\n--- {col.upper()} ---")
    print(classification_report(y_test.iloc[:, i], y_pred[:, i]))

# -----------------------
# Save model + encoders
# -----------------------
os.makedirs("models", exist_ok=True)

joblib.dump({
    "model": model,
    "encoders": label_encoders
}, MODEL_PATH)

print(f"\nModel saved at {MODEL_PATH}")