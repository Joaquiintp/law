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
import { FileText, Search, X } from 'lucide-react'

interface Archivo {
  id: string
  nombre: string
  tipoDocumento: string
  extension: string
  createdAt: Date
}

interface SelectorArchivosNotasProps {
  expedienteId: string
  open: boolean
  onClose: () => void
  onSeleccionar: (archivo: { id: string; nombre: string }) => void
}

export default function SelectorArchivosNotas({
  expedienteId,
  open,
  onClose,
  onSeleccionar
}: SelectorArchivosNotasProps) {
  const [archivos, setArchivos] = useState<Archivo[]>([])
  const [cargando, setCargando] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    if (open && expedienteId) {
      cargarArchivos()
    }
  }, [open, expedienteId])

  const cargarArchivos = async () => {
    setCargando(true)
    try {
      // TODO: Llamar a API para obtener archivos del expediente
      // const response = await fetch(`/api/expedientes/${expedienteId}/documentos`)
      // const data = await response.json()
      
      // Datos de ejemplo
      const archivosEjemplo: Archivo[] = [
        {
          id: 'doc-1',
          nombre: 'Escrito_Demanda_Preliminar.pdf',
          tipoDocumento: 'DEMANDA',
          extension: '.pdf',
          createdAt: new Date('2025-10-20')
        },
        {
          id: 'doc-2',
          nombre: 'Prueba_Documental_Contratos.pdf',
          tipoDocumento: 'PRUEBA',
          extension: '.pdf',
          createdAt: new Date('2025-10-22')
        },
        {
          id: 'doc-3',
          nombre: 'Informe_Pericial.docx',
          tipoDocumento: 'INFORME',
          extension: '.docx',
          createdAt: new Date('2025-10-24')
        }
      ]
      
      setArchivos(archivosEjemplo)
    } catch (error) {
      console.error('Error al cargar archivos:', error)
    } finally {
      setCargando(false)
    }
  }

  const archivosFiltrados = archivos.filter(archivo =>
    archivo.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleSeleccionar = (archivo: Archivo) => {
    onSeleccionar({
      id: archivo.id,
      nombre: archivo.nombre
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Seleccionar Archivo para Referenciar</DialogTitle>
        </DialogHeader>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar archivo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lista de archivos */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {cargando ? (
            <div className="text-center py-8 text-gray-400">
              Cargando archivos...
            </div>
          ) : archivosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No se encontraron archivos
            </div>
          ) : (
            archivosFiltrados.map((archivo) => (
              <div
                key={archivo.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleSeleccionar(archivo)}
              >
                <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{archivo.nombre}</p>
                  <p className="text-xs text-gray-500">
                    {archivo.tipoDocumento} · {archivo.extension}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {new Date(archivo.createdAt).toLocaleDateString('es-AR')}
                </Badge>
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
