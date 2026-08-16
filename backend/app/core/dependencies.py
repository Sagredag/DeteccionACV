from collections.abc import Generator
from functools import lru_cache

from fastapi import Depends
from sqlalchemy.orm import Session

from app.application.interfaces.prediction_service import PredictionService
from app.application.services.evaluation_service import EvaluationService
from app.application.services.patient_service import PatientService
from app.core.config import get_settings
from app.db.session import SessionLocal
from app.domain.evaluations.repository import EvaluationRepository
from app.domain.patients.repository import PatientRepository
from app.infrastructure.persistence.repositories.evaluation_repository import SqlAlchemyEvaluationRepository
from app.infrastructure.persistence.repositories.patient_repository import SqlAlchemyPatientRepository
from app.infrastructure.prediction.stroke_prediction_service import StrokePredictionService


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_patient_repository(db: Session = Depends(get_db)) -> PatientRepository:
    return SqlAlchemyPatientRepository(db)


def get_patient_service(repository: PatientRepository = Depends(get_patient_repository)) -> PatientService:
    return PatientService(repository)


def get_evaluation_repository(db: Session = Depends(get_db)) -> EvaluationRepository:
    return SqlAlchemyEvaluationRepository(db)


@lru_cache
def _get_stroke_prediction_service() -> StrokePredictionService:
    # Cacheado a nivel de proceso: cargar el .pkl (joblib + scikit-learn) es costoso,
    # no debe repetirse en cada request.
    settings = get_settings()
    return StrokePredictionService(settings.stroke_model_pipeline_path)


def get_prediction_service() -> PredictionService:
    return _get_stroke_prediction_service()


def get_evaluation_service(
    repository: EvaluationRepository = Depends(get_evaluation_repository),
    patient_repository: PatientRepository = Depends(get_patient_repository),
    prediction_service: PredictionService = Depends(get_prediction_service),
) -> EvaluationService:
    return EvaluationService(repository, patient_repository, prediction_service)