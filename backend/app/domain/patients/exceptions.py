from __future__ import annotations

from uuid import UUID


class PatientNotFoundError(Exception):
    def __init__(self, patient_id: UUID) -> None:
        self.patient_id = patient_id
        super().__init__(f'Paciente {patient_id} no encontrado')


class DuplicatePatientDniError(Exception):
    def __init__(self, dni: str) -> None:
        self.dni = dni
        super().__init__(f'Ya existe un paciente registrado con el DNI {dni}')
