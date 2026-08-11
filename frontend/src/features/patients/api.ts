import { apiClient } from '@/lib/api-client'

export type PatientSex = 'masculino' | 'femenino' | 'otro'

export interface Patient {
  id: string
  nombres: string
  apellidos: string
  dni: string
  sexo: PatientSex
  fecha_nacimiento: string
  telefono: string
  correo: string
  direccion: string
  created_at: string
  updated_at: string
}

export interface PatientInput {
  nombres: string
  apellidos: string
  dni: string
  sexo: PatientSex
  fecha_nacimiento: string
  telefono: string
  correo: string
  direccion: string
}

export function fetchPatients(search?: string): Promise<Patient[]> {
  const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
  return apiClient.get<Patient[]>(`/patients${query}`)
}

export function fetchPatient(patientId: string): Promise<Patient> {
  return apiClient.get<Patient>(`/patients/${patientId}`)
}

export function createPatient(data: PatientInput): Promise<Patient> {
  return apiClient.post<Patient>('/patients', data)
}

export function updatePatient(patientId: string, data: PatientInput): Promise<Patient> {
  return apiClient.put<Patient>(`/patients/${patientId}`, data)
}

export function deletePatient(patientId: string): Promise<void> {
  return apiClient.delete<void>(`/patients/${patientId}`)
}
