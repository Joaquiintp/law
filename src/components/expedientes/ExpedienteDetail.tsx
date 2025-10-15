'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft,
  Edit,
  FileText,
  Calendar,
  CheckSquare,
  DollarSign,
  User,
  Building,
  Clock,
  Plus,
  Download,
  Eye,
  Upload,
  X,
  Folder,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import TareasExpedienteView from './TareasExpedienteView'
import SelectorCarpetas from '../documentos/SelectorCarpetas'

interface Carpeta {
  id: string
  nombre: string
  color: string
}

interface ArchivoTemporal {
  file: File
  etiqueta: string
  nombreOriginal: string
}

interface ExpedienteDetailProps {
  expediente: {
    id: string
    numero: string
    caratula: string
    fuero: string
    materia: string
    estado: string
    juzgado?: string | null
    secretaria?: string | null
    fechaInicio: Date
    fechaCierre?: Date | null
    fechaProximaAudiencia?: Date | null
    descripcion?: string | null
    observaciones?: string | null
    cliente: {
      id: string
      razonSocial: string
      email?: string | null
      telefono?: string | null
      documento: string
    }
    responsable: {
      id: string
      name?: string | null
    }
    creador: {
      id: string
      name?: string | null
    }
    documentos: Array<{
      id: string
      nombre: string
      tipoDocumento: string
      version: number
      createdAt: Date
      creador: {
        name?: string | null
      }
    }>
    audiencias: Array<{
      id: string
      fecha: Date
      hora: string
      tipo: string
      lugar?: string | null
      modalidad: string
      estado: string
      responsable: {
        name?: string | null
      }
    }>
    tareas: Array<{
      id: string
      titulo: string
      descripcion?: string | null
      prioridad: string
      estado: string
      fechaVencimiento: Date
      fechaCompletado?: Date | null
      asignado: {
        name?: string | null
      }
    }>
    honorarios: Array<{
      id: string
      concepto: string
      monto: number
      moneda: string
      fechaServicio: Date
      estado: string
    }>
  }
}

const getEstadoBadge = (estado: string) => {
  const variants = {
    ACTIVO: 'bg-green-100 text-green-700',
    SUSPENDIDO: 'bg-yellow-100 text-yellow-700', 
    CERRADO: 'bg-gray-100 text-gray-700',
    ARCHIVADO: 'bg-blue-100 text-blue-700'
  }
  
  return variants[estado as keyof typeof variants] || 'bg-gray-100 text-gray-700'
}

const getPrioridadBadge = (prioridad: string) => {
  const variants = {
    ALTA: 'bg-red-100 text-red-700',
    MEDIA: 'bg-yellow-100 text-yellow-700',
    BAJA: 'bg-green-100 text-green-700',
    URGENTE: 'bg-purple-100 text-purple-700'
  }
  
  return variants[prioridad as keyof typeof variants] || 'bg-gray-100 text-gray-700'
}

