'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Users, 
  Calendar, 
  FolderOpen, 
  DollarSign, 
  Bot, 
  BarChart3,
  Menu,
  X,
  Home,
  LogOut,
  User,
  Settings,
  Shield,
  Lock,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeSelector } from '@/components/ThemeSelector'
import { PaqueteXenova } from '@/lib/paquetes'
import { MODULOS_ERP, getInfoModuloBloqueado, ModuloERP } from '@/lib/restricciones'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Mapeo de iconos para los módulos
const iconMap: Record<string, any> = {
  dashboard: Home,
  expedientes: FileText,
  clientes: Users,
  calendario: Calendar,
  documentos: FolderOpen,
  facturacion: DollarSign,
  'ia-legal': Bot,
  reportes: BarChart3,
  configuracion: Settings
}

export default function Navigation() {
  const { data: session } = useSession()
  const { theme } = useTheme()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // TODO: Obtener el paquete del estudio del usuario desde la sesión o API
  // Por ahora usamos valores de ejemplo
  const estudioActual = {
    paquete: 'PRO' as PaqueteXenova, // Cambiar a BASE para ver módulos bloqueados
    iaLegalActivo: true // Cambiar a false para bloquear IA Legal
  }

  // Filtrar módulos según el rol (admin)
  const isAdmin = session?.user?.email === 'admin@xenovalaw.com' // Cambiar según tu lógica
  
  // Agregar módulo de administración si es admin
  const modulosConAdmin = [...MODULOS_ERP]
  if (isAdmin) {
    modulosConAdmin.push({
      id: 'admin',
      nombre: 'Administración',
      ruta: '/admin',
      descripcion: 'Panel de administrador',
      paqueteMinimo: 'BASE'
    })
  }

  const navigationModulos = modulosConAdmin

  // Función para obtener el color del módulo en tema colorido
  const getModuleColorClass = (href: string) => {
    if (theme !== 'colorful') return 'text-gray-500 group-hover:text-blue-500'
    
    const colorMap: Record<string, string> = {
      '/expedientes': 'text-blue-600',
      '/clientes': 'text-green-600',
      '/calendario': 'text-red-600',
      '/documentos': 'text-purple-600',
      '/facturacion': 'text-amber-600',
      '/ia-legal': 'text-cyan-600',
      '/reportes': 'text-indigo-600',
      '/admin': 'text-purple-700',
      '/configuracion': 'text-gray-600',
      '/': 'text-blue-600'
    }
    
    return colorMap[href] || 'text-gray-500'
  }

  // Función para obtener clase de fondo activo en tema colorido
  const getActiveColorClass = (href: string) => {
    if (theme !== 'colorful') return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    
    const colorMap: Record<string, string> = {
      '/expedientes': 'bg-blue-500 text-white font-semibold shadow-lg shadow-blue-200',
      '/clientes': 'bg-green-500 text-white font-semibold shadow-lg shadow-green-200',
      '/calendario': 'bg-red-500 text-white font-semibold shadow-lg shadow-red-200',
      '/documentos': 'bg-purple-500 text-white font-semibold shadow-lg shadow-purple-200',
      '/facturacion': 'bg-amber-500 text-white font-semibold shadow-lg shadow-amber-200',
      '/ia-legal': 'bg-cyan-500 text-white font-semibold shadow-lg shadow-cyan-200',
      '/reportes': 'bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-200',
      '/admin': 'bg-purple-600 text-white font-semibold shadow-lg shadow-purple-200',
      '/configuracion': 'bg-gray-500 text-white font-semibold',
      '/': 'bg-blue-500 text-white font-semibold shadow-lg shadow-blue-200'
    }
    
    return colorMap[href] || 'bg-blue-500 text-white font-semibold'
  }

  // Función para obtener clase de hover
  const getHoverColorClass = (href: string) => {
    if (theme !== 'colorful') return 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
    
    const colorMap: Record<string, string> = {
      '/expedientes': 'text-foreground hover:bg-blue-100 hover:text-blue-700 hover:border-l-4 hover:border-blue-500',
      '/clientes': 'text-foreground hover:bg-green-100 hover:text-green-700 hover:border-l-4 hover:border-green-500',
      '/calendario': 'text-foreground hover:bg-red-100 hover:text-red-700 hover:border-l-4 hover:border-red-500',
      '/documentos': 'text-foreground hover:bg-purple-100 hover:text-purple-700 hover:border-l-4 hover:border-purple-500',
      '/facturacion': 'text-foreground hover:bg-amber-100 hover:text-amber-700 hover:border-l-4 hover:border-amber-500',
      '/ia-legal': 'text-foreground hover:bg-cyan-100 hover:text-cyan-700 hover:border-l-4 hover:border-cyan-500',
      '/reportes': 'text-foreground hover:bg-indigo-100 hover:text-indigo-700 hover:border-l-4 hover:border-indigo-500',
      '/admin': 'text-foreground hover:bg-purple-100 hover:text-purple-700 hover:border-l-4 hover:border-purple-500',
      '/configuracion': 'text-foreground hover:bg-gray-100 hover:text-gray-700',
      '/': 'text-foreground hover:bg-blue-100 hover:text-blue-700 hover:border-l-4 hover:border-blue-500'
    }
    
    return colorMap[href] || 'text-foreground hover:bg-gray-100'
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="hidden lg:block">
                  <h1 className="text-lg font-bold text-foreground">XenovaLaw</h1>
                  <p className="text-xs text-muted-foreground">Gestión Legal Integral</p>
                </div>
              </Link>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:ml-6 md:flex md:space-x-1">
              <TooltipProvider>
                {navigationModulos.map((modulo) => {
                  const isActive = pathname === modulo.ruta || 
                    (modulo.ruta !== '/' && pathname.startsWith(modulo.ruta))
                  
                  const Icon = iconMap[modulo.id] || FileText
                  const infoBloqueado = getInfoModuloBloqueado(modulo, estudioActual)
                  const bloqueado = infoBloqueado.bloqueado

                  const navItem = (
                    <Link
                      key={modulo.id}
                      href={bloqueado ? '#' : modulo.ruta}
                      onClick={(e) => bloqueado && e.preventDefault()}
                      className={cn(
                        'px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 group',
                        bloqueado && 'opacity-50 cursor-not-allowed',
                        !bloqueado && isActive
                          ? getActiveColorClass(modulo.ruta)
                          : getHoverColorClass(modulo.ruta)
                      )}
                    >
                      <Icon className={cn(
                        'h-4 w-4 transition-all',
                        bloqueado && 'text-gray-400',
                        !bloqueado && isActive && theme === 'colorful' ? 'text-white' : getModuleColorClass(modulo.ruta)
                      )} />
                      <span>{modulo.nombre}</span>
                      {bloqueado && <Lock className="h-3 w-3 text-gray-400" />}
                      {infoBloqueado.paqueteRequerido && (
                        <Badge variant="outline" className="text-xs ml-1">
                          {infoBloqueado.paqueteRequerido}
                        </Badge>
                      )}
                    </Link>
                  )

                  if (bloqueado && infoBloqueado.mensajeUpgrade) {
                    return (
                      <Tooltip key={modulo.id}>
                        <TooltipTrigger asChild>
                          {navItem}
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-semibold flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              Módulo no disponible
                            </p>
                            <p className="text-xs">{infoBloqueado.motivo}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-2">
                              <TrendingUp className="h-3 w-3" />
                              {infoBloqueado.mensajeUpgrade}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return navItem
                })}
              </TooltipProvider>
            </div>
          </div>

          {/* Right side */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-3">
            {session && (
              <>
                {/* Theme Selector */}
                <ThemeSelector />

                {/* Configuration Button */}
                <Link href="/configuracion">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      'p-2',
                      pathname === '/configuracion' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-blue-600'
                    )}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>

                <div className="text-sm text-foreground hidden lg:block">
                  <span className="font-medium">{session.user?.name}</span>
                  <div className="text-xs text-muted-foreground">{session.user?.email}</div>
                </div>
                
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Salir
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-muted transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border bg-card">
            {navigationModulos.map((modulo) => {
              const isActive = pathname === modulo.ruta || 
                (modulo.ruta !== '/' && pathname.startsWith(modulo.ruta))
              
              const Icon = iconMap[modulo.id] || FileText
              const infoBloqueado = getInfoModuloBloqueado(modulo, estudioActual)
              const bloqueado = infoBloqueado.bloqueado

              return (
                <Link
                  key={modulo.id}
                  href={bloqueado ? '#' : modulo.ruta}
                  onClick={(e) => {
                    if (bloqueado) {
                      e.preventDefault()
                    } else {
                      setIsMobileMenuOpen(false)
                    }
                  }}
                  className={cn(
                    'block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-3 transition-all',
                    bloqueado && 'opacity-50 cursor-not-allowed',
                    !bloqueado && isActive
                      ? getActiveColorClass(modulo.ruta)
                      : getHoverColorClass(modulo.ruta)
                  )}
                >
                  <Icon className={cn(
                    'h-5 w-5 transition-all',
                    bloqueado && 'text-gray-400',
                    !bloqueado && isActive && theme === 'colorful' ? 'text-white' : getModuleColorClass(modulo.ruta)
                  )} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{modulo.nombre}</span>
                      {bloqueado && <Lock className="h-3 w-3 text-gray-400" />}
                      {infoBloqueado.paqueteRequerido && (
                        <Badge variant="outline" className="text-xs">
                          {infoBloqueado.paqueteRequerido}
                        </Badge>
                      )}
                    </div>
                    <div className={cn(
                      "text-xs",
                      bloqueado ? "text-gray-400" : "text-muted-foreground"
                    )}>
                      {bloqueado ? infoBloqueado.motivo : modulo.descripcion}
                    </div>
                  </div>
                </Link>
              )
            })}
            
            {session && (
              <div className="border-t border-border pt-4 mt-4">
                <div className="px-3 py-2">
                  <div className="text-sm font-medium text-foreground">{session.user?.name}</div>
                  <div className="text-xs text-muted-foreground">{session.user?.email}</div>
                </div>
                
                <Link
                  href="/configuracion"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-white rounded-md flex items-center space-x-3"
                >
                  <Settings className="h-5 w-5" />
                  <span>Configuración</span>
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-white rounded-md flex items-center space-x-3"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
