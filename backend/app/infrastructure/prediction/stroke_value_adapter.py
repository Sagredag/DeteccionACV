from __future__ import annotations

from app.application.interfaces.prediction_service import PredictionGender, PredictionInput
from app.domain.evaluations.entities import EverMarried, ResidenceType, SmokingStatus, WorkType
from app.domain.predictions.exceptions import InvalidPredictionInputError

# Traduce el vocabulario limpio que usa la aplicación al vocabulario exacto (mayúsculas,
# guiones, espacios) que exige encoding_mappings/feature_columns dentro de modelo_stroke.pkl.
# Esta correspondencia se verificó directamente contra el .pkl en la Fase 3 (informe de
# descubrimiento del modelo), no se infirió del nombre de las variables.
_GENDER_TO_MODEL: dict[PredictionGender, str] = {
    PredictionGender.MALE: 'Male',
    PredictionGender.FEMALE: 'Female',
    PredictionGender.OTHER: 'Other',
}

_EVER_MARRIED_TO_MODEL: dict[EverMarried, str] = {
    EverMarried.YES: 'Yes',
    EverMarried.NO: 'No',
}

_WORK_TYPE_TO_MODEL: dict[WorkType, str] = {
    WorkType.PRIVATE: 'Private',
    WorkType.SELF_EMPLOYED: 'Self-employed',
    WorkType.GOVT_JOB: 'Govt_job',
    WorkType.CHILDREN: 'children',
    WorkType.NEVER_WORKED: 'Never_worked',
}

_RESIDENCE_TYPE_TO_MODEL: dict[ResidenceType, str] = {
    ResidenceType.URBAN: 'Urban',
    ResidenceType.RURAL: 'Rural',
}

_SMOKING_STATUS_TO_MODEL: dict[SmokingStatus, str] = {
    SmokingStatus.FORMERLY_SMOKED: 'formerly smoked',
    SmokingStatus.NEVER_SMOKED: 'never smoked',
    SmokingStatus.SMOKES: 'smokes',
    SmokingStatus.UNKNOWN: 'Unknown',
}


def _lookup(mapping: dict, value, field_name: str) -> str:
    try:
        return mapping[value]
    except KeyError as exc:
        valid = [member.value for member in mapping]
        raise InvalidPredictionInputError(
            f"Valor inválido en '{field_name}': '{value}'. Valores válidos: {valid}"
        ) from exc


def build_model_payload(payload: PredictionInput) -> dict:
    """Convierte un PredictionInput (vocabulario limpio de la aplicación) en el diccionario
    de campos crudos que espera el modelo (mismos nombres/valores que la clase Paciente de
    backend/model_acv). No realiza ningún cálculo del modelo, solo traduce nombres/valores."""
    return {
        'gender': _lookup(_GENDER_TO_MODEL, payload.gender, 'gender'),
        'age': payload.age,
        'hypertension': int(payload.hypertension),
        'heart_disease': int(payload.heart_disease),
        'ever_married': _lookup(_EVER_MARRIED_TO_MODEL, payload.ever_married, 'ever_married'),
        'work_type': _lookup(_WORK_TYPE_TO_MODEL, payload.work_type, 'work_type'),
        'Residence_type': _lookup(_RESIDENCE_TYPE_TO_MODEL, payload.residence_type, 'residence_type'),
        'avg_glucose_level': payload.avg_glucose_level,
        'bmi': payload.bmi,
        'smoking_status': _lookup(_SMOKING_STATUS_TO_MODEL, payload.smoking_status, 'smoking_status'),
    }
