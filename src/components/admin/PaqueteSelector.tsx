'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, Zap, Database, Bot, Users, TrendingUp } from 'lucide-react'
import { PAQUETES_XENOVALAW, PaqueteXenova, getPaqueteColor } from '@/lib/paquetes'
import { cn } from '@/lib/utils'

interface PaqueteSelectorProps {
  paqueteActual?: PaqueteXenova
  onSeleccionar: (paquete: PaqueteXenova) => void
  disabled?: boolean
}

export function PaqueteSelector({ paqueteActual, onSeleccionar, disabled }: PaqueteSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {(Object.keys(PAQUETES_XENOVALAW) as PaqueteXenova[]).map((key) => {
        const paquete = PAQUETES_XENOVALAW[key]
        const isActual = paqueteActual === key
        const isUpgrade = paqueteActual && getPaqueteOrden(key) > getPaqueteOrden(paqueteActual)
        
        return (
          <Card 
            key={key}
            className={cn(
              "relative transition-all duration-300 hover:shadow-xl cursor-pointer",
              isActual && "ring-2 ring-primary ring-offset-2",
              key === 'BASE' && "border-green-300",
              key === 'PRO' && "border-yellow-300",
              key === 'FULL' && "border-blue-300"
            )}
            onClick={() => !disabled && onSeleccionar(key)}
          >
            {isActual && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-white">
                  <Check className="h-3 w-3 mr-1" />
                  Plan Actual
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="text-4xl mb-2">{paquete.emoji}</div>
              <CardTitle className="text-2xl mb-1">{paquete.nombre}</CardTitle>
              <CardDescription className="text-base font-medium">
                {paquete.descripcion}
              </CardDescription>
              <p className="text-xs text-muted-foreground mt-2 italic">
                {paquete.tagline}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Límites Técnicos */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4" />
                    Usuarios:
                  </span>
                  <span className="font-semibold">
                    {paquete.maxUsuarios === -1 ? 'Ilimitados' : paquete.maxUsuarios}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Database className="h-4 w-4" />
                    Almacenamiento:
                  </span>
                  <span className="font-semibold">{paquete.almacenamientoGB} GB</span>
                </div>
              </div>

              {/* Funcionalidades Destacadas */}
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Funcionalidades Clave
                </p>
                <ul className="space-y-1.5">
                  {key === 'BASE' && (
                    <>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Gestión completa de expedientes y clientes</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Generación de documentos PDF</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Agenda procesal con alertas</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Portal cliente responsive</span>
                      </li>
                    </>
                  )}
                  
                  {key === 'PRO' && (
                    <>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="font-medium">Todo el paquete BASE, más:</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Zap className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>API WhatsApp automática</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Zap className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Plantillas inteligentes con autocompletado</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Zap className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Facturación electrónica AFIP</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Zap className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>Firma digital certificada</span>
                      </li>
                    </>
                  )}
                  
                  {key === 'FULL' && (
                    <>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="font-medium">Todo el paquete PRO, más:</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Automatización de flujo completo</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Reportes BI interactivos</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Multi-sede con sincronización</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Seguridad avanzada (2FA, auditoría)</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Valor Diferencial */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-3 border-l-4 border-primary">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  💡 Valor Diferencial
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                  {paquete.valorDiferencial}
                </p>
              </div>

              {/* Botón de Acción */}
              {!isActual && (
                <Button 
                  className="w-full"
                  variant={isUpgrade ? "default" : "outline"}
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSeleccionar(key)
                  }}
                >
                  {isUpgrade ? (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Hacer Upgrade
                    </>
                  ) : (
                    'Seleccionar Plan'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

/**
 * Componente compacto para mostrar el paquete actual
 */
interface PaqueteBadgeProps {
  paquete: PaqueteXenova
  showDetails?: boolean
}

export function PaqueteBadge({ paquete, showDetails = false }: PaqueteBadgeProps) {
  const info = PAQUETES_XENOVALAW[paquete]
  
  return (
    <div className="flex items-center gap-2">
      <Badge className={cn(
        "font-semibold",
        paquete === 'BASE' && "bg-green-100 text-green-800 border-green-300",
        paquete === 'PRO' && "bg-yellow-100 text-yellow-800 border-yellow-300",
        paquete === 'FULL' && "bg-blue-100 text-blue-800 border-blue-300"
      )}>
        {info.emoji} {info.nombre}
      </Badge>
      {showDetails && (
        <span className="text-xs text-muted-foreground">
          {info.descripcion}
        </span>
      )}
    </div>
  )
}

/**
 * Card con información detallada del paquete
 */
interface PaqueteInfoCardProps {
  paquete: PaqueteXenova
}

export function PaqueteInfoCard({ paquete }: PaqueteInfoCardProps) {
  const info = PAQUETES_XENOVALAW[paquete]
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{info.emoji}</div>
            <div>
              <CardTitle className="text-xl">Paquete {info.nombre}</CardTitle>
              <CardDescription>{info.descripcion}</CardDescription>
            </div>
          </div>
          <PaqueteBadge paquete={paquete} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Límites */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Usuarios</p>
              <p className="font-semibold">
                {info.maxUsuarios === -1 ? 'Ilimitados' : info.maxUsuarios}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Almacenamiento</p>
              <p className="font-semibold">{info.almacenamientoGB} GB</p>
            </div>
          </div>
        </div>

        {/* Automatizaciones */}
        <div>
          <p className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-600" />
            Automatizaciones Incluidas
          </p>
          <ul className="space-y-1">
            {info.automatizaciones.slice(0, 3).map((auto, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-green-600">•</span>
                {auto}
              </li>
            ))}
            {info.automatizaciones.length > 3 && (
              <li className="text-xs text-muted-foreground italic">
                + {info.automatizaciones.length - 3} más...
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper para ordenar paquetes
function getPaqueteOrden(paquete: PaqueteXenova): number {
  const orden = { BASE: 1, PRO: 2, FULL: 3 }
  return orden[paquete]
}
