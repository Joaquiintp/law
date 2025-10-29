# 📝 Cuaderno de Notas Colaborativo - Sistema ERP Jurídico

## Descripción General

El **Cuaderno de Notas** es una funcionalidad colaborativa tipo chat/foro que permite a todos los usuarios que interactúan con un expediente dejar notas, comentarios y referencias, facilitando la comunicación y el seguimiento del trabajo en equipo.

## 🎯 Características Principales

### 1. **Acceso Rápido**
- **Botón flotante "+"** ubicado en la esquina inferior derecha
- Visible en cualquier vista de expediente
- Color azul distintivo con efecto de sombra
- Icono: `MessageSquarePlus`

### 2. **Panel Lateral Deslizante**
- Se abre como Dialog modal con scroll
- Dimensiones: 80% de altura de viewport, max-width 2xl
- Muestra contador de notas en el header
- Scroll automático a la última nota

### 3. **Sistema de Notas**

#### Contenido de Nota:
- **Texto principal** (requerido, multilínea)
- **Referencia a archivo** (opcional)
- **Referencia a tarea** (opcional)
- **Autor** con avatar circular (iniciales)
- **Fecha y hora** de creación
- **Indicador "editado"** si fue modificada

#### Visual:
- Notas propias: fondo azul claro (`bg-blue-50`, border `border-blue-200`)
- Notas de otros: fondo blanco
- Avatar con iniciales del nombre del autor
- Timestamp en formato español

### 4. **Referencias a Archivos**

**Selector de Archivos:**
- Dialog modal con búsqueda
- Lista de documentos del expediente
- Filtrado en tiempo real
- Muestra: nombre, tipo, extensión, fecha

**Visualización en Nota:**
- Badge azul con icono de documento
- Formato: "Archivo: nombre_del_archivo.pdf"
- Click para ver/descargar (futuro)

### 5. **Referencias a Tareas**

**Selector de Tareas:**
- Dialog modal con búsqueda
- Lista de tareas del expediente
- Muestra: título, descripción, tipo, estado, fecha vencimiento
- Badges de estado (Pendiente, Completada, Cancelada)

**Visualización en Nota:**
- Badge naranja con icono de checkbox
- Formato: "Tarea: nombre_de_la_tarea"
- Click para ir a tarea (futuro)

### 6. **Edición y Eliminación**

**Permisos:**
- Solo el autor puede editar/eliminar sus propias notas
- Menú de 3 puntos verticales en cada nota propia
- Confirmación antes de eliminar

**Edición:**
- Textarea inline para editar
- Botones "Guardar" y "Cancelar"
- Marca "editado" en timestamp

### 7. **Input de Nueva Nota**

**Área fija inferior:**
- Textarea multilínea con placeholder
- Atajos de teclado:
  - `Enter`: Enviar nota
  - `Shift + Enter`: Nueva línea
- Botones de referencia (Paperclip, CheckSquare)
- Botón de envío con icono Send

**Referencias seleccionadas:**
- Se muestran arriba del textarea
- Badges con "X" para remover
- Color azul para archivos, naranja para tareas

## 🗂️ Estructura de Archivos

```
src/
├── components/
│   └── expedientes/
│       ├── CuadernoNotas.tsx              # Componente principal
│       ├── CuadernoNotasButton.tsx        # Botón flotante
│       ├── SelectorArchivosNotas.tsx      # Selector de archivos
│       └── SelectorTareasNotas.tsx        # Selector de tareas
│
└── app/
    └── api/
        └── expedientes/
            └── [id]/
                └── notas/
                    ├── route.ts           # GET y POST
                    └── [notaId]/
                        └── route.ts       # PATCH y DELETE
```

## 🗄️ Base de Datos

### Modelo Prisma: `NotaExpediente`

```prisma
model NotaExpediente {
  id          String   @id @default(cuid())
  
  // Contenido
  texto       String
  editado     Boolean  @default(false)
  
  // Relaciones
  expedienteId String
  expediente   Expediente @relation(fields: [expedienteId], references: [id], onDelete: Cascade)
  
  autorId     String
  autor       User     @relation(fields: [autorId], references: [id], onDelete: Cascade)
  
  // Referencias opcionales
  archivoReferenciadoId String?
  archivoReferenciado   Documento? @relation(fields: [archivoReferenciadoId], references: [id], onDelete: SetNull)
  
  tareaReferenciadaId  String?
  tareaReferenciada    Tarea? @relation(fields: [tareaReferenciadaId], references: [id], onDelete: SetNull)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([expedienteId])
  @@index([autorId])
  @@index([createdAt])
}
```

