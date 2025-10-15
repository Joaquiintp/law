'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  Users, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  PlusCircle,
  Bot,
  TrendingUp,
  Settings,
  Search,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{
    expedientes: Array<{ id: string; numero: string; caratula: string; cliente: { razonSocial: string } }>
    clientes: Array<{ id: string; razonSocial: string; email: string | null; tipoPersona: string }>
  }>({ expedientes: [], clientes: [] })
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Cerrar resultados al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Buscar en tiempo real
  useEffect(() => {
    const searchData = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults({ expedientes: [], clientes: [] })
        setShowResults(false)
        return
      }

      setIsSearching(true)
      setShowResults(true)

      try {
        const [expedientesRes, clientesRes] = await Promise.all([
          fetch(`/api/expedientes?search=${encodeURIComponent(searchQuery)}`),
          fetch(`/api/clientes?search=${encodeURIComponent(searchQuery)}&limit=5`)
        ])

        const expedientes = await expedientesRes.json()
        const clientesData = await clientesRes.json()

        setSearchResults({
          expedientes: Array.isArray(expedientes) ? expedientes.slice(0, 5) : [],
          clientes: clientesData.clientes ? clientesData.clientes.slice(0, 5) : []
        })
      } catch (error) {
        console.error('Error searching:', error)
        setSearchResults({ expedientes: [], clientes: [] })
      } finally {
        setIsSearching(false)
      }
    }

    const timeoutId = setTimeout(searchData, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const stats = [
    {
      title: 'Expedientes Activos',
      value: '24',
      description: '+12% desde el mes pasado',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Clientes',
      value: '145',
      description: '+8 nuevos este mes',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Audiencias Próximas',
      value: '7',
      description: 'En los próximos 7 días',
      icon: Calendar,
      color: 'text-yellow-600'
    },
    {
      title: 'Honorarios Pendientes',
      value: '$485,230',
      description: '+15% desde el mes pasado',
      icon: DollarSign,
      color: 'text-purple-600'
    }
  ]

  const recentCases = [
    {
      id: 1,
      numero: 'EXP-2024-001',
      caratula: 'Pérez c/ García s/ Daños y Perjuicios',
      cliente: 'Juan Pérez',
      estado: 'Activo',
      proximaAudiencia: '2024-01-15'
    },
    {
      id: 2,
      numero: 'EXP-2024-002',
      caratula: 'López c/ Empresa XYZ s/ Laboral',
      cliente: 'María López',
      estado: 'En Trámite',
      proximaAudiencia: '2024-01-18'
    },
    {
      id: 3,
      numero: 'EXP-2024-003',
      caratula: 'Martínez s/ Sucesión',
      cliente: 'Carlos Martínez',
      estado: 'Suspendido',
      proximaAudiencia: null
    }
  ]

  const urgentTasks = [
    {
      id: 1,
      titulo: 'Presentar contestación de demanda',
      expediente: 'EXP-2024-001',
      vencimiento: '2024-01-10',
      prioridad: 'Alta'
    },
    {
      id: 2,
      titulo: 'Preparar documentación para audiencia',
      expediente: 'EXP-2024-002',
      vencimiento: '2024-01-12',
      prioridad: 'Media'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Buscador */}
        <div className="mb-8" ref={searchRef}>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Busca por cliente o número de expediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
            )}
          </div>

          {/* Resultados de búsqueda */}
          {showResults && (searchResults.expedientes.length > 0 || searchResults.clientes.length > 0) && (
            <div className="absolute z-50 w-full max-w-2xl mt-2 mx-auto left-0 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
              {/* Expedientes */}
              {searchResults.expedientes.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Expedientes
                  </div>
                  {searchResults.expedientes.map((exp) => (
                    <button
                      key={exp.id}
                      onClick={() => {
                        router.push(`/expedientes/${exp.id}`)
                        setShowResults(false)
                        setSearchQuery('')
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {exp.numero}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {exp.caratula}
                          </div>
                          <div className="text-xs text-gray-500">
                            Cliente: {exp.cliente.razonSocial}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Clientes */}
              {searchResults.clientes.length > 0 && (
                <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Clientes
                  </div>
                  {searchResults.clientes.map((cliente) => (
                    <button
                      key={cliente.id}
                      onClick={() => {
                        router.push(`/clientes/${cliente.id}`)
                        setShowResults(false)
                        setSearchQuery('')
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Users className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {cliente.razonSocial}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {cliente.email || 'Sin email'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {cliente.tipoPersona === 'FISICA' ? 'Persona Física' : 'Persona Jurídica'}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sin resultados */}
          {showResults && searchQuery.length >= 2 && !isSearching && 
           searchResults.expedientes.length === 0 && searchResults.clientes.length === 0 && (
            <div className="absolute z-50 w-full max-w-2xl mt-2 mx-auto left-0 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-center text-sm text-gray-500">
                No se encontraron resultados para "{searchQuery}"
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/expedientes/nuevo">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nuevo Expediente
              </Button>
            </Link>
            <Link href="/clientes/nuevo">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </Button>
            </Link>
            <Link href="/agenda">
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Ver Agenda
              </Button>
            </Link>
            <Link href="/expedientes">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Ver Expedientes
              </Button>
            </Link>
            <Link href="/ia-legal">
              <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                <Bot className="h-4 w-4 mr-2" />
                Asistente IA
              </Button>
            </Link>
            <Link href="/reportes">
              <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                <TrendingUp className="h-4 w-4 mr-2" />
                Reportes
              </Button>
            </Link>
            <Link href="/configuracion">
              <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="expedientes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expedientes">Expedientes Recientes</TabsTrigger>
            <TabsTrigger value="tareas">Tareas Urgentes</TabsTrigger>
            <TabsTrigger value="actividad">Actividad Reciente</TabsTrigger>
          </TabsList>

          <TabsContent value="expedientes">
            <Card>
              <CardHeader>
                <CardTitle>Expedientes Recientes</CardTitle>
                <CardDescription>
                  Últimos expedientes modificados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCases.map((caso) => (
                    <div key={caso.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-blue-600">{caso.numero}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            caso.estado === 'Activo' ? 'bg-green-100 text-green-700' :
                            caso.estado === 'En Trámite' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {caso.estado}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900">{caso.caratula}</h3>
                        <p className="text-sm text-gray-500">Cliente: {caso.cliente}</p>
                        {caso.proximaAudiencia && (
                          <p className="text-sm text-blue-600 mt-1">
                            Próxima audiencia: {caso.proximaAudiencia}
                          </p>
                        )}
                      </div>
                      <Link href={`/expedientes/${caso.id}`}>
                        <Button variant="outline" size="sm">Ver</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tareas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Tareas Urgentes
                </CardTitle>
                <CardDescription>
                  Tareas que requieren atención inmediata
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {urgentTasks.map((tarea) => (
                    <div key={tarea.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            tarea.prioridad === 'Alta' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {tarea.prioridad}
                          </span>
                          <span className="text-sm text-gray-500">{tarea.expediente}</span>
                        </div>
                        <h3 className="font-medium text-gray-900">{tarea.titulo}</h3>
                        <p className="text-sm text-gray-500">Vencimiento: {tarea.vencimiento}</p>
                      </div>
                      <Button variant="outline" size="sm">Completar</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actividad">
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>
                  Últimas acciones realizadas en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay actividad reciente para mostrar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
