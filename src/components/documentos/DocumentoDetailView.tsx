'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Download,
  Edit,
  Eye,
  FileText,
  FolderOpen,
  Calendar,
  User,
  Hash,
  ArrowUpDown,
  History,
  Activity,
  Trash2,
  Share2,
  ExternalLink
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

interface Documento {
  id: string
  nombre: string
  tipoDocumento: string
  version: number
  rutaArchivo: string
  tamaño: number
  extension: string
  descripcion?: string | null
  tags?: string | null
  createdAt: Date
  updatedAt: Date
  expediente: {
    id: string
    numero: string
    caratula: string
    cliente: {
      id: string
      nombre: string
      apellido: string
      email: string
      telefono?: string | null
    }
  }
  creador: {
    id: string
    name: string | null
    email: string | null
  }
}

interface Version {
  id: string
  version: number
  tamaño: number
  createdAt: Date
  creador: {
    name: string | null
    email: string | null
  }
}

interface ActividadLog {
  id: string
  accion: string
  descripcion: string
  createdAt: Date
  user: {
    name: string | null
    email: string | null
  }
}

interface DocumentoDetailViewProps {
  documento: Documento
  versiones: Version[]
  actividad: ActividadLog[]
}

export default function DocumentoDetailView({
  documento,
  versiones,
  actividad
}: DocumentoDetailViewProps) {
  const router = useRouter()
  const [descargando, setDescargando] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTipoDocumentoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'DEMANDA':
        return 'bg-red-100 text-red-800'
      case 'CONTESTACION':
        return 'bg-blue-100 text-blue-800'
      case 'SENTENCIA':
        return 'bg-green-100 text-green-800'
      case 'CONTRATO':
        return 'bg-purple-100 text-purple-800'
      case 'ESCRITO':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getFileIcon = (extension: string) => {
    switch (extension.toLowerCase()) {
      case 'pdf':
        return '📄'
      case 'doc':
      case 'docx':
        return '📝'
      case 'xls':
      case 'xlsx':
        return '📊'
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️'
      default:
        return '📎'
    }
  }

  const descargarDocumento = async () => {
    setDescargando(true)
    try {
      const response = await fetch(`/api/documentos/${documento.id}/descargar`)
      
      if (!response.ok) {
        throw new Error('Error al descargar el documento')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${documento.nombre}.${documento.extension}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Documento descargado correctamente')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al descargar el documento')
    } finally {
      setDescargando(false)
    }
  }

  const eliminarDocumento = async () => {
    if (!confirm('¿Está seguro de eliminar este documento? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/documentos/${documento.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el documento')
      }

      toast.success('Documento eliminado correctamente')
      router.push('/documentos')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar el documento')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/documentos" className="hover:text-blue-600">
              Documentos
            </Link>
            <span>/</span>
            <span className="font-medium text-gray-900">{documento.nombre}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={descargarDocumento}
            disabled={descargando}
          >
            {descargando ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Descargar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/documentos/${documento.id}/editar`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detalles del documento */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-4xl">{getFileIcon(documento.extension)}</div>
                  <div>
                    <CardTitle className="text-xl">{documento.nombre}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getTipoDocumentoBadgeColor(documento.tipoDocumento)}>
                        {documento.tipoDocumento.replace('_', ' ')}
                      </Badge>
                      {documento.version > 1 && (
                        <Badge variant="outline">
                          Versión {documento.version}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Vista Previa
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {documento.descripcion && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Descripción</h4>
                  <p className="text-gray-600">{documento.descripcion}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Formato</span>
                  <div className="font-medium flex items-center">
                    <Hash className="h-3 w-3 mr-1" />
                    {documento.extension.toUpperCase()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Tamaño</span>
                  <div className="font-medium flex items-center">
                    <ArrowUpDown className="h-3 w-3 mr-1" />
                    {formatFileSize(documento.tamaño)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Creado</span>
                  <div className="font-medium flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(documento.createdAt), 'dd/MM/yyyy', { locale: es })}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Autor</span>
                  <div className="font-medium flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {documento.creador.name}
                  </div>
                </div>
              </div>

              {documento.tags && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Etiquetas</h4>
                  <div className="flex flex-wrap gap-1">
                    {documento.tags.split(',').map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historial de versiones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historial de Versiones ({versiones.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {versiones.map((version) => (
                  <div 
                    key={version.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      version.id === documento.id 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        version.id === documento.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-300 text-gray-700'
                      }`}>
                        v{version.version}
                      </div>
                      <div>
                        <div className="text-sm">
                          {format(new Date(version.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                          {version.id === documento.id && (
                            <span className="text-blue-600 font-medium ml-2">(Actual)</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {version.creador.name} • {formatFileSize(version.tamaño)}
                        </div>
                      </div>
                    </div>
                    
                    {version.id !== documento.id && (
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Descargar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Información del expediente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-blue-600" />
                Expediente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Número</div>
                <Link 
                  href={`/expedientes/${documento.expediente.id}`}
                  className="font-medium text-blue-600 hover:underline flex items-center"
                >
                  {documento.expediente.numero}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Carátula</div>
                <div className="font-medium">{documento.expediente.caratula}</div>
              </div>

              <div className="border-t" />

              <div>
                <div className="text-sm text-gray-500 mb-2">Cliente</div>
                <Link
                  href={`/clientes/${documento.expediente.cliente.id}`}
                  className="block hover:bg-gray-50 p-2 rounded border"
                >
                  <div className="font-medium text-gray-900">
                    {documento.expediente.cliente.nombre} {documento.expediente.cliente.apellido}
                  </div>
                  <div className="text-sm text-gray-500">{documento.expediente.cliente.email}</div>
                  {documento.expediente.cliente.telefono && (
                    <div className="text-sm text-gray-500">{documento.expediente.cliente.telefono}</div>
                  )}
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Actividad reciente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {actividad.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay actividad registrada</p>
                ) : (
                  actividad.slice(0, 10).map((item) => (
                    <div key={item.id} className="text-sm">
                      <div className="font-medium">{item.descripcion}</div>
                      <div className="text-gray-500 text-xs">
                        {item.user.name} • {format(new Date(item.createdAt), 'dd/MM HH:mm', { locale: es })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acciones adicionales */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push(`/documentos/subir?expediente=${documento.expediente.id}&nombre=${documento.nombre}`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Nueva Versión
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir Enlace
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={eliminarDocumento}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
