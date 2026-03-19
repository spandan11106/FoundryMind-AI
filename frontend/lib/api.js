const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.detail) {
        detail = payload.detail;
      }
    } catch {
      // Keep fallback detail.
    }
    throw new Error(detail);
  }

  return response.json();
}

export function optimizeCasting(payload) {
  return request("/api/casting/optimize", {
    method: "POST",
    body: payload ? JSON.stringify(payload) : undefined,
  });
}

export function predictFactory(payload) {
  return request("/api/factory/predict", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function explainAssistant(query) {
  return request("/api/assistant/explain", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}
