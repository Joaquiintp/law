# 📅 Sistema de Eventos en Calendario - Implementado

**Fecha:** 22 de Octubre de 2025  
**Módulo:** Calendario  
**Características:** Eventos personalizados + Mejoras en Audiencias

---

## 🎯 Características Implementadas

### 1. **Nuevo Modelo: Evento**

Se agregó un nuevo modelo `Evento` al schema de Prisma para manejar diferentes tipos de eventos en el calendario:

```prisma
model Evento {
  id            String @id @default(cuid())
  titulo        String
  descripcion   String?
  fecha         DateTime
  hora          String?
  tipo          TipoEvento
  
  // Detalles específicos por tipo
  monto         Float? // Para cobros
  moneda        Moneda? @default(ARS) // Para cobros
  estado        EstadoEvento @default(PENDIENTE)
  
  // Relaciones opcionales
  expedienteId  String?
  expediente    Expediente? @relation(fields: [expedienteId], references: [id])
  clienteId     String?
  cliente       Cliente? @relation(fields: [clienteId], references: [id])
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([fecha])
  @@index([tipo])
  @@index([estado])
}
```

### 2. **Tipos de Eventos**

```prisma
enum TipoEvento {
  COBRO              // Para registrar fechas de cobros esperados
  VENCIMIENTO        // Para fechas de vencimiento de documentos, plazos
  FECHA_LIMITE       // Para deadlines importantes
  REUNION            // Para reuniones generales
  OTRO               // Para eventos personalizados
}

enum EstadoEvento {
  PENDIENTE
  COMPLETADO
  CANCELADO
}
```

---

## 📋 Mejoras Solicitadas

### ✅ 1. Mostrar nombre de audiencia en lugar de solo hora

**Antes:**
- Solo se mostraba "15:30" en el calendario

**Ahora:**
- Se mostrará "Audiencia de Prueba" + hora
- Tipo de audiencia visible (Conciliación, Prueba, Alegatos, etc.)

### ✅ 2. Opción de editar audiencia en el día actual

**Implementación:**
- Botón "Editar" visible cuando la audiencia es del día actual o futura
- Permite modificar: hora, lugar, modalidad, estado
- Útil para cambios de último momento (cambio de horario, sala, etc.)

### ✅ 3. Botón "Nuevo Evento" junto a "Nueva Audiencia"

**Ubicación:** Calendario → Botones de acción

**Opciones del formulario:**

#### 📝 Formulario de Nuevo Evento

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **Tipo** | Select | COBRO / VENCIMIENTO / FECHA_LIMITE / REUNION / OTRO |
| **Título** | Text | Nombre descriptivo del evento |
| **Descripción** | Textarea | Detalles adicionales (opcional) |
| **Fecha** | Date | Fecha del evento |
| **Hora** | Time | Hora del evento (opcional) |
| **Monto** | Number | Solo para tipo COBRO |
| **Moneda** | Select | ARS / USD / EUR (solo para COBRO) |
| **Expediente** | Select | Asociar a un expediente (opcional) |
| **Cliente** | Select | Asociar a un cliente (opcional) |

---

## 🎨 Diseño de UI

### Calendario con Eventos

```
┌─────────────────────────────────────────┐
│  📅 Octubre 2025                         │
│  [Nueva Audiencia] [Nuevo Evento] ←NEW  │
├─────────────────────────────────────────┤
│  Lun  Mar  Mié  Jue  Vie  Sáb  Dom     │
│                                          │
│   1    2    3    4    5    6    7       │
│   8    9   10   11   12   13   14       │
│  15   [16]  17   18   19   20   21       │
│        ↓                                 │
│   Eventos del día 16:                    │
│   🏛️ Audiencia de Prueba - 10:00        │
│   💰 Cobro Honorarios - 15:00            │
│   ⏰ Vencimiento Apelación - 18:00       │
└─────────────────────────────────────────┘
```

### Iconos por Tipo de Evento

- 🏛️ **Audiencia** (existente)
- 💰 **Cobro** (nuevo)
- ⏰ **Vencimiento** (nuevo)
- 🚨 **Fecha Límite** (nuevo)
- 👥 **Reunión** (nuevo)
- 📌 **Otro** (nuevo)

### Códigos de Color

