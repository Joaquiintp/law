'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, Plus, Users, Edit, Trash2, Check, X, Bot, Calendar as CalendarIcon, Shield, User, Package, Database } from 'lucide-react'
import { getRoleDisplayName, getRoleBadgeColor, getMensajeEstadoIA } from '@/lib/roles'
import { PaqueteXenova } from '@/lib/paquetes'
import { PaqueteSelector, PaqueteBadge } from './PaqueteSelector'
import { AddOnsManager } from './AddOnsManager'

interface Estudio {
  id: string
  nombre: string
  razonSocial: string
  cuit: string
  email: string
  telefono: string
  direccion: string
  activo: boolean
  paquete: PaqueteXenova
  maxUsuarios: number
  usuariosActuales: number
  fechaAlta: Date
  almacenamientoGB: number
  almacenamientoExtra: number
  almacenamientoUsadoMB: number
  iaLegalActivo: boolean
  iaLegalTipo?: 'FIJO' | 'CONSUMO'
  iaLegalFechaActivacion?: Date
  iaLegalFechaVencimiento?: Date
  iaLegalMaxConsultas: number
  iaLegalConsultasUsadas: number
}

interface Usuario {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'DUENO' | 'ABOGADO' | 'SECRETARIO'
  estudioId?: string
  estudioNombre?: string
  activo: boolean
}

