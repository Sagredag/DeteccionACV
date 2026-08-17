from fastapi import APIRouter

from app.api.v1.endpoints.evaluations import evaluations_router, router as patient_evaluations_router
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.patients import router as patients_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(patients_router)
api_router.include_router(patient_evaluations_router)
api_router.include_router(evaluations_router)