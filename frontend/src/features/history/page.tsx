import { useState, type ReactNode } from 'react'
import { Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ApiError } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { useEvaluation, useEvaluations } from '@/features/history/hooks'
import type { EvaluationWithPatient } from '@/features/history/api'

const PAGE_SIZE = 10

const genderLabels: Record<string, string> = {
  masculino: 'Masculino',
  femenino: 'Femenino',
  otro: 'Otro',
}

const everMarriedLabels: Record<string, string> = {
  yes: 'Sí',
  no: 'No',
}

const workTypeLabels: Record<string, string> = {
  private: 'Privado',
  govt_job: 'Empleo gubernamental',
  self_employed: 'Independiente',
  children: 'Niños',
  never_worked: 'Nunca trabajó',
}

const residenceTypeLabels: Record<string, string> = {
  urban: 'Urbana',
  rural: 'Rural',
}

const smokingStatusLabels: Record<string, string> = {
  never_smoked: 'Nunca fumó',
  formerly_smoked: 'Exfumador',
  smokes: 'Fumador actual',
  unknown: 'Desconocido',
}

function formatDisplayDateTime(value: string) {
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function formatPatientName(evaluation: EvaluationWithPatient) {
  return `${evaluation.patient.nombres} ${evaluation.patient.apellidos}`
}

function formatProbability(value: number | null) {
  return value !== null ? `${(value * 100).toFixed(2)}%` : 'N/D'
}

function connectionOrServerMessage(error: unknown) {
  if (error instanceof ApiError) {
    return `Error del servidor: ${error.message}`
  }
  return 'No se pudo conectar con el servidor. Verifica tu conexión.'
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  )
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</h4>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </div>
  )
}

function EvaluationDetailBody({ evaluationId }: { evaluationId: string }) {
  const evaluationQuery = useEvaluation(evaluationId)

  if (evaluationQuery.isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">Cargando evaluación…</p>
  }

  if (evaluationQuery.isError) {
    const error = evaluationQuery.error
    if (error instanceof ApiError && error.status === 404) {
      return <p className="py-8 text-center text-sm text-rose-600">Esta evaluación ya no existe.</p>
    }
    return <p className="py-8 text-center text-sm text-rose-600">{connectionOrServerMessage(error)}</p>
  }

  const evaluation = evaluationQuery.data
  if (!evaluation) return null

  return (
    <div className="space-y-6">
      <DetailSection title="Datos del paciente">
        <DetailField label="Nombre" value={`${evaluation.patient.nombres} ${evaluation.patient.apellidos}`} />
        <DetailField label="DNI" value={evaluation.patient.dni} />
        <DetailField label="Fecha de la evaluación" value={formatDisplayDateTime(evaluation.created_at)} />
        <DetailField label="Sexo registrado" value={genderLabels[evaluation.gender] ?? evaluation.gender} />
      </DetailSection>

      <DetailSection title="Datos clínicos">
        <DetailField label="Edad" value={`${evaluation.age} años`} />
        <DetailField label="Hipertensión" value={evaluation.hypertension ? 'Sí' : 'No'} />
        <DetailField label="Enfermedad cardíaca" value={evaluation.heart_disease ? 'Sí' : 'No'} />
        <DetailField label="Alguna vez casado" value={everMarriedLabels[evaluation.ever_married] ?? evaluation.ever_married} />
        <DetailField label="Tipo de trabajo" value={workTypeLabels[evaluation.work_type] ?? evaluation.work_type} />
        <DetailField label="Residencia" value={residenceTypeLabels[evaluation.residence_type] ?? evaluation.residence_type} />
      </DetailSection>

      <DetailSection title="Antropometría">
        <DetailField label="Peso" value={`${evaluation.weight} kg`} />
        <DetailField label="Talla" value={`${evaluation.height} cm`} />
        <DetailField label="BMI" value={String(evaluation.bmi)} />
        <DetailField label="Glucosa promedio" value={`${evaluation.avg_glucose_level} mg/dL`} />
      </DetailSection>

      <DetailSection title="Factores de riesgo">
        <DetailField label="Estado de tabaquismo" value={smokingStatusLabels[evaluation.smoking_status] ?? evaluation.smoking_status} />
      </DetailSection>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Resultado predictivo</h4>
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <Badge variant={evaluation.prediction_class === 1 ? 'destructive' : 'outline'} className="rounded-full px-3 py-1 text-sm">
            {evaluation.prediction_class === 1 ? 'Riesgo de ACV' : 'Sin riesgo de ACV'}
          </Badge>
          <p className="text-lg font-semibold text-slate-900">{formatProbability(evaluation.prediction_probability)}</p>
          <p className="text-sm text-slate-500">Modelo: {evaluation.model_name}</p>
        </div>
      </div>
    </div>
  )
}

export function HistoryPage() {
  const [page, setPage] = useState(0)
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const evaluationsQuery = useEvaluations({ limit: PAGE_SIZE, offset: page * PAGE_SIZE })
  const evaluations = evaluationsQuery.data ?? []

  const openDetail = (evaluationId: string) => {
    setSelectedEvaluationId(evaluationId)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
        <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-slate-50">
          <CardDescription>Seguimiento longitudinal</CardDescription>
          <CardTitle className="text-2xl">Historial de evaluaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <p className="text-sm text-slate-500">Evaluaciones almacenadas en la base de datos, con el resultado real del modelo predictivo.</p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Probabilidad</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluationsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-slate-500">
                    Cargando evaluaciones…
                  </TableCell>
                </TableRow>
              ) : evaluationsQuery.isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-rose-600">
                    {connectionOrServerMessage(evaluationsQuery.error)}
                  </TableCell>
                </TableRow>
              ) : evaluations.length > 0 ? (
                evaluations.map((evaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900">{formatPatientName(evaluation)}</p>
                        <p className="text-xs text-slate-500">DNI {evaluation.patient.dni}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDisplayDateTime(evaluation.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={evaluation.prediction_class === 1 ? 'destructive' : 'outline'}>
                        {evaluation.prediction_class === 1 ? 'Riesgo de ACV' : 'Sin riesgo de ACV'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatProbability(evaluation.prediction_probability)}</TableCell>
                    <TableCell>{evaluation.model_name}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button type="button" variant="outline" size="sm" onClick={() => openDetail(evaluation.id)}>
                          <Eye className="h-4 w-4" />
                          Ver detalle
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-slate-500">
                    {page === 0 ? 'No hay evaluaciones registradas todavía.' : 'No hay más evaluaciones que mostrar.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Página {page + 1}</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={evaluations.length < PAGE_SIZE}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={cn('max-w-3xl max-h-[85vh] overflow-y-auto')}>
          <DialogHeader>
            <DialogTitle>Detalle de la evaluación</DialogTitle>
            <DialogDescription>Datos clínicos almacenados y resultado del modelo predictivo.</DialogDescription>
          </DialogHeader>
          <DialogBody>{selectedEvaluationId ? <EvaluationDetailBody evaluationId={selectedEvaluationId} /> : null}</DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
