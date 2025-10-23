import OpenAI from 'openai'

// Cliente OpenAI global
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 segundos
  maxRetries: 2
})

// Prompts especializados por tipo de documento legal
export const PROMPTS_JURIDICOS = {
  sentencia: `Eres un asistente legal especializado en derecho argentino. Analiza la siguiente sentencia judicial y extrae la información estructurada en formato JSON:

Debes identificar y extraer:
1. "partes": { "actor": string, "demandado": string }
2. "hechos": array de strings con los hechos principales del caso
3. "fundamentos": array de strings con los fundamentos legales (artículos citados, jurisprudencia)
4. "resolucion": string con la resolución final del tribunal
5. "plazoApelacion": string con el plazo para apelar (si se menciona)
6. "costas": string indicando a quién se imponen las costas
7. "resumen": string con resumen ejecutivo en 2-3 oraciones

Formato: JSON válido. Si algún campo no está presente, usa null.`,

  demanda: `Eres un asistente legal especializado. Analiza la siguiente demanda judicial y extrae en formato JSON:

1. "partes": { "actor": string, "demandado": string, "patrocinante": string }
2. "hechos": array de strings con los hechos que motivan la demanda
3. "derechoInvocado": array de strings con artículos y normas citadas
4. "petitorio": array de strings con lo que se solicita al tribunal
5. "pruebas": array de strings con pruebas ofrecidas
6. "monto": { "valor": number, "moneda": string } si hay reclamo económico
7. "resumen": string con resumen ejecutivo

Formato: JSON válido. Si algún campo no está presente, usa null.`,

  contrato: `Eres un asistente legal especializado. Analiza el siguiente contrato y extrae en formato JSON:

1. "tipo": string con el tipo de contrato (ej: "compraventa", "locación", "servicios")
2. "partes": array de objetos { "nombre": string, "rol": string }
3. "objeto": string describiendo el objeto del contrato
4. "clausulasPrincipales": array de strings con las cláusulas más importantes
5. "vigencia": { "inicio": string, "fin": string, "renovacion": string }
6. "montos": array de objetos { "concepto": string, "valor": number, "moneda": string }
7. "clausulasRiesgo": array de strings con cláusulas que pueden generar conflicto
8. "rescision": string describiendo condiciones de rescisión
9. "resumen": string con resumen ejecutivo

Formato: JSON válido. Si algún campo no está presente, usa null.`,

  general: `Eres un asistente legal especializado. Analiza el siguiente documento legal y genera un resumen estructurado en formato JSON:

1. "tipoDocumento": string identificando qué tipo de documento es
2. "asunto": string describiendo de qué trata
3. "puntosClaves": array de strings con los puntos más importantes
4. "fechas": array de objetos { "tipo": string, "fecha": string } con fechas relevantes
5. "montosEconomicos": array de objetos { "concepto": string, "monto": number } si hay importes
6. "personasEntidades": array de strings con nombres de personas o entidades mencionadas
7. "accionesRequeridas": array de strings con acciones que se deben tomar
8. "resumen": string con resumen general en 2-3 oraciones

Formato: JSON válido. Si algún campo no está presente, usa null.`,

  // ===== PROMPTS PARA CLASIFICACIÓN DE EXPEDIENTES =====
  clasificacion: `Analiza el siguiente expediente judicial argentino y proporciona una clasificación detallada en formato JSON.

EXPEDIENTE:
- Número: {{numero}}
- Carátula: {{caratula}}
- Fuero Actual: {{fuero}}
- Materia Actual: {{materia}}
- Cliente: {{cliente}}
- Juzgado: {{juzgado}}
- Descripción: {{descripcion}}
- Documentos: {{documentos}}
- Tareas: {{tareas}}

Proporciona en formato JSON:
{
  "materiaCorrecta": "CIVIL_CONTRACTUAL | CIVIL_EXTRACONTRACTUAL | COMERCIAL | LABORAL | PENAL | FAMILIA_DIVORCIO | FAMILIA_ALIMENTOS | SUCESIONES | ADMINISTRATIVO | TRIBUTARIO | INMOBILIARIO",
  "fueroCorrect": "CIVIL | COMERCIAL | PENAL | LABORAL | FAMILIA | CONTENCIOSO_ADMINISTRATIVO | FEDERAL",
  "urgencia": "BAJA | MEDIA | ALTA | URGENTE",
  "complejidad": "SIMPLE | MODERADA | COMPLEJA | MUY_COMPLEJA",
  "probabilidadExito": number (0-100),
  "tagsRecomendados": ["tag1", "tag2", "tag3"],
  "riesgosIdentificados": ["riesgo1", "riesgo2"],
  "accionesRecomendadas": ["accion1", "accion2"],
  "montoEstimado": { "minimo": number, "maximo": number } | null,
  "duracionEstimada": "1-3 meses | 3-6 meses | 6-12 meses | más de 1 año",
  "razonamiento": "Explicación breve de la clasificación"
}`,

  // ===== PROMPTS PARA GENERACIÓN DE ESCRITOS JUDICIALES =====
  escritos: {
    demanda: `Redacta una demanda judicial argentina profesional con la siguiente información:

Actor: {{actor}}
Demandado: {{demandado}}
Fuero: {{fuero}}
Materia: {{materia}}
Hechos: {{hechos}}
Derecho invocado: {{derecho}}
Petitorio: {{petitorio}}
Monto reclamado: {{monto}}

La demanda debe incluir:
1. Encabezado formal con datos del tribunal
2. Objeto
3. Hechos (VISTOS)
4. Derecho (CONSIDERANDO)
5. Prueba que se ofrece
6. Petitorio
7. Cierre con firma del letrado

Usa un lenguaje jurídico formal argentino.`,

    contestacion: `Redacta una contestación de demanda profesional con:

Demandado: {{demandado}}
Expediente: {{expediente}}
Hechos de la demanda: {{hechosDemanda}}
Defensas: {{defensas}}
Excepciones: {{excepciones}}
Reconvención: {{reconvencion}}

Incluir:
1. Introducción
2. Contestación de hechos
3. Defensas y excepciones
4. Prueba ofrecida
5. Petitorio
6. Cierre`,

    recurso: `Redacta un {{tipoRecurso}} con:

Expediente: {{expediente}}
Resolución apelada: {{resolucionApelada}}
Agravios: {{agravios}}
Fundamentos: {{fundamentos}}

El recurso debe incluir estructura formal completa.`,

    escrito_prueba: `Redacta un escrito de ofrecimiento de prueba con:

Expediente: {{expediente}}
Pruebas documentales: {{pruebaDocumental}}
Prueba testimonial: {{pruebaTestimonial}}
Prueba pericial: {{pruebaPericial}}
Prueba informativa: {{pruebaInformativa}}

Incluir plazos y formalidades del CPCyC.`,

    alegatos: `Redacta alegatos finales para:

Expediente: {{expediente}}
Posición: {{posicion}}
Resumen de prueba rendida: {{pruebaRendida}}
Argumentación: {{argumentacion}}

Incluir análisis de prueba y conclusiones.`,

    otro: `Redacta un escrito judicial con:

Tipo: {{tipoEscrito}}
Contenido: {{contenido}}
Expediente: {{expediente}}

Usa formato formal argentino.`
  },

  // ===== PROMPT PARA BÚSQUEDA DE JURISPRUDENCIA =====
  jurisprudencia: `Eres un experto en derecho argentino especializado en investigación jurisprudencial. 

CONSULTA DEL USUARIO:
{{consulta}}

{{materia}}
{{jurisdiccion}}

Por favor proporciona en formato JSON:

{
  "resumen": "Resumen breve de la consulta y contexto legal",
  "normasAplicables": [
    {
      "norma": "Nombre de la norma",
      "articulos": ["Art. X", "Art. Y"],
      "relevancia": "Explicación de por qué es relevante"
    }
  ],
  "jurisprudenciaRelevante": [
    {
      "caratula": "Nombre del caso",
      "tribunal": "Tribunal que dictó la sentencia",
      "fecha": "Fecha aproximada o año",
      "tema": "Tema principal",
      "doctrina": "Doctrina legal establecida",
      "aplicabilidad": "Por qué es relevante para este caso"
    }
  ],
  "argumentosLegales": [
    "Argumento legal 1 fundamentado",
    "Argumento legal 2 fundamentado",
    "Argumento legal 3 fundamentado"
  ],
  "estrategiaRecomendada": "Estrategia legal sugerida basada en precedentes",
  "riesgos": [
    "Riesgo legal 1",
    "Riesgo legal 2"
  ],
  "recomendaciones": [
    "Recomendación procesal 1",
    "Recomendación procesal 2"
  ],
  "busquedasSugeridas": [
    "Término de búsqueda 1 para profundizar",
    "Término de búsqueda 2 para profundizar"
  ]
}

NOTA: Basa tu respuesta en el derecho argentino vigente y jurisprudencia conocida hasta tu fecha de corte. Si no tienes información específica sobre un caso, proporciona principios generales del derecho argentino aplicables.`
}

