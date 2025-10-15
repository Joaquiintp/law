/**
 * Utilidades para manejo de roles y permisos
 */

export type UserRole = 'ADMIN' | 'DUENO' | 'ABOGADO' | 'SECRETARIO'

export const ROLES = {
  ADMIN: 'ADMIN',
  DUENO: 'DUENO',
  ABOGADO: 'ABOGADO',
  SECRETARIO: 'SECRETARIO',
} as const

/**
 * Obtiene el nombre para mostrar del rol
 */
export function getRoleDisplayName(role: UserRole, estudioNombre?: string): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrador ERP'
    case 'DUENO':
      return estudioNombre || 'Estudio'
    case 'ABOGADO':
      return 'Abogado/a'
    case 'SECRETARIO':
      return 'Secretario/a'
    default:
      return role
  }
}

/**
 * Obtiene el badge de color para el rol
 */
export function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return 'bg-purple-100 text-purple-700'
    case 'DUENO':
      return 'bg-blue-100 text-blue-700'
    case 'ABOGADO':
      return 'bg-green-100 text-green-700'
    case 'SECRETARIO':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

/**
 * Permisos por rol
 */
export const PERMISOS = {
  // Módulos visibles por rol
  MODULOS: {
    ADMIN: ['admin', 'estudios', 'usuarios'],
    DUENO: ['expedientes', 'clientes', 'calendario', 'documentos', 'facturacion', 'reportes', 'ia-legal', 'configuracion'],
    ABOGADO: ['expedientes', 'clientes', 'calendario', 'documentos', 'ia-legal'],
    SECRETARIO: ['expedientes', 'clientes', 'calendario', 'documentos', 'ia-legal'],
  },
  
  // Acciones específicas
  ACCIONES: {
    // Gestión de usuarios del estudio
    GESTIONAR_USUARIOS_ESTUDIO: ['ADMIN', 'DUENO'],
    
    // Ver facturación y reportes
    VER_FACTURACION: ['ADMIN', 'DUENO'],
    VER_REPORTES: ['ADMIN', 'DUENO'],
    
    // Modificar cualquier dato
    MODIFICAR_TODO: ['ADMIN', 'DUENO'],
    
    // Crear/editar/eliminar expedientes
    CREAR_EXPEDIENTE: ['ADMIN', 'DUENO', 'ABOGADO', 'SECRETARIO'],
    EDITAR_EXPEDIENTE: ['ADMIN', 'DUENO', 'ABOGADO', 'SECRETARIO'],
    ELIMINAR_EXPEDIENTE: ['ADMIN', 'DUENO'],
    
    // Clientes
    CREAR_CLIENTE: ['ADMIN', 'DUENO', 'ABOGADO', 'SECRETARIO'],
    EDITAR_CLIENTE: ['ADMIN', 'DUENO', 'ABOGADO', 'SECRETARIO'],
    ELIMINAR_CLIENTE: ['ADMIN', 'DUENO'],
    
    // Documentos
    SUBIR_DOCUMENTO: ['ADMIN', 'DUENO', 'ABOGADO', 'SECRETARIO'],
    ELIMINAR_DOCUMENTO: ['ADMIN', 'DUENO', 'ABOGADO', 'SECRETARIO'],
    
    // IA Legal (requiere módulo activo además del rol)
    VER_IA_LEGAL: ['ADMIN', 'DUENO', 'ABOGADO', 'SECRETARIO'], // Todos lo ven
    USAR_IA_LEGAL: ['ADMIN', 'DUENO', 'ABOGADO', 'SECRETARIO'], // Pero requiere módulo activo
    
    // Gestión de estudios (solo ADMIN)
    CREAR_ESTUDIO: ['ADMIN'],
    EDITAR_ESTUDIO: ['ADMIN'],
    ELIMINAR_ESTUDIO: ['ADMIN'],
    VER_TODOS_ESTUDIOS: ['ADMIN'],
    ACTIVAR_MODULOS_PREMIUM: ['ADMIN'], // Solo ADMIN puede activar módulos premium
  }
} as const

/**
 * Verifica si un usuario tiene permiso para realizar una acción
 */
