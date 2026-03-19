import numpy as np
import pandas as pd
import joblib
import random

# -----------------------
# Load model
# -----------------------
bundle = joblib.load("models/casting_model.pkl")
model = bundle["model"]
encoders = bundle["encoders"]

# -----------------------
# Search space
# -----------------------
metal_types = ["Aluminum", "Steel", "Cast Iron"]
mold_materials = ["sand", "die", "ceramic"]
cooling_rates = ["low", "medium", "high"]

# -----------------------
# Random sample generator
# -----------------------
def random_sample():
    return {
        "metal_type": random.choice(metal_types),
        "pouring_temperature": random.uniform(600, 800),
        "mold_material": random.choice(mold_materials),
        "cooling_rate": random.choice(cooling_rates),
        "section_thickness": random.uniform(5, 50),
        "pouring_speed": random.uniform(0.5, 2.0)
    }

# -----------------------
# Encode input (FIXED)
# -----------------------
def encode_input(sample):
    encoded = sample.copy()

    for col in ["metal_type", "mold_material", "cooling_rate"]:
        encoded[col] = encoders[col].transform([sample[col]])[0]

    return pd.DataFrame([encoded])  # keeps feature names

# -----------------------
# Constraint penalties (ENGINEERING LOGIC)
# -----------------------
def constraint_penalty(sample):
    penalty = 0

    # Thin sections → cold shut risk
    if sample["section_thickness"] < 8:
        penalty += 0.25

    # Too high temperature → porosity risk
    if sample["pouring_temperature"] > 780:
        penalty += 0.15

    # High speed → turbulence → porosity
    if sample["pouring_speed"] > 1.5:
        penalty += 0.2

    # Very low cooling → shrinkage
    if sample["cooling_rate"] == "low":
        penalty += 0.2

    return penalty

# -----------------------
# Weighted defect score
# -----------------------
def defect_score(defect_probs, sample):
    porosity, shrinkage, cold_shut = defect_probs

    # weights (can tune later)
    score = (
        0.4 * porosity +
        0.3 * shrinkage +
        0.3 * cold_shut
    )

    # add constraint penalties
    score += constraint_penalty(sample)

    return score

# -----------------------
# Smart mutation (local search)
# -----------------------
def mutate(sample):
    new_sample = sample.copy()

    # randomly tweak 1–2 parameters
    keys = list(sample.keys())
    for _ in range(random.randint(1, 2)):
        key = random.choice(keys)

        if key == "pouring_temperature":
            new_sample[key] += random.uniform(-20, 20)

        elif key == "section_thickness":
            new_sample[key] += random.uniform(-3, 3)

        elif key == "pouring_speed":
            new_sample[key] += random.uniform(-0.2, 0.2)

        elif key == "cooling_rate":
            new_sample[key] = random.choice(cooling_rates)

        elif key == "mold_material":
            new_sample[key] = random.choice(mold_materials)

        elif key == "metal_type":
            new_sample[key] = random.choice(metal_types)

    # keep values in bounds
    new_sample["pouring_temperature"] = np.clip(new_sample["pouring_temperature"], 600, 800)
    new_sample["section_thickness"] = np.clip(new_sample["section_thickness"], 5, 50)
    new_sample["pouring_speed"] = np.clip(new_sample["pouring_speed"], 0.5, 2.0)

    return new_sample

# -----------------------
# Optimization (HYBRID SEARCH)
# -----------------------
def optimize(n_trials=200, local_steps=50):

    best_sample = random_sample()
    best_score = float("inf")
    best_probs = None

    # -------- Global search --------
    for _ in range(n_trials):
        sample = random_sample()
        X = encode_input(sample)

        probs = model.predict_proba(X)
        defect_probs = [p[0][1] for p in probs]

        score = defect_score(defect_probs, sample)

        if score < best_score:
            best_sample = sample
            best_score = score
            best_probs = defect_probs

    # -------- Local refinement --------
    current = best_sample

    for _ in range(local_steps):
        new_sample = mutate(current)
        X = encode_input(new_sample)

        probs = model.predict_proba(X)
        defect_probs = [p[0][1] for p in probs]

        score = defect_score(defect_probs, new_sample)

        if score < best_score:
            best_sample = new_sample
            best_score = score
            best_probs = defect_probs
            current = new_sample

    return best_sample, best_probs, best_score

# -----------------------
# Run
# -----------------------
if __name__ == "__main__":
    best_sample, probs, score = optimize()

    print("\n=== OPTIMIZED PARAMETERS ===")
    for k, v in best_sample.items():
        print(f"{k}: {v:.2f}" if isinstance(v, float) else f"{k}: {v}")

    print("\n=== DEFECT PROBABILITIES ===")
    print(f"Porosity   : {probs[0]:.3f}")
    print(f"Shrinkage  : {probs[1]:.3f}")
    print(f"Cold Shut  : {probs[2]:.3f}")

    print(f"\nFinal Score: {score:.3f}")