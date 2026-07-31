import { useMemo, useState } from 'react'
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

type PatientRecord = PatientFormValues & {
  id: number
}

type DialogMode = 'create' | 'edit' | 'detail'

const initialPatients: PatientRecord[] = [
  {
    id: 1,
    nombres: 'María Elena',
    apellidos: 'Fernández Ruiz',
    dni: '74291836',
    sexo: 'femenino',
    fechaNacimiento: '1968-04-12',
    telefono: '+51 987 654 321',
    correo: 'maria.fernandez@hospital.com',
    direccion: 'Av. Los Álamos 154, Lima',
  },
  {
    id: 2,
    nombres: 'José Luis',
    apellidos: 'Ramírez Salas',
    dni: '40192874',
    sexo: 'masculino',
    fechaNacimiento: '1979-08-23',
    telefono: '+51 912 345 678',
    correo: 'jose.ramirez@hospital.com',
    direccion: 'Jr. Santa Rosa 223, Callao',
  },
  {
    id: 3,
    nombres: 'Ana Paula',
    apellidos: 'Torres Medina',
    dni: '53817290',
    sexo: 'femenino',
    fechaNacimiento: '1987-02-05',
    telefono: '+51 955 123 987',
    correo: 'ana.torres@hospital.com',
    direccion: 'Calle San Martín 311, Arequipa',
  },
]

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

function formatFullName(patient: PatientRecord) {
  return `${patient.nombres} ${patient.apellidos}`
}

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

function getStatusTone(index: number) {
  return index % 3 === 0 ? 'destructive' : index % 3 === 1 ? 'secondary' : 'outline'
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
  const [patients, setPatients] = useState<PatientRecord[]>(initialPatients)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<DialogMode>('create')
  const [activePatient, setActivePatient] = useState<PatientRecord | null>(null)

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: emptyFormValues,
  })

  const filteredPatients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return patients.filter((patient) => {
      const fullName = formatFullName(patient).toLowerCase()
      return fullName.includes(normalizedSearch)
    })
  }, [patients, searchTerm])

  const openCreateDialog = () => {
    setDialogMode('create')
    setActivePatient(null)
    form.reset(emptyFormValues)
    setDialogOpen(true)
  }

  const openEditDialog = (patient: PatientRecord) => {
    setDialogMode('edit')
    setActivePatient(patient)
    form.reset({
      nombres: patient.nombres,
      apellidos: patient.apellidos,
      dni: patient.dni,
      sexo: patient.sexo,
      fechaNacimiento: patient.fechaNacimiento,
      telefono: patient.telefono,
      correo: patient.correo,
      direccion: patient.direccion,
    })
    setDialogOpen(true)
  }

  const openDetailDialog = (patient: PatientRecord) => {
    setDialogMode('detail')
    setActivePatient(patient)
    setDialogOpen(true)
  }

  const handleDelete = (patientId: number) => {
    setPatients((currentPatients) => currentPatients.filter((patient) => patient.id !== patientId))
    if (activePatient?.id === patientId) {
      setDialogOpen(false)
      setActivePatient(null)
    }
  }

  const handleSubmit = (values: PatientFormValues) => {
    if (dialogMode === 'create') {
      setPatients((currentPatients) => [
        ...currentPatients,
        {
          id: Date.now(),
          ...values,
        },
      ])
    }

    if (dialogMode === 'edit' && activePatient) {
      setPatients((currentPatients) =>
        currentPatients.map((patient) =>
          patient.id === activePatient.id
            ? {
                ...patient,
                ...values,
              }
            : patient,
        ),
      )
    }

    setDialogOpen(false)
    setActivePatient(null)
    form.reset(emptyFormValues)
  }

  const dialogTitle = dialogMode === 'create' ? 'Nuevo paciente' : dialogMode === 'edit' ? 'Editar paciente' : 'Detalle del paciente'
  const dialogDescription =
    dialogMode === 'create'
      ? 'Registra un nuevo paciente dentro del sistema hospitalario.'
      : dialogMode === 'edit'
        ? 'Actualiza la información demográfica y de contacto del paciente.'
        : 'Consulta el resumen visual del paciente simulado.'

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
              <p className="text-sm text-slate-500">Tabla moderna simulada con acciones rápidas para visualizar, editar o eliminar pacientes.</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">Módulo preparado para conectar backend posteriormente</p>
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
              placeholder="Buscar paciente por nombre"
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
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient, index) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900">{formatFullName(patient)}</p>
                        <p className="text-xs text-slate-500">{patient.telefono}</p>
                      </div>
                    </TableCell>
                    <TableCell>{patient.dni}</TableCell>
                    <TableCell>{patient.sexo}</TableCell>
                    <TableCell>{formatDisplayDate(patient.fechaNacimiento)}</TableCell>
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
                        <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(patient.id)}>
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
                  ['Fecha de nacimiento', formatDisplayDate(activePatient.fechaNacimiento)],
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
              </form>
            )}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              {dialogMode === 'detail' ? 'Cerrar' : 'Cancelar'}
            </Button>
            {dialogMode !== 'detail' ? (
              <Button type="submit" form="patient-form">
                {dialogMode === 'create' ? 'Guardar paciente' : 'Actualizar paciente'}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}