export function tienePermiso(
  userRole: UserRole,
  accion: keyof typeof PERMISOS.ACCIONES
): boolean {
  const rolesPermitidos = PERMISOS.ACCIONES[accion] as readonly UserRole[]
  return rolesPermitidos.includes(userRole)
}

/**
 * Verifica si un usuario puede ver un módulo
 */
export function puedeVerModulo(
  userRole: UserRole,
  modulo: string
): boolean {
  const modulosPermitidos = PERMISOS.MODULOS[userRole] as readonly string[]
  return modulosPermitidos.includes(modulo)
}

/**
 * Obtiene la lista de opciones de roles para selección
 * (excluye ADMIN que solo se asigna internamente)
 */
export function getRolesParaSeleccion(isAdmin: boolean = false) {
  if (isAdmin) {
    return [
      { value: 'ADMIN', label: 'Administrador ERP' },
      { value: 'DUENO', label: 'Estudio (Dueño)' },
      { value: 'ABOGADO', label: 'Abogado/a' },
      { value: 'SECRETARIO', label: 'Secretario/a' },
    ]
  }
  
  // Para dueños de estudio (no pueden crear ADMIN)
  return [
    { value: 'DUENO', label: 'Estudio (Dueño)' },
    { value: 'ABOGADO', label: 'Abogado/a' },
    { value: 'SECRETARIO', label: 'Secretario/a' },
  ]
}

/**
 * Verifica si el módulo de IA Legal está activo para un estudio
 */
export function tieneModuloIAActivo(
  iaLegalActivo: boolean,
  iaLegalFechaVencimiento?: Date | null
): boolean {
  if (!iaLegalActivo) return false
  
  // Si no hay fecha de vencimiento, está activo permanentemente
  if (!iaLegalFechaVencimiento) return true
  
  // Verificar si no ha vencido
  const ahora = new Date()
  const vencimiento = new Date(iaLegalFechaVencimiento)
  return ahora < vencimiento
}

/**
 * Verifica si un usuario puede usar IA Legal
 * Requiere: rol permitido + módulo activo en su estudio
 */
export function puedeUsarIALegal(
  userRole: UserRole,
  iaLegalActivo: boolean,
  iaLegalFechaVencimiento?: Date | null
): boolean {
  // Verificar permiso por rol
  const tieneRolPermitido = tienePermiso(userRole, 'USAR_IA_LEGAL')
  if (!tieneRolPermitido) return false
  
  // ADMIN siempre puede usar IA
  if (userRole === 'ADMIN') return true
  
  // Verificar si el módulo está activo
  return tieneModuloIAActivo(iaLegalActivo, iaLegalFechaVencimiento)
}

/**
 * Obtiene el mensaje de estado del módulo IA
 */
export function getMensajeEstadoIA(
  iaLegalActivo: boolean,
  iaLegalFechaVencimiento?: Date | null
): { estado: 'activo' | 'inactivo' | 'vencido' | 'por_vencer'; mensaje: string; color: string } {
  if (!iaLegalActivo) {
    return {
      estado: 'inactivo',
      mensaje: 'Módulo no contratado. Contacta al administrador para activarlo.',
      color: 'bg-gray-100 text-gray-700'
    }
  }
  
  if (!iaLegalFechaVencimiento) {
    return {
      estado: 'activo',
      mensaje: 'Módulo activo permanentemente',
      color: 'bg-green-100 text-green-700'
    }
  }
  
  const ahora = new Date()
  const vencimiento = new Date(iaLegalFechaVencimiento)
  const diasRestantes = Math.ceil((vencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diasRestantes <= 0) {
    return {
      estado: 'vencido',
      mensaje: 'Módulo vencido. Contacta al administrador para renovar.',
      color: 'bg-red-100 text-red-700'
    }
  }
  
  if (diasRestantes <= 30) {
    return {
      estado: 'por_vencer',
      mensaje: `Módulo activo. Vence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}.`,
      color: 'bg-yellow-100 text-yellow-700'
    }
  }
  
  return {
    estado: 'activo',
    mensaje: `Módulo activo. Vence el ${vencimiento.toLocaleDateString('es-AR')}`,
    color: 'bg-green-100 text-green-700'
  }
}
