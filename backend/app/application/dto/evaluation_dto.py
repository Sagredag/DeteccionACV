from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from app.domain.evaluations.entities import EvaluationGender, EverMarried, ResidenceType, SmokingStatus, WorkType


@dataclass(frozen=True, slots=True)
class EvaluationCreateDTO:
    patient_id: UUID
    gender: EvaluationGender
    age: float
    hypertension: bool
    heart_disease: bool
    ever_married: EverMarried
    work_type: WorkType
    residence_type: ResidenceType
    avg_glucose_level: float
    weight: float
    height: float
    bmi: float
    smoking_status: SmokingStatus
    # Resultado de la predicción: en esta fase no existe todavía un servicio de
    # predicción real conectado (eso es la Fase 4). El contrato ya exige estos
    # campos porque una Evaluation representa un evento histórico que siempre
    # incluye el resultado de una predicción ya calculada.
    prediction_class: int
    prediction_probability: float | None
    model_name: str
