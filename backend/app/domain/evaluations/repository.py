from __future__ import annotations

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.evaluations.entities import Evaluation


class EvaluationRepository(ABC):
    @abstractmethod
    def create(self, evaluation: Evaluation) -> Evaluation:
        raise NotImplementedError

    @abstractmethod
    def get_by_id(self, evaluation_id: UUID) -> Evaluation | None:
        raise NotImplementedError

    @abstractmethod
    def list_by_patient(self, patient_id: UUID) -> list[Evaluation]:
        raise NotImplementedError

    @abstractmethod
    def list_all(self, limit: int, offset: int) -> list[Evaluation]:
        raise NotImplementedError
