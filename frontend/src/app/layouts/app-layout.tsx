import { useMemo, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Menu, ChevronLeft, LogOut, Hospital, LayoutDashboard, Users, ClipboardPlus, History, Settings, UserRound } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type NavigationItem = {
  label: string
  href: string
  icon: typeof LayoutDashboard
}

const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Pacientes', href: '/pacientes', icon: Users },
  { label: 'Evaluación', href: '/evaluacion', icon: ClipboardPlus },
  { label: 'Historial', href: '/historial', icon: History },
  { label: 'Usuarios', href: '/usuarios', icon: UserRound },
  { label: 'Configuración', href: '/configuracion', icon: Settings },
]

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pacientes': 'Pacientes',
  '/evaluacion': 'Evaluación',
  '/historial': 'Historial',
  '/usuarios': 'Usuarios',
  '/configuracion': 'Configuración',
}

function formatBreadcrumb(pathname: string) {
  return pathname === '/' ? ['Dashboard'] : pathname.split('/').filter(Boolean).map((segment) => routeLabels[`/${segment}`] ?? segment)
}

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const breadcrumbItems = useMemo(() => formatBreadcrumb(location.pathname), [location.pathname])

  const SidebarContent = (
    <>
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm shadow-sky-200/40">
          <Hospital className="h-5 w-5" />
        </div>
        {!sidebarCollapsed ? (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Hospital Analytics</p>
            <p className="text-xs text-slate-500">Stroke risk platform</p>
          </div>
        ) : null}
      </div>

      <Separator />

      <nav className="flex flex-1 flex-col gap-2 px-3 py-4">
        {navigationItems.map((item) => {
          const active = location.pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-sky-200/40'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                sidebarCollapsed && 'justify-center px-0',
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed ? <span>{item.label}</span> : null}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto p-3">
        <Card className="border-slate-200/80 bg-gradient-to-br from-sky-50 to-white p-4 shadow-sm">
          {!sidebarCollapsed ? (
            <>
              <p className="text-sm font-semibold text-slate-900">Panel clínico</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Espacio listo para conectar el backend y el modelo en fases posteriores.</p>
            </>
          ) : (
            <div className="flex items-center justify-center text-primary">
              <Hospital className="h-5 w-5" />
            </div>
          )}
        </Card>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] bg-white/70 shadow-[0_0_0_1px_rgba(148,163,184,0.18)] backdrop-blur-xl">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white/95 shadow-[8px_0_30px_rgba(15,23,42,0.04)] transition-all duration-300 md:sticky md:translate-x-0',
            sidebarCollapsed ? 'md:w-24' : 'md:w-72',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          )}
        >
          {SidebarContent}
        </aside>

        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Cerrar menú lateral"
            className="fixed inset-0 z-30 bg-slate-950/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm md:hidden"
                onClick={() => setSidebarOpen((value) => !value)}
              >
                <Menu className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hidden h-10 w-10 rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm md:inline-flex"
                onClick={() => setSidebarCollapsed((value) => !value)}
              >
                <ChevronLeft className={cn('h-4 w-4 transition-transform', sidebarCollapsed ? 'rotate-180' : 'rotate-0')} />
              </Button>

              <div className="min-w-0 flex-1 space-y-2">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to="/dashboard">Inicio</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {breadcrumbItems.map((item, index) => (
                      <div key={`${item}-${index}`} className="flex items-center gap-2">
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          {index === breadcrumbItems.length - 1 ? (
                            <BreadcrumbPage>{item}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <Link to="#">{item}</Link>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </div>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">Sistema de monitoreo clínico</h1>
                  <p className="text-sm text-slate-500">Interfaz hospitalaria preparada para conectar pacientes, evaluaciones e historial.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-slate-900">Dra. Laura Gómez</p>
                  <p className="text-xs text-slate-500">Neurología clínica</p>
                </div>
                <Avatar className="h-11 w-11 border border-slate-200 bg-sky-50">
                  <AvatarFallback className="bg-sky-100 text-sky-700">LG</AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" className="hidden rounded-2xl border-slate-200 bg-white text-slate-700 shadow-sm sm:inline-flex">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-sky-50/40 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}