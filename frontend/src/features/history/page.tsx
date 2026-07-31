import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { recentEvaluations } from '@/lib/mock-data'

export function HistoryPage() {
  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardDescription>Seguimiento longitudinal</CardDescription>
          <CardTitle className="text-2xl">Historial de evaluaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentEvaluations.map((evaluation) => (
            <div key={`${evaluation.patient}-${evaluation.date}`} className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <h3 className="font-semibold text-slate-900">{evaluation.patient}</h3>
                <p className="text-sm text-slate-500">{evaluation.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Riesgo</p>
                <p className="font-semibold text-slate-900">{evaluation.risk}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}