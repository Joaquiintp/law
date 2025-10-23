# 🚀 Guía Rápida - Sistema de Tareas Persistentes

## ✅ Configuración Completada

El sistema ya está configurado con:
- ✅ Base de datos inicializada
- ✅ Datos de prueba cargados
- ✅ API de tareas funcionando
- ✅ Persistencia en base de datos

## 📝 Cómo Usar el Sistema

### 1️⃣ Iniciar Sesión

Para acceder al sistema, necesitas iniciar sesión primero.

**Credenciales de prueba:**

```
👑 ADMINISTRADOR (acceso completo + Add-ons de IA):
Email: admin@juridico.com
Contraseña: admin123

👨‍⚖️ ABOGADO:
Email: juan@juridico.com
Contraseña: admin123

👩‍⚖️ ABOGADO:
Email: maria@juridico.com
Contraseña: admin123
```

> **💡 Nota:** Solo el usuario **ADMIN** puede activar los add-ons de IA en la configuración del sistema.

### 2️⃣ Acceder a Expedientes

1. Ve a la sección "Expedientes" en el menú
2. Verás el expediente de prueba: **EXP-2025-001**
3. Haz click en el expediente para ver los detalles

### 3️⃣ Ver y Gestionar Tareas

Dentro del expediente, encontrarás:

**📋 3 Tareas de Ejemplo:**
1. ✅ **HECHO** (Verde) - "Reunión con cliente" (completada)
2. 🔴 **IMPORTANTE** (Rojo) - "Preparar escrito de demanda" (vence en 3 días)
3. 🟠 **PENDIENTE** (Naranja) - "Revisar documentación del cliente" (vence en 7 días)

**Acciones Disponibles:**
- ✏️ **Crear nueva tarea** - Click en "Nueva Tarea"
- 🔄 **Cambiar estado** - Click en el badge de color de cada tarea (cicla: PENDIENTE → IMPORTANTE → HECHO)
- 🗑️ **Eliminar tarea** - Usa el botón de eliminar
- 👁️ **Ver detalles** - Click en la fila de la tarea

### 4️⃣ Crear una Nueva Tarea

1. Click en botón **"Nueva Tarea"**
2. Selecciona el tipo: Procesal / Extra-procesal / Auditoría
3. Completa el formulario:
   - **Acción/Descripción** (requerido)
   - **Responsable** (requerido) - Selecciona de la lista
   - **Fecha de inicio**
   - **Marcar en calendario** (opcional) - Para tareas con fecha límite
   - **Observaciones** (opcional)
4. Click en **"Crear Tarea"**
5. ✅ La tarea se guardará en la base de datos

### 5️⃣ Persistencia de Datos

✨ **¡Las tareas ahora persisten!**

- ✅ Crear → Se guarda en la BD
- ✅ Cambiar estado → Se actualiza en la BD
- ✅ Eliminar → Se borra de la BD
- ✅ Recargar página → Las tareas permanecen

## 🎨 Sistema de Colores por Estado

| Estado | Color | Descripción |
|--------|-------|-------------|
| 🟢 HECHO | Verde | Tarea completada |
| 🟠 PENDIENTE | Naranja | Tarea por hacer |
| 🔴 IMPORTANTE | Rojo | Tarea prioritaria/urgente |

**Todo el renglón se colorea** según el estado para fácil identificación visual.

## 🔧 Solución de Problemas

### Error: "Error al cargar tareas"

**Causa:** No has iniciado sesión.

**Solución:**
1. Ve a `/auth/signin`
2. Inicia sesión con las credenciales de prueba
3. Vuelve a la sección de expedientes

### Las tareas no aparecen

**Verifica:**
1. ✅ Estás logueado
2. ✅ Estás en el expediente correcto (EXP-2025-001)
3. ✅ La consola del navegador muestra logs: 
   - `🔍 Cargando tareas para expediente: [id]`
   - `✅ Tareas cargadas: 3`

### Puedo crear tareas pero no aparecen

**Problema:** Los usuarios simulados no coinciden con los de la BD.

**Solución:**
El sistema ahora usa la API y usuarios reales de la base de datos:
- Dr. Juan Pérez (juan@juridico.com)
- Dra. María González (maria@juridico.com)

## 🎯 Flujo Completo

```
1. Iniciar sesión (juan@juridico.com / admin123)
   ↓
2. Ir a Expedientes → EXP-2025-001
   ↓
3. Ver 3 tareas existentes (cargadas desde BD)
   ↓
4. Crear nueva tarea
   ↓
5. Tarea se guarda en BD
   ↓
6. Cambiar estado (click en badge)
   ↓
7. Estado se actualiza en BD
   ↓
8. Recargar página
   ↓
9. ✅ Todas las tareas persisten
```

## 📊 Estructura de la BD

```
Estudio
  └── Usuarios (Abogados)
       └── Expedientes
            └── Tareas
                 ├── HECHO
                 ├── PENDIENTE
                 └── IMPORTANTE
```

## 🚨 Importante

- 🔒 Todas las operaciones requieren autenticación
- 🏢 Las tareas están asociadas a un estudio (multi-tenant)
- 👤 Cada tarea tiene un usuario asignado
- 📅 Fecha de vencimiento obligatoria
- ✅ Estado de completado se marca automáticamente

## 🎉 ¡Listo para Usar!

El sistema está completamente funcional. Las tareas ahora se guardan permanentemente y puedes probar todas las funcionalidades sin perder datos al recargar.

**Accede a:** `http://localhost:3005`

**Inicia sesión con:**
- 👑 **ADMIN:** `admin@juridico.com` / `admin123` (para activar add-ons de IA)
- 👨‍⚖️ **ABOGADO:** `juan@juridico.com` / `admin123`
- 👩‍⚖️ **ABOGADO:** `maria@juridico.com` / `admin123`
