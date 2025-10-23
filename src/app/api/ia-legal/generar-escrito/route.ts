import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { llamarOpenAI, buildEscritoPrompt } from '@/lib/openai'

/**
 * POST /api/ia-legal/generar-escrito
 * 
 * Genera un escrito legal usando IA
 * 
 * Body:
 * - tipo: 'demanda' | 'contestacion' | 'recurso' | 'escrito_prueba' | 'alegatos' | 'otro'
 * - expedienteId?: string (opcional)
 * - datos: object con los datos necesarios
 * 
 * Response:
 * - escrito: string (texto del escrito generado)
 * - tokensUsados: number
 * - costo: number
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // 1. Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // 2. Obtener usuario y estudio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        estudio: true
      }
    })

    if (!user || !user.estudio) {
      return NextResponse.json(
        { error: 'Usuario o estudio no encontrado' },
        { status: 404 }
      )
    }

    // 3. Verificar Add-on IA Legal
    if (!user.estudio.iaLegalActivo) {
      return NextResponse.json(
        { error: 'Add-on IA Legal no está activo' },
        { status: 403 }
      )
    }

    // 4. Verificar cuota
    if (user.estudio.iaLegalTipo === 'FIJO') {
      const consultasRestantes = user.estudio.iaLegalMaxConsultas - user.estudio.iaLegalConsultasUsadas
      if (consultasRestantes <= 0) {
        return NextResponse.json(
          { error: 'Cuota de consultas IA agotada' },
          { status: 429 }
        )
      }
    }

    // 5. Obtener datos del request
    const body = await request.json()
    const { tipo, expedienteId, datos } = body

    if (!tipo || !datos) {
      return NextResponse.json(
        { error: 'tipo y datos son requeridos' },
        { status: 400 }
      )
    }

    // 6. Obtener expediente si se proporciona
    let expediente = null
    if (expedienteId) {
      expediente = await prisma.expediente.findUnique({
        where: { id: expedienteId },
        include: {
          cliente: true,
          responsable: true
        }
      })

      if (!expediente || expediente.estudioId !== user.estudio.id) {
        return NextResponse.json(
          { error: 'Expediente no encontrado o sin permisos' },
          { status: 403 }
        )
      }
    }

    // 7. Construir prompt usando función centralizada
    const prompt = buildEscritoPrompt(tipo, datos, expediente)

    // 8. Llamar a OpenAI (GPT-4o para escritos complejos)
    let resultado
    try {
      resultado = await llamarOpenAI(prompt, {
        modelo: 'gpt-4o',
        temperatura: 0.4,
        maxTokens: 3000,
        formatoJSON: false,
        systemPrompt: 'Eres un abogado experto en derecho procesal argentino. Redactas escritos judiciales formales, profesionales y técnicamente correctos.'
      })
    } catch (error: any) {
      await prisma.logIA.create({
        data: {
          estudioId: user.estudio.id,
          usuarioId: user.id,
          accion: 'generar',
          modelo: 'gpt-4o',
          tokensUsados: 0,
          costo: 0,
          exitoso: false,
          errorMensaje: error.message,
          expedienteId: expedienteId || null,
          metadata: JSON.stringify({ tipo, datos })
        }
      })

      return NextResponse.json(
        { error: 'Error al generar escrito', detalle: error.message },
        { status: 500 }
      )
    }

    // 9. Registrar uso
    const duracionMs = Date.now() - startTime

    await prisma.logIA.create({
      data: {
        estudioId: user.estudio.id,
        usuarioId: user.id,
        accion: 'generar',
        modelo: resultado.modelo,
        tokensUsados: resultado.tokens,
        costo: resultado.costo,
        duracionMs,
        exitoso: true,
        expedienteId: expedienteId || null,
        metadata: JSON.stringify({
          tipo,
          datos,
          longitud: resultado.contenido.length
        })
      }
    })

    // 10. Incrementar contador
    if (user.estudio.iaLegalTipo === 'FIJO') {
      await prisma.estudio.update({
        where: { id: user.estudio.id },
        data: {
          iaLegalConsultasUsadas: { increment: 1 }
        }
      })
    }

    // 11. Devolver resultado
    return NextResponse.json({
      success: true,
      escrito: resultado.contenido,
      tipo,
      expediente: expediente ? {
        id: expediente.id,
        numero: expediente.numero,
        caratula: expediente.caratula
      } : null,
      metadata: {
        tokensUsados: resultado.tokens,
        costo: resultado.costo,
        costoFormateado: `$${resultado.costo.toFixed(4)} USD`,
        modelo: resultado.modelo,
        duracionMs,
        caracteres: resultado.contenido.length,
        consultasRestantes: user.estudio.iaLegalTipo === 'FIJO' 
          ? user.estudio.iaLegalMaxConsultas - user.estudio.iaLegalConsultasUsadas - 1
          : null
      }
    })

  } catch (error: any) {
    console.error('Error en /api/ia-legal/generar-escrito:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', detalle: error.message },
      { status: 500 }
    )
  }
}
