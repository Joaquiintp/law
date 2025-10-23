'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  CheckSquare,
  Plus,
  ChevronDown,
  Edit,
  Trash2,
  Send,
  FileText,
  Upload,
  X,
  Star,
  AlertCircle,
  Calendar,
  Eye,
  Download,
  Folder
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import NuevaTareaDialog from './NuevaTareaDialog'
import SelectorCarpetas from '../documentos/SelectorCarpetas'

interface Carpeta {
  id: string
  nombre: string
  color?: string
}

interface Observacion {
  id: string
  texto: string
  autor: string
  autorId: string
  fecha: Date
  editado?: boolean
}

interface ArchivoTarea {
  id: string
  nombre: string
  url: string
  carpetaId?: string
  carpetaNombre?: string
  tipoDocumento?: string
  tamanio?: number
  fechaCreacion?: Date
  autor?: string
  autorId?: string
}

interface Tarea {
  id: string
  tipo?: 'PROCESAL' | 'EXTRA_PROCESAL' | 'AUDITORIA'
  estado: 'HECHO' | 'PENDIENTE' | 'IMPORTANTE'
  accion: string
  fecha: Date
  hora: string
  responsable: string
  observaciones?: string // Observación principal/resumen
  observacionesDetalladas?: Observacion[] // Historial completo
  archivosAsociados?: ArchivoTarea[]
  destacado?: boolean
}

interface TareasExpedienteViewProps {
  expedienteId: string
  tareasPendientes: number
  ultimoMovimiento?: Date
  periodoInicio?: Date | null
  periodoFin?: Date | null
}

