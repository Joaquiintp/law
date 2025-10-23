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
    numeroCarpeta?: string | null
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
      color?: string | null
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

// Función para determinar si usar texto blanco o negro según el color de fondo
const getContrastColor = (hexColor: string) => {
  // Convertir hex a RGB
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calcular luminancia
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Retornar blanco o negro según luminancia
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
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

  // Calcular días desde último movimiento
  const calcularDiasDesdeUltimoMovimiento = () => {
    const fechaInicio = new Date(expediente.fechaInicio)
    const hoy = new Date()
    const diferencia = hoy.getTime() - fechaInicio.getTime()
    return Math.floor(diferencia / (1000 * 60 * 60 * 24))
  }

  const diasDesdeUltimoMovimiento = calcularDiasDesdeUltimoMovimiento()

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
    <div className="flex gap-6">
      {/* Panel izquierdo - Información del Expediente (estático) */}
      <div className="w-80 flex-shrink-0">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg">Información del Expediente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Estado */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Estado</label>
              <div className="mt-1">
                <Badge className={expediente.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                  {expediente.estado === 'ACTIVO' ? 'En Trámite' : 'Archivo (Resuelto)'}
                </Badge>
              </div>
            </div>

            {/* Cliente con acciones */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Cliente</label>
              <div className="mt-1">
                <p className="font-medium text-sm mb-2">{expediente.cliente.razonSocial}</p>
                <div className="flex gap-2">
                  <Link href={`/clientes/${expediente.cliente.id}`}>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Ver perfil del cliente">
                      <User className="h-4 w-4" />
                    </Button>
                  </Link>
                  {expediente.cliente.telefono && (
                    <>
                      <a href={`https://wa.me/${expediente.cliente.telefono.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Enviar WhatsApp">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        </Button>
                      </a>
                      <a href={`tel:${expediente.cliente.telefono}`}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Llamar">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </Button>
                      </a>
                    </>
                  )}
                  {expediente.cliente.email && (
                    <a href={`mailto:${expediente.cliente.email}`}>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Enviar email">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Tipo</label>
              <p className="mt-1 text-sm font-medium">{expediente.fuero}</p>
            </div>

            {/* Números importantes */}
            <div className="space-y-2 pt-2 border-t">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Nro de Carpeta</label>
                <div className="mt-1">
                  <Badge className="bg-blue-600 text-white font-mono">
                    {expediente.numeroCarpeta || 'Sin asignar'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Nro de Expediente</label>
                <div className="mt-1">
                  <Badge className="bg-blue-600 text-white font-mono">
                    {expediente.numero}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Responsable */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Responsable</label>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-3 w-3 rounded" style={{ backgroundColor: expediente.responsable.color || '#3B82F6' }}></div>
                <Badge style={{ 
                  backgroundColor: expediente.responsable.color || '#3B82F6',
                  color: getContrastColor(expediente.responsable.color || '#3B82F6')
                }}>
                  {expediente.responsable.name || 'Sin asignar'}
                </Badge>
              </div>
            </div>

            {/* Fecha de inicio y días desde último movimiento */}
            <div className="pt-2 border-t">
              <label className="text-xs font-medium text-gray-500 uppercase">Inicio</label>
              <p className="mt-1 text-sm">
                {format(new Date(expediente.fechaInicio), 'dd/MM/yyyy', { locale: es })}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                ({diasDesdeUltimoMovimiento} días desde último movimiento)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 space-y-6">
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
              {/* Carátula arriba (más grande) */}
              <h1 className="text-3xl font-bold text-gray-900">{expediente.caratula}</h1>
              {/* Número abajo (más pequeño) */}
              <p className="text-sm text-gray-500 mt-1">Expediente: {expediente.numero}</p>
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

      {/* Tabs con contenido detallado - TAREAS PRIMERO */}
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
    </div>
  )
}
