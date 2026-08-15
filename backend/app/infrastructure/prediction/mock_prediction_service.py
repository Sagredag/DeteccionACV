from app.application.interfaces.prediction_service import PredictionInput, PredictionResult, PredictionService


class MockPredictionService(PredictionService):
    """Implementación simulada, sin usar. Se mantiene solo como referencia/alternativa
    para pruebas locales que no requieran cargar el modelo real (.pkl + scikit-learn)."""

    def predict(self, payload: PredictionInput) -> PredictionResult:
        score = 0.18
        score += 0.16 if payload.age >= 60 else 0.0
        score += 0.14 if payload.hypertension else 0.0
        score += 0.14 if payload.heart_disease else 0.0
        score += 0.1 if payload.bmi >= 30 else 0.0
        score += 0.1 if payload.avg_glucose_level >= 180 else 0.0
        probability = min(score, 0.97)

        return PredictionResult(
            prediction_class=1 if probability >= 0.5 else 0,
            prediction_probability=probability,
            model_name='mock-1.0',
        )
