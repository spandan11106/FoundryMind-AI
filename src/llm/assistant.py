def explain_casting(sample, defects):

    porosity, shrinkage, cold_shut = defects

    explanation = []

    if porosity > 0.3:
        explanation.append("High porosity due to turbulence or high pouring speed.")

    if shrinkage > 0.3:
        explanation.append("Shrinkage caused by slow cooling and improper solidification.")

    if cold_shut > 0.3:
        explanation.append("Cold shut due to low fluidity or thin sections.")

    if not explanation:
        explanation.append("Casting conditions are near optimal with minimal defects.")

    return "\n".join(explanation)