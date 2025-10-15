'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const expedienteSchema = z.object({
  numero: z.string().min(1, 'El número de expediente es obligatorio'),
  caratula: z.string().min(1, 'La carátula es obligatoria'),
  fuero: z.string().min(1, 'El fuero es obligatorio'),
  materia: z.string().min(1, 'La materia es obligatoria'),
  clienteId: z.string().min(1, 'Debe seleccionar un cliente'),
  responsableId: z.string().min(1, 'Debe asignar un responsable'),
  juzgado: z.string().optional(),
  secretaria: z.string().optional(),
  descripcion: z.string().optional(),
  observaciones: z.string().optional(),
  fechaProximaAudiencia: z.string().optional(),
})

type ExpedienteFormData = z.infer<typeof expedienteSchema>

interface ExpedienteFormProps {
  clientes: Array<{
    id: string
    nombre: string
    apellido: string
    documento: string
  }>
  usuarios: Array<{
    id: string
    name?: string | null
  }>
}

const FUEROS = [
  'CIVIL',
  'COMERCIAL', 
  'PENAL',
  'LABORAL',
  'FAMILIA',
  'CONTENCIOSO_ADMINISTRATIVO',
  'FEDERAL'
]

const MATERIAS = [
  'CIVIL_CONTRACTUAL',
  'CIVIL_EXTRACONTRACTUAL',
  'COMERCIAL',
  'LABORAL',
  'PENAL',
  'FAMILIA_DIVORCIO',
  'FAMILIA_ALIMENTOS',
  'SUCESIONES',
  'ADMINISTRATIVO',
  'TRIBUTARIO',
  'INMOBILIARIO'
]

export default function ExpedienteForm({ clientes, usuarios }: ExpedienteFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<ExpedienteFormData>({
    resolver: zodResolver(expedienteSchema),
    defaultValues: {
      numero: '',
      caratula: '',
      fuero: '',
      materia: '',
      clienteId: '',
      responsableId: '',
      juzgado: '',
      secretaria: '',
      descripcion: '',
      observaciones: '',
      fechaProximaAudiencia: '',
    }
  })

  const onSubmit = async (data: ExpedienteFormData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/expedientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          fechaProximaAudiencia: data.fechaProximaAudiencia 
            ? new Date(data.fechaProximaAudiencia).toISOString()
            : null
        }),
      })

      if (!response.ok) {
        throw new Error('Error al crear el expediente')
      }

      const expediente = await response.json()
      toast.success('Expediente creado exitosamente')
      router.push(`/expedientes/${expediente.id}`)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al crear el expediente')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/expedientes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información básica */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Información Básica</CardTitle>
                  <CardDescription>
                    Datos principales del expediente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="numero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Expediente *</FormLabel>
                          <FormControl>
                            <Input placeholder="EXP-2024-XXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clienteId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cliente *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar cliente" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {clientes.map((cliente) => (
                                <SelectItem key={cliente.id} value={cliente.id}>
                                  {cliente.nombre} {cliente.apellido} - {cliente.documento}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="caratula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carátula *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Pérez c/ García s/ Daños y Perjuicios" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fuero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fuero *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar fuero" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {FUEROS.map((fuero) => (
                                <SelectItem key={fuero} value={fuero}>
                                  {fuero.replace('_', ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="materia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Materia *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar materia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MATERIAS.map((materia) => (
                                <SelectItem key={materia} value={materia}>
                                  {materia.replace(/_/g, ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="juzgado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Juzgado</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Juzgado Civil N° 15" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="secretaria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secretaría</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Secretaría N° 30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Breve descripción del caso..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="observaciones"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observaciones</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Observaciones internas..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Asignación y fechas */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Asignación y Fechas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="responsableId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsable *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Asignar responsable" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {usuarios.map((usuario) => (
                              <SelectItem key={usuario.id} value={usuario.id}>
                                {usuario.name || 'Sin nombre'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fechaProximaAudiencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Próxima Audiencia</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4">
            <Link href="/expedientes">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Expediente
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
