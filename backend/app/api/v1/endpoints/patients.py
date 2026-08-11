from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.api.v1.schemas.patient import PatientCreate, PatientResponse, PatientUpdate
from app.application.dto.patient_dto import PatientCreateDTO, PatientUpdateDTO
from app.application.services.patient_service import PatientService
from app.core.dependencies import get_patient_service

router = APIRouter(prefix='/patients', tags=['patients'])


@router.get('', response_model=list[PatientResponse])
def list_patients(
    search: str | None = Query(default=None, description='Busca por nombres, apellidos o DNI'),
    service: PatientService = Depends(get_patient_service),
) -> list[PatientResponse]:
    patients = service.list_patients(search=search)
    return [PatientResponse.model_validate(patient) for patient in patients]


@router.get('/{patient_id}', response_model=PatientResponse)
def get_patient(patient_id: UUID, service: PatientService = Depends(get_patient_service)) -> PatientResponse:
    patient = service.get_patient(patient_id)
    return PatientResponse.model_validate(patient)


@router.post('', response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(payload: PatientCreate, service: PatientService = Depends(get_patient_service)) -> PatientResponse:
    dto = PatientCreateDTO(**payload.model_dump())
    patient = service.create_patient(dto)
    return PatientResponse.model_validate(patient)


@router.put('/{patient_id}', response_model=PatientResponse)
def update_patient(
    patient_id: UUID,
    payload: PatientUpdate,
    service: PatientService = Depends(get_patient_service),
) -> PatientResponse:
    dto = PatientUpdateDTO(**payload.model_dump())
    patient = service.update_patient(patient_id, dto)
    return PatientResponse.model_validate(patient)


@router.delete('/{patient_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: UUID, service: PatientService = Depends(get_patient_service)) -> None:
    service.delete_patient(patient_id)
