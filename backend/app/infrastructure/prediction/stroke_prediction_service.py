from __future__ import annotations

import importlib.util
import sys
from pathlib import Path
from types import ModuleType

from app.application.interfaces.prediction_service import PredictionInput, PredictionResult, PredictionService
from app.domain.predictions.exceptions import InvalidPredictionInputError
from app.infrastructure.prediction.stroke_value_adapter import build_model_payload


def _load_model_pipeline_module(module_path: Path) -> ModuleType:
    """Carga model_pipeline.py por ruta absoluta de archivo (no por nombre de paquete),
    porque la carpeta que lo contiene tiene espacios en el nombre ('model_acv/api python/
    api python/') y no es importable como un paquete normal de Python."""
    module_name = 'stroke_model_pipeline'
    if module_name in sys.modules:
        return sys.modules[module_name]

    spec = importlib.util.spec_from_file_location(module_name, module_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f'No se pudo cargar el módulo del modelo desde {module_path}')

    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module


class StrokePredictionService(PredictionService):
    """Implementación real de PredictionService: carga modelo_stroke.pkl (sin modificarlo)
    y reutiliza el preprocesamiento real extraído de api.py (model_pipeline.py)."""

    def __init__(self, model_pipeline_path: str | Path) -> None:
        module_path = Path(model_pipeline_path).resolve()
        module = _load_model_pipeline_module(module_path)

        self._paciente_cls = module.Paciente
        self._invalid_value_error = module.InvalidPatientValueError
        self._pipeline = module.StrokeModelPipeline(module_path.parent / module.DEFAULT_MODEL_FILENAME)

    def predict(self, payload: PredictionInput) -> PredictionResult:
        model_payload = build_model_payload(payload)

        try:
            paciente = self._paciente_cls(**model_payload)
            resultado = self._pipeline.predict(paciente)
        except self._invalid_value_error as exc:
            raise InvalidPredictionInputError(str(exc)) from exc

        return PredictionResult(
            prediction_class=resultado['prediccion'],
            prediction_probability=resultado['probabilidad_acv'],
            model_name=resultado['modelo_usado'],
        )
