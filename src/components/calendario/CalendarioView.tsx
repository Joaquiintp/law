'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar as CalendarIcon,
  Clock, 
  Users, 
  MapPin, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  FileText,
  User,
  DollarSign,
  Edit2,
  Sparkles
} from 'lucide-react'
import NuevoEventoForm from './NuevoEventoForm'
import { format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth,
  addMonths,
  subMonths,
  isToday
} from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

interface CalendarioViewProps {
  audiencias: Array<{
    id: string
    fecha: Date
    hora?: string | null
    tipo: string
    modalidad: string
    lugar?: string | null
    estado: string
    expediente: {
      id: string
      numero: string
      caratula: string
      cliente: {
        razonSocial: string
      }
    }
  }>
  tareas: Array<{
    id: string
    titulo: string
    descripcion?: string | null
    fechaVencimiento?: Date | null
    prioridad: string
    estado: string
    expediente: {
      id: string
      numero: string
      caratula: string
      cliente: {
        razonSocial: string
      }
    }
  }>
  eventos: Array<{
    id: string
    titulo: string
    descripcion?: string | null
    fecha: Date
    hora?: string | null
    tipo: string
    monto?: number | null
    moneda?: string | null
    estado: string
    expediente?: {
      id: string
      numero: string
      caratula: string
    } | null
    cliente?: {
      id: string
      razonSocial: string
    } | null
  }>
  expedientes: Array<{
    id: string
    numero: string
    caratula: string
  }>
  clientes: Array<{
    id: string
    razonSocial: string
  }>
  session: any
}

