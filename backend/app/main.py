import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.api.v1.api import api_router
from app.core.config import get_settings
from app.domain.evaluations.exceptions import EvaluationNotFoundError
from app.domain.patients.exceptions import DuplicatePatientDniError, PatientNotFoundError
from app.domain.predictions.exceptions import InvalidPredictionInputError

logger = logging.getLogger('app')

settings = get_settings()

app = FastAPI(title=settings.app_name, version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(api_router, prefix='/api/v1')


@app.exception_handler(PatientNotFoundError)
def patient_not_found_handler(request: Request, exc: PatientNotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={'detail': str(exc)})


@app.exception_handler(DuplicatePatientDniError)
def duplicate_patient_dni_handler(request: Request, exc: DuplicatePatientDniError) -> JSONResponse:
    return JSONResponse(status_code=409, content={'detail': str(exc)})


@app.exception_handler(EvaluationNotFoundError)
def evaluation_not_found_handler(request: Request, exc: EvaluationNotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={'detail': str(exc)})


@app.exception_handler(InvalidPredictionInputError)
def invalid_prediction_input_handler(request: Request, exc: InvalidPredictionInputError) -> JSONResponse:
    return JSONResponse(status_code=422, content={'detail': str(exc)})


@app.exception_handler(SQLAlchemyError)
def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    return JSONResponse(status_code=500, content={'detail': 'Error al comunicarse con la base de datos'})


@app.exception_handler(Exception)
def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # Última línea de defensa (p.ej. un fallo inesperado del modelo predictivo):
    # nunca dejar que el cliente reciba una página de error sin JSON parseable.
    logger.exception('Error no controlado al procesar %s %s', request.method, request.url.path)
    return JSONResponse(status_code=500, content={'detail': 'Error interno del servidor'})


@app.get('/')
def root() -> dict[str, str]:
    return {'message': 'Stroke Risk Platform API'}