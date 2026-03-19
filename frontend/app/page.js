"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { explainAssistant, optimizeCasting, predictFactory } from "../lib/api";

const TABS = [
  { id: "casting", label: "Casting Optimizer", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" },
  { id: "factory", label: "Factory Analysis", icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H5v-2h7v2zm5-4H5v-2h12v2zm0-4H5V7h12v2z" },
];

const DEFAULT_FACTORY_INPUT = {
  ProductionVolume: 1000,
  ProductionCost: 5000,
  SupplierQuality: 80,
  DeliveryDelay: 2,
  DefectRate: 5,
  QualityScore: 85,
  MaintenanceHours: 12,
  DowntimePercentage: 8,
  InventoryTurnover: 6,
  StockoutRate: 3,
  WorkerProductivity: 78,
  SafetyIncidents: 1,
  EnergyConsumption: 1200,
  EnergyEfficiency: 82,
  AdditiveProcessTime: 4,
  AdditiveMaterialCost: 250,
};

const DEFAULT_CASTING_INPUT = {
  metal_type: "Aluminum",
  pouring_temperature: 700,
  mold_material: "sand",
  cooling_rate: "medium",
  section_thickness: 20,
  pouring_speed: 1.0,
};

function Badge({ value }) {
  if (value >= 0.7) return <span className="badge good">Low Risk</span>;
  if (value >= 0.4) return <span className="badge medium">Medium</span>;
  return <span className="badge bad">High Risk</span>;
}

function LoadingButton({ loading, children, ...props }) {
  return (
    <button className="button" disabled={loading} {...props}>
      {loading ? (
        <span className="btnLoading">
          <span className="spinner" />
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

function TabIcon({ path }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d={path} />
    </svg>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("casting");
  const [assistantOpen, setAssistantOpen] = useState(false);

  const [castingLoading, setCastingLoading] = useState(false);
  const [castingError, setCastingError] = useState("");
  const [castingResult, setCastingResult] = useState(null);
  const [castingInput, setCastingInput] = useState(DEFAULT_CASTING_INPUT);

  const [factoryInput, setFactoryInput] = useState(DEFAULT_FACTORY_INPUT);
  const [factoryLoading, setFactoryLoading] = useState(false);
  const [factoryError, setFactoryError] = useState("");
  const [factoryResult, setFactoryResult] = useState(null);

  const [assistantQuery, setAssistantQuery] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState("");
  const [assistantAnswer, setAssistantAnswer] = useState("");

  const defectRows = useMemo(() => {
    if (!castingResult) return [];
    const [porosity, shrinkage, coldShut] = castingResult.defect_probabilities;
    return [
      { name: "Porosity", value: porosity },
      { name: "Shrinkage", value: shrinkage },
      { name: "Cold Shut", value: coldShut },
    ];
  }, [castingResult]);

  async function handleOptimize() {
    setCastingLoading(true);
    setCastingError("");
    try {
      const result = await optimizeCasting(castingInput);
      setCastingResult(result);
    } catch (error) {
      setCastingError(error.message || "Optimization failed");
    } finally {
      setCastingLoading(false);
    }
  }

  function updateCastingField(field, value) {
    setCastingInput((prev) => ({ ...prev, [field]: value }));
  }

  function updateFactoryField(field, value) {
    setFactoryInput((prev) => ({ ...prev, [field]: Number(value) }));
  }

  async function handleFactoryPredict(event) {
    event.preventDefault();
    setFactoryLoading(true);
    setFactoryError("");
    try {
      const result = await predictFactory({ features: factoryInput });
      setFactoryResult(result);
    } catch (error) {
      setFactoryError(error.message || "Prediction failed");
    } finally {
      setFactoryLoading(false);
    }
  }

  async function handleAssistant(event) {
    event.preventDefault();
    if (!assistantQuery.trim()) {
      setAssistantError("Please enter a question first.");
      return;
    }
    setAssistantLoading(true);
    setAssistantError("");
    try {
      const result = await explainAssistant(assistantQuery.trim());
      setAssistantAnswer(result.answer);
    } catch (error) {
      setAssistantError(error.message || "Assistant request failed");
    } finally {
      setAssistantLoading(false);
    }
  }

  return (
    <div className="shell">
      <aside className="rail" aria-label="Navigation">
        <div className="railBrand">
          <span className="dot" />
          <div>
            <strong className="brandName">FoundryMind</strong>
          </div>
        </div>

        <nav className="railGroup">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`railButton ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <TabIcon path={tab.icon} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="railGroup">
          <button
            className="railButton ghost"
            type="button"
            onClick={() => setAssistantOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
            </svg>
            <span>AI Copilot</span>
            <span className="pill success">Live</span>
          </button>
          <Link href="/how-it-works" className="railButton ghost">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
            </svg>
            <span>How It Works</span>
          </Link>
        </div>

        <div className="railStatus">
          <span className="statusDot online" />
          <span className="statusText">API Connected</span>
        </div>
      </aside>

      <main className="page">
        <section className="hero">
          <div className="heroContent">
            <h1>Casting Intelligence Platform</h1>
            <p className="subtitle">
              Optimize parameters, predict factory health, and make data-driven decisions.
            </p>
          </div>
          <div className="heroCards">
            <div className="statCard">
              <div className="statIcon green">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>
              <div>
                <p className="statLabel">System Status</p>
                <p className="statValue">Operational</p>
              </div>
            </div>
            <div className="statCard">
              <div className="statIcon blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                </svg>
              </div>
              <div>
                <p className="statLabel">AI Assistant</p>
                <p className="statValue">Ready</p>
              </div>
            </div>
          </div>
        </section>

        <nav className="tabs" aria-label="Main tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <TabIcon path={tab.icon} />
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === "casting" && (
          <section className="panel fadeIn">
            <div className="panelHead">
              <div>
                <h2>Casting Optimizer</h2>
                <p className="hint">Configure parameters and run optimization to minimize defect probability.</p>
              </div>
              <LoadingButton loading={castingLoading} onClick={handleOptimize}>
                Run Optimization
              </LoadingButton>
            </div>

            <div className="grid three">
              <label className="inputGroup">
                <span>Metal Type</span>
                <select
                  value={castingInput.metal_type}
                  onChange={(e) => updateCastingField("metal_type", e.target.value)}
                >
                  <option value="Aluminum">Aluminum</option>
                  <option value="Steel">Steel</option>
                  <option value="Cast Iron">Cast Iron</option>
                </select>
              </label>
              <label className="inputGroup">
                <span>Mold Material</span>
                <select
                  value={castingInput.mold_material}
                  onChange={(e) => updateCastingField("mold_material", e.target.value)}
                >
                  <option value="sand">Sand</option>
                  <option value="die">Die</option>
                  <option value="ceramic">Ceramic</option>
                </select>
              </label>
              <label className="inputGroup">
                <span>Cooling Rate</span>
                <select
                  value={castingInput.cooling_rate}
                  onChange={(e) => updateCastingField("cooling_rate", e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label className="inputGroup">
                <span>Pouring Temperature (°C)</span>
                <input
                  type="number"
                  min="600"
                  max="800"
                  step="0.1"
                  value={castingInput.pouring_temperature}
                  onChange={(e) => updateCastingField("pouring_temperature", Number(e.target.value))}
                />
              </label>
              <label className="inputGroup">
                <span>Section Thickness (mm)</span>
                <input
                  type="number"
                  min="5"
                  max="50"
                  step="0.1"
                  value={castingInput.section_thickness}
                  onChange={(e) => updateCastingField("section_thickness", Number(e.target.value))}
                />
              </label>
              <label className="inputGroup">
                <span>Pouring Speed (m/s)</span>
                <input
                  type="number"
                  min="0.5"
                  max="2"
                  step="0.01"
                  value={castingInput.pouring_speed}
                  onChange={(e) => updateCastingField("pouring_speed", Number(e.target.value))}
                />
              </label>
            </div>

            {castingError && <p className="error">{castingError}</p>}

            {castingResult && (
              <div className="resultsSection fadeIn">
                <h3 className="resultsTitle">Optimization Results</h3>
                <div className="grid three">
                  <article className="resultCard accent">
                    <p className="resultLabel">Quality Score</p>
                    <p className="resultMetric">{(castingResult.quality_score * 100).toFixed(1)}%</p>
                    <div className="resultBar">
                      <div
                        className="resultBarFill green"
                        style={{ width: `${castingResult.quality_score * 100}%` }}
                      />
                    </div>
                  </article>
                  <article className="resultCard">
                    <p className="resultLabel">Optimal Temperature</p>
                    <p className="resultMetric">
                      {Number(castingResult.best_sample.pouring_temperature).toFixed(1)}°C
                    </p>
                  </article>
                  <article className="resultCard">
                    <p className="resultLabel">Optimal Speed</p>
                    <p className="resultMetric">
                      {Number(castingResult.best_sample.pouring_speed).toFixed(2)} m/s
                    </p>
                  </article>
                </div>

                <div className="grid two">
                  <article className="card">
                    <h3>Optimized Parameters</h3>
                    <ul className="plainList">
                      {Object.entries(castingResult.best_sample).map(([key, value]) => (
                        <li key={key}>
                          <span>{key.replaceAll("_", " ")}</span>
                          <strong>{typeof value === "number" ? value.toFixed(3) : value}</strong>
                        </li>
                      ))}
                    </ul>
                  </article>
                  <article className="card">
                    <h3>Defect Probabilities</h3>
                    <ul className="plainList">
                      {defectRows.map((row) => (
                        <li key={row.name}>
                          <span>{row.name}</span>
                          <span className="inlineGroup">
                            <strong>{(row.value * 100).toFixed(1)}%</strong>
                            <Badge value={1 - row.value} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "factory" && (
          <section className="panel fadeIn">
            <div className="panelHead">
              <div>
                <h2>Factory Performance Analysis</h2>
                <p className="hint">Input operational metrics to predict factory health status.</p>
              </div>
            </div>

            <form onSubmit={handleFactoryPredict} className="factoryForm">
              <div className="grid three">
                {Object.entries(factoryInput).map(([key, value]) => (
                  <label key={key} className="inputGroup">
                    <span>{key.replace(/([a-z])([A-Z])/g, "$1 $2")}</span>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => updateFactoryField(key, e.target.value)}
                      step="0.1"
                      required
                    />
                  </label>
                ))}
              </div>
              <LoadingButton loading={factoryLoading} type="submit">
                Predict Performance
              </LoadingButton>
            </form>

            {factoryError && <p className="error">{factoryError}</p>}

            {factoryResult && (
              <div className="resultsSection fadeIn">
                <div className="grid two">
                  <article className="resultCard accent">
                    <p className="resultLabel">Factory Status</p>
                    <p className={`resultMetric ${factoryResult.prediction === 1 ? "textGreen" : "textDanger"}`}>
                      {factoryResult.prediction === 1 ? "Healthy" : "Needs Attention"}
                    </p>
                    <div className="statusIndicator">
                      <span className={`statusDot ${factoryResult.prediction === 1 ? "online" : "warning"}`} />
                      <span>{factoryResult.prediction === 1 ? "All systems nominal" : "Review recommended"}</span>
                    </div>
                  </article>
                  <article className="resultCard">
                    <p className="resultLabel">Performance Probability</p>
                    <p className="resultMetric">{(factoryResult.probability * 100).toFixed(1)}%</p>
                    <div className="resultBar">
                      <div
                        className={`resultBarFill ${factoryResult.probability > 0.7 ? "green" : factoryResult.probability > 0.4 ? "yellow" : "red"}`}
                        style={{ width: `${factoryResult.probability * 100}%` }}
                      />
                    </div>
                  </article>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {assistantOpen && <div className="drawerOverlay" onClick={() => setAssistantOpen(false)} />}

      <div className={`assistantDrawer ${assistantOpen ? "open" : ""}`} role="dialog" aria-label="AI assistant">
        <div className="drawerHeader">
          <div>
            <h3>AI Assistant</h3>
            <p className="hint">Ask about casting, defects, or optimization</p>
          </div>
          <button className="closeButton" type="button" onClick={() => setAssistantOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleAssistant} className="assistantForm">
          <textarea
            value={assistantQuery}
            onChange={(e) => setAssistantQuery(e.target.value)}
            placeholder="How does pouring temperature affect porosity?"
            rows={4}
          />
          <LoadingButton loading={assistantLoading} type="submit">
            Ask
          </LoadingButton>
        </form>

        {assistantError && <p className="error">{assistantError}</p>}
        {assistantAnswer && (
          <article className="card assistantResponse fadeIn">
            <p>{assistantAnswer}</p>
          </article>
        )}
      </div>
    </div>
  );
}
