import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPatient, deletePatient, fetchPatients, updatePatient, type PatientInput } from '@/features/patients/api'

const patientsKey = (search: string) => ['patients', search] as const

export function usePatients(search: string) {
  return useQuery({
    queryKey: patientsKey(search),
    queryFn: () => fetchPatients(search),
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PatientInput) => createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}

export function useUpdatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatientInput }) => updatePatient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}

export function useDeletePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patientId: string) => deletePatient(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}
