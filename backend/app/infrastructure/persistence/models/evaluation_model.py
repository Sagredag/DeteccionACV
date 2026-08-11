from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, Enum, Float, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.domain.evaluations.entities import EvaluationGender, EverMarried, ResidenceType, SmokingStatus, WorkType


def _enum_column(enum_cls: type, name: str, length: int = 20) -> Enum:
    return Enum(
        enum_cls,
        name=name,
        native_enum=False,
        length=length,
        values_callable=lambda cls: [member.value for member in cls],
    )


class EvaluationModel(Base):
    __tablename__ = 'evaluations'
    __table_args__ = (CheckConstraint('prediction_class IN (0, 1)', name='ck_evaluations_prediction_class'),)

    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Sin ondelete='CASCADE' a propósito: no se debe poder eliminar un paciente que
    # todavía tiene evaluaciones asociadas sin decisión explícita (evita perder
    # historial clínico de forma silenciosa).
    patient_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey('patients.id'), nullable=False, index=True
    )

    # --- Entradas crudas de la evaluación (mismo nombre/valores que el formulario actual) ---
    gender: Mapped[EvaluationGender] = mapped_column(_enum_column(EvaluationGender, 'evaluation_gender'), nullable=False)
    age: Mapped[float] = mapped_column(Float, nullable=False)
    hypertension: Mapped[bool] = mapped_column(Boolean, nullable=False)
    heart_disease: Mapped[bool] = mapped_column(Boolean, nullable=False)
    ever_married: Mapped[EverMarried] = mapped_column(_enum_column(EverMarried, 'evaluation_ever_married', 10), nullable=False)
    work_type: Mapped[WorkType] = mapped_column(_enum_column(WorkType, 'evaluation_work_type', 20), nullable=False)
    residence_type: Mapped[ResidenceType] = mapped_column(
        _enum_column(ResidenceType, 'evaluation_residence_type', 10), nullable=False
    )
    avg_glucose_level: Mapped[float] = mapped_column(Float, nullable=False)
    # weight/height: NO se envían directamente al modelo, solo se usan para calcular
    # bmi (que sí es una entrada real del modelo). Se guardan por trazabilidad.
    weight: Mapped[float] = mapped_column(Float, nullable=False)
    height: Mapped[float] = mapped_column(Float, nullable=False)
    bmi: Mapped[float] = mapped_column(Float, nullable=False)
    smoking_status: Mapped[SmokingStatus] = mapped_column(
        _enum_column(SmokingStatus, 'evaluation_smoking_status', 20), nullable=False
    )

    # --- Resultado de la predicción ---
    prediction_class: Mapped[int] = mapped_column(Integer, nullable=False)
    prediction_probability: Mapped[float | None] = mapped_column(Float, nullable=True)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
