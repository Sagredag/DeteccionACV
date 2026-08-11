from __future__ import annotations

from uuid import UUID

from app.application.dto.evaluation_dto import EvaluationCreateDTO
from app.domain.evaluations.entities import Evaluation
from app.domain.evaluations.exceptions import EvaluationNotFoundError
from app.domain.evaluations.repository import EvaluationRepository
from app.domain.patients.exceptions import PatientNotFoundError
from app.domain.patients.repository import PatientRepository


class EvaluationService:
    def __init__(self, repository: EvaluationRepository, patient_repository: PatientRepository) -> None:
        self._repository = repository
        self._patient_repository = patient_repository

    def create_evaluation(self, data: EvaluationCreateDTO) -> Evaluation:
        if self._patient_repository.get_by_id(data.patient_id) is None:
            raise PatientNotFoundError(data.patient_id)

        evaluation = Evaluation(
            id=None,
            patient_id=data.patient_id,
            gender=data.gender,
            age=data.age,
            hypertension=data.hypertension,
            heart_disease=data.heart_disease,
            ever_married=data.ever_married,
            work_type=data.work_type,
            residence_type=data.residence_type,
            avg_glucose_level=data.avg_glucose_level,
            weight=data.weight,
            height=data.height,
            bmi=data.bmi,
            smoking_status=data.smoking_status,
            prediction_class=data.prediction_class,
            prediction_probability=data.prediction_probability,
            model_name=data.model_name,
        )
        return self._repository.create(evaluation)

    def get_evaluation(self, evaluation_id: UUID) -> Evaluation:
        evaluation = self._repository.get_by_id(evaluation_id)
        if evaluation is None:
            raise EvaluationNotFoundError(evaluation_id)
        return evaluation

    def list_patient_evaluations(self, patient_id: UUID) -> list[Evaluation]:
        if self._patient_repository.get_by_id(patient_id) is None:
            raise PatientNotFoundError(patient_id)
        return self._repository.list_by_patient(patient_id)
