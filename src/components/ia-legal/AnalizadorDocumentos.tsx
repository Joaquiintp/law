'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, 
  Search, 
  Bot,
  Download,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  FileCheck
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

interface Documento {
  id: string
  nombre: string
  tipoDocumento: string
  createdAt: Date
  expediente: {
    id: string
    cliente: {
      id: string
      nombre: string
    }
  }
  consultasIA: ConsultaIA[]
}

interface ConsultaIA {
  id: string
  tipo: string
  pregunta: string
  respuesta?: string | null
  estado: string
  createdAt: Date
  documento?: {
    id: string
    nombre: string
    tipoDocumento: string
  } | null
  expediente?: {
    id: string
    numero: string
    caratula: string
  } | null
}

interface AnalizadorDocumentosProps {
  documentos: Documento[]
  historial: ConsultaIA[]
  userId: string
}

export default function AnalizadorDocumentos({ documentos, historial, userId }: AnalizadorDocumentosProps) {
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<Documento | null>(null)
  const [tipoAnalisis, setTipoAnalisis] = useState<string>('ANALISIS_DOCUMENTO')
  const [analizando, setAnalizando] = useState(false)
  const [resultadoAnalisis, setResultadoAnalisis] = useState<string | null>(null)
  const [filtroTipo, setFiltroTipo] = useState<string>('')
  const [busqueda, setBusqueda] = useState('')

  const tiposAnalisis = [
    { value: 'ANALISIS_DOCUMENTO', label: 'Análisis General' },
    { value: 'REVISION_LEGAL', label: 'Revisión Legal' },
    { value: 'ANALISIS_RIESGO', label: 'Análisis de Riesgos' },
    { value: 'VALIDACION_FORMAL', label: 'Validación Formal' },
    { value: 'EXTRACCION_CLAUSULAS', label: 'Extracción de Cláusulas' },
    { value: 'COMPARACION_NORMATIVA', label: 'Comparación Normativa' }
  ]

  const tiposDocumento = [
    'CONTRATO',
    'DEMANDA',
    'ESCRITURA',
    'PODER',
    'SENTENCIA',
    'EXPEDIENTE',
    'OTROS'
  ]

  // Filtrar documentos
  const documentosFiltrados = documentos.filter(doc => {
    const cumpleBusqueda = doc.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          doc.expediente.cliente.razonSocial.toLowerCase().includes(busqueda.toLowerCase())
    const cumpleTipo = !filtroTipo || doc.tipoDocumento === filtroTipo
    return cumpleBusqueda && cumpleTipo
  })

  const analizarDocumento = async () => {
    if (!documentoSeleccionado) {
      toast.error('Selecciona un documento para analizar')
      return
    }

    setAnalizando(true)
    setResultadoAnalisis(null)

    try {
      const response = await fetch('/api/ia-legal/analizar-documento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentoId: documentoSeleccionado.id,
          tipoAnalisis
        })
      })

      if (!response.ok) {
        throw new Error('Error en el análisis del documento')
      }

      const data = await response.json()
      setResultadoAnalisis(data.analisis)
      toast.success('Análisis completado exitosamente')

    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al analizar el documento')
    } finally {
      setAnalizando(false)
    }
  }

  const descargarAnalisis = () => {
    if (!resultadoAnalisis || !documentoSeleccionado) return

    const contenido = `ANÁLISIS DE DOCUMENTO - ${documentoSeleccionado.nombre}
Fecha: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}
Cliente: ${documentoSeleccionado.expediente.cliente.nombre}
Tipo de Análisis: ${tiposAnalisis.find(t => t.value === tipoAnalisis)?.label}

${resultadoAnalisis}`

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analisis-${documentoSeleccionado.nombre.replace(/[^a-zA-Z0-9]/g, '-')}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const cargarAnalisisAnterior = (consulta: ConsultaIA) => {
    const documento = documentos.find(d => d.id === consulta.documento?.id)
    if (documento) {
      setDocumentoSeleccionado(documento)
      setResultadoAnalisis(consulta.respuesta || null)
      setTipoAnalisis(consulta.tipo)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Panel de selección de documentos */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Seleccionar Documento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtros */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar documento..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los tipos</SelectItem>
                  {tiposDocumento.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lista de documentos */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {documentosFiltrados.map((documento) => (
                <button
                  key={documento.id}
                  onClick={() => setDocumentoSeleccionado(documento)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    documentoSeleccionado?.id === documento.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {documento.nombre}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {documento.expediente.cliente.nombre}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant="outline" className="text-xs">
                          {documento.tipoDocumento}
                        </Badge>
                        {documento.consultasIA.length > 0 && (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              
              {documentosFiltrados.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No se encontraron documentos</p>
                </div>
              )}
            </div>

            {/* Configuración del análisis */}
            {documentoSeleccionado && (
              <div className="pt-4 border-t space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tipo de Análisis
                  </label>
                  <Select value={tipoAnalisis} onValueChange={setTipoAnalisis}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposAnalisis.map(tipo => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={analizarDocumento} 
                  disabled={analizando}
                  className="w-full"
                >
                  {analizando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4 mr-2" />
                      Analizar Documento
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historial de análisis */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Análisis Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {historial.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay análisis previos
                </p>
              ) : (
                historial.map((consulta) => (
                  <button
                    key={consulta.id}
                    onClick={() => cargarAnalisisAnterior(consulta)}
                    className="w-full text-left p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">
                          {consulta.documento?.nombre || 'Documento eliminado'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(consulta.createdAt), 'dd/MM/yy HH:mm', { locale: es })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge 
                          variant={consulta.estado === 'COMPLETADA' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {consulta.estado === 'COMPLETADA' ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : consulta.estado === 'PROCESANDO' ? (
                            <Clock className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel de resultados */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-600" />
                Resultado del Análisis
              </CardTitle>
              {resultadoAnalisis && documentoSeleccionado && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={descargarAnalisis}>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {!documentoSeleccionado ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona un documento para analizar
                </h3>
                <p className="text-gray-500">
                  Elige un documento de la lista de la izquierda para comenzar el análisis con IA
                </p>
              </div>
            ) : analizando ? (
              <div className="text-center py-12">
                <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Analizando documento...
                </h3>
                <p className="text-gray-500">
                  La IA está revisando el documento. Esto puede tomar unos momentos.
                </p>
              </div>
            ) : resultadoAnalisis ? (
              <div className="prose max-w-none">
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Documento analizado: {documentoSeleccionado.nombre}
                  </h4>
                  <p className="text-blue-700 text-sm">
                    Cliente: {documentoSeleccionado.expediente.cliente.nombre} • 
                    Tipo: {documentoSeleccionado.tipoDocumento} • 
                    Análisis: {tiposAnalisis.find(t => t.value === tipoAnalisis)?.label}
                  </p>
                </div>
                
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {resultadoAnalisis}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Listo para analizar
                </h3>
                <p className="text-gray-500 mb-4">
                  Documento seleccionado: <strong>{documentoSeleccionado.nombre}</strong>
                </p>
                <p className="text-sm text-gray-400">
                  Configura el tipo de análisis y haz clic en "Analizar Documento"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
