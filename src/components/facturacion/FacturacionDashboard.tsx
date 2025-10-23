'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  FileText, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Users,
  Plus,
  Eye,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Factura {
  id: string
  numero: string
  fecha: Date
  fechaVencimiento: Date
  total: number
  estado: string
  moneda: string
  cliente: {
    id: string
    razonSocial: string
    email: string | null
  }
  honorarios: Array<{
    id: string
    concepto: string
    monto: number
    estado: string
    fechaServicio: Date
  }>
}

interface Estadisticas {
  totalMes: number
  facturasMes: number
  totalAño: number
  pendientes: {
    total: number
    count: number
  }
  vencidas: {
    total: number
    count: number
  }
}

interface TopCliente {
  clienteId: string
  _sum: {
    total: number | null
  }
  _count: number
  cliente?: {
    id: string
    razonSocial: string
  }
}

interface FacturacionDashboardProps {
  data: {
    facturas: Factura[]
    estadisticas: Estadisticas
    ingresosPorMes: Array<{
      fecha: Date
      _sum: {
        total: number | null
      }
    }>
    topClientes: TopCliente[]
  }
}

export default function FacturacionDashboard({ data }: FacturacionDashboardProps) {
  const { facturas, estadisticas, ingresosPorMes, topClientes } = data
  
  const formatCurrency = (amount: number, currency = 'ARS') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency === 'ARS' ? 'ARS' : 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'PAGADA':
        return 'bg-green-100 text-green-800'
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800'
      case 'VENCIDA':
        return 'bg-red-100 text-red-800'
      case 'CANCELADA':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const calcularTendencia = () => {
    const mesActual = estadisticas.totalMes
    const promedioMensual = estadisticas.totalAño / 12
    const diferencia = mesActual - promedioMensual
    const porcentaje = promedioMensual > 0 ? (diferencia / promedioMensual) * 100 : 0
    
    return {
      diferencia,
      porcentaje,
      esMayor: diferencia >= 0
    }
  }

  const tendencia = calcularTendencia()

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturación del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(estadisticas.totalMes)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {tendencia.esMayor ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={tendencia.esMayor ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(tendencia.porcentaje).toFixed(1)}%
              </span>
              <span className="ml-1">vs promedio anual</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Emitidas</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {estadisticas.facturasMes}
            </div>
            <p className="text-xs text-muted-foreground">
              facturas este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes de Pago</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(estadisticas.pendientes.total)}
            </div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.pendientes.count} facturas pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(estadisticas.vencidas.total)}
            </div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.vencidas.count} facturas vencidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/facturacion/nueva">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Factura
              </Button>
            </Link>
            <Link href="/facturacion/honorarios">
              <Button variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                Gestionar Honorarios
              </Button>
            </Link>
            <Link href="/facturacion/reportes">
              <Button variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                Reportes Financieros
              </Button>
            </Link>
            <Link href="/facturacion/configuracion">
              <Button variant="outline">
                Configuración AFIP
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Facturas recientes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Facturas Recientes</CardTitle>
              <Link href="/facturacion/todas">
                <Button variant="outline" size="sm">
                  Ver todas
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {facturas.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay facturas
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Comienza creando tu primera factura
                    </p>
                    <Link href="/facturacion/nueva">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Primera Factura
                      </Button>
                    </Link>
                  </div>
                ) : (
                  facturas.map((factura) => (
                    <div 
                      key={factura.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{factura.numero}</span>
                            <Badge className={getEstadoBadgeColor(factura.estado)}>
                              {factura.estado}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {factura.cliente.razonSocial}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(factura.fecha), 'dd/MM/yyyy', { locale: es })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {formatCurrency(factura.total, factura.moneda)}
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <Link href={`/facturacion/${factura.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Top clientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Top Clientes del Año
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topClientes.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay datos disponibles</p>
                ) : (
                  topClientes.map((cliente, index) => (
                    <div key={cliente.clienteId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {cliente.cliente?.razonSocial}
                          </div>
                          <div className="text-xs text-gray-500">
                            {cliente._count} facturas
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-purple-600">
                        {formatCurrency(cliente._sum.total || 0)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumen anual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Resumen del Año
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Facturado</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(estadisticas.totalAño)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Promedio Mensual</span>
                <span className="font-semibold">
                  {formatCurrency(estadisticas.totalAño / 12)}
                </span>
              </div>
              
              <div className="pt-3 border-t">
                <div className="text-xs text-gray-500 mb-2">Ingresos últimos 30 días</div>
                <div className="h-16 flex items-end space-x-1">
                  {ingresosPorMes.map((ingreso, index) => {
                    const altura = Math.max(
                      (ingreso._sum.total || 0) / Math.max(...ingresosPorMes.map(i => i._sum.total || 0)) * 100, 
                      5
                    )
                    return (
                      <div 
                        key={index}
                        className="bg-green-200 rounded-sm flex-1"
                        style={{ height: `${altura}%` }}
                        title={`${format(new Date(ingreso.fecha), 'dd/MM', { locale: es })}: ${formatCurrency(ingreso._sum.total || 0)}`}
                      />
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alertas */}
          {(estadisticas.vencidas.count > 0 || estadisticas.pendientes.count > 5) && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-5 w-5" />
                  Alertas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {estadisticas.vencidas.count > 0 && (
                  <div className="text-sm text-yellow-800">
                    • {estadisticas.vencidas.count} facturas vencidas requieren atención
                  </div>
                )}
                {estadisticas.pendientes.count > 5 && (
                  <div className="text-sm text-yellow-800">
                    • {estadisticas.pendientes.count} facturas pendientes de pago
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
