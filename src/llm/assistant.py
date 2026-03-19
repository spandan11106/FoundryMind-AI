import os
from groq import Groq

# Initialize Groq client with API key from environment
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError(
        "❌ GROQ_API_KEY not set. Please set it:\n"
        "   export GROQ_API_KEY='your-api-key'\n"
        "Get your key at: https://console.groq.com"
    )

client = Groq(api_key=api_key)

def explain_casting(sample, defects):

    porosity, shrinkage, cold_shut = defects

    prompt = f"""
You are a manufacturing expert specializing in metal casting.

Process parameters:
{sample}

Predicted defects:
- Porosity: {porosity}
- Shrinkage: {shrinkage}
- Cold Shut: {cold_shut}

Explain:
1. Why these defects occur
2. The physical/metallurgical reasons
3. How to reduce them

Keep it clear and engineering-focused.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=1024
    )

    return response.choices[0].message.content