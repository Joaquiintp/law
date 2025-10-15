'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Plus, 
  FileText, 
  Download, 
  Eye,
  Filter,
  Calendar,
  User,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Factura {
  id: string
  numero: string
  fecha: Date
  fechaVencimiento: Date
  subtotal: number
  impuestos: number
  total: number
  estado: string
  moneda: string
  cliente: {
    id: string
    nombre: string
    apellido: string
    email: string | null
  }
  honorarios: Array<{
    id: string
    concepto: string
    monto: number
  }>
}

interface Cliente {
  id: string
  nombre: string
  apellido: string
}

interface FacturasListProps {
  data: {
    facturas: Factura[]
    total: number
    page: number
    totalPages: number
  }
  clientes: Cliente[]
  searchParams: { [key: string]: string | undefined }
}

export default function FacturasList({ 
  data, 
  clientes, 
  searchParams 
}: FacturasListProps) {
  const router = useRouter()
  const currentSearchParams = useSearchParams()
  
  const [filtroTexto, setFiltroTexto] = useState(searchParams.search || '')
  const [filtroCliente, setFiltroCliente] = useState(searchParams.clienteId || '')
  const [filtroEstado, setFiltroEstado] = useState(searchParams.estado || '')
  const [fechaDesde, setFechaDesde] = useState(searchParams.fechaDesde || '')
  const [fechaHasta, setFechaHasta] = useState(searchParams.fechaHasta || '')

  const estados = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'PAGADA', label: 'Pagada' },
    { value: 'VENCIDA', label: 'Vencida' },
    { value: 'CANCELADA', label: 'Cancelada' }
  ]

  const aplicarFiltros = () => {
    const params = new URLSearchParams()
    
    if (filtroTexto) params.set('search', filtroTexto)
    if (filtroCliente) params.set('clienteId', filtroCliente)
    if (filtroEstado) params.set('estado', filtroEstado)
    if (fechaDesde) params.set('fechaDesde', fechaDesde)
    if (fechaHasta) params.set('fechaHasta', fechaHasta)
    
    router.push(`/facturacion/todas?${params.toString()}`)
  }

  const limpiarFiltros = () => {
    setFiltroTexto('')
    setFiltroCliente('')
    setFiltroEstado('')
    setFechaDesde('')
    setFechaHasta('')
    router.push('/facturacion/todas')
  }

  const cambiarPagina = (nuevaPagina: number) => {
    const params = new URLSearchParams(currentSearchParams)
    params.set('page', nuevaPagina.toString())
    router.push(`/facturacion/todas?${params.toString()}`)
  }

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

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Página</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.facturas.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.facturas.reduce((sum, f) => sum + f.total, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Página Actual</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {data.page} de {data.totalPages}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de filtro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar facturas..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="">Todos los clientes</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.apellido}, {cliente.nombre}
                </option>
              ))}
            </select>
            
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="">Todos los estados</option>
              {estados.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
            
            <Input
              type="date"
              placeholder="Fecha desde"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
            
            <Input
              type="date"
              placeholder="Fecha hasta"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex space-x-2">
              <Button onClick={aplicarFiltros}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              <Button variant="outline" onClick={limpiarFiltros}>
                Limpiar
              </Button>
            </div>
            
            <Link href="/facturacion/nueva">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Factura
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Lista de facturas */}
      <div className="grid gap-4">
        {data.facturas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron facturas</h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchParams.search || searchParams.clienteId || searchParams.estado
                  ? 'Intenta ajustar los filtros de búsqueda.'
                  : 'Comienza creando tu primera factura.'
                }
              </p>
              {!searchParams.search && !searchParams.clienteId && !searchParams.estado && (
                <Link href="/facturacion/nueva">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primera Factura
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          data.facturas.map((factura) => (
            <Card key={factura.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Icono de la factura */}
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Número y estado */}
                      <div className="flex items-center gap-3 mb-2">
                        <Link 
                          href={`/facturacion/${factura.id}`}
                          className="text-lg font-semibold hover:text-blue-600 transition-colors"
                        >
                          {factura.numero}
                        </Link>
                        <Badge className={getEstadoBadgeColor(factura.estado)}>
                          {factura.estado}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {factura.moneda}
                        </span>
                      </div>
                      
                      {/* Cliente */}
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <Link 
                          href={`/clientes/${factura.cliente.id}`}
                          className="flex items-center hover:text-blue-600 transition-colors"
                        >
                          <User className="h-4 w-4 mr-1" />
                          {factura.cliente.nombre} {factura.cliente.apellido}
                        </Link>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(factura.fecha), 'dd/MM/yyyy', { locale: es })}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Vence: {format(new Date(factura.fechaVencimiento), 'dd/MM/yyyy', { locale: es })}
                        </div>
                      </div>
                      
                      {/* Honorarios */}
                      {factura.honorarios.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {factura.honorarios.length} honorario{factura.honorarios.length > 1 ? 's' : ''}: {' '}
                          {factura.honorarios.slice(0, 2).map(h => h.concepto).join(', ')}
                          {factura.honorarios.length > 2 && ` y ${factura.honorarios.length - 2} más`}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Total y acciones */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(factura.total, factura.moneda)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Subtotal: {formatCurrency(factura.subtotal, factura.moneda)}
                      </div>
                      <div className="text-xs text-gray-400">
                        IVA: {formatCurrency(factura.impuestos, factura.moneda)}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Link href={`/facturacion/${factura.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Paginación */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando {((data.page - 1) * 20) + 1} a {Math.min(data.page * 20, data.total)} de {data.total} facturas
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => cambiarPagina(data.page - 1)}
              disabled={data.page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, data.page - 2) + i
                if (pageNum > data.totalPages) return null
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === data.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => cambiarPagina(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => cambiarPagina(data.page + 1)}
              disabled={data.page >= data.totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
