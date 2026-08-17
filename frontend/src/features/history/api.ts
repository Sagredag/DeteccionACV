import { apiClient } from '@/lib/api-client'
import type { Evaluation } from '@/features/evaluation/api'
import type { Patient } from '@/features/patients/api'

export interface EvaluationWithPatient extends Evaluation {
  patient: Patient
}

export interface EvaluationListParams {
  limit?: number
  offset?: number
}

export function fetchEvaluations(params: EvaluationListParams = {}): Promise<EvaluationWithPatient[]> {
  const query = new URLSearchParams()
  if (params.limit !== undefined) query.set('limit', String(params.limit))
  if (params.offset !== undefined) query.set('offset', String(params.offset))
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiClient.get<EvaluationWithPatient[]>(`/evaluations${suffix}`)
}

export function fetchEvaluation(evaluationId: string): Promise<EvaluationWithPatient> {
  return apiClient.get<EvaluationWithPatient>(`/evaluations/${evaluationId}`)
}

export function fetchPatientEvaluations(patientId: string): Promise<EvaluationWithPatient[]> {
  return apiClient.get<EvaluationWithPatient[]>(`/patients/${patientId}/evaluations`)
}
