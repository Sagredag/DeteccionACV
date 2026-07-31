import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardDescription>Preferencias del sistema</CardDescription>
          <CardTitle className="text-2xl">Configuración</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {['Perfil institucional', 'Parámetros visuales', 'Integración futura con backend', 'Auditoría y seguridad']?.map((item) => (
            <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}