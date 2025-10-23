'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  AlertTriangle,
  Lightbulb,
  Tag,
  Clock,
  DollarSign
} from 'lucide-react'

interface ClasificacionResultado {
  clasificacion: {
    materiaCorrecta: string
    fueroCorrect: string
    urgencia: string
    complejidad: string
    probabilidadExito: number
    tagsRecomendados: string[]
    riesgosIdentificados: string[]
    accionesRecomendadas: string[]
    montoEstimado: { minimo: number; maximo: number } | null
    duracionEstimada: string
    razonamiento: string
  }
  expediente: {
    id: string
    numero: string
    caratula: string
  }
  metadata: {
    tokensUsados: number
    costo: number
    costoFormateado: string
    modelo: string
    duracionMs: number
    consultasRestantes: number | null
  }
}

interface Props {
  expedienteId: string
  expedienteNumero: string
  expedienteCaratula: string
  onClasificacionComplete?: (resultado: ClasificacionResultado) => void
}

const urgenciaColors: Record<string, string> = {
  BAJA: 'bg-green-100 text-green-800',
  MEDIA: 'bg-yellow-100 text-yellow-800',
  ALTA: 'bg-orange-100 text-orange-800',
  URGENTE: 'bg-red-100 text-red-800'
}

const complejidadColors: Record<string, string> = {
  SIMPLE: 'bg-blue-100 text-blue-800',
  MODERADA: 'bg-indigo-100 text-indigo-800',
  COMPLEJA: 'bg-purple-100 text-purple-800',
  MUY_COMPLEJA: 'bg-pink-100 text-pink-800'
}

export default function ClasificadorExpedientes({ 
  expedienteId, 
  expedienteNumero, 
  expedienteCaratula,
  onClasificacionComplete 
}: Props) {
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState<ClasificacionResultado | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleClasificar = async () => {
    setCargando(true)
    setError(null)
    setResultado(null)

    try {
      const response = await fetch('/api/ia-legal/clasificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expedienteId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.mensaje || 'Error al clasificar expediente')
      }

      setResultado(data)
      onClasificacionComplete?.(data)
    } catch (err: any) {
      setError(err.message || 'Error al clasificar el expediente')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Botón de clasificación */}
      {!resultado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Clasificación Inteligente con IA
            </CardTitle>
            <CardDescription>
              Expediente: {expedienteNumero} - {expedienteCaratula}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              La IA analizará el expediente y determinará automáticamente: materia correcta, urgencia, 
              complejidad, probabilidad de éxito, riesgos y recomendaciones estratégicas.
            </p>
            <Button onClick={handleClasificar} disabled={cargando}>
              {cargando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Clasificar con IA
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

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
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Clasificación Completada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Costo</p>
                  <p className="font-medium">{resultado.metadata.costoFormateado}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duración</p>
                  <p className="font-medium">{(resultado.metadata.duracionMs / 1000).toFixed(1)}s</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tokens</p>
                  <p className="font-medium">{resultado.metadata.tokensUsados.toLocaleString()}</p>
                </div>
                {resultado.metadata.consultasRestantes !== null && (
                  <div>
                    <p className="text-muted-foreground">Consultas Restantes</p>
                    <p className="font-medium">{resultado.metadata.consultasRestantes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Clasificación Principal */}
          <Card>
            <CardHeader>
              <CardTitle>Clasificación del Expediente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Materia Correcta</p>
                  <Badge variant="outline" className="text-sm">
                    {resultado.clasificacion.materiaCorrecta}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Fuero Correcto</p>
                  <Badge variant="outline" className="text-sm">
                    {resultado.clasificacion.fueroCorrect}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Urgencia</p>
                  <Badge className={urgenciaColors[resultado.clasificacion.urgencia]}>
                    {resultado.clasificacion.urgencia}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Complejidad</p>
                  <Badge className={complejidadColors[resultado.clasificacion.complejidad]}>
                    {resultado.clasificacion.complejidad}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <p className="font-medium">Probabilidad de Éxito</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${
                        resultado.clasificacion.probabilidadExito >= 70 ? 'bg-green-500' :
                        resultado.clasificacion.probabilidadExito >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${resultado.clasificacion.probabilidadExito}%` }}
                    />
                  </div>
                  <span className="font-bold text-lg">
                    {resultado.clasificacion.probabilidadExito}%
                  </span>
                </div>
              </div>

              {resultado.clasificacion.montoEstimado && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4" />
                    <p className="font-medium">Monto Estimado</p>
                  </div>
                  <p className="text-muted-foreground">
                    ${resultado.clasificacion.montoEstimado.minimo.toLocaleString()} - 
                    ${resultado.clasificacion.montoEstimado.maximo.toLocaleString()}
                  </p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  <p className="font-medium">Duración Estimada</p>
                </div>
                <p className="text-muted-foreground">
                  {resultado.clasificacion.duracionEstimada}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tags Recomendados */}
          {resultado.clasificacion.tagsRecomendados.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tag className="h-5 w-5" />
                  Tags Recomendados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {resultado.clasificacion.tagsRecomendados.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Riesgos */}
          {resultado.clasificacion.riesgosIdentificados.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  Riesgos Identificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {resultado.clasificacion.riesgosIdentificados.map((riesgo, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{riesgo}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Acciones Recomendadas */}
          {resultado.clasificacion.accionesRecomendadas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-blue-600">
                  <Lightbulb className="h-5 w-5" />
                  Acciones Recomendadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {resultado.clasificacion.accionesRecomendadas.map((accion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{accion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Razonamiento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Análisis de IA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {resultado.clasificacion.razonamiento}
              </p>
            </CardContent>
          </Card>

          <Button variant="outline" onClick={() => setResultado(null)}>
            Nueva Clasificación
          </Button>
        </>
      )}
    </div>
  )
}
