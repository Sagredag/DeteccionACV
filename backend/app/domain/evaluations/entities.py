from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from uuid import UUID

from app.domain.patients.entities import PatientSex

# Reutiliza el mismo vocabulario que Patient.sexo: el formulario de evaluación
# actual (frontend/src/features/evaluation/page.tsx) ya usa exactamente estos
# valores para 'gender', y el modelo predictivo (api.py de Mike) espera un
# concepto equivalente (Male/Female/Other) que se traducirá en la capa de
# adaptación de la Fase 4 — no aquí.
EvaluationGender = PatientSex


class EverMarried(str, Enum):
    YES = 'yes'
    NO = 'no'


class WorkType(str, Enum):
    PRIVATE = 'private'
    GOVT_JOB = 'govt_job'
    SELF_EMPLOYED = 'self_employed'
    CHILDREN = 'children'
    NEVER_WORKED = 'never_worked'


class ResidenceType(str, Enum):
    URBAN = 'urban'
    RURAL = 'rural'


class SmokingStatus(str, Enum):
    FORMERLY_SMOKED = 'formerly_smoked'
    NEVER_SMOKED = 'never_smoked'
    SMOKES = 'smokes'
    UNKNOWN = 'unknown'


@dataclass(slots=True)
class Evaluation:
    id: UUID | None
    patient_id: UUID
    gender: EvaluationGender
    age: float
    hypertension: bool
    heart_disease: bool
    ever_married: EverMarried
    work_type: WorkType
    residence_type: ResidenceType
    avg_glucose_level: float
    # weight/height NO se envían directamente al modelo: solo se usan para calcular
    # bmi (que sí es una entrada del modelo). Se almacenan aquí por trazabilidad
    # clínica de la evaluación, según decisión explícita del usuario.
    weight: float
    height: float
    bmi: float
    smoking_status: SmokingStatus
    prediction_class: int
    prediction_probability: float | None
    model_name: str
    created_at: datetime | None = None
