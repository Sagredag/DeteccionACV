# API de Predicción de ACV — Instrucciones para probarla

## Archivos que necesitas

1. `api.py` — el servidor de la API (ya incluido aquí)
2. `requirements.txt` — dependencias (ya incluido aquí)
3. `modelo_stroke.pkl` — **Mike te lo tiene que pasar por separado.** Es el archivo
   que exporta desde su notebook de Colab y contiene el modelo entrenado más todo
   el preprocesamiento necesario.

Los 3 archivos deben estar en la **misma carpeta**.

## Pasos para correr la API

```bash
# 1. Crear un entorno virtual (opcional pero recomendado)
python -m venv venv
source venv/bin/activate      # En Windows: venv\Scripts\activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Levantar el servidor
uvicorn api:app --reload
```

Si todo va bien, verás algo como:
```
Uvicorn running on http://127.0.0.1:8000
```

## Cómo probarla

### Opción A: Interfaz interactiva (la más fácil)
Abre en el navegador: **http://localhost:8000/docs**
Ahí puedes probar el endpoint `/predecir` llenando un formulario, sin escribir código.

### Opción B: Con curl
```bash
curl -X POST "http://localhost:8000/predecir" \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "Male",
    "age": 67,
    "hypertension": 0,
    "heart_disease": 1,
    "ever_married": "Yes",
    "work_type": "Private",
    "Residence_type": "Urban",
    "avg_glucose_level": 228.69,
    "bmi": 36.6,
    "smoking_status": "formerly smoked"
  }'
```

### Valores válidos para los campos de texto
- `gender`: Male, Female, Other
- `ever_married`: Yes, No
- `work_type`: Private, Self-employed, Govt_job, children, Never_worked
- `Residence_type`: Urban, Rural
- `smoking_status`: formerly smoked, never smoked, smokes, Unknown

## Respuesta esperada

```json
{
  "prediccion": 1,
  "interpretacion": "Riesgo de ACV",
  "probabilidad_acv": 0.83,
  "modelo_usado": "Logistic Regression"
}
```

## Si algo falla

- **"No se encontró 'modelo_stroke.pkl'"** → falta el archivo del modelo en la carpeta.
- **Error 422** → revisa que los campos de texto (gender, work_type, etc.) tengan
  exactamente los valores válidos listados arriba (son sensibles a mayúsculas/minúsculas).
