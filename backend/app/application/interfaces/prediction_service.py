from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum

from app.domain.evaluations.entities import EverMarried, ResidenceType, SmokingStatus, WorkType


class PredictionGender(str, Enum):
    MALE = 'male'
    FEMALE = 'female'
    OTHER = 'other'


@dataclass(frozen=True, slots=True)
class PredictionInput:
    gender: PredictionGender
    age: float
    hypertension: bool
    heart_disease: bool
    ever_married: EverMarried
    work_type: WorkType
    residence_type: ResidenceType
    avg_glucose_level: float
    # weight/height NO forman parte de este contrato: el modelo solo recibe bmi.
    bmi: float
    smoking_status: SmokingStatus


@dataclass(frozen=True, slots=True)
class PredictionResult:
    prediction_class: int
    prediction_probability: float | None
    model_name: str


class PredictionService(ABC):
    @abstractmethod
    def predict(self, payload: PredictionInput) -> PredictionResult:
        raise NotImplementedError
