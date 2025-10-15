/**
 * Sistema de restricciones por paquete
 * 
 * Define qué funcionalidades/módulos están disponibles según el paquete contratado
 */

import { PaqueteXenova, tieneFuncionalidad } from './paquetes'

/**
 * Módulos del ERP y sus requisitos de paquete
 */
export interface ModuloERP {
  id: string
  nombre: string
  ruta: string
  descripcion: string
  paqueteMinimo: PaqueteXenova
  funcionalidadRequerida?: keyof import('./paquetes').CaracteristicasPaquete['funcionalidades']
  requireIA?: boolean // Si requiere el add-on de IA activo
}

export const MODULOS_ERP: ModuloERP[] = [
  {
    id: 'dashboard',
    nombre: 'Inicio',
    ruta: '/',
    descripcion: 'Panel principal',
    paqueteMinimo: 'BASE'
  },
  {
    id: 'expedientes',
    nombre: 'Expedientes',
    ruta: '/expedientes',
    descripcion: 'Gestión de casos',
    paqueteMinimo: 'BASE',
    funcionalidadRequerida: 'gestionExpedientes'
  },
  {
    id: 'clientes',
    nombre: 'Clientes',
    ruta: '/clientes',
    descripcion: 'Base de clientes',
    paqueteMinimo: 'BASE',
    funcionalidadRequerida: 'gestionClientes'
  },
  {
    id: 'calendario',
    nombre: 'Calendario',
    ruta: '/calendario',
    descripcion: 'Agenda y citas',
    paqueteMinimo: 'BASE',
    funcionalidadRequerida: 'agendaProcesal'
  },
  {
    id: 'documentos',
    nombre: 'Documentos',
    ruta: '/documentos',
    descripcion: 'Gestión documental',
    paqueteMinimo: 'BASE',
    funcionalidadRequerida: 'generacionPDF'
  },
  {
    id: 'facturacion',
    nombre: 'Facturación',
    ruta: '/facturacion',
    descripcion: 'Finanzas e invoices',
    paqueteMinimo: 'PRO', // Facturación electrónica es PRO+
    funcionalidadRequerida: 'facturacionElectronica'
  },
  {
    id: 'ia-legal',
    nombre: 'IA Legal',
    ruta: '/ia-legal',
    descripcion: 'Asistente inteligente',
    paqueteMinimo: 'BASE',
    requireIA: true // Requiere add-on de IA activado
  },
  {
    id: 'reportes',
    nombre: 'Reportes',
    ruta: '/reportes',
    descripcion: 'Análisis y KPIs',
    paqueteMinimo: 'BASE'
  },
  {
    id: 'configuracion',
    nombre: 'Configuración',
    ruta: '/configuracion',
    descripcion: 'Ajustes del sistema',
    paqueteMinimo: 'BASE'
  }
]

/**
 * Verifica si un módulo está disponible para un estudio
 */
export function moduloDisponible(
  modulo: ModuloERP,
  estudio: {
    paquete: PaqueteXenova
    iaLegalActivo?: boolean
  }
): boolean {
  // Verificar paquete mínimo
  const ordenPaquetes = { BASE: 1, PRO: 2, FULL: 3 }
  const paqueteActual = ordenPaquetes[estudio.paquete]
  const paqueteMinimo = ordenPaquetes[modulo.paqueteMinimo]
  
  if (paqueteActual < paqueteMinimo) {
    return false
  }
  
  // Verificar funcionalidad específica
  if (modulo.funcionalidadRequerida) {
    if (!tieneFuncionalidad(estudio.paquete, modulo.funcionalidadRequerida)) {
      return false
    }
  }
  
  // Verificar si requiere IA
  if (modulo.requireIA && !estudio.iaLegalActivo) {
    return false
  }
  
  return true
}

/**
 * Filtra los módulos disponibles para un estudio
 */
export function getModulosDisponibles(estudio: {
  paquete: PaqueteXenova
  iaLegalActivo?: boolean
}): ModuloERP[] {
  return MODULOS_ERP.filter(modulo => moduloDisponible(modulo, estudio))
}

/**
 * Obtiene el motivo por el cual un módulo no está disponible
 */
export function getMotivoNoDisponible(
  modulo: ModuloERP,
  estudio: {
    paquete: PaqueteXenova
    iaLegalActivo?: boolean
  }
): string | null {
  if (moduloDisponible(modulo, estudio)) {
    return null
  }
  
  // Verificar paquete
  const ordenPaquetes = { BASE: 1, PRO: 2, FULL: 3 }
  const paqueteActual = ordenPaquetes[estudio.paquete]
  const paqueteMinimo = ordenPaquetes[modulo.paqueteMinimo]
  
  if (paqueteActual < paqueteMinimo) {
    return `Requiere paquete ${modulo.paqueteMinimo} o superior`
  }
  
  // Verificar IA
  if (modulo.requireIA && !estudio.iaLegalActivo) {
    return 'Requiere el Add-On de IA Legal activado'
  }
  
  // Verificar funcionalidad
  if (modulo.funcionalidadRequerida) {
    if (!tieneFuncionalidad(estudio.paquete, modulo.funcionalidadRequerida)) {
      return `No disponible en tu paquete actual`
    }
  }
  
  return 'No disponible'
}

/**
 * Información para mostrar en tooltips de módulos bloqueados
 */
export interface ModuloBloqueadoInfo {
  bloqueado: boolean
  motivo: string | null
  paqueteRequerido?: PaqueteXenova
  requiereIA?: boolean
  mensajeUpgrade?: string
}

export function getInfoModuloBloqueado(
  modulo: ModuloERP,
  estudio: {
    paquete: PaqueteXenova
    iaLegalActivo?: boolean
  }
): ModuloBloqueadoInfo {
  const disponible = moduloDisponible(modulo, estudio)
  
  if (disponible) {
    return {
      bloqueado: false,
      motivo: null
    }
  }
  
  const motivo = getMotivoNoDisponible(modulo, estudio)
  const ordenPaquetes = { BASE: 1, PRO: 2, FULL: 3 }
  const paqueteActual = ordenPaquetes[estudio.paquete]
  const paqueteMinimo = ordenPaquetes[modulo.paqueteMinimo]
  
  let mensajeUpgrade = ''
  
  if (paqueteActual < paqueteMinimo) {
    mensajeUpgrade = `Actualiza a ${modulo.paqueteMinimo} para desbloquear este módulo`
  } else if (modulo.requireIA && !estudio.iaLegalActivo) {
    mensajeUpgrade = 'Activa el Add-On de IA Legal desde el panel de administración'
  }
  
  return {
    bloqueado: true,
    motivo,
    paqueteRequerido: modulo.paqueteMinimo,
    requiereIA: modulo.requireIA,
    mensajeUpgrade
  }
}
