import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, Pencil, Search, Trash2, UserPlus } from 'lucide-react'
import { ApiError } from '@/lib/api-client'
import type { Patient, PatientInput } from '@/features/patients/api'
import { useCreatePatient, useDeletePatient, usePatients, useUpdatePatient } from '@/features/patients/hooks'

const patientSchema = z.object({
  nombres: z.string().min(2, 'Ingresa al menos 2 caracteres'),
  apellidos: z.string().min(2, 'Ingresa al menos 2 caracteres'),
  dni: z.string().min(8, 'El DNI debe tener al menos 8 dígitos').max(12, 'El DNI es demasiado largo'),
  sexo: z.enum(['masculino', 'femenino', 'otro'], { message: 'Selecciona un sexo' }),
  fechaNacimiento: z.string().min(1, 'Selecciona la fecha de nacimiento'),
  telefono: z.string().min(6, 'Ingresa un teléfono válido'),
  correo: z.string().email('Ingresa un correo válido'),
  direccion: z.string().min(5, 'Ingresa una dirección válida'),
})

type PatientFormValues = z.infer<typeof patientSchema>

type DialogMode = 'create' | 'edit' | 'detail'

const emptyFormValues: PatientFormValues = {
  nombres: '',
  apellidos: '',
  dni: '',
  sexo: 'masculino',
  fechaNacimiento: '',
  telefono: '',
  correo: '',
  direccion: '',
}

const fieldWrapper = 'space-y-2'
const errorClass = 'text-xs text-rose-600'

function formatFullName(patient: Patient) {
  return `${patient.nombres} ${patient.apellidos}`
}

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

function getStatusTone(index: number) {
  return index % 3 === 0 ? 'destructive' : index % 3 === 1 ? 'secondary' : 'outline'
}

function toPatientInput(values: PatientFormValues): PatientInput {
  return {
    nombres: values.nombres,
    apellidos: values.apellidos,
    dni: values.dni,
    sexo: values.sexo,
    fecha_nacimiento: values.fechaNacimiento,
    telefono: values.telefono,
    correo: values.correo,
    direccion: values.direccion,
  }
}

function toFormValues(patient: Patient): PatientFormValues {
  return {
    nombres: patient.nombres,
    apellidos: patient.apellidos,
    dni: patient.dni,
    sexo: patient.sexo,
    fechaNacimiento: patient.fecha_nacimiento,
    telefono: patient.telefono,
    correo: patient.correo,
    direccion: patient.direccion,
  }
}

function PatientFormFields({ controlIdPrefix, register, errors }: { controlIdPrefix: string; register: ReturnType<typeof useForm<PatientFormValues>>['register']; errors: ReturnType<typeof useForm<PatientFormValues>>['formState']['errors'] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className={fieldWrapper}>
        <Label htmlFor={`${controlIdPrefix}-nombres`}>Nombres</Label>
        <Input id={`${controlIdPrefix}-nombres`} placeholder="Nombres del paciente" {...register('nombres')} />
        {errors.nombres ? <p className={errorClass}>{errors.nombres.message}</p> : null}
      </div>
      <div className={fieldWrapper}>
        <Label htmlFor={`${controlIdPrefix}-apellidos`}>Apellidos</Label>
        <Input id={`${controlIdPrefix}-apellidos`} placeholder="Apellidos del paciente" {...register('apellidos')} />
        {errors.apellidos ? <p className={errorClass}>{errors.apellidos.message}</p> : null}
      </div>
      <div className={fieldWrapper}>
        <Label htmlFor={`${controlIdPrefix}-dni`}>DNI</Label>
        <Input id={`${controlIdPrefix}-dni`} inputMode="numeric" placeholder="Documento de identidad" {...register('dni')} />
        {errors.dni ? <p className={errorClass}>{errors.dni.message}</p> : null}
      </div>
      <div className={fieldWrapper}>
        <Label htmlFor={`${controlIdPrefix}-sexo`}>Sexo</Label>
        <Select id={`${controlIdPrefix}-sexo`} {...register('sexo')}>
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
          <option value="otro">Otro</option>
        </Select>
        {errors.sexo ? <p className={errorClass}>{errors.sexo.message}</p> : null}
      </div>
      <div className={fieldWrapper}>
        <Label htmlFor={`${controlIdPrefix}-fechaNacimiento`}>Fecha de nacimiento</Label>
        <Input id={`${controlIdPrefix}-fechaNacimiento`} type="date" {...register('fechaNacimiento')} />
        {errors.fechaNacimiento ? <p className={errorClass}>{errors.fechaNacimiento.message}</p> : null}
      </div>
      <div className={fieldWrapper}>
        <Label htmlFor={`${controlIdPrefix}-telefono`}>Teléfono</Label>
        <Input id={`${controlIdPrefix}-telefono`} placeholder="Teléfono de contacto" {...register('telefono')} />
        {errors.telefono ? <p className={errorClass}>{errors.telefono.message}</p> : null}
      </div>
      <div className={fieldWrapper}>
        <Label htmlFor={`${controlIdPrefix}-correo`}>Correo</Label>
        <Input id={`${controlIdPrefix}-correo`} type="email" placeholder="correo@dominio.com" {...register('correo')} />
        {errors.correo ? <p className={errorClass}>{errors.correo.message}</p> : null}
      </div>
      <div className={fieldWrapper}>
        <Label htmlFor={`${controlIdPrefix}-direccion`}>Dirección</Label>
        <Input id={`${controlIdPrefix}-direccion`} placeholder="Dirección domiciliaria" {...register('direccion')} />
        {errors.direccion ? <p className={errorClass}>{errors.direccion.message}</p> : null}
      </div>
    </div>
  )
}

