'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Save, Calendar, Clock, MapPin, Users } from 'lucide-react'

const audienciaSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  hora: z.string().min(1, 'La hora es requerida'),
  tipo: z.enum(['CONCILIACION', 'PRUEBA', 'ALEGATOS', 'VISTA_CAUSA', 'MEDIACION', 'OTRA']),
  modalidad: z.enum(['PRESENCIAL', 'VIRTUAL', 'MIXTA']),
  lugar: z.string().optional(),
  descripcion: z.string().optional(),
  expedienteId: z.string().min(1, 'Debe seleccionar un expediente'),
})

type AudienciaFormData = z.infer<typeof audienciaSchema>

interface AudienciaFormProps {
  expedientes: Array<{
    id: string
    numero: string
    caratula: string
    cliente: {
      nombre: string
      apellido: string
    }
  }>
  session: any
}

export default function AudienciaForm({ expedientes, session }: AudienciaFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AudienciaFormData>({
    resolver: zodResolver(audienciaSchema),
    defaultValues: {
      fecha: '',
      hora: '09:00',
      tipo: 'CONCILIACION',
      modalidad: 'PRESENCIAL',
      lugar: '',
      descripcion: '',
      expedienteId: '',
    },
  })

  const expedienteSeleccionado = watch('expedienteId')

  const onSubmit = async (data: AudienciaFormData) => {
    try {
      setIsSubmitting(true)

      // Combinar fecha y hora
      const fechaCompleta = data.hora 
        ? new Date(`${data.fecha}T${data.hora}`)
        : new Date(data.fecha)

      const audienciaData = {
        fecha: fechaCompleta.toISOString(),
        tipo: data.tipo,
        modalidad: data.modalidad,
        lugar: data.lugar || null,
        descripcion: data.descripcion || null,
        expedienteId: data.expedienteId,
        estado: 'PROGRAMADA'
      }

      const response = await fetch('/api/audiencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(audienciaData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear la audiencia')
      }

      const savedAudiencia = await response.json()
      
      toast.success('Audiencia creada correctamente')
      router.push(`/calendario/audiencias/${savedAudiencia.id}`)
    } catch (error) {
      console.error('Error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Error al crear la audiencia'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const expedienteInfo = expedienteSeleccionado 
    ? expedientes.find(exp => exp.id === expedienteSeleccionado)
    : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/calendario">
          <Button variant="outline" size="sm" type="button">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Calendario
          </Button>
        </Link>
      </div>

      {/* Selección de Expediente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Expediente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expedienteId">Expediente *</Label>
            <select
              id="expedienteId"
              {...register('expedienteId')}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="">Seleccione un expediente...</option>
              {expedientes.map((expediente) => (
                <option key={expediente.id} value={expediente.id}>
                  {expediente.numero} - {expediente.cliente.nombre} {expediente.cliente.apellido}
                </option>
              ))}
            </select>
            {errors.expedienteId && (
              <p className="text-sm text-red-500">{errors.expedienteId.message}</p>
            )}
          </div>

          {expedienteInfo && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm">
                <div className="font-medium text-blue-900">{expedienteInfo.numero}</div>
                <div className="text-blue-700">{expedienteInfo.caratula}</div>
                <div className="text-blue-600">
                  Cliente: {expedienteInfo.cliente.nombre} {expedienteInfo.cliente.apellido}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información de la Audiencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Detalles de la Audiencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input
                id="fecha"
                type="date"
                {...register('fecha')}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.fecha && (
                <p className="text-sm text-red-500">{errors.fecha.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora">Hora</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hora"
                  type="time"
                  {...register('hora')}
                  className="pl-10"
                />
              </div>
              {errors.hora && (
                <p className="text-sm text-red-500">{errors.hora.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Audiencia *</Label>
              <select
                id="tipo"
                {...register('tipo')}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="CONCILIACION">Conciliación</option>
                <option value="PRUEBA">Audiencia de Prueba</option>
                <option value="ALEGATOS">Audiencia de Alegatos</option>
                <option value="VISTA_CAUSA">Vista de Causa</option>
                <option value="MEDIACION">Mediación</option>
                <option value="OTRA">Otra</option>
              </select>
              {errors.tipo && (
                <p className="text-sm text-red-500">{errors.tipo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="modalidad">Modalidad *</Label>
              <select
                id="modalidad"
                {...register('modalidad')}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="PRESENCIAL">Presencial</option>
                <option value="VIRTUAL">Virtual</option>
                <option value="MIXTA">Mixta</option>
              </select>
              {errors.modalidad && (
                <p className="text-sm text-red-500">{errors.modalidad.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lugar">Lugar</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="lugar"
                {...register('lugar')}
                placeholder="Ej: Juzgado Civil Nº 1, Sala 3"
                className="pl-10"
              />
            </div>
            {errors.lugar && (
              <p className="text-sm text-red-500">{errors.lugar.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              {...register('descripcion')}
              placeholder="Notas adicionales sobre la audiencia..."
              className="min-h-[80px]"
            />
            {errors.descripcion && (
              <p className="text-sm text-red-500">{errors.descripcion.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex items-center gap-4 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Guardando...' : 'Crear Audiencia'}
        </Button>
        
        <Link href="/calendario">
          <Button variant="outline" type="button">
            Cancelar
          </Button>
        </Link>
      </div>
    </form>
  )
}
