'use client'

import { useState, useEffect } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { 
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  X,
  Briefcase,
  User
} from 'lucide-react'

const eventoSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  fecha: z.string().min(1, 'La fecha es requerida'),
  hora: z.string().optional(),
  tipo: z.enum(['COBRO', 'VENCIMIENTO', 'FECHA_LIMITE', 'REUNION', 'OTRO']),
  monto: z.number().optional(),
  moneda: z.enum(['ARS', 'USD', 'EUR']).optional(),
  expedienteId: z.string().optional(),
  clienteId: z.string().optional(),
})

type EventoFormData = z.infer<typeof eventoSchema>

interface NuevoEventoFormProps {
  onClose: () => void
  onSuccess?: () => void
  expedientes?: Array<{
    id: string
    numero: string
    caratula: string
  }>
  clientes?: Array<{
    id: string
    razonSocial: string
  }>
}

const tipoEventoConfig = {
  COBRO: {
    label: 'Cobro',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Registrar fecha de cobro esperado'
  },
  VENCIMIENTO: {
    label: 'Vencimiento',
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Fecha límite de presentación o documento'
  },
  FECHA_LIMITE: {
    label: 'Fecha Límite',
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Deadline importante'
  },
  REUNION: {
    label: 'Reunión',
    icon: User,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Reunión con cliente o equipo'
  },
  OTRO: {
    label: 'Otro',
    icon: Calendar,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    description: 'Evento personalizado'
  }
}

export default function NuevoEventoForm({ 
  onClose, 
  onSuccess,
  expedientes = [],
  clientes = []
}: NuevoEventoFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventoFormData>({
    resolver: zodResolver(eventoSchema)
  })

  const tipo = watch('tipo')

  useEffect(() => {
    setTipoSeleccionado(tipo || '')
  }, [tipo])

  const onSubmit = async (data: EventoFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/eventos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear evento')
      }

      toast.success('¡Evento creado exitosamente!')
      
      if (onSuccess) {
        onSuccess()
      }
      
      router.refresh()
      onClose()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al crear el evento')
    } finally {
      setIsSubmitting(false)
    }
  }

  const configuracion = tipoSeleccionado ? tipoEventoConfig[tipoSeleccionado as keyof typeof tipoEventoConfig] : null
  const IconoTipo = configuracion?.icon

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">Nuevo Evento</CardTitle>
              <CardDescription className="mt-1">
                Agregar un nuevo evento al calendario
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Tipo de Evento */}
            <div>
              <Label htmlFor="tipo" className="text-base font-semibold mb-3 block">
                Tipo de Evento *
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(tipoEventoConfig).map(([key, config]) => {
                  const Icon = config.icon
                  const isSelected = tipo === key
                  
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setValue('tipo', key as any)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? `border-blue-500 ${config.bgColor}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon className={`h-5 w-5 ${isSelected ? config.color : 'text-gray-400'}`} />
                        <span className="font-medium text-sm">{config.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">{config.description}</p>
                    </button>
                  )
                })}
              </div>
              {errors.tipo && (
                <p className="text-sm text-red-500 mt-1">{errors.tipo.message}</p>
              )}
            </div>

            {/* Vista previa del tipo seleccionado */}
            {configuracion && IconoTipo && (
              <div className={`p-4 rounded-lg ${configuracion.bgColor} border-2 border-transparent`}>
                <div className="flex items-center space-x-3">
                  <IconoTipo className={`h-6 w-6 ${configuracion.color}`} />
                  <div>
                    <div className="font-semibold text-gray-900">{configuracion.label}</div>
                    <div className="text-sm text-gray-600">{configuracion.description}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Título */}
            <div>
              <Label htmlFor="titulo">Título del Evento *</Label>
              <Input
                id="titulo"
                {...register('titulo')}
                placeholder="Ej: Cobro Honorarios - Expediente 123/2025"
                className="mt-1"
              />
              {errors.titulo && (
                <p className="text-sm text-red-500 mt-1">{errors.titulo.message}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor="descripcion">Descripción (Opcional)</Label>
              <Textarea
                id="descripcion"
                {...register('descripcion')}
                placeholder="Detalles adicionales sobre el evento..."
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  type="date"
                  {...register('fecha')}
                  className="mt-1"
                />
                {errors.fecha && (
                  <p className="text-sm text-red-500 mt-1">{errors.fecha.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="hora">Hora (Opcional)</Label>
                <Input
                  id="hora"
                  type="time"
                  {...register('hora')}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Campos específicos para COBRO */}
            {tipo === 'COBRO' && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Información de Cobro
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monto">Monto</Label>
                    <Input
                      id="monto"
                      type="number"
                      step="0.01"
                      {...register('monto', { valueAsNumber: true })}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="moneda">Moneda</Label>
                    <select
                      {...register('moneda')}
                      className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md"
                    >
                      <option value="ARS">ARS - Peso Argentino</option>
                      <option value="USD">USD - Dólar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Asociaciones opcionales */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Asociar a (Opcional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Expediente */}
                <div>
                  <Label htmlFor="expedienteId">
                    <Briefcase className="h-4 w-4 inline mr-1" />
                    Expediente
                  </Label>
                  <select
                    {...register('expedienteId')}
                    className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="">Ninguno</option>
                    {expedientes.map((exp) => (
                      <option key={exp.id} value={exp.id}>
                        {exp.numero} - {exp.caratula}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cliente */}
                <div>
                  <Label htmlFor="clienteId">
                    <User className="h-4 w-4 inline mr-1" />
                    Cliente
                  </Label>
                  <select
                    {...register('clienteId')}
                    className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="">Ninguno</option>
                    {clientes.map((cli) => (
                      <option key={cli.id} value={cli.id}>
                        {cli.razonSocial}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Creando...' : 'Crear Evento'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
