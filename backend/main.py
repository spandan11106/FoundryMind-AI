import os
import sys
from pathlib import Path
from typing import Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure project root is importable when running as backend service.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))

load_dotenv(PROJECT_ROOT / ".env")

from src.casting.optimizer import optimize  # noqa: E402
from src.factory.predict import predict_factory  # noqa: E402
from src.llm.assistant import explain_casting  # noqa: E402


class FactoryInput(BaseModel):
    features: Dict[str, float]


class FactoryPredictionResponse(BaseModel):
    prediction: int
    probability: float


class OptimizeResponse(BaseModel):
    best_sample: Dict[str, float | str]
    defect_probabilities: List[float]
    quality_score: float


class CastingInput(BaseModel):
    metal_type: str
    pouring_temperature: float
    mold_material: str
    cooling_rate: str
    section_thickness: float
    pouring_speed: float


class ExplainRequest(BaseModel):
    query: str = Field(min_length=3, max_length=2000)
    defects: Optional[List[float]] = None


class ExplainResponse(BaseModel):
    answer: str


app = FastAPI(title="FoundryMind API", version="1.0.0")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
origins = [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/api/casting/optimize", response_model=OptimizeResponse)
def casting_optimize(payload: Optional[CastingInput] = None) -> OptimizeResponse:
    try:
        initial_sample = payload.model_dump() if payload else None
        best_sample, probs, score = optimize(initial_sample=initial_sample)
        quality_score = max(0.0, 1.0 - min(1.0, score))

        return OptimizeResponse(
            best_sample=best_sample,
            defect_probabilities=[float(p) for p in probs],
            quality_score=float(quality_score),
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail="casting_model.pkl not found. Train the casting model first.") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/factory/predict", response_model=FactoryPredictionResponse)
def factory_predict(payload: FactoryInput) -> FactoryPredictionResponse:
    try:
        prediction, probability = predict_factory(payload.features)
        return FactoryPredictionResponse(prediction=int(prediction), probability=float(probability))
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail="factory_model.pkl not found. Train the factory model first.") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/assistant/explain", response_model=ExplainResponse)
def assistant_explain(payload: ExplainRequest) -> ExplainResponse:
    defects = payload.defects if payload.defects and len(payload.defects) == 3 else [0.2, 0.3, 0.5]

    try:
        answer = explain_casting({"query": payload.query}, defects)
        return ExplainResponse(answer=answer)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
