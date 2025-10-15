/**
 * 🧩 Sistema de Paquetes XenovaLaw
 * 
 * Define los 3 paquetes principales y sus características:
 * - BASE: Digitalización Jurídica
 * - PRO: Automatización Legal  
 * - FULL: Operación Inteligente
 */

export type PaqueteXenova = 'BASE' | 'PRO' | 'FULL'

export interface CaracteristicasPaquete {
  nombre: string
  descripcion: string
  tagline: string
  color: string // Para UI
  emoji: string
  
  // Límites técnicos
  maxUsuarios: number // -1 = ilimitado
  almacenamientoGB: number
  
  // Funcionalidades incluidas
  funcionalidades: {
    // BASE
    gestionExpedientes: boolean
    gestionClientes: boolean
    generacionPDF: boolean
    agendaProcesal: boolean
    portalCliente: boolean
    rolesUsuario: boolean
    
    // PRO
    whatsappAPI: boolean
    emailAPI: boolean
    plantillasInteligentes: boolean
    portalClienteAvanzado: boolean
    agendaIntegrada: boolean
    facturacionElectronica: boolean
    firmaDigital: boolean
    dashboardFinanzas: boolean
    
    // FULL
    automatizacionCompleta: boolean
    integracionJudicial: boolean
    reportesBI: boolean
    multiSede: boolean
    seguridadAvanzada: boolean
    personalizacionWorkflows: boolean
  }
  
  // Valor diferencial
  valorDiferencial: string
  
  // Automatizaciones
  automatizaciones: string[]
}

export const PAQUETES_XENOVALAW: Record<PaqueteXenova, CaracteristicasPaquete> = {
  BASE: {
    nombre: 'BASE',
    descripcion: 'Digitalización Jurídica',
    tagline: 'Primer paso hacia la modernización',
    color: 'green',
    emoji: '🟢',
    
    maxUsuarios: 5,
    almacenamientoGB: 5,
    
    funcionalidades: {
      // BASE
      gestionExpedientes: true,
      gestionClientes: true,
      generacionPDF: true,
      agendaProcesal: true,
      portalCliente: true,
      rolesUsuario: true,
      
      // PRO
      whatsappAPI: false,
      emailAPI: false,
      plantillasInteligentes: false,
      portalClienteAvanzado: false,
      agendaIntegrada: false,
      facturacionElectronica: false,
      firmaDigital: false,
      dashboardFinanzas: false,
      
      // FULL
      automatizacionCompleta: false,
      integracionJudicial: false,
      reportesBI: false,
      multiSede: false,
      seguridadAvanzada: false,
      personalizacionWorkflows: false,
    },
    
    valorDiferencial: 'Primer paso hacia la digitalización, sin complejidad técnica ni curva de aprendizaje alta',
    
    automatizaciones: [
      'Recordatorios internos de vencimientos',
      'Control básico de plazos procesales',
      'Alertas internas de audiencias'
    ]
  },
  
  PRO: {
    nombre: 'PRO',
    descripcion: 'Automatización Legal',
    tagline: 'Optimiza tiempo y comunicación',
    color: 'yellow',
    emoji: '🟡',
    
    maxUsuarios: 20,
    almacenamientoGB: 25,
    
    funcionalidades: {
      // BASE (hereda todo)
      gestionExpedientes: true,
      gestionClientes: true,
      generacionPDF: true,
      agendaProcesal: true,
      portalCliente: true,
      rolesUsuario: true,
      
      // PRO
      whatsappAPI: true,
      emailAPI: true,
      plantillasInteligentes: true,
      portalClienteAvanzado: true,
      agendaIntegrada: true,
      facturacionElectronica: true,
      firmaDigital: true,
      dashboardFinanzas: true,
      
      // FULL
      automatizacionCompleta: false,
      integracionJudicial: false,
      reportesBI: false,
      multiSede: false,
      seguridadAvanzada: false,
      personalizacionWorkflows: false,
    },
    
    valorDiferencial: 'Convierte la operación del estudio en una gestión semi-automática, reduciendo el 60% del trabajo administrativo',
    
    automatizaciones: [
      'Envío automático de WhatsApp (audiencias, vencimientos, documentos)',
      'Emails automáticos contextualizados por expediente',
      'Plantillas con autocompletado de datos del expediente',
      'Sincronización con Google Calendar / Outlook',
      'Facturación electrónica vía SDK AFIP',
      'Firma digital certificada de documentos',
      'Dashboard de productividad en tiempo real'
    ]
  },
  
  FULL: {
    nombre: 'FULL',
    descripcion: 'Operación Inteligente',
    tagline: 'Estructura escalable y auditable',
    color: 'blue',
    emoji: '🔵',
    
    maxUsuarios: -1, // Ilimitado
    almacenamientoGB: 100,
    
    funcionalidades: {
      // BASE (hereda todo)
      gestionExpedientes: true,
      gestionClientes: true,
      generacionPDF: true,
      agendaProcesal: true,
      portalCliente: true,
      rolesUsuario: true,
      
      // PRO (hereda todo)
      whatsappAPI: true,
      emailAPI: true,
      plantillasInteligentes: true,
      portalClienteAvanzado: true,
      agendaIntegrada: true,
      facturacionElectronica: true,
      firmaDigital: true,
      dashboardFinanzas: true,
      
      // FULL
      automatizacionCompleta: true,
      integracionJudicial: true,
      reportesBI: true,
      multiSede: true,
      seguridadAvanzada: true,
      personalizacionWorkflows: true,
    },
    
    valorDiferencial: 'Transforma el estudio en una estructura inteligente, escalable y auditable',
    
    automatizaciones: [
      'Automatización de flujo completo (desde alta del cliente hasta facturación)',
      'Integración avanzada con APIs judiciales (según jurisdicción)',
      'Reportes BI interactivos y dashboards gerenciales',
      'Gestión multi-sede con sincronización en tiempo real',
      'Auditoría completa con control granular de permisos',
      'Autenticación de dos factores (2FA)',
      'Backup automático en caliente',
      'Personalización total de workflows y plantillas',
      'Machine Learning para clasificación de expedientes'
    ]
  }
}

