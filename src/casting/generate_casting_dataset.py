"""
Generate a realistic synthetic dataset for metal casting processes.

Implements physical rules for defect formation:
- High pouring temperature reduces cold shut but increases porosity
- Slow cooling increases shrinkage
- Thin sections increase cold shut risk
- High pouring speed causes turbulence and increases porosity
"""

import numpy as np
import pandas as pd
from pathlib import Path

# Set seed for reproducibility
np.random.seed(42)

# Parameters
n_samples = 5000
output_file = Path(__file__).parent.parent.parent / "data" / "raw" / "synthetic_data.csv"

# Define domains
METAL_TYPES = ["Aluminum", "Steel", "Cast Iron"]
MOLD_MATERIALS = ["sand", "die", "ceramic"]
COOLING_RATES = ["low", "medium", "high"]

# Temperature ranges by metal type (in °C)
TEMP_RANGES = {
    "Aluminum": (650, 750),
    "Steel": (1450, 1600),
    "Cast Iron": (1150, 1350),
}

# Generate base inputs
metal_types = np.random.choice(METAL_TYPES, n_samples)
mold_materials = np.random.choice(MOLD_MATERIALS, n_samples)
cooling_rate_str = np.random.choice(COOLING_RATES, n_samples)
cooling_rate_map = {"low": 1, "medium": 2, "high": 3}
cooling_rates = np.array([cooling_rate_map[cr] for cr in cooling_rate_str])

section_thickness = np.random.uniform(5, 50, n_samples)  # mm
pouring_speed = np.random.uniform(0.5, 3.0, n_samples)  # m/s

# Generate pouring temperatures based on metal type
pouring_temperatures = np.zeros(n_samples)
for i, metal in enumerate(metal_types):
    temp_min, temp_max = TEMP_RANGES[metal]
    pouring_temperatures[i] = np.random.uniform(temp_min, temp_max)

# Normalize inputs for probability calculations
temp_normalized = (pouring_temperatures - pouring_temperatures.min()) / (
    pouring_temperatures.max() - pouring_temperatures.min()
)
thickness_normalized = (section_thickness - section_thickness.min()) / (
    section_thickness.max() - section_thickness.min()
)
speed_normalized = (pouring_speed - pouring_speed.min()) / (
    pouring_speed.max() - pouring_speed.min()
)
cooling_normalized = (cooling_rates - 1) / 2  # Map [1,2,3] to [0,0.5,1]

# Calculate defect probabilities based on explicit physical rules
# Add noise to simulate real-world variability
noise = np.random.normal(0, 0.08, n_samples)

# COLD SHUT RULE: 
# - High pouring temp → REDUCES cold shut (molten material flows better)
# - Thin sections → INCREASES cold shut (metal cools too fast)
# - Die molds → reduce cold shut (better heat transfer)
cold_shut_base = (
    0.5 * (1 - temp_normalized)  # High temp reduces cold shut significantly
    + 0.5 * thickness_normalized  # Thin sections increase cold shut significantly
    - 0.15 * (mold_materials == "die").astype(float)  # Die molds help reduce it
)
cold_shut_prob = np.clip(cold_shut_base + noise, 0, 1)
cold_shut = (cold_shut_prob > 0.4).astype(int)

# POROSITY RULE:
# - High pouring temp → INCREASES porosity (more gas entrapment)
# - High pouring speed → INCREASES porosity (creates turbulence and air bubbles)
# - Slow cooling rate → helps reduce porosity (gas can escape)
porosity_base = (
    0.5 * temp_normalized  # High temp increases porosity significantly
    + 0.5 * speed_normalized  # High speed increases porosity significantly
    - 0.3 * cooling_normalized  # Fast cooling reduces porosity
)
porosity_prob = np.clip(porosity_base + noise, 0, 1)
porosity = (porosity_prob > 0.35).astype(int)

# SHRINKAGE RULE:
# - Slow cooling rate → INCREASES shrinkage (metal contracts more)
# - High pouring temp → INCREASES shrinkage (more temperature differential)
# - Thick sections → INCREASES shrinkage (slower internal cooling)
shrinkage_base = (
    0.5 * (1 - cooling_normalized)  # Slow cooling increases shrinkage significantly
    + 0.35 * temp_normalized  # High temp increases shrinkage
    + 0.3 * thickness_normalized  # Thick sections increase shrinkage
)
shrinkage_prob = np.clip(shrinkage_base + noise, 0, 1)
shrinkage = (shrinkage_prob > 0.45).astype(int)

# Create DataFrame
df = pd.DataFrame(
    {
        "metal_type": metal_types,
        "pouring_temperature": np.round(pouring_temperatures, 2),
        "mold_material": mold_materials,
        "cooling_rate": cooling_rate_str,
        "section_thickness": np.round(section_thickness, 2),
        "pouring_speed": np.round(pouring_speed, 2),
        "porosity": porosity,
        "shrinkage": shrinkage,
        "cold_shut": cold_shut,
    }
)

# Save to CSV
output_file.parent.mkdir(parents=True, exist_ok=True)
df.to_csv(output_file, index=False)

print(f"Dataset generated successfully!")
print(f"Location: {output_file}")
print(f"Shape: {df.shape}")
print(f"\nFirst few rows:")
print(df.head(10))
print(f"\nDefect statistics:")
print(f"Porosity cases: {df['porosity'].sum()} ({100*df['porosity'].mean():.1f}%)")
print(f"Shrinkage cases: {df['shrinkage'].sum()} ({100*df['shrinkage'].mean():.1f}%)")
print(f"Cold shut cases: {df['cold_shut'].sum()} ({100*df['cold_shut'].mean():.1f}%)")
print(f"\nData types:\n{df.dtypes}")
