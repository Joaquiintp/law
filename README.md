# ERP Jurídico - Sistema de Gestión para Estudios Legales

Un sistema completo de gestión (ERP) diseñado específicamente para estudios jurídicos, desarrollado con Next.js 15, TypeScript, Prisma y PostgreSQL.

## 🚀 Características Principales

### 1. **Gestión de Expedientes y Casos**
- Alta, seguimiento y cierre de expedientes
- Indexación automática de documentos judiciales
- Búsqueda avanzada por cliente, fuero, materia, juzgado, fechas
- Estados de expedientes (Activo, Suspendido, Cerrado, Archivado)

### 2. **Agenda y Calendario**
- Calendario compartido con audiencias y vencimientos
- Alertas automáticas por proximidad de plazos
- Gestión de audiencias (presenciales, virtuales, mixtas)
- Seguimiento de tareas y deadlines

### 3. **Gestión Documental**
- Repositorio centralizado de documentos
- Versionado de escritos y contratos
- Plantillas inteligentes con autocompletado
- Categorización por tipo de documento jurídico

### 4. **CRM Jurídico**
- Gestión completa de clientes (personas físicas y jurídicas)
- Historial de casos por cliente
- Portal de clientes para acceso 24/7
- Seguimiento de consultas y comunicaciones

### 5. **Facturación y Finanzas**
- Registro de honorarios, gastos y cobros
- Emisión de facturas (integración AFIP preparada)
- Reportes de rentabilidad por cliente/área
- Control de estados de pagos

### 6. **Panel de Control (Dashboard)**
- KPIs en tiempo real: casos activos, resueltos, tiempos de resolución
- Estadísticas financieras y de productividad
- Tareas urgentes y próximos vencimientos
- Actividad reciente del estudio

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Autenticación**: NextAuth.js
- **Validación**: Zod
- **Íconos**: Lucide React

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL 12+
- npm/yarn/pnpm

## 🚀 Instalación y Configuración

1. **Clona el repositorio**
```bash
git clone <repository-url>
cd juridico-erp
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Configura las variables de entorno**
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/juridico_erp"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-super-secret-key"
```

4. **Configura la base de datos**
```bash
# Ejecutar migraciones
npx prisma migrate dev

# Generar el cliente de Prisma
npx prisma generate

# Poblar con datos de prueba
npm run db:seed
```

5. **Inicia el servidor de desarrollo**
```bash
npm run dev
```

6. **Accede a la aplicación**
Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## 🔐 Credenciales de Demo

**Administrador**
- Email: `admin@juridico.com`
- Contraseña: `admin123`

**Abogado**
- Email: `jrodriguez@juridico.com` 
- Contraseña: `admin123`

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── auth/              # Páginas de autenticación
│   ├── api/               # API Routes
│   └── (dashboard)/       # Páginas principales del dashboard
├── components/            # Componentes reutilizables
│   ├── ui/                # Componentes de UI (shadcn)
│   └── ...                # Componentes específicos
├── lib/                   # Utilidades y configuraciones
│   ├── auth.ts           # Configuración NextAuth
│   ├── prisma.ts         # Cliente Prisma
│   └── utils.ts          # Utilidades generales
└── types/                # Definiciones de tipos TypeScript

prisma/
├── schema.prisma         # Esquema de base de datos
├── seed.ts              # Datos de prueba
└── migrations/          # Migraciones de base de datos
```

## 🎯 Funcionalidades Implementadas

- [x] Autenticación y autorización
- [x] Dashboard principal con estadísticas
- [x] Modelo de datos completo (Prisma)
- [x] Gestión de usuarios y roles
- [x] Estructura base de expedientes
- [x] Gestión de clientes
- [x] Sistema de audiencias
- [x] Control de tareas y vencimientos
- [x] Gestión de honorarios
- [x] Sistema de facturación

## 🚧 Próximas Funcionalidades

- [ ] CRUD completo de expedientes
- [ ] Gestión avanzada de documentos
- [ ] Calendario interactivo
- [ ] Portal de clientes
- [ ] Integración con AFIP
- [ ] Sistema de notificaciones
- [ ] Reportes avanzados
- [ ] Integración con IA para generación de documentos
- [ ] API para integraciones externas

## 🗄️ Base de Datos

El sistema utiliza un esquema robusto que incluye:

- **Usuarios** (roles: Admin, Socio, Abogado, Secretario, Cliente)
- **Clientes** (personas físicas y jurídicas)
- **Expedientes** (con fueros, materias, estados)
- **Documentos** (con versionado y metadatos)
- **Audiencias** (presenciales/virtuales)
- **Tareas** (con prioridades y vencimientos)
- **Honorarios** y **Facturas**
- **Log de Actividades** (auditoría)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@juridico-erp.com
- Documentación: [docs.juridico-erp.com](https://docs.juridico-erp.com)

---

**Desarrollado con ❤️ para la comunidad jurídica**
