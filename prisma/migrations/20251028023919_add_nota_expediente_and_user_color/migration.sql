-- AlterTable
ALTER TABLE "Expediente" ADD COLUMN "numeroCarpeta" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "color" TEXT;

-- CreateTable
CREATE TABLE "NotaExpediente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "texto" TEXT NOT NULL,
    "editado" BOOLEAN NOT NULL DEFAULT false,
    "expedienteId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "archivoReferenciadoId" TEXT,
    "tareaReferenciadaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NotaExpediente_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "Expediente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NotaExpediente_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NotaExpediente_archivoReferenciadoId_fkey" FOREIGN KEY ("archivoReferenciadoId") REFERENCES "Documento" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "NotaExpediente_tareaReferenciadaId_fkey" FOREIGN KEY ("tareaReferenciadaId") REFERENCES "Tarea" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tarea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'PROCESAL',
    "prioridad" TEXT NOT NULL DEFAULT 'MEDIA',
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "fechaVencimiento" DATETIME NOT NULL,
    "fechaCompletado" DATETIME,
    "expedienteId" TEXT NOT NULL,
    "asignadoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tarea_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "Expediente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tarea_asignadoId_fkey" FOREIGN KEY ("asignadoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tarea" ("asignadoId", "createdAt", "descripcion", "estado", "expedienteId", "fechaCompletado", "fechaVencimiento", "id", "prioridad", "titulo", "updatedAt") SELECT "asignadoId", "createdAt", "descripcion", "estado", "expedienteId", "fechaCompletado", "fechaVencimiento", "id", "prioridad", "titulo", "updatedAt" FROM "Tarea";
DROP TABLE "Tarea";
ALTER TABLE "new_Tarea" RENAME TO "Tarea";
CREATE INDEX "Tarea_fechaVencimiento_idx" ON "Tarea"("fechaVencimiento");
CREATE INDEX "Tarea_estado_idx" ON "Tarea"("estado");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "NotaExpediente_expedienteId_idx" ON "NotaExpediente"("expedienteId");

-- CreateIndex
CREATE INDEX "NotaExpediente_autorId_idx" ON "NotaExpediente"("autorId");

-- CreateIndex
CREATE INDEX "NotaExpediente_createdAt_idx" ON "NotaExpediente"("createdAt");
