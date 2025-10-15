'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  Database, 
  Bot, 
  Plus, 
  Check, 
  AlertTriangle,
  HardDrive,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import { 
  ADD_ONS_ALMACENAMIENTO, 
  FUNCIONALIDADES_IA,
  calcularAlmacenamientoTotal,
  calcularPorcentajeAlmacenamiento,
  formatearAlmacenamiento
} from '@/lib/paquetes'
import { cn } from '@/lib/utils'

interface AddOnsManagerProps {
  estudio: {
    id: string
    nombre: string
    almacenamientoGB: number
    almacenamientoExtra: number
    almacenamientoUsadoMB: number
    iaLegalActivo: boolean
    iaLegalTipo?: string
    iaLegalMaxConsultas: number
    iaLegalConsultasUsadas: number
  }
  onActualizarAlmacenamiento: (extraGB: number) => void
  onActualizarIA: (config: {
    activo: boolean
    tipo?: 'FIJO' | 'CONSUMO'
    maxConsultas?: number
  }) => void
}

export function AddOnsManager({ 
  estudio, 
  onActualizarAlmacenamiento, 
  onActualizarIA 
}: AddOnsManagerProps) {
  const [extraGB, setExtraGB] = useState(estudio.almacenamientoExtra)
  const [iaActivo, setIaActivo] = useState(estudio.iaLegalActivo)
  const [iaTipo, setIaTipo] = useState<'FIJO' | 'CONSUMO'>(
    (estudio.iaLegalTipo as 'FIJO' | 'CONSUMO') || 'FIJO'
  )
  const [iaConsultas, setIaConsultas] = useState(estudio.iaLegalMaxConsultas)

  const totalAlmacenamiento = calcularAlmacenamientoTotal({
    almacenamientoGB: estudio.almacenamientoGB,
    almacenamientoExtra: extraGB
  })
  
  const porcentajeUsado = calcularPorcentajeAlmacenamiento({
    almacenamientoGB: estudio.almacenamientoGB,
    almacenamientoExtra: extraGB,
    almacenamientoUsadoMB: estudio.almacenamientoUsadoMB
  })

  const consultasDisponibles = estudio.iaLegalMaxConsultas - estudio.iaLegalConsultasUsadas
  const porcentajeConsultasUsadas = estudio.iaLegalMaxConsultas > 0
    ? Math.round((estudio.iaLegalConsultasUsadas / estudio.iaLegalMaxConsultas) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* 💾 Add-On Almacenamiento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>💾 Almacenamiento Extra</CardTitle>
                <CardDescription>
                  Amplía tu capacidad de almacenamiento de documentos
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-lg font-semibold">
              <HardDrive className="h-4 w-4 mr-1" />
              {totalAlmacenamiento} GB
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Uso Actual */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Espacio Utilizado</span>
              <span className="text-sm font-semibold">
                {formatearAlmacenamiento(estudio.almacenamientoUsadoMB)} / {totalAlmacenamiento} GB
              </span>
            </div>
            <Progress 
              value={porcentajeUsado} 
              className={cn(
                "h-2",
                porcentajeUsado > 90 && "bg-red-200",
                porcentajeUsado > 70 && porcentajeUsado <= 90 && "bg-yellow-200"
              )}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {porcentajeUsado}% utilizado
              {porcentajeUsado > 80 && (
                <span className="text-orange-600 font-medium ml-2">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  Considera aumentar tu almacenamiento
                </span>
              )}
            </p>
          </div>

          {/* Desglose */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Almacenamiento Base</p>
              <p className="font-semibold text-blue-700 dark:text-blue-400">
                {estudio.almacenamientoGB} GB
              </p>
              <p className="text-xs text-muted-foreground">Incluido en tu paquete</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Almacenamiento Extra</p>
              <p className="font-semibold text-purple-700 dark:text-purple-400">
                {extraGB} GB
              </p>
              <p className="text-xs text-muted-foreground">Add-Ons contratados</p>
            </div>
          </div>

          {/* Selector de Add-Ons */}
          <div className="space-y-3 pt-2">
            <Label className="text-sm font-semibold">Ampliar Almacenamiento</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ADD_ONS_ALMACENAMIENTO.map((addon) => {
                const isSeleccionado = extraGB >= addon.gb
                return (
                  <Button
                    key={addon.id}
                    variant={isSeleccionado ? "default" : "outline"}
                    className="h-auto flex-col items-start p-3 gap-1"
                    onClick={() => {
                      const nuevoExtra = isSeleccionado ? 0 : addon.gb
                      setExtraGB(nuevoExtra)
                      onActualizarAlmacenamiento(nuevoExtra)
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold">+{addon.gb} GB</span>
                      {isSeleccionado && <Check className="h-4 w-4" />}
                    </div>
                    <span className="text-xs text-left opacity-80">
                      {addon.descripcion}
                    </span>
                  </Button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🤖 Add-On IA Legal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Bot className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <CardTitle>🤖 IA Legal (Add-On Premium)</CardTitle>
                <CardDescription>
                  Inteligencia Artificial para automatización legal avanzada
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={iaActivo}
              onCheckedChange={(checked) => {
                setIaActivo(checked)
                onActualizarIA({
                  activo: checked,
                  tipo: iaTipo,
                  maxConsultas: iaConsultas
                })
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {iaActivo ? (
            <>
              {/* Configuración de IA */}
              <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4 space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Tipo de Licencia</Label>
                  <Select 
                    value={iaTipo} 
                    onValueChange={(value: 'FIJO' | 'CONSUMO') => {
                      setIaTipo(value)
                      onActualizarIA({
                        activo: iaActivo,
                        tipo: value,
                        maxConsultas: value === 'FIJO' ? iaConsultas : undefined
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIJO">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="font-medium">Licencia Fija</p>
                            <p className="text-xs text-muted-foreground">
                              Consultas mensuales ilimitadas hasta el límite
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="CONSUMO">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="font-medium">Pago por Consumo</p>
                            <p className="text-xs text-muted-foreground">
                              Se cobra por cada consulta realizada
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {iaTipo === 'FIJO' && (
                  <div>
                    <Label htmlFor="maxConsultas" className="text-sm font-semibold mb-2 block">
                      Límite de Consultas Mensuales
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="maxConsultas"
                        type="number"
                        min={100}
                        step={100}
                        value={iaConsultas}
                        onChange={(e) => setIaConsultas(parseInt(e.target.value) || 0)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => {
                          onActualizarIA({
                            activo: iaActivo,
                            tipo: iaTipo,
                            maxConsultas: iaConsultas
                          })
                        }}
                      >
                        Aplicar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recomendado: 1000 consultas/mes para estudios medianos
                    </p>
                  </div>
                )}
              </div>

              {/* Uso de Consultas (solo si FIJO) */}
              {iaTipo === 'FIJO' && estudio.iaLegalMaxConsultas > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Consultas Utilizadas (Este Mes)</span>
                    <span className="text-sm font-semibold">
                      {estudio.iaLegalConsultasUsadas} / {estudio.iaLegalMaxConsultas}
                    </span>
                  </div>
                  <Progress 
                    value={porcentajeConsultasUsadas} 
                    className={cn(
                      "h-2",
                      porcentajeConsultasUsadas > 90 && "bg-red-200",
                      porcentajeConsultasUsadas > 70 && porcentajeConsultasUsadas <= 90 && "bg-yellow-200"
                    )}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {consultasDisponibles} consultas disponibles
                    {porcentajeConsultasUsadas > 80 && (
                      <span className="text-orange-600 font-medium ml-2">
                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                        Considera aumentar tu límite
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Funcionalidades de IA */}
              <div>
                <Label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-600" />
                  Funcionalidades Incluidas
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {FUNCIONALIDADES_IA.map((func) => (
                    <div 
                      key={func.id}
                      className="flex items-start gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border"
                    >
                      <span className="text-xl">{func.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{func.nombre}</p>
                        <p className="text-xs text-muted-foreground">{func.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground mb-2">
                El módulo de IA Legal no está activado para este estudio
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Activa el switch superior para comenzar a usar las funcionalidades de IA
              </p>
              <Button
                onClick={() => {
                  setIaActivo(true)
                  onActualizarIA({
                    activo: true,
                    tipo: 'FIJO',
                    maxConsultas: 1000
                  })
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Activar IA Legal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
