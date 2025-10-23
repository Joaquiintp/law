import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const audienciaUpdateSchema = z.object({
  fecha: z.string().optional(),
  hora: z.string().optional(),
  lugar: z.string().optional(),
  modalidad: z.enum(['PRESENCIAL', 'VIRTUAL', 'MIXTA']).optional(),
  estado: z.enum(['PROGRAMADA', 'REALIZADA', 'SUSPENDIDA', 'CANCELADA']).optional(),
  descripcion: z.string().optional(),
  resultado: z.string().optional(),
})

// PUT - Actualizar audiencia
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { estudio: true }
    })

    if (!user?.estudio) {
      return NextResponse.json(
        { error: 'Usuario sin estudio asignado' },
        { status: 403 }
      )
    }

    // Verificar que la audiencia existe y pertenece al estudio
    const audienciaExistente = await prisma.audiencia.findFirst({
      where: {
        id: params.id,
        expediente: {
          estudioId: user.estudio.id
        }
      }
    })

    if (!audienciaExistente) {
      return NextResponse.json(
        { error: 'Audiencia no encontrada' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validacion = audienciaUpdateSchema.safeParse(body)

    if (!validacion.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', detalles: validacion.error.issues },
        { status: 400 }
      )
    }

    const datos = validacion.data

    // Preparar datos para actualizar
    const dataToUpdate: any = { ...datos }
    if (datos.fecha) {
      dataToUpdate.fecha = new Date(datos.fecha)
    }

    const audiencia = await prisma.audiencia.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: {
        expediente: {
          select: {
            id: true,
            numero: true,
            caratula: true,
            cliente: {
              select: {
                id: true,
                razonSocial: true
              }
            }
          }
        },
        responsable: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      mensaje: 'Audiencia actualizada exitosamente',
      audiencia
    })
  } catch (error) {
    console.error('Error al actualizar audiencia:', error)
    return NextResponse.json(
      { error: 'Error al actualizar audiencia' },
      { status: 500 }
    )
  }
}
