import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { mensaje, userId, conversacion } = await request.json()

    if (!mensaje) {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      )
    }

    // Simular respuesta de IA (en producción aquí integrarías con OpenAI, Anthropic, etc.)
    const respuestaIA = await generarRespuestaIA(mensaje, conversacion)

    // Guardar la consulta en la base de datos
    const consulta = await prisma.consultaIA.create({
      data: {
        usuarioId: userId,
        tipo: 'CHAT_GENERAL',
        pregunta: mensaje,
        respuesta: respuestaIA,
        estado: 'COMPLETADA',
        contexto: JSON.stringify({
          conversacion: conversacion || [],
          timestamp: new Date().toISOString()
        })
      }
    })

    return NextResponse.json({
      respuesta: respuestaIA,
      consultaId: consulta.id
    })

  } catch (error) {
    console.error('Error en chat IA:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función simulada para generar respuesta de IA
async function generarRespuestaIA(mensaje: string, conversacion?: any[]): Promise<string> {
  // Esta es una implementación simulada. En producción, aquí integrarías con:
  // - OpenAI GPT-4
  // - Anthropic Claude
  // - Google Gemini
  // - Otro modelo de IA
  
  const mensajeLower = mensaje.toLowerCase()
  
  // Respuestas predefinidas para demostración
  const respuestas = {
    divorcio: `**Divorcio por Mutuo Acuerdo en Argentina**

Para iniciar un divorcio por mutuo acuerdo necesitas:

**Documentación requerida:**
- Partida de matrimonio
- DNI de ambos cónyuges
- Partidas de nacimiento de los hijos (si los hay)
- Convenio regulador firmado

**Pasos del proceso:**
1. **Redacción del convenio**: Debe incluir división de bienes, régimen de visitas, cuota alimentaria
2. **Presentación conjunta**: Ante el Registro Civil o mediante abogado
3. **Audiencia**: Ratificación del acuerdo ante el oficial público
4. **Sentencia**: Se dicta automáticamente si todo está en orden

**Plazo**: Entre 30-60 días aproximadamente

**Costos estimados**: $50.000 - $150.000 (incluye honorarios y tasas)

¿Hay algún aspecto específico del divorcio que te interese profundizar?`,

    demanda: `**Pasos para Iniciar una Demanda Civil**

**1. Análisis previo:**
- Verificar legitimación activa y pasiva
- Evaluar viabilidad de la acción
- Reunir pruebas y documentación

**2. Redacción de la demanda:**
- Identificación de las partes
- Relato de los hechos
- Fundamentos de derecho
- Petitorio concreto

**3. Documentación necesaria:**
- Poder especial (si actúa abogado)
- Documentación que acredite los hechos
- Tasa de justicia
- Cédulas de notificación

**4. Presentación:**
- Mesa de entradas del juzgado competente
- Verificación de requisitos formales
- Sorteo de juzgado (si corresponde)

**5. Trámite posterior:**
- Traslado al demandado (15-20 días)
- Contestación de demanda
- Apertura a prueba

¿En qué tipo de materia sería la demanda? Puedo darte información más específica.`,

    sociedad: `**Constitución de Sociedad en Argentina**

**Tipos de sociedades más comunes:**
- **SRL**: Responsabilidad limitada, mínimo 2 socios
- **SA**: Sociedad anónima, capital por acciones
- **SAS**: Sociedad por acciones simplificada (más ágil)

**Documentación requerida:**
- Reserva de denominación social
- Contrato constitutivo
- DNI de todos los socios
- Comprobante de domicilio

**Pasos del proceso:**
1. **Reserva de nombre** (IGJ - 30 días)
2. **Redacción del contrato** social
3. **Inscripción en IGJ** (Inspección General de Justicia)
4. **Inscripción en AFIP** (CUIT, IVA, etc.)
5. **Alta municipal** según corresponda

**Costos aproximados:**
- SRL: $80.000 - $200.000
- SA: $150.000 - $300.000
- SAS: $60.000 - $150.000

**Plazos**: 15-45 días hábiles

¿Qué tipo de actividad desarrollaría la sociedad? Esto puede afectar los requisitos.`,

    laboral: `**Plazos de Prescripción en Derecho Laboral**

**Regla general:** 2 años desde la extinción del vínculo laboral (Art. 256 LCT)

**Casos especiales:**

**Accidentes de trabajo:**
- 2 años desde determinación de incapacidad
- 3 años en caso de muerte

**Aportes y contribuciones:**
- 5 años para reclamar aportes impagos
- 10 años para jubilaciones y pensiones

**Multas laborales:**
- 5 años desde que se cometió la infracción

**Reclamos durante la relación:**
- No prescriben mientras subsista el vínculo
- Comienzan a correr al extinguirse

**Interrupción de la prescripción:**
- Mediación laboral obligatoria
- Demanda judicial
- Reconocimiento de deuda

**Importante:** La prescripción debe ser alegada por el empleador, el juez no puede declararla de oficio.

¿Hay algún caso específico que te interese analizar?`,

    carta_documento: `**Guía para Redactar una Carta Documento**

**Estructura básica:**

**Encabezado:**
- "CARTA DOCUMENTO"
- Lugar y fecha
- Datos del remitente
- Datos del destinatario

**Cuerpo principal:**
- Antecedentes de la situación
- Hechos concretos
- Base legal (si corresponde)
- Requerimiento específico
- Plazo para cumplir
- Consecuencias del incumplimiento

**Ejemplo práctico:**
"Por la presente pongo en su conocimiento que con fecha [fecha] usted incurrió en mora en el pago de [concepto]. El monto adeudado asciende a $[monto]. 

Le requiero que en el plazo de 10 días corridos proceda al pago íntegro de la deuda, bajo apercibimiento de iniciar las acciones legales correspondientes..."

**Consejos importantes:**
- Lenguaje claro y preciso
- Conservar copia y comprobante de envío
- Enviar por Correo Argentino certificado
- Puede enviarse también por mail certificado

¿Sobre qué tema específico necesitas redactar la carta documento?`,

    congruencia: `**Principio de Congruencia Procesal**

**Definición:**
El principio de congruencia establece que debe existir correspondencia entre lo pedido por las partes y lo resuelto por el juez.

**Tipos de congruencia:**

**1. Congruencia externa:**
- Entre la sentencia y las pretensiones de las partes
- No se puede fallar ultra petita (más de lo pedido)
- No se puede fallar extra petita (cosa distinta)
- No se puede fallar citra petita (menos de lo debido)

**2. Congruencia interna:**
- Coherencia entre considerandos y parte resolutiva
- No contradicciones en el fallo

**Excepciones permitidas:**
- Intereses y costas (aunque no se pidan expresamente)
- Cuestiones de orden público
- Nulidades manifiestas

**Consecuencias de la incongruencia:**
- Nulidad de la sentencia
- Recurso de apelación
- Recurso extraordinario (casos federales)

**Ejemplos prácticos:**
- Demandar por $100.000 y que condenen por $150.000 (ultra petita)
- Pedir daños y que ordenen hacer una obra (extra petita)
- Pedir $100.000 y condenar por $50.000 sin justificar (citra petita)

¿Te interesa algún aspecto específico de este principio?`
  }

  // Buscar respuesta apropiada
  if (mensajeLower.includes('divorcio')) {
    return respuestas.divorcio
  } else if (mensajeLower.includes('demanda') || mensajeLower.includes('civil')) {
    return respuestas.demanda
  } else if (mensajeLower.includes('sociedad') || mensajeLower.includes('constituir')) {
    return respuestas.sociedad
  } else if (mensajeLower.includes('laboral') || mensajeLower.includes('prescripción')) {
    return respuestas.laboral
  } else if (mensajeLower.includes('carta') && mensajeLower.includes('documento')) {
    return respuestas.carta_documento
  } else if (mensajeLower.includes('congruencia')) {
    return respuestas.congruencia
  }

  // Respuesta genérica más contextual
  return `Gracias por tu consulta sobre: "${mensaje}"

Como asistente legal especializado en derecho argentino, puedo ayudarte con:

**📋 Procedimientos legales:**
- Trámites judiciales y administrativos
- Plazos y requisitos legales
- Documentación necesaria

**⚖️ Ramas del derecho:**
- Civil y comercial
- Laboral
- Penal
- Administrativo
- Familia

**📝 Redacción de documentos:**
- Contratos
- Cartas documento
- Escritos judiciales
- Estatutos sociales

**🔍 Consultas específicas:**
- Análisis de casos
- Interpretación normativa
- Jurisprudencia relevante

Para darte una respuesta más precisa, ¿podrías proporcionar más detalles sobre tu situación específica o reformular tu pregunta?

Por ejemplo:
- ¿En qué provincia te encuentras?
- ¿Cuál es el monto o la importancia del asunto?
- ¿Hay urgencia en el trámite?
- ¿Ya iniciaste alguna acción legal?

**Nota importante:** Esta información es orientativa. Para casos específicos, siempre consulta con un abogado matriculado.`
}
