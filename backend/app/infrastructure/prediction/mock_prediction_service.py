from app.application.interfaces.prediction_service import PredictionInput, PredictionResult, PredictionService


class MockPredictionService(PredictionService):
    def predict(self, payload: PredictionInput) -> PredictionResult:
        score = 0.18
        score += 0.16 if payload.age >= 60 else 0.0
        score += 0.14 if payload.hypertension else 0.0
        score += 0.14 if payload.heart_disease else 0.0
        score += 0.1 if payload.bmi >= 30 else 0.0
        score += 0.1 if payload.avg_glucose_level >= 180 else 0.0
        risk_score = min(score, 0.97)
        risk_label = 'alto' if risk_score >= 0.5 else 'bajo'

        return PredictionResult(
            risk_score=risk_score,
            risk_label=risk_label,
            model_version='mock-1.0',
        )