export default function AdminPanel() {
  const [estudios, setEstudios] = useState<Estudio[]>([
    {
      id: '1',
      nombre: 'Estudio Jurídico González & Asociados',
      razonSocial: 'González y Asociados S.R.L.',
      cuit: '30-12345678-9',
      email: 'contacto@gonzalez.com.ar',
      telefono: '+54 11 4567-8900',
      direccion: 'Av. Corrientes 1234, CABA',
      activo: true,
      paquete: 'PRO',
      maxUsuarios: 20,
      usuariosActuales: 5,
      fechaAlta: new Date('2025-01-15'),
      almacenamientoGB: 25,
      almacenamientoExtra: 50,
      almacenamientoUsadoMB: 15360, // 15 GB usado
      iaLegalActivo: true,
      iaLegalTipo: 'FIJO',
      iaLegalFechaActivacion: new Date('2025-01-20'),
      iaLegalFechaVencimiento: new Date('2026-01-20'),
      iaLegalMaxConsultas: 1000,
      iaLegalConsultasUsadas: 453
    },
    {
      id: '2',
      nombre: 'Rodríguez & Partners',
      razonSocial: 'Rodríguez Legal Partners S.A.',
      cuit: '30-98765432-1',
      email: 'info@rodriguez-partners.com',
      telefono: '+54 11 5678-1234',
      direccion: 'Av. Santa Fe 5678, CABA',
      activo: true,
      paquete: 'FULL',
      maxUsuarios: -1, // ilimitado
      usuariosActuales: 12,
      fechaAlta: new Date('2024-11-20'),
      almacenamientoGB: 100,
      almacenamientoExtra: 0,
      almacenamientoUsadoMB: 45000, // 45 GB usado
      iaLegalActivo: false,
      iaLegalMaxConsultas: 0,
      iaLegalConsultasUsadas: 0
    }
  ])

  const [usuarios, setUsuarios] = useState<Usuario[]>([
    { id: '1', name: 'Estudio Jurídico González & Asociados', email: 'dueno@gonzalez.com.ar', role: 'DUENO', estudioId: '1', estudioNombre: 'Estudio Jurídico González & Asociados', activo: true },
    { id: '2', name: 'Juan Pérez', email: 'jperez@gonzalez.com.ar', role: 'ABOGADO', estudioId: '1', estudioNombre: 'Estudio Jurídico González & Asociados', activo: true },
    { id: '3', name: 'María González', email: 'mgonzalez@gonzalez.com.ar', role: 'ABOGADO', estudioId: '1', estudioNombre: 'Estudio Jurídico González & Asociados', activo: true },
    { id: '4', name: 'Rodríguez & Partners', email: 'admin@rodriguez-partners.com', role: 'DUENO', estudioId: '2', estudioNombre: 'Rodríguez & Partners', activo: true },
    { id: '5', name: 'Carlos Rodríguez', email: 'crodriguez@rodriguez-partners.com', role: 'ABOGADO', estudioId: '2', estudioNombre: 'Rodríguez & Partners', activo: true },
  ])

  const [showNuevoEstudioDialog, setShowNuevoEstudioDialog] = useState(false)
  const [showNuevoUsuarioDialog, setShowNuevoUsuarioDialog] = useState(false)
  const [showActivarIADialog, setShowActivarIADialog] = useState(false)
  const [estudioSeleccionado, setEstudioSeleccionado] = useState<string>('')
  const [estudioIASeleccionado, setEstudioIASeleccionado] = useState<Estudio | null>(null)

  const [nuevoEstudio, setNuevoEstudio] = useState({
    nombre: '',
    razonSocial: '',
    cuit: '',
    email: '',
    telefono: '',
    direccion: '',
    paquete: 'BASE' as PaqueteXenova,
    maxUsuarios: 5,
    almacenamientoGB: 5,
    almacenamientoExtra: 0,
    almacenamientoUsadoMB: 0
  })

  const [nuevoUsuario, setNuevoUsuario] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ABOGADO' as const,
    estudioId: ''
  })

  const [configIA, setConfigIA] = useState({
    activo: false,
    permanente: true,
    meses: 12,
    maxConsultas: 1000
  })

  const handleCrearEstudio = () => {
    const estudio: Estudio = {
      id: Date.now().toString(),
      ...nuevoEstudio,
      activo: true,
      usuariosActuales: 0,
      fechaAlta: new Date(),
      iaLegalActivo: false,
      iaLegalMaxConsultas: 0,
      iaLegalConsultasUsadas: 0
    }
    setEstudios([...estudios, estudio])
    setNuevoEstudio({
      nombre: '',
      razonSocial: '',
      cuit: '',
      email: '',
      telefono: '',
      direccion: '',
      paquete: 'BASE',
      maxUsuarios: 5,
      almacenamientoGB: 5,
      almacenamientoExtra: 0,
      almacenamientoUsadoMB: 0
    })
    setShowNuevoEstudioDialog(false)
  }

  const handleCrearUsuario = () => {
    const usuario: Usuario = {
      id: Date.now().toString(),
      ...nuevoUsuario,
      estudioNombre: estudios.find(e => e.id === nuevoUsuario.estudioId)?.nombre,
      activo: true
    }
    setUsuarios([...usuarios, usuario])
    setNuevoUsuario({
      name: '',
      email: '',
      password: '',
      role: 'ABOGADO',
      estudioId: ''
    })
    setShowNuevoUsuarioDialog(false)
  }

  const toggleEstudioActivo = (id: string) => {
    setEstudios(estudios.map(e => 
      e.id === id ? { ...e, activo: !e.activo } : e
    ))
  }

  const toggleUsuarioActivo = (id: string) => {
    setUsuarios(usuarios.map(u => 
      u.id === id ? { ...u, activo: !u.activo } : u
    ))
  }

  const handleAbrirActivarIA = (estudio: Estudio) => {
    setEstudioIASeleccionado(estudio)
    setConfigIA({
      activo: estudio.iaLegalActivo,
      permanente: !estudio.iaLegalFechaVencimiento,
      meses: 12,
      maxConsultas: estudio.iaLegalMaxConsultas || 1000
    })
    setShowActivarIADialog(true)
  }

  const handleActivarDesactivarIA = () => {
    if (!estudioIASeleccionado) return

    const ahora = new Date()
    const fechaVencimiento = configIA.permanente 
      ? undefined 
      : new Date(ahora.setMonth(ahora.getMonth() + configIA.meses))

    setEstudios(estudios.map(e => 
      e.id === estudioIASeleccionado.id 
        ? {
            ...e,
            iaLegalActivo: configIA.activo,
            iaLegalFechaActivacion: configIA.activo ? new Date() : e.iaLegalFechaActivacion,
            iaLegalFechaVencimiento: fechaVencimiento,
            iaLegalMaxConsultas: configIA.maxConsultas
          }
        : e
    ))

    setShowActivarIADialog(false)
    setEstudioIASeleccionado(null)
  }

  const [estudioGestionando, setEstudioGestionando] = useState<Estudio | null>(null)
  const [showPaquetesDialog, setShowPaquetesDialog] = useState(false)
  const [showAddOnsDialog, setShowAddOnsDialog] = useState(false)

  const handleCambiarPaquete = (estudioId: string, nuevoPaquete: PaqueteXenova) => {
    setEstudios(estudios.map(e => {
      if (e.id === estudioId) {
        // Actualizar límites según el paquete
        const limites = {
          BASE: { maxUsuarios: 5, almacenamientoGB: 5 },
          PRO: { maxUsuarios: 20, almacenamientoGB: 25 },
          FULL: { maxUsuarios: -1, almacenamientoGB: 100 }
        }
        return {
          ...e,
          paquete: nuevoPaquete,
          maxUsuarios: limites[nuevoPaquete].maxUsuarios,
          almacenamientoGB: limites[nuevoPaquete].almacenamientoGB
        }
      }
      return e
    }))
    setShowPaquetesDialog(false)
  }

  const handleActualizarAlmacenamiento = (estudioId: string, extraGB: number) => {
    setEstudios(estudios.map(e =>
      e.id === estudioId ? { ...e, almacenamientoExtra: extraGB } : e
    ))
  }

  const handleActualizarIA = (
    estudioId: string,
    config: { activo: boolean; tipo?: 'FIJO' | 'CONSUMO'; maxConsultas?: number }
  ) => {
    setEstudios(estudios.map(e =>
      e.id === estudioId
        ? {
            ...e,
            iaLegalActivo: config.activo,
            iaLegalTipo: config.tipo,
            iaLegalMaxConsultas: config.maxConsultas || 0,
            iaLegalFechaActivacion: config.activo && !e.iaLegalActivo ? new Date() : e.iaLegalFechaActivacion
          }
        : e
    ))
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-gray-600 mt-1">Gestión de estudios jurídicos y usuarios del sistema</p>
        </div>
        <Badge className="bg-purple-100 text-purple-700 text-sm px-3 py-1">
          Administrador ERP
        </Badge>
      </div>

      <Tabs defaultValue="estudios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="estudios">
            <Building2 className="h-4 w-4 mr-2" />
            Estudios ({estudios.length})
          </TabsTrigger>
          <TabsTrigger value="usuarios">
            <Users className="h-4 w-4 mr-2" />
            Usuarios ({usuarios.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab de Estudios */}
        <TabsContent value="estudios">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Estudios Jurídicos</CardTitle>
                <CardDescription>Gestiona los estudios jurídicos registrados en el sistema</CardDescription>
              </div>
              <Button onClick={() => setShowNuevoEstudioDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Estudio
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {estudios.map((estudio) => {
                  const estadoIA = getMensajeEstadoIA(estudio.iaLegalActivo, estudio.iaLegalFechaVencimiento)
                  return (
                  <div key={estudio.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg">{estudio.nombre}</h3>
                          <PaqueteBadge paquete={estudio.paquete} />
                          <Badge className={estudio.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {estudio.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEstudioGestionando(estudio)
                              setShowPaquetesDialog(true)
                            }}
                          >
                            <Package className="h-3 w-3 mr-1" />
                            Cambiar Paquete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEstudioGestionando(estudio)
                              setShowAddOnsDialog(true)
                            }}
                          >
                            <Database className="h-3 w-3 mr-1" />
                            Add-Ons
                          </Button>
                        </div>
                        
                        {/* Información del módulo IA Legal */}
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Bot className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">Módulo IA Legal</span>
                              <Badge className={estadoIA.color}>
                                {estadoIA.estado === 'activo' ? '✓ Activo' : estadoIA.estado === 'inactivo' ? '✗ No contratado' : '⚠ ' + estadoIA.estado}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant={estudio.iaLegalActivo ? "outline" : "default"}
                              onClick={() => handleAbrirActivarIA(estudio)}
                            >
                              {estudio.iaLegalActivo ? 'Gestionar' : 'Activar Módulo'}
                            </Button>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{estadoIA.mensaje}</p>
                          {estudio.iaLegalActivo && (
                            <p className="text-xs text-gray-500 mt-1">
                              Límite: {estudio.iaLegalMaxConsultas} consultas/mes
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                          <div><span className="font-medium">Razón Social:</span> {estudio.razonSocial}</div>
                          <div><span className="font-medium">CUIT:</span> {estudio.cuit}</div>
                          <div><span className="font-medium">Email:</span> {estudio.email}</div>
                          <div><span className="font-medium">Teléfono:</span> {estudio.telefono}</div>
                          <div><span className="font-medium">Dirección:</span> {estudio.direccion}</div>
                          <div><span className="font-medium">Usuarios:</span> {estudio.usuariosActuales}/{estudio.maxUsuarios}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleEstudioActivo(estudio.id)}
                        >
                          {estudio.activo ? <X className="h-4 w-4 text-red-600" /> : <Check className="h-4 w-4 text-green-600" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Usuarios */}
        <TabsContent value="usuarios">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Usuarios del Sistema</CardTitle>
                <CardDescription>Gestiona todos los usuarios agrupados por estudio</CardDescription>
              </div>
              <Button onClick={() => setShowNuevoUsuarioDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Usuarios ADMIN (sin estudio) */}
                {usuarios.filter(u => u.role === 'ADMIN').length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-lg">Administradores del Sistema</h3>
                      <Badge variant="outline" className="ml-auto">
                        {usuarios.filter(u => u.role === 'ADMIN').length} usuario(s)
                      </Badge>
                    </div>
                    <div className="space-y-2 pl-4">
                      {usuarios.filter(u => u.role === 'ADMIN').map((usuario) => (
                        <div key={usuario.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{usuario.name}</span>
                                <Badge className={getRoleBadgeColor(usuario.role)}>
                                  Administrador ERP
                                </Badge>
                                <Badge className={usuario.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                  {usuario.activo ? 'Activo' : 'Inactivo'}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 mt-1 ml-7">
                                <span className="font-medium">Email:</span> {usuario.email}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toggleUsuarioActivo(usuario.id)}
                              >
                                {usuario.activo ? <X className="h-4 w-4 text-red-600" /> : <Check className="h-4 w-4 text-green-600" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Usuarios agrupados por estudio */}
                {estudios.map((estudio) => {
                  const usuariosDelEstudio = usuarios.filter(u => u.estudioId === estudio.id)
                  if (usuariosDelEstudio.length === 0) return null

                  return (
                    <div key={estudio.id}>
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">{estudio.nombre}</h3>
                        <Badge className={estudio.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {estudio.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Badge variant="outline" className="ml-auto">
                          {usuariosDelEstudio.length}/{estudio.maxUsuarios} usuarios
                        </Badge>
                      </div>
                      <div className="space-y-2 pl-4">
                        {usuariosDelEstudio.map((usuario) => (
                          <div key={usuario.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">{usuario.name}</span>
                                  <Badge className={getRoleBadgeColor(usuario.role)}>
                                    {getRoleDisplayName(usuario.role, usuario.role === 'DUENO' ? estudio.nombre : undefined)}
                                  </Badge>
                                  <Badge className={usuario.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                    {usuario.activo ? 'Activo' : 'Inactivo'}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600 mt-1 ml-7">
                                  <span className="font-medium">Email:</span> {usuario.email}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => toggleUsuarioActivo(usuario.id)}
                                >
                                  {usuario.activo ? <X className="h-4 w-4 text-red-600" /> : <Check className="h-4 w-4 text-green-600" />}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* Mensaje si no hay usuarios */}
                {usuarios.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No hay usuarios registrados en el sistema</p>
                    <Button className="mt-4" onClick={() => setShowNuevoUsuarioDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Usuario
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Nuevo Estudio */}
      <Dialog open={showNuevoEstudioDialog} onOpenChange={setShowNuevoEstudioDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Estudio</DialogTitle>
            <DialogDescription>
              Completa la información del estudio jurídico
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="nombre">Nombre del Estudio *</Label>
              <Input
                id="nombre"
                value={nuevoEstudio.nombre}
                onChange={(e) => setNuevoEstudio({ ...nuevoEstudio, nombre: e.target.value })}
                placeholder="Ej: Estudio Jurídico González & Asociados"
              />
            </div>

            <div>
              <Label htmlFor="razonSocial">Razón Social</Label>
              <Input
                id="razonSocial"
                value={nuevoEstudio.razonSocial}
                onChange={(e) => setNuevoEstudio({ ...nuevoEstudio, razonSocial: e.target.value })}
                placeholder="González y Asociados S.R.L."
              />
            </div>

            <div>
              <Label htmlFor="cuit">CUIT</Label>
              <Input
                id="cuit"
                value={nuevoEstudio.cuit}
                onChange={(e) => setNuevoEstudio({ ...nuevoEstudio, cuit: e.target.value })}
                placeholder="30-12345678-9"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={nuevoEstudio.email}
                onChange={(e) => setNuevoEstudio({ ...nuevoEstudio, email: e.target.value })}
                placeholder="contacto@estudio.com.ar"
              />
            </div>

            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={nuevoEstudio.telefono}
                onChange={(e) => setNuevoEstudio({ ...nuevoEstudio, telefono: e.target.value })}
                placeholder="+54 11 1234-5678"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={nuevoEstudio.direccion}
                onChange={(e) => setNuevoEstudio({ ...nuevoEstudio, direccion: e.target.value })}
                placeholder="Av. Corrientes 1234, CABA"
              />
            </div>

            <div>
              <Label htmlFor="paquete">Paquete XenovaLaw</Label>
              <Select
                value={nuevoEstudio.paquete}
                onValueChange={(value: PaqueteXenova) => {
                  const limites = {
                    BASE: { maxUsuarios: 5, almacenamientoGB: 5 },
                    PRO: { maxUsuarios: 20, almacenamientoGB: 25 },
                    FULL: { maxUsuarios: -1, almacenamientoGB: 100 }
                  }
                  setNuevoEstudio({ 
                    ...nuevoEstudio, 
                    paquete: value,
                    maxUsuarios: limites[value].maxUsuarios,
                    almacenamientoGB: limites[value].almacenamientoGB
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASE">🟢 BASE - Digitalización Jurídica (5 usuarios, 5GB)</SelectItem>
                  <SelectItem value="PRO">🟡 PRO - Automatización Legal (20 usuarios, 25GB)</SelectItem>
                  <SelectItem value="FULL">🔵 FULL - Operación Inteligente (Ilimitado, 100GB)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="maxUsuarios">Máximo de Usuarios</Label>
              <Input
                id="maxUsuarios"
                type="text"
                value={nuevoEstudio.maxUsuarios === -1 ? 'Ilimitado' : nuevoEstudio.maxUsuarios}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNuevoEstudioDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCrearEstudio}>
              Crear Estudio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Nuevo Usuario */}
      <Dialog open={showNuevoUsuarioDialog} onOpenChange={setShowNuevoUsuarioDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Completa la información del usuario
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-name">Nombre Completo *</Label>
              <Input
                id="user-name"
                value={nuevoUsuario.name}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, name: e.target.value })}
                placeholder="Juan Pérez"
              />
              <p className="text-xs text-gray-500 mt-1">
                Si el rol es "Estudio", usa el nombre del estudio
              </p>
            </div>

            <div>
              <Label htmlFor="user-email">Email *</Label>
              <Input
                id="user-email"
                type="email"
                value={nuevoUsuario.email}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                placeholder="usuario@estudio.com.ar"
              />
            </div>

            <div>
              <Label htmlFor="user-password">Contraseña *</Label>
              <Input
                id="user-password"
                type="password"
                value={nuevoUsuario.password}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">
                Esta será la contraseña definitiva del usuario
              </p>
            </div>

            <div>
              <Label htmlFor="user-estudio">Estudio *</Label>
              <Select
                value={nuevoUsuario.estudioId}
                onValueChange={(value) => setNuevoUsuario({ ...nuevoUsuario, estudioId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estudio" />
                </SelectTrigger>
                <SelectContent>
                  {estudios.filter(e => e.activo).map((estudio) => (
                    <SelectItem key={estudio.id} value={estudio.id}>
                      {estudio.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="user-role">Rol *</Label>
              <Select
                value={nuevoUsuario.role}
                onValueChange={(value: any) => setNuevoUsuario({ ...nuevoUsuario, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador ERP</SelectItem>
                  <SelectItem value="DUENO">Estudio (Dueño)</SelectItem>
                  <SelectItem value="ABOGADO">Abogado/a</SelectItem>
                  <SelectItem value="SECRETARIO">Secretario/a</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNuevoUsuarioDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCrearUsuario}>
              Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Activación/Gestión de IA Legal */}
      <Dialog open={showActivarIADialog} onOpenChange={setShowActivarIADialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              Gestión del Módulo IA Legal
            </DialogTitle>
            <DialogDescription>
              Configure la activación y límites del módulo de Inteligencia Artificial Legal para{' '}
              <span className="font-semibold">{estudioIASeleccionado?.nombre}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Estado del módulo */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${configIA.activo ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div>
                  <p className="font-medium">Estado del Módulo</p>
                  <p className="text-sm text-gray-600">
                    {configIA.activo ? 'Módulo activado y funcional' : 'Módulo desactivado'}
                  </p>
                </div>
              </div>
              <Button
                variant={configIA.activo ? "outline" : "default"}
                onClick={() => setConfigIA(prev => ({ ...prev, activo: !prev.activo }))}
              >
                {configIA.activo ? 'Desactivar' : 'Activar'}
              </Button>
            </div>

            {configIA.activo && (
              <>
                {/* Duración del plan */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Duración de la Suscripción</Label>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="permanente"
                      checked={configIA.permanente}
                      onChange={(e) => setConfigIA(prev => ({ ...prev, permanente: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="permanente" className="text-sm font-normal cursor-pointer">
                      Suscripción permanente (sin fecha de vencimiento)
                    </Label>
                  </div>

                  {!configIA.permanente && (
                    <div className="space-y-2">
                      <Label htmlFor="meses">Duración en meses</Label>
                      <Input
                        id="meses"
                        type="number"
                        min={1}
                        max={36}
                        value={configIA.meses}
                        onChange={(e) => setConfigIA(prev => ({ ...prev, meses: parseInt(e.target.value) || 1 }))}
                        className="max-w-xs"
                      />
                      <p className="text-xs text-gray-500">
                        El módulo vencerá el:{' '}
                        {format(
                          new Date(new Date().setMonth(new Date().getMonth() + configIA.meses)),
                          "d 'de' MMMM 'de' yyyy",
                          { locale: es }
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Límite de consultas */}
                <div className="space-y-2">
                  <Label htmlFor="maxConsultas" className="text-base font-semibold">
                    Límite de Consultas Mensuales
                  </Label>
                  <Input
                    id="maxConsultas"
                    type="number"
                    min={0}
                    step={100}
                    value={configIA.maxConsultas}
                    onChange={(e) => setConfigIA(prev => ({ ...prev, maxConsultas: parseInt(e.target.value) || 0 }))}
                    className="max-w-xs"
                  />
                  <p className="text-xs text-gray-500">
                    Cantidad máxima de consultas al asistente de IA por mes. Dejar en 0 para ilimitado.
                  </p>
                  
                  {/* Sugerencias de planes */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfigIA(prev => ({ ...prev, maxConsultas: 500 }))}
                    >
                      Plan Básico (500)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfigIA(prev => ({ ...prev, maxConsultas: 1000 }))}
                    >
                      Plan Estándar (1000)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfigIA(prev => ({ ...prev, maxConsultas: 5000 }))}
                    >
                      Plan Premium (5000)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfigIA(prev => ({ ...prev, maxConsultas: 0 }))}
                    >
                      Ilimitado
                    </Button>
                  </div>
                </div>

                {/* Resumen de configuración */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-semibold text-blue-900 mb-2">📋 Resumen de Configuración</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Estado: <span className="font-medium">Activo</span></li>
                    <li>
                      • Duración:{' '}
                      <span className="font-medium">
                        {configIA.permanente ? 'Permanente (sin vencimiento)' : `${configIA.meses} meses`}
                      </span>
                    </li>
                    <li>
                      • Límite mensual:{' '}
                      <span className="font-medium">
                        {configIA.maxConsultas === 0 ? 'Ilimitado' : `${configIA.maxConsultas} consultas`}
                      </span>
                    </li>
                    {!configIA.permanente && (
                      <li>
                        • Fecha de vencimiento:{' '}
                        <span className="font-medium">
                          {format(
                            new Date(new Date().setMonth(new Date().getMonth() + configIA.meses)),
                            "d 'de' MMMM 'de' yyyy",
                            { locale: es }
                          )}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivarIADialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleActivarDesactivarIA}>
              Guardar Configuración
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para cambiar paquete */}
      <Dialog open={showPaquetesDialog} onOpenChange={setShowPaquetesDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cambiar Paquete XenovaLaw</DialogTitle>
            <DialogDescription>
              {estudioGestionando && (
                <>
                  Gestiona el paquete del estudio <strong>{estudioGestionando.nombre}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {estudioGestionando && (
            <PaqueteSelector
              paqueteActual={estudioGestionando.paquete}
              onSeleccionar={(paquete) => handleCambiarPaquete(estudioGestionando.id, paquete)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para gestionar Add-Ons */}
      <Dialog open={showAddOnsDialog} onOpenChange={setShowAddOnsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestionar Add-Ons</DialogTitle>
            <DialogDescription>
              {estudioGestionando && (
                <>
                  Administra el almacenamiento extra y el módulo de IA Legal para{' '}
                  <strong>{estudioGestionando.nombre}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {estudioGestionando && (
            <AddOnsManager
              estudio={estudioGestionando}
              onActualizarAlmacenamiento={(extraGB) =>
                handleActualizarAlmacenamiento(estudioGestionando.id, extraGB)
              }
              onActualizarIA={(config) => handleActualizarIA(estudioGestionando.id, config)}
            />
          )}

          <DialogFooter>
            <Button onClick={() => setShowAddOnsDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
