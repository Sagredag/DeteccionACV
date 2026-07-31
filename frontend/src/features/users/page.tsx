import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function UsersPage() {
  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardDescription>Administración</CardDescription>
          <CardTitle className="text-2xl">Usuarios</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {['Administrador', 'Médico especialista', 'Enfermería clínica'].map((role) => (
            <div key={role} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Perfil</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{role}</p>
              <p className="mt-3 text-sm text-slate-600">Tarjeta reservada para la gestión de permisos y cuentas de acceso.</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}