from __future__ import annotations

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.domain.patients.entities import PatientSex


class PatientBase(BaseModel):
    nombres: str = Field(min_length=2, max_length=150)
    apellidos: str = Field(min_length=2, max_length=150)
    dni: str = Field(min_length=8, max_length=12, pattern=r'^\d+$')
    sexo: PatientSex
    fecha_nacimiento: date
    telefono: str = Field(min_length=6, max_length=20)
    correo: EmailStr
    direccion: str = Field(min_length=5, max_length=255)

    @field_validator('fecha_nacimiento')
    @classmethod
    def validate_fecha_nacimiento(cls, value: date) -> date:
        if value > date.today():
            raise ValueError('La fecha de nacimiento no puede ser futura')
        return value


class PatientCreate(PatientBase):
    pass


class PatientUpdate(PatientBase):
    pass


class PatientResponse(PatientBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
