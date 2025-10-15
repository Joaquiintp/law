'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  FileText, 
  Search, 
  PenTool,
  Brain,
  Zap,
  MessageSquare,
  TrendingUp,
  Clock,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Calendar,
  User
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ConsultaIA {
  id: string
  tipo: string
  pregunta: string
  respuesta?: string | null
  estado: string
  createdAt: Date
  usuario: {
    name: string | null
    email: string | null
  }
}

interface ExpedienteParaAnalisis {
  id: string
  numero: string
  caratula: string
  estado: string
  updatedAt: Date
  cliente: {
    nombre: string
    apellido: string
  }
}

interface AsistenteIADashboardProps {
  data: {
    consultasRecientes: ConsultaIA[]
    estadisticas: {
      total: number
      hoy: number
      porTipo: Array<{
        tipo: string
        _count: {
          id: number
        }
      }>
    }
    expedientesParaAnalisis: ExpedienteParaAnalisis[]
  }
  userId: string
}

export default function AsistenteIADashboard({ data, userId }: AsistenteIADashboardProps) {
  const { consultasRecientes, estadisticas, expedientesParaAnalisis } = data

  const [consultaRapida, setConsultaRapida] = useState('')

  const tiposConsulta = [
    {
      tipo: 'CHAT_GENERAL',
      label: 'Consulta General',
      icon: MessageSquare,
      color: 'blue',
      descripcion: 'Preguntas generales sobre derecho'
    },
    {
      tipo: 'ANALISIS_DOCUMENTO',
      label: 'Análisis de Documentos',
      icon: FileText,
      color: 'green',
      descripcion: 'Revisar y analizar documentos legales'
    },
    {
      tipo: 'GENERACION_ESCRITO',
      label: 'Generación de Escritos',
      icon: PenTool,
      color: 'purple',
      descripcion: 'Crear borradores de escritos judiciales'
    },
    {
      tipo: 'BUSQUEDA_JURISPRUDENCIA',
      label: 'Jurisprudencia',
      icon: Search,
      color: 'orange',
      descripcion: 'Buscar precedentes y jurisprudencia'
    },
    {
      tipo: 'ESTRATEGIA_CASO',
      label: 'Estrategia de Caso',
      icon: Brain,
      color: 'red',
      descripcion: 'Análisis estratégico de casos'
    },
    {
      tipo: 'REVISION_CONTRATO',
      label: 'Revisión de Contratos',
      icon: CheckCircle,
      color: 'indigo',
      descripcion: 'Analizar términos y cláusulas'
    }
  ]

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100',
      red: 'text-red-600 bg-red-100',
      indigo: 'text-indigo-600 bg-indigo-100'
    }
    return colors[color as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'COMPLETADA':
        return 'bg-green-100 text-green-800'
      case 'PROCESANDO':
        return 'bg-yellow-100 text-yellow-800'
      case 'ERROR':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoLabel = (tipo: string) => {
    const tipoEncontrado = tiposConsulta.find(t => t.tipo === tipo)
    return tipoEncontrado?.label || tipo
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultas IA</CardTitle>
            <Bot className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {estadisticas.total}
            </div>
            <p className="text-xs text-muted-foreground">
              consultas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoy</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {estadisticas.hoy}
            </div>
            <p className="text-xs text-muted-foreground">
              consultas de hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Análisis Sugeridos</CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {expedientesParaAnalisis.length}
            </div>
            <p className="text-xs text-muted-foreground">
              expedientes para analizar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chat rápido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Consulta Rápida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Haz una pregunta legal rápida..."
              value={consultaRapida}
              onChange={(e) => setConsultaRapida(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && consultaRapida.trim()) {
                  // Aquí iría la lógica para procesar la consulta
                  console.log('Consulta:', consultaRapida)
                }
              }}
            />
            <Link href={`/ia-legal/chat?q=${encodeURIComponent(consultaRapida)}`}>
              <Button disabled={!consultaRapida.trim()}>
                <Bot className="mr-2 h-4 w-4" />
                Preguntar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de consulta disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>Servicios de IA Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiposConsulta.map((servicio) => {
              const Icon = servicio.icon
              return (
                <Link key={servicio.tipo} href={`/ia-legal/${servicio.tipo.toLowerCase()}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getIconColor(servicio.color)}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{servicio.label}</h3>
                          <p className="text-xs text-gray-600 mt-1">
                            {servicio.descripcion}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historial de consultas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Consultas Recientes</CardTitle>
            <Link href="/ia-legal/historial">
              <Button variant="outline" size="sm">
                Ver todo
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {consultasRecientes.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay consultas aún
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comienza haciendo tu primera consulta a la IA
                  </p>
                  <Link href="/ia-legal/chat">
                    <Button>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Iniciar Chat
                    </Button>
                  </Link>
                </div>
              ) : (
                consultasRecientes.map((consulta) => (
                  <div key={consulta.id} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        {getTipoLabel(consulta.tipo)}
                      </span>
                      <Badge className={getEstadoBadgeColor(consulta.estado)}>
                        {consulta.estado}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {consulta.pregunta}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 space-x-3">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {consulta.usuario.name}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(consulta.createdAt), 'dd/MM HH:mm', { locale: es })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expedientes sugeridos para análisis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Análisis Sugeridos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expedientesParaAnalisis.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Todo al día
                  </h3>
                  <p className="text-gray-500">
                    No hay expedientes que requieran análisis por el momento
                  </p>
                </div>
              ) : (
                expedientesParaAnalisis.map((expediente) => (
                  <div key={expediente.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {expediente.numero}
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-1">
                        {expediente.caratula}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Cliente: {expediente.cliente.nombre} {expediente.cliente.apellido}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/ia-legal/analizar-expediente?id=${expediente.id}`}>
                        <Button size="sm" variant="outline">
                          <Brain className="h-3 w-3 mr-1" />
                          Analizar
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas por tipo */}
      {estadisticas.porTipo.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uso por Tipo de Consulta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {estadisticas.porTipo.map((stat) => {
                const tipo = tiposConsulta.find(t => t.tipo === stat.tipo)
                const Icon = tipo?.icon || MessageSquare
                const porcentaje = (stat._count.id / estadisticas.total) * 100
                
                return (
                  <div key={stat.tipo} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${getIconColor(tipo?.color || 'blue')}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">
                        {getTipoLabel(stat.tipo)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-blue-600">
                        {stat._count.id}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consejos y alertas */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Lightbulb className="h-5 w-5" />
            Consejos de IA Legal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 mt-0.5 text-blue-600" />
              <p className="text-sm">
                <strong>Optimización:</strong> Proporciona contexto específico para obtener respuestas más precisas
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
              <p className="text-sm">
                <strong>Productividad:</strong> Usa plantillas predefinidas para consultas frecuentes
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <TrendingUp className="h-4 w-4 mt-0.5 text-purple-600" />
              <p className="text-sm">
                <strong>Análisis:</strong> Revisa regularmente expedientes activos para identificar patrones
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
