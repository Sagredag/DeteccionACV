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
    bmi: float = Field(gt=0)
    smoking_status: SmokingStatus


class EvaluationCreate(EvaluationBase):
    """Payload de entrada. En esta fase no existe todavía un servicio de predicción
    conectado (Fase 4), así que estos campos de resultado deben venir ya calculados
    por quien construya la evaluación (por ahora, nadie —no hay endpoint expuesto)."""

    prediction_class: int = Field(ge=0, le=1)
    prediction_probability: float | None = Field(default=None, ge=0, le=1)
    model_name: str


class EvaluationResponse(EvaluationBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    patient_id: UUID
    prediction_class: int
    prediction_probability: float | None
    model_name: str
    created_at: datetime