export default function ExpedienteDetail({ expediente }: ExpedienteDetailProps) {
  // Estados para subir documentos
  const [dialogSubirDocumento, setDialogSubirDocumento] = useState(false)
  const [archivosTemporales, setArchivosTemporales] = useState<ArchivoTemporal[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estados para carpetas
  const [carpetas, setCarpetas] = useState<Carpeta[]>([
    { id: '1', nombre: 'Contratos', color: 'blue' },
    { id: '2', nombre: 'Demandas', color: 'red' },
    { id: '3', nombre: 'Pruebas', color: 'green' },
    { id: '4', nombre: 'Sentencias', color: 'purple' }
  ])
  const [carpetaSeleccionada, setCarpetaSeleccionada] = useState<string>('')
  const [carpetaFiltro, setCarpetaFiltro] = useState<string>('todas') // Para el filtro de visualización
  
  // Estados para documentos guardados (simulado)
  const [documentosGuardados, setDocumentosGuardados] = useState<Array<{
    id: string
    nombre: string
    nombreOriginal: string
    tipoDocumento: string
    tamanio: number
    fechaCreacion: Date
    carpetaId?: string
    carpetaNombre?: string
    url: string
  }>>([])

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    agregarArchivos(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    agregarArchivos(files)
  }

  const agregarArchivos = (files: File[]) => {
    const nuevosArchivos: ArchivoTemporal[] = files.map(file => ({
      file,
      etiqueta: file.name,
      nombreOriginal: file.name
    }))
    setArchivosTemporales(prev => [...prev, ...nuevosArchivos])
  }

  const handleCambiarEtiqueta = (index: number, nuevaEtiqueta: string) => {
    setArchivosTemporales(prev => 
      prev.map((archivo, i) => 
        i === index ? { ...archivo, etiqueta: nuevaEtiqueta } : archivo
      )
    )
  }

  const handleEliminarArchivoTemporal = (index: number) => {
    setArchivosTemporales(prev => prev.filter((_, i) => i !== index))
  }

  const handleCrearCarpeta = (nombre: string, color?: string) => {
    const nuevaCarpeta: Carpeta = {
      id: Date.now().toString(),
      nombre,
      color: color || 'blue'
    }
    setCarpetas(prev => [...prev, nuevaCarpeta])
    setCarpetaSeleccionada(nuevaCarpeta.id)
  }

  const handleSeleccionarCarpeta = (carpetaId: string | undefined) => {
    setCarpetaSeleccionada(carpetaId || '')
  }

  const handleGuardarDocumentos = () => {
    if (archivosTemporales.length === 0) return
    
    const carpeta = carpetas.find(c => c.id === carpetaSeleccionada)
    
    const nuevosDocumentos = archivosTemporales.map(archivo => ({
      id: Date.now().toString() + Math.random(),
      nombre: archivo.etiqueta,
      nombreOriginal: archivo.nombreOriginal,
      tipoDocumento: archivo.file.type || 'application/octet-stream',
      tamanio: archivo.file.size,
      fechaCreacion: new Date(),
      carpetaId: carpeta?.id,
      carpetaNombre: carpeta?.nombre,
      url: URL.createObjectURL(archivo.file)
    }))
    
    setDocumentosGuardados(prev => [...prev, ...nuevosDocumentos])
    
    // Aquí iría la llamada a la API
    console.log('Documentos a guardar:', nuevosDocumentos)
    console.log('Expediente ID:', expediente.id)
    
    // Limpiar y cerrar
    setArchivosTemporales([])
    setCarpetaSeleccionada('')
    setDialogSubirDocumento(false)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAbrirDocumento = (url: string) => {
    window.open(url, '_blank')
  }

  const handleDescargarDocumento = (url: string, nombre: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = nombre
    link.click()
  }

  const handleEliminarDocumento = (id: string) => {
    setDocumentosGuardados(prev => prev.filter(doc => doc.id !== id))
  }

  // Filtrar documentos según la carpeta seleccionada
  const documentosFiltrados = carpetaFiltro === 'todas' 
    ? documentosGuardados
    : documentosGuardados.filter(doc => doc.carpetaId === carpetaFiltro)

  // Obtener color de la carpeta
  const getColorCarpeta = (colorName: string) => {
    const colores: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700',
      red: 'bg-red-100 text-red-700',
      green: 'bg-green-100 text-green-700',
      purple: 'bg-purple-100 text-purple-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      orange: 'bg-orange-100 text-orange-700'
    }
    return colores[colorName] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/expedientes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-gray-900">{expediente.numero}</h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {expediente.cliente.razonSocial}
                </span>
              </div>
            </div>
            <p className="text-gray-600 mt-1 font-semibold">{expediente.caratula}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/expedientes/${expediente.id}/editar`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generar Reporte
          </Button>
        </div>
      </div>

      {/* Información general - Acordeón */}
      <Accordion type="multiple" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Información del Expediente */}
          <div>
            <AccordionItem value="expediente" className="border rounded-lg">
              <Card className="border-0">
                <AccordionTrigger className="px-6 hover:no-underline">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building className="h-4 w-4" />
                    Información del Expediente
                  </CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="space-y-4 pt-0">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Estado</label>
                        <div className="mt-1">
                          <Badge className={getEstadoBadge(expediente.estado)}>
                            {expediente.estado}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Fuero</label>
                        <p className="mt-1 text-sm">{expediente.fuero}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Materia</label>
                        <p className="mt-1 text-sm">{expediente.materia}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Juzgado</label>
                        <p className="mt-1 text-sm">{expediente.juzgado || 'Sin asignar'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Secretaría</label>
                        <p className="mt-1 text-sm">{expediente.secretaria || 'Sin asignar'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Responsable</label>
                        <p className="mt-1 text-sm">{expediente.responsable.name || 'Sin asignar'}</p>
                      </div>
                    </div>

                    {expediente.descripcion && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Descripción</label>
                        <p className="mt-1 text-sm text-gray-900">{expediente.descripcion}</p>
                      </div>
                    )}

                    {expediente.observaciones && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Observaciones</label>
                        <p className="mt-1 text-sm text-gray-900">{expediente.observaciones}</p>
                      </div>
                    )}
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </div>

          {/* Cliente */}
          <div>
            <AccordionItem value="cliente" className="border rounded-lg">
              <Card className="border-0">
                <AccordionTrigger className="px-6 hover:no-underline">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4" />
                    Cliente
                  </CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="space-y-3 pt-0">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Razón Social / Nombre Completo</label>
                      <p className="mt-1 text-sm font-medium">
                        {expediente.cliente.razonSocial}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Documento</label>
                      <p className="mt-1 text-sm">{expediente.cliente.documento}</p>
                    </div>
                    {expediente.cliente.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="mt-1 text-sm">{expediente.cliente.email}</p>
                      </div>
                    )}
                    {expediente.cliente.telefono && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Teléfono</label>
                        <p className="mt-1 text-sm">{expediente.cliente.telefono}</p>
                      </div>
                    )}
                    <div className="pt-2">
                      <Link href={`/clientes/${expediente.cliente.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          Ver Cliente Completo
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </div>

          {/* Fechas Importantes */}
          <div>
            <AccordionItem value="fechas" className="border rounded-lg">
              <Card className="border-0">
                <AccordionTrigger className="px-6 hover:no-underline">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4" />
                    Fechas Importantes
                  </CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="space-y-3 pt-0">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fecha de Inicio</label>
                      <p className="mt-1 text-sm">
                        {format(new Date(expediente.fechaInicio), 'dd/MM/yyyy', { locale: es })}
                      </p>
                    </div>
                    
                    {expediente.fechaProximaAudiencia && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Próxima Audiencia</label>
                        <p className="mt-1 text-sm font-medium text-blue-600">
                          {format(new Date(expediente.fechaProximaAudiencia), 'dd/MM/yyyy', { locale: es })}
                        </p>
                      </div>
                    )}
                    
                    {expediente.fechaCierre && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Fecha de Cierre</label>
                        <p className="mt-1 text-sm">
                          {format(new Date(expediente.fechaCierre), 'dd/MM/yyyy', { locale: es })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </div>
        </div>
      </Accordion>

      {/* Tabs con contenido detallado */}
      <Tabs defaultValue="tareas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tareas">
            Tareas ({expediente.tareas.length})
          </TabsTrigger>
          <TabsTrigger value="documentos">
            Documentos ({expediente.documentos.length})
          </TabsTrigger>
          <TabsTrigger value="audiencias">
            Audiencias ({expediente.audiencias.length})
          </TabsTrigger>
          <TabsTrigger value="honorarios">
            Honorarios ({expediente.honorarios.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tareas">
          <TareasExpedienteView
            expedienteId={expediente.id}
            tareasPendientes={expediente.tareas.filter(t => t.estado !== 'COMPLETADA').length}
            ultimoMovimiento={expediente.fechaInicio}
            periodoInicio={null}
            periodoFin={null}
          />
        </TabsContent>

        <TabsContent value="documentos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Documentos del Expediente</CardTitle>
              <div className="flex items-center gap-3">
                {/* Filtro por Carpeta */}
                <Select value={carpetaFiltro} onValueChange={setCarpetaFiltro}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrar por carpeta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        Todas las carpetas
                      </div>
                    </SelectItem>
                    {carpetas.map(carpeta => (
                      <SelectItem key={carpeta.id} value={carpeta.id}>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded ${getColorCarpeta(carpeta.color)}`} />
                          {carpeta.nombre}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Botón Subir Documento */}
                <Button onClick={() => setDialogSubirDocumento(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Subir Documento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(expediente.documentos.length > 0 || documentosGuardados.length > 0) ? (
                <div className="space-y-3">
                  {/* Documentos guardados localmente (nuevos) filtrados */}
                  {documentosFiltrados.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{doc.nombre}</span>
                          <Badge variant="outline">NUEVO</Badge>
                          {doc.carpetaNombre && (
                            <Badge 
                              variant="secondary" 
                              className={`flex items-center gap-1 ${getColorCarpeta(carpetas.find(c => c.id === doc.carpetaId)?.color || 'gray')}`}
                            >
                              <Folder className="h-3 w-3" />
                              {doc.carpetaNombre}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {doc.nombreOriginal} • {(doc.tamanio / 1024).toFixed(2)} KB • 
                          {format(doc.fechaCreacion, 'dd/MM/yyyy HH:mm', { locale: es })}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleAbrirDocumento(doc.url)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDescargarDocumento(doc.url, doc.nombre)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEliminarDocumento(doc.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Mensaje si no hay documentos en la carpeta filtrada */}
                  {carpetaFiltro !== 'todas' && documentosFiltrados.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Folder className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay documentos en esta carpeta.</p>
                    </div>
                  )}
                  
                  {/* Documentos existentes del expediente (siempre visibles) */}
                  {expediente.documentos.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{doc.nombre}</span>
                          <Badge variant="outline">v{doc.version}</Badge>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {doc.tipoDocumento} • Subido por {doc.creador.name} • 
                          {format(new Date(doc.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay documentos cargados en este expediente.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audiencias">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Audiencias Programadas</CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Audiencia
              </Button>
            </CardHeader>
            <CardContent>
              {expediente.audiencias.length > 0 ? (
                <div className="space-y-3">
                  {expediente.audiencias.map((audiencia) => (
                    <div key={audiencia.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{audiencia.tipo}</span>
                            <Badge className={audiencia.estado === 'PROGRAMADA' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                              {audiencia.estado}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p><strong>Fecha:</strong> {format(new Date(audiencia.fecha), 'dd/MM/yyyy', { locale: es })} a las {audiencia.hora}</p>
                            <p><strong>Lugar:</strong> {audiencia.lugar || 'Sin especificar'}</p>
                            <p><strong>Modalidad:</strong> {audiencia.modalidad}</p>
                            <p><strong>Responsable:</strong> {audiencia.responsable.name}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Ver Detalle
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay audiencias programadas para este expediente.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="honorarios">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Honorarios y Facturación</CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Honorario
              </Button>
            </CardHeader>
            <CardContent>
              {expediente.honorarios.length > 0 ? (
                <div className="space-y-3">
                  {expediente.honorarios.map((honorario) => (
                    <div key={honorario.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{honorario.concepto}</span>
                          <Badge className={honorario.estado === 'COBRADO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                            {honorario.estado}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="font-medium text-lg text-gray-900">
                            {honorario.moneda} ${honorario.monto.toLocaleString()}
                          </span>
                          <span className="ml-2">
                            • {format(new Date(honorario.fechaServicio), 'dd/MM/yyyy', { locale: es })}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {honorario.estado === 'COBRADO' ? 'Ver Factura' : 'Facturar'}
                      </Button>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Honorarios:</span>
                      <span className="font-bold text-lg">
                        ARS ${expediente.honorarios.reduce((sum, h) => sum + h.monto, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay honorarios registrados para este expediente.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para subir documentos */}
      <Dialog open={dialogSubirDocumento} onOpenChange={setDialogSubirDocumento}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subir Documentos</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Área de Drag & Drop */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload-documentos"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Seleccionar Archivos
              </Button>
            </div>

            {/* Lista de archivos temporales */}
            {archivosTemporales.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Archivos seleccionados</Label>
                {archivosTemporales.map((archivo, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                    <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Input
                        value={archivo.etiqueta}
                        onChange={(e) => handleCambiarEtiqueta(index, e.target.value)}
                        placeholder="Nombre del documento"
                        className="mb-1"
                      />
                      <p className="text-xs text-gray-500 truncate">
                        Original: {archivo.nombreOriginal} • {(archivo.file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEliminarArchivoTemporal(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Selector de Carpetas */}
            {archivosTemporales.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Asignar a carpeta (opcional)
                </Label>
                <SelectorCarpetas
                  carpetas={carpetas}
                  carpetaSeleccionada={carpetaSeleccionada}
                  onSeleccionarCarpeta={handleSeleccionarCarpeta}
                  onCrearCarpeta={handleCrearCarpeta}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogSubirDocumento(false)
                setArchivosTemporales([])
                setCarpetaSeleccionada('')
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGuardarDocumentos}
              disabled={archivosTemporales.length === 0}
            >
              Guardar Documentos ({archivosTemporales.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