export default function CalendarioView({ audiencias, tareas, eventos, expedientes, clientes, session }: CalendarioViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [activeView, setActiveView] = useState<'calendario' | 'audiencias' | 'tareas'>('calendario')
  const [showNuevoEventoModal, setShowNuevoEventoModal] = useState(false)

  // Generar días del calendario
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const getEventosDelDia = (date: Date) => {
    const audienciasDelDia = audiencias.filter(audiencia => 
      isSameDay(new Date(audiencia.fecha), date)
    )
    const tareasDelDia = tareas.filter(tarea => 
      tarea.fechaVencimiento && isSameDay(new Date(tarea.fechaVencimiento), date)
    )
    const eventosDelDia = eventos.filter(evento =>
      isSameDay(new Date(evento.fecha), date)
    )
    
    return { audiencias: audienciasDelDia, tareas: tareasDelDia, eventos: eventosDelDia }
  }

  const getTipoAudienciaLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'CONCILIACION': 'Conciliación',
      'DECLARACION_TESTIMONIAL': 'Declaración Testimonial',
      'ALEGATOS': 'Alegatos',
      'LECTURA_DE_SENTENCIA': 'Lectura de Sentencia',
      'MEDIACION': 'Mediación',
      'REVISION_MEDIDAS': 'Revisión de Medidas',
      'OTRA': 'Otra'
    }
    return labels[tipo] || tipo
  }

  const getEventoIconAndColor = (tipo: string) => {
    const config: Record<string, { icon: any, color: string, bgColor: string }> = {
      'COBRO': { icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100' },
      'VENCIMIENTO': { icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-100' },
      'FECHA_LIMITE': { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
      'REUNION': { icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-100' },
      'OTRO': { icon: Sparkles, color: 'text-gray-600', bgColor: 'bg-gray-100' }
    }
    return config[tipo] || config['OTRO']
  }

  const getEstadoBadgeColor = (estado: string, tipo: 'audiencia' | 'tarea') => {
    if (tipo === 'audiencia') {
      switch (estado) {
        case 'PROGRAMADA':
          return 'bg-blue-100 text-blue-800'
        case 'CONFIRMADA':
          return 'bg-green-100 text-green-800'
        case 'SUSPENDIDA':
          return 'bg-yellow-100 text-yellow-800'
        case 'CANCELADA':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    } else {
      switch (estado) {
        case 'PENDIENTE':
          return 'bg-yellow-100 text-yellow-800'
        case 'EN_PROGRESO':
          return 'bg-blue-100 text-blue-800'
        case 'COMPLETADA':
          return 'bg-green-100 text-green-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }
  }

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'ALTA':
        return 'text-red-600'
      case 'MEDIA':
        return 'text-yellow-600'
      case 'BAJA':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con controles de navegación */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-2xl font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/calendario/nueva-audiencia">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Audiencia
            </Button>
          </Link>
          <Button onClick={() => setShowNuevoEventoModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Evento
          </Button>
        </div>
      </div>

      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendario">Vista Calendario</TabsTrigger>
          <TabsTrigger value="audiencias">
            Audiencias ({audiencias.length})
          </TabsTrigger>
          <TabsTrigger value="tareas">
            Tareas ({tareas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendario" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              {/* Vista de calendario */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const eventos = getEventosDelDia(day)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isSelected = selectedDate && isSameDay(day, selectedDate)
                  const dayIsToday = isToday(day)

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors
                        ${isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                        ${isSelected ? 'ring-2 ring-blue-500' : ''}
                        ${dayIsToday ? 'bg-blue-50 border-blue-200' : ''}
                      `}
                    >
                      <div className={`
                        text-sm font-medium mb-1
                        ${dayIsToday ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}
                      `}>
                        {format(day, 'd')}
                      </div>

                      {/* Eventos del día */}
                      <div className="space-y-1">
                        {eventos.audiencias.slice(0, 1).map((audiencia) => (
                          <div
                            key={audiencia.id}
                            className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate"
                            title={`${getTipoAudienciaLabel(audiencia.tipo)} - ${audiencia.hora || 'Sin hora'}`}
                          >
                            🏛️ {getTipoAudienciaLabel(audiencia.tipo).substring(0, 12)}{getTipoAudienciaLabel(audiencia.tipo).length > 12 ? '...' : ''} {audiencia.hora}
                          </div>
                        ))}

                        {eventos.eventos.slice(0, 1).map((evento) => {
                          const { icon: Icon, color, bgColor } = getEventoIconAndColor(evento.tipo)
                          return (
                            <div
                              key={evento.id}
                              className={`text-xs px-1 py-0.5 rounded truncate ${bgColor}`}
                              title={`${evento.titulo} - ${evento.hora || 'Sin hora'}`}
                            >
                              <span className={color}>●</span> {evento.titulo.substring(0, 12)}{evento.titulo.length > 12 ? '...' : ''}
                            </div>
                          )
                        })}
                        
                        {eventos.tareas.slice(0, 1).map((tarea) => (
                          <div
                            key={tarea.id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${
                              tarea.prioridad === 'ALTA' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                            title={tarea.titulo}
                          >
                            📋 {tarea.titulo.substring(0, 10)}...
                          </div>
                        ))}

                        {(eventos.audiencias.length + eventos.tareas.length + eventos.eventos.length) > 3 && (
                          <div className="text-xs text-gray-500">
                            +{(eventos.audiencias.length + eventos.tareas.length + eventos.eventos.length) - 3} más
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Detalle del día seleccionado */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Eventos para {format(selectedDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: es })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const eventosDelDia = getEventosDelDia(selectedDate)
                  const totalEventos = eventosDelDia.audiencias.length + eventosDelDia.tareas.length + eventosDelDia.eventos.length

                  if (totalEventos === 0) {
                    return (
                      <p className="text-gray-500 text-center py-4">
                        No hay eventos programados para este día
                      </p>
                    )
                  }

                  return (
                    <div className="space-y-4">
                      {eventosDelDia.audiencias.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Audiencias</h4>
                          <div className="space-y-2">
                            {eventosDelDia.audiencias.map((audiencia) => {
                              const fechaAudiencia = new Date(audiencia.fecha)
                              const hoy = new Date()
                              hoy.setHours(0, 0, 0, 0)
                              fechaAudiencia.setHours(0, 0, 0, 0)
                              const puedeEditar = fechaAudiencia >= hoy
                              
                              return (
                                <div key={audiencia.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:shadow-sm transition-shadow">
                                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">{getTipoAudienciaLabel(audiencia.tipo)}</span>
                                      <Badge className={getEstadoBadgeColor(audiencia.estado, 'audiencia')}>
                                        {audiencia.estado}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">{audiencia.expediente.numero} - {audiencia.expediente.caratula}</p>
                                    <p className="text-xs text-gray-500">
                                      Cliente: {audiencia.expediente.cliente.razonSocial}
                                    </p>
                                  </div>
                                  <div className="text-right text-sm text-gray-500 flex-shrink-0">
                                    {audiencia.hora && (
                                      <div className="flex items-center justify-end mb-1">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {audiencia.hora}
                                      </div>
                                    )}
                                    {audiencia.lugar && (
                                      <div className="flex items-center justify-end">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {audiencia.lugar.substring(0, 20)}{audiencia.lugar.length > 20 ? '...' : ''}
                                      </div>
                                    )}
                                  </div>
                                  {puedeEditar && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="ml-2"
                                      title="Editar audiencia"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {eventosDelDia.eventos.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Eventos</h4>
                          <div className="space-y-2">
                            {eventosDelDia.eventos.map((evento) => {
                              const { icon: Icon, color, bgColor } = getEventoIconAndColor(evento.tipo)
                              
                              return (
                                <div key={evento.id} className={`flex items-center space-x-3 p-3 border rounded-lg hover:shadow-sm transition-shadow ${bgColor}`}>
                                  <Icon className={`h-5 w-5 ${color}`} />
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">{evento.titulo}</span>
                                      <Badge variant="outline" className={color}>
                                        {evento.tipo.replace('_', ' ')}
                                      </Badge>
                                    </div>
                                    {evento.descripcion && (
                                      <p className="text-sm text-gray-600">{evento.descripcion}</p>
                                    )}
                                    {evento.expediente && (
                                      <p className="text-xs text-gray-500">
                                        Expediente: {evento.expediente.numero}
                                      </p>
                                    )}
                                    {evento.cliente && (
                                      <p className="text-xs text-gray-500">
                                        Cliente: {evento.cliente.razonSocial}
                                      </p>
                                    )}
                                    {evento.monto && (
                                      <p className="text-sm font-semibold text-green-700 mt-1">
                                        {evento.moneda} ${evento.monto.toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right text-sm text-gray-500">
                                    {evento.hora && (
                                      <div className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {evento.hora}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {eventosDelDia.tareas.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Tareas</h4>
                          <div className="space-y-2">
                            {eventosDelDia.tareas.map((tarea) => (
                              <div key={tarea.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                                <FileText className="h-5 w-5 text-gray-600" />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">{tarea.titulo}</span>
                                    <Badge className={getEstadoBadgeColor(tarea.estado, 'tarea')}>
                                      {tarea.estado}
                                    </Badge>
                                    <span className={`text-xs font-medium ${getPrioridadColor(tarea.prioridad)}`}>
                                      {tarea.prioridad}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">{tarea.expediente.numero} - {tarea.expediente.caratula}</p>
                                  {tarea.descripcion && (
                                    <p className="text-xs text-gray-500">{tarea.descripcion}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="audiencias" className="space-y-4">
          <div className="grid gap-4">
            {audiencias.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay audiencias programadas</h3>
                  <p className="text-gray-500 text-center mb-4">
                    Programa tu primera audiencia para organizar tu agenda.
                  </p>
                  <Link href="/calendario/nueva-audiencia">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva Audiencia
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              audiencias.map((audiencia) => (
                <Card key={audiencia.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CalendarIcon className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-semibold">{audiencia.expediente.numero}</h3>
                          <Badge className={getEstadoBadgeColor(audiencia.estado, 'audiencia')}>
                            {audiencia.estado}
                          </Badge>
                          <Badge variant="outline">{audiencia.tipo}</Badge>
                        </div>

                        <p className="text-gray-600 mb-2">{audiencia.expediente.caratula}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {audiencia.expediente.cliente.razonSocial}
                          </div>
                          {audiencia.lugar && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {audiencia.lugar}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center text-blue-600">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {format(new Date(audiencia.fecha), 'dd/MM/yyyy', { locale: es })}
                          </div>
                          {audiencia.hora && (
                            <div className="flex items-center text-blue-600">
                              <Clock className="h-4 w-4 mr-1" />
                              {audiencia.hora}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link href={`/expedientes/${audiencia.expediente.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Expediente
                          </Button>
                        </Link>
                        <Link href={`/calendario/audiencias/${audiencia.id}`}>
                          <Button size="sm" variant="outline">
                            Ver Detalle
                          </Button>
                        </Link>
                        <Badge variant="secondary" className="text-xs">
                          {getTipoAudienciaLabel(audiencia.tipo)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="tareas" className="space-y-4">
          <div className="grid gap-4">
            {tareas.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay tareas pendientes</h3>
                  <p className="text-gray-500 text-center mb-4">
                    Todas las tareas están al día.
                  </p>
                </CardContent>
              </Card>
            ) : (
              tareas.map((tarea) => (
                <Card key={tarea.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="h-5 w-5 text-gray-600" />
                          <h3 className="text-lg font-semibold">{tarea.titulo}</h3>
                          <Badge className={getEstadoBadgeColor(tarea.estado, 'tarea')}>
                            {tarea.estado}
                          </Badge>
                          <span className={`text-sm font-medium ${getPrioridadColor(tarea.prioridad)}`}>
                            {tarea.prioridad}
                          </span>
                        </div>

                        {tarea.descripcion && (
                          <p className="text-gray-600 mb-2">{tarea.descripcion}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {tarea.expediente.numero}
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {tarea.expediente.cliente.razonSocial}
                          </div>
                        </div>

                        {tarea.fechaVencimiento && (
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-1 text-orange-500" />
                            <span className="text-orange-600">
                              Vence: {format(new Date(tarea.fechaVencimiento), 'dd/MM/yyyy', { locale: es })}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link href={`/expedientes/${tarea.expediente.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Expediente
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Nuevo Evento */}
      {showNuevoEventoModal && (
        <NuevoEventoForm
          onClose={() => setShowNuevoEventoModal(false)}
          onSuccess={() => {
            setShowNuevoEventoModal(false)
          }}
          expedientes={expedientes}
          clientes={clientes}
        />
      )}
    </div>
  )
}
