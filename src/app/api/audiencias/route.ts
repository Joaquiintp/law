import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const audienciaSchema = z.object({
  fecha: z.string().transform((str) => new Date(str)),
  hora: z.string().default('09:00'),
  tipo: z.enum(['CONCILIACION', 'PRUEBA', 'ALEGATOS', 'VISTA_CAUSA', 'MEDIACION', 'OTRA']),
  modalidad: z.enum(['PRESENCIAL', 'VIRTUAL', 'MIXTA']),
  lugar: z.string().optional().nullable(),
  descripcion: z.string().optional().nullable(),
  expedienteId: z.string().min(1),
  estado: z.enum(['PROGRAMADA', 'REALIZADA', 'SUSPENDIDA', 'CANCELADA']).default('PROGRAMADA'),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')
    const expedienteId = searchParams.get('expedienteId')
    const estado = searchParams.get('estado')

    const where: any = {}

    if (fechaInicio && fechaFin) {
      where.fecha = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin)
      }
    }

    if (expedienteId) {
      where.expedienteId = expedienteId
    }

    if (estado) {
      where.estado = estado
    }

    const audiencias = await prisma.audiencia.findMany({
      where,
      include: {
        expediente: {
          include: {
            cliente: {
              select: {
                razonSocial: true,
              }
            }
          }
        }
      },
      orderBy: {
        fecha: 'asc'
      }
    })

    return NextResponse.json(audiencias)
  } catch (error) {
    console.error('Error fetching audiencias:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = audienciaSchema.parse(body)

    // Verificar que el expediente existe
    const expediente = await prisma.expediente.findUnique({
      where: { id: validatedData.expedienteId }
    })

    if (!expediente) {
      return NextResponse.json(
        { error: 'Expediente no encontrado' },
        { status: 404 }
      )
    }

    const audiencia = await prisma.audiencia.create({
      data: {
        fecha: validatedData.fecha,
        hora: validatedData.hora,
        tipo: validatedData.tipo,
        modalidad: validatedData.modalidad,
        lugar: validatedData.lugar,
        descripcion: validatedData.descripcion,
        estado: validatedData.estado,
        expedienteId: validatedData.expedienteId,
        responsableId: session.user?.id || '',
      },
      include: {
        expediente: {
          include: {
            cliente: {
              select: {
                razonSocial: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json(audiencia, { status: 201 })
  } catch (error) {
    console.error('Error creating audiencia:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
