"""
API REST para el modelo de predicción de ACV (stroke) de la tesis de Mike.

Cómo correrla:
    1. pip install -r requirements.txt
    2. Coloca el archivo "modelo_stroke.pkl" en la misma carpeta que este script.
    3. uvicorn api:app --reload
    4. Abre http://localhost:8000/docs para probarla de forma interactiva.
"""

from fastapi import FastAPI, HTTPException

from model_pipeline import InvalidPatientValueError, Paciente, load_default_pipeline

app = FastAPI(
    title="API de Predicción de ACV",
    description="Modelo de Machine Learning para predecir riesgo de accidente cerebrovascular (ACV)",
    version="1.0",
)

# ---------------------------------------------------------------------------
# Cargar el paquete exportado desde el notebook (modelo + preprocesamiento)
# ---------------------------------------------------------------------------
pipeline = load_default_pipeline()


@app.get("/")
def info():
    return {
        "mensaje": "API de predicción de ACV activa",
        "modelo_en_uso": pipeline.nombre_modelo,
        "endpoint_prediccion": "/predecir (POST)",
        "documentacion_interactiva": "/docs",
    }


@app.post("/predecir")
def predecir(paciente: Paciente):
    try:
        return pipeline.predict(paciente)
    except InvalidPatientValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
