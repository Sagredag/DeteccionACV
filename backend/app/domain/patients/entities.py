from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from enum import Enum
from uuid import UUID


class PatientSex(str, Enum):
    MASCULINO = 'masculino'
    FEMENINO = 'femenino'
    OTRO = 'otro'


@dataclass(slots=True)
class Patient:
    id: UUID | None
    nombres: str
    apellidos: str
    dni: str
    sexo: PatientSex
    fecha_nacimiento: date
    telefono: str
    correo: str
    direccion: str
    created_at: datetime | None = None
    updated_at: datetime | None = None
