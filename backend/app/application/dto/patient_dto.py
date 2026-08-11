from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from app.domain.patients.entities import PatientSex


@dataclass(frozen=True, slots=True)
class PatientCreateDTO:
    nombres: str
    apellidos: str
    dni: str
    sexo: PatientSex
    fecha_nacimiento: date
    telefono: str
    correo: str
    direccion: str


@dataclass(frozen=True, slots=True)
class PatientUpdateDTO:
    nombres: str
    apellidos: str
    dni: str
    sexo: PatientSex
    fecha_nacimiento: date
    telefono: str
    correo: str
    direccion: str