// Función helper para llamadas a OpenAI con manejo de errores
export async function llamarOpenAI(
  prompt: string,
  options: {
    modelo?: string
    temperatura?: number
    maxTokens?: number
    formatoJSON?: boolean
    systemPrompt?: string
  } = {}
) {
  const {
    modelo = 'gpt-4o',
    temperatura = 0.3,
    maxTokens = 2000,
    formatoJSON = false,
    systemPrompt = 'Eres un asistente legal experto en derecho argentino. Analiza documentos legales con precisión y genera información estructurada.'
  } = options

  try {
    const completion = await openai.chat.completions.create({
      model: modelo,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: temperatura,
      max_tokens: maxTokens,
      ...(formatoJSON && { response_format: { type: 'json_object' } })
    })

    return {
      contenido: completion.choices[0].message.content || '',
      tokens: completion.usage?.total_tokens || 0,
      costo: calcularCosto(completion.usage?.total_tokens || 0, modelo),
      modelo: completion.model
    }
  } catch (error: any) {
    console.error('Error OpenAI:', error)
    
    // Errores específicos de OpenAI
    if (error.code === 'insufficient_quota') {
      throw new Error('Cuota de OpenAI agotada. Contacte al administrador.')
    }
    if (error.code === 'rate_limit_exceeded') {
      throw new Error('Límite de velocidad excedido. Intente en unos momentos.')
    }
    if (error.code === 'invalid_api_key') {
      throw new Error('API Key de OpenAI inválida.')
    }
    
    throw new Error(`Error de IA: ${error.message}`)
  }
}

