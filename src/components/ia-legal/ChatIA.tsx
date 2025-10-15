'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  User, 
  Send, 
  Loader2,
  MessageSquare,
  RefreshCw,
  FileText,
  Lightbulb,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

interface Mensaje {
  id: string
  tipo: 'usuario' | 'ia'
  contenido: string
  timestamp: Date
  estado?: 'enviando' | 'completado' | 'error'
}

interface ConsultaHistorial {
  id: string
  pregunta: string
  respuesta?: string | null
  createdAt: Date
  estado: string
}

interface ChatIAProps {
  historial: ConsultaHistorial[]
  preguntaInicial?: string
  userId: string
}

export default function ChatIA({ historial, preguntaInicial, userId }: ChatIAProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [inputMessage, setInputMessage] = useState(preguntaInicial || '')
  const [enviando, setEnviando] = useState(false)
  const [conversacionActiva, setConversacionActiva] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  useEffect(() => {
    if (preguntaInicial && !conversacionActiva) {
      iniciarConversacion()
    }
  }, [preguntaInicial])

  const iniciarConversacion = () => {
    setConversacionActiva(true)
    if (preguntaInicial) {
      enviarMensaje(preguntaInicial)
      setInputMessage('')
    }
  }

  const enviarMensaje = async (mensaje?: string) => {
    const textoMensaje = mensaje || inputMessage.trim()
    
    if (!textoMensaje) return

    const nuevoMensaje: Mensaje = {
      id: Date.now().toString(),
      tipo: 'usuario',
      contenido: textoMensaje,
      timestamp: new Date(),
      estado: 'completado'
    }

    const mensajeIA: Mensaje = {
      id: (Date.now() + 1).toString(),
      tipo: 'ia',
      contenido: '',
      timestamp: new Date(),
      estado: 'enviando'
    }

    setMensajes(prev => [...prev, nuevoMensaje, mensajeIA])
    setInputMessage('')
    setEnviando(true)

    try {
      const response = await fetch('/api/ia-legal/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mensaje: textoMensaje,
          userId,
          conversacion: mensajes.map(m => ({ rol: m.tipo, contenido: m.contenido }))
        })
      })

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor')
      }

      const data = await response.json()

      setMensajes(prev => prev.map(m => 
        m.id === mensajeIA.id 
          ? { ...m, contenido: data.respuesta, estado: 'completado' }
          : m
      ))

    } catch (error) {
      console.error('Error:', error)
      setMensajes(prev => prev.map(m => 
        m.id === mensajeIA.id 
          ? { ...m, contenido: 'Lo siento, hubo un error al procesar tu consulta. Por favor intenta nuevamente.', estado: 'error' }
          : m
      ))
      toast.error('Error al enviar mensaje')
    } finally {
      setEnviando(false)
    }
  }

  const limpiarChat = () => {
    setMensajes([])
    setConversacionActiva(false)
    inputRef.current?.focus()
  }

  const cargarHistorial = (consulta: ConsultaHistorial) => {
    const mensajeUsuario: Mensaje = {
      id: `hist-user-${consulta.id}`,
      tipo: 'usuario',
      contenido: consulta.pregunta,
      timestamp: new Date(consulta.createdAt),
      estado: 'completado'
    }

    const mensajeIA: Mensaje = {
      id: `hist-ia-${consulta.id}`,
      tipo: 'ia',
      contenido: consulta.respuesta || 'No hay respuesta disponible',
      timestamp: new Date(consulta.createdAt),
      estado: consulta.estado === 'COMPLETADA' ? 'completado' : 'error'
    }

    setMensajes([mensajeUsuario, mensajeIA])
    setConversacionActiva(true)
  }

  const sugestionesPredefinidas = [
    "¿Cuáles son los pasos para iniciar una demanda civil?",
    "Explícame los requisitos para un divorcio por mutuo acuerdo",
    "¿Qué documentos necesito para constituir una sociedad?",
    "¿Cuáles son los plazos de prescripción en derecho laboral?",
    "Ayúdame a redactar una carta documento",
    "¿Qué es el principio de congruencia procesal?"
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      {/* Chat principal */}
      <div className="lg:col-span-3 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              Asistente Legal IA
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={limpiarChat}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            {/* Área de mensajes */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg bg-gray-50">
              {mensajes.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    ¡Hola! Soy tu asistente legal
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Puedes hacerme cualquier pregunta sobre derecho argentino, 
                    procedimientos legales, o solicitar ayuda con documentos.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
                    {sugestionesPredefinidas.slice(0, 4).map((sugerencia, index) => (
                      <button
                        key={index}
                        onClick={() => enviarMensaje(sugerencia)}
                        className="text-left p-3 text-sm bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        disabled={enviando}
                      >
                        <Lightbulb className="h-4 w-4 inline mr-2 text-yellow-500" />
                        {sugerencia}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                mensajes.map((mensaje) => (
                  <div
                    key={mensaje.id}
                    className={`flex ${mensaje.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        mensaje.tipo === 'usuario'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {mensaje.tipo === 'ia' && (
                          <Bot className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        )}
                        {mensaje.tipo === 'usuario' && (
                          <User className="h-5 w-5 text-blue-100 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="mb-1">
                            {mensaje.estado === 'enviando' ? (
                              <div className="flex items-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm text-gray-500">Escribiendo...</span>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap">{mensaje.contenido}</p>
                            )}
                          </div>
                          <div className={`text-xs ${mensaje.tipo === 'usuario' ? 'text-blue-100' : 'text-gray-500'}`}>
                            {format(mensaje.timestamp, 'HH:mm', { locale: es })}
                            {mensaje.estado === 'error' && (
                              <AlertCircle className="h-3 w-3 inline ml-1 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de mensaje */}
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Escribe tu pregunta legal aquí..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    enviarMensaje()
                  }
                }}
                disabled={enviando}
                className="flex-1"
              />
              <Button 
                onClick={() => enviarMensaje()} 
                disabled={!inputMessage.trim() || enviando}
              >
                {enviando ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel lateral */}
      <div className="space-y-4">
        {/* Historial de consultas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historial Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {historial.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay consultas previas
                </p>
              ) : (
                historial.slice(0, 10).map((consulta) => (
                  <button
                    key={consulta.id}
                    onClick={() => cargarHistorial(consulta)}
                    className="w-full text-left p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
                  >
                    <p className="text-sm font-medium line-clamp-2 mb-1">
                      {consulta.pregunta}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={consulta.estado === 'COMPLETADA' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {consulta.estado}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(consulta.createdAt), 'dd/MM', { locale: es })}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sugerencias rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Consultas Frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sugestionesPredefinidas.map((sugerencia, index) => (
                <button
                  key={index}
                  onClick={() => enviarMensaje(sugerencia)}
                  className="w-full text-left p-2 text-sm rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                  disabled={enviando}
                >
                  <MessageSquare className="h-3 w-3 inline mr-2 text-blue-500" />
                  {sugerencia}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Información útil */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Consejos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-blue-800">
            <div className="flex items-start space-x-2">
              <FileText className="h-4 w-4 mt-0.5 text-blue-600" />
              <p className="text-sm">
                Proporciona contexto específico para respuestas más precisas
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-600" />
              <p className="text-sm">
                Puedes hacer preguntas de seguimiento para profundizar
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 mt-0.5 text-red-600" />
              <p className="text-sm">
                Recuerda que esto es orientativo, consulta siempre con un profesional
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
