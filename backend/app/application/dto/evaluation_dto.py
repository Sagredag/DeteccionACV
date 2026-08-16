from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from app.domain.evaluations.entities import EvaluationGender, EverMarried, ResidenceType, SmokingStatus, WorkType


@dataclass(frozen=True, slots=True)
class EvaluationCreateDTO:
    """Datos crudos capturados por el formulario de evaluación.

    No incluye bmi (el servicio lo calcula de forma determinista a partir de
    weight/height — ver app/domain/evaluations/bmi.py) ni prediction_class/
    prediction_probability/model_name (el servicio los obtiene invocando al
    PredictionService real; nunca deben venir precalculados desde el llamador).
    """

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
    smoking_status: SmokingStatus
