'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Folder, FolderPlus, X } from 'lucide-react'

interface Carpeta {
  id: string
  nombre: string
  color?: string
}

interface SelectorCarpetasProps {
  carpetas: Carpeta[]
  carpetaSeleccionada?: string
  onSeleccionarCarpeta: (carpetaId: string | undefined) => void
  onCrearCarpeta: (nombre: string, color?: string) => void
}

const COLORES_CARPETA = [
  { value: 'blue', label: 'Azul', class: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'green', label: 'Verde', class: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'yellow', label: 'Amarillo', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'red', label: 'Rojo', class: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'purple', label: 'Morado', class: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'gray', label: 'Gris', class: 'bg-gray-100 text-gray-700 border-gray-200' },
]

export default function SelectorCarpetas({
  carpetas,
  carpetaSeleccionada,
  onSeleccionarCarpeta,
  onCrearCarpeta
}: SelectorCarpetasProps) {
  const [showNuevaCarpeta, setShowNuevaCarpeta] = useState(false)
  const [nombreNuevaCarpeta, setNombreNuevaCarpeta] = useState('')
  const [colorNuevaCarpeta, setColorNuevaCarpeta] = useState('blue')

  const handleCrearCarpeta = () => {
    if (nombreNuevaCarpeta.trim()) {
      onCrearCarpeta(nombreNuevaCarpeta.trim(), colorNuevaCarpeta)
      setNombreNuevaCarpeta('')
      setColorNuevaCarpeta('blue')
      setShowNuevaCarpeta(false)
    }
  }

  const getColorClass = (color?: string) => {
    return COLORES_CARPETA.find(c => c.value === color)?.class || COLORES_CARPETA[0].class
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Carpeta de destino</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowNuevaCarpeta(true)}
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          Nueva Carpeta
        </Button>
      </div>

      {carpetas.length > 0 ? (
        <div className="space-y-2">
          <Select value={carpetaSeleccionada || 'sin-carpeta'} onValueChange={(value) => onSeleccionarCarpeta(value === 'sin-carpeta' ? undefined : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una carpeta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sin-carpeta">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-gray-400" />
                  <span>Sin carpeta</span>
                </div>
              </SelectItem>
              {carpetas.map((carpeta) => (
                <SelectItem key={carpeta.id} value={carpeta.id}>
                  <div className="flex items-center gap-2">
                    <Folder className={`h-4 w-4`} style={{ color: carpeta.color || '#3b82f6' }} />
                    <span>{carpeta.nombre}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Vista de carpetas existentes */}
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg bg-gray-50">
            {carpetas.map((carpeta) => (
              <button
                key={carpeta.id}
                type="button"
                onClick={() => onSeleccionarCarpeta(carpeta.id)}
                className={`flex items-center gap-2 p-2 rounded border-2 transition-all hover:shadow-md ${
                  carpetaSeleccionada === carpeta.id
                    ? `${getColorClass(carpeta.color)} border-opacity-100 shadow-sm`
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <Folder className={`h-5 w-5 flex-shrink-0 ${carpetaSeleccionada === carpeta.id ? '' : 'text-gray-500'}`} />
                <span className={`text-sm truncate ${carpetaSeleccionada === carpeta.id ? 'font-medium' : ''}`}>
                  {carpeta.nombre}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 border-2 border-dashed rounded-lg text-center text-gray-500">
          <Folder className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No hay carpetas creadas</p>
          <p className="text-xs mt-1">Haz clic en "Nueva Carpeta" para crear una</p>
        </div>
      )}

      {/* Dialog para crear nueva carpeta */}
      <Dialog open={showNuevaCarpeta} onOpenChange={setShowNuevaCarpeta}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nueva Carpeta</DialogTitle>
            <DialogDescription>
              Organiza tus documentos en carpetas para encontrarlos fácilmente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre-carpeta">Nombre de la carpeta *</Label>
              <Input
                id="nombre-carpeta"
                value={nombreNuevaCarpeta}
                onChange={(e) => setNombreNuevaCarpeta(e.target.value)}
                placeholder="Ej: Contratos, Demandas, Pruebas..."
                className="mt-1"
                autoFocus
              />
            </div>

            <div>
              <Label>Color de la carpeta</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {COLORES_CARPETA.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setColorNuevaCarpeta(color.value)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      colorNuevaCarpeta === color.value
                        ? `${color.class} border-opacity-100 shadow-md scale-105`
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Folder className="h-5 w-5" />
                    <span className="text-sm font-medium">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Vista previa */}
            <div className="p-3 bg-gray-50 rounded-lg border">
              <Label className="text-xs text-gray-600 mb-2 block">Vista previa:</Label>
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${getColorClass(colorNuevaCarpeta)}`}>
                <Folder className="h-5 w-5" />
                <span className="font-medium">{nombreNuevaCarpeta || 'Nombre de carpeta'}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowNuevaCarpeta(false)
                setNombreNuevaCarpeta('')
                setColorNuevaCarpeta('blue')
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCrearCarpeta}
              disabled={!nombreNuevaCarpeta.trim()}
            >
              Crear Carpeta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
