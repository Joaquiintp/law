/*
  Warnings:

  - You are about to drop the column `apellido` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Cliente` table. All the data in the column will be lost.
  - Added the required column `estudioId` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Made the column `razonSocial` on table `Cliente` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `estudioId` to the `Expediente` table without a default value. This is not possible if the table is not empty.

*/

-- Paso 1: Actualizar razonSocial NULL concatenando nombre + apellido en Cliente ANTES de la migración
UPDATE "Cliente" 
SET "razonSocial" = COALESCE("nombre", '') || ' ' || COALESCE("apellido", '')
WHERE "razonSocial" IS NULL OR "razonSocial" = '';

-- Paso 2: Asegurar que razonSocial no esté vacío
UPDATE "Cliente"
SET "razonSocial" = 'Sin Nombre'
WHERE "razonSocial" IS NULL OR TRIM("razonSocial") = '';

-- CreateTable
CREATE TABLE "Estudio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "razonSocial" TEXT,
    "cuit" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "provincia" TEXT,
    "codigoPostal" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaAlta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaBaja" DATETIME,
    "paquete" TEXT NOT NULL DEFAULT 'BASE',
    "fechaVencimiento" DATETIME,
    "almacenamientoGB" INTEGER NOT NULL DEFAULT 5,
    "almacenamientoExtra" INTEGER NOT NULL DEFAULT 0,
    "almacenamientoUsadoMB" INTEGER NOT NULL DEFAULT 0,
    "iaLegalActivo" BOOLEAN NOT NULL DEFAULT false,
    "iaLegalTipo" TEXT,
    "iaLegalFechaActivacion" DATETIME,
    "iaLegalFechaVencimiento" DATETIME,
    "iaLegalMaxConsultas" INTEGER NOT NULL DEFAULT 0,
    "iaLegalConsultasUsadas" INTEGER NOT NULL DEFAULT 0,
    "maxUsuarios" INTEGER NOT NULL DEFAULT 5,
    "usuariosActivos" INTEGER NOT NULL DEFAULT 0,
    "gestionExpedientes" BOOLEAN NOT NULL DEFAULT true,
    "gestionClientes" BOOLEAN NOT NULL DEFAULT true,
    "generacionPDF" BOOLEAN NOT NULL DEFAULT true,
    "agendaProcesal" BOOLEAN NOT NULL DEFAULT true,
    "portalCliente" BOOLEAN NOT NULL DEFAULT true,
    "rolesUsuario" BOOLEAN NOT NULL DEFAULT true,
    "whatsappAPI" BOOLEAN NOT NULL DEFAULT false,
    "emailAPI" BOOLEAN NOT NULL DEFAULT false,
    "plantillasInteligentes" BOOLEAN NOT NULL DEFAULT false,
    "portalClienteAvanzado" BOOLEAN NOT NULL DEFAULT false,
    "agendaIntegrada" BOOLEAN NOT NULL DEFAULT false,
    "facturacionElectronica" BOOLEAN NOT NULL DEFAULT false,
    "firmaDigital" BOOLEAN NOT NULL DEFAULT false,
    "dashboardFinanzas" BOOLEAN NOT NULL DEFAULT false,
    "automatizacionCompleta" BOOLEAN NOT NULL DEFAULT false,
    "integracionJudicial" BOOLEAN NOT NULL DEFAULT false,
    "reportesBI" BOOLEAN NOT NULL DEFAULT false,
    "multiSede" BOOLEAN NOT NULL DEFAULT false,
    "seguridadAvanzada" BOOLEAN NOT NULL DEFAULT false,
    "personalizacionWorkflows" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LogIA" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estudioId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "accion" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "tokensUsados" INTEGER NOT NULL DEFAULT 0,
    "costo" REAL NOT NULL DEFAULT 0,
    "duracionMs" INTEGER,
    "documentoId" TEXT,
    "expedienteId" TEXT,
    "metadata" TEXT,
    "exitoso" BOOLEAN NOT NULL DEFAULT true,
    "errorMensaje" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear estudio por defecto para migración de datos existentes
