import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createExpedienteSchema = z.object({
  numero: z.string().min(1),
  caratula: z.string().min(1),
  fuero: z.enum(['CIVIL', 'COMERCIAL', 'PENAL', 'LABORAL', 'FAMILIA', 'CONTENCIOSO_ADMINISTRATIVO', 'FEDERAL']),
  materia: z.enum(['CIVIL_CONTRACTUAL', 'CIVIL_EXTRACONTRACTUAL', 'COMERCIAL', 'LABORAL', 'PENAL', 'FAMILIA_DIVORCIO', 'FAMILIA_ALIMENTOS', 'SUCESIONES', 'ADMINISTRATIVO', 'TRIBUTARIO', 'INMOBILIARIO']),
  clienteId: z.string().min(1),
  responsableId: z.string().min(1),
  juzgado: z.string().optional(),
  secretaria: z.string().optional(),
  descripcion: z.string().optional(),
  observaciones: z.string().optional(),
  fechaProximaAudiencia: z.string().nullable().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const data = createExpedienteSchema.parse(body)

    // Verificar que el número de expediente no exista
    const existingExpediente = await prisma.expediente.findUnique({
      where: {
        numero: data.numero
      }
    })

    if (existingExpediente) {
      return NextResponse.json(
        { error: 'Ya existe un expediente con ese número' }, 
        { status: 400 }
      )
    }

    // Buscar el usuario creador
    const creador = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    })

    if (!creador) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Crear el expediente
    const expediente = await prisma.expediente.create({
      data: {
        numero: data.numero,
        caratula: data.caratula,
        fuero: data.fuero,
        materia: data.materia,
        juzgado: data.juzgado,
        secretaria: data.secretaria,
        descripcion: data.descripcion,
        observaciones: data.observaciones,
        fechaProximaAudiencia: data.fechaProximaAudiencia 
          ? new Date(data.fechaProximaAudiencia)
          : null,
        clienteId: data.clienteId,
        responsableId: data.responsableId,
        creadorId: creador.id,
      },
      include: {
        cliente: true,
        responsable: true,
        creador: true,
      }
    })

    // Log de actividad
    await prisma.actividadLog.create({
      data: {
        accion: 'CREATE',
        descripcion: `Expediente creado: ${expediente.numero}`,
        entidad: 'Expediente',
        entidadId: expediente.id,
        userId: creador.id,
      }
    })

    return NextResponse.json(expediente)

  } catch (error) {
    console.error('Error creating expediente:', error)
    
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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let whereClause = {}

    // Si hay búsqueda, filtrar por número o carátula
    if (search) {
      whereClause = {
        OR: [
          {
            numero: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            caratula: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            cliente: {
              nombre: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        ]
      }
    }

    const expedientes = await prisma.expediente.findMany({
      where: whereClause,
      include: {
        cliente: true,
        responsable: true,
        creador: true,
        _count: {
          select: {
            documentos: true,
            audiencias: true,
            tareas: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: search ? 10 : undefined // Limitar resultados si es búsqueda
    })

    return NextResponse.json(expedientes)

  } catch (error) {
    console.error('Error fetching expedientes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
