'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  Upload, 
  File, 
  X, 
  AlertCircle,
  FileText,
  Image,
  FileSpreadsheet
} from 'lucide-react'

const documentoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  tipoDocumento: z.enum([
    'ESCRITO', 'DEMANDA', 'CONTESTACION', 'SENTENCIA', 'RESOLUCION',
    'ACTA', 'CONTRATO', 'PODER', 'CEDULA', 'NOTIFICACION', 'OTRO'
  ]),
  expedienteId: z.string().min(1, 'Debe seleccionar un expediente'),
  descripcion: z.string().optional(),
  tags: z.string().optional()
})

type DocumentoFormData = z.infer<typeof documentoSchema>

interface Expediente {
  id: string
  numero: string
  caratula: string
  cliente: {
    nombre: string
    apellido: string
  }
}

interface SubirDocumentoFormProps {
  expedientes: Expediente[]
  userId: string
}

export default function SubirDocumentoForm({ expedientes, userId }: SubirDocumentoFormProps) {
  const router = useRouter()
  const [archivo, setArchivo] = useState<File | null>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<DocumentoFormData>({
    resolver: zodResolver(documentoSchema)
  })

  const tipoDocumento = watch('tipoDocumento')

  const tiposDocumento = [
    { value: 'ESCRITO', label: 'Escrito' },
    { value: 'DEMANDA', label: 'Demanda' },
    { value: 'CONTESTACION', label: 'Contestación' },
    { value: 'SENTENCIA', label: 'Sentencia' },
    { value: 'RESOLUCION', label: 'Resolución' },
    { value: 'ACTA', label: 'Acta' },
    { value: 'CONTRATO', label: 'Contrato' },
    { value: 'PODER', label: 'Poder' },
    { value: 'CEDULA', label: 'Cédula' },
    { value: 'NOTIFICACION', label: 'Notificación' },
    { value: 'OTRO', label: 'Otro' }
  ]

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />
    if (type.includes('image')) return <Image className="h-8 w-8 text-green-500" />
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="h-8 w-8 text-green-600" />
    if (type.includes('word') || type.includes('document')) return <FileText className="h-8 w-8 text-blue-500" />
    return <File className="h-8 w-8 text-gray-500" />
  }

  const manejarArchivoSeleccionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamaño (máximo 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 50MB.')
        return
      }

      // Validar tipos permitidos
      const tiposPermitidos = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain'
      ]

      if (!tiposPermitidos.includes(file.type)) {
        toast.error('Tipo de archivo no permitido.')
        return
      }

      setArchivo(file)

      // Auto-completar nombre si está vacío
      if (!watch('nombre')) {
        const nombreSinExtension = file.name.replace(/\.[^/.]+$/, '')
        setValue('nombre', nombreSinExtension)
      }

      // Generar preview para imágenes
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }
    }
  }

  const eliminarArchivo = () => {
    setArchivo(null)
    setPreview(null)
    const fileInput = document.getElementById('archivo') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const onSubmit = async (data: DocumentoFormData) => {
    if (!archivo) {
      toast.error('Debe seleccionar un archivo')
      return
    }

    setSubiendo(true)

    try {
      const formData = new FormData()
      formData.append('archivo', archivo)
      formData.append('nombre', data.nombre)
      formData.append('tipoDocumento', data.tipoDocumento)
      formData.append('expedienteId', data.expedienteId)
      formData.append('userId', userId)
      
      if (data.descripcion) {
        formData.append('descripcion', data.descripcion)
      }
      
      if (data.tags) {
        formData.append('tags', data.tags)
      }

      const response = await fetch('/api/documentos/subir', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al subir documento')
      }

      const resultado = await response.json()
      
      toast.success('Documento subido correctamente')
      router.push(`/documentos/${resultado.id}`)
      
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al subir documento')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Selector de archivo */}
      <div className="space-y-4">
        <Label>Archivo *</Label>
        
        {!archivo ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              id="archivo"
              type="file"
              onChange={manejarArchivoSeleccionado}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
            />
            <label 
              htmlFor="archivo" 
              className="cursor-pointer flex flex-col items-center space-y-4"
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <div>
                <div className="text-lg font-medium text-gray-900">
                  Selecciona un archivo
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  PDF, Word, Excel, Imágenes hasta 50MB
                </div>
              </div>
              <Button type="button" variant="outline">
                Examinar archivos
              </Button>
            </label>
          </div>
        ) : (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {getFileIcon(archivo.type)}
                <div>
                  <div className="font-medium text-gray-900">{archivo.name}</div>
                  <div className="text-sm text-gray-500">
                    {formatFileSize(archivo.size)}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={eliminarArchivo}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {preview && (
              <div className="mt-4">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-w-48 max-h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Información del documento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del Documento *</Label>
          <Input
            id="nombre"
            {...register('nombre')}
            placeholder="ej. Demanda Principal"
          />
          {errors.nombre && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.nombre.message}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Tipo de Documento *</Label>
          <Select onValueChange={(value) => setValue('tipoDocumento', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              {tiposDocumento.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tipoDocumento && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.tipoDocumento.message}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Expediente *</Label>
        <Select onValueChange={(value) => setValue('expedienteId', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el expediente" />
          </SelectTrigger>
          <SelectContent>
            {expedientes.map((expediente) => (
              <SelectItem key={expediente.id} value={expediente.id}>
                {expediente.numero} - {expediente.cliente.nombre} {expediente.cliente.apellido}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.expedienteId && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.expedienteId.message}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          {...register('descripcion')}
          placeholder="Descripción opcional del documento..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Etiquetas</Label>
        <Input
          id="tags"
          {...register('tags')}
          placeholder="ej. urgente, revision, final (separadas por comas)"
        />
        <div className="text-sm text-gray-500">
          Separa las etiquetas con comas para facilitar la búsqueda
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={subiendo}
        >
          Cancelar
        </Button>
        
        <Button 
          type="submit" 
          disabled={subiendo || !archivo}
          className="min-w-32"
        >
          {subiendo ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Subiendo...</span>
            </div>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Subir Documento
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