/**
 * 💾 Add-Ons de Almacenamiento
 */
export interface AddOnAlmacenamiento {
  id: string
  nombre: string
  gb: number
  descripcion: string
}

export const ADD_ONS_ALMACENAMIENTO: AddOnAlmacenamiento[] = [
  {
    id: 'storage-10',
    nombre: 'Almacenamiento +10 GB',
    gb: 10,
    descripcion: 'Ideal para estudios con documentación adicional'
  },
  {
    id: 'storage-50',
    nombre: 'Almacenamiento +50 GB',
    gb: 50,
    descripcion: 'Para alto volumen de expedientes digitales'
  },
  {
    id: 'storage-100',
    nombre: 'Almacenamiento +100 GB',
    gb: 100,
    descripcion: 'Estudios con evidencia digital y multimedia'
  }
]

/**
 * 🤖 Add-On IA Legal
 */
export interface ConfiguracionIA {
  activo: boolean
  tipo: 'FIJO' | 'CONSUMO' // Licencia fija mensual o pago por uso
  maxConsultas?: number // Si tipo FIJO
  consultasUsadas: number
}

export const FUNCIONALIDADES_IA = [
  {
    id: 'redaccion',
    nombre: 'Redacción Asistida',
    descripcion: 'Generación de escritos con contexto del expediente',
    icon: '✍️'
  },
  {
    id: 'analisis',
    nombre: 'Análisis de Contratos',
    descripcion: 'Detección automática de cláusulas críticas',
    icon: '📄'
  },
  {
    id: 'resumen',
    nombre: 'Resumen de Resoluciones',
    descripcion: 'Síntesis inteligente de sentencias judiciales',
    icon: '📋'
  },
  {
    id: 'clasificacion',
    nombre: 'Clasificación Inteligente',
    descripcion: 'Organización automática de expedientes por materia',
    icon: '🗂️'
  },
  {
    id: 'minutas',
    nombre: 'Minutas Automáticas',
    descripcion: 'Generación de minutas desde texto o audio de reuniones',
    icon: '🎙️'
  }
]

/**
 * Helpers para trabajar con paquetes
 */
export function getPaqueteInfo(paquete: PaqueteXenova): CaracteristicasPaquete {
  return PAQUETES_XENOVALAW[paquete]
}

export function getPaqueteColor(paquete: PaqueteXenova): string {
  const colores = {
    BASE: 'bg-green-100 text-green-800 border-green-300',
    PRO: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    FULL: 'bg-blue-100 text-blue-800 border-blue-300'
  }
  return colores[paquete]
}

export function getPaqueteBadgeColor(paquete: PaqueteXenova): 'default' | 'secondary' | 'destructive' | 'outline' {
  const badgeColors = {
    BASE: 'outline' as const,
    PRO: 'secondary' as const,
    FULL: 'default' as const
  }
  return badgeColors[paquete]
}

export function calcularAlmacenamientoTotal(estudio: {
  almacenamientoGB: number
  almacenamientoExtra: number
}): number {
  return estudio.almacenamientoGB + estudio.almacenamientoExtra
}

export function calcularPorcentajeAlmacenamiento(estudio: {
  almacenamientoGB: number
  almacenamientoExtra: number
  almacenamientoUsadoMB: number
}): number {
  const totalMB = (estudio.almacenamientoGB + estudio.almacenamientoExtra) * 1024
  return Math.round((estudio.almacenamientoUsadoMB / totalMB) * 100)
}

export function formatearAlmacenamiento(mb: number): string {
  if (mb < 1024) {
    return `${mb} MB`
  }
  return `${(mb / 1024).toFixed(2)} GB`
}

/**
 * Valida si un estudio puede acceder a una funcionalidad
 */
export function tieneFuncionalidad(
  paquete: PaqueteXenova,
  funcionalidad: keyof CaracteristicasPaquete['funcionalidades']
): boolean {
  return PAQUETES_XENOVALAW[paquete].funcionalidades[funcionalidad]
}

/**
 * Retorna las funcionalidades nuevas al hacer upgrade
 */
export function getFuncionalidadesNuevas(
  paqueteActual: PaqueteXenova,
  paqueteDestino: PaqueteXenova
): string[] {
  const actual = PAQUETES_XENOVALAW[paqueteActual].funcionalidades
  const destino = PAQUETES_XENOVALAW[paqueteDestino].funcionalidades
  
  const nuevas: string[] = []
  
  for (const [key, value] of Object.entries(destino)) {
    if (value && !actual[key as keyof typeof actual]) {
      // Convertir camelCase a texto legible
      const nombre = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
      nuevas.push(nombre)
    }
  }
  
  return nuevas
}
