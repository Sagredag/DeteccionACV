import { apiClient } from '@/lib/api-client'

export type EvaluationGender = 'masculino' | 'femenino' | 'otro'
export type EverMarried = 'yes' | 'no'
export type WorkType = 'private' | 'govt_job' | 'self_employed' | 'children' | 'never_worked'
export type ResidenceType = 'urban' | 'rural'
export type SmokingStatus = 'formerly_smoked' | 'never_smoked' | 'smokes' | 'unknown'

export interface Evaluation {
  id: string
  patient_id: string
  gender: EvaluationGender
  age: number
  hypertension: boolean
  heart_disease: boolean
  ever_married: EverMarried
  work_type: WorkType
  residence_type: ResidenceType
  avg_glucose_level: number
  weight: number
  height: number
  bmi: number
  smoking_status: SmokingStatus
  prediction_class: number
  prediction_probability: number | null
  model_name: string
  created_at: string
}

export interface EvaluationInput {
  gender: EvaluationGender
  age: number
  hypertension: boolean
  heart_disease: boolean
  ever_married: EverMarried
  work_type: WorkType
  residence_type: ResidenceType
  avg_glucose_level: number
  // bmi NO se envía: el backend lo calcula a partir de weight/height (fuente única
  // de verdad, ver informe de Fase 5). weight/height sí se envían, por trazabilidad.
  weight: number
  height: number
  smoking_status: SmokingStatus
}

export function createEvaluation(patientId: string, data: EvaluationInput): Promise<Evaluation> {
  return apiClient.post<Evaluation>(`/patients/${patientId}/evaluations`, data)
}
