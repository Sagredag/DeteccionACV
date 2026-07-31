import { ArrowUpRight, CalendarRange, ClipboardList, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardStats, recentEvaluations } from '@/lib/mock-data'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <Card className="overflow-hidden border-slate-200 bg-gradient-to-br from-sky-600 via-sky-700 to-slate-900 text-white shadow-[0_24px_70px_rgba(2,132,199,0.26)]">
          <CardHeader className="relative z-10 pb-4">
            <Badge variant="outline" className="w-fit border-white/20 bg-white/10 text-white">
              Unidad de ictus
            </Badge>
            <CardTitle className="text-3xl text-white">Dashboard clínico</CardTitle>
            <CardDescription className="max-w-2xl text-sky-100">
              Vista ejecutiva para seguimiento de pacientes, evaluaciones y riesgo estimado. Todo el contenido es simulado y está listo para conectar con el backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-sky-100">{item.label}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <span className="text-3xl font-semibold tracking-tight text-white">{item.value}</span>
                  <span className="text-xs text-sky-100/80">{item.delta}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardDescription>Resumen operativo</CardDescription>
              <CardTitle className="text-xl">Actividad reciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { icon: ClipboardList, label: 'Evaluaciones hoy', value: '18' },
                { icon: CalendarRange, label: 'Seguimientos programados', value: '24' },
                { icon: TrendingUp, label: 'Tasa de detección', value: '87%' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-500">{item.label}</p>
                      <p className="text-lg font-semibold text-slate-900">{item.value}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardDescription>Gráfico simulado</CardDescription>
              <CardTitle className="text-xl">Tendencia de riesgo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-56 items-end gap-3 rounded-3xl border border-dashed border-slate-200 bg-gradient-to-b from-sky-50 to-slate-50 p-4">
                {[38, 56, 64, 44, 78, 52, 90].map((height, index) => (
                  <div key={index} className="flex-1 rounded-t-2xl bg-gradient-to-t from-sky-500 to-sky-300 shadow-[0_8px_30px_rgba(14,165,233,0.2)]" style={{ height: `${height}%` }} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardDescription>Operación clínica</CardDescription>
            <CardTitle className="text-xl">Últimas evaluaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Paciente</th>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Riesgo</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {recentEvaluations.map((evaluation) => (
                    <tr key={`${evaluation.patient}-${evaluation.date}`} className="hover:bg-slate-50/80">
                      <td className="px-4 py-4 font-medium text-slate-900">{evaluation.patient}</td>
                      <td className="px-4 py-4 text-slate-600">{evaluation.date}</td>
                      <td className="px-4 py-4">
                        <Badge variant={evaluation.risk === 'Alto' ? 'destructive' : evaluation.risk === 'Moderado' ? 'secondary' : 'outline'}>
                          {evaluation.risk}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{evaluation.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-slate-900 to-sky-900 text-white">
          <CardHeader>
            <CardDescription className="text-sky-100">Panel de supervisión</CardDescription>
            <CardTitle className="text-xl text-white">Flujo preparado para producción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-sky-100">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">La estructura visual ya separa navegación, contenido y futuras integraciones con backend.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Cada módulo usa datos simulados y puede reemplazarse por consultas reales sin reescribir el layout.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Las rutas están listas para enlazar autenticación, pacientes y evaluaciones en fases posteriores.</div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}