# 🎨 Sistema de Temas - ERP Jurídico

## Visión General

El ERP Jurídico incluye un sistema completo de temas con **3 opciones** diseñadas para diferentes preferencias y estilos de trabajo:

1. **Tema Claro** ☀️ - Clásico y profesional
2. **Tema Oscuro** 🌙 - Para trabajar de noche
3. **Tema Colorido** ✨ - Identificación visual por colores

---

## 🎯 Estrategia del Tema Colorido

### Filosofía de Diseño

El tema colorido está diseñado específicamente para usuarios que **trabajan visualmente** y procesan información por colores en lugar de leer constantemente. Inspirado en el feedback de estudios jurídicos que usan sistemas con muchos colores y han "automatizado mentalmente" las asociaciones de color.

### Asignación de Colores por Módulo

Cada módulo tiene un **color único y estratégico**:

| Módulo | Color | Hex | Razón Psicológica |
|--------|-------|-----|-------------------|
| 🗂️ **Expedientes** | Azul | `#3B82F6` | Lo más importante del sistema, confianza, profesionalismo |
| ⚡ **Tareas** | Naranja | `#F97316` | Acción requerida, urgencia, energía |
| 👥 **Clientes** | Verde | `#10B981` | Éxito, relaciones, crecimiento |
| 📅 **Audiencias** | Rojo | `#EF4444` | Fechas críticas, alerta máxima, no se pueden perder |
| 📁 **Documentos** | Morado | `#8B5CF6` | Archivos, información almacenada, datos |
| 💰 **Facturación** | Amarillo/Oro | `#F59E0B` | Dinero, ingresos, valor económico |
| 🤖 **IA Legal** | Cyan | `#06B6D4` | Tecnología, innovación, futuro |
| 📊 **Reportes** | Índigo | `#6366F1` | Análisis, métricas, inteligencia de negocio |

### Paleta Armónica de Fondo

El tema colorido NO es un "arcoíris caótico". Usa una paleta cohesiva de fondos cálidos:

- **Base Principal**: Crema suave (`#FEF7F0`) - No cansa la vista durante jornadas largas
- **Acento 1**: Rosa pálido (`#FFF1F2`) - Para secciones secundarias
- **Acento 2**: Lavanda (`#F5F3FF`) - Para áreas especiales
- **Bordes**: Rosa suave (`#FDE4E4`) - Separadores sutiles que no compiten con contenido

**Resultado**: Un ambiente cálido, acogedor y profesional que mantiene los colores vibrantes solo donde importan.

---

## 🚀 Implementación Técnica

### Archivos Principales

```
src/
├── lib/
│   └── themes.ts              # Configuración de colores y helpers
├── contexts/
│   └── ThemeContext.tsx       # Context global del tema
├── components/
│   └── ThemeSelector.tsx      # Selector de tema en navbar
└── app/
    ├── globals.css            # Variables CSS de temas
    └── providers.tsx          # ThemeProvider wrapper
```

### Cómo Usar en Componentes

#### 1. Acceder al tema actual

```tsx
import { useTheme } from '@/contexts/ThemeContext'

function MyComponent() {
  const { theme, setTheme } = useTheme()
  
  // theme puede ser: 'light' | 'dark' | 'colorful'
}
```

#### 2. Obtener colores dinámicos

```tsx
import { getModuleColor, getModuleBadgeClasses } from '@/lib/themes'

function ExpedienteCard() {
  const { theme } = useTheme()
  const color = getModuleColor('expedientes', theme)
  
  return (
    <div className={cn('p-4', getModuleBadgeClasses('expedientes', theme))}>
      Expediente
    </div>
  )
}
```

#### 3. Clases condicionales por tema

```tsx
function MyCard() {
  const { theme } = useTheme()
  
  return (
    <div className={cn(
      'p-4 rounded-lg',
      theme === 'colorful' && 'bg-blue-50 border-2 border-blue-200',
      theme === 'dark' && 'bg-gray-800',
      theme === 'light' && 'bg-white'
    )}>
      Contenido
    </div>
  )
}
```

---

## 📱 Características del Sistema

### ✅ Persistencia
- El tema seleccionado se guarda en `localStorage`
- Se restaura automáticamente al recargar la página

### ✅ Transiciones Suaves
- Cambios de tema con animación de 300ms
- Sin flash de contenido (FOUC prevention)

### ✅ Responsivo
- El selector funciona en desktop y mobile
- Preview visual de cada tema

### ✅ Accesibilidad
- Colores con contraste WCAG AA
- Tema oscuro respeta preferencias del sistema
- Keyboard navigation completa

---

## 🎨 Uso Específico del Tema Colorido

### En Navegación

Los iconos de navegación toman el color del módulo:
- Expedientes → Icono azul
- Tareas → Icono naranja
- Clientes → Icono verde
- Etc.

### En Cards y Badges

```tsx
// En expedientes, todo tiene tinte azul
<Badge className="bg-blue-500 text-white">Nuevo</Badge>
<Card className="bg-blue-50 border-blue-200">...</Card>

// En facturación, todo es dorado
<Badge className="bg-amber-500 text-white">Pagado</Badge>
<Card className="bg-amber-50 border-amber-200">...</Card>
```

### Identificación Visual Rápida

En tema colorido, un usuario puede:
1. Ver una pantalla y saber INMEDIATAMENTE en qué módulo está (por color dominante)
2. Identificar tipo de contenido sin leer (tarjeta naranja = tarea pendiente)
3. Priorizar visualmente (rojo = audiencia urgente)

---

## 🔧 Configuración Avanzada

### Agregar un Nuevo Tema

1. Edita `src/lib/themes.ts` y agrega colores:

```ts
export const themes: Record<Theme, ThemeColors> = {
  // ...existing themes
  myTheme: {
    background: '#FFFFFF',
    // ... más colores
  }
}
```

2. Agrega variables CSS en `globals.css`:

```css
.theme-myTheme {
  --background: oklch(...);
  /* ... */
}
```

3. Agrega opción en `ThemeSelector.tsx`

### Personalizar Colores de Módulo

Edita el objeto en `src/lib/themes.ts`:

```ts
expedientes: '#TU_COLOR_AQUI'
```

---

## 📝 Próximos Pasos

### Para Implementar en Cada Página:

1. **Expedientes**: Aplicar clases azules a cards, badges, botones principales
2. **Tareas**: Usar naranja para estados pendientes y acciones
3. **Audiencias**: Rojo para fechas límite y recordatorios
4. **Dashboard**: Mix inteligente de todos los colores

### Tips de Diseño:

- **No abuses del color**: Usa el color del módulo en elementos clave, no en todo
- **Mantén jerarquía**: El color debe guiar, no distraer
- **Contraste**: Asegura que el texto sea legible en todos los fondos
- **Consistency**: Usa las funciones helper para mantener consistencia

---

## 🎓 Principios de UX

### Por qué funciona el Tema Colorido:

1. **Reducción Cognitiva**: El cerebro procesa colores más rápido que texto
2. **Memoria Visual**: Los usuarios recuerdan "el botón naranja" mejor que "el botón de tareas"
3. **Eficiencia**: No necesitas leer breadcrumbs si el color te dice dónde estás
4. **Profesionalismo**: Paleta armónica mantiene apariencia seria y confiable

### Casos de Uso Ideales:

- ✅ Usuarios que trabajan 8+ horas/día en el sistema
- ✅ Equipos grandes que alternan entre módulos frecuentemente
- ✅ Entornos de alta presión donde la velocidad importa
- ✅ Usuarios con preferencia por aprendizaje visual

---

## 🚀 Demo y Testing

Para probar los temas:

1. Click en el selector de tema en la navegación superior
2. Selecciona cada tema y navega por diferentes módulos
3. Observa cómo los colores cambian contextualmente
4. El tema se guardará automáticamente

**URL de desarrollo**: `http://localhost:3001`

---

**Diseñado con ❤️ para optimizar la productividad legal**
