'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Line
} from 'recharts'
import { 
  Users, 
  FileText, 
  DollarSign, 
  Calendar,
  Download,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

interface DatosReporte {
  tipo: string
  periodo: Date
  resumen: any
  detalles: any
}

interface ReporteDetalladoProps {
  datos: DatosReporte
  userId: string
}

export default function ReporteDetallado({ datos }: ReporteDetalladoProps) {
  const [exportando, setExportando] = useState(false)

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(valor)
  }

  const exportarReporte = async () => {
    setExportando(true)
    
    try {
      const contenido = generarContenidoReporte()
      const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reporte-${datos.tipo}-${format(new Date(), 'yyyy-MM-dd')}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      setExportando(false)
    }
  }

  const generarContenidoReporte = () => {
    const titulo = getTituloReporte()
    const fecha = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })
    
    return `${titulo}
Fecha de generación: ${fecha}
Período analizado: Desde ${format(datos.periodo, 'dd/MM/yyyy', { locale: es })}

${generarResumenTexto()}

${generarDetallesTexto()}

---
Reporte generado por ERP Jurídico
`
  }

  const getTituloReporte = () => {
    switch (datos.tipo) {
      case 'clientes':
        return 'REPORTE DETALLADO DE CLIENTES'
      case 'expedientes':
        return 'REPORTE DETALLADO DE EXPEDIENTES'
      case 'financiero':
        return 'REPORTE FINANCIERO DETALLADO'
      case 'productividad':
        return 'REPORTE DE PRODUCTIVIDAD'
      default:
        return 'REPORTE DETALLADO'
    }
  }

  const generarResumenTexto = () => {
    switch (datos.tipo) {
      case 'clientes':
        return `RESUMEN DE CLIENTES:
- Total de clientes: ${datos.resumen.total}
- Clientes nuevos en el período: ${datos.resumen.nuevos}
- Clientes activos: ${datos.resumen.activos}
- Tasa de clientes activos: ${((datos.resumen.activos / datos.resumen.total) * 100).toFixed(1)}%`

      case 'expedientes':
        return `RESUMEN DE EXPEDIENTES:
- Total de expedientes: ${datos.resumen.total}
- Expedientes nuevos en el período: ${datos.resumen.nuevos}
- Tiempo promedio de cierre: ${datos.detalles.tiempoPromedio} días`

      case 'financiero':
        return `RESUMEN FINANCIERO:
- Facturación total: ${formatearMoneda(datos.resumen.totalGeneral)}
- Facturación del período: ${formatearMoneda(datos.resumen.totalPeriodo)}
- Pendiente de cobro: ${formatearMoneda(datos.resumen.pendiente)} (${datos.resumen.cantidadPendientes} facturas)
- Facturas vencidas: ${formatearMoneda(datos.resumen.vencidas)} (${datos.resumen.cantidadVencidas} facturas)`

      case 'productividad':
        return `RESUMEN DE PRODUCTIVIDAD:
- Documentos creados: ${datos.resumen.documentos}
- Audiencias realizadas: ${datos.resumen.audiencias}
- Consultas IA realizadas: ${datos.resumen.consultasIA}`

      default:
        return ''
    }
  }

  const generarDetallesTexto = () => {
    return 'DETALLES ADICIONALES:\nConsulte los gráficos y tablas para información más detallada.'
  }

  const renderizarContenido = () => {
    switch (datos.tipo) {
      case 'clientes':
        return renderizarReporteClientes()
      case 'expedientes':
        return renderizarReporteExpedientes()
      case 'financiero':
        return renderizarReporteFinanciero()
      case 'productividad':
        return renderizarReporteProductividad()
      default:
        return <div>Tipo de reporte no soportado</div>
    }
  }

  const renderizarReporteClientes = () => (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-blue-900">Total de Clientes</h3>
            <p className="text-3xl font-bold text-blue-700">{datos.resumen.total}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium text-green-900">Nuevos Clientes</h3>
            <p className="text-3xl font-bold text-green-700">{datos.resumen.nuevos}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-medium text-yellow-900">Clientes Activos</h3>
            <p className="text-3xl font-bold text-yellow-700">{datos.resumen.activos}</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Clientes por Facturación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {datos.detalles.topClientes.slice(0, 10).map((cliente: any, index: number) => (
              <div key={cliente.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge className="bg-blue-600 text-white">#{index + 1}</Badge>
                  <div>
                    <h4 className="font-medium">{cliente.razonSocial}</h4>
                    <p className="text-sm text-gray-500">
                      {cliente.expedientesActivos} expedientes activos
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {formatearMoneda(cliente.totalFacturado)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {cliente.facturas.length} facturas
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderizarReporteExpedientes = () => (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-blue-900">Total</h3>
            <p className="text-3xl font-bold text-blue-700">{datos.resumen.total}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium text-green-900">Nuevos</h3>
            <p className="text-3xl font-bold text-green-700">{datos.resumen.nuevos}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-medium text-yellow-900">Tiempo Promedio</h3>
            <p className="text-3xl font-bold text-yellow-700">{datos.detalles.tiempoPromedio}</p>
            <p className="text-xs text-yellow-600">días</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-medium text-purple-900">Eficiencia</h3>
            <p className="text-3xl font-bold text-purple-700">85%</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expedientes por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="_count.id"
                  data={datos.resumen.porEstado}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#3B82F6"
                  label={(entry: any) => `${entry.estado} (${entry._count.id})`}
                >
                  {datos.resumen.porEstado.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expedientes por Materia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datos.resumen.porMateria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="materia" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="_count.id" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderizarReporteFinanciero = () => (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium text-green-900">Total Facturado</h3>
            <p className="text-xl font-bold text-green-700">
              {formatearMoneda(datos.resumen.totalGeneral)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-blue-900">Este Período</h3>
            <p className="text-xl font-bold text-blue-700">
              {formatearMoneda(datos.resumen.totalPeriodo)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-medium text-yellow-900">Pendiente</h3>
            <p className="text-xl font-bold text-yellow-700">
              {formatearMoneda(datos.resumen.pendiente)}
            </p>
            <p className="text-xs text-yellow-600">{datos.resumen.cantidadPendientes} facturas</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <h3 className="font-medium text-red-900">Vencidas</h3>
            <p className="text-xl font-bold text-red-700">
              {formatearMoneda(datos.resumen.vencidas)}
            </p>
            <p className="text-xs text-red-600">{datos.resumen.cantidadVencidas} facturas</p>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-50">
          <CardContent className="p-6 text-center">
            <h3 className="font-medium text-gray-900 mb-2">Tasa de Cobro</h3>
            <p className="text-3xl font-bold text-blue-600">
              {datos.resumen.totalGeneral > 0 
                ? (((datos.resumen.totalGeneral - datos.resumen.pendiente) / datos.resumen.totalGeneral) * 100).toFixed(1)
                : 0}%
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-50">
          <CardContent className="p-6 text-center">
            <h3 className="font-medium text-gray-900 mb-2">Facturas Vencidas</h3>
            <p className="text-3xl font-bold text-red-600">
              {datos.resumen.cantidadPendientes > 0
                ? ((datos.resumen.cantidadVencidas / datos.resumen.cantidadPendientes) * 100).toFixed(1)
                : 0}%
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-50">
          <CardContent className="p-6 text-center">
            <h3 className="font-medium text-gray-900 mb-2">Promedio por Factura</h3>
            <p className="text-xl font-bold text-purple-600">
              {datos.resumen.cantidadPendientes > 0
                ? formatearMoneda(datos.resumen.totalGeneral / (datos.resumen.cantidadPendientes + datos.resumen.cantidadVencidas))
                : formatearMoneda(0)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderizarReporteProductividad = () => (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-blue-900">Documentos Creados</h3>
            <p className="text-3xl font-bold text-blue-700">{datos.resumen.documentos}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium text-green-900">Audiencias</h3>
            <p className="text-3xl font-bold text-green-700">{datos.resumen.audiencias}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-medium text-purple-900">Consultas IA</h3>
            <p className="text-3xl font-bold text-purple-700">{datos.resumen.consultasIA}</p>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de productividad */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Productividad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="font-medium">Documentos por día promedio</span>
              <Badge className="bg-blue-600">
                {(datos.resumen.documentos / 30).toFixed(1)}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="font-medium">Audiencias por semana promedio</span>
              <Badge className="bg-green-600">
                {(datos.resumen.audiencias / 4).toFixed(1)}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
              <span className="font-medium">Consultas IA por día promedio</span>
              <Badge className="bg-purple-600">
                {(datos.resumen.consultasIA / 30).toFixed(1)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Link href="/reportes">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{getTituloReporte()}</h1>
          <p className="text-gray-600">
            Período: {format(datos.periodo, 'dd/MM/yyyy', { locale: es })} - {format(new Date(), 'dd/MM/yyyy', { locale: es })}
          </p>
        </div>
        
        <Button onClick={exportarReporte} disabled={exportando}>
          <Download className="h-4 w-4 mr-2" />
          {exportando ? 'Exportando...' : 'Exportar Reporte'}
        </Button>
      </div>

      {/* Contenido específico del reporte */}
      {renderizarContenido()}
    </div>
  )
}
