import { useMutation } from '@tanstack/react-query'
import { createEvaluation, type EvaluationInput } from '@/features/evaluation/api'

export function useCreateEvaluation() {
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: EvaluationInput }) => createEvaluation(patientId, data),
  })
}
