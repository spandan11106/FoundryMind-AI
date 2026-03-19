"use client";

import { useMemo, useState } from "react";
import { explainAssistant, optimizeCasting, predictFactory } from "../lib/api";

const TABS = [
  { id: "casting", label: "Casting Optimizer" },
  { id: "factory", label: "Factory Analysis" },
  { id: "assistant", label: "AI Assistant" },
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
  if (value >= 0.7) {
    return <span className="badge good">Low Risk</span>;
  }
  if (value >= 0.4) {
    return <span className="badge medium">Medium Risk</span>;
  }
  return <span className="badge bad">High Risk</span>;
}

function LoadingButton({ loading, children, ...props }) {
  return (
    <button className="button" disabled={loading} {...props}>
      {loading ? "Working..." : children}
    </button>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("casting");

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
    if (!castingResult) {
      return [];
    }

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
    setCastingInput((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateFactoryField(field, value) {
    setFactoryInput((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
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
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">FoundryMind AI</p>
          <h1>Metal Casting Intelligence Platform</h1>
          <p className="subtitle">
            Production-grade frontend for Vercel with API-driven optimization, prediction, and assistant workflows.
          </p>
        </div>
        <div className="statusCard">
          <p className="label">System Status</p>
          <p className="status">Ready</p>
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
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "casting" && (
        <section className="panel">
          <div className="panelHead">
            <h2>Casting Process Optimizer</h2>
            <LoadingButton loading={castingLoading} onClick={handleOptimize}>
              Run Optimization
            </LoadingButton>
          </div>

          <div className="grid three">
            <label className="inputGroup">
              <span>metal type</span>
              <select
                value={castingInput.metal_type}
                onChange={(event) => updateCastingField("metal_type", event.target.value)}
              >
                <option value="Aluminum">Aluminum</option>
                <option value="Steel">Steel</option>
                <option value="Cast Iron">Cast Iron</option>
              </select>
            </label>

            <label className="inputGroup">
              <span>mold material</span>
              <select
                value={castingInput.mold_material}
                onChange={(event) => updateCastingField("mold_material", event.target.value)}
              >
                <option value="sand">sand</option>
                <option value="die">die</option>
                <option value="ceramic">ceramic</option>
              </select>
            </label>

            <label className="inputGroup">
              <span>cooling rate</span>
              <select
                value={castingInput.cooling_rate}
                onChange={(event) => updateCastingField("cooling_rate", event.target.value)}
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </label>

            <label className="inputGroup">
              <span>pouring temperature</span>
              <input
                type="number"
                min="600"
                max="800"
                step="0.1"
                value={castingInput.pouring_temperature}
                onChange={(event) => updateCastingField("pouring_temperature", Number(event.target.value))}
              />
            </label>

            <label className="inputGroup">
              <span>section thickness</span>
              <input
                type="number"
                min="5"
                max="50"
                step="0.1"
                value={castingInput.section_thickness}
                onChange={(event) => updateCastingField("section_thickness", Number(event.target.value))}
              />
            </label>

            <label className="inputGroup">
              <span>pouring speed</span>
              <input
                type="number"
                min="0.5"
                max="2"
                step="0.01"
                value={castingInput.pouring_speed}
                onChange={(event) => updateCastingField("pouring_speed", Number(event.target.value))}
              />
            </label>
          </div>

          {castingError && <p className="error">{castingError}</p>}

          {castingResult && (
            <>
              <div className="grid three">
                <article className="card">
                  <p className="label">Quality Score</p>
                  <p className="metric">{(castingResult.quality_score * 100).toFixed(1)}%</p>
                </article>
                <article className="card">
                  <p className="label">Best Temperature</p>
                  <p className="metric">{Number(castingResult.best_sample.pouring_temperature).toFixed(1)} C</p>
                </article>
                <article className="card">
                  <p className="label">Best Speed</p>
                  <p className="metric">{Number(castingResult.best_sample.pouring_speed).toFixed(2)} m/s</p>
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
            </>
          )}
        </section>
      )}

      {activeTab === "factory" && (
        <section className="panel">
          <div className="panelHead">
            <h2>Factory Performance Predictor</h2>
          </div>

          <form onSubmit={handleFactoryPredict} className="factoryForm">
            <div className="grid three">
              {Object.entries(factoryInput).map(([key, value]) => (
                <label key={key} className="inputGroup">
                  <span>{key.replace(/([a-z])([A-Z])/g, "$1 $2")}</span>
                  <input
                    type="number"
                    value={value}
                    onChange={(event) => updateFactoryField(key, event.target.value)}
                    step="0.1"
                    required
                  />
                </label>
              ))}
            </div>
            <LoadingButton loading={factoryLoading} type="submit">
              Predict Factory Performance
            </LoadingButton>
          </form>

          {factoryError && <p className="error">{factoryError}</p>}

          {factoryResult && (
            <div className="grid two">
              <article className="card">
                <p className="label">Factory Status</p>
                <p className="metric">{factoryResult.prediction === 1 ? "Healthy" : "Needs Attention"}</p>
              </article>
              <article className="card">
                <p className="label">Performance Probability</p>
                <p className="metric">{(factoryResult.probability * 100).toFixed(1)}%</p>
              </article>
            </div>
          )}
        </section>
      )}

      {activeTab === "assistant" && (
        <section className="panel">
          <div className="panelHead">
            <h2>AI Manufacturing Assistant</h2>
          </div>

          <form onSubmit={handleAssistant} className="assistantForm">
            <label className="inputGroup">
              <span>Ask about casting, defects, or optimization</span>
              <textarea
                value={assistantQuery}
                onChange={(event) => setAssistantQuery(event.target.value)}
                placeholder="How does pouring temperature affect porosity?"
                rows={5}
              />
            </label>
            <LoadingButton loading={assistantLoading} type="submit">
              Get Explanation
            </LoadingButton>
          </form>

          {assistantError && <p className="error">{assistantError}</p>}
          {assistantAnswer && (
            <article className="card markdown">
              <h3>Assistant Response</h3>
              <p>{assistantAnswer}</p>
            </article>
          )}
        </section>
      )}
    </main>
  );
}
