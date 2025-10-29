'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  X,
  Send,
  Paperclip,
  FileText,
  CheckSquare,
  MoreVertical,
  Edit,
  Trash2,
  MessageSquarePlus,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import SelectorArchivosNotas from './SelectorArchivosNotas'
import SelectorTareasNotas from './SelectorTareasNotas'

interface Nota {
  id: string
  texto: string
  autor: string
  autorId: string
  fecha: Date
  editado?: boolean
  archivoReferenciado?: {
    id: string
    nombre: string
    tipo: string
  }
  tareaReferenciada?: {
    id: string
    titulo: string
  }
}

interface CuadernoNotasProps {
  expedienteId: string
  open: boolean
  onClose: () => void
}

export default function CuadernoNotas({ expedienteId, open, onClose }: CuadernoNotasProps) {
  const [notas, setNotas] = useState<Nota[]>([])
  const [nuevaNota, setNuevaNota] = useState('')
  const [cargando, setCargando] = useState(false)
  const [editandoNotaId, setEditandoNotaId] = useState<string | null>(null)
  const [textoEditado, setTextoEditado] = useState('')
  
  // Referencias
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<{ id: string; nombre: string } | null>(null)
  const [tareaSeleccionada, setTareaSeleccionada] = useState<{ id: string; accion: string } | null>(null)
  
  // Dialogs
  const [showSelectorArchivos, setShowSelectorArchivos] = useState(false)
  const [showSelectorTareas, setShowSelectorTareas] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const notasEndRef = useRef<HTMLDivElement>(null)

  // Usuario actual (simulado, en producción vendría de auth)
  const usuarioActual = {
    id: 'user-1',
    nombre: 'Dr. Juan Pérez'
  }

  // Scroll automático al final cuando hay nuevas notas
  useEffect(() => {
    if (notasEndRef.current) {
      notasEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [notas])

  // Cargar notas del expediente
  useEffect(() => {
    if (open && expedienteId) {
      cargarNotas()
    }
  }, [open, expedienteId])

  const cargarNotas = async () => {
    setCargando(true)
    try {
      // TODO: Llamar a API para obtener notas del expediente
      // const response = await fetch(`/api/expedientes/${expedienteId}/notas`)
      // const data = await response.json()
      
      // Datos de ejemplo
      const notasEjemplo: Nota[] = [
        {
          id: '1',
          texto: 'Revisé los documentos iniciales y todo está en orden. Podemos proceder con la demanda.',
          autor: 'Dr. Alberto González',
          autorId: 'user-2',
          fecha: new Date('2025-10-25T10:30:00'),
        },
        {
          id: '2',
          texto: 'He subido el escrito de demanda preliminar. Por favor revisen.',
          autor: 'Dra. María González',
          autorId: 'user-3',
          fecha: new Date('2025-10-26T14:15:00'),
          archivoReferenciado: {
            id: 'doc-1',
            nombre: 'Escrito_Demanda_Preliminar.pdf',
            tipo: 'application/pdf'
          }
        },
        {
          id: '3',
          texto: 'Necesitamos completar la tarea de notificación antes del viernes.',
          autor: 'Dr. Juan Pérez',
          autorId: 'user-1',
          fecha: new Date('2025-10-27T09:00:00'),
          tareaReferenciada: {
            id: 'tarea-1',
            titulo: 'Preparar notificación al demandado'
          }
        }
      ]
      
      setNotas(notasEjemplo)
    } catch (error) {
      console.error('Error al cargar notas:', error)
    } finally {
      setCargando(false)
    }
  }

  const handleEnviarNota = async () => {
    if (!nuevaNota.trim()) return

    setCargando(true)
    try {
      // TODO: Llamar a API para guardar nota
      // const response = await fetch(`/api/expedientes/${expedienteId}/notas`, {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     texto: nuevaNota,
      //     archivoReferenciadoId: archivoSeleccionado?.id,
      //     tareaReferenciadaId: tareaSeleccionada?.id
      //   })
      // })

      const nuevaNotaObj: Nota = {
        id: Date.now().toString(),
        texto: nuevaNota,
        autor: usuarioActual.nombre,
        autorId: usuarioActual.id,
        fecha: new Date(),
        ...(archivoSeleccionado && {
          archivoReferenciado: {
            id: archivoSeleccionado.id,
            nombre: archivoSeleccionado.nombre,
            tipo: 'application/pdf'
          }
        }),
        ...(tareaSeleccionada && {
          tareaReferenciada: {
            id: tareaSeleccionada.id,
            titulo: tareaSeleccionada.accion
          }
        })
      }

      setNotas([...notas, nuevaNotaObj])
      setNuevaNota('')
      setArchivoSeleccionado(null)
      setTareaSeleccionada(null)
    } catch (error) {
      console.error('Error al enviar nota:', error)
    } finally {
      setCargando(false)
    }
  }

  const handleEditarNota = (notaId: string, texto: string) => {
    setEditandoNotaId(notaId)
    setTextoEditado(texto)
  }

  const handleGuardarEdicion = async (notaId: string) => {
    if (!textoEditado.trim()) return

    try {
      // TODO: Llamar a API para actualizar nota
      setNotas(notas.map(nota => 
        nota.id === notaId 
          ? { ...nota, texto: textoEditado, editado: true }
          : nota
      ))
      setEditandoNotaId(null)
      setTextoEditado('')
    } catch (error) {
      console.error('Error al editar nota:', error)
    }
  }

  const handleEliminarNota = async (notaId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta nota?')) return

    try {
      // TODO: Llamar a API para eliminar nota
      setNotas(notas.filter(nota => nota.id !== notaId))
    } catch (error) {
      console.error('Error al eliminar nota:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEnviarNota()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-xl">Cuaderno de Notas</DialogTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              {notas.length} {notas.length === 1 ? 'nota' : 'notas'}
            </Badge>
          </div>
        </DialogHeader>

        {/* Área de notas con scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cargando && notas.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              Cargando notas...
            </div>
          ) : notas.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <MessageSquarePlus className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No hay notas aún</p>
              <p className="text-sm mt-1">Sé el primero en dejar una nota en este expediente</p>
            </div>
          ) : (
            <>
              {notas.map((nota) => (
                <Card key={nota.id} className={cn(
                  "transition-all",
                  nota.autorId === usuarioActual.id ? "bg-blue-50 border-blue-200" : "bg-white"
                )}>
                  <CardContent className="p-4">
                    {/* Header de la nota */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium text-white">
                          {nota.autor.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{nota.autor}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(nota.fecha), "dd/MM/yyyy HH:mm", { locale: es })}
                            {nota.editado && <span className="ml-2 text-gray-400">(editado)</span>}
                          </p>
                        </div>
                      </div>

                      {/* Opciones (solo para el autor) */}
                      {nota.autorId === usuarioActual.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditarNota(nota.id, nota.texto)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleEliminarNota(nota.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {/* Contenido de la nota */}
                    {editandoNotaId === nota.id ? (
                      <div className="space-y-2 mt-3">
                        <Textarea
                          value={textoEditado}
                          onChange={(e) => setTextoEditado(e.target.value)}
                          rows={3}
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleGuardarEdicion(nota.id)}>
                            Guardar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditandoNotaId(null)
                              setTextoEditado('')
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2">
                          {nota.texto}
                        </p>

                        {/* Referencias */}
                        <div className="mt-3 space-y-2">
                          {nota.archivoReferenciado && (
                            <div className="flex items-center gap-2 p-2 bg-gray-100 rounded text-xs">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">Archivo:</span>
                              <span className="text-blue-600">{nota.archivoReferenciado.nombre}</span>
                            </div>
                          )}
                          
                          {nota.tareaReferenciada && (
                            <div className="flex items-center gap-2 p-2 bg-orange-100 rounded text-xs">
                              <CheckSquare className="h-4 w-4 text-orange-600" />
                              <span className="font-medium">Tarea:</span>
                              <span className="text-orange-600">{nota.tareaReferenciada.titulo}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
              <div ref={notasEndRef} />
            </>
          )}
        </div>

        {/* Área de entrada de nueva nota */}
        <div className="border-t bg-gray-50 p-4">
          {/* Referencias seleccionadas */}
          {(archivoSeleccionado || tareaSeleccionada) && (
            <div className="mb-3 space-y-2">
              {archivoSeleccionado && (
                <div className="flex items-center gap-2 p-2 bg-blue-100 rounded text-xs">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="flex-1">{archivoSeleccionado.nombre}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5 p-0"
                    onClick={() => setArchivoSeleccionado(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {tareaSeleccionada && (
                <div className="flex items-center gap-2 p-2 bg-orange-100 rounded text-xs">
                  <CheckSquare className="h-4 w-4 text-orange-600" />
                  <span className="flex-1">{tareaSeleccionada.accion}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5 p-0"
                    onClick={() => setTareaSeleccionada(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSelectorArchivos(true)}
                title="Referenciar archivo"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSelectorTareas(true)}
                title="Referenciar tarea"
              >
                <CheckSquare className="h-4 w-4" />
              </Button>
            </div>

            <Textarea
              ref={textareaRef}
              value={nuevaNota}
              onChange={(e) => setNuevaNota(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe una nota... (Shift+Enter para nueva línea, Enter para enviar)"
              rows={2}
              className="flex-1 resize-none text-sm"
            />

            <Button
              onClick={handleEnviarNota}
              disabled={!nuevaNota.trim() || cargando}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Dialogs de selectores */}
      <SelectorArchivosNotas
        expedienteId={expedienteId}
        open={showSelectorArchivos}
        onClose={() => setShowSelectorArchivos(false)}
        onSeleccionar={setArchivoSeleccionado}
      />

      <SelectorTareasNotas
        expedienteId={expedienteId}
        open={showSelectorTareas}
        onClose={() => setShowSelectorTareas(false)}
        onSeleccionar={setTareaSeleccionada}
      />
    </Dialog>
  )
}
