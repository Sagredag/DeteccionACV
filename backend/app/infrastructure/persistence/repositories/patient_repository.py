from __future__ import annotations

from uuid import UUID

from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.domain.patients.entities import Patient
from app.domain.patients.exceptions import DuplicatePatientDniError
from app.domain.patients.repository import PatientRepository
from app.infrastructure.persistence.models.patient_model import PatientModel


class SqlAlchemyPatientRepository(PatientRepository):
    def __init__(self, db: Session) -> None:
        self._db = db

    def list(self, search: str | None = None) -> list[Patient]:
        query = select(PatientModel)
        if search:
            pattern = f'%{search.strip()}%'
            query = query.where(
                or_(
                    PatientModel.nombres.ilike(pattern),
                    PatientModel.apellidos.ilike(pattern),
                    PatientModel.dni.ilike(pattern),
                )
            )
        query = query.order_by(PatientModel.apellidos, PatientModel.nombres)
        rows = self._db.execute(query).scalars().all()
        return [self._to_entity(row) for row in rows]

    def get_by_id(self, patient_id: UUID) -> Patient | None:
        model = self._db.get(PatientModel, patient_id)
        return self._to_entity(model) if model else None

    def get_by_dni(self, dni: str) -> Patient | None:
        model = self._db.execute(select(PatientModel).where(PatientModel.dni == dni)).scalar_one_or_none()
        return self._to_entity(model) if model else None

    def create(self, patient: Patient) -> Patient:
        model = PatientModel(
            nombres=patient.nombres,
            apellidos=patient.apellidos,
            dni=patient.dni,
            sexo=patient.sexo,
            fecha_nacimiento=patient.fecha_nacimiento,
            telefono=patient.telefono,
            correo=patient.correo,
            direccion=patient.direccion,
        )
        self._db.add(model)
        try:
            self._db.commit()
        except IntegrityError as exc:
            self._db.rollback()
            raise DuplicatePatientDniError(patient.dni) from exc
        self._db.refresh(model)
        return self._to_entity(model)

    def update(self, patient_id: UUID, patient: Patient) -> Patient | None:
        model = self._db.get(PatientModel, patient_id)
        if model is None:
            return None

        model.nombres = patient.nombres
        model.apellidos = patient.apellidos
        model.dni = patient.dni
        model.sexo = patient.sexo
        model.fecha_nacimiento = patient.fecha_nacimiento
        model.telefono = patient.telefono
        model.correo = patient.correo
        model.direccion = patient.direccion

        try:
            self._db.commit()
        except IntegrityError as exc:
            self._db.rollback()
            raise DuplicatePatientDniError(patient.dni) from exc
        self._db.refresh(model)
        return self._to_entity(model)

    def delete(self, patient_id: UUID) -> bool:
        model = self._db.get(PatientModel, patient_id)
        if model is None:
            return False
        self._db.delete(model)
        self._db.commit()
        return True

    @staticmethod
    def _to_entity(model: PatientModel) -> Patient:
        return Patient(
            id=model.id,
            nombres=model.nombres,
            apellidos=model.apellidos,
            dni=model.dni,
            sexo=model.sexo,
            fecha_nacimiento=model.fecha_nacimiento,
            telefono=model.telefono,
            correo=model.correo,
            direccion=model.direccion,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
