import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const eventoUpdateSchema = z.object({
  titulo: z.string().min(3).optional(),
  descripcion: z.string().optional(),
  fecha: z.string().optional(),
  hora: z.string().optional(),
  tipo: z.enum(['COBRO', 'VENCIMIENTO', 'FECHA_LIMITE', 'REUNION', 'OTRO']).optional(),
  monto: z.number().optional(),
  moneda: z.enum(['ARS', 'USD', 'EUR']).optional(),
  estado: z.enum(['PENDIENTE', 'COMPLETADO', 'CANCELADO']).optional(),
  expedienteId: z.string().optional().nullable(),
  clienteId: z.string().optional().nullable(),
})

// GET - Obtener un evento específico
export async function GET(
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

    const evento = await prisma.evento.findFirst({
      where: {
        id: params.id,
        OR: [
          {
            expediente: {
              estudioId: user.estudio.id
            }
          },
          {
            cliente: {
              estudioId: user.estudio.id
            }
          },
          {
            AND: [
              { expedienteId: null },
              { clienteId: null }
            ]
          }
        ]
      },
      include: {
        expediente: {
          select: {
            id: true,
            numero: true,
            caratula: true
          }
        },
        cliente: {
          select: {
            id: true,
            razonSocial: true
          }
        }
      }
    })

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ evento })
  } catch (error) {
    console.error('Error al obtener evento:', error)
    return NextResponse.json(
      { error: 'Error al obtener evento' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar evento
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

    // Verificar que el evento existe y pertenece al estudio
    const eventoExistente = await prisma.evento.findFirst({
      where: {
        id: params.id,
        OR: [
          {
            expediente: {
              estudioId: user.estudio.id
            }
          },
          {
            cliente: {
              estudioId: user.estudio.id
            }
          },
          {
            AND: [
              { expedienteId: null },
              { clienteId: null }
            ]
          }
        ]
      }
    })

    if (!eventoExistente) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validacion = eventoUpdateSchema.safeParse(body)

    if (!validacion.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', detalles: validacion.error.issues },
        { status: 400 }
      )
    }

    const datos = validacion.data

    // Validar expediente/cliente si se proporcionan
    if (datos.expedienteId) {
      const expediente = await prisma.expediente.findFirst({
        where: {
          id: datos.expedienteId,
          estudioId: user.estudio.id
        }
      })

      if (!expediente) {
        return NextResponse.json(
          { error: 'Expediente no encontrado' },
          { status: 404 }
        )
      }
    }

    if (datos.clienteId) {
      const cliente = await prisma.cliente.findFirst({
        where: {
          id: datos.clienteId,
          estudioId: user.estudio.id
        }
      })

      if (!cliente) {
        return NextResponse.json(
          { error: 'Cliente no encontrado' },
          { status: 404 }
        )
      }
    }

    // Preparar datos para actualizar
    const dataToUpdate: any = { ...datos }
    if (datos.fecha) {
      dataToUpdate.fecha = new Date(datos.fecha)
    }

    const evento = await prisma.evento.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: {
        expediente: {
          select: {
            id: true,
            numero: true,
            caratula: true
          }
        },
        cliente: {
          select: {
            id: true,
            razonSocial: true
          }
        }
      }
    })

    return NextResponse.json({
      mensaje: 'Evento actualizado exitosamente',
      evento
    })
  } catch (error) {
    console.error('Error al actualizar evento:', error)
    return NextResponse.json(
      { error: 'Error al actualizar evento' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar evento
export async function DELETE(
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

    // Verificar que el evento existe y pertenece al estudio
    const evento = await prisma.evento.findFirst({
      where: {
        id: params.id,
        OR: [
          {
            expediente: {
              estudioId: user.estudio.id
            }
          },
          {
            cliente: {
              estudioId: user.estudio.id
            }
          },
          {
            AND: [
              { expedienteId: null },
              { clienteId: null }
            ]
          }
        ]
      }
    })

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    await prisma.evento.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      mensaje: 'Evento eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar evento:', error)
    return NextResponse.json(
      { error: 'Error al eliminar evento' },
      { status: 500 }
    )
  }
}