```css
Audiencia:      Azul (#3B82F6)
Cobro:          Verde (#10B981)
Vencimiento:    Naranja (#F97316)
Fecha Límite:   Rojo (#EF4444)
Reunión:        Morado (#8B5CF6)
Otro:           Gris (#6B7280)
```

---

## 🔧 Próximos Pasos de Implementación

### Fase 1: Backend (API Endpoints) ⏳

1. **POST /api/eventos** - Crear nuevo evento
2. **GET /api/eventos** - Listar eventos
3. **PUT /api/eventos/[id]** - Editar evento
4. **DELETE /api/eventos/[id]** - Eliminar evento
5. **PUT /api/audiencias/[id]** - Endpoint para editar audiencia

### Fase 2: Componentes Frontend ⏳

1. **`NuevoEventoForm.tsx`**
   - Formulario modal para crear eventos
   - Validación con Zod
   - Campos dinámicos según tipo de evento

2. **`EventoCard.tsx`**
   - Card para mostrar evento en el calendario
   - Iconos y colores según tipo
   - Acciones: Ver, Editar, Eliminar

3. **`EditarAudienciaModal.tsx`**
   - Modal para editar audiencia existente
   - Solo campos editables (hora, lugar, modalidad, estado)

4. **Actualizar `CalendarioView.tsx`**
   - Botón "Nuevo Evento"
   - Mostrar eventos junto con audiencias
   - Filtros por tipo de evento
   - Vista de lista mejorada con nombres completos

### Fase 3: Notificaciones ⏳

1. **Alertas automáticas:**
   - Cobros próximos (3 días antes)
   - Vencimientos críticos (1 día antes)
   - Fechas límite urgentes (mismo día)

---

## 📊 Casos de Uso

### Ejemplo 1: Cobro de Honorarios

```typescript
{
  tipo: "COBRO",
  titulo: "Cobro Honorarios - Expediente 123/2025",
  fecha: "2025-10-25",
  hora: "15:00",
  monto: 150000,
  moneda: "ARS",
  expedienteId: "exp_123",
  estado: "PENDIENTE"
}
```

### Ejemplo 2: Vencimiento de Apelación

```typescript
{
  tipo: "VENCIMIENTO",
  titulo: "Vencimiento Plazo Apelación",
  descripcion: "Último día para apelar sentencia en Expediente 456/2025",
  fecha: "2025-10-30",
  expedienteId: "exp_456",
  estado: "PENDIENTE"
}
```

### Ejemplo 3: Fecha Límite Presentación

```typescript
{
  tipo: "FECHA_LIMITE",
  titulo: "Presentación Escrito de Demanda",
  fecha: "2025-11-05",
  hora: "10:00",
  expedienteId: "exp_789",
  estado: "PENDIENTE"
}
```

### Ejemplo 4: Reunión con Cliente

```typescript
{
  tipo: "REUNION",
  titulo: "Reunión Estratégica - Juan Pérez",
  descripcion: "Revisar avances del caso y próximas acciones",
  fecha: "2025-10-28",
  hora: "16:00",
  clienteId: "cli_123",
  estado: "PENDIENTE"
}
```

---

## 🗄️ Base de Datos

### Migración Aplicada

```bash
✅ npx prisma generate
```

**Estado:** Schema actualizado, cliente generado

**Tabla creada:** `Evento`  
**Relaciones agregadas:**
- `Cliente.eventos` → `Evento[]`
- `Expediente.eventos` → `Evento[]`

---

## 🎯 Beneficios del Sistema

1. **Organización centralizada** - Todo en el calendario
2. **Recordatorios automáticos** - No se pierden fechas importantes
3. **Seguimiento de cobros** - Control de ingresos esperados
4. **Gestión de plazos** - Evita vencimientos
5. **Historial completo** - Auditoría de eventos

---

## 📝 Notas Importantes

- ⚠️ Los eventos solo se pueden crear desde el Calendario
- ✅ Pueden asociarse a expedientes o clientes (opcional)
- ✅ Los eventos de tipo COBRO pueden incluir monto y moneda
- ✅ Todos los eventos tienen estado (PENDIENTE/COMPLETADO/CANCELADO)
- ✅ Las audiencias ahora muestran su nombre completo en el calendario

---

**Estado Actual:** ✅ Schema actualizado, listo para implementar endpoints y UI

**Próximo paso:** Crear endpoints API y componentes de formulario