### Relaciones agregadas:

**User:**
```prisma
notasExpedientes NotaExpediente[]
```

**Expediente:**
```prisma
notas NotaExpediente[]
```

**Documento:**
```prisma
notasReferenciadas NotaExpediente[]
```

**Tarea:**
```prisma
notasReferenciadas NotaExpediente[]
```

## 🔌 API Endpoints

### 1. **GET /api/expedientes/[id]/notas**
Obtiene todas las notas de un expediente

**Response:**
```typescript
{
  id: string
  texto: string
  editado: boolean
  autor: {
    id: string
    name: string
    email: string
  }
  archivoReferenciado?: {
    id: string
    nombre: string
    tipoDocumento: string
  }
  tareaReferenciada?: {
    id: string
    tipo: string
    titulo: string
  }
  createdAt: Date
  updatedAt: Date
}[]
```

### 2. **POST /api/expedientes/[id]/notas**
Crea una nueva nota

**Body:**
```typescript
{
  texto: string
  archivoReferenciadoId?: string
  tareaReferenciadaId?: string
}
```

### 3. **PATCH /api/expedientes/[id]/notas/[notaId]**
Edita una nota existente (solo el autor)

**Body:**
```typescript
{
  texto: string
}
```

### 4. **DELETE /api/expedientes/[id]/notas/[notaId]**
Elimina una nota (solo el autor)

## 🎨 Diseño UI/UX

### Colores:
- **Botón flotante**: `bg-blue-600 hover:bg-blue-700`
- **Nota propia**: `bg-blue-50 border-blue-200`
- **Nota de otros**: `bg-white`
- **Avatar**: `bg-blue-600 text-white`
- **Badge archivo**: `bg-blue-100 text-blue-600`
- **Badge tarea**: `bg-orange-100 text-orange-600`

### Iconos (Lucide):
- `MessageSquarePlus`: Botón principal y header
- `FileText`: Archivos
- `CheckSquare`: Tareas
- `Send`: Enviar nota
- `Paperclip`: Referenciar archivo
- `MoreVertical`: Menú de opciones
- `Edit`: Editar
- `Trash2`: Eliminar
- `Search`: Búsqueda en selectores

## 🚀 Uso

### Desde ExpedienteDetail:

```tsx
import CuadernoNotasButton from '@/components/expedientes/CuadernoNotasButton'

// En el JSX, al final:
<CuadernoNotasButton expedienteId={expediente.id} />
```

### Flujo de Usuario:

1. Usuario hace click en botón "+" flotante
2. Se abre panel lateral con notas existentes
3. Usuario puede:
   - Leer notas anteriores con scroll
   - Click en Paperclip para referenciar archivo
   - Click en CheckSquare para referenciar tarea
   - Escribir texto en textarea
   - Presionar Enter o botón Send para publicar
4. La nota aparece inmediatamente con:
   - Avatar del autor
   - Timestamp actual
   - Referencias (si las hay)
5. Autor puede editar/eliminar sus propias notas

## 📋 TODOs Futuros

- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Mención de usuarios con `@`
- [ ] Adjuntar archivos directamente
- [ ] Marcar notas como importantes
- [ ] Búsqueda dentro del cuaderno
- [ ] Filtros por autor/fecha/tipo
- [ ] Exportar cuaderno a PDF
- [ ] Integración con sistema de notificaciones
- [ ] Click en referencia para abrir archivo/tarea
- [ ] Reacciones a notas (👍, ❤️, etc.)
- [ ] Hilos de conversación (replies)

## 🔐 Seguridad

- Autenticación requerida (NextAuth session)
- Validación de permisos por usuario
- Solo autor puede editar/eliminar
- Cascada de eliminación (onDelete: Cascade)
- Referencias con SetNull si se elimina archivo/tarea

## 🧪 Testing

### Casos de prueba:
1. Crear nota simple sin referencias
2. Crear nota con referencia a archivo
3. Crear nota con referencia a tarea
4. Crear nota con ambas referencias
5. Editar nota propia
6. Intentar editar nota ajena (debe fallar)
7. Eliminar nota propia
8. Intentar eliminar nota ajena (debe fallar)
9. Scroll automático a última nota
10. Atajos de teclado (Enter, Shift+Enter)

---

**Última actualización:** 27 de octubre de 2025
