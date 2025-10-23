-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha" DATETIME NOT NULL,
    "hora" TEXT,
    "tipo" TEXT NOT NULL,
    "monto" REAL,
    "moneda" TEXT DEFAULT 'ARS',
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "expedienteId" TEXT,
    "clienteId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Evento_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "Expediente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Evento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Evento_fecha_idx" ON "Evento"("fecha");

-- CreateIndex
CREATE INDEX "Evento_tipo_idx" ON "Evento"("tipo");

-- CreateIndex
CREATE INDEX "Evento_estado_idx" ON "Evento"("estado");
