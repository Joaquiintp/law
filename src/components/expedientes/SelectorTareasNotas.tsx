'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CheckSquare, Search } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Tarea {
  id: string
  titulo: string
  descripcion?: string
  tipo: 'PROCESAL' | 'EXTRA_PROCESAL' | 'AUDITORIA'
  estado: 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA'
  fechaVencimiento: Date
}

interface SelectorTareasNotasProps {
  expedienteId: string
  open: boolean
  onClose: () => void
  onSeleccionar: (tarea: { id: string; accion: string }) => void
}

export default function SelectorTareasNotas({
  expedienteId,
  open,
  onClose,
  onSeleccionar
}: SelectorTareasNotasProps) {
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [cargando, setCargando] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    if (open && expedienteId) {
      cargarTareas()
    }
  }, [open, expedienteId])

  const cargarTareas = async () => {
    setCargando(true)
    try {
      // TODO: Llamar a API para obtener tareas del expediente
      // const response = await fetch(`/api/expedientes/${expedienteId}/tareas`)
      // const data = await response.json()
      
      // Datos de ejemplo
      const tareasEjemplo: Tarea[] = [
        {
          id: 'tarea-1',
          titulo: 'Preparar notificación al demandado',
          descripcion: 'Elaborar y enviar notificación formal',
          tipo: 'PROCESAL',
          estado: 'PENDIENTE',
          fechaVencimiento: new Date('2025-10-30')
        },
        {
          id: 'tarea-2',
          titulo: 'Revisión de documentación',
          descripcion: 'Verificar completitud de expediente',
          tipo: 'EXTRA_PROCESAL',
          estado: 'PENDIENTE',
          fechaVencimiento: new Date('2025-10-28')
        },
        {
          id: 'tarea-3',
          titulo: 'Presentar escrito ampliatorio',
          tipo: 'PROCESAL',
          estado: 'PENDIENTE',
          fechaVencimiento: new Date('2025-11-05')
        }
      ]
      
      setTareas(tareasEjemplo)
    } catch (error) {
      console.error('Error al cargar tareas:', error)
    } finally {
      setCargando(false)
    }
  }

  const tareasFiltradas = tareas.filter(tarea =>
    tarea.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    tarea.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleSeleccionar = (tarea: Tarea) => {
    onSeleccionar({
      id: tarea.id,
      accion: tarea.titulo
    })
    onClose()
  }

  const getEstadoBadge = (estado: Tarea['estado']) => {
    switch (estado) {
      case 'PENDIENTE':
        return <Badge className="bg-orange-100 text-orange-700 text-xs">Pendiente</Badge>
      case 'COMPLETADA':
        return <Badge className="bg-green-100 text-green-700 text-xs">Completada</Badge>
      case 'CANCELADA':
        return <Badge className="bg-gray-100 text-gray-700 text-xs">Cancelada</Badge>
    }
  }

  const getTipoBadge = (tipo: Tarea['tipo']) => {
    switch (tipo) {
      case 'PROCESAL':
        return <Badge variant="secondary" className="text-xs">Procesal</Badge>
      case 'EXTRA_PROCESAL':
        return <Badge variant="secondary" className="text-xs">Extra-procesal</Badge>
      case 'AUDITORIA':
        return <Badge variant="secondary" className="text-xs">Auditoría</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Seleccionar Tarea para Referenciar</DialogTitle>
        </DialogHeader>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar tarea..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lista de tareas */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {cargando ? (
            <div className="text-center py-8 text-gray-400">
              Cargando tareas...
            </div>
          ) : tareasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No se encontraron tareas
            </div>
          ) : (
            tareasFiltradas.map((tarea) => (
              <div
                key={tarea.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleSeleccionar(tarea)}
              >
                <CheckSquare className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{tarea.titulo}</p>
                  {tarea.descripcion && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {tarea.descripcion}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {getTipoBadge(tarea.tipo)}
                    {getEstadoBadge(tarea.estado)}
                    <span className="text-xs text-gray-500">
                      Vence: {format(new Date(tarea.fechaVencimiento), 'dd/MM/yyyy', { locale: es })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
