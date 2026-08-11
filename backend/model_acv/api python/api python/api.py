"""
API REST para el modelo de predicción de ACV (stroke) de la tesis de Mike.

Cómo correrla:
    1. pip install -r requirements.txt
    2. Coloca el archivo "modelo_stroke.pkl" en la misma carpeta que este script.
    3. uvicorn api:app --reload
    4. Abre http://localhost:8000/docs para probarla de forma interactiva.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pandas as pd
import joblib

app = FastAPI(
    title="API de Predicción de ACV",
    description="Modelo de Machine Learning para predecir riesgo de accidente cerebrovascular (ACV)",
    version="1.0",
)

# ---------------------------------------------------------------------------
# Cargar el paquete exportado desde el notebook (modelo + preprocesamiento)
# ---------------------------------------------------------------------------
try:
    paquete = joblib.load("modelo_stroke.pkl")
except FileNotFoundError:
    raise RuntimeError(
        "No se encontró 'modelo_stroke.pkl'. Asegúrate de exportarlo desde el "
        "notebook y colocarlo en la misma carpeta que este archivo."
    )

modelo = paquete["modelo"]
nombre_modelo = paquete["nombre_modelo"]
scaler = paquete["scaler"]
encoding_mappings = paquete["encoding_mappings"]
bmi_encoder_classes = paquete["bmi_encoder_classes"]
age_encoder_classes = paquete["age_encoder_classes"]
bmi_bins = paquete["bmi_bins"]
bmi_labels = paquete["bmi_labels"]
age_bins = paquete["age_bins"]
age_labels = paquete["age_labels"]
outlier_bounds = paquete["outlier_bounds"]
feature_columns = paquete["feature_columns"]


# ---------------------------------------------------------------------------
# Esquema de entrada: datos CRUDOS del paciente (tal como vienen en el dataset original)
# ---------------------------------------------------------------------------
class Paciente(BaseModel):
    gender: str = Field(..., example="Male", description="Male, Female u Other")
    age: float = Field(..., example=67.0)
    hypertension: int = Field(..., example=0, description="0 = No, 1 = Sí")
    heart_disease: int = Field(..., example=1, description="0 = No, 1 = Sí")
    ever_married: str = Field(..., example="Yes", description="Yes o No")
    work_type: str = Field(..., example="Private",
                            description="Private, Self-employed, Govt_job, children o Never_worked")
    Residence_type: str = Field(..., example="Urban", description="Urban o Rural")
    avg_glucose_level: float = Field(..., example=228.69)
    bmi: float = Field(..., example=36.6)
    smoking_status: str = Field(..., example="formerly smoked",
                                 description="formerly smoked, never smoked, smokes o Unknown")


def _clip(valor: float, feature: str) -> float:
    lo, hi = outlier_bounds[feature]
    return min(max(valor, lo), hi)


def preprocesar(paciente: Paciente) -> pd.DataFrame:
    """Replica EXACTAMENTE los pasos de preprocesamiento del notebook."""
    raw = paciente.dict()

    # --- Validar categorías conocidas ---
    for col in ["gender", "ever_married", "Residence_type"]:
        if raw[col] not in encoding_mappings[col]:
            raise HTTPException(
                status_code=422,
                detail=f"Valor inválido en '{col}': '{raw[col]}'. "
                       f"Valores válidos: {list(encoding_mappings[col].keys())}",
            )

    # --- Feature engineering (usa los valores CRUDOS, igual que en el notebook) ---
    bmi_cat_label = pd.cut([raw["bmi"]], bins=bmi_bins, labels=bmi_labels)[0]
    age_grp_label = pd.cut([raw["age"]], bins=age_bins, labels=age_labels)[0]

    bmi_category = bmi_encoder_classes[bmi_cat_label]
    age_group = age_encoder_classes[age_grp_label]
    glucose_age_ratio = raw["avg_glucose_level"] / (raw["age"] + 1)
    high_glucose = 1 if raw["avg_glucose_level"] > 126 else 0
    health_risk_score = raw["hypertension"] + raw["heart_disease"] + high_glucose

    # --- Label encoding ---
    gender_enc = encoding_mappings["gender"][raw["gender"]]
    married_enc = encoding_mappings["ever_married"][raw["ever_married"]]
    residence_enc = encoding_mappings["Residence_type"][raw["Residence_type"]]

    # --- Escalado (StandardScaler) de las 3 variables continuas ---
    age_s, glucose_s, bmi_s = scaler.transform(
        [[raw["age"], raw["avg_glucose_level"], raw["bmi"]]]
    )[0]

    # --- Capping de outliers (mismos límites IQR del entrenamiento) ---
    age_s = _clip(age_s, "age")
    glucose_s = _clip(glucose_s, "avg_glucose_level")
    bmi_s = _clip(bmi_s, "bmi")

    fila = {
        "gender": gender_enc,
        "age": age_s,
        "hypertension": raw["hypertension"],
        "heart_disease": raw["heart_disease"],
        "ever_married": married_enc,
        "Residence_type": residence_enc,
        "avg_glucose_level": glucose_s,
        "bmi": bmi_s,
        "bmi_category": bmi_category,
        "age_group": age_group,
        "glucose_age_ratio": glucose_age_ratio,
        "health_risk_score": health_risk_score,
    }

    # --- One-hot encoding manual para work_type y smoking_status ---
    for col in feature_columns:
        if col.startswith("work_type_"):
            categoria = col[len("work_type_"):]
            fila[col] = 1 if raw["work_type"] == categoria else 0
        elif col.startswith("smoking_status_"):
            categoria = col[len("smoking_status_"):]
            fila[col] = 1 if raw["smoking_status"] == categoria else 0

    # --- Ordenar columnas EXACTAMENTE como espera el modelo ---
    return pd.DataFrame([fila])[feature_columns]


@app.get("/")
def info():
    return {
        "mensaje": "API de predicción de ACV activa",
        "modelo_en_uso": nombre_modelo,
        "endpoint_prediccion": "/predecir (POST)",
        "documentacion_interactiva": "/docs",
    }


@app.post("/predecir")
def predecir(paciente: Paciente):
    X = preprocesar(paciente)
    prediccion = int(modelo.predict(X)[0])

    if hasattr(modelo, "predict_proba"):
        probabilidad = float(modelo.predict_proba(X)[0][1])
    else:
        probabilidad = None

    return {
        "prediccion": prediccion,
        "interpretacion": "Riesgo de ACV" if prediccion == 1 else "Sin riesgo de ACV",
        "probabilidad_acv": probabilidad,
        "modelo_usado": nombre_modelo,
    }
