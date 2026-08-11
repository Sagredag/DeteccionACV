from __future__ import annotations

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.patients.entities import Patient


class PatientRepository(ABC):
    @abstractmethod
    def list(self, search: str | None = None) -> list[Patient]:
        raise NotImplementedError

    @abstractmethod
    def get_by_id(self, patient_id: UUID) -> Patient | None:
        raise NotImplementedError

    @abstractmethod
    def get_by_dni(self, dni: str) -> Patient | None:
        raise NotImplementedError

    @abstractmethod
    def create(self, patient: Patient) -> Patient:
        raise NotImplementedError

    @abstractmethod
    def update(self, patient_id: UUID, patient: Patient) -> Patient | None:
        raise NotImplementedError

    @abstractmethod
    def delete(self, patient_id: UUID) -> bool:
        raise NotImplementedError
