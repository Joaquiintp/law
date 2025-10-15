/**
 * Sistema de Temas para ERP Jurídico
 * 
 * ESTRATEGIA DE COLORES PARA TEMA COLORIDO:
 * 
 * 🎯 FUNCIONALIDADES CLAVE (colores únicos para identificación rápida):
 * - Expedientes: Azul (#3B82F6) - Lo más importante del sistema
 * - Tareas: Naranja (#F97316) - Acción requerida, urgencia
 * - Clientes: Verde (#10B981) - Éxito, relaciones
 * - Audiencias: Rojo (#EF4444) - Fechas críticas, no se pueden perder
 * - Documentos: Morado (#8B5CF6) - Archivos, información
 * - Facturación: Amarillo/Oro (#F59E0B) - Dinero, ingresos
 * - IA Legal: Cyan (#06B6D4) - Tecnología, futuro
 * - Reportes: Índigo (#6366F1) - Análisis, datos
 * 
 * 🎨 PALETA ARMÓNICA DE FONDO:
 * - Base: Crema suave (#FEF7F0) - No cansa la vista
 * - Acento 1: Rosa pálido (#FFF1F2) - Secciones secundarias
 * - Acento 2: Lavanda (#F5F3FF) - Áreas especiales
 * - Bordes: Gris cálido (#E5E7EB) - Separadores sutiles
 */

export type Theme = 'light' | 'dark' | 'colorful'

export interface ThemeColors {
  // Backgrounds
  background: string
  backgroundSecondary: string
  backgroundTertiary: string
  
  // Text
  textPrimary: string
  textSecondary: string
  textMuted: string
  
  // Borders
  border: string
  borderLight: string
  
  // Module colors (for colorful theme)
  expedientes: string
  tareas: string
  clientes: string
  audiencias: string
  documentos: string
  facturacion: string
  iaLegal: string
  reportes: string
  
  // UI Elements
  primary: string
  success: string
  warning: string
  danger: string
  info: string
  
  // Cards & Components
  cardBg: string
  cardBgHover: string
  navBg: string
  navBorder: string
}

export const themes: Record<Theme, ThemeColors> = {
  light: {
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#F3F4F6',
    textPrimary: '#111827',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    // En tema claro, los módulos usan colores sutiles
    expedientes: '#3B82F6',
    tareas: '#F97316',
    clientes: '#10B981',
    audiencias: '#EF4444',
    documentos: '#8B5CF6',
    facturacion: '#F59E0B',
    iaLegal: '#06B6D4',
    reportes: '#6366F1',
    primary: '#2563EB',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    cardBg: '#FFFFFF',
    cardBgHover: '#F9FAFB',
    navBg: '#FFFFFF',
    navBorder: '#E5E7EB',
  },
  
  dark: {
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    backgroundTertiary: '#334155',
    textPrimary: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
    border: '#334155',
    borderLight: '#1E293B',
    // En tema oscuro, los módulos mantienen sus colores pero ajustados
    expedientes: '#60A5FA',
    tareas: '#FB923C',
    clientes: '#34D399',
    audiencias: '#F87171',
    documentos: '#A78BFA',
    facturacion: '#FBBF24',
    iaLegal: '#22D3EE',
    reportes: '#818CF8',
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    cardBg: '#1E293B',
    cardBgHover: '#334155',
    navBg: '#1E293B',
    navBorder: '#334155',
  },
  
  colorful: {
    // Fondos cálidos y acogedores
    background: '#FEF7F0', // Crema suave
    backgroundSecondary: '#FFF1F2', // Rosa pálido
    backgroundTertiary: '#F5F3FF', // Lavanda
    textPrimary: '#1F2937',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
    border: '#FDE4E4', // Borde rosa suave
    borderLight: '#FEF3E2', // Borde crema
    // COLORES PRINCIPALES POR MÓDULO - Alta saturación para identificación
    expedientes: '#3B82F6', // Azul vibrante
    tareas: '#F97316', // Naranja energético
    clientes: '#10B981', // Verde éxito
    audiencias: '#EF4444', // Rojo alerta
    documentos: '#8B5CF6', // Morado profesional
    facturacion: '#F59E0B', // Amarillo/oro dinero
    iaLegal: '#06B6D4', // Cyan tecnológico
    reportes: '#6366F1', // Índigo analítico
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F97316',
    danger: '#EF4444',
    info: '#06B6D4',
    cardBg: '#FFFFFF',
    cardBgHover: '#FFF9F5',
    navBg: '#FFFFFF',
    navBorder: '#FDE4E4',
  }
}

export const getThemeColors = (theme: Theme): ThemeColors => {
  return themes[theme]
}

// Mapeo de módulos a sus colores
export const getModuleColor = (module: string, theme: Theme): string => {
  const colors = themes[theme]
  const moduleMap: Record<string, keyof ThemeColors> = {
    'expedientes': 'expedientes',
    'tareas': 'tareas',
    'clientes': 'clientes',
    'audiencias': 'audiencias',
    'calendario': 'audiencias', // Usa el mismo color que audiencias
    'documentos': 'documentos',
    'facturacion': 'facturacion',
    'ia-legal': 'iaLegal',
    'reportes': 'reportes',
    'dashboard': 'primary',
    'configuracion': 'textSecondary',
    'admin': 'textPrimary',
  }
  
  const colorKey = moduleMap[module] || 'primary'
  return colors[colorKey as keyof ThemeColors] as string
}

