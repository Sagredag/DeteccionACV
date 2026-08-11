from collections.abc import Generator

from fastapi import Depends
from sqlalchemy.orm import Session

from app.application.services.evaluation_service import EvaluationService
from app.application.services.patient_service import PatientService
from app.db.session import SessionLocal
from app.domain.evaluations.repository import EvaluationRepository
from app.domain.patients.repository import PatientRepository
from app.infrastructure.persistence.repositories.evaluation_repository import SqlAlchemyEvaluationRepository
from app.infrastructure.persistence.repositories.patient_repository import SqlAlchemyPatientRepository


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


def get_evaluation_service(
    repository: EvaluationRepository = Depends(get_evaluation_repository),
    patient_repository: PatientRepository = Depends(get_patient_repository),
) -> EvaluationService:
    return EvaluationService(repository, patient_repository)