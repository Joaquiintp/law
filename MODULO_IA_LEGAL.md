# 🤖 Módulo IA Legal - Documentación Completa

## 📋 Descripción

El módulo de IA Legal es un Add-on premium para XenovaLaw ERP que utiliza OpenAI GPT-4o y GPT-4o-mini para automatizar tareas legales complejas.

## ✅ Funcionalidades Implementadas

### 1. **Resumir Documentos Legales**
- **Endpoint:** `POST /api/ia-legal/resumir`
- **Descripción:** Analiza documentos PDF, DOCX o TXT y extrae información estructurada
- **Tipos soportados:**
  - Sentencias judiciales
  - Demandas
  - Contratos
  - Documentos generales
- **Detección automática** de tipo de documento
- **Extracción estructurada:** partes, hechos, fundamentos, resolución, plazos, etc.

**Ejemplo de uso:**
```typescript
const formData = new FormData()
formData.append('file', archivo)
formData.append('tipo', 'sentencia') // opcional

const response = await fetch('/api/ia-legal/resumir', {
  method: 'POST',
  body: formData
})

const data = await response.json()
// data.resumen contiene la información estructurada
```

---

### 2. **Clasificar Expedientes**
- **Endpoint:** `POST /api/ia-legal/clasificar`
- **Descripción:** Clasifica automáticamente expedientes con IA
- **Detecta:**
  - Materia y fuero correctos
  - Urgencia (BAJA, MEDIA, ALTA, URGENTE)
  - Complejidad (SIMPLE, MODERADA, COMPLEJA, MUY_COMPLEJA)
  - Probabilidad de éxito (0-100%)
  - Tags recomendados
  - Riesgos identificados
  - Acciones recomendadas
  - Monto y duración estimada

**Ejemplo de uso:**
```typescript
const response = await fetch('/api/ia-legal/clasificar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ expedienteId: 'exp-123' })
})

const data = await response.json()
// data.clasificacion contiene el análisis completo
```

---

### 3. **Generar Escritos Judiciales**
- **Endpoint:** `POST /api/ia-legal/generar-escrito`
- **Descripción:** Genera escritos legales profesionales con IA
- **Tipos de escritos:**
  - Demanda
  - Contestación de demanda
  - Recurso de apelación
  - Escrito de prueba
  - Alegatos
  - Otros escritos judiciales

**Ejemplo de uso:**
```typescript
const response = await fetch('/api/ia-legal/generar-escrito', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tipo: 'demanda',
    expedienteId: 'exp-123', // opcional
    datos: {
      actor: 'Juan Pérez',
      demandado: 'Empresa SA',
      hechos: 'Descripción de los hechos...',
      petitorio: 'Se condene al demandado...',
      monto: 500000
    }
  })
})

const data = await response.json()
// data.escrito contiene el texto generado
```

---

### 4. **Buscar Jurisprudencia**
- **Endpoint:** `POST /api/ia-legal/buscar-jurisprudencia`
- **Descripción:** Busca y analiza jurisprudencia relevante
- **Proporciona:**
  - Normas aplicables con artículos relevantes
  - Jurisprudencia relevante (casos, tribunales, doctrinas)
  - Argumentos legales fundamentados
  - Estrategia recomendada
  - Riesgos y recomendaciones
  - Búsquedas sugeridas para profundizar

**Ejemplo de uso:**
```typescript
const response = await fetch('/api/ia-legal/buscar-jurisprudencia', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    consulta: 'Despido sin causa en período de prueba',
    materia: 'LABORAL',
    jurisdiccion: 'Argentina'
  })
})

const data = await response.json()
// data.analisis contiene el análisis completo
```

---

## 🔧 Configuración

### 1. Instalar Dependencias
```bash
npm install openai pdf-parse mammoth
```

### 2. Configurar API Key de OpenAI

Edita el archivo `.env`:
```env
OPENAI_API_KEY="sk-tu-api-key-aqui"
```

Obtén tu API key en: https://platform.openai.com/api-keys

### 3. Aplicar Migraciones
```bash
npx prisma migrate dev
```

### 4. Activar Add-on en Estudio

En el Admin Panel, activa el Add-on "IA Legal" para el estudio:
- Tipo FIJO: X consultas por mes
- Tipo CONSUMO: Pago por uso

---

## 📊 Control de Cuotas

El sistema implementa control automático de cuotas:

### Tipo FIJO
- Límite mensual de consultas configurado por estudio
- Se verifica antes de cada operación
- Error 429 si se agota la cuota
- Contador se resetea mensualmente (manual o automático)