export function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<DialogMode>('create')
  const [activePatient, setActivePatient] = useState<Patient | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const patientsQuery = usePatients(searchTerm)
  const createPatientMutation = useCreatePatient()
  const updatePatientMutation = useUpdatePatient()
  const deletePatientMutation = useDeletePatient()

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: emptyFormValues,
  })

  const patients = patientsQuery.data ?? []
  const isSubmitting = createPatientMutation.isPending || updatePatientMutation.isPending

  const openCreateDialog = () => {
    setDialogMode('create')
    setActivePatient(null)
    setFormError(null)
    form.reset(emptyFormValues)
    setDialogOpen(true)
  }

  const openEditDialog = (patient: Patient) => {
    setDialogMode('edit')
    setActivePatient(patient)
    setFormError(null)
    form.reset(toFormValues(patient))
    setDialogOpen(true)
  }

  const openDetailDialog = (patient: Patient) => {
    setDialogMode('detail')
    setActivePatient(patient)
    setFormError(null)
    setDialogOpen(true)
  }

  const handleDelete = (patientId: string) => {
    deletePatientMutation.mutate(patientId, {
      onSuccess: () => {
        if (activePatient?.id === patientId) {
          setDialogOpen(false)
          setActivePatient(null)
        }
      },
    })
  }

  const handleSubmit = async (values: PatientFormValues) => {
    setFormError(null)
    const payload = toPatientInput(values)

    try {
      if (dialogMode === 'create') {
        await createPatientMutation.mutateAsync(payload)
      }

      if (dialogMode === 'edit' && activePatient) {
        await updatePatientMutation.mutateAsync({ id: activePatient.id, data: payload })
      }

      setDialogOpen(false)
      setActivePatient(null)
      form.reset(emptyFormValues)
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        form.setError('dni', { message: error.message })
        return
      }
      setFormError(error instanceof Error ? error.message : 'Ocurrió un error inesperado.')
    }
  }

  const dialogTitle = dialogMode === 'create' ? 'Nuevo paciente' : dialogMode === 'edit' ? 'Editar paciente' : 'Detalle del paciente'
  const dialogDescription =
    dialogMode === 'create'
      ? 'Registra un nuevo paciente dentro del sistema hospitalario.'
      : dialogMode === 'edit'
        ? 'Actualiza la información demográfica y de contacto del paciente.'
        : 'Consulta el resumen del paciente.'

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
        <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-slate-50">
          <CardDescription>Gestión asistencial</CardDescription>
          <CardTitle className="text-2xl">Pacientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-500">Tabla con acciones rápidas para visualizar, editar o eliminar pacientes.</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">Datos persistidos en base de datos</p>
            </div>
            <Button type="button" className="rounded-2xl px-5" onClick={openCreateDialog}>
              <UserPlus className="h-4 w-4" />
              Nuevo paciente
            </Button>
          </div>

          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-11"
              placeholder="Buscar por nombre, apellido o DNI"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Sexo</TableHead>
                <TableHead>Fecha nacimiento</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-500">
                    Cargando pacientes…
                  </TableCell>
                </TableRow>
              ) : patientsQuery.isError ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-rose-600">
                    {patientsQuery.error instanceof Error ? patientsQuery.error.message : 'No se pudo cargar la lista de pacientes.'}
                  </TableCell>
                </TableRow>
              ) : patients.length > 0 ? (
                patients.map((patient, index) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900">{formatFullName(patient)}</p>
                        <p className="text-xs text-slate-500">{patient.telefono}</p>
                      </div>
                    </TableCell>
                    <TableCell>{patient.dni}</TableCell>
                    <TableCell>{patient.sexo}</TableCell>
                    <TableCell>{formatDisplayDate(patient.fecha_nacimiento)}</TableCell>
                    <TableCell>{patient.correo}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusTone(index)}>Activo</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => openDetailDialog(patient)}>
                          <Eye className="h-4 w-4" />
                          Ver detalle
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => openEditDialog(patient)}>
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={deletePatientMutation.isPending}
                          onClick={() => handleDelete(patient.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-500">
                    No hay pacientes que coincidan con la búsqueda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>

          <DialogBody>
            {dialogMode === 'detail' && activePatient ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['Nombres', activePatient.nombres],
                  ['Apellidos', activePatient.apellidos],
                  ['DNI', activePatient.dni],
                  ['Sexo', activePatient.sexo],
                  ['Fecha de nacimiento', formatDisplayDate(activePatient.fecha_nacimiento)],
                  ['Teléfono', activePatient.telefono],
                  ['Correo', activePatient.correo],
                  ['Dirección', activePatient.direccion],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <form id="patient-form" className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
                <PatientFormFields controlIdPrefix="patient" register={form.register} errors={form.formState.errors} />
                {formError ? <p className={errorClass}>{formError}</p> : null}
              </form>
            )}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              {dialogMode === 'detail' ? 'Cerrar' : 'Cancelar'}
            </Button>
            {dialogMode !== 'detail' ? (
              <Button type="submit" form="patient-form" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando…' : dialogMode === 'create' ? 'Guardar paciente' : 'Actualizar paciente'}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
