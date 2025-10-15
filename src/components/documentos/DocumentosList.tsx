'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Plus, 
  FileText, 
  Download, 
  Eye, 
  Upload,
  Filter,
  FolderOpen,
  Calendar,
  User,
  Hash,
  ArrowUpDown
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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
      nombre: string
      apellido: string
    }
  }
  creador: {
    name: string | null
    email: string | null
  }
}

interface Expediente {
  id: string
  numero: string
  caratula: string
  cliente: {
    nombre: string
    apellido: string
  }
}

interface DocumentosListProps {
  documentos: Documento[]
  expedientes: Expediente[]
  searchParams: {
    expediente?: string
    tipo?: string
    search?: string
  }
  stats: {
    total: number
    recientes: number
  }
}

export default function DocumentosList({ 
  documentos, 
  expedientes, 
  searchParams,
  stats 
}: DocumentosListProps) {
  const router = useRouter()
  const currentSearchParams = useSearchParams()
  
  const [filtroTexto, setFiltroTexto] = useState(searchParams.search || '')
  const [filtroExpediente, setFiltroExpediente] = useState(searchParams.expediente || '')
  const [filtroTipo, setFiltroTipo] = useState(searchParams.tipo || '')

  const tiposDocumento = [
    'ESCRITO', 'DEMANDA', 'CONTESTACION', 'SENTENCIA', 'RESOLUCION', 
    'ACTA', 'CONTRATO', 'PODER', 'CEDULA', 'NOTIFICACION', 'OTRO'
  ]

  const aplicarFiltros = () => {
    const params = new URLSearchParams()
    
    if (filtroTexto) params.set('search', filtroTexto)
    if (filtroExpediente) params.set('expediente', filtroExpediente)
    if (filtroTipo) params.set('tipo', filtroTipo)
    
    router.push(`/documentos?${params.toString()}`)
  }

  const limpiarFiltros = () => {
    setFiltroTexto('')
    setFiltroExpediente('')
    setFiltroTipo('')
    router.push('/documentos')
  }

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

  return (
    <div className="space-y-6">
      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subidos Esta Semana</CardTitle>
            <Upload className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.recientes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expedientes Activos</CardTitle>
            <FolderOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{expedientes.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Filtro y Acciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filtroExpediente}
              onChange={(e) => setFiltroExpediente(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="">Todos los expedientes</option>
              {expedientes.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.numero} - {exp.cliente.nombre} {exp.cliente.apellido}
                </option>
              ))}
            </select>
            
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="">Todos los tipos</option>
              {tiposDocumento.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo.replace('_', ' ')}
                </option>
              ))}
            </select>
            
            <div className="flex space-x-2">
              <Button onClick={aplicarFiltros} className="flex-1">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              <Button variant="outline" onClick={limpiarFiltros}>
                Limpiar
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {documentos.length} documentos encontrados
            </div>
            
            <Link href="/documentos/subir">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Subir Documento
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      <div className="grid gap-4">
        {documentos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron documentos</h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchParams.search || searchParams.expediente || searchParams.tipo
                  ? 'Intenta ajustar los filtros de búsqueda.'
                  : 'Comienza subiendo tu primer documento al sistema.'
                }
              </p>
              {!searchParams.search && !searchParams.expediente && !searchParams.tipo && (
                <Link href="/documentos/subir">
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Primer Documento
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          documentos.map((documento) => (
            <Card key={documento.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Icono del archivo */}
                    <div className="text-3xl">
                      {getFileIcon(documento.extension)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Título y badges */}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors cursor-pointer">
                          {documento.nombre}
                        </h3>
                        <Badge className={getTipoDocumentoBadgeColor(documento.tipoDocumento)}>
                          {documento.tipoDocumento.replace('_', ' ')}
                        </Badge>
                        {documento.version > 1 && (
                          <Badge variant="outline">
                            v{documento.version}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Descripción */}
                      {documento.descripcion && (
                        <p className="text-gray-600 mb-2">{documento.descripcion}</p>
                      )}
                      
                      {/* Información del expediente */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <Link 
                          href={`/expedientes/${documento.expediente.id}`}
                          className="flex items-center hover:text-blue-600 transition-colors"
                        >
                          <FolderOpen className="h-4 w-4 mr-1" />
                          {documento.expediente.numero}
                        </Link>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {documento.expediente.cliente.nombre} {documento.expediente.cliente.apellido}
                        </div>
                      </div>
                      
                      {/* Metadatos del archivo */}
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <div className="flex items-center">
                          <Hash className="h-3 w-3 mr-1" />
                          {documento.extension.toUpperCase()}
                        </div>
                        <div className="flex items-center">
                          <ArrowUpDown className="h-3 w-3 mr-1" />
                          {formatFileSize(documento.tamaño)}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(documento.createdAt), 'dd/MM/yyyy', { locale: es })}
                        </div>
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {documento.creador.name}
                        </div>
                      </div>
                      
                      {/* Tags */}
                      {documento.tags && (
                        <div className="mt-2">
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
                    </div>
                  </div>
                  
                  {/* Acciones */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                    <Link href={`/documentos/${documento.id}/editar`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Paginación o Load More si hay muchos documentos */}
      {documentos.length >= 50 && (
        <div className="text-center">
          <Button variant="outline">
            Cargar más documentos
          </Button>
        </div>
      )}
    </div>
  )
}
