import { useEffect, type ElementType, type ReactNode, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Activity, BrainCircuit, Calculator, HeartPulse, ShieldAlert, Stethoscope, UserRound, Wind } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api-client'
import { usePatients } from '@/features/patients/hooks'
import { useCreateEvaluation } from '@/features/evaluation/hooks'
import type { Evaluation, EvaluationInput } from '@/features/evaluation/api'

const evaluationSchema = z.object({
  gender: z.enum(['masculino', 'femenino', 'otro'], { message: 'Selecciona el sexo' }),
  age: z.number().min(18, 'La edad mínima es 18 años').max(120, 'La edad máxima es 120 años'),
  hypertension: z.boolean(),
  heart_disease: z.boolean(),
  ever_married: z.enum(['yes', 'no'], { message: 'Selecciona una opción' }),
  work_type: z.enum(['children', 'govt_job', 'never_worked', 'private', 'self_employed'], { message: 'Selecciona un tipo de trabajo' }),
  residence_type: z.enum(['urban', 'rural'], { message: 'Selecciona la residencia' }),
  avg_glucose_level: z.number().min(40, 'La glucosa mínima es 40 mg/dL').max(500, 'La glucosa máxima es 500 mg/dL'),
  weight: z.number().min(20, 'El peso mínimo es 20 kg').max(300, 'El peso máximo es 300 kg'),
  height: z.number().min(100, 'La talla mínima es 100 cm').max(230, 'La talla máxima es 230 cm'),
  bmi: z.number(),
  smoking_status: z.enum(['formerly_smoked', 'never_smoked', 'smokes', 'unknown'], { message: 'Selecciona el estado de fumador' }),
})

type EvaluationFormValues = z.infer<typeof evaluationSchema>
type EvaluationFormInput = z.input<typeof evaluationSchema>

const defaultValues: EvaluationFormValues = {
  gender: 'femenino',
  age: 60,
  hypertension: false,
  heart_disease: false,
  ever_married: 'yes',
  work_type: 'private',
  residence_type: 'urban',
  avg_glucose_level: 104,
  weight: 72,
  height: 165,
  bmi: 26.4,
  smoking_status: 'never_smoked',
}

function calculateBmi(weight: number, height: number) {
  const heightInMeters = height / 100

  if (!weight || !heightInMeters) {
    return 0
  }

  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1))
}

function toEvaluationInput(values: EvaluationFormValues): EvaluationInput {
  return {
    gender: values.gender,
    age: values.age,
    hypertension: values.hypertension,
    heart_disease: values.heart_disease,
    ever_married: values.ever_married,
    work_type: values.work_type,
    residence_type: values.residence_type,
    avg_glucose_level: values.avg_glucose_level,
    weight: values.weight,
    height: values.height,
    smoking_status: values.smoking_status,
  }
}

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

