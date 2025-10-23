import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { llamarOpenAI, buildClasificacionPrompt } from '@/lib/openai'

/**
 * POST /api/ia-legal/clasificar
 * 
 * Clasifica automáticamente un expediente usando IA
 * Detecta: materia, urgencia, complejidad, tags sugeridos
 * 
 * Body:
 * - expedienteId: string
 * 
 * Response:
 * - clasificacion: { materia, urgencia, complejidad, tags, reasoning }
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

    // 3. Verificar que el Add-on IA Legal esté activo
    if (!user.estudio.iaLegalActivo) {
      return NextResponse.json(
        {
          error: 'Add-on IA Legal no está activo',
          mensaje: 'Contacte al administrador para activar el Add-on de IA Legal'
        },
        { status: 403 }
      )
    }

    // 4. Verificar cuota
    if (user.estudio.iaLegalTipo === 'FIJO') {
      const consultasRestantes = user.estudio.iaLegalMaxConsultas - user.estudio.iaLegalConsultasUsadas
      if (consultasRestantes <= 0) {
        return NextResponse.json(
          {
            error: 'Cuota de consultas IA agotada',
            consultasUsadas: user.estudio.iaLegalConsultasUsadas,
            consultasMaximas: user.estudio.iaLegalMaxConsultas
          },
          { status: 429 }
        )
      }
    }

    // 5. Obtener datos del request
    const body = await request.json()
    const { expedienteId } = body

    if (!expedienteId) {
      return NextResponse.json(
        { error: 'expedienteId es requerido' },
        { status: 400 }
      )
    }

    // 6. Obtener expediente con datos relacionados
    const expediente = await prisma.expediente.findUnique({
      where: { id: expedienteId },
      include: {
        cliente: {
          select: {
            razonSocial: true,
            tipoPersona: true
          }
        },
        documentos: {
          select: {
            razonSocial: true,
            tipoDocumento: true
          },
          take: 10
        },
        tareas: {
          select: {
            titulo: true,
            prioridad: true,
            estado: true
          },
          take: 10
        }
      }
    })

    if (!expediente) {
      return NextResponse.json(
        { error: 'Expediente no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que pertenece al estudio del usuario
    if (expediente.estudioId !== user.estudio.id) {
      return NextResponse.json(
        { error: 'No tiene permisos para este expediente' },
        { status: 403 }
      )
    }

    // 7. Construir prompt para clasificación usando función centralizada
    const prompt = buildClasificacionPrompt(expediente)

    // 8. Llamar a OpenAI (usando GPT-4o-mini para clasificación)
    let resultado
    try {
      resultado = await llamarOpenAI(prompt, {
        modelo: 'gpt-4o-mini',
        temperatura: 0.2,
        maxTokens: 1500,
        formatoJSON: true,
        systemPrompt: 'Eres un experto en derecho procesal argentino especializado en clasificación de expedientes judiciales.'
      })
    } catch (error: any) {
      // Log del error
      await prisma.logIA.create({
        data: {
          estudioId: user.estudio.id,
          usuarioId: user.id,
          accion: 'clasificar',
          modelo: 'gpt-4o-mini',
          tokensUsados: 0,
          costo: 0,
          exitoso: false,
          errorMensaje: error.message,
          expedienteId: expedienteId,
          metadata: JSON.stringify({
            numero: expediente.numero,
            caratula: expediente.caratula
          })
        }
      })

      return NextResponse.json(
        { error: 'Error al procesar con IA', detalle: error.message },
        { status: 500 }
      )
    }

    // 9. Parsear resultado JSON
    let clasificacion
    try {
      clasificacion = JSON.parse(resultado.contenido)
    } catch (error) {
      return NextResponse.json(
        { error: 'Error al parsear respuesta de IA' },
        { status: 500 }
      )
    }

    // 10. Registrar uso en base de datos
    const duracionMs = Date.now() - startTime

    await prisma.logIA.create({
      data: {
        estudioId: user.estudio.id,
        usuarioId: user.id,
        accion: 'clasificar',
        modelo: resultado.modelo,
        tokensUsados: resultado.tokens,
        costo: resultado.costo,
        duracionMs,
        exitoso: true,
        expedienteId: expedienteId,
        metadata: JSON.stringify({
          numero: expediente.numero,
          caratula: expediente.caratula,
          clasificacionPrevia: {
            fuero: expediente.fuero,
            materia: expediente.materia
          },
          clasificacionNueva: clasificacion
        })
      }
    })

    // 11. Incrementar contador de consultas si es tipo FIJO
    if (user.estudio.iaLegalTipo === 'FIJO') {
      await prisma.estudio.update({
        where: { id: user.estudio.id },
        data: {
          iaLegalConsultasUsadas: {
            increment: 1
          }
        }
      })
    }

    // 12. Devolver resultado
    return NextResponse.json({
      success: true,
      clasificacion,
      expediente: {
        id: expediente.id,
        numero: expediente.numero,
        caratula: expediente.caratula
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
    console.error('Error en /api/ia-legal/clasificar:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', detalle: error.message },
      { status: 500 }
    )
  }
}
