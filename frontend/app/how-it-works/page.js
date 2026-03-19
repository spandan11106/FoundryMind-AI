"use client";

import Link from "next/link";

const STEPS = [
  {
    number: "01",
    title: "Data Collection",
    description:
      "Factory sensor data and casting parameters are collected from the production floor. This includes thermal readings, flow rates, material properties, and operational metrics across the manufacturing pipeline.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2.5" />
        <line x1="4" y1="16" x2="44" y2="16" stroke="currentColor" strokeWidth="2" />
        <line x1="4" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5" />
        <line x1="4" y1="32" x2="44" y2="32" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <circle cx="18" cy="12" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="24" cy="12" r="2" fill="currentColor" opacity="0.3" />
        <rect x="10" y="20" width="12" height="2" rx="1" fill="currentColor" opacity="0.6" />
        <rect x="10" y="28" width="18" height="2" rx="1" fill="currentColor" opacity="0.4" />
        <rect x="10" y="36" width="8" height="2" rx="1" fill="currentColor" opacity="0.3" />
        <rect x="28" y="20" width="8" height="2" rx="1" fill="currentColor" opacity="0.6" />
        <rect x="28" y="28" width="10" height="2" rx="1" fill="currentColor" opacity="0.4" />
      </svg>
    ),
    details: [
      "Metal type, mold material, and cooling rate parameters",
      "Temperature, thickness, and speed measurements",
      "16 factory operational metrics for health analysis",
    ],
  },
  {
    number: "02",
    title: "ML Model Processing",
    description:
      "Trained machine learning models process the input data through two specialized pipelines — a casting quality optimizer that uses Bayesian sampling to find optimal parameters, and a factory health classifier that predicts operational status.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="36" cy="12" r="4" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="12" cy="36" r="4" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="36" cy="36" r="4" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.1" />
        <line x1="16" y1="12" x2="18" y2="20" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="32" y1="12" x2="30" y2="20" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="16" y1="36" x2="18" y2="28" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="32" y1="36" x2="30" y2="28" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
        <path d="M21 24h6M24 21v6" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    details: [
      "Bayesian optimization for casting parameter tuning",
      "Classification model for factory health prediction",
      "Defect probability estimation (porosity, shrinkage, cold shut)",
    ],
  },
  {
    number: "03",
    title: "API & Backend",
    description:
      "A FastAPI backend serves predictions through RESTful endpoints. The frontend sends parameter configurations, receives optimized results, defect probabilities, and factory health predictions in real-time.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="6" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="2.5" />
        <rect x="28" y="6" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="2.5" />
        <rect x="16" y="30" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="2.5" />
        <path d="M12 18v6c0 2 2 4 4 4h4" stroke="currentColor" strokeWidth="2" strokeOpacity="0.6" />
        <path d="M36 18v6c0 2-2 4-4 4h-4" stroke="currentColor" strokeWidth="2" strokeOpacity="0.6" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <circle cx="36" cy="12" r="1.5" fill="currentColor" />
        <circle cx="24" cy="36" r="1.5" fill="currentColor" />
        <path d="M20 24l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    details: [
      "POST /api/casting/optimize — casting parameter optimization",
      "POST /api/factory/predict — factory health classification",
      "POST /api/assistant/explain — AI-powered explanations",
    ],
  },
  {
    number: "04",
    title: "Results & Insights",
    description:
      "Results are displayed as interactive cards with quality scores, optimal parameter values, risk badges, and performance indicators. The AI copilot provides contextual explanations of the results and suggests next actions.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="4" width="40" height="40" rx="6" stroke="currentColor" strokeWidth="2.5" />
        <rect x="10" y="28" width="6" height="10" rx="1" fill="currentColor" fillOpacity="0.3" />
        <rect x="21" y="20" width="6" height="18" rx="1" fill="currentColor" fillOpacity="0.5" />
        <rect x="32" y="14" width="6" height="24" rx="1" fill="currentColor" fillOpacity="0.7" />
        <path d="M10 14l8-4 8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="14" r="2" fill="currentColor" />
        <circle cx="18" cy="10" r="2" fill="currentColor" />
        <circle cx="26" cy="16" r="2" fill="currentColor" />
        <circle cx="34" cy="10" r="2" fill="currentColor" />
      </svg>
    ),
    details: [
      "Quality score with visual progress indicators",
      "Defect risk assessment with Low / Medium / High badges",
      "AI assistant for interpreting results and trade-offs",
    ],
  },
];

