from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.evaluations.entities import Evaluation
from app.domain.evaluations.repository import EvaluationRepository
from app.infrastructure.persistence.models.evaluation_model import EvaluationModel


class SqlAlchemyEvaluationRepository(EvaluationRepository):
    def __init__(self, db: Session) -> None:
        self._db = db

    def create(self, evaluation: Evaluation) -> Evaluation:
        model = EvaluationModel(
            patient_id=evaluation.patient_id,
            gender=evaluation.gender,
            age=evaluation.age,
            hypertension=evaluation.hypertension,
            heart_disease=evaluation.heart_disease,
            ever_married=evaluation.ever_married,
            work_type=evaluation.work_type,
            residence_type=evaluation.residence_type,
            avg_glucose_level=evaluation.avg_glucose_level,
            weight=evaluation.weight,
            height=evaluation.height,
            bmi=evaluation.bmi,
            smoking_status=evaluation.smoking_status,
            prediction_class=evaluation.prediction_class,
            prediction_probability=evaluation.prediction_probability,
            model_name=evaluation.model_name,
        )
        self._db.add(model)
        self._db.commit()
        self._db.refresh(model)
        return self._to_entity(model)

    def get_by_id(self, evaluation_id: UUID) -> Evaluation | None:
        model = self._db.get(EvaluationModel, evaluation_id)
        return self._to_entity(model) if model else None

    def list_by_patient(self, patient_id: UUID) -> list[Evaluation]:
        query = select(EvaluationModel).where(EvaluationModel.patient_id == patient_id).order_by(EvaluationModel.created_at.desc())
        rows = self._db.execute(query).scalars().all()
        return [self._to_entity(row) for row in rows]

    @staticmethod
    def _to_entity(model: EvaluationModel) -> Evaluation:
        return Evaluation(
            id=model.id,
            patient_id=model.patient_id,
            gender=model.gender,
            age=model.age,
            hypertension=model.hypertension,
            heart_disease=model.heart_disease,
            ever_married=model.ever_married,
            work_type=model.work_type,
            residence_type=model.residence_type,
            avg_glucose_level=model.avg_glucose_level,
            weight=model.weight,
            height=model.height,
            bmi=model.bmi,
            smoking_status=model.smoking_status,
            prediction_class=model.prediction_class,
            prediction_probability=model.prediction_probability,
            model_name=model.model_name,
            created_at=model.created_at,
        )