// Clase CSS helpers para tema colorido
export const getModuleClasses = (module: string, theme: Theme): string => {
  if (theme !== 'colorful') return ''
  
  const colorMap: Record<string, string> = {
    'expedientes': 'bg-blue-50 border-blue-200 text-blue-900',
    'tareas': 'bg-orange-50 border-orange-200 text-orange-900',
    'clientes': 'bg-green-50 border-green-200 text-green-900',
    'audiencias': 'bg-red-50 border-red-200 text-red-900',
    'calendario': 'bg-red-50 border-red-200 text-red-900',
    'documentos': 'bg-purple-50 border-purple-200 text-purple-900',
    'facturacion': 'bg-amber-50 border-amber-200 text-amber-900',
    'ia-legal': 'bg-cyan-50 border-cyan-200 text-cyan-900',
    'reportes': 'bg-indigo-50 border-indigo-200 text-indigo-900',
  }
  
  return colorMap[module] || ''
}

// Badge colors para tema colorido
export const getModuleBadgeClasses = (module: string, theme: Theme): string => {
  if (theme !== 'colorful') return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  
  const colorMap: Record<string, string> = {
    'expedientes': 'bg-blue-500 text-white shadow-md',
    'tareas': 'bg-orange-500 text-white shadow-md',
    'clientes': 'bg-green-500 text-white shadow-md',
    'audiencias': 'bg-red-500 text-white shadow-md',
    'calendario': 'bg-red-500 text-white shadow-md',
    'documentos': 'bg-purple-500 text-white shadow-md',
    'facturacion': 'bg-amber-500 text-white shadow-md',
    'ia-legal': 'bg-cyan-500 text-white shadow-md',
    'reportes': 'bg-indigo-500 text-white shadow-md',
  }
  
  return colorMap[module] || 'bg-gray-500 text-white'
}

// Button colors para tema colorido - Botones principales
export const getModuleButtonClasses = (module: string, theme: Theme, variant: 'primary' | 'secondary' | 'outline' = 'primary'): string => {
  if (theme !== 'colorful') {
    if (variant === 'primary') return 'bg-blue-600 hover:bg-blue-700 text-white'
    if (variant === 'secondary') return 'bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
    return 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  }
  
  const colorMap: Record<string, { primary: string; secondary: string; outline: string }> = {
    'expedientes': {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-xl',
      secondary: 'bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300',
      outline: 'border-2 border-blue-600 text-blue-700 hover:bg-blue-50 hover:shadow-md'
    },
    'tareas': {
      primary: 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200 hover:shadow-xl',
      secondary: 'bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-300',
      outline: 'border-2 border-orange-600 text-orange-700 hover:bg-orange-50 hover:shadow-md'
    },
    'clientes': {
      primary: 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 hover:shadow-xl',
      secondary: 'bg-green-100 hover:bg-green-200 text-green-800 border border-green-300',
      outline: 'border-2 border-green-600 text-green-700 hover:bg-green-50 hover:shadow-md'
    },
    'audiencias': {
      primary: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 hover:shadow-xl',
      secondary: 'bg-red-100 hover:bg-red-200 text-red-800 border border-red-300',
      outline: 'border-2 border-red-600 text-red-700 hover:bg-red-50 hover:shadow-md'
    },
    'calendario': {
      primary: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 hover:shadow-xl',
      secondary: 'bg-red-100 hover:bg-red-200 text-red-800 border border-red-300',
      outline: 'border-2 border-red-600 text-red-700 hover:bg-red-50 hover:shadow-md'
    },
    'documentos': {
      primary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 hover:shadow-xl',
      secondary: 'bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300',
      outline: 'border-2 border-purple-600 text-purple-700 hover:bg-purple-50 hover:shadow-md'
    },
    'facturacion': {
      primary: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-200 hover:shadow-xl',
      secondary: 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300',
      outline: 'border-2 border-amber-600 text-amber-700 hover:bg-amber-50 hover:shadow-md'
    },
    'ia-legal': {
      primary: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-200 hover:shadow-xl',
      secondary: 'bg-cyan-100 hover:bg-cyan-200 text-cyan-800 border border-cyan-300',
      outline: 'border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50 hover:shadow-md'
    },
    'reportes': {
      primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-xl',
      secondary: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border border-indigo-300',
      outline: 'border-2 border-indigo-600 text-indigo-700 hover:bg-indigo-50 hover:shadow-md'
    },
  }
  
  return colorMap[module]?.[variant] || colorMap['expedientes'][variant]
}

// Card colors para tema colorido
export const getModuleCardClasses = (module: string, theme: Theme): string => {
  if (theme !== 'colorful') return 'bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700'
  
  const colorMap: Record<string, string> = {
    'expedientes': 'bg-white border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100 transition-all',
    'tareas': 'bg-white border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-100 transition-all',
    'clientes': 'bg-white border-2 border-green-200 hover:border-green-400 hover:shadow-lg hover:shadow-green-100 transition-all',
    'audiencias': 'bg-white border-2 border-red-200 hover:border-red-400 hover:shadow-lg hover:shadow-red-100 transition-all',
    'calendario': 'bg-white border-2 border-red-200 hover:border-red-400 hover:shadow-lg hover:shadow-red-100 transition-all',
    'documentos': 'bg-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-100 transition-all',
    'facturacion': 'bg-white border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-100 transition-all',
    'ia-legal': 'bg-white border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-100 transition-all',
    'reportes': 'bg-white border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-100 transition-all',
  }
  
  return colorMap[module] || 'bg-white border-2 border-gray-200'
}
