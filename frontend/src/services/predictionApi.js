const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Envía los datos del paciente al endpoint de predicción FastAPI.
 *
 * @param {Object} patientData - Variables clínicas del paciente
 * @returns {Promise<{ probability: number }>}
 * @throws {Error} si la respuesta no es exitosa o no contiene probabilidad
 */
export async function predictStrokeRisk(patientData) {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData),
  });

  if (!response.ok) {
    let message = `Error del servidor (${response.status})`;
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // ignorar errores de parseo
    }
    throw new Error(message);
  }

  const data = await response.json();

  // Acepta { probability: 0.85 }, { prediction: 0.85 }, { risk_score: 0.85 } o directamente 0.85
  const raw =
    typeof data === 'number'
      ? data
      : data.probability ?? data.prediction ?? data.risk_score ?? data.stroke_probability;

  if (raw === undefined || raw === null) {
    throw new Error('La respuesta del servidor no contiene una probabilidad válida.');
  }

  return {
    probability: Math.min(1, Math.max(0, Number(raw))),
  };
}
