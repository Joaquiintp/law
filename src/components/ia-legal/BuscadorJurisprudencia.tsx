'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Loader2, 
  BookOpen, 
  Scale, 
  AlertTriangle, 
  Lightbulb,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react'

interface NormaAplicable {
  articulo: string
  norma: string
  texto: string
  relevancia: string
}

interface Jurisprudencia {
  caratula: string
  tribunal: string
  fecha: string
  sintesis: string
  aplicabilidad: string
}

interface ResultadoBusqueda {
  resumen: string
  normasAplicables: NormaAplicable[]
  jurisprudenciaRelevante: Jurisprudencia[]
  argumentosLegales: string[]
  estrategiaRecomendada: string
  riesgos: string[]
  recomendaciones: string[]
  busquedasSugeridas: string[]
  metadata: {
    tokens: number
    costo: number
    duracion: number
    consultasRestantes: number | null
  }
}

export default function BuscadorJurisprudencia() {
  const [consulta, setConsulta] = useState('')
  const [materia, setMateria] = useState('')
  const [jurisdiccion, setJurisdiccion] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [resultado, setResultado] = useState<ResultadoBusqueda | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Estado de secciones colapsables
  const [normasOpen, setNormasOpen] = useState(true)
  const [jurisprudenciaOpen, setJurisprudenciaOpen] = useState(true)
  const [argumentosOpen, setArgumentosOpen] = useState(true)
  const [estrategiaOpen, setEstrategiaOpen] = useState(true)
  const [riesgosOpen, setRiesgosOpen] = useState(true)

  const handleBuscar = async () => {
    if (!consulta.trim()) {
      setError('Debes ingresar una consulta legal')
      return
    }

    setBuscando(true)
    setError(null)
    setResultado(null)

    try {
      const response = await fetch('/api/ia-legal/buscar-jurisprudencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consulta: consulta.trim(),
          materia: materia.trim() || undefined,
          jurisdiccion: jurisdiccion.trim() || undefined
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al buscar jurisprudencia')
      }

      const data = await response.json()
      setResultado(data)
    } catch (err: any) {
      setError(err.message || 'Error al realizar la búsqueda')
    } finally {
      setBuscando(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulario de Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-pink-600" />
            Buscar Jurisprudencia y Normativa
          </CardTitle>
          <CardDescription>
            La IA buscará en su base de conocimiento (hasta abril 2024) normas, jurisprudencia y argumentos relacionados con tu consulta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Consulta Principal */}
          <div className="space-y-2">
            <Label htmlFor="consulta">
              Consulta Legal <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="consulta"
              placeholder="Ej: ¿Cuál es el plazo de prescripción para acciones por daños y perjuicios derivados de accidentes de tránsito en Argentina?"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Sé específico: menciona la materia, jurisdicción y contexto fáctico si es relevante.
            </p>
          </div>

          {/* Campos Opcionales */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="materia">
                Materia (opcional)
              </Label>
              <Input
                id="materia"
                placeholder="Ej: Civil, Laboral, Comercial..."
                value={materia}
                onChange={(e) => setMateria(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jurisdiccion">
                Jurisdicción (opcional)
              </Label>
              <Input
                id="jurisdiccion"
                placeholder="Ej: Nacional, CABA, Provincia..."
                value={jurisdiccion}
                onChange={(e) => setJurisdiccion(e.target.value)}
              />
            </div>
          </div>

          {/* Botón Buscar */}
          <Button
            onClick={handleBuscar}
            disabled={buscando || !consulta.trim()}
            className="w-full bg-pink-600 hover:bg-pink-700"
          >
            {buscando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analizando y buscando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Buscar Jurisprudencia
              </>
            )}
          </Button>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      {resultado && (
        <div className="space-y-4">
          {/* Resumen Ejecutivo */}
          <Card className="border-pink-200 bg-pink-50">
            <CardHeader>
              <CardTitle className="text-pink-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resumen Ejecutivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-800 whitespace-pre-wrap">{resultado.resumen}</p>
            </CardContent>
          </Card>

          {/* Normas Aplicables */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setNormasOpen(!normasOpen)}
            >
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Normas Aplicables ({resultado.normasAplicables.length})
                </span>
                {normasOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </CardTitle>
            </CardHeader>
            {normasOpen && (
              <CardContent className="space-y-3">
                {resultado.normasAplicables.map((norma, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-blue-900">
                        {norma.articulo} - {norma.norma}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {norma.relevancia}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 italic mb-2">"{norma.texto}"</p>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Jurisprudencia Relevante */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setJurisprudenciaOpen(!jurisprudenciaOpen)}
            >
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-purple-600" />
                  Jurisprudencia Relevante ({resultado.jurisprudenciaRelevante.length})
                </span>
                {jurisprudenciaOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </CardTitle>
            </CardHeader>
            {jurisprudenciaOpen && (
              <CardContent className="space-y-3">
                {resultado.jurisprudenciaRelevante.map((juris, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <h4 className="font-semibold text-purple-900 mb-1">{juris.caratula}</h4>
                    <div className="flex gap-2 text-xs text-gray-600 mb-2">
                      <span>{juris.tribunal}</span>
                      <span>•</span>
                      <span>{juris.fecha}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{juris.sintesis}</p>
                    <div className="bg-purple-50 border border-purple-200 rounded p-2 mt-2">
                      <p className="text-xs text-purple-800">
                        <strong>Aplicabilidad:</strong> {juris.aplicabilidad}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Argumentos Legales */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setArgumentosOpen(!argumentosOpen)}
            >
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Argumentos Legales ({resultado.argumentosLegales.length})
                </span>
                {argumentosOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </CardTitle>
            </CardHeader>
            {argumentosOpen && (
              <CardContent>
                <ul className="space-y-2">
                  {resultado.argumentosLegales.map((argumento, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold mt-1">•</span>
                      <span className="text-gray-800">{argumento}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>

          {/* Estrategia Recomendada */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setEstrategiaOpen(!estrategiaOpen)}
            >
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-green-600" />
                  Estrategia Recomendada
                </span>
                {estrategiaOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </CardTitle>
            </CardHeader>
            {estrategiaOpen && (
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{resultado.estrategiaRecomendada}</p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Riesgos */}
          <Card>
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setRiesgosOpen(!riesgosOpen)}
            >
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Riesgos Identificados ({resultado.riesgos.length})
                </span>
                {riesgosOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </CardTitle>
            </CardHeader>
            {riesgosOpen && (
              <CardContent>
                <ul className="space-y-2">
                  {resultado.riesgos.map((riesgo, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-800">{riesgo}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>

          {/* Recomendaciones */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Recomendaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {resultado.recomendaciones.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span className="text-gray-800">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Búsquedas Sugeridas */}
          {resultado.busquedasSugeridas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Búsquedas Relacionadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {resultado.busquedasSugeridas.map((busqueda, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => setConsulta(busqueda)}
                    >
                      {busqueda}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Tokens</p>
                  <p className="font-semibold">{resultado.metadata.tokens.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Costo</p>
                  <p className="font-semibold text-green-700">
                    ${resultado.metadata.costo.toFixed(4)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Duración</p>
                  <p className="font-semibold">{(resultado.metadata.duracion / 1000).toFixed(1)}s</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Consultas Restantes</p>
                  <p className="font-semibold text-blue-700">
                    {resultado.metadata.consultasRestantes ?? '∞'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advertencia Legal */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900 font-medium mb-1">
              ⚠️ Información generada por IA - Verificación requerida
            </p>
            <p className="text-xs text-yellow-800">
              Esta búsqueda se basa en el conocimiento de la IA (actualizado hasta abril 2024). 
              Es fundamental verificar las citas normativas y jurisprudenciales en fuentes oficiales 
              antes de utilizarlas en cualquier presentación judicial.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