export default function TareasExpedienteView({
  expedienteId,
  tareasPendientes = 0,
  ultimoMovimiento,
  periodoInicio,
  periodoFin
}: TareasExpedienteViewProps) {
  const [tareasProcesales, setTareasProcesales] = useState<Tarea[]>([])
  const [tareasExtraProcesales, setTareasExtraProcesales] = useState<Tarea[]>([])
  const [tareasAuditoria, setTareasAuditoria] = useState<Tarea[]>([])
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showArchivosDialog, setShowArchivosDialog] = useState(false)
  const [showNuevaTareaDialog, setShowNuevaTareaDialog] = useState(false)
  const [showDetalleDialog, setShowDetalleDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [tipoTareaDialog, setTipoTareaDialog] = useState<'PROCESAL' | 'EXTRA_PROCESAL' | 'AUDITORIA'>('PROCESAL')
  const [periodoEstablecido, setPeriodoEstablecido] = useState(!!periodoInicio && !!periodoFin)
  const [columnaActiva, setColumnaActiva] = useState<'ESTRATEGIA' | 'PROCESAL' | 'EXTRA_PROCESAL' | 'AUDITORIA'>('ESTRATEGIA')
  const [isDragging, setIsDragging] = useState(false)
  const [archivosTemporales, setArchivosTemporales] = useState<Array<{file: File, etiqueta: string}>>([])
  const [carpetaSeleccionada, setCarpetaSeleccionada] = useState<string | undefined>(undefined)
  const [carpetas, setCarpetas] = useState<Carpeta[]>([
    { id: '1', nombre: 'Contratos', color: 'blue' },
    { id: '2', nombre: 'Demandas', color: 'red' },
    { id: '3', nombre: 'Pruebas', color: 'green' },
    { id: '4', nombre: 'Sentencias', color: 'purple' },
  ])
  
  // Estados para observaciones
  const [nuevaObservacion, setNuevaObservacion] = useState('')
  // Estado para controlar cuántas observaciones mostrar
  const [mostrarTodasObservaciones, setMostrarTodasObservaciones] = useState<Record<string, boolean>>({})
  
  // Estado para controlar cuántos archivos mostrar
  const [mostrarTodosArchivos, setMostrarTodosArchivos] = useState<Record<string, boolean>>({})

  const handleToggleMostrarTodasObservaciones = (tareaId: string) => {
    setMostrarTodasObservaciones(prev => ({
      ...prev,
      [tareaId]: !prev[tareaId]
    }))
  }

  const handleToggleMostrarTodosArchivos = (tareaId: string) => {
    setMostrarTodosArchivos(prev => ({
      ...prev,
      [tareaId]: !prev[tareaId]
    }))
  }

  // Estado para expandir texto de observaciones individuales
  const [observacionesExpandidas, setObservacionesExpandidas] = useState<Record<string, boolean>>({})
  const [editandoObservacion, setEditandoObservacion] = useState<string | null>(null)
  const [textoEditado, setTextoEditado] = useState('')
  
  // Estado para editar tarea
  const [tareaEditando, setTareaEditando] = useState<Partial<Tarea>>({})
  
  // Usuario actual (simulado - en producción vendría de la sesión)
  const usuarioActual = { id: 'user-1', nombre: 'Juan Pérez' }
  
  // Usuarios disponibles del estudio (simulados - en producción vendrían de la API /api/usuarios?activos=true)
  // IMPORTANTE: Solo se incluyen miembros del STAFF (ABOGADO, SECRETARIO, PASANTE, etc.)
  // NO se incluyen CLIENTES ya que las tareas son responsabilidad del equipo legal interno
  // NO se incluyen usuarios con rol DUENO ya que su nombre será el del estudio
  const usuariosDisponibles = [
    { id: 'user-1', nombre: 'Juan Pérez', rol: 'ABOGADO' },
    { id: 'user-2', nombre: 'María González', rol: 'ABOGADO' },
    { id: 'user-3', nombre: 'Carlos Rodríguez', rol: 'ABOGADO' },
    { id: 'user-4', nombre: 'Ana Martínez', rol: 'SECRETARIO' },
    { id: 'user-5', nombre: 'Luis Fernández', rol: 'SECRETARIO' },
  ]
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cargar tareas desde la API
  useEffect(() => {
    const cargarTareas = async () => {
      try {
        setIsLoading(true)
        console.log('🔍 Cargando tareas para expediente:', expedienteId)
        const response = await fetch(`/api/tareas?expedienteId=${expedienteId}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
          console.error('❌ Error al cargar tareas:', response.status, errorData)
          
          // Si es error de autenticación, no mostrar error (el usuario será redirigido)
          if (response.status === 401) {
            console.log('⚠️ Usuario no autenticado')
            return
          }
          
          throw new Error(errorData.error || 'Error al cargar tareas')
        }
        
        const tareas = await response.json()
        console.log('✅ Tareas cargadas:', tareas.length)
        
        // Separar tareas por tipo (asumiendo que tienes un campo 'tipo' en la tarea)
        // Si no existe, tendrás que agregar lógica para clasificarlas
        const procesales: Tarea[] = []
        const extraProcesales: Tarea[] = []
        const auditorias: Tarea[] = []
        
        tareas.forEach((tarea: any) => {
          // Mapear la tarea de la API al formato del componente
          const tareaLocal: Tarea = {
            id: tarea.id,
            tipo: tarea.tipo as 'PROCESAL' | 'EXTRA_PROCESAL' | 'AUDITORIA',
            estado: tarea.estado as 'HECHO' | 'PENDIENTE' | 'IMPORTANTE',
            accion: tarea.titulo,
            fecha: new Date(tarea.fechaVencimiento),
            hora: new Date(tarea.fechaVencimiento).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
            responsable: tarea.asignado?.name || 'Sin asignar',
            observaciones: tarea.descripcion,
            observacionesDetalladas: [],
            archivosAsociados: [],
            destacado: false
          }
          
          // Clasificar por tipo de tarea
          switch (tarea.tipo) {
            case 'PROCESAL':
              procesales.push(tareaLocal)
              break
            case 'EXTRA_PROCESAL':
              extraProcesales.push(tareaLocal)
              break
            case 'AUDITORIA':
              auditorias.push(tareaLocal)
              break
            default:
              procesales.push(tareaLocal) // Por defecto van a procesales
          }
        })
        
        console.log('📋 Tareas procesales:', procesales.length)
        console.log('📋 Tareas extra-procesales:', extraProcesales.length)
        console.log('📋 Tareas de auditoría:', auditorias.length)
        setTareasProcesales(procesales)
        setTareasExtraProcesales(extraProcesales)
        setTareasAuditoria(auditorias)
        setTareasExtraProcesales(extraProcesales)
        setTareasAuditoria(auditorias)
      } catch (error) {
        console.error('Error al cargar tareas:', error)
        // No bloquear la UI, simplemente dejar las tareas vacías
        setTareasProcesales([])
        setTareasExtraProcesales([])
        setTareasAuditoria([])
      } finally {
        setIsLoading(false)
      }
    }
    
    if (expedienteId) {
      cargarTareas()
    }
  }, [expedienteId])

  // Calcular días desde último movimiento
  const calcularDiasDesdeUltimoMovimiento = () => {
    if (!ultimoMovimiento) return 0
    const hoy = new Date()
    const diff = hoy.getTime() - new Date(ultimoMovimiento).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  const diasDesdeUltimoMovimiento = calcularDiasDesdeUltimoMovimiento()

  // Calcular caducidad (2 años = 730 días en Argentina)
  const diasParaCaducidad = 730 - diasDesdeUltimoMovimiento
  const caducidadEnPeligro = diasParaCaducidad < 180 // Alerta si quedan menos de 6 meses

  // Limpiar archivos temporales cuando se cierra el diálogo
  useEffect(() => {
    if (!showArchivosDialog) {
      setArchivosTemporales([])
      setIsDragging(false)
      setCarpetaSeleccionada(undefined)
    }
  }, [showArchivosDialog])

  const handleCrearCarpeta = (nombre: string, color?: string) => {
    const nuevaCarpeta: Carpeta = {
      id: Date.now().toString(),
      nombre,
      color: color || 'blue'
    }
    setCarpetas([...carpetas, nuevaCarpeta])
    setCarpetaSeleccionada(nuevaCarpeta.id)
  }

  const handleSeleccionarCarpeta = (carpetaId: string | undefined) => {
    setCarpetaSeleccionada(carpetaId)
  }

  const handleNuevaTarea = (tipo: 'PROCESAL' | 'EXTRA_PROCESAL' | 'AUDITORIA') => {
    setTipoTareaDialog(tipo)
    setShowNuevaTareaDialog(true)
  }

  const handleAgregarTarea = async (nuevaTarea: Tarea) => {
    try {
      // Encontrar el usuario asignado
      const usuarioAsignado = usuariosDisponibles.find(u => u.nombre === nuevaTarea.responsable)
      
      if (!usuarioAsignado) {
        console.error('Usuario no encontrado')
        return
      }

      // Crear tarea en la API
      const response = await fetch('/api/tareas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: nuevaTarea.accion,
          descripcion: nuevaTarea.observaciones,
          estado: nuevaTarea.estado,
          expedienteId: expedienteId,
          asignadoId: usuarioAsignado.id,
          fechaVencimiento: nuevaTarea.fecha.toISOString(),
          prioridad: 'MEDIA'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        console.error('❌ Error al crear tarea:', response.status, errorData)
        throw new Error(errorData.error || `Error al crear tarea (${response.status})`)
      }

      const tareaCreada = await response.json()
      console.log('✅ Tarea creada exitosamente:', tareaCreada)
      
      // Mapear la tarea creada al formato local
      const tareaLocal: Tarea = {
        id: tareaCreada.id,
        estado: tareaCreada.estado as 'HECHO' | 'PENDIENTE' | 'IMPORTANTE',
        accion: tareaCreada.titulo,
        fecha: new Date(tareaCreada.fechaVencimiento),
        hora: new Date(tareaCreada.fechaVencimiento).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        responsable: tareaCreada.asignado?.name || nuevaTarea.responsable,
        observaciones: tareaCreada.descripcion,
        observacionesDetalladas: nuevaTarea.observacionesDetalladas || [],
        archivosAsociados: [],
        destacado: false
      }

      // Agregar a la lista correspondiente
      switch (tipoTareaDialog) {
        case 'PROCESAL':
          setTareasProcesales([...tareasProcesales, tareaLocal])
          break
        case 'EXTRA_PROCESAL':
          setTareasExtraProcesales([...tareasExtraProcesales, tareaLocal])
          break
        case 'AUDITORIA':
          setTareasAuditoria([...tareasAuditoria, tareaLocal])
          break
      }
    } catch (error) {
      console.error('❌ Error al agregar tarea:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      alert(`Error al crear la tarea: ${errorMessage}`)
    }
  }

  const handleEliminarTarea = async () => {
    if (!selectedTarea) return

    try {
      const response = await fetch(`/api/tareas/${selectedTarea.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar tarea')
      }

      // Eliminar del estado local
      setTareasProcesales(tareasProcesales.filter(t => t.id !== selectedTarea.id))
      setTareasExtraProcesales(tareasExtraProcesales.filter(t => t.id !== selectedTarea.id))
      setTareasAuditoria(tareasAuditoria.filter(t => t.id !== selectedTarea.id))
      
      setShowDeleteDialog(false)
      setSelectedTarea(null)
    } catch (error) {
      console.error('Error al eliminar tarea:', error)
      alert('Error al eliminar la tarea. Por favor, intenta de nuevo.')
    }
  }

  const handleToggleEstado = async (tarea: Tarea, tipo: 'PROCESAL' | 'EXTRA_PROCESAL' | 'AUDITORIA') => {
    // Ciclo de estados: PENDIENTE -> IMPORTANTE -> HECHO -> PENDIENTE
    let nuevoEstado: 'HECHO' | 'PENDIENTE' | 'IMPORTANTE'
    
    if (tarea.estado === 'PENDIENTE') {
      nuevoEstado = 'IMPORTANTE'
    } else if (tarea.estado === 'IMPORTANTE') {
      nuevoEstado = 'HECHO'
    } else {
      nuevoEstado = 'PENDIENTE'
    }
    
    try {
      // Actualizar en la API
      const response = await fetch(`/api/tareas/${tarea.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: nuevoEstado
        }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar tarea')
      }

      // Actualizar en el estado local
      const tareaActualizada: Tarea = { ...tarea, estado: nuevoEstado }

      switch (tipo) {
        case 'PROCESAL':
          setTareasProcesales(tareasProcesales.map(t => t.id === tarea.id ? tareaActualizada : t))
          break
        case 'EXTRA_PROCESAL':
          setTareasExtraProcesales(tareasExtraProcesales.map(t => t.id === tarea.id ? tareaActualizada : t))
          break
        case 'AUDITORIA':
          setTareasAuditoria(tareasAuditoria.map(t => t.id === tarea.id ? tareaActualizada : t))
          break
      }
    } catch (error) {
      console.error('Error al cambiar estado de tarea:', error)
      alert('Error al actualizar el estado. Por favor, intenta de nuevo.')
    }
  }

  const handleToggleDestacado = (tarea: Tarea, tipo: 'PROCESAL' | 'EXTRA_PROCESAL' | 'AUDITORIA') => {
    const tareaActualizada: Tarea = { ...tarea, destacado: !tarea.destacado }

    switch (tipo) {
      case 'PROCESAL':
        setTareasProcesales(tareasProcesales.map(t => t.id === tarea.id ? tareaActualizada : t))
        break
      case 'EXTRA_PROCESAL':
        setTareasExtraProcesales(tareasExtraProcesales.map(t => t.id === tarea.id ? tareaActualizada : t))
        break
      case 'AUDITORIA':
        setTareasAuditoria(tareasAuditoria.map(t => t.id === tarea.id ? tareaActualizada : t))
        break
    }
  }

  // Funciones para manejo de archivos
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const nuevosArchivos = files.map(file => ({
        file,
        etiqueta: file.name
      }))
      setArchivosTemporales([...archivosTemporales, ...nuevosArchivos])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const nuevosArchivos = Array.from(files).map(file => ({
        file,
        etiqueta: file.name
      }))
      setArchivosTemporales([...archivosTemporales, ...nuevosArchivos])
    }
  }

  const handleClickSeleccionar = () => {
    fileInputRef.current?.click()
  }

  const handleRemoverArchivoTemporal = (index: number) => {
    setArchivosTemporales(archivosTemporales.filter((_, i) => i !== index))
  }

  const handleCambiarEtiqueta = (index: number, nuevaEtiqueta: string) => {
    const nuevosArchivos = [...archivosTemporales]
    nuevosArchivos[index].etiqueta = nuevaEtiqueta
    setArchivosTemporales(nuevosArchivos)
  }

  const handleGuardarArchivos = () => {
    if (!selectedTarea) return

    const carpetaNombre = carpetas.find(c => c.id === carpetaSeleccionada)?.nombre

    // Crear archivos con información completa incluyendo autor
    const nuevosArchivos: ArchivoTarea[] = archivosTemporales.map((item, index) => ({
      id: `${Date.now()}-${index}`,
      nombre: item.etiqueta,
      url: URL.createObjectURL(item.file),
      carpetaId: carpetaSeleccionada,
      carpetaNombre: carpetaNombre,
      tipoDocumento: item.file.type || 'application/octet-stream',
      tamanio: item.file.size,
      fechaCreacion: new Date(),
      autor: usuarioActual.nombre,
      autorId: usuarioActual.id
    }))

    // Actualizar tarea con archivos asociados
    const tareaActualizada: Tarea = {
      ...selectedTarea,
      archivosAsociados: [...(selectedTarea.archivosAsociados || []), ...nuevosArchivos]
    }

    // Actualizar en el estado correspondiente
    setTareasProcesales(tareasProcesales.map(t => t.id === selectedTarea.id ? tareaActualizada : t))
    setTareasExtraProcesales(tareasExtraProcesales.map(t => t.id === selectedTarea.id ? tareaActualizada : t))
    setTareasAuditoria(tareasAuditoria.map(t => t.id === selectedTarea.id ? tareaActualizada : t))

    // Actualizar selectedTarea para reflejar cambios en el modal de detalle si está abierto
    setSelectedTarea(tareaActualizada)

    // TODO: Aquí se enviarían los archivos al servidor y se agregarían a la sección de Documentos del expediente
    // Los archivos quedarán disponibles tanto en la tarea como en la sección de Documentos
    console.log('Archivos guardados en carpeta:', carpetaNombre || 'Sin carpeta')
    console.log('Archivos:', nuevosArchivos)

    // Limpiar archivos temporales y cerrar diálogo
    setArchivosTemporales([])
    setCarpetaSeleccionada(undefined)
    setShowArchivosDialog(false)
  }

  const handleRemoverArchivoAsociado = (archivoId: string) => {
    if (!selectedTarea) return

    const tareaActualizada: Tarea = {
      ...selectedTarea,
      archivosAsociados: selectedTarea.archivosAsociados?.filter(a => a.id !== archivoId)
    }

    setTareasProcesales(tareasProcesales.map(t => t.id === selectedTarea.id ? tareaActualizada : t))
    setTareasExtraProcesales(tareasExtraProcesales.map(t => t.id === selectedTarea.id ? tareaActualizada : t))
    setTareasAuditoria(tareasAuditoria.map(t => t.id === selectedTarea.id ? tareaActualizada : t))
    
    // Actualizar selectedTarea
    setSelectedTarea(tareaActualizada)
  }

  // Funciones para observaciones
  const handleAgregarObservacion = () => {
    if (!selectedTarea || !nuevaObservacion.trim()) return

    const nuevaObs: Observacion = {
      id: Date.now().toString(),
      texto: nuevaObservacion.trim(),
      autor: usuarioActual.nombre,
      autorId: usuarioActual.id,
      fecha: new Date()
    }

    const tareaActualizada: Tarea = {
      ...selectedTarea,
      observacionesDetalladas: [...(selectedTarea.observacionesDetalladas || []), nuevaObs],
      observaciones: nuevaObservacion.trim() // Actualizar el resumen también
    }

    actualizarTareaEnListas(tareaActualizada)
    setNuevaObservacion('')
  }

  const handleEditarObservacion = (obsId: string) => {
    if (!selectedTarea) return
    const obs = selectedTarea.observacionesDetalladas?.find(o => o.id === obsId)
    if (obs && obs.autorId === usuarioActual.id) {
      setEditandoObservacion(obsId)
      setTextoEditado(obs.texto)
    }
  }

  const handleGuardarEdicionObservacion = (obsId: string) => {
    if (!selectedTarea || !textoEditado.trim()) return

    const tareaActualizada: Tarea = {
      ...selectedTarea,
      observacionesDetalladas: selectedTarea.observacionesDetalladas?.map(obs =>
        obs.id === obsId
          ? { ...obs, texto: textoEditado.trim(), editado: true }
          : obs
      )
    }

    actualizarTareaEnListas(tareaActualizada)
    setEditandoObservacion(null)
    setTextoEditado('')
  }

  const handleEliminarObservacion = (obsId: string) => {
    if (!selectedTarea) return
    const obs = selectedTarea.observacionesDetalladas?.find(o => o.id === obsId)
    if (obs && obs.autorId === usuarioActual.id) {
      const tareaActualizada: Tarea = {
        ...selectedTarea,
        observacionesDetalladas: selectedTarea.observacionesDetalladas?.filter(o => o.id !== obsId)
      }
      actualizarTareaEnListas(tareaActualizada)
    }
  }

  const handleToggleExpandirObservacion = (obsId: string) => {
    setObservacionesExpandidas(prev => ({
      ...prev,
      [obsId]: !prev[obsId]
    }))
  }

  // Función para abrir modal de detalle
  const handleVerDetalle = (tarea: Tarea) => {
    setSelectedTarea(tarea)
    setShowDetalleDialog(true)
  }

  // Función para abrir modal de edición
  const handleAbrirEdicion = (tarea: Tarea) => {
    setSelectedTarea(tarea)
    setTareaEditando({
      accion: tarea.accion,
      fecha: tarea.fecha,
      hora: tarea.hora,
      responsable: tarea.responsable,
      observaciones: tarea.observaciones
    })
    setShowEditDialog(true)
  }

  // Función para guardar edición de tarea
  const handleGuardarEdicionTarea = () => {
    if (!selectedTarea) return

    const tareaActualizada: Tarea = {
      ...selectedTarea,
      accion: tareaEditando.accion || selectedTarea.accion,
      fecha: tareaEditando.fecha || selectedTarea.fecha,
      hora: tareaEditando.hora || selectedTarea.hora,
      responsable: tareaEditando.responsable || selectedTarea.responsable,
      observaciones: tareaEditando.observaciones || selectedTarea.observaciones
    }

    actualizarTareaEnListas(tareaActualizada)
    setShowEditDialog(false)
    setTareaEditando({})
  }

  // Función auxiliar para actualizar tarea en todas las listas
  const actualizarTareaEnListas = (tareaActualizada: Tarea) => {
    setTareasProcesales(tareasProcesales.map(t => t.id === tareaActualizada.id ? tareaActualizada : t))
    setTareasExtraProcesales(tareasExtraProcesales.map(t => t.id === tareaActualizada.id ? tareaActualizada : t))
    setTareasAuditoria(tareasAuditoria.map(t => t.id === tareaActualizada.id ? tareaActualizada : t))
    setSelectedTarea(tareaActualizada)
  }

  const TareaRow = ({ 
    tarea, 
    onEdit, 
    onDelete, 
    onArchivos,
    onToggleEstado,
    onToggleDestacado,
    onVerDetalle
  }: { 
    tarea: Tarea
    onEdit: () => void
    onDelete: () => void
    onArchivos: () => void
    onToggleEstado: () => void
    onToggleDestacado: () => void
    onVerDetalle: () => void
  }) => {
    // Definir colores según el estado
    const getEstadoColors = () => {
      switch (tarea.estado) {
        case 'HECHO':
          return {
            bg: 'bg-green-50 hover:bg-green-100',
            border: 'border-green-200',
            badge: 'bg-green-500 text-white hover:bg-green-600',
            text: 'text-green-900',
            icon: '✓',
            label: 'Hecho'
          }
        case 'PENDIENTE':
          return {
            bg: 'bg-orange-50 hover:bg-orange-100',
            border: 'border-orange-200',
            badge: 'bg-orange-500 text-white hover:bg-orange-600',
            text: 'text-orange-900',
            icon: '○',
            label: 'Pendiente'
          }
        case 'IMPORTANTE':
          return {
            bg: 'bg-red-50 hover:bg-red-100',
            border: 'border-red-200',
            badge: 'bg-red-500 text-white hover:bg-red-600',
            text: 'text-red-900',
            icon: '!',
            label: 'Importante'
          }
        default:
          return {
            bg: 'bg-gray-50 hover:bg-gray-100',
            border: 'border-gray-200',
            badge: 'bg-gray-500 text-white hover:bg-gray-600',
            text: 'text-gray-900',
            icon: '○',
            label: 'Pendiente'
          }
      }
    }

    const colors = getEstadoColors()

    return (
      <div className="flex items-start gap-2">
        {/* Viñeta principal */}
        <div 
          className={`flex-1 grid grid-cols-12 gap-2 p-4 border-2 rounded-lg transition-all cursor-pointer ${colors.bg} ${colors.border} ${tarea.destacado ? 'ring-2 ring-yellow-400' : ''}`}
          onClick={onVerDetalle}
        >
          {/* Estado */}
        <div className="col-span-2 flex items-start pt-1">
          <Badge 
            className={`cursor-pointer ${colors.badge} font-semibold px-2 py-1 text-xs whitespace-nowrap`}
            onClick={(e) => {
              e.stopPropagation()
              onToggleEstado()
            }}
            title={`Click para cambiar estado`}
          >
            <span className="flex items-center gap-1">
              <span>{colors.icon}</span>
              <span>{colors.label}</span>
            </span>
          </Badge>
        </div>

      {/* Acción - Permite múltiples líneas */}
      <div className="col-span-3 flex items-start pt-1">
        <p className="text-sm font-medium leading-tight line-clamp-2">
          {tarea.accion}
        </p>
      </div>

      {/* Fecha */}
      <div className="col-span-2 flex items-start pt-1 text-sm text-gray-600 whitespace-nowrap">
        {format(new Date(tarea.fecha), 'dd/MM/yyyy', { locale: es })}
      </div>

      {/* Hora */}
      <div className="col-span-1 flex items-start pt-1 text-sm text-gray-600 whitespace-nowrap">
        {tarea.hora}
      </div>

      {/* Responsable */}
      <div className="col-span-2 flex items-start pt-1">
        <p className="text-sm text-gray-600 leading-tight line-clamp-1 truncate">
          {tarea.responsable}
        </p>
      </div>

      {/* Observaciones - Permite múltiples líneas con indicador */}
      <div className="col-span-2 flex items-start pt-1">
        {tarea.observaciones ? (
          <p className="text-sm text-gray-500 leading-tight line-clamp-3" title={tarea.observaciones}>
            {tarea.observaciones}
          </p>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </div>
    </div>

    {/* Menú de opciones (3 puntos) - Fuera de la viñeta */}
    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <Edit className="h-4 w-4 mr-2" />
            Editar tarea
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchivos(); }}>
            <Upload className="h-4 w-4 mr-2" />
            Archivos asociados ({tarea.archivosAsociados?.length || 0})
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FileText className="h-4 w-4 mr-2" />
            Asociar escrito en línea
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FileText className="h-4 w-4 mr-2" />
            Vincular con plantilla existente
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleDestacado(); }}>
            <Star className={`h-4 w-4 mr-2 ${tarea.destacado ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            {tarea.destacado ? 'Quitar destacado' : 'Destacar este movimiento'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Send className="h-4 w-4 mr-2" />
            Enviar por email
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Send className="h-4 w-4 mr-2" />
            Enviar por WhatsApp
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar tarea
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selector de columnas (pestañas) */}
      <div className="grid grid-cols-4 gap-2">
        <Button
          variant={columnaActiva === 'ESTRATEGIA' ? 'default' : 'outline'}
          onClick={() => setColumnaActiva('ESTRATEGIA')}
          className="w-full"
        >
          📊 Estrategia y Métricas
        </Button>
        <Button
          variant={columnaActiva === 'PROCESAL' ? 'default' : 'outline'}
          onClick={() => setColumnaActiva('PROCESAL')}
          className="w-full"
        >
          ⚖️ Procesales ({tareasProcesales.length})
        </Button>
        <Button
          variant={columnaActiva === 'EXTRA_PROCESAL' ? 'default' : 'outline'}
          onClick={() => setColumnaActiva('EXTRA_PROCESAL')}
          className="w-full"
        >
          📋 Extra-procesales ({tareasExtraProcesales.length})
        </Button>
        <Button
          variant={columnaActiva === 'AUDITORIA' ? 'default' : 'outline'}
          onClick={() => setColumnaActiva('AUDITORIA')}
          className="w-full"
        >
          🔍 Auditoría ({tareasAuditoria.length})
        </Button>
      </div>

      {/* Contenido de la columna seleccionada */}
      <div className="w-full">
        {/* Estrategia y Métricas */}
        {columnaActiva === 'ESTRATEGIA' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estrategia y Métricas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Caducidad de instancia</Label>
                  <div className={`text-3xl font-bold mt-2 ${caducidadEnPeligro ? 'text-red-600' : 'text-gray-900'}`}>
                    {diasParaCaducidad} días
                  </div>
                  {caducidadEnPeligro && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      ¡Atención! Menos de 6 meses
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Caduca</Label>
                  <p className="text-lg font-medium text-gray-900 mt-2">
                    {ultimoMovimiento 
                      ? format(new Date(new Date(ultimoMovimiento).getTime() + 730 * 24 * 60 * 60 * 1000), 'dd/MM/yyyy', { locale: es })
                      : 'Sin datos'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Último movimiento impulsorio</Label>
                  <p className="text-lg font-medium text-gray-900 mt-2">
                    {ultimoMovimiento ? format(new Date(ultimoMovimiento), 'dd/MM/yyyy', { locale: es }) : 'Sin registrar'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Última prueba del actor</Label>
                  <p className="text-lg font-medium text-gray-900 mt-2">-</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Última prueba del demandado</Label>
                  <p className="text-lg font-medium text-gray-900 mt-2">-</p>
                </div>

                <div className="md:col-span-2 lg:col-span-3 border-t pt-6 mt-4">
                  <Label className="text-base font-semibold text-gray-700">Periodo Probatorio</Label>
                  {!periodoEstablecido ? (
                    <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 flex items-center gap-2 mb-3">
                        <AlertCircle className="h-5 w-5" />
                        No tiene tiempos establecidos
                      </p>
                      <Button size="default" className="w-full md:w-auto" variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Establecer periodo
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Inicio del periodo probatorio</p>
                        <p className="text-lg font-semibold text-blue-900">{periodoInicio ? format(periodoInicio, 'dd/MM/yyyy', { locale: es }) : '-'}</p>
                      </div>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Finalización del pedido probatorio</p>
                        <p className="text-lg font-semibold text-blue-900">{periodoFin ? format(periodoFin, 'dd/MM/yyyy', { locale: es }) : '-'}</p>
                      </div>
                      <div className="flex items-center">
                        <Button size="default" variant="outline" className="w-full">
                          <Calendar className="h-4 w-4 mr-2" />
                          Extensión/cambio del periodo
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Procesales */}
        {columnaActiva === 'PROCESAL' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tareas Procesales</CardTitle>
              <Button onClick={() => handleNuevaTarea('PROCESAL')}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Tarea
              </Button>
            </CardHeader>
            <CardContent>
              {/* Header de la tabla */}
              <div className="grid grid-cols-12 gap-2 pb-3 px-4 border-b text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                <div className="col-span-2">Estado</div>
                <div className="col-span-3">Acción</div>
                <div className="col-span-2">Fecha</div>
                <div className="col-span-1">Hora</div>
                <div className="col-span-2">Responsable</div>
                <div className="col-span-2">Observaciones</div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {tareasProcesales.length > 0 ? (
                  tareasProcesales.map((tarea) => (
                    <TareaRow
                      key={tarea.id}
                      tarea={tarea}
                      onEdit={() => handleAbrirEdicion(tarea)}
                      onDelete={() => {
                        setSelectedTarea(tarea)
                        setShowDeleteDialog(true)
                      }}
                      onArchivos={() => {
                        setSelectedTarea(tarea)
                        setShowArchivosDialog(true)
                      }}
                      onToggleEstado={() => handleToggleEstado(tarea, 'PROCESAL')}
                      onToggleDestacado={() => handleToggleDestacado(tarea, 'PROCESAL')}
                      onVerDetalle={() => handleVerDetalle(tarea)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <CheckSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No hay tareas procesales</p>
                    <p className="text-sm mt-2">Haz clic en "Nueva Tarea" para agregar una</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Extra-procesales */}
        {columnaActiva === 'EXTRA_PROCESAL' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tareas Extra-procesales</CardTitle>
              <Button onClick={() => handleNuevaTarea('EXTRA_PROCESAL')}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Tarea
              </Button>
            </CardHeader>
            <CardContent>
              {/* Header de la tabla */}
              <div className="grid grid-cols-12 gap-2 pb-3 px-4 border-b text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                <div className="col-span-2">Estado</div>
                <div className="col-span-3">Acción</div>
                <div className="col-span-2">Fecha</div>
                <div className="col-span-1">Hora</div>
                <div className="col-span-2">Responsable</div>
                <div className="col-span-2">Observaciones</div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {tareasExtraProcesales.length > 0 ? (
                  tareasExtraProcesales.map((tarea) => (
                    <TareaRow
                      key={tarea.id}
                      tarea={tarea}
                      onEdit={() => handleAbrirEdicion(tarea)}
                      onDelete={() => {
                        setSelectedTarea(tarea)
                        setShowDeleteDialog(true)
                      }}
                      onArchivos={() => {
                        setSelectedTarea(tarea)
                        setShowArchivosDialog(true)
                      }}
                      onToggleEstado={() => handleToggleEstado(tarea, 'EXTRA_PROCESAL')}
                      onToggleDestacado={() => handleToggleDestacado(tarea, 'EXTRA_PROCESAL')}
                      onVerDetalle={() => handleVerDetalle(tarea)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <CheckSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No hay tareas extra-procesales</p>
                    <p className="text-sm mt-2">Haz clic en "Nueva Tarea" para agregar una</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Auditoría */}
        {columnaActiva === 'AUDITORIA' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tareas de Auditoría</CardTitle>
              <Button onClick={() => handleNuevaTarea('AUDITORIA')}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Tarea
              </Button>
            </CardHeader>
            <CardContent>
              {/* Header de la tabla */}
              <div className="grid grid-cols-12 gap-2 pb-3 px-4 border-b text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                <div className="col-span-2">Estado</div>
                <div className="col-span-3">Acción</div>
                <div className="col-span-2">Fecha</div>
                <div className="col-span-1">Hora</div>
                <div className="col-span-2">Responsable</div>
                <div className="col-span-2">Observaciones</div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {tareasAuditoria.length > 0 ? (
                  tareasAuditoria.map((tarea) => (
                    <TareaRow
                      key={tarea.id}
                      tarea={tarea}
                      onEdit={() => handleAbrirEdicion(tarea)}
                      onDelete={() => {
                        setSelectedTarea(tarea)
                        setShowDeleteDialog(true)
                      }}
                      onArchivos={() => {
                        setSelectedTarea(tarea)
                        setShowArchivosDialog(true)
                      }}
                      onToggleEstado={() => handleToggleEstado(tarea, 'AUDITORIA')}
                      onToggleDestacado={() => handleToggleDestacado(tarea, 'AUDITORIA')}
                      onVerDetalle={() => handleVerDetalle(tarea)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <CheckSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No hay tareas de auditoría</p>
                    <p className="text-sm mt-2">Haz clic en "Nueva Tarea" para agregar una</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog para archivos asociados */}
      <Dialog open={showArchivosDialog} onOpenChange={setShowArchivosDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Archivos Asociados</DialogTitle>
            <DialogDescription>
              Gestiona los archivos relacionados con esta tarea
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Upload area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClickSeleccionar}
            >
              <Upload className={`h-12 w-12 mx-auto mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
              <p className={`text-sm font-medium ${isDragging ? 'text-blue-600' : 'text-gray-600'}`}>
                {isDragging ? '¡Suelta los archivos aquí!' : 'Arrastra archivos aquí o haz click para seleccionar'}
              </p>
              <Button 
                type="button"
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClickSeleccionar()
                }}
              >
                Seleccionar archivos
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept="*/*"
              />
            </div>

            {/* Selector de carpetas */}
            {archivosTemporales.length > 0 && (
              <div className="border-t pt-4">
                <SelectorCarpetas
                  carpetas={carpetas}
                  carpetaSeleccionada={carpetaSeleccionada}
                  onSeleccionarCarpeta={handleSeleccionarCarpeta}
                  onCrearCarpeta={handleCrearCarpeta}
                />
              </div>
            )}

            {/* Archivos temporales (pendientes de guardar) */}
            {archivosTemporales.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Archivos seleccionados ({archivosTemporales.length}):</Label>
                {archivosTemporales.map((item, index) => (
                  <div key={index} className="border border-blue-200 bg-blue-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <Label htmlFor={`etiqueta-${index}`} className="text-xs text-gray-600">
                            Etiqueta/Nombre del archivo
                          </Label>
                          <Input
                            id={`etiqueta-${index}`}
                            value={item.etiqueta}
                            onChange={(e) => handleCambiarEtiqueta(index, e.target.value)}
                            placeholder="Escribe una etiqueta descriptiva"
                            className="mt-1 bg-white"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>Archivo original: {item.file.name}</span>
                          <span>•</span>
                          <span>{(item.file.size / 1024).toFixed(2)} KB</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoverArchivoTemporal(index)}
                        className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Lista de archivos ya asociados */}
            {selectedTarea?.archivosAsociados && selectedTarea.archivosAsociados.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Archivos ya asociados ({selectedTarea.archivosAsociados.length}):</Label>
                {selectedTarea.archivosAsociados.map((archivo) => (
                  <div key={archivo.id} className="border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{archivo.nombre}</p>
                          {archivo.carpetaNombre && (
                            <div className="flex items-center gap-1 mt-1">
                              <Folder className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{archivo.carpetaNombre}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(archivo.url, '_blank')}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Abrir archivo"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = archivo.url
                            link.download = archivo.nombre
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                          }}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Descargar archivo"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoverArchivoAsociado(archivo.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Eliminar archivo"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setArchivosTemporales([])
              setShowArchivosDialog(false)
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleGuardarArchivos}
              disabled={archivosTemporales.length === 0}
            >
              Guardar ({archivosTemporales.length} archivo{archivosTemporales.length !== 1 ? 's' : ''})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente esta tarea.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleEliminarTarea}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para nueva tarea */}
      <NuevaTareaDialog
        open={showNuevaTareaDialog}
        onOpenChange={setShowNuevaTareaDialog}
        tipo={tipoTareaDialog}
        onSubmit={handleAgregarTarea}
        usuariosDisponibles={usuariosDisponibles}
        usuarioActual={usuarioActual}
      />

      {/* Dialog de Detalle de Tarea */}
      <Dialog open={showDetalleDialog} onOpenChange={setShowDetalleDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalle de Tarea</DialogTitle>
          </DialogHeader>

          {selectedTarea && (
            <div className="space-y-6">
              {/* Información Principal */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Acción</Label>
                  <p className="mt-1 font-medium">{selectedTarea.accion}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Estado</Label>
                  <div className="mt-1">
                    <Badge className={
                      selectedTarea.estado === 'HECHO' 
                        ? 'bg-green-500 text-white' 
                        : selectedTarea.estado === 'PENDIENTE'
                        ? 'bg-orange-500 text-white'
                        : 'bg-red-500 text-white'
                    }>
                      {selectedTarea.estado === 'HECHO' ? '✓ Hecho' : selectedTarea.estado === 'PENDIENTE' ? '○ Pendiente' : '! Importante'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Fecha y Hora</Label>
                  <p className="mt-1">{format(new Date(selectedTarea.fecha), 'dd/MM/yyyy', { locale: es })} - {selectedTarea.hora}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Responsable</Label>
                  <p className="mt-1">{selectedTarea.responsable}</p>
                </div>
              </div>

              {/* Observaciones Detalladas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Observaciones</Label>
                  <Badge variant="outline">
                    {(selectedTarea.observaciones ? 1 : 0) + (selectedTarea.observacionesDetalladas?.length || 0)} observaciones
                  </Badge>
                </div>

                {/* Lista de observaciones */}
                <div className="space-y-3">
                  {/* Observación Principal (la inicial al crear la tarea) */}
                  {selectedTarea.observaciones && (
                    <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-600 text-white text-xs">Observación Principal</Badge>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTarea.observaciones}</p>
                    </div>
                  )}

                  {/* Observaciones Adicionales (historial) */}
                  {selectedTarea.observacionesDetalladas && selectedTarea.observacionesDetalladas.length > 0 && (
                    <>
                      <div className="border-t pt-3 mt-3">
                        <Label className="text-sm font-medium text-gray-600 mb-3 block">
                          Historial de Observaciones ({selectedTarea.observacionesDetalladas.length})
                        </Label>
                      </div>
                      {/* Determinar qué observaciones mostrar */}
                      {(() => {
                        const observaciones = selectedTarea.observacionesDetalladas
                        const mostrarTodas = mostrarTodasObservaciones[selectedTarea.id]
                        const observacionesAMostrar = mostrarTodas 
                          ? observaciones 
                          : observaciones.slice(-2) // Últimas 2
                        const hayMas = observaciones.length > 2

                        return (
                          <>
                            {/* Contenedor con scroll si hay muchas */}
                            <div className={cn(
                              "space-y-3",
                              mostrarTodas && observaciones.length > 4 && "max-h-[400px] overflow-y-auto pr-2"
                            )}>
                              {observacionesAMostrar.map((obs) => (
                                <div key={obs.id} className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                                        {obs.autor.split(' ').map(n => n[0]).join('')}
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm">{obs.autor}</p>
                                        <p className="text-xs text-gray-500">
                                          {format(new Date(obs.fecha), "dd/MM/yyyy HH:mm", { locale: es })}
                                          {obs.editado && <span className="ml-2 text-gray-400">(editado)</span>}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {obs.autorId === usuarioActual.id && (
                                      <div className="flex gap-1">
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => handleEditarObservacion(obs.id)}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => handleEliminarObservacion(obs.id)}
                                          className="text-red-600"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>

                                  {editandoObservacion === obs.id ? (
                                    <div className="space-y-2">
                                      <Textarea
                                        value={textoEditado}
                                        onChange={(e) => setTextoEditado(e.target.value)}
                                        rows={3}
                                        className="text-sm"
                                      />
                                      <div className="flex gap-2">
                                        <Button 
                                          size="sm"
                                          onClick={() => handleGuardarEdicionObservacion(obs.id)}
                                        >
                                          Guardar
                                        </Button>
                                        <Button 
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setEditandoObservacion(null)
                                            setTextoEditado('')
                                          }}
                                        >
                                          Cancelar
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className={cn(
                                        "text-sm text-gray-700",
                                        !observacionesExpandidas[obs.id] && obs.texto.length > 150 && "line-clamp-2"
                                      )}>
                                        {obs.texto}
                                      </p>
                                      {obs.texto.length > 150 && (
                                        <Button
                                          variant="link"
                                          size="sm"
                                          className="mt-1 p-0 h-auto text-xs"
                                          onClick={() => handleToggleExpandirObservacion(obs.id)}
                                        >
                                          {observacionesExpandidas[obs.id] ? '- Ver menos' : '+ Ver más'}
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Botón para mostrar más/menos observaciones */}
                            {hayMas && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => handleToggleMostrarTodasObservaciones(selectedTarea.id)}
                              >
                                {mostrarTodas ? (
                                  <>
                                    <ChevronDown className="h-4 w-4 mr-2 rotate-180" />
                                    Mostrar solo últimas 2
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-4 w-4 mr-2" />
                                    Ver todas las observaciones ({observaciones.length})
                                  </>
                                )}
                              </Button>
                            )}
                          </>
                        )
                      })()}
                    </>
                  )}

                  {/* Mensaje si no hay ninguna observación */}
                  {!selectedTarea.observaciones && (!selectedTarea.observacionesDetalladas || selectedTarea.observacionesDetalladas.length === 0) && (
                    <p className="text-center text-gray-400 py-8">No hay observaciones aún</p>
                  )}
                </div>

                {/* Nueva Observación */}
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium mb-2 block">Agregar Nueva Observación</Label>
                  <div className="space-y-2">
                    <Textarea
                      value={nuevaObservacion}
                      onChange={(e) => setNuevaObservacion(e.target.value)}
                      placeholder="Escribe tu observación aquí..."
                      rows={3}
                    />
                    <Button 
                      onClick={handleAgregarObservacion}
                      disabled={!nuevaObservacion.trim()}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Observación
                    </Button>
                  </div>
                </div>
              </div>

              {/* Archivos Asociados */}
              {selectedTarea.archivosAsociados && selectedTarea.archivosAsociados.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Archivos Asociados</Label>
                    <Badge variant="outline">{selectedTarea.archivosAsociados.length} archivo(s)</Badge>
                  </div>
                  
                  {(() => {
                    const archivos = selectedTarea.archivosAsociados
                    const mostrarTodos = mostrarTodosArchivos[selectedTarea.id]
                    const archivosAMostrar = mostrarTodos ? archivos : archivos.slice(-2) // Últimos 2
                    const hayMas = archivos.length > 2

                    return (
                      <>
                        {/* Contenedor con scroll si hay muchos */}
                        <div className={cn(
                          "space-y-2",
                          mostrarTodos && archivos.length > 4 && "max-h-[300px] overflow-y-auto pr-2"
                        )}>
                          {archivosAMostrar.map((archivo) => (
                            <div key={archivo.id} className="flex items-center justify-between p-2.5 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{archivo.nombre}</p>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 flex-wrap">
                                    {archivo.carpetaNombre && (
                                      <Badge variant="secondary" className="text-xs py-0">
                                        <Folder className="h-2.5 w-2.5 mr-1" />
                                        {archivo.carpetaNombre}
                                      </Badge>
                                    )}
                                    {archivo.autor && <span className="truncate">Por: {archivo.autor}</span>}
                                    {archivo.tamanio && <span>• {(archivo.tamanio / 1024).toFixed(1)} KB</span>}
                                    {archivo.fechaCreacion && <span className="hidden sm:inline">• {format(new Date(archivo.fechaCreacion), 'dd/MM/yyyy', { locale: es })}</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0 ml-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => window.open(archivo.url, '_blank')}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => {
                                    const link = document.createElement('a')
                                    link.href = archivo.url
                                    link.download = archivo.nombre
                                    link.click()
                                  }}
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Botón para mostrar más/menos archivos */}
                        {hayMas && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleToggleMostrarTodosArchivos(selectedTarea.id)}
                          >
                            {mostrarTodos ? (
                              <>
                                <ChevronDown className="h-4 w-4 mr-2 rotate-180" />
                                Mostrar solo últimos 2 archivos
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-2" />
                                Ver todos los archivos ({archivos.length})
                              </>
                            )}
                          </Button>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetalleDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edición de Tarea */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Tarea</DialogTitle>
          </DialogHeader>

          {selectedTarea && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-accion">Acción</Label>
                <Input
                  id="edit-accion"
                  value={tareaEditando.accion || ''}
                  onChange={(e) => setTareaEditando({ ...tareaEditando, accion: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-fecha">Fecha</Label>
                  <Input
                    id="edit-fecha"
                    type="date"
                    value={tareaEditando.fecha ? format(new Date(tareaEditando.fecha), 'yyyy-MM-dd') : ''}
                    onChange={(e) => setTareaEditando({ ...tareaEditando, fecha: new Date(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-hora">Hora</Label>
                  <Input
                    id="edit-hora"
                    type="time"
                    value={tareaEditando.hora || ''}
                    onChange={(e) => setTareaEditando({ ...tareaEditando, hora: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-responsable">Responsable</Label>
                <Select
                  value={tareaEditando.responsable || ''}
                  onValueChange={(value) => setTareaEditando({ ...tareaEditando, responsable: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuariosDisponibles.map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.nombre}>
                        {usuario.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-observaciones">Observación/Resumen</Label>
                <Textarea
                  id="edit-observaciones"
                  value={tareaEditando.observaciones || ''}
                  onChange={(e) => setTareaEditando({ ...tareaEditando, observaciones: e.target.value })}
                  rows={3}
                  placeholder="Resumen breve de la tarea..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarEdicionTarea}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
