from __future__ import annotations

from uuid import UUID

from app.application.dto.patient_dto import PatientCreateDTO, PatientUpdateDTO
from app.domain.patients.entities import Patient
from app.domain.patients.exceptions import DuplicatePatientDniError, PatientNotFoundError
from app.domain.patients.repository import PatientRepository


class PatientService:
    def __init__(self, repository: PatientRepository) -> None:
        self._repository = repository

    def list_patients(self, search: str | None = None) -> list[Patient]:
        return self._repository.list(search=search)

    def get_patient(self, patient_id: UUID) -> Patient:
        patient = self._repository.get_by_id(patient_id)
        if patient is None:
            raise PatientNotFoundError(patient_id)
        return patient

    def create_patient(self, data: PatientCreateDTO) -> Patient:
        if self._repository.get_by_dni(data.dni) is not None:
            raise DuplicatePatientDniError(data.dni)

        patient = Patient(
            id=None,
            nombres=data.nombres,
            apellidos=data.apellidos,
            dni=data.dni,
            sexo=data.sexo,
            fecha_nacimiento=data.fecha_nacimiento,
            telefono=data.telefono,
            correo=data.correo,
            direccion=data.direccion,
        )
        return self._repository.create(patient)

    def update_patient(self, patient_id: UUID, data: PatientUpdateDTO) -> Patient:
        existing = self._repository.get_by_id(patient_id)
        if existing is None:
            raise PatientNotFoundError(patient_id)

        if data.dni != existing.dni:
            other = self._repository.get_by_dni(data.dni)
            if other is not None and other.id != patient_id:
                raise DuplicatePatientDniError(data.dni)

        patient = Patient(
            id=patient_id,
            nombres=data.nombres,
            apellidos=data.apellidos,
            dni=data.dni,
            sexo=data.sexo,
            fecha_nacimiento=data.fecha_nacimiento,
            telefono=data.telefono,
            correo=data.correo,
            direccion=data.direccion,
        )
        updated = self._repository.update(patient_id, patient)
        if updated is None:
            raise PatientNotFoundError(patient_id)
        return updated

    def delete_patient(self, patient_id: UUID) -> None:
        deleted = self._repository.delete(patient_id)
        if not deleted:
            raise PatientNotFoundError(patient_id)
