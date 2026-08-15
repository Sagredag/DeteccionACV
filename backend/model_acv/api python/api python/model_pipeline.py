"""
Módulo reutilizable con la carga del modelo y el preprocesamiento reales
(extraído de api.py para poder importarse desde otros servicios sin
levantar una segunda aplicación FastAPI ni depender del directorio de
trabajo actual).

Este archivo NO cambia ningún cálculo, validación ni transformación:
es exactamente la misma lógica que estaba en api.py, solo reorganizada
en una clase para poder reutilizarla de forma segura.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import pandas as pd
from pydantic import BaseModel, Field

DEFAULT_MODEL_FILENAME = 'modelo_stroke.pkl'


class InvalidPatientValueError(ValueError):
    """Se lanza cuando un valor categórico no está en el vocabulario que el modelo conoce."""


# ---------------------------------------------------------------------------
# Esquema de entrada: datos CRUDOS del paciente (tal como vienen en el dataset original)
# Idéntico al de api.py, incluyendo el nombre exacto 'Residence_type'.
# ---------------------------------------------------------------------------
class Paciente(BaseModel):
    gender: str = Field(..., example='Male', description='Male, Female u Other')
    age: float = Field(..., example=67.0)
    hypertension: int = Field(..., example=0, description='0 = No, 1 = Sí')
    heart_disease: int = Field(..., example=1, description='0 = No, 1 = Sí')
    ever_married: str = Field(..., example='Yes', description='Yes o No')
    work_type: str = Field(..., example='Private', description='Private, Self-employed, Govt_job, children o Never_worked')
    Residence_type: str = Field(..., example='Urban', description='Urban o Rural')
    avg_glucose_level: float = Field(..., example=228.69)
    bmi: float = Field(..., example=36.6)
    smoking_status: str = Field(..., example='formerly smoked', description='formerly smoked, never smoked, smokes o Unknown')


class StrokeModelPipeline:
    """Envuelve el paquete exportado desde el notebook (modelo + preprocesamiento).

    Reemplaza el estado a nivel de módulo que tenía api.py por atributos de
    instancia, para poder cargarse explícitamente con una ruta absoluta y sin
    efectos secundarios de import (no crea ninguna app de FastAPI).
    """

    def __init__(self, pkl_path: str | Path) -> None:
        pkl_path = Path(pkl_path)
        try:
            paquete: dict[str, Any] = joblib.load(pkl_path)
        except FileNotFoundError as exc:
            raise RuntimeError(
                f"No se encontró '{pkl_path}'. Asegúrate de que modelo_stroke.pkl esté en esa ruta."
            ) from exc

        self.modelo = paquete['modelo']
        self.nombre_modelo: str = paquete['nombre_modelo']
        self.scaler = paquete['scaler']
        self.encoding_mappings: dict[str, dict[str, str]] = paquete['encoding_mappings']
        self.bmi_encoder_classes = paquete['bmi_encoder_classes']
        self.age_encoder_classes = paquete['age_encoder_classes']
        self.bmi_bins = paquete['bmi_bins']
        self.bmi_labels = paquete['bmi_labels']
        self.age_bins = paquete['age_bins']
        self.age_labels = paquete['age_labels']
        self.outlier_bounds: dict[str, tuple[float, float]] = paquete['outlier_bounds']
        self.feature_columns: list[str] = paquete['feature_columns']

    def _clip(self, valor: float, feature: str) -> float:
        lo, hi = self.outlier_bounds[feature]
        return min(max(valor, lo), hi)

    def preprocesar(self, paciente: Paciente) -> pd.DataFrame:
        """Replica EXACTAMENTE los pasos de preprocesamiento del notebook (ver api.py original)."""
        raw = paciente.dict()

        # --- Validar categorías conocidas ---
        for col in ['gender', 'ever_married', 'Residence_type']:
            if raw[col] not in self.encoding_mappings[col]:
                raise InvalidPatientValueError(
                    f"Valor inválido en '{col}': '{raw[col]}'. "
                    f"Valores válidos: {list(self.encoding_mappings[col].keys())}"
                )

        # --- Feature engineering (usa los valores CRUDOS, igual que en el notebook) ---
        bmi_cat_label = pd.cut([raw['bmi']], bins=self.bmi_bins, labels=self.bmi_labels)[0]
        age_grp_label = pd.cut([raw['age']], bins=self.age_bins, labels=self.age_labels)[0]

        bmi_category = self.bmi_encoder_classes[bmi_cat_label]
        age_group = self.age_encoder_classes[age_grp_label]
        glucose_age_ratio = raw['avg_glucose_level'] / (raw['age'] + 1)
        high_glucose = 1 if raw['avg_glucose_level'] > 126 else 0
        health_risk_score = raw['hypertension'] + raw['heart_disease'] + high_glucose

        # --- Label encoding ---
        gender_enc = self.encoding_mappings['gender'][raw['gender']]
        married_enc = self.encoding_mappings['ever_married'][raw['ever_married']]
        residence_enc = self.encoding_mappings['Residence_type'][raw['Residence_type']]

        # --- Escalado (StandardScaler) de las 3 variables continuas ---
        age_s, glucose_s, bmi_s = self.scaler.transform([[raw['age'], raw['avg_glucose_level'], raw['bmi']]])[0]

        # --- Capping de outliers (mismos límites IQR del entrenamiento) ---
        age_s = self._clip(age_s, 'age')
        glucose_s = self._clip(glucose_s, 'avg_glucose_level')
        bmi_s = self._clip(bmi_s, 'bmi')

        fila = {
            'gender': gender_enc,
            'age': age_s,
            'hypertension': raw['hypertension'],
            'heart_disease': raw['heart_disease'],
            'ever_married': married_enc,
            'Residence_type': residence_enc,
            'avg_glucose_level': glucose_s,
            'bmi': bmi_s,
            'bmi_category': bmi_category,
            'age_group': age_group,
            'glucose_age_ratio': glucose_age_ratio,
            'health_risk_score': health_risk_score,
        }

        # --- One-hot encoding manual para work_type y smoking_status ---
        for col in self.feature_columns:
            if col.startswith('work_type_'):
                categoria = col[len('work_type_'):]
                fila[col] = 1 if raw['work_type'] == categoria else 0
            elif col.startswith('smoking_status_'):
                categoria = col[len('smoking_status_'):]
                fila[col] = 1 if raw['smoking_status'] == categoria else 0

        # --- Ordenar columnas EXACTAMENTE como espera el modelo ---
        return pd.DataFrame([fila])[self.feature_columns]

    def predict(self, paciente: Paciente) -> dict[str, Any]:
        """Misma lógica que el endpoint /predecir de api.py, como llamada directa."""
        X = self.preprocesar(paciente)
        prediccion = int(self.modelo.predict(X)[0])

        if hasattr(self.modelo, 'predict_proba'):
            probabilidad = float(self.modelo.predict_proba(X)[0][1])
        else:
            probabilidad = None

        return {
            'prediccion': prediccion,
            'interpretacion': 'Riesgo de ACV' if prediccion == 1 else 'Sin riesgo de ACV',
            'probabilidad_acv': probabilidad,
            'modelo_usado': self.nombre_modelo,
        }


def load_default_pipeline() -> StrokeModelPipeline:
    """Carga modelo_stroke.pkl desde la misma carpeta que este archivo (ruta absoluta,
    no depende del directorio de trabajo desde el que se importe este módulo)."""
    return StrokeModelPipeline(Path(__file__).resolve().parent / DEFAULT_MODEL_FILENAME)
