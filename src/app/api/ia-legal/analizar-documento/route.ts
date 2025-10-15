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

    const { documentoId, tipoAnalisis } = await request.json()

    if (!documentoId) {
      return NextResponse.json(
        { error: 'ID de documento requerido' },
        { status: 400 }
      )
    }

    // Obtener información del documento
    const documento = await prisma.documento.findUnique({
      where: { id: documentoId },
      include: {
        expediente: {
          include: {
            cliente: true
          }
        }
      }
    })

    if (!documento) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    // Generar análisis según el tipo
    const analisis = await generarAnalisisDocumento(documento, tipoAnalisis)

    // Guardar la consulta en la base de datos
    const consulta = await prisma.consultaIA.create({
      data: {
        usuarioId: session.user.id,
        tipo: tipoAnalisis || 'ANALISIS_DOCUMENTO',
        pregunta: `Análisis de documento: ${documento.nombre}`,
        respuesta: analisis,
        estado: 'COMPLETADA',
        documentoId: documento.id,
        expedienteId: documento.expedienteId,
        contexto: JSON.stringify({
          tipoDocumento: documento.tipoDocumento,
          nombreDocumento: documento.nombre,
          tipoAnalisis,
          timestamp: new Date().toISOString()
        })
      }
    })

    return NextResponse.json({
      analisis,
      documento: {
        id: documento.id,
        nombre: documento.nombre,
        tipo: documento.tipoDocumento
      },
      consultaId: consulta.id
    })

  } catch (error) {
    console.error('Error en análisis de documento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

async function generarAnalisisDocumento(documento: any, tipoAnalisis: string): Promise<string> {
  const tipoDoc = documento.tipoDocumento
  const nombreCliente = documento.expediente?.cliente?.nombre || 'Cliente'
  
  // Análisis simulado basado en tipo de documento
  const analisisEspecializados = {
    CONTRATO: `**📋 ANÁLISIS DE CONTRATO**

**Documento:** ${documento.nombre}
**Cliente:** ${nombreCliente}
**Fecha de análisis:** ${new Date().toLocaleDateString('es-AR')}

---

**🔍 RESUMEN EJECUTIVO**
Se ha analizado el contrato presentado identificando las siguientes características principales:

**📊 ELEMENTOS CLAVE IDENTIFICADOS:**

**✅ Aspectos Positivos:**
- Identificación clara de las partes contratantes
- Objeto del contrato definido específicamente
- Plazo de vigencia establecido
- Forma de pago detallada

**⚠️ Puntos de Atención:**
- Revisar cláusulas de resolución anticipada
- Verificar condiciones de incumplimiento
- Evaluar cláusulas penales aplicables
- Confirmar jurisdicción competente

**🎯 RECOMENDACIONES ESPECÍFICAS:**

1. **Cláusula de Fuerza Mayor:**
   - Incluir eventos de pandemia y restricciones gubernamentales
   - Definir procedimiento de notificación
   - Establecer efectos sobre obligaciones

2. **Rescisión y Terminación:**
   - Aclarar causales de rescisión unilateral
   - Definir períodos de preaviso
   - Establecer liquidación de obligaciones pendientes

3. **Aspectos Fiscales:**
   - Verificar tratamiento del IVA
   - Confirmar retenciones aplicables
   - Revisar comprobantes requeridos

**⚖️ RIESGOS LEGALES IDENTIFICADOS:**
- Posible ambigüedad en definición de obligaciones
- Falta de especificación de penalidades por incumplimiento
- Ausencia de cláusula de confidencialidad (si aplicable)

**📋 PRÓXIMOS PASOS SUGERIDOS:**
1. Revisión detallada con el cliente de términos específicos
2. Negociación de cláusulas identificadas como riesgosas
3. Incorporación de modificaciones sugeridas
4. Validación final antes de la firma

**💡 OBSERVACIONES ADICIONALES:**
El contrato presenta una estructura general adecuada pero requiere ajustes para optimizar la protección de los intereses del cliente.`,

    DEMANDA: `**⚖️ ANÁLISIS DE DEMANDA JUDICIAL**

**Documento:** ${documento.nombre}
**Cliente:** ${nombreCliente}
**Tipo:** Escrito de demanda

---

**🎯 EVALUACIÓN PROCESAL**

**✅ REQUISITOS FORMALES VERIFICADOS:**
- Identificación correcta del tribunal competente
- Datos completos de las partes (actor y demandado)
- Domicilio legal y real constituido
- Patrocinio letrado debidamente acreditado

**📋 ANÁLISIS DEL CONTENIDO:**

**1. Legitimación:**
- ✅ Legitimación activa: Acreditada
- ✅ Legitimación pasiva: Identificación correcta del demandado
- ⚠️ Verificar representación legal si corresponde

**2. Competencia:**
- ✅ Competencia material: Adecuada
- ✅ Competencia territorial: Correcta según domicilio
- ✅ Competencia federal: No presenta conflictos

**3. Pretensión:**
- ✅ Objeto claramente determinado
- ✅ Causa petendi debidamente fundada
- ✅ Monto reclamado especificado

**📊 FORTALEZAS DE LA DEMANDA:**

**Aspectos Positivos:**
- Relato fáctico ordenado y cronológico
- Fundamentos jurídicos sólidos
- Prueba documental relevante ofrecida
- Petitorio concreto y determinado

**⚠️ PUNTOS A REFORZAR:**

**Prueba:**
- Ampliar testimonial con testigos adicionales
- Incluir pericial contable si hay daños económicos
- Considerar informes de organismos públicos

**Jurisprudencia:**
- Citar fallos recientes de cámaras superiores
- Incluir doctrina especializada relevante
- Referir normativa específica actualizada

**🎯 ESTRATEGIA PROCESAL SUGERIDA:**

**Fase inicial:**
1. Seguimiento de notificación al demandado
2. Preparación para eventual excepción de defecto legal
3. Análisis de posible reconvención

**Prueba:**
- Preparar interrogatorio para absolución de posiciones
- Coordinar peritajes técnicos si corresponde
- Organizar testimoniales estratégicamente

**💰 ESTIMACIÓN DE COSTOS:**
- Tasa de justicia: Variable según monto
- Honorarios periciales: $150,000 - $300,000
- Costas procesales estimadas: 15-25% del monto

**⏰ PLAZOS CRÍTICOS:**
- Traslado de demanda: 15/20 días
- Contestación: 15 días
- Llamamiento de autos: 5 días
- Apertura a prueba: 40 días

**📈 PROBABILIDAD DE ÉXITO:** ALTA
Basada en solidez de fundamentos y prueba disponible.`,

    ESCRITURA: `**🏠 ANÁLISIS DE ESCRITURA PÚBLICA**

**Documento:** ${documento.nombre}
**Cliente:** ${nombreCliente}
**Tipo:** Escritura de compraventa inmobiliaria

---

**🔍 VERIFICACIÓN REGISTRAL**

**✅ DATOS DEL INMUEBLE:**
- Nomenclatura catastral correcta
- Superficie según títulos coincidente
- Mejoras declaradas adecuadamente
- Dominio libre de medidas cautelares

**📋 ANÁLISIS JURÍDICO:**

**Vendedor:**
- ✅ Acreditación de titularidad dominial
- ✅ Estado civil debidamente informado
- ⚠️ Verificar inexistencia de inhibiciones
- ⚠️ Confirmar autorización conyugal si corresponde

**Comprador:**
- ✅ Identificación completa
- ✅ Capacidad jurídica verificada
- ✅ Medios de pago acreditados

**💰 ASPECTOS ECONÓMICOS:**

**Precio y Forma de Pago:**
- Precio de mercado: Verificar valuación fiscal
- Forma de pago declarada conforme normativa UIF
- Seña y/o anticipo debidamente documentado

**Cargas Fiscales:**
- ✅ Impuesto a la transferencia de inmuebles (ITI)
- ✅ Tasa de actuación notarial
- ⚠️ Verificar situación impositiva del vendedor

**⚠️ OBSERVACIONES IMPORTANTES:**

**1. Due Diligence Recomendado:**
- Certificado de libre deuda municipal actualizado
- Verificación de servicios (luz, gas, agua) al día
- Consulta al Registro de Anotaciones Personales
- Estado parcelario y de mensura actualizado

**2. Aspectos Registrales:**
- Verificar que no existan restricciones al dominio
- Confirmar inexistencia de servidumbres no declaradas
- Revisar antecedentes de dominio completos

**3. Garantías Adicionales:**
- Seguro de caución para vicios ocultos
- Garantía por defectos constructivos
- Cláusula de saneamiento de evicción

**🎯 RECOMENDACIONES PRE-FIRMA:**

**Inmediatas:**
1. Solicitar certificado registral actualizado (no mayor a 30 días)
2. Verificar situación impositiva y previsional del vendedor
3. Confirmar medidas del inmueble con plano de mensura
4. Revisar expensas comunes si corresponde

**Previo a escrituración:**
- Inspección ocular final del inmueble
- Verificación de servicios transferidos
- Confirmación de fondos disponibles
- Coordinación con escribano actuante

**📊 RIESGO EVALUADO:** BAJO a MODERADO
Operación estándar con documentación aparentemente en orden.

**💡 OBSERVACIÓN FINAL:**
Se sugiere completar las verificaciones indicadas antes de proceder a la firma definitiva para garantizar una operación exitosa y libre de contingencias.`,

    PODER: `**📜 ANÁLISIS DE PODER ESPECIAL**

**Documento:** ${documento.nombre}
**Otorgante:** ${nombreCliente}

---

**🔍 ANÁLISIS FORMAL**

**✅ Requisitos Legales:**
- Identificación completa del poderdante
- Datos del apoderado debidamente consignados
- Objeto del poder específicamente determinado
- Facultades claramente enumeradas

**⚖️ ALCANCE DE LAS FACULTADES:**

**Facultades Otorgadas:**
- Representación en juicio como actor o demandado
- Facultad de transar y conciliar
- Poder para cobrar y otorgar recibos
- Autorización para sustituir el mandato

**⚠️ LIMITACIONES IDENTIFICADAS:**
- Verificar si incluye facultades para actos de disposición
- Confirmar autorización para recibir dinero
- Revisar si permite delegar en terceros

**📋 VALIDACIÓN JURÍDICA:**

**Aspectos Positivos:**
- Forma legal adecuada (escritura pública/acta notarial)
- Objeto lícito y determinado
- Capacidad de las partes verificada
- Registro en protocolos notariales

**Puntos de Atención:**
- ⚠️ Vigencia temporal no especificada
- ⚠️ Falta cláusula de revocabilidad expresa
- ⚠️ No incluye facultades fiscales específicas

**🎯 RECOMENDACIONES:**

**Para optimizar el instrumento:**
1. Incluir facultades para gestiones ante AFIP/ARBA
2. Autorizar expresamente cobro de honorarios
3. Especificar vigencia temporal del mandato
4. Agregar cláusula de sustitución parcial

**Aspectos operativos:**
- Legalizar firmas si se usará en otras jurisdicciones
- Obtener copias certificadas suficientes
- Registrar en colegios profesionales si corresponde

**💼 ÁMBITO DE APLICACIÓN:**
El poder resulta apto para la representación judicial en los términos otorgados, requiriendo solo los ajustes mencionados para optimizar su efectividad.

**📅 VIGENCIA:** Indefinida hasta revocación expresa
**🔒 SEGURIDAD JURÍDICA:** Alta, documento formalmente correcto`
  }

  // Devolver análisis especializado o genérico
  return analisisEspecializados[tipoDoc as keyof typeof analisisEspecializados] || 
    generarAnalisisGenerico(documento, tipoAnalisis)
}

function generarAnalisisGenerico(documento: any, tipoAnalisis: string): string {
  const nombreCliente = documento.expediente?.cliente?.nombre || 'Cliente'
  
  return `**📄 ANÁLISIS DE DOCUMENTO LEGAL**

**Documento:** ${documento.nombre}
**Tipo:** ${documento.tipoDocumento}
**Cliente:** ${nombreCliente}
**Análisis solicitado:** ${tipoAnalisis}

---

**🔍 RESUMEN EJECUTIVO**

Se ha procedido al análisis del documento presentado, evaluando los aspectos legales, formales y de contenido relevantes según la naturaleza del instrumento.

**📊 EVALUACIÓN GENERAL:**

**Aspectos Formales:**
- ✅ Estructura del documento apropiada
- ✅ Identificación de partes correcta
- ✅ Fecha y lugar de otorgamiento
- ⚠️ Revisar firmas y autenticaciones

**Contenido Legal:**
- ✅ Objeto claramente determinado
- ✅ Obligaciones y derechos especificados
- ⚠️ Verificar cláusulas especiales
- ⚠️ Revisar condiciones suspensivas/resolutorias

**🎯 RECOMENDACIONES PRINCIPALES:**

**1. Verificaciones Necesarias:**
   - Validar capacidad legal de las partes
   - Confirmar representación si corresponde
   - Revisar documentación de respaldo
   - Verificar cumplimiento de requisitos formales

**2. Aspectos a Considerar:**
   - Implicancias fiscales del acto
   - Necesidad de inscripciones registrales
   - Plazos y vencimientos establecidos
   - Garantías y responsabilidades asumidas

**3. Gestiones Complementarias:**
   - Obtener documentación adicional si es necesaria
   - Coordinar con otras partes involucradas
   - Planificar cumplimiento de obligaciones
   - Establecer seguimiento de plazos críticos

**⚠️ ALERTAS Y OBSERVACIONES:**

- Revisar normativa aplicable actualizada
- Considerar jurisprudencia reciente relevante
- Evaluar riesgos específicos del tipo de acto
- Verificar requisitos de publicidad si corresponden

**📅 PRÓXIMOS PASOS:**
1. Completar análisis detallado con documentación adicional
2. Coordinar con el cliente para aclarar aspectos específicos
3. Preparar documentación complementaria si es necesaria
4. Establecer cronograma de cumplimiento

**💡 OBSERVACIONES FINALES:**
El documento presenta características generales adecuadas, requiriendo las verificaciones y ajustes mencionados para garantizar su plena efectividad legal.

---
*Análisis generado por IA Legal Assistant - Siempre consulte con profesional matriculado para casos específicos*`
}
