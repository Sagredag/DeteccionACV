from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.v1.schemas.evaluation import EvaluationCreate, EvaluationResponse
from app.application.dto.evaluation_dto import EvaluationCreateDTO
from app.application.services.evaluation_service import EvaluationService
from app.core.dependencies import get_evaluation_service

router = APIRouter(prefix='/patients/{patient_id}/evaluations', tags=['evaluations'])


@router.post('', response_model=EvaluationResponse, status_code=status.HTTP_201_CREATED)
def create_evaluation(
    patient_id: UUID,
    payload: EvaluationCreate,
    service: EvaluationService = Depends(get_evaluation_service),
) -> EvaluationResponse:
    dto = EvaluationCreateDTO(patient_id=patient_id, **payload.model_dump())
    evaluation = service.create_evaluation(dto)
    return EvaluationResponse.model_validate(evaluation)