const ARCH_LAYERS = [
  {
    label: "Frontend",
    tech: "Next.js · React 19",
    color: "var(--accent-2)",
    items: ["Parameter Input Forms", "Results Dashboard", "AI Copilot Drawer"],
  },
  {
    label: "API Layer",
    tech: "FastAPI · REST",
    color: "var(--accent)",
    items: ["/casting/optimize", "/factory/predict", "/assistant/explain"],
  },
  {
    label: "ML Models",
    tech: "scikit-learn · Bayesian",
    color: "#c4b5fd",
    items: ["Casting Optimizer", "Factory Classifier", "Defect Predictor"],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="hiwPage">
      <header className="hiwHeader">
        <Link href="/" className="backLink">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Back to Dashboard
        </Link>
        <h1>How FoundryMind Works</h1>
        <p className="subtitle">
          From raw manufacturing data to actionable optimization insights — here is the end-to-end flow.
        </p>
      </header>

      {/* Pipeline Steps */}
      <section className="hiwSection">
        <h2 className="sectionTitle">Pipeline Overview</h2>
        <div className="stepsTimeline">
          {STEPS.map((step, i) => (
            <div key={step.number} className="timelineStep">
              <div className="timelineMarker">
                <span className="stepNumber">{step.number}</span>
                {i < STEPS.length - 1 && <div className="timelineLine" />}
              </div>
              <div className="stepCard">
                <div className="stepIcon">{step.icon}</div>
                <div className="stepContent">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <ul className="stepDetails">
                    {step.details.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Diagram */}
      <section className="hiwSection">
        <h2 className="sectionTitle">Architecture</h2>
        <div className="archDiagram">
          {ARCH_LAYERS.map((layer, i) => (
            <div key={layer.label} className="archLayer">
              <div className="archLabel" style={{ borderColor: layer.color }}>
                <strong style={{ color: layer.color }}>{layer.label}</strong>
                <span className="archTech">{layer.tech}</span>
              </div>
              <div className="archItems">
                {layer.items.map((item) => (
                  <div key={item} className="archItem" style={{ borderColor: `${layer.color}44` }}>
                    {item}
                  </div>
                ))}
              </div>
              {i < ARCH_LAYERS.length - 1 && (
                <div className="archArrow">
                  <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
                    <path d="M12 0v24M6 20l6 8 6-8" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="hiwSection">
        <h2 className="sectionTitle">Features at a Glance</h2>
        <div className="featureGrid">
          <div className="featureCard">
            <div className="featureIcon green">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <h3>Casting Optimization</h3>
            <p>Bayesian parameter search across temperature, speed, and material combinations to maximize quality scores.</p>
          </div>
          <div className="featureCard">
            <div className="featureIcon blue">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H5v-2h7v2zm5-4H5v-2h12v2zm0-4H5V7h12v2z" />
              </svg>
            </div>
            <h3>Factory Health</h3>
            <p>Predict operational status from 16 metrics spanning production, quality, maintenance, and energy efficiency.</p>
          </div>
          <div className="featureCard">
            <div className="featureIcon purple">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
              </svg>
            </div>
            <h3>AI Copilot</h3>
            <p>Ask questions about model outputs, casting trade-offs, and defect mitigation strategies in natural language.</p>
          </div>
        </div>
      </section>

      <footer className="hiwFooter">
        <Link href="/" className="button">
          Go to Dashboard
        </Link>
      </footer>
    </div>
  );
}
