'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  FileText, 
  DollarSign, 
  Calendar,
  Bot,
  Download,
  Filter,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface EstadisticasGenerales {
  resumenGeneral: {
    totalExpedientes: number
    expedientesActivos: number
    totalClientes: number
    clientesActivos: number
    totalFacturacion: number
    facturacionPendiente: number
    audienciasPendientes: number
    documentosCreados: number
    consultasIA: number
  }
  graficos: {
    expedientesPorEstado: Array<{
      estado: string
      _count: { id: number }
    }>
    facturacionPorMes: Array<{
      createdAt: Date
      _sum: { total: number | null }
    }>
    audienciasPorMes: Array<{
      fecha: Date
      _count: { id: number }
    }>
  }
}

interface ReportesDashboardProps {
  estadisticas: EstadisticasGenerales
  userId: string
}

export default function ReportesDashboard({ estadisticas }: ReportesDashboardProps) {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('6meses')
  const [tipoReporte, setTipoReporte] = useState('general')

  const { resumenGeneral, graficos } = estadisticas

  // Configuración de colores para gráficos
  const COLORES = {
    primario: '#3B82F6',
    secundario: '#10B981',
    acento: '#F59E0B',
    danger: '#EF4444',
    morado: '#8B5CF6'
  }

  // Preparar datos para gráficos
  const datosExpedientesPorEstado = graficos.expedientesPorEstado.map(item => ({
    estado: item.estado,
    cantidad: item._count.id,
    porcentaje: ((item._count.id / resumenGeneral.totalExpedientes) * 100).toFixed(1)
  }))

  const coloresEstados = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  // Datos para gráfico de facturación por mes
  const datosFacturacionMes = graficos.facturacionPorMes
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(item => ({
      mes: format(new Date(item.createdAt), 'MMM yyyy', { locale: es }),
      monto: item._sum.total || 0,
      fecha: item.createdAt
    }))

  // Datos para gráfico de audiencias por mes
  const datosAudienciasMes = graficos.audienciasPorMes
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .map(item => ({
      mes: format(new Date(item.fecha), 'MMM yyyy', { locale: es }),
      audiencias: item._count.id,
      fecha: item.fecha
    }))

  // Métricas clave con comparación
  const metricas = [
    {
      titulo: 'Expedientes Activos',
      valor: resumenGeneral.expedientesActivos,
      total: resumenGeneral.totalExpedientes,
      porcentaje: ((resumenGeneral.expedientesActivos / resumenGeneral.totalExpedientes) * 100).toFixed(1),
      tendencia: 'up',
      cambio: '+12%',
      icono: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      titulo: 'Clientes Activos',
      valor: resumenGeneral.clientesActivos,
      total: resumenGeneral.totalClientes,
      porcentaje: ((resumenGeneral.clientesActivos / resumenGeneral.totalClientes) * 100).toFixed(1),
      tendencia: 'up',
      cambio: '+8%',
      icono: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      titulo: 'Facturación Total',
      valor: resumenGeneral.totalFacturacion,
      total: null,
      porcentaje: null,
      tendencia: 'up',
      cambio: '+15%',
      icono: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      formatoMoneda: true
    },
    {
      titulo: 'Audiencias Pendientes',
      valor: resumenGeneral.audienciasPendientes,
      total: null,
      porcentaje: null,
      tendencia: 'down',
      cambio: '-5%',
      icono: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      titulo: 'Consultas IA',
      valor: resumenGeneral.consultasIA,
      total: null,
      porcentaje: null,
      tendencia: 'up',
      cambio: '+45%',
      icono: Bot,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      titulo: 'Documentos Creados',
      valor: resumenGeneral.documentosCreados,
      total: null,
      porcentaje: 'Este mes',
      tendencia: 'up',
      cambio: '+23%',
      icono: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ]

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(valor)
  }

  const exportarReporte = () => {
    const data = {
      fecha: new Date().toISOString(),
      resumen: resumenGeneral,
      graficos: graficos
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `reporte-${format(new Date(), 'yyyy-MM-dd')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard de Analytics</h2>
          <p className="text-gray-600">Última actualización: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
        </div>
        
        <div className="flex space-x-3">
          <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1mes">1 Mes</SelectItem>
              <SelectItem value="3meses">3 Meses</SelectItem>
              <SelectItem value="6meses">6 Meses</SelectItem>
              <SelectItem value="1ano">1 Año</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={exportarReporte}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricas.map((metrica, index) => {
          const IconoComponente = metrica.icono
          return (
            <Card key={index} className={`${metrica.bgColor} border-l-4 border-l-gray-400`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${metrica.bgColor}`}>
                      <IconoComponente className={`h-6 w-6 ${metrica.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metrica.titulo}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {metrica.formatoMoneda 
                            ? formatearMoneda(metrica.valor) 
                            : metrica.valor.toLocaleString()}
                        </span>
                        {metrica.total && (
                          <span className="text-sm text-gray-500">
                            / {metrica.total} ({metrica.porcentaje}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`flex items-center space-x-1 ${
                      metrica.tendencia === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metrica.tendencia === 'up' ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">{metrica.cambio}</span>
                    </div>
                    {metrica.porcentaje && typeof metrica.porcentaje === 'string' && (
                      <p className="text-xs text-gray-500 mt-1">{metrica.porcentaje}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tabs para diferentes reportes */}
      <Tabs value={tipoReporte} onValueChange={setTipoReporte} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="financiero">Financiero</TabsTrigger>
          <TabsTrigger value="operativo">Operativo</TabsTrigger>
          <TabsTrigger value="rendimiento">Rendimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Expedientes por Estado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Distribución de Expedientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      dataKey="cantidad"
                      data={datosExpedientesPorEstado}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({ estado, porcentaje }) => `${estado} (${porcentaje}%)`}
                    >
                      {datosExpedientesPorEstado.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={coloresEstados[index % coloresEstados.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="mt-4 space-y-2">
                  {datosExpedientesPorEstado.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: coloresEstados[index % coloresEstados.length] }}
                        />
                        <span className="text-sm">{item.estado}</span>
                      </div>
                      <Badge variant="outline">
                        {item.cantidad} ({item.porcentaje}%)
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Audiencias por Mes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Audiencias por Mes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={datosAudienciasMes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="audiencias" fill={COLORES.morado} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financiero" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Gráfico de Facturación por Mes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Evolución de Facturación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={datosFacturacionMes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000)}K`} />
                    <Tooltip formatter={(value) => formatearMoneda(Number(value))} />
                    <Area 
                      type="monotone" 
                      dataKey="monto" 
                      stroke={COLORES.secundario}
                      fill={COLORES.secundario}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Resumen Financiero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium text-green-900">Total Facturado</h3>
                  <p className="text-2xl font-bold text-green-700">
                    {formatearMoneda(resumenGeneral.totalFacturacion)}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <h3 className="font-medium text-yellow-900">Pendiente de Cobro</h3>
                  <p className="text-2xl font-bold text-yellow-700">
                    {formatearMoneda(resumenGeneral.facturacionPendiente)}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-medium text-blue-900">Tasa de Cobro</h3>
                  <p className="text-2xl font-bold text-blue-700">
                    {((1 - (resumenGeneral.facturacionPendiente / resumenGeneral.totalFacturacion)) * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="operativo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Productividad */}
            <Card>
              <CardHeader>
                <CardTitle>Indicadores Operativos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Documentos creados este mes</span>
                  <Badge className="bg-blue-600">
                    {resumenGeneral.documentosCreados}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Consultas IA realizadas</span>
                  <Badge className="bg-purple-600">
                    {resumenGeneral.consultasIA}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Audiencias pendientes</span>
                  <Badge className="bg-yellow-600">
                    {resumenGeneral.audienciasPendientes}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Tasa de expedientes activos</span>
                  <Badge className="bg-green-600">
                    {((resumenGeneral.expedientesActivos / resumenGeneral.totalExpedientes) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Eficiencia */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Eficiencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6">
                  <h3 className="text-3xl font-bold text-blue-600 mb-2">
                    {(resumenGeneral.totalExpedientes / resumenGeneral.totalClientes).toFixed(1)}
                  </h3>
                  <p className="text-gray-600">Expedientes por Cliente</p>
                </div>
                
                <div className="text-center p-6">
                  <h3 className="text-3xl font-bold text-green-600 mb-2">
                    {(resumenGeneral.totalFacturacion / resumenGeneral.totalClientes).toFixed(0)}
                  </h3>
                  <p className="text-gray-600">Facturación Promedio por Cliente</p>
                </div>
                
                <div className="text-center p-6">
                  <h3 className="text-3xl font-bold text-purple-600 mb-2">
                    {(resumenGeneral.consultasIA / resumenGeneral.totalExpedientes).toFixed(1)}
                  </h3>
                  <p className="text-gray-600">Consultas IA por Expediente</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rendimiento" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Análisis de Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Análisis de Rendimiento Avanzado
                </h3>
                <p className="text-gray-500 mb-6">
                  Esta sección incluirá métricas avanzadas de rendimiento y comparativas temporales.
                </p>
                <Button variant="outline">
                  Próximamente disponible
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
