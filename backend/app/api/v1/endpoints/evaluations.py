from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.api.v1.schemas.evaluation import EvaluationCreate, EvaluationDetailResponse, EvaluationResponse
from app.api.v1.schemas.patient import PatientResponse
from app.application.dto.evaluation_dto import EvaluationCreateDTO
from app.application.services.evaluation_service import EvaluationService
from app.application.services.patient_service import PatientService
from app.core.dependencies import get_evaluation_service, get_patient_service
from app.domain.evaluations.entities import Evaluation
from app.domain.patients.entities import Patient

router = APIRouter(prefix='/patients/{patient_id}/evaluations', tags=['evaluations'])
# Fase 6: consulta general de evaluaciones, sin anidar bajo un paciente.
evaluations_router = APIRouter(prefix='/evaluations', tags=['evaluations'])


def _to_detail_response(evaluation: Evaluation, patient: Patient) -> EvaluationDetailResponse:
    return EvaluationDetailResponse(
        **EvaluationResponse.model_validate(evaluation).model_dump(),
        patient=PatientResponse.model_validate(patient),
    )


@router.post('', response_model=EvaluationResponse, status_code=status.HTTP_201_CREATED)
def create_evaluation(
    patient_id: UUID,
    payload: EvaluationCreate,
    service: EvaluationService = Depends(get_evaluation_service),
) -> EvaluationResponse:
    dto = EvaluationCreateDTO(patient_id=patient_id, **payload.model_dump())
    evaluation = service.create_evaluation(dto)
    return EvaluationResponse.model_validate(evaluation)


@router.get('', response_model=list[EvaluationDetailResponse])
def list_patient_evaluations(
    patient_id: UUID,
    service: EvaluationService = Depends(get_evaluation_service),
    patient_service: PatientService = Depends(get_patient_service),
) -> list[EvaluationDetailResponse]:
    evaluations = service.list_patient_evaluations(patient_id)
    patient = patient_service.get_patient(patient_id)
    return [_to_detail_response(evaluation, patient) for evaluation in evaluations]


@evaluations_router.get('', response_model=list[EvaluationDetailResponse])
def list_evaluations(
    limit: int = Query(default=20, ge=1, le=100, description='Cantidad máxima de evaluaciones a devolver'),
    offset: int = Query(default=0, ge=0, description='Cantidad de evaluaciones a saltar, para paginación'),
    service: EvaluationService = Depends(get_evaluation_service),
    patient_service: PatientService = Depends(get_patient_service),
) -> list[EvaluationDetailResponse]:
    evaluations = service.list_evaluations(limit=limit, offset=offset)
    patients_cache: dict[UUID, Patient] = {}
    responses: list[EvaluationDetailResponse] = []
    for evaluation in evaluations:
        patient = patients_cache.get(evaluation.patient_id)
        if patient is None:
            patient = patient_service.get_patient(evaluation.patient_id)
            patients_cache[evaluation.patient_id] = patient
        responses.append(_to_detail_response(evaluation, patient))
    return responses


@evaluations_router.get('/{evaluation_id}', response_model=EvaluationDetailResponse)
def get_evaluation(
    evaluation_id: UUID,
    service: EvaluationService = Depends(get_evaluation_service),
    patient_service: PatientService = Depends(get_patient_service),
) -> EvaluationDetailResponse:
    evaluation = service.get_evaluation(evaluation_id)
    patient = patient_service.get_patient(evaluation.patient_id)
    return _to_detail_response(evaluation, patient)
