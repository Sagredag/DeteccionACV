import { useQuery } from '@tanstack/react-query'
import { fetchEvaluation, fetchEvaluations, fetchPatientEvaluations, type EvaluationListParams } from '@/features/history/api'

export function useEvaluations(params: EvaluationListParams = {}) {
  return useQuery({
    queryKey: ['evaluations', 'list', params.limit ?? null, params.offset ?? null],
    queryFn: () => fetchEvaluations(params),
  })
}

export function useEvaluation(evaluationId: string | null) {
  return useQuery({
    queryKey: ['evaluations', 'detail', evaluationId],
    queryFn: () => fetchEvaluation(evaluationId as string),
    enabled: Boolean(evaluationId),
  })
}

export function usePatientEvaluations(patientId: string | null) {
  return useQuery({
    queryKey: ['patients', patientId, 'evaluations'],
    queryFn: () => fetchPatientEvaluations(patientId as string),
    enabled: Boolean(patientId),
  })
}
