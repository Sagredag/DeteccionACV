from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.domain.evaluations.entities import EvaluationGender, EverMarried, ResidenceType, SmokingStatus, WorkType


class EvaluationBase(BaseModel):
    gender: EvaluationGender
    age: float = Field(ge=0, le=120)
    hypertension: bool
    heart_disease: bool
    ever_married: EverMarried
    work_type: WorkType
    residence_type: ResidenceType
    avg_glucose_level: float = Field(gt=0)
    # weight/height no se envían directamente al modelo predictivo: solo se usan
    # para calcular bmi, que sí es una entrada real del modelo (ver Fase 3, informe
    # de descubrimiento del modelo).
    weight: float = Field(gt=0)
    height: float = Field(gt=0)
    smoking_status: SmokingStatus


class EvaluationCreate(EvaluationBase):
    """Payload de entrada real (Fase 5).

    A propósito NO incluye bmi ni prediction_class/prediction_probability/model_name:
    - bmi lo calcula el backend a partir de weight/height (fuente única de verdad,
      ver app/domain/evaluations/bmi.py) — un bmi enviado por el cliente se ignoraría.
    - la predicción la calcula el modelo real (.pkl) a través de PredictionService;
      el cliente nunca puede fijar el resultado de la predicción.
    """


class EvaluationResponse(EvaluationBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    patient_id: UUID
    bmi: float
    prediction_class: int
    prediction_probability: float | None
    model_name: str
    created_at: datetime