function SectionCard({ icon: Icon, title, description, children }: { icon: ElementType; title: string; description: string; children: ReactNode }) {
  return (
    <Card className="border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
      <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-slate-50">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  )
}

function PatientFormFields({ register, errors }: { register: ReturnType<typeof useForm<EvaluationFormInput, undefined, EvaluationFormValues>>['register']; errors: ReturnType<typeof useForm<EvaluationFormInput, undefined, EvaluationFormValues>>['formState']['errors'] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-2">
        <Label htmlFor="gender">Sexo</Label>
        <Select id="gender" {...register('gender')}>
          <option value="femenino">Femenino</option>
          <option value="masculino">Masculino</option>
          <option value="otro">Otro</option>
        </Select>
        {errors.gender ? <p className="text-xs text-rose-600">{errors.gender.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="age">Edad</Label>
        <Input id="age" type="number" min={18} max={120} {...register('age', { valueAsNumber: true })} />
        {errors.age ? <p className="text-xs text-rose-600">{errors.age.message}</p> : null}
      </div>
    </div>
  )
}

export function EvaluationPage() {
  const [searchParams] = useSearchParams()
  const patientIdFromUrl = searchParams.get('patientId')

  const [selectedPatientId, setSelectedPatientId] = useState<string>(patientIdFromUrl ?? '')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<Evaluation | null>(null)

  const patientsQuery = usePatients('')
  const createEvaluationMutation = useCreateEvaluation()

  const form = useForm<EvaluationFormInput, undefined, EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues,
    mode: 'onSubmit',
  })

  const weight = form.watch('weight')
  const height = form.watch('height')

  useEffect(() => {
    const bmi = calculateBmi(weight, height)
    form.setValue('bmi', bmi, { shouldValidate: true, shouldDirty: true })
  }, [form, height, weight])

  const patients = patientsQuery.data ?? []

  // Si llega un patientId por la URL (por ejemplo, desde el módulo de pacientes en
  // el futuro) lo preseleccionamos apenas la lista cargue; si no, se puede elegir
  // cualquier paciente real desde el desplegable.
  useEffect(() => {
    if (selectedPatientId || patients.length === 0) return
    const preselected = patientIdFromUrl && patients.some((p) => p.id === patientIdFromUrl) ? patientIdFromUrl : patients[0].id
    setSelectedPatientId(preselected)
  }, [patientIdFromUrl, patients, selectedPatientId])

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? null

  const handlePredict = async (values: EvaluationFormValues) => {
    setSubmitError(null)
    setResult(null)

    if (!selectedPatientId) {
      setSubmitError('Selecciona un paciente antes de evaluar.')
      return
    }

    try {
      const evaluation = await createEvaluationMutation.mutateAsync({
        patientId: selectedPatientId,
        data: toEvaluationInput(values),
      })
      setResult(evaluation)
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          setSubmitError('El paciente seleccionado ya no existe. Elige otro paciente.')
        } else if (error.status === 422) {
          setSubmitError(`Datos inválidos: ${error.message}`)
        } else {
          setSubmitError(`Error del servidor: ${error.message}`)
        }
      } else {
        setSubmitError('No se pudo conectar con el servidor. Verifica tu conexión.')
      }
    }
  }

  const isEvaluating = createEvaluationMutation.isPending

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
        <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-slate-50">
          <CardDescription>Flujo clínico</CardDescription>
          <CardTitle className="text-2xl">Nueva evaluación</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
            {patientsQuery.isLoading ? (
              <p className="text-sm text-slate-500">Cargando pacientes…</p>
            ) : patients.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay pacientes registrados todavía.{' '}
                <Link to="/pacientes" className="font-semibold text-sky-700 underline">
                  Crea un paciente
                </Link>{' '}
                antes de realizar una evaluación.
              </p>
            ) : (
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Paciente seleccionado</p>
                  {selectedPatient ? (
                    <>
                      <h3 className="mt-1 text-xl font-semibold text-slate-900">
                        {selectedPatient.nombres} {selectedPatient.apellidos}
                      </h3>
                      <p className="text-sm text-slate-500">
                        DNI {selectedPatient.dni} · {formatDisplayDate(selectedPatient.fecha_nacimiento)}
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-slate-500">Selecciona un paciente para continuar.</p>
                  )}
                </div>
                <div className="min-w-72">
                  <Label htmlFor="patient-selector">Paciente</Label>
                  <Select
                    id="patient-selector"
                    value={selectedPatientId}
                    onChange={(event) => setSelectedPatientId(event.target.value)}
                    className="mt-2"
                  >
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.nombres} {patient.apellidos} · {patient.dni}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {[
              { label: 'Variables activas', value: '10', icon: Activity },
              { label: 'Estado', value: 'Conectado', icon: ShieldAlert },
              { label: 'Salida', value: 'Riesgo clínico', icon: BrainCircuit },
            ].map((item) => {
              const Icon = item.icon

              return (
                <div key={item.label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3 text-slate-500">
                    <Icon className="h-4 w-4" />
                    <p className="text-sm">{item.label}</p>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <form className="space-y-6" onSubmit={form.handleSubmit(handlePredict)}>
        <SectionCard icon={UserRound} title="Datos personales" description="Variables demográficas del modelo">
          <PatientFormFields register={form.register} errors={form.formState.errors} />
        </SectionCard>

        <SectionCard icon={HeartPulse} title="Antecedentes" description="Factores clínicos relevantes">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Hipertensión</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant={form.watch('hypertension') ? 'default' : 'outline'} className="rounded-2xl" onClick={() => form.setValue('hypertension', true, { shouldValidate: true, shouldDirty: true })}>
                  Sí
                </Button>
                <Button type="button" variant={!form.watch('hypertension') ? 'default' : 'outline'} className="rounded-2xl" onClick={() => form.setValue('hypertension', false, { shouldValidate: true, shouldDirty: true })}>
                  No
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Enfermedad cardíaca</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant={form.watch('heart_disease') ? 'default' : 'outline'} className="rounded-2xl" onClick={() => form.setValue('heart_disease', true, { shouldValidate: true, shouldDirty: true })}>
                  Sí
                </Button>
                <Button type="button" variant={!form.watch('heart_disease') ? 'default' : 'outline'} className="rounded-2xl" onClick={() => form.setValue('heart_disease', false, { shouldValidate: true, shouldDirty: true })}>
                  No
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Alguna vez casado</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant={form.watch('ever_married') === 'yes' ? 'default' : 'outline'} className="rounded-2xl" onClick={() => form.setValue('ever_married', 'yes', { shouldValidate: true, shouldDirty: true })}>
                  Sí
                </Button>
                <Button type="button" variant={form.watch('ever_married') === 'no' ? 'default' : 'outline'} className="rounded-2xl" onClick={() => form.setValue('ever_married', 'no', { shouldValidate: true, shouldDirty: true })}>
                  No
                </Button>
              </div>
              {form.formState.errors.ever_married ? <p className="text-xs text-rose-600">{form.formState.errors.ever_married.message}</p> : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={Stethoscope} title="Información laboral" description="Contexto ocupacional">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2 md:col-span-2 xl:col-span-2">
              <Label htmlFor="work_type">Tipo de trabajo</Label>
              <Select id="work_type" {...form.register('work_type')}>
                <option value="private">Privado</option>
                <option value="govt_job">Empleo gubernamental</option>
                <option value="self_employed">Independiente</option>
                <option value="children">Niños</option>
                <option value="never_worked">Nunca trabajó</option>
              </Select>
              {form.formState.errors.work_type ? <p className="text-xs text-rose-600">{form.formState.errors.work_type.message}</p> : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={Wind} title="Residencia" description="Zona de vivienda del paciente">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2 sm:col-span-2 xl:col-span-2">
              <Label htmlFor="residence_type">Urbana o rural</Label>
              <Select id="residence_type" {...form.register('residence_type')}>
                <option value="urban">Urbana</option>
                <option value="rural">Rural</option>
              </Select>
              {form.formState.errors.residence_type ? <p className="text-xs text-rose-600">{form.formState.errors.residence_type.message}</p> : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={Calculator} title="Laboratorio y estado físico" description="Variables que impactan el cálculo del riesgo">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="avg_glucose_level">Glucosa promedio</Label>
              <Input id="avg_glucose_level" type="number" min={40} max={500} step="0.1" {...form.register('avg_glucose_level', { valueAsNumber: true })} />
              {form.formState.errors.avg_glucose_level ? <p className="text-xs text-rose-600">{form.formState.errors.avg_glucose_level.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Peso</Label>
              <Input id="weight" type="number" min={20} max={300} step="0.1" {...form.register('weight', { valueAsNumber: true })} />
              {form.formState.errors.weight ? <p className="text-xs text-rose-600">{form.formState.errors.weight.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Talla</Label>
              <Input id="height" type="number" min={100} max={230} step="0.1" {...form.register('height', { valueAsNumber: true })} />
              {form.formState.errors.height ? <p className="text-xs text-rose-600">{form.formState.errors.height.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bmi">BMI calculado</Label>
              <Input id="bmi" type="number" readOnly className="bg-slate-50 font-semibold text-slate-900" {...form.register('bmi', { valueAsNumber: true })} />
              <p className="text-xs text-slate-500">Se actualiza automáticamente al modificar peso o talla. El backend recalcula este valor; el que se muestra aquí es solo referencial.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={Wind} title="Hábitos" description="Comportamientos incluidos en el perfil del modelo">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2 md:col-span-2 xl:col-span-2">
              <Label htmlFor="smoking_status">Estado de fumador</Label>
              <Select id="smoking_status" {...form.register('smoking_status')}>
                <option value="never_smoked">Nunca fumó</option>
                <option value="formerly_smoked">Exfumador</option>
                <option value="smokes">Fumador actual</option>
                <option value="unknown">Desconocido</option>
              </Select>
              {form.formState.errors.smoking_status ? <p className="text-xs text-rose-600">{form.formState.errors.smoking_status.message}</p> : null}
            </div>
          </div>
        </SectionCard>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Button type="submit" className="rounded-2xl px-6 py-6 text-base font-semibold shadow-[0_16px_40px_rgba(2,132,199,0.28)]" disabled={isEvaluating || patients.length === 0}>
              {isEvaluating ? 'Evaluando…' : 'Predecir riesgo'}
            </Button>
            {submitError ? <p className="max-w-md text-sm text-rose-600">{submitError}</p> : null}
          </div>

          <Card className={cn('w-full border-slate-200 bg-gradient-to-br shadow-[0_18px_60px_rgba(15,23,42,0.05)] lg:max-w-[520px]', result ? (result.prediction_class === 1 ? 'from-rose-600 via-rose-700 to-slate-900 text-white' : 'from-emerald-600 via-emerald-700 to-slate-900 text-white') : 'from-slate-50 via-white to-sky-50')}>
            <CardHeader>
              <CardDescription className={cn(result ? 'text-white/80' : 'text-slate-500')}>Resultado de predicción</CardDescription>
              <CardTitle className={cn('text-2xl', result ? 'text-white' : 'text-slate-900')}>
                {isEvaluating ? 'Evaluando…' : 'Riesgo de ACV'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEvaluating ? (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-6 text-sm leading-6 text-slate-600">
                  Calculando la predicción con el modelo real. Esto puede tomar unos segundos…
                </div>
              ) : result ? (
                <>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className={cn('text-sm', result ? 'text-white/80' : 'text-slate-500')}>Probabilidad del modelo</p>
                      <p className={cn('text-5xl font-semibold tracking-tight', result ? 'text-white' : 'text-slate-900')}>
                        {result.prediction_probability !== null ? `${(result.prediction_probability * 100).toFixed(2)}%` : 'N/D'}
                      </p>
                    </div>
                    <Badge variant={result.prediction_class === 1 ? 'destructive' : 'outline'} className={cn('rounded-full px-3 py-1 text-sm', 'border-white/20 bg-white/15 text-white')}>
                      {result.prediction_class === 1 ? 'Riesgo de ACV' : 'Sin riesgo de ACV'}
                    </Badge>
                  </div>
                  {result.prediction_probability !== null ? (
                    <div className="h-3 w-full overflow-hidden rounded-full bg-white/15">
                      <div className="h-full rounded-full bg-white/70" style={{ width: `${result.prediction_probability * 100}%` }} />
                    </div>
                  ) : null}
                  <p className="text-sm leading-6 text-white/80">Modelo: {result.model_name}</p>
                </>
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-6 text-sm leading-6 text-slate-600">
                  Completa la evaluación y presiona <span className="font-semibold text-slate-900">Predecir riesgo</span> para obtener el resultado real del modelo.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
