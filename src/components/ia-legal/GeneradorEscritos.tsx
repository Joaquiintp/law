'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Wand2, Copy, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface DatosGeneracion {
  [key: string]: string
}

interface ResultadoGeneracion {
  escrito: string
  tipo: string
  expediente?: {
    numero: string
    caratula: string
  }
  metadata: {
    tokens: number
    costo: number
    duracion: number
    consultasRestantes: number | null
  }
}

export default function GeneradorEscritos() {
  const [tipo, setTipo] = useState<string>('')
  const [expedienteId, setExpedienteId] = useState<string>('')
  const [datos, setDatos] = useState<DatosGeneracion>({})
  const [generando, setGenerando] = useState(false)
  const [resultado, setResultado] = useState<ResultadoGeneracion | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  // Tipos de escritos disponibles
  const tiposEscrito = [
    { value: 'demanda', label: 'Demanda', desc: 'Demanda inicial completa' },
    { value: 'contestacion', label: 'Contestación', desc: 'Contestación de demanda' },
    { value: 'recurso', label: 'Recurso', desc: 'Recurso de apelación' },
    { value: 'escrito_prueba', label: 'Ofrecimiento de Prueba', desc: 'Ofrecimiento y fundamentación de pruebas' },
    { value: 'alegatos', label: 'Alegatos', desc: 'Alegatos finales' },
    { value: 'otro', label: 'Otro escrito', desc: 'Otro tipo de presentación judicial' }
  ]

  // Campos específicos según el tipo de escrito
  const getCamposSegunTipo = (tipoEscrito: string) => {
    switch (tipoEscrito) {
      case 'demanda':
        return [
          { key: 'actor', label: 'Actor/Demandante', placeholder: 'Juan Pérez DNI 12345678' },
          { key: 'demandado', label: 'Demandado', placeholder: 'ABC S.A. CUIT 30-12345678-9' },
          { key: 'hechos', label: 'Hechos (resumidos)', placeholder: 'Descripción breve de los hechos relevantes...', multiline: true },
          { key: 'pretension', label: 'Pretensión', placeholder: 'Qué se solicita al tribunal' },
          { key: 'monto', label: 'Monto reclamado (opcional)', placeholder: '$1.000.000' },
          { key: 'fundamentoLegal', label: 'Fundamento legal', placeholder: 'Arts. 1109, 1113 Cód. Civil', multiline: true }
        ]
      case 'contestacion':
        return [
          { key: 'demandado', label: 'Demandado (que contesta)', placeholder: 'ABC S.A.' },
          { key: 'expediente', label: 'Carátula del expediente', placeholder: 'PÉREZ JUAN C/ ABC SA S/ DAÑOS Y PERJUICIOS' },
          { key: 'defensas', label: 'Defensas a oponer', placeholder: 'Prescripción, falta de legitimación...', multiline: true },
          { key: 'hechosNegados', label: 'Hechos que se niegan', placeholder: 'Lista de hechos que se controvierten', multiline: true },
          { key: 'reconvencion', label: '¿Hay reconvención? (Sí/No)', placeholder: 'No' }
        ]
      case 'recurso':
        return [
          { key: 'recurrente', label: 'Recurrente', placeholder: 'Juan Pérez' },
          { key: 'sentencia', label: 'Sentencia a recurrir', placeholder: 'Sentencia del 15/10/2025...' },
          { key: 'agravios', label: 'Agravios (puntos a recurrir)', placeholder: 'Lista de puntos que se consideran erróneos', multiline: true },
          { key: 'pretension', label: 'Qué se solicita', placeholder: 'Revocación de la sentencia y...' }
        ]
      case 'escrito_prueba':
        return [
          { key: 'parte', label: 'Parte que ofrece', placeholder: 'Actor / Demandado' },
          { key: 'expediente', label: 'Carátula', placeholder: 'PÉREZ JUAN C/ ABC SA S/ DAÑOS Y PERJUICIOS' },
          { key: 'pruebas', label: 'Pruebas a ofrecer', placeholder: 'Documental, testimonial, pericial...', multiline: true },
          { key: 'hechos', label: 'Hechos a probar', placeholder: 'Qué se pretende demostrar con cada prueba', multiline: true }
        ]
      case 'alegatos':
        return [
          { key: 'parte', label: 'Parte que alega', placeholder: 'Actor / Demandado' },
          { key: 'expediente', label: 'Carátula', placeholder: 'PÉREZ JUAN C/ ABC SA S/ DAÑOS Y PERJUICIOS' },
          { key: 'resumenPrueba', label: 'Resumen de la prueba producida', placeholder: 'Descripción de las pruebas rendidas', multiline: true },
          { key: 'conclusion', label: 'Conclusión solicitada', placeholder: 'Hacer lugar a la demanda por...' }
        ]
      case 'otro':
        return [
          { key: 'tipo_escrito', label: 'Tipo de escrito', placeholder: 'Ej: Incidente, Aclaratoria, etc.' },
          { key: 'expediente', label: 'Carátula', placeholder: 'Carátula del expediente' },
          { key: 'objeto', label: 'Objeto del escrito', placeholder: 'Qué se solicita' },
          { key: 'fundamentacion', label: 'Fundamentación', placeholder: 'Fundamentos de hecho y derecho', multiline: true }
        ]
      default:
        return []
    }
  }

  const handleDatoChange = (key: string, value: string) => {
    setDatos(prev => ({ ...prev, [key]: value }))
  }

  const handleGenerar = async () => {
    if (!tipo) {
      setError('Debes seleccionar un tipo de escrito')
      return
    }

    setGenerando(true)
    setError(null)
    setResultado(null)

    try {
      const response = await fetch('/api/ia-legal/generar-escrito', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo,
          expedienteId: expedienteId || undefined,
          datos
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al generar el escrito')
      }

      const data = await response.json()
      setResultado(data)
    } catch (err: any) {
      setError(err.message || 'Error al generar el escrito')
    } finally {
      setGenerando(false)
    }
  }

  const handleCopiar = async () => {
    if (resultado?.escrito) {
      await navigator.clipboard.writeText(resultado.escrito)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  const handleDescargar = () => {
    if (resultado?.escrito) {
      const blob = new Blob([resultado.escrito], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `escrito_${tipo}_${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const campos = tipo ? getCamposSegunTipo(tipo) : []

  return (
    <div className="space-y-6">
      {/* Formulario de Generación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            Generar Escrito Judicial
          </CardTitle>
          <CardDescription>
            La IA generará un borrador profesional basado en tus datos. 
            <span className="text-orange-600 font-medium"> Siempre revisa y ajusta el contenido antes de presentarlo.</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selector de Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Escrito</Label>
            <Select value={tipo} onValueChange={(value) => {
              setTipo(value)
              setDatos({}) // Reset datos al cambiar tipo
            }}>
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecciona el tipo de escrito..." />
              </SelectTrigger>
              <SelectContent>
                {tiposEscrito.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{t.label}</span>
                      <span className="text-xs text-muted-foreground">{t.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ID Expediente (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="expedienteId">
              ID del Expediente (opcional)
              <span className="text-xs text-muted-foreground ml-2">
                Si lo vinculas, se guardará la relación
              </span>
            </Label>
            <Input
              id="expedienteId"
              placeholder="Ej: clxyz123..."
              value={expedienteId}
              onChange={(e) => setExpedienteId(e.target.value)}
            />
          </div>

          {/* Campos dinámicos según tipo */}
          {campos.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-700">
                Datos específicos para {tiposEscrito.find(t => t.value === tipo)?.label}
              </h3>
              {campos.map((campo) => (
                <div key={campo.key} className="space-y-2">
                  <Label htmlFor={campo.key}>{campo.label}</Label>
                  {campo.multiline ? (
                    <Textarea
                      id={campo.key}
                      placeholder={campo.placeholder}
                      value={datos[campo.key] || ''}
                      onChange={(e) => handleDatoChange(campo.key, e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  ) : (
                    <Input
                      id={campo.key}
                      placeholder={campo.placeholder}
                      value={datos[campo.key] || ''}
                      onChange={(e) => handleDatoChange(campo.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Botón Generar */}
          <Button
            onClick={handleGenerar}
            disabled={generando || !tipo}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {generando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando escrito con IA...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generar Escrito
              </>
            )}
          </Button>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultado */}
      {resultado && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-green-900">
                <CheckCircle2 className="h-5 w-5" />
                Escrito Generado
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopiar}
                  className="bg-white"
                >
                  {copiado ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDescargar}
                  className="bg-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Texto del Escrito */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 max-h-[600px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900">
                {resultado.escrito}
              </pre>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500">Tipo</p>
                <p className="font-semibold text-purple-700 capitalize">
                  {resultado.tipo.replace('_', ' ')}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500">Tokens</p>
                <p className="font-semibold">{resultado.metadata.tokens.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500">Costo</p>
                <p className="font-semibold text-green-700">
                  ${resultado.metadata.costo.toFixed(4)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500">Duración</p>
                <p className="font-semibold">{(resultado.metadata.duracion / 1000).toFixed(1)}s</p>
              </div>
            </div>

            {/* Consultas Restantes */}
            {resultado.metadata.consultasRestantes !== null && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <Badge variant="outline" className="mr-2">
                    {resultado.metadata.consultasRestantes}
                  </Badge>
                  consultas restantes este mes
                </p>
              </div>
            )}

            {/* Advertencia */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800 font-medium">
                ⚠️ Este es un borrador generado por IA
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Es fundamental que un abogado revise, corrija y adapte este texto a las particularidades del caso antes de presentarlo ante ningún tribunal.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
