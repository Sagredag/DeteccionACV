import { useState, useCallback } from 'react';
import { predictStrokeRisk } from '../services/predictionApi';

/**
 * Hook que gestiona el ciclo de vida de una predicción:
 * loading → result / error.
 */
export function usePrediction() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predict = useCallback(async (patientData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await predictStrokeRisk(patientData);
      setResult(data);
      return true;
    } catch (err) {
      setError(err.message || 'Error inesperado al conectar con el servidor.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { predict, result, loading, error, reset };
}
