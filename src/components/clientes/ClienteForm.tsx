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
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Hash, CreditCard, Building2, AlertTriangle } from 'lucide-react'

const clienteSchema = z.object({
  razonSocial: z.string().min(3, 'La razón social debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  tipoPersona: z.enum(['FISICA', 'JURIDICA']),
  cuitCuil: z.string().min(1, 'El CUIT/CUIL es obligatorio'),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'SUSPENDIDO']),
  cbu: z.string()
    .min(22, 'El CBU debe contener 22 dígitos')
    .max(22, 'El CBU debe contener 22 dígitos'),
  banco: z.string().min(1, 'El banco es obligatorio'),
  aliasBancario: z.string().optional(),
})

type ClienteFormData = z.infer<typeof clienteSchema>

interface ClienteFormProps {
  cliente?: ClienteFormData & { id: string }
  isEditing?: boolean
}

export default function ClienteForm({ cliente, isEditing = false }: ClienteFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: cliente || {
      razonSocial: '',
      email: '',
      telefono: '',
      direccion: '',
      tipoPersona: 'FISICA',
      cuitCuil: '',
      estado: 'ACTIVO',
      cbu: '',
      banco: '',
      aliasBancario: '',
    },
  })

  const tipoPersona = watch('tipoPersona')

  const onSubmit = async (data: ClienteFormData) => {
    try {
      setIsSubmitting(true)

      // Limpiar campos vacíos
      const cleanData = {
        ...data,
        email: data.email || null,
        telefono: data.telefono || null,
        direccion: data.direccion || null,
        cuitCuil: data.cuitCuil || null,
        razonSocial: data.razonSocial || null,
        cbu: data.cbu || null,
        banco: data.banco || null,
      }

      const url = isEditing ? `/api/clientes/${cliente?.id}` : '/api/clientes'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al guardar el cliente')
      }

      const savedCliente = await response.json()
      
      toast.success(
        isEditing ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente'
      )
      
      router.push(`/clientes/${savedCliente.id}`)
    } catch (error) {
      console.error('Error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Error al guardar el cliente'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={isEditing && cliente ? `/clientes/${cliente.id}` : '/clientes'}>
          <Button variant="outline" size="sm" type="button">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isEditing ? 'Cancelar' : 'Volver'}
          </Button>
        </Link>
      </div>

      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="razonSocial">Razón Social / Nombre Completo *</Label>
            <Input
              id="razonSocial"
              {...register('razonSocial')}
              placeholder="Ej: Juan Pérez o Estudio González & Asociados S.R.L."
            />
            {errors.razonSocial && (
              <p className="text-sm text-red-500">{errors.razonSocial.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Para personas físicas ingrese el nombre completo. Para empresas ingrese la razón social.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoPersona">Tipo de Persona *</Label>
            <select
              id="tipoPersona"
              {...register('tipoPersona')}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="FISICA">Persona Física</option>
              <option value="JURIDICA">Persona Jurídica</option>
            </select>
            {errors.tipoPersona && (
              <p className="text-sm text-red-500">{errors.tipoPersona.message}</p>
            )}
          </div>

          {tipoPersona === 'JURIDICA' && (
            <div className="space-y-2">
              <Label htmlFor="razonSocial">Razón Social</Label>
              <Input
                id="razonSocial"
                {...register('razonSocial')}
                placeholder="Ej: Empresa S.A."
              />
              {errors.razonSocial && (
                <p className="text-sm text-red-500">{errors.razonSocial.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cuitCuil">CUIT/CUIL *</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="cuitCuil"
                {...register('cuitCuil')}
                placeholder="Ej: 20-12345678-9"
                className="pl-10"
              />
            </div>
            {errors.cuitCuil && (
              <p className="text-sm text-red-500">{errors.cuitCuil.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <select
              id="estado"
              {...register('estado')}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="SUSPENDIDO">Suspendido</option>
            </select>
            {errors.estado && (
              <p className="text-sm text-red-500">{errors.estado.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información de Contacto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Información de Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="cliente@ejemplo.com"
                className="pl-10"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="telefono"
                {...register('telefono')}
                placeholder="Ej: +54 11 1234-5678"
                className="pl-10"
              />
            </div>
            {errors.telefono && (
              <p className="text-sm text-red-500">{errors.telefono.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="direccion"
                {...register('direccion')}
                placeholder="Ej: Av. Corrientes 1234, CABA, Argentina"
                className="pl-10 min-h-[80px]"
              />
            </div>
            {errors.direccion && (
              <p className="text-sm text-red-500">{errors.direccion.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información Bancaria */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Información Bancaria
            </CardTitle>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-medium">Corrobore bien la información proporcionada</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="banco">Banco *</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="banco"
                {...register('banco')}
                placeholder="Ej: Banco Nación, Banco Galicia, BBVA, etc."
                className="pl-10"
              />
            </div>
            {errors.banco && (
              <p className="text-sm text-red-500">{errors.banco.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cbu">CBU (Clave Bancaria Uniforme) *</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="cbu"
                {...register('cbu')}
                placeholder="Ej: 0000000000000000000000"
                maxLength={22}
                className="pl-10 font-mono"
              />
            </div>
            {errors.cbu && (
              <p className="text-sm text-red-500">{errors.cbu.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              El CBU debe contener 22 dígitos
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aliasBancario">Alias Bancario</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="aliasBancario"
                {...register('aliasBancario')}
                placeholder="Ej: ESTUDIO.JURIDICO.CBU"
                className="pl-10"
              />
            </div>
            {errors.aliasBancario && (
              <p className="text-sm text-red-500">{errors.aliasBancario.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Alias para facilitar transferencias bancarias
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex items-center gap-4 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting 
            ? (isEditing ? 'Actualizando...' : 'Guardando...') 
            : (isEditing ? 'Actualizar Cliente' : 'Crear Cliente')
          }
        </Button>
        
        <Link href={isEditing && cliente ? `/clientes/${cliente.id}` : '/clientes'}>
          <Button variant="outline" type="button">
            Cancelar
          </Button>
        </Link>
      </div>
    </form>
  )
}
