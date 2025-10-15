# APIs Pendientes para Backend

## 🏢 Estudios (Multi-tenant)
- `POST /api/estudios` - Crear nuevo estudio
- `GET /api/estudios` - Listar todos los estudios (solo ADMIN)
- `GET /api/estudios/:id` - Obtener estudio específico
- `PUT /api/estudios/:id` - Actualizar estudio
- `DELETE /api/estudios/:id` - Eliminar estudio (soft delete)
- `PATCH /api/estudios/:id/toggle-active` - Activar/desactivar estudio

## 👥 Usuarios
- `POST /api/usuarios` - Crear nuevo usuario
- `GET /api/usuarios` - Listar usuarios (filtrado por estudio para no-admin)
- `GET /api/usuarios?activos=true` - **[REQUERIDO PARA TAREAS]** Listar usuarios activos del estudio (staff) para asignar tareas
- `GET /api/usuarios/:id` - Obtener usuario específico
- `PUT /api/usuarios/:id` - Actualizar usuario
- `PATCH /api/usuarios/:id/toggle-active` - Activar/desactivar usuario
- `PATCH /api/usuarios/:id/change-password` - Cambiar contraseña

## 🤖 IA Legal (Módulo Premium)
- `POST /api/ia-legal/activate` - Activar módulo IA para un estudio (solo ADMIN)
- `PUT /api/ia-legal/:estudioId/config` - Actualizar configuración de IA
- `GET /api/ia-legal/:estudioId/status` - Verificar estado de activación
- `GET /api/ia-legal/:estudioId/usage` - Obtener uso de consultas del mes
- `POST /api/ia-legal/consulta` - Realizar consulta al asistente IA (verifica límites)

## 📄 Expedientes
- `POST /api/expedientes` - Crear expediente (con estudioId del usuario)
- `GET /api/expedientes` - Listar expedientes del estudio
- `GET /api/expedientes?search={query}` - **[REQUERIDO PARA BUSCADOR]** Buscar expedientes por número, carátula o cliente
- `GET /api/expedientes/:id` - Obtener expediente específico
- `PUT /api/expedientes/:id` - Actualizar expediente
- `DELETE /api/expedientes/:id` - Archivar expediente

## ✅ Tareas
- `POST /api/expedientes/:id/tareas` - Crear tarea en expediente
- `GET /api/expedientes/:id/tareas` - Listar tareas de expediente
- `PUT /api/tareas/:id` - Actualizar tarea
- `DELETE /api/tareas/:id` - Eliminar tarea
- `POST /api/tareas/:id/observaciones` - Agregar observación
- `PUT /api/tareas/:tareaId/observaciones/:obsId` - Editar observación
- `DELETE /api/tareas/:tareaId/observaciones/:obsId` - Eliminar observación

## 👤 Clientes
- `POST /api/clientes` - Crear cliente
- `GET /api/clientes` - Listar clientes del estudio
- `GET /api/clientes?search={query}&limit={n}` - **[REQUERIDO PARA BUSCADOR]** Buscar clientes por razón social con límite
- `GET /api/clientes/:id` - Obtener cliente específico
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

## 📅 Audiencias/Calendario
- `POST /api/audiencias` - Crear audiencia
- `GET /api/audiencias` - Listar audiencias del estudio
- `GET /api/audiencias/:id` - Obtener audiencia específica
- `PUT /api/audiencias/:id` - Actualizar audiencia
- `DELETE /api/audiencias/:id` - Eliminar audiencia

## 📁 Documentos
- `POST /api/documentos/upload` - Subir documento
- `GET /api/documentos` - Listar documentos del estudio
- `GET /api/documentos/:id` - Obtener documento específico
- `GET /api/documentos/:id/download` - Descargar documento
- `PUT /api/documentos/:id` - Actualizar metadatos
- `DELETE /api/documentos/:id` - Eliminar documento

## 💰 Facturación
- `POST /api/facturacion` - Crear factura
- `GET /api/facturacion` - Listar facturas del estudio
- `GET /api/facturacion/:id` - Obtener factura específica
- `PUT /api/facturacion/:id` - Actualizar factura
- `DELETE /api/facturacion/:id` - Anular factura

## 📊 Reportes
- `GET /api/reportes/dashboard` - Datos para dashboard principal
- `GET /api/reportes/expedientes` - Estadísticas de expedientes
- `GET /api/reportes/facturacion` - Estadísticas de facturación
- `GET /api/reportes/productividad` - Métricas de productividad

## 🔐 Autenticación (NextAuth)
- `POST /api/auth/signin` - Iniciar sesión
- `POST /api/auth/signout` - Cerrar sesión
- `GET /api/auth/session` - Obtener sesión actual

## 🔒 Middleware
- Verificar rol y permisos en cada request
- Filtrar datos por estudioId automáticamente
- Verificar activación de módulos premium
- Rate limiting para IA Legal según plan

## 📝 Notas Importantes
- Todos los endpoints (excepto /api/estudios y /api/usuarios para ADMIN) deben filtrar por estudioId
- Implementar soft deletes con campo `activo` o `deletedAt`
- Validar límites de usuarios por plan
- Verificar vencimiento de módulo IA antes de permitir consultas
- Incluir audit fields: createdAt, updatedAt, createdBy
