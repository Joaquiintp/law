import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validación
const eventoSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  fecha: z.string().min(1, 'La fecha es requerida'),
  hora: z.string().optional(),
  tipo: z.enum(['COBRO', 'VENCIMIENTO', 'FECHA_LIMITE', 'REUNION', 'OTRO']),
  monto: z.number().optional(),
  moneda: z.enum(['ARS', 'USD', 'EUR']).optional(),
  estado: z.enum(['PENDIENTE', 'COMPLETADO', 'CANCELADO']).optional(),
  expedienteId: z.string().optional(),
  clienteId: z.string().optional(),
})

// GET - Listar todos los eventos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener usuario y estudio
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

    // Obtener parámetros de filtro
    const { searchParams } = new URL(request.url)
    const fecha = searchParams.get('fecha')
    const tipo = searchParams.get('tipo')
    const estado = searchParams.get('estado')

    // Construir filtros
    const where: any = {}

    // Filtrar eventos del estudio a través de expedientes/clientes
    where.OR = [
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

    if (fecha) {
      const fechaDate = new Date(fecha)
      const nextDay = new Date(fechaDate)
      nextDay.setDate(nextDay.getDate() + 1)
      
      where.fecha = {
        gte: fechaDate,
        lt: nextDay
      }
    }

    if (tipo) {
      where.tipo = tipo
    }

    if (estado) {
      where.estado = estado
    }

    const eventos = await prisma.evento.findMany({
      where,
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
      },
      orderBy: {
        fecha: 'asc'
      }
    })

    return NextResponse.json({ eventos })
  } catch (error) {
    console.error('Error al obtener eventos:', error)
    return NextResponse.json(
      { error: 'Error al obtener eventos' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo evento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
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

    const body = await request.json()
    const validacion = eventoSchema.safeParse(body)

    if (!validacion.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', detalles: validacion.error.issues },
        { status: 400 }
      )
    }

    const datos = validacion.data

    // Validar que expediente o cliente pertenezcan al estudio
    if (datos.expedienteId) {
      const expediente = await prisma.expediente.findFirst({
        where: {
          id: datos.expedienteId,
          estudioId: user.estudio.id
        }
      })

      if (!expediente) {
        return NextResponse.json(
          { error: 'Expediente no encontrado o no pertenece a este estudio' },
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
          { error: 'Cliente no encontrado o no pertenece a este estudio' },
          { status: 404 }
        )
      }
    }

    // Crear evento
    const evento = await prisma.evento.create({
      data: {
        titulo: datos.titulo,
        descripcion: datos.descripcion,
        fecha: new Date(datos.fecha),
        hora: datos.hora,
        tipo: datos.tipo,
        monto: datos.monto,
        moneda: datos.moneda,
        estado: datos.estado || 'PENDIENTE',
        expedienteId: datos.expedienteId,
        clienteId: datos.clienteId,
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

    return NextResponse.json(
      { mensaje: 'Evento creado exitosamente', evento },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al crear evento:', error)
    return NextResponse.json(
      { error: 'Error al crear evento' },
      { status: 500 }
    )
  }
}
