from __future__ import annotations

# Decisión de arquitectura (Fase 5): weight/height son los datos que captura el
# formulario, pero bmi es la única variable que el modelo predictivo recibe. Para
# evitar que un bmi enviado por el cliente (calculado con otra fórmula, redondeo
# distinto, o directamente manipulado) diverja del que realmente corresponde a
# weight/height, el backend es la única fuente de verdad: SIEMPRE recalcula bmi a
# partir de weight/height en el servidor y descarta cualquier bmi que llegue en el
# request (por eso EvaluationCreate, en api/v1/schemas/evaluation.py, ni siquiera
# tiene un campo bmi). Misma fórmula que ya usaba el formulario en el frontend
# (peso_kg / altura_m²), para que el valor mostrado en pantalla mientras se llena
# el formulario coincida con el que finalmente se persiste y se envía al modelo.


def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    height_m = height_cm / 100
    return round(weight_kg / (height_m ** 2), 1)
