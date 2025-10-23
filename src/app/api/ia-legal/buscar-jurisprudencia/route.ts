import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { llamarOpenAI, buildJurisprudenciaPrompt } from '@/lib/openai'

/**
 * POST /api/ia-legal/buscar-jurisprudencia
 * 
 * Busca y analiza jurisprudencia relevante usando IA
 * 
 * Body:
 * - consulta: string (descripción del caso o tema legal)
 * - materia?: string
 * - jurisdiccion?: string
 * 
 * Response:
 * - analisis: string
 * - casosRelevantes: array
 * - recomendaciones: array
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
    const { consulta, materia, jurisdiccion } = body

    if (!consulta) {
      return NextResponse.json(
        { error: 'consulta es requerida' },
        { status: 400 }
      )
    }

    // 6. Construir prompt usando función centralizada
    const prompt = buildJurisprudenciaPrompt(consulta, materia, jurisdiccion)

    // 7. Llamar a OpenAI
    let resultado
    try {
      resultado = await llamarOpenAI(prompt, {
        modelo: 'gpt-4o',
        temperatura: 0.3,
        maxTokens: 2500,
        formatoJSON: true,
        systemPrompt: 'Eres un experto en derecho argentino con conocimientos profundos en jurisprudencia y doctrina legal.'
      })
    } catch (error: any) {
      await prisma.logIA.create({
        data: {
          estudioId: user.estudio.id,
          usuarioId: user.id,
          accion: 'buscar',
          modelo: 'gpt-4o',
          tokensUsados: 0,
          costo: 0,
          exitoso: false,
          errorMensaje: error.message,
          metadata: JSON.stringify({ consulta, materia, jurisdiccion })
        }
      })

      return NextResponse.json(
        { error: 'Error al buscar jurisprudencia', detalle: error.message },
        { status: 500 }
      )
    }

    // 8. Parsear resultado
    let analisis
    try {
      analisis = JSON.parse(resultado.contenido)
    } catch (error) {
      return NextResponse.json(
        { error: 'Error al parsear respuesta de IA' },
        { status: 500 }
      )
    }

    // 9. Registrar uso
    const duracionMs = Date.now() - startTime

    await prisma.logIA.create({
      data: {
        estudioId: user.estudio.id,
        usuarioId: user.id,
        accion: 'buscar',
        modelo: resultado.modelo,
        tokensUsados: resultado.tokens,
        costo: resultado.costo,
        duracionMs,
        exitoso: true,
        metadata: JSON.stringify({
          consulta,
          materia,
          jurisdiccion,
          casosEncontrados: analisis.jurisprudenciaRelevante?.length || 0
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
      analisis,
      consulta: {
        texto: consulta,
        materia,
        jurisdiccion
      },
      metadata: {
        tokensUsados: resultado.tokens,
        costo: resultado.costo,
        costoFormateado: `$${resultado.costo.toFixed(4)} USD`,
        modelo: resultado.modelo,
        duracionMs,
        consultasRestantes: user.estudio.iaLegalTipo === 'FIJO' 
          ? user.estudio.iaLegalMaxConsultas - user.estudio.iaLegalConsultasUsadas - 1
          : null
      }
    })

  } catch (error: any) {
    console.error('Error en /api/ia-legal/buscar-jurisprudencia:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', detalle: error.message },
      { status: 500 }
    )
  }
}