// Calcular costo aproximado según modelo y tokens
function calcularCosto(tokens: number, modelo: string): number {
  // Precios aproximados por 1M tokens (Oct 2024)
  const precios: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 5.00, output: 15.00 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4-turbo': { input: 10.00, output: 30.00 },
    'gpt-3.5-turbo': { input: 0.50, output: 1.50 }
  }

  const precio = precios[modelo] || precios['gpt-4o']
  // Asumimos 50/50 input/output
  const costoPor1000Tokens = ((precio.input + precio.output) / 2) / 1000
  return (tokens / 1000) * costoPor1000Tokens
}

// Extraer texto de documentos PDF/DOCX
export async function extraerTextoDocumento(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const mimeType = file.type

  try {
    // PDF
    if (mimeType === 'application/pdf') {
      const pdfParse = require('pdf-parse')
      const data = await pdfParse(Buffer.from(buffer))
      return data.text
    }

    // DOCX
    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const mammoth = require('mammoth')
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
      return result.value
    }

    // Texto plano
    if (mimeType === 'text/plain') {
      return new TextDecoder().decode(buffer)
    }

    throw new Error('Tipo de archivo no soportado. Use PDF, DOCX o TXT.')
  } catch (error: any) {
    console.error('Error extrayendo texto:', error)
    throw new Error(`Error procesando documento: ${error.message}`)
  }
}

// Detectar tipo de documento automáticamente
export function detectarTipoDocumento(texto: string): 'sentencia' | 'demanda' | 'contrato' | 'general' {
  const textoLower = texto.toLowerCase()

  // Palabras clave para sentencia
  if (
    textoLower.includes('falla') ||
    textoLower.includes('sentencia') ||
    textoLower.includes('resuelve') ||
    (textoLower.includes('vistos') && textoLower.includes('considerando'))
  ) {
    return 'sentencia'
  }

  // Palabras clave para demanda
  if (
    textoLower.includes('demanda') ||
    textoLower.includes('actor') ||
    textoLower.includes('promover') ||
    textoLower.includes('se presente') ||
    textoLower.includes('patrocinante')
  ) {
    return 'demanda'
  }

  // Palabras clave para contrato
  if (
    textoLower.includes('contrato') ||
    textoLower.includes('contratante') ||
    textoLower.includes('locador') ||
    textoLower.includes('locatario') ||
    textoLower.includes('partes acuerdan')
  ) {
    return 'contrato'
  }

  return 'general'
}

// ===== FUNCIONES HELPER PARA CONSTRUIR PROMPTS CON DATOS DINÁMICOS =====

/**
 * Construye el prompt para clasificación de expedientes
 */
