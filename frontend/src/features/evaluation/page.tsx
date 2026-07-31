import { type ElementType, type ReactNode, useEffect, useMemo, useState } from 'react'
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

type SimulatedPatient = {
  id: number
  name: string
  age: number
  document: string
  followUp: string
}

type PredictionResult = {
  score: number
  level: 'Bajo' | 'Moderado' | 'Alto'
  interpretation: string
}

const simulatedPatients: SimulatedPatient[] = [
  { id: 1, name: 'María Fernández', age: 68, document: '74291836', followUp: 'Control neurológico activo' },
  { id: 2, name: 'José Ramírez', age: 57, document: '40192874', followUp: 'Seguimiento mensual' },
  { id: 3, name: 'Ana Torres', age: 44, document: '53817290', followUp: 'Primera evaluación' },
]

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

function clampScore(score: number) {
  return Math.max(0.02, Math.min(0.98, score))
}

function calculateBmi(weight: number, height: number) {
  const heightInMeters = height / 100

  if (!weight || !heightInMeters) {
    return 0
  }

  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1))
}

function getPrediction(age: number, hypertension: boolean, heartDisease: boolean, everMarried: boolean, glucose: number, bmi: number, smokingStatus: EvaluationFormValues['smoking_status']) {
  let score = 0.08

  score += Math.max(0, Math.min(0.22, (age - 18) / 100))
  score += hypertension ? 0.16 : 0
  score += heartDisease ? 0.18 : 0
  score += everMarried ? 0.05 : 0
  score += glucose >= 160 ? 0.12 : glucose >= 120 ? 0.08 : 0.03
  score += bmi >= 30 ? 0.11 : bmi >= 25 ? 0.06 : 0.02
  score += smokingStatus === 'smokes' ? 0.11 : smokingStatus === 'formerly_smoked' ? 0.06 : 0.01

  const normalized = clampScore(score)

  if (normalized < 0.34) {
    return {
      score: normalized,
      level: 'Bajo' as const,
      interpretation: 'El perfil clínico simulado sugiere un riesgo bajo. Mantener vigilancia preventiva y seguimiento periódico.',
    }
  }

  if (normalized < 0.67) {
    return {
      score: normalized,
      level: 'Moderado' as const,
      interpretation: 'Se observa un riesgo intermedio. Conviene reforzar control metabólico, tensión arterial y hábitos cardiovasculares.',
    }
  }

  return {
    score: normalized,
    level: 'Alto' as const,
    interpretation: 'El resultado simulado muestra un riesgo elevado. Requiere evaluación clínica prioritaria y seguimiento estrecho.',
  }
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

export function EvaluationPage() {
  const [selectedPatientId, setSelectedPatientId] = useState(1)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)

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

  const selectedPatient = useMemo(() => simulatedPatients.find((patient) => patient.id === selectedPatientId) ?? simulatedPatients[0], [selectedPatientId])

  const handlePredict = (values: EvaluationFormValues) => {
    const result = getPrediction(
      values.age,
      values.hypertension,
      values.heart_disease,
      values.ever_married === 'yes',
      values.avg_glucose_level,
      values.bmi,
      values.smoking_status,
    )

    setPrediction(result)
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
        <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-slate-50">
          <CardDescription>Flujo clínico</CardDescription>
          <CardTitle className="text-2xl">Nueva evaluación</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Paciente seleccionado</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{selectedPatient.name}</h3>
                <p className="text-sm text-slate-500">DNI {selectedPatient.document} · {selectedPatient.age} años · {selectedPatient.followUp}</p>
              </div>
              <div className="min-w-72">
                <Label htmlFor="patient-selector">Cambiar paciente simulado</Label>
                <Select id="patient-selector" value={selectedPatientId.toString()} onChange={(event) => setSelectedPatientId(Number(event.target.value))} className="mt-2">
                  {simulatedPatients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {[
              { label: 'Variables activas', value: '10', icon: Activity },
              { label: 'Estado', value: 'Simulado', icon: ShieldAlert },
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Sexo</Label>
              <Select id="gender" {...form.register('gender')}>
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
                <option value="otro">Otro</option>
              </Select>
              {form.formState.errors.gender ? <p className="text-xs text-rose-600">{form.formState.errors.gender.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Edad</Label>
              <Input id="age" type="number" min={18} max={120} {...form.register('age', { valueAsNumber: true })} />
              {form.formState.errors.age ? <p className="text-xs text-rose-600">{form.formState.errors.age.message}</p> : null}
            </div>
          </div>
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
              <p className="text-xs text-slate-500">Se actualiza automáticamente al modificar peso o talla.</p>
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
          <Button type="submit" className="rounded-2xl px-6 py-6 text-base font-semibold shadow-[0_16px_40px_rgba(2,132,199,0.28)]">
            Predecir riesgo
          </Button>

          <Card className={cn('w-full border-slate-200 bg-gradient-to-br shadow-[0_18px_60px_rgba(15,23,42,0.05)] lg:max-w-[520px]', prediction ? 'from-sky-600 via-sky-700 to-slate-900 text-white' : 'from-slate-50 via-white to-sky-50')}>
            <CardHeader>
              <CardDescription className={cn(prediction ? 'text-sky-100' : 'text-slate-500')}>Resultado de predicción</CardDescription>
              <CardTitle className={cn('text-2xl', prediction ? 'text-white' : 'text-slate-900')}>Riesgo simulado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {prediction ? (
                <>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className={cn('text-sm', prediction ? 'text-sky-100' : 'text-slate-500')}>Porcentaje de riesgo</p>
                      <p className={cn('text-5xl font-semibold tracking-tight', prediction ? 'text-white' : 'text-slate-900')}>
                        {(prediction.score * 100).toFixed(1)}%
                      </p>
                    </div>
                    <Badge variant={prediction.level === 'Alto' ? 'destructive' : prediction.level === 'Moderado' ? 'secondary' : 'outline'} className={cn('rounded-full px-3 py-1 text-sm', prediction ? 'border-white/20 bg-white/15 text-white' : '')}>
                      {prediction.level}
                    </Badge>
                  </div>
                  <div className={cn('h-3 w-full overflow-hidden rounded-full', prediction ? 'bg-white/15' : 'bg-slate-200')}>
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500" style={{ width: `${prediction.score * 100}%` }} />
                  </div>
                  <p className={cn('text-sm leading-6', prediction ? 'text-sky-100' : 'text-slate-600')}>
                    {prediction.interpretation}
                  </p>
                </>
              ) : (
                <div className={cn('rounded-[24px] border border-dashed p-6 text-sm leading-6', prediction ? 'border-white/15 bg-white/5 text-sky-100' : 'border-slate-200 bg-white text-slate-600')}>
                  Completa la evaluación y presiona <span className="font-semibold text-slate-900">Predecir riesgo</span> para mostrar un resultado clínico simulado.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}