import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/app/layouts/app-layout'
import { DashboardPage } from '@/features/dashboard/page'
import { PatientsPage } from '@/features/patients/page'
import { EvaluationPage } from '@/features/evaluation/page'
import { HistoryPage } from '@/features/history/page'
import { UsersPage } from '@/features/users/page'
import { SettingsPage } from '@/features/settings/page'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pacientes" element={<PatientsPage />} />
        <Route path="/evaluacion" element={<EvaluationPage />} />
        <Route path="/historial" element={<HistoryPage />} />
        <Route path="/usuarios" element={<UsersPage />} />
        <Route path="/configuracion" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}