'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileText, Upload, Loader2, CheckCircle2, AlertCircle, Brain, DollarSign, Clock, FolderOpen, Search } from 'lucide-react'

interface Documento {
  id: string
  nombre: string
  tipoDocumento: string
  rutaArchivo: string
  createdAt: string
  expediente?: {
    numero: string
    caratula: string
  }
}

interface ResumenResultado {
  resumen: any
  metadata: {
    tipoDocumento: string
    tipoDetectado: boolean
    nombreArchivo: string
    tokensUsados: number
    costo: number
    costoFormateado: string
    modelo: string
    duracionMs: number
    consultasRestantes: number | null
  }
}

export default function ResumidorDocumentos() {
  // Estados para subida de archivo
  const [archivo, setArchivo] = useState<File | null>(null)
  const [tipoDocumento, setTipoDocumento] = useState<string>('auto')
  
  // Estados para selección de documentos existentes
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<string>('')
  const [busquedaDoc, setBusquedaDoc] = useState('')
  const [cargandoDocumentos, setCargandoDocumentos] = useState(false)
  
  // Estados compartidos
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState<ResumenResultado | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tabActivo, setTabActivo] = useState<string>('nuevo')

  // Cargar documentos existentes al montar el componente
  useEffect(() => {
    cargarDocumentos()
  }, [])

  const cargarDocumentos = async () => {
    setCargandoDocumentos(true)
    try {
      const response = await fetch('/api/documentos')
      if (response.ok) {
        const data = await response.json()
        setDocumentos(data.documentos || [])
      }
    } catch (err) {
      console.error('Error cargando documentos:', err)
    } finally {
      setCargandoDocumentos(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamaño (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo excede el tamaño máximo de 10MB')
        return
      }
      setArchivo(file)
      setError(null)
      setResultado(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!archivo) {
      setError('Por favor seleccione un archivo')
      return
    }

    setCargando(true)
    setError(null)
    setResultado(null)

    try {
      const formData = new FormData()
      formData.append('file', archivo)
      if (tipoDocumento !== 'auto') {
        formData.append('tipo', tipoDocumento)
      }

      const response = await fetch('/api/ia-legal/resumir', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.mensaje || 'Error al procesar documento')
      }

      setResultado(data)
    } catch (err: any) {
      setError(err.message || 'Error al procesar el documento')
    } finally {
      setCargando(false)
    }
  }

  const handleAnalizarExistente = async () => {
    if (!documentoSeleccionado) {
      setError('Por favor seleccione un documento')
      return
    }

    setCargando(true)
    setError(null)
    setResultado(null)

    try {
      const response = await fetch('/api/ia-legal/resumir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentoId: documentoSeleccionado,
          tipo: tipoDocumento !== 'auto' ? tipoDocumento : undefined
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.mensaje || 'Error al procesar documento')
      }

      setResultado(data)
    } catch (err: any) {
      setError(err.message || 'Error al procesar el documento')
    } finally {
      setCargando(false)
    }
  }

  const resetForm = () => {
    setArchivo(null)
    setDocumentoSeleccionado('')
    setTipoDocumento('auto')
    setResultado(null)
    setError(null)
    setBusquedaDoc('')
  }

  // Filtrar documentos según búsqueda
  const documentosFiltrados = documentos.filter(doc =>
    doc.nombre.toLowerCase().includes(busquedaDoc.toLowerCase()) ||
    doc.expediente?.numero.toLowerCase().includes(busquedaDoc.toLowerCase()) ||
    doc.expediente?.caratula.toLowerCase().includes(busquedaDoc.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* Formulario de carga con tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Analizar Documento Legal
            </CardTitle>
            <CardDescription>
              Elige un documento existente o sube uno nuevo para analizar con IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tabActivo} onValueChange={setTabActivo} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="nuevo">
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Nuevo
                </TabsTrigger>
                <TabsTrigger value="existente">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Documentos Existentes
                </TabsTrigger>
              </TabsList>

              {/* Tab: Subir Nuevo */}
              <TabsContent value="nuevo" className="space-y-4 mt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="archivo">Archivo</Label>
                <Input
                  id="archivo"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  disabled={cargando}
                />
                {archivo && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {archivo.name} ({(archivo.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Documento</Label>
                <Select value={tipoDocumento} onValueChange={setTipoDocumento} disabled={cargando}>
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Detección Automática</SelectItem>
                    <SelectItem value="sentencia">Sentencia Judicial</SelectItem>
                    <SelectItem value="demanda">Demanda</SelectItem>
                    <SelectItem value="contrato">Contrato</SelectItem>
                    <SelectItem value="general">Documento General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={!archivo || cargando} className="flex-1">
                      {cargando ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analizando...
                        </>
                      ) : (
                        <>
                          <Brain className="mr-2 h-4 w-4" />
                          Analizar con IA
                        </>
                      )}
                    </Button>
                    {(archivo || resultado) && (
                      <Button type="button" variant="outline" onClick={resetForm} disabled={cargando}>
                        Limpiar
                      </Button>
                    )}
                  </div>
                </form>
              </TabsContent>

              {/* Tab: Documentos Existentes */}
              <TabsContent value="existente" className="space-y-4 mt-4">
                <div className="space-y-4">
                  {/* Búsqueda */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre, expediente o carátula..."
                      value={busquedaDoc}
                      onChange={(e) => setBusquedaDoc(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Lista de documentos */}
                  <div className="space-y-2 max-h-[400px] overflow-y-auto border rounded-lg p-2">
                    {cargandoDocumentos ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : documentosFiltrados.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No se encontraron documentos</p>
                      </div>
                    ) : (
                      documentosFiltrados.map((doc) => (
                        <div
                          key={doc.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                            documentoSeleccionado === doc.id ? 'bg-primary/10 border-primary' : ''
                          }`}
                          onClick={() => setDocumentoSeleccionado(doc.id)}
                        >
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{doc.nombre}</p>
                              {doc.expediente && (
                                <p className="text-xs text-muted-foreground truncate">
                                  Exp. {doc.expediente.numero} - {doc.expediente.caratula}
                                </p>
                              )}
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {doc.tipoDocumento}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(doc.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Tipo de documento */}
                  <div className="space-y-2">
                    <Label htmlFor="tipo-existente">Tipo de Documento</Label>
                    <Select value={tipoDocumento} onValueChange={setTipoDocumento} disabled={cargando}>
                      <SelectTrigger id="tipo-existente">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Detección Automática</SelectItem>
                        <SelectItem value="sentencia">Sentencia Judicial</SelectItem>
                        <SelectItem value="demanda">Demanda</SelectItem>
                        <SelectItem value="contrato">Contrato</SelectItem>
                        <SelectItem value="general">Documento General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Botón analizar */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAnalizarExistente}
                      disabled={!documentoSeleccionado || cargando}
                      className="flex-1"
                    >
                      {cargando ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analizando...
                        </>
                      ) : (
                        <>
                          <Brain className="mr-2 h-4 w-4" />
                          Analizar con IA
                        </>
                      )}
                    </Button>
                    {(documentoSeleccionado || resultado) && (
                      <Button type="button" variant="outline" onClick={resetForm} disabled={cargando}>
                        Limpiar
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Resultado */}
        {resultado && (
          <>
            {/* Metadata Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Análisis Completado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tipo Detectado</p>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {resultado.metadata.tipoDocumento}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Costo
                    </p>
                    <p className="text-sm font-medium">{resultado.metadata.costoFormateado}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Duración
                    </p>
                    <p className="text-sm font-medium">{(resultado.metadata.duracionMs / 1000).toFixed(1)}s</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tokens</p>
                    <p className="text-sm font-medium">{resultado.metadata.tokensUsados.toLocaleString()}</p>
                  </div>
                </div>

                {resultado.metadata.consultasRestantes !== null && (
                  <Alert className="mt-4">
                    <AlertDescription className="text-sm">
                      Consultas restantes este mes: <strong>{resultado.metadata.consultasRestantes}</strong>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Resumen Card */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen Estructurado</CardTitle>
                <CardDescription>Información extraída del documento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Renderizar dinámicamente según el tipo de resumen */}
                  {Object.entries(resultado.resumen).map(([key, value]) => {
                    if (!value) return null

                    return (
                      <div key={key} className="space-y-2">
                        <h3 className="font-semibold text-sm capitalize border-b pb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        {Array.isArray(value) ? (
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {value.map((item: any, index: number) => (
                              <li key={index}>
                                {typeof item === 'object' ? JSON.stringify(item) : item}
                              </li>
                            ))}
                          </ul>
                        ) : typeof value === 'object' ? (
                          <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto">
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        ) : (
                          <p className="text-sm text-muted-foreground">{String(value)}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