### Tipo CONSUMO
- Sin límite de consultas
- Facturación según uso real
- Tracking de costos en tabla `LogIA`

---

## 💾 Logging y Auditoría

Todas las operaciones de IA se registran en la tabla `LogIA`:

```prisma
model LogIA {
  id          String   @id @default(cuid())
  estudioId   String
  usuarioId   String?
  
  accion      String   // "resumir", "clasificar", "generar", "buscar"
  modelo      String   // "gpt-4o", "gpt-4o-mini"
  tokensUsados Int     @default(0)
  costo       Float    @default(0) // USD
  duracionMs  Int?
  
  documentoId String?
  expedienteId String?
  metadata    String?  // JSON
  
  exitoso     Boolean  @default(true)
  errorMensaje String?
  
  createdAt   DateTime @default(now())
}
```

---

## 💰 Costos Estimados

### GPT-4o (modelos avanzados)
- **Input:** $5.00 / 1M tokens
- **Output:** $15.00 / 1M tokens
- **Uso típico:**
  - Resumir documento: 2,000-5,000 tokens → $0.01-$0.05
  - Generar escrito: 3,000-8,000 tokens → $0.03-$0.10
  - Buscar jurisprudencia: 2,000-6,000 tokens → $0.02-$0.08

### GPT-4o-mini (tareas simples)
- **Input:** $0.15 / 1M tokens
- **Output:** $0.60 / 1M tokens
- **Uso típico:**
  - Clasificar expediente: 1,000-3,000 tokens → $0.001-$0.005

---

## 🎨 Componentes UI

### ResumidorDocumentos
```tsx
import ResumidorDocumentos from '@/components/ia-legal/ResumidorDocumentos'

<ResumidorDocumentos />
```

### ClasificadorExpedientes
```tsx
import ClasificadorExpedientes from '@/components/ia-legal/ClasificadorExpedientes'

<ClasificadorExpedientes 
  expedienteId="exp-123"
  expedienteNumero="12345/2024"
  expedienteCaratula="Pérez c/ Empresa SA"
  onClasificacionComplete={(resultado) => {
    console.log('Clasificación:', resultado)
  }}
/>
```

---

## 🔒 Seguridad y Permisos

- ✅ Autenticación requerida (NextAuth)
- ✅ Verificación de Add-on activo
- ✅ Multi-tenant (filtrado por estudioId)
- ✅ Control de cuotas automático
- ✅ Logging completo de operaciones
- ✅ Validación de tipos de archivo (resumir)
- ✅ Límite de tamaño (10MB para documentos)

---

## 📈 Monitoreo y Métricas

Consultas útiles para monitorear el uso:

```sql
-- Total de consultas por estudio (mes actual)
SELECT estudioId, COUNT(*) as consultas, SUM(costo) as costoTotal
FROM LogIA
WHERE createdAt >= date('now', 'start of month')
GROUP BY estudioId;

-- Consultas por acción
SELECT accion, COUNT(*) as cantidad, AVG(tokensUsados) as tokensPromedio
FROM LogIA
WHERE exitoso = true
GROUP BY accion;

-- Consultas fallidas
SELECT * FROM LogIA
WHERE exitoso = false
ORDER BY createdAt DESC
LIMIT 10;
```

---

## 🚀 Roadmap (Fase 3)

- [ ] **Análisis de Riesgo de Casos**
- [ ] **Chat IA Contextual** (con memoria de conversación)
- [ ] **Búsqueda Semántica** en documentos propios
- [ ] **Traducción de Documentos**
- [ ] **Generación de Informes Automáticos**
- [ ] **Integración con bases de datos jurisprudenciales externas**
- [ ] **Dashboard de Analytics de IA**

---

## 🐛 Troubleshooting

### Error: "Add-on IA Legal no está activo"
**Solución:** Ir al Admin Panel y activar el Add-on para el estudio.

### Error: "Cuota de consultas IA agotada"
**Solución:** 
- Tipo FIJO: Esperar al próximo mes o aumentar límite en Admin Panel
- Tipo CONSUMO: Verificar configuración de facturación

### Error: "Error al procesar con IA"
**Posibles causas:**
- API Key de OpenAI inválida o sin crédito
- Rate limit excedido de OpenAI
- Documento demasiado grande (>10MB)
- Formato de archivo no soportado

**Solución:** Verificar logs en tabla `LogIA` (campo `errorMensaje`)

---

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@xenovalaw.com
- Documentación: https://docs.xenovalaw.com
- GitHub Issues: https://github.com/xenovalaw/erp-juridico

---

**Última actualización:** 22 de octubre de 2025
**Versión:** 1.0.0
