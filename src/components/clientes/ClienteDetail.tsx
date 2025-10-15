'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Edit, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  DollarSign,
  Clock,
  Users,
  Building,
  Hash,
  CheckCircle,
  AlertCircle,
  XCircle,
  CreditCard,
  Building2
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ClienteDetailProps {
  cliente: {
    id: string
    razonSocial: string | null
    email?: string | null
    telefono?: string | null
    direccion?: string | null
    tipoPersona: string
    cuitCuil?: string | null
    estado: string
    fechaCreacion: Date
    cbu?: string | null
    banco?: string | null
    expedientes: Array<{
      id: string
      numero: string
      caratula: string
      estado: string
      fechaInicio: Date
      fechaCierre?: Date | null
      fuero: string
      materia: string
      _count: {
        documentos: number
        audiencias: number
        tareas: number
      }
    }>
    facturas: Array<{
      id: string
      numero: string
      fecha: Date
      fechaVencimiento: Date
      total: number
      estado: string
    }>
    _count: {
      expedientes: number
      facturas: number
    }
  }
}

export default function ClienteDetail({ cliente }: ClienteDetailProps) {
  const [activeTab, setActiveTab] = useState('informacion')

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

  const getExpedienteEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return { icon: CheckCircle, color: 'text-green-600 bg-green-100' }
      case 'PENDIENTE':
        return { icon: AlertCircle, color: 'text-yellow-600 bg-yellow-100' }
      case 'CERRADO':
        return { icon: XCircle, color: 'text-gray-600 bg-gray-100' }
      default:
        return { icon: Clock, color: 'text-blue-600 bg-blue-100' }
    }
  }

  const getFacturaEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'PAGADA':
        return { color: 'bg-green-100 text-green-800' }
      case 'PENDIENTE':
        return { color: 'bg-yellow-100 text-yellow-800' }
      case 'VENCIDA':
        return { color: 'bg-red-100 text-red-800' }
      default:
        return { color: 'bg-gray-100 text-gray-800' }
    }
  }

  // Calcular estadísticas del cliente
  const totalFacturado = cliente.facturas.reduce((total, factura) => total + factura.total, 0)
  const facturasPendientes = cliente.facturas.filter(f => f.estado === 'PENDIENTE').length
  const expedientesActivos = cliente.expedientes.filter(e => e.estado === 'ACTIVO').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/clientes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Clientes
            </Button>
          </Link>
          <div className="h-6 border-l border-gray-300" />
          <h1 className="text-3xl font-bold text-gray-900">
            {cliente.razonSocial}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/clientes/${cliente.id}/editar`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar Cliente
            </Button>
          </Link>
          <Link href={`/expedientes/nuevo?clienteId=${cliente.id}`}>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Nuevo Expediente
            </Button>
          </Link>
        </div>
      </div>

      {/* Información Principal del Cliente */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                {getInitials(cliente.razonSocial)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-semibold">{cliente.razonSocial}</h2>
                <Badge className={getEstadoBadgeColor(cliente.estado)}>
                  {cliente.estado}
                </Badge>
                <Badge variant="outline">
                  {cliente.tipoPersona}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {cliente.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{cliente.email}</span>
                  </div>
                )}
                
                {cliente.telefono && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{cliente.telefono}</span>
                  </div>
                )}
                
                {cliente.direccion && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{cliente.direccion}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Cliente desde {format(new Date(cliente.fechaCreacion), 'dd/MM/yyyy', { locale: es })}</span>
                </div>
                
                {cliente.cuitCuil && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span>CUIT/CUIL: {cliente.cuitCuil}</span>
                  </div>
                )}
                
                {cliente.razonSocial && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{cliente.razonSocial}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Estadísticas Rápidas */}
            <div className="grid grid-cols-1 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{cliente._count.expedientes}</div>
                <div className="text-sm text-blue-600">Expedientes</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  ${totalFacturado.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">Facturado</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs con Información Detallada */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="informacion">Información</TabsTrigger>
          <TabsTrigger value="expedientes">
            Expedientes ({cliente._count.expedientes})
          </TabsTrigger>
          <TabsTrigger value="facturacion">
            Facturación ({cliente._count.facturas})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="informacion" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Personal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium text-muted-foreground">Razón Social / Nombre:</span>
                  <span className="col-span-2">{cliente.razonSocial}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium text-muted-foreground">Tipo:</span>
                  <span className="col-span-2">{cliente.tipoPersona}</span>
                </div>
                {cliente.cuitCuil && (
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="font-medium text-muted-foreground">CUIT/CUIL:</span>
                    <span className="col-span-2">{cliente.cuitCuil}</span>
                  </div>
                )}
                {cliente.razonSocial && (
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="font-medium text-muted-foreground">Razón Social:</span>
                    <span className="col-span-2">{cliente.razonSocial}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información de Contacto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cliente.email && (
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="font-medium text-muted-foreground">Email:</span>
                    <span className="col-span-2">{cliente.email}</span>
                  </div>
                )}
                {cliente.telefono && (
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="font-medium text-muted-foreground">Teléfono:</span>
                    <span className="col-span-2">{cliente.telefono}</span>
                  </div>
                )}
                {cliente.direccion && (
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="font-medium text-muted-foreground">Dirección:</span>
                    <span className="col-span-2">{cliente.direccion}</span>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium text-muted-foreground">Estado:</span>
                  <span className="col-span-2">
                    <Badge className={getEstadoBadgeColor(cliente.estado)}>
                      {cliente.estado}
                    </Badge>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium text-muted-foreground">Creado:</span>
                  <span className="col-span-2">
                    {format(new Date(cliente.fechaCreacion), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Información Bancaria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Información Bancaria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cliente.banco || cliente.cbu ? (
                  <>
                    {cliente.banco && (
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <span className="font-medium text-muted-foreground">Banco:</span>
                        <span className="col-span-2 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {cliente.banco}
                        </span>
                      </div>
                    )}
                    {cliente.cbu && (
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <span className="font-medium text-muted-foreground">CBU:</span>
                        <span className="col-span-2 font-mono text-xs bg-gray-50 px-2 py-1 rounded">
                          {cliente.cbu}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No se declararon datos bancarios
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resumen de Actividad */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{expedientesActivos}</div>
                  <div className="text-sm text-blue-600">Expedientes Activos</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{cliente._count.facturas}</div>
                  <div className="text-sm text-green-600">Total Facturas</div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-xl font-bold text-yellow-600">{facturasPendientes}</div>
                  <div className="text-sm text-yellow-600">Facturas Pendientes</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    ${totalFacturado.toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-600">Total Facturado</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expedientes" className="space-y-4">
          {cliente.expedientes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay expedientes</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Este cliente aún no tiene expedientes asignados.
                </p>
                <Link href={`/expedientes/nuevo?clienteId=${cliente.id}`}>
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    Crear Primer Expediente
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {cliente.expedientes.map((expediente) => {
                const estadoBadge = getExpedienteEstadoBadge(expediente.estado)
                const IconComponent = estadoBadge.icon
                
                return (
                  <Card key={expediente.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Link 
                              href={`/expedientes/${expediente.id}`}
                              className="text-lg font-semibold hover:text-blue-600 transition-colors"
                            >
                              {expediente.numero}
                            </Link>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${estadoBadge.color}`}>
                              <IconComponent className="h-3 w-3" />
                              {expediente.estado}
                            </div>
                            <Badge variant="outline">
                              {expediente.materia}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-3">{expediente.caratula}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Inicio: {format(new Date(expediente.fechaInicio), 'dd/MM/yyyy', { locale: es })}
                            </div>
                            {expediente.fechaCierre && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Cierre: {format(new Date(expediente.fechaCierre), 'dd/MM/yyyy', { locale: es })}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 ml-4">
                          <div className="text-right text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>{expediente._count.documentos} docs</span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{expediente._count.audiencias} audiencias</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{expediente._count.tareas} tareas</span>
                            </div>
                          </div>
                          
                          <Link href={`/expedientes/${expediente.id}`}>
                            <Button variant="outline" size="sm">
                              Ver Expediente
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="facturacion" className="space-y-4">
          {cliente.facturas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay facturas</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Este cliente aún no tiene facturas emitidas.
                </p>
                <Link href={`/facturacion/nueva?clienteId=${cliente.id}`}>
                  <Button>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Crear Primera Factura
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Resumen Financiero */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${totalFacturado.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Facturado</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {cliente.facturas.filter(f => f.estado === 'PAGADA').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Facturas Pagadas</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {facturasPendientes}
                    </div>
                    <div className="text-sm text-muted-foreground">Facturas Pendientes</div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Lista de Facturas */}
              <div className="grid gap-4">
                {cliente.facturas.map((factura) => {
                  const estadoBadge = getFacturaEstadoBadge(factura.estado)
                  
                  return (
                    <Card key={factura.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Link 
                                href={`/facturacion/${factura.id}`}
                                className="text-lg font-semibold hover:text-blue-600 transition-colors"
                              >
                                Factura {factura.numero}
                              </Link>
                              <Badge className={estadoBadge.color}>
                                {factura.estado}
                              </Badge>
                            </div>
                            

                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Emitida: {format(new Date(factura.fecha), 'dd/MM/yyyy', { locale: es })}
                              </div>
                              {factura.fechaVencimiento && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Vence: {format(new Date(factura.fechaVencimiento), 'dd/MM/yyyy', { locale: es })}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-xl font-bold text-green-600">
                                ${factura.total.toLocaleString()}
                              </div>
                            </div>
                            
                            <Link href={`/facturacion/${factura.id}`}>
                              <Button variant="outline" size="sm">
                                Ver Factura
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
