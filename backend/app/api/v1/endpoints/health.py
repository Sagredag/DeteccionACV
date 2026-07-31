from pydantic import BaseModel
from fastapi import APIRouter


class HealthResponse(BaseModel):
    status: str
    service: str


router = APIRouter(prefix='/health', tags=['health'])


@router.get('', response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(status='ok', service='stroke-risk-api')