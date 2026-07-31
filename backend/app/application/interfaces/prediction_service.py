from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class PredictionInput:
    gender: str
    age: float
    hypertension: bool
    heart_disease: bool
    ever_married: str
    work_type: str
    residence_type: str
    avg_glucose_level: float
    bmi: float
    smoking_status: str


@dataclass(frozen=True, slots=True)
class PredictionResult:
    risk_score: float
    risk_label: str
    model_version: str


class PredictionService(ABC):
    @abstractmethod
    def predict(self, payload: PredictionInput) -> PredictionResult:
        raise NotImplementedError