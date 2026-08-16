from __future__ import annotations

from uuid import UUID

from app.application.dto.evaluation_dto import EvaluationCreateDTO
from app.application.interfaces.prediction_service import PredictionGender, PredictionInput, PredictionService
from app.domain.evaluations.bmi import calculate_bmi
from app.domain.evaluations.entities import Evaluation, EvaluationGender
from app.domain.evaluations.exceptions import EvaluationNotFoundError
from app.domain.evaluations.repository import EvaluationRepository
from app.domain.patients.exceptions import PatientNotFoundError
from app.domain.patients.repository import PatientRepository

# Puente Evaluation.gender (español, vocabulario de Patient.sexo — Fase 3) ->
# PredictionInput.gender (PredictionGender, en inglés — Fase 4). Son dos enums
# distintos a propósito (ver informe de Fase 4); este es el único lugar donde se
# traduce uno al otro. No se toca ni Evaluation ni su migración para "evitar" este
# mapeo, tal como pidió el usuario.
_GENDER_TO_PREDICTION: dict[EvaluationGender, PredictionGender] = {
    EvaluationGender.MASCULINO: PredictionGender.MALE,
    EvaluationGender.FEMENINO: PredictionGender.FEMALE,
    EvaluationGender.OTRO: PredictionGender.OTHER,
}


class EvaluationService:
    def __init__(
        self,
        repository: EvaluationRepository,
        patient_repository: PatientRepository,
        prediction_service: PredictionService,
    ) -> None:
        self._repository = repository
        self._patient_repository = patient_repository
        self._prediction_service = prediction_service

    def create_evaluation(self, data: EvaluationCreateDTO) -> Evaluation:
        if self._patient_repository.get_by_id(data.patient_id) is None:
            raise PatientNotFoundError(data.patient_id)

        # Fuente única de verdad de bmi: SIEMPRE se recalcula aquí a partir de
        # weight/height, nunca se confía en un bmi provisto externamente
        # (EvaluationCreateDTO ni siquiera tiene ese campo). Ver domain/evaluations/bmi.py.
        bmi = calculate_bmi(data.weight, data.height)

        prediction_input = PredictionInput(
            gender=_GENDER_TO_PREDICTION[data.gender],
            age=data.age,
            hypertension=data.hypertension,
            heart_disease=data.heart_disease,
            ever_married=data.ever_married,
            work_type=data.work_type,
            residence_type=data.residence_type,
            avg_glucose_level=data.avg_glucose_level,
            bmi=bmi,
            smoking_status=data.smoking_status,
        )
        # Única fuente de verdad de la predicción: el modelo real (.pkl), a través
        # del PredictionService inyectado. Nunca una fórmula alternativa aquí.
        prediction_result = self._prediction_service.predict(prediction_input)

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
            bmi=bmi,
            smoking_status=data.smoking_status,
            prediction_class=prediction_result.prediction_class,
            prediction_probability=prediction_result.prediction_probability,
            model_name=prediction_result.model_name,
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
