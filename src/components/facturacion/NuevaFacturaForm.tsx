'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { 
  Plus, 
  Trash2, 
  Calculator,
  Save,
  Send,
  AlertCircle,
  User,
  FileText,
  DollarSign
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const facturaSchema = z.object({
  numero: z.string().min(1, 'El número es requerido'),
  clienteId: z.string().min(1, 'Debe seleccionar un cliente'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  fechaVencimiento: z.string().min(1, 'La fecha de vencimiento es requerida'),
  moneda: z.enum(['ARS', 'USD']),
  observaciones: z.string().optional(),
  items: z.array(z.object({
    concepto: z.string().min(1, 'El concepto es requerido'),
    cantidad: z.number().min(1, 'La cantidad debe ser mayor a 0'),
    precio: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
    honorarioId: z.string().optional()
  })).min(1, 'Debe agregar al menos un item')
})

type FacturaFormData = z.infer<typeof facturaSchema>

interface Cliente {
  id: string
  nombre: string
  apellido: string
  email: string | null
  cuitCuil?: string | null
  condicionIva?: string | null
}

interface Honorario {
  id: string
  concepto: string
  monto: number
  fechaServicio: Date
  estado: string
  expediente: {
    id: string
    numero: string
    cliente: {
      id: string
      nombre: string
      apellido: string
    }
  }
}

interface Config {
  puntoVenta: number
  numeroSiguiente: string
  iva: number
  monedaDefecto: string
}

interface NuevaFacturaFormProps {
  clientes: Cliente[]
  honorarios: Honorario[]
  config: Config
  userId: string
}

export default function NuevaFacturaForm({ 
  clientes, 
  honorarios, 
  config, 
  userId 
}: NuevaFacturaFormProps) {
  const router = useRouter()
  const [creando, setCreando] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [honorariosDisponibles, setHonorariosDisponibles] = useState<Honorario[]>([])
  const [mostrarHonorarios, setMostrarHonorarios] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors }
  } = useForm<FacturaFormData>({
    resolver: zodResolver(facturaSchema),
    defaultValues: {
      numero: config.numeroSiguiente,
      fecha: format(new Date(), 'yyyy-MM-dd'),
      fechaVencimiento: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      moneda: config.monedaDefecto as 'ARS' | 'USD',
      items: [{ concepto: '', cantidad: 1, precio: 0 }]
    }
  })

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'items'
  })

  const watchItems = watch('items')
  const watchClienteId = watch('clienteId')

  // Calcular totales
  const subtotal = watchItems.reduce((sum, item) => {
    return sum + (item.cantidad * item.precio)
  }, 0)
  
  const impuestos = subtotal * (config.iva / 100)
  const total = subtotal + impuestos

  // Filtrar honorarios por cliente seleccionado
  useEffect(() => {
    if (watchClienteId) {
      const cliente = clientes.find(c => c.id === watchClienteId)
      setClienteSeleccionado(cliente || null)
      
      const honorariosCliente = honorarios.filter(h => 
        h.expediente.cliente.id === watchClienteId
      )
      setHonorariosDisponibles(honorariosCliente)
    }
  }, [watchClienteId, clientes, honorarios])

  const agregarItem = () => {
    append({ concepto: '', cantidad: 1, precio: 0 })
  }

  const agregarHonorario = (honorario: Honorario) => {
    const nuevoItem = {
      concepto: honorario.concepto,
      cantidad: 1,
      precio: honorario.monto,
      honorarioId: honorario.id
    }
    append(nuevoItem)
    
    // Remover de la lista de disponibles
    setHonorariosDisponibles(prev => prev.filter(h => h.id !== honorario.id))
  }

  const eliminarItem = (index: number) => {
    const item = watchItems[index]
    
    // Si tenía un honorario asociado, devolverlo a la lista
    if (item.honorarioId) {
      const honorario = honorarios.find(h => h.id === item.honorarioId)
      if (honorario) {
        setHonorariosDisponibles(prev => [...prev, honorario])
      }
    }
    
    remove(index)
  }

  const formatCurrency = (amount: number, currency = 'ARS') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency === 'ARS' ? 'ARS' : 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const onSubmit = async (data: FacturaFormData) => {
    setCreando(true)

    try {
      const facturaData = {
        ...data,
        subtotal,
        impuestos,
        total,
        puntoVenta: config.puntoVenta,
        userId
      }

      const response = await fetch('/api/facturacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(facturaData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear factura')
      }

      const resultado = await response.json()
      
      toast.success('Factura creada correctamente')
      router.push(`/facturacion/${resultado.id}`)
      
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear factura')
    } finally {
      setCreando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="numero">Número de Factura *</Label>
          <Input
            id="numero"
            {...register('numero')}
            placeholder="FAC-0001"
          />
          {errors.numero && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.numero.message}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fecha">Fecha de Emisión *</Label>
          <Input
            id="fecha"
            type="date"
            {...register('fecha')}
          />
          {errors.fecha && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.fecha.message}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fechaVencimiento">Fecha de Vencimiento *</Label>
          <Input
            id="fechaVencimiento"
            type="date"
            {...register('fechaVencimiento')}
          />
          {errors.fechaVencimiento && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.fechaVencimiento.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Selección de cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Cliente *</Label>
          <Select onValueChange={(value) => setValue('clienteId', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.apellido} - {cliente.email || 'Sin email'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.clienteId && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.clienteId.message}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Moneda *</Label>
          <Select onValueChange={(value) => setValue('moneda', value as 'ARS' | 'USD')} defaultValue={config.monedaDefecto}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ARS">Pesos Argentinos (ARS)</SelectItem>
              <SelectItem value="USD">Dólares Americanos (USD)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Información del cliente seleccionado */}
      {clienteSeleccionado && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">
                {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
              </span>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              <div>Email: {clienteSeleccionado.email || 'No especificado'}</div>
              {clienteSeleccionado.cuitCuil && (
                <div>CUIT/CUIL: {clienteSeleccionado.cuitCuil}</div>
              )}
              {clienteSeleccionado.condicionIva && (
                <div>Condición IVA: {clienteSeleccionado.condicionIva}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Honorarios disponibles */}
      {honorariosDisponibles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Honorarios Pendientes
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMostrarHonorarios(!mostrarHonorarios)}
              >
                {mostrarHonorarios ? 'Ocultar' : 'Ver'} ({honorariosDisponibles.length})
              </Button>
            </div>
          </CardHeader>
          {mostrarHonorarios && (
            <CardContent>
              <div className="space-y-2">
                {honorariosDisponibles.map((honorario) => (
                  <div 
                    key={honorario.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium">{honorario.concepto}</div>
                      <div className="text-sm text-gray-600">
                        Exp: {honorario.expediente.numero} • 
                        {format(new Date(honorario.fechaServicio), 'dd/MM/yyyy', { locale: es })}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(honorario.monto)}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => agregarHonorario(honorario)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Items de la factura */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Items de la Factura
            </CardTitle>
            <Button type="button" onClick={agregarItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-5">
                  <Label htmlFor={`items.${index}.concepto`}>Concepto</Label>
                  <Input
                    {...register(`items.${index}.concepto`)}
                    placeholder="Descripción del servicio"
                  />
                  {errors.items?.[index]?.concepto && (
                    <div className="text-red-600 text-xs mt-1">
                      {errors.items[index]?.concepto?.message}
                    </div>
                  )}
                </div>

                <div className="col-span-2">
                  <Label htmlFor={`items.${index}.cantidad`}>Cantidad</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.cantidad`, { valueAsNumber: true })}
                    min="1"
                  />
                  {errors.items?.[index]?.cantidad && (
                    <div className="text-red-600 text-xs mt-1">
                      {errors.items[index]?.cantidad?.message}
                    </div>
                  )}
                </div>

                <div className="col-span-3">
                  <Label htmlFor={`items.${index}.precio`}>Precio Unitario</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.precio`, { valueAsNumber: true })}
                    min="0"
                  />
                  {errors.items?.[index]?.precio && (
                    <div className="text-red-600 text-xs mt-1">
                      {errors.items[index]?.precio?.message}
                    </div>
                  )}
                </div>

                <div className="col-span-1">
                  <Label>Total</Label>
                  <div className="text-sm font-medium p-2 bg-gray-100 rounded">
                    {formatCurrency((watchItems[index]?.cantidad || 0) * (watchItems[index]?.precio || 0))}
                  </div>
                </div>

                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => eliminarItem(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {errors.items && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.items.message}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumen de totales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-green-600" />
            Resumen de Totales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA ({config.iva}%):</span>
              <span className="font-medium">{formatCurrency(impuestos)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observaciones */}
      <div className="space-y-2">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          {...register('observaciones')}
          placeholder="Observaciones adicionales (opcional)"
          rows={3}
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={creando}
        >
          Cancelar
        </Button>
        
        <Button 
          type="submit" 
          disabled={creando}
          className="min-w-32"
        >
          {creando ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creando...</span>
            </div>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Crear Factura
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
