'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Plus, User, FileText, DollarSign, Phone, Mail, MapPin, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Cliente {
  id: string
  razonSocial: string | null
  email?: string | null
  telefono?: string | null
  direccion?: string | null
  tipoPersona: string
  estado: string
  fechaCreacion: Date
  expedientes: Array<{
    id: string
    numero: string
    estado: string
    fechaInicio: Date
  }>
  facturas: Array<{
    id: string
    total: number
    estado: string
  }>
  _count: {
    expedientes: number
    facturas: number
  }
}

interface ClientesListProps {
  clientes: Cliente[]
}

export default function ClientesList({ clientes }: ClientesListProps) {
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(cliente => {
    const coincideTexto = !filtroTexto || 
      cliente.razonSocial?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      cliente.telefono?.includes(filtroTexto)

    const coincideEstado = !filtroEstado || cliente.estado === filtroEstado

    return coincideTexto && coincideEstado
  })

  // Calcular estadísticas
  const totalClientes = clientes.length
  const clientesActivos = clientes.filter(c => c.estado === 'ACTIVO').length
  const clientesInactivos = clientes.filter(c => c.estado === 'INACTIVO').length

  const getInitials = (razonSocial: string | null) => {
    if (!razonSocial) return '??'
    const words = razonSocial.trim().split(' ')
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase()
    }
    return razonSocial.substring(0, 2).toUpperCase()
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'INACTIVO':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      case 'SUSPENDIDO':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{clientesActivos}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Inactivos</CardTitle>
            <User className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{clientesInactivos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Filtro y Acciones */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes por nombre, email o teléfono..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
            <option value="SUSPENDIDO">Suspendido</option>
          </select>
        </div>
        
        <Link href="/clientes/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </Link>
      </div>

      {/* Lista de Clientes */}
      <div className="grid gap-4">
        {clientesFiltrados.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron clientes</h3>
              <p className="text-muted-foreground text-center mb-4">
                {filtroTexto || filtroEstado ? 
                  'Intenta ajustar los filtros de búsqueda.' : 
                  'Aún no hay clientes registrados en el sistema.'
                }
              </p>
              {(!filtroTexto && !filtroEstado) && (
                <Link href="/clientes/nuevo">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primer Cliente
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          clientesFiltrados.map((cliente) => (
            <Card key={cliente.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getInitials(cliente.razonSocial)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link 
                          href={`/clientes/${cliente.id}`}
                          className="text-lg font-semibold hover:text-blue-600 transition-colors"
                        >
                          {cliente.razonSocial}
                        </Link>
                        <Badge className={getEstadoBadgeColor(cliente.estado)}>
                          {cliente.estado}
                        </Badge>
                        <Badge variant="outline">
                          {cliente.tipoPersona}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        {cliente.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{cliente.email}</span>
                          </div>
                        )}
                        
                        {cliente.telefono && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{cliente.telefono}</span>
                          </div>
                        )}
                        
                        {cliente.direccion && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{cliente.direccion}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(cliente.fechaCreacion), 'dd/MM/yyyy', { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-blue-600">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{cliente._count.expedientes}</span>
                        <span className="text-muted-foreground">expedientes</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-green-600">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">{cliente._count.facturas}</span>
                        <span className="text-muted-foreground">facturas</span>
                      </div>
                    </div>
                    
                    <Link href={`/clientes/${cliente.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </Link>
                  </div>
                </div>
                
                {/* Expedientes Recientes */}
                {cliente.expedientes.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground mb-2">Expedientes Recientes:</div>
                    <div className="flex flex-wrap gap-2">
                      {cliente.expedientes.slice(0, 3).map((expediente) => (
                        <Link
                          key={expediente.id}
                          href={`/expedientes/${expediente.id}`}
                          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded transition-colors"
                        >
                          {expediente.numero} - {expediente.estado}
                        </Link>
                      ))}
                      {cliente.expedientes.length > 3 && (
                        <span className="text-xs text-muted-foreground px-2 py-1">
                          +{cliente.expedientes.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Resumen de Resultados */}
      {clientesFiltrados.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Mostrando {clientesFiltrados.length} de {totalClientes} clientes
        </div>
      )}
    </div>
  )
}