export function buildClasificacionPrompt(expediente: {
  numero: string
  caratula: string
  fuero: string
  materia: string
  cliente: { razonSocial: string; tipoPersona: string }
  juzgado?: string | null
  descripcion?: string | null
  documentos: Array<{ nombre: string }>
  tareas: Array<{ titulo: string; prioridad: string }>
}) {
  return PROMPTS_JURIDICOS.clasificacion
    .replace('{{numero}}', expediente.numero)
    .replace('{{caratula}}', expediente.caratula)
    .replace('{{fuero}}', expediente.fuero)
    .replace('{{materia}}', expediente.materia)
    .replace('{{cliente}}', `${expediente.cliente.razonSocial} (${expediente.cliente.tipoPersona})`)
    .replace('{{juzgado}}', expediente.juzgado || 'No especificado')
    .replace('{{descripcion}}', expediente.descripcion || 'No especificada')
    .replace('{{documentos}}', expediente.documentos.map(d => d.nombre).join(', ') || 'Sin documentos')
    .replace('{{tareas}}', expediente.tareas.map(t => `${t.titulo} (${t.prioridad})`).join(', ') || 'Sin tareas')
}

/**
 * Construye el prompt para generación de escritos judiciales
 */
export function buildEscritoPrompt(
  tipo: 'demanda' | 'contestacion' | 'recurso' | 'escrito_prueba' | 'alegatos' | 'otro',
  datos: Record<string, any>,
  expediente?: any
) {
  let prompt = PROMPTS_JURIDICOS.escritos[tipo]

  // Reemplazar placeholders comunes
  const replacements: Record<string, string> = {
    '{{actor}}': datos.actor || (expediente?.cliente.razonSocial || 'No especificado'),
    '{{demandado}}': datos.demandado || 'No especificado',
    '{{fuero}}': datos.fuero || expediente?.fuero || 'No especificado',
    '{{materia}}': datos.materia || expediente?.materia || 'No especificada',
    '{{hechos}}': datos.hechos || 'No especificados',
    '{{derecho}}': datos.fundamentoLegal || datos.derecho || 'Código Civil y Comercial, Código Procesal',
    '{{petitorio}}': datos.pretension || datos.petitorio || 'Condena al demandado',
    '{{monto}}': datos.monto ? `$${datos.monto}` : 'A determinar',
    '{{expediente}}': datos.expediente || (expediente?.numero || 'No especificado'),
    '{{hechosDemanda}}': datos.hechosDemanda || 'No especificados',
    '{{defensas}}': datos.defensas || 'Negación de los hechos',
    '{{excepciones}}': datos.excepciones || 'Ninguna',
    '{{reconvencion}}': datos.reconvencion || 'No',
    '{{tipoRecurso}}': datos.tipoRecurso || 'recurso de apelación',
    '{{resolucionApelada}}': datos.resolucionApelada || 'No especificada',
    '{{agravios}}': datos.agravios || 'No especificados',
    '{{fundamentos}}': datos.fundamentos || 'Derecho procesal',
    '{{pruebaDocumental}}': datos.pruebaDocumental || 'Ninguna',
    '{{pruebaTestimonial}}': datos.pruebaTestimonial || 'Ninguna',
    '{{pruebaPericial}}': datos.pruebaPericial || 'Ninguna',
    '{{pruebaInformativa}}': datos.pruebaInformativa || 'Ninguna',
    '{{posicion}}': datos.posicion || 'Actor',
    '{{pruebaRendida}}': datos.pruebaRendida || 'No especificada',
    '{{argumentacion}}': datos.argumentacion || 'Favorable a la posición',
    '{{tipoEscrito}}': datos.tipoEscrito || datos.tipo_escrito || 'Escrito general',
    '{{contenido}}': datos.contenido || datos.objeto || datos.fundamentacion || 'No especificado'
  }

  // Aplicar reemplazos
  Object.entries(replacements).forEach(([placeholder, value]) => {
    prompt = prompt.replace(new RegExp(placeholder, 'g'), value)
  })

  return prompt
}

/**
 * Construye el prompt para búsqueda de jurisprudencia
 */
export function buildJurisprudenciaPrompt(
  consulta: string,
  materia?: string,
  jurisdiccion?: string
) {
  return PROMPTS_JURIDICOS.jurisprudencia
    .replace('{{consulta}}', consulta)
    .replace('{{materia}}', materia ? `MATERIA: ${materia}` : '')
    .replace('{{jurisdiccion}}', jurisdiccion ? `JURISDICCIÓN: ${jurisdiccion}` : 'JURISDICCIÓN: Argentina (todas)')
}
