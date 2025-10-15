'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface NuevaTareaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipo: 'PROCESAL' | 'EXTRA_PROCESAL' | 'AUDITORIA'
  onSubmit: (tarea: any) => void
  usuariosDisponibles?: Array<{ id: string; nombre: string; rol?: string }> // Staff del estudio (no clientes)
  usuarioActual?: { id: string; nombre: string }
}

export default function NuevaTareaDialog({
  open,
  onOpenChange,
  tipo,
  onSubmit,
  usuariosDisponibles = [],
  usuarioActual
}: NuevaTareaDialogProps) {
  const [formData, setFormData] = useState({
    accion: '',
    responsable: '',
    observaciones: '',
    fecha: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Crear observación inicial si hay texto
    const observacionesDetalladas = formData.observaciones.trim() ? [{
      id: Date.now().toString(),
      texto: formData.observaciones.trim(),
      autor: usuarioActual?.nombre || 'Sistema',
      autorId: usuarioActual?.id || 'system',
      fecha: new Date(),
      editado: false
    }] : []
    
    const nuevaTarea = {
      id: Date.now().toString(),
      estado: 'PENDIENTE' as const,
      accion: formData.accion,
      fecha: new Date(formData.fecha),
      hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      responsable: formData.responsable,
      observaciones: formData.observaciones || undefined,
      observacionesDetalladas: observacionesDetalladas,
      archivosAsociados: [],
      destacado: false,
    }

    onSubmit(nuevaTarea)
    
    // Reset form
    setFormData({
      accion: '',
      responsable: '',
      observaciones: '',
      fecha: new Date().toISOString().split('T')[0],
    })
    
    onOpenChange(false)
  }

  const getTipoLabel = () => {
    switch (tipo) {
      case 'PROCESAL':
        return 'Procesal'
      case 'EXTRA_PROCESAL':
        return 'Extra-procesal'
      case 'AUDITORIA':
        return 'Auditoría'
      default:
        return 'Tarea'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva Tarea {getTipoLabel()}</DialogTitle>
          <DialogDescription>
            Completa los datos para crear una nueva tarea en el expediente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="accion">Acción / Descripción *</Label>
            <Textarea
              id="accion"
              value={formData.accion}
              onChange={(e) => setFormData({ ...formData, accion: e.target.value })}
              placeholder="Ej: Solicitar documentación al cliente"
              required
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="responsable">Responsable (Staff) *</Label>
            <Select
              value={formData.responsable}
              onValueChange={(value) => setFormData({ ...formData, responsable: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar miembro del equipo" />
              </SelectTrigger>
              <SelectContent>
                {usuariosDisponibles.length > 0 ? (
                  usuariosDisponibles.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.nombre}>
                      {usuario.nombre} {usuario.rol && `(${usuario.rol})`}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="Sin usuarios" disabled>
                    No hay miembros del equipo disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Solo se muestran miembros del equipo legal (no clientes)
            </p>
          </div>

          <div>
            <Label htmlFor="fecha">Fecha de inicio</Label>
            <Input
              id="fecha"
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder="Información adicional (opcional)"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Tarea
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