INSERT INTO "Estudio" (
    "id", 
    "nombre", 
    "paquete",
    "iaLegalActivo",
    "createdAt",
    "updatedAt"
) VALUES (
    'estudio-default-001',
    'Estudio por Defecto',
    'PRO',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "razonSocial" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "documento" TEXT NOT NULL DEFAULT '',
    "tipoDocumento" TEXT NOT NULL DEFAULT 'DNI',
    "estudioId" TEXT NOT NULL,
    "tipoPersona" TEXT NOT NULL DEFAULT 'FISICA',
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "direccion" TEXT,
    "cuitCuil" TEXT,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cbu" TEXT,
    "banco" TEXT,
    "domicilio" TEXT,
    "fechaNacimiento" DATETIME,
    "cuit" TEXT,
    "condicionIva" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cliente_estudioId_fkey" FOREIGN KEY ("estudioId") REFERENCES "Estudio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Cliente" ("banco", "cbu", "condicionIva", "createdAt", "cuit", "cuitCuil", "direccion", "documento", "domicilio", "email", "estado", "estudioId", "fechaCreacion", "fechaNacimiento", "id", "razonSocial", "telefono", "tipoDocumento", "tipoPersona", "updatedAt") SELECT "banco", "cbu", "condicionIva", "createdAt", "cuit", "cuitCuil", "direccion", "documento", "domicilio", "email", "estado", 'estudio-default-001', "fechaCreacion", "fechaNacimiento", "id", COALESCE("razonSocial", 'Sin Nombre'), "telefono", "tipoDocumento", "tipoPersona", "updatedAt" FROM "Cliente";
DROP TABLE "Cliente";
ALTER TABLE "new_Cliente" RENAME TO "Cliente";
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");
CREATE UNIQUE INDEX "Cliente_documento_key" ON "Cliente"("documento");
CREATE UNIQUE INDEX "Cliente_cuitCuil_key" ON "Cliente"("cuitCuil");
CREATE UNIQUE INDEX "Cliente_cuit_key" ON "Cliente"("cuit");
CREATE INDEX "Cliente_documento_idx" ON "Cliente"("documento");
CREATE INDEX "Cliente_email_idx" ON "Cliente"("email");
CREATE INDEX "Cliente_cuitCuil_idx" ON "Cliente"("cuitCuil");
CREATE INDEX "Cliente_estudioId_idx" ON "Cliente"("estudioId");
CREATE TABLE "new_Expediente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "caratula" TEXT NOT NULL,
    "fuero" TEXT NOT NULL,
    "materia" TEXT NOT NULL,
    "juzgado" TEXT,
    "secretaria" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "estudioId" TEXT NOT NULL,
    "fechaInicio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" DATETIME,
    "fechaProximaAudiencia" DATETIME,
    "descripcion" TEXT,
    "observaciones" TEXT,
    "clienteId" TEXT NOT NULL,
    "responsableId" TEXT NOT NULL,
    "creadorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Expediente_estudioId_fkey" FOREIGN KEY ("estudioId") REFERENCES "Estudio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Expediente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Expediente_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Expediente_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Expediente" ("caratula", "clienteId", "creadorId", "createdAt", "descripcion", "estado", "estudioId", "fechaCierre", "fechaInicio", "fechaProximaAudiencia", "fuero", "id", "juzgado", "materia", "numero", "observaciones", "responsableId", "secretaria", "updatedAt") SELECT "caratula", "clienteId", "creadorId", "createdAt", "descripcion", "estado", 'estudio-default-001', "fechaCierre", "fechaInicio", "fechaProximaAudiencia", "fuero", "id", "juzgado", "materia", "numero", "observaciones", "responsableId", "secretaria", "updatedAt" FROM "Expediente";
DROP TABLE "Expediente";
ALTER TABLE "new_Expediente" RENAME TO "Expediente";
CREATE UNIQUE INDEX "Expediente_numero_key" ON "Expediente"("numero");
CREATE INDEX "Expediente_numero_idx" ON "Expediente"("numero");
CREATE INDEX "Expediente_estado_idx" ON "Expediente"("estado");
CREATE INDEX "Expediente_fuero_idx" ON "Expediente"("fuero");
CREATE INDEX "Expediente_estudioId_idx" ON "Expediente"("estudioId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ABOGADO',
    "estudioId" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_estudioId_fkey" FOREIGN KEY ("estudioId") REFERENCES "Estudio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_User" ("activo", "createdAt", "email", "emailVerified", "estudioId", "id", "image", "name", "password", "role", "updatedAt") SELECT true, "createdAt", "email", "emailVerified", 'estudio-default-001', "id", "image", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_estudioId_idx" ON "User"("estudioId");
CREATE INDEX "User_email_idx" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Estudio_cuit_key" ON "Estudio"("cuit");

-- CreateIndex
CREATE INDEX "Estudio_activo_idx" ON "Estudio"("activo");

-- CreateIndex
CREATE INDEX "Estudio_paquete_idx" ON "Estudio"("paquete");

-- CreateIndex
CREATE INDEX "Estudio_iaLegalActivo_idx" ON "Estudio"("iaLegalActivo");

-- CreateIndex
CREATE INDEX "LogIA_estudioId_idx" ON "LogIA"("estudioId");

-- CreateIndex
CREATE INDEX "LogIA_usuarioId_idx" ON "LogIA"("usuarioId");

-- CreateIndex
CREATE INDEX "LogIA_createdAt_idx" ON "LogIA"("createdAt");

-- CreateIndex
CREATE INDEX "LogIA_accion_idx" ON "LogIA"("accion");
