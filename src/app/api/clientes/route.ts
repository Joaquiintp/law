import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const clienteSchema = z.object({
  razonSocial: z.string().min(2, 'La razón social debe tener al menos 2 caracteres'),
  email: z.string().email().optional().nullable(),
  telefono: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  tipoPersona: z.enum(['FISICA', 'JURIDICA']),
  cuitCuil: z.string().optional().nullable(),
  documento: z.string().default(''),
  tipoDocumento: z.enum(['DNI', 'CUIT', 'CUIL', 'PASAPORTE', 'LC', 'LE']).default('DNI'),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'SUSPENDIDO']),
  cbu: z.string().length(22, 'El CBU debe tener exactamente 22 caracteres').optional().nullable(),
  banco: z.string().optional().nullable(),
  aliasBancario: z.string().optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener estudioId del usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { estudioId: true }
    })

    if (!user?.estudioId) {
      return NextResponse.json({ error: 'Usuario sin estudio asignado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const estado = searchParams.get('estado') || ''

    const where: Record<string, unknown> = {
      estudioId: user.estudioId // Filtrar por estudio
    }

    if (search) {
      where.OR = [
        { razonSocial: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { telefono: { contains: search } },
        { cuitCuil: { contains: search } },
      ]
    }

    if (estado && ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'].includes(estado)) {
      where.estado = estado
    }

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        include: {
          _count: {
            select: {
              expedientes: true,
              facturas: true,
            }
          }
        },
        orderBy: {
          razonSocial: 'asc'
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cliente.count({ where })
    ])

    return NextResponse.json({
      clientes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching clientes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener usuario con estudio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        estudioId: true
      }
    })

    if (!user || !user.estudioId) {
      return NextResponse.json({ error: 'Usuario sin estudio asignado' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = clienteSchema.parse(body)

    // Verificar si ya existe un cliente con el mismo email (si se proporciona)
    if (validatedData.email) {
      const existingCliente = await prisma.cliente.findFirst({
        where: { email: validatedData.email }
      })
      
      if (existingCliente) {
        return NextResponse.json(
          { error: 'Ya existe un cliente con ese email' },
          { status: 400 }
        )
      }
    }

    // Verificar CUIT/CUIL único (si se proporciona)
    if (validatedData.cuitCuil) {
      const existingCuit = await prisma.cliente.findFirst({
        where: { cuitCuil: validatedData.cuitCuil }
      })
      
      if (existingCuit) {
        return NextResponse.json(
          { error: 'Ya existe un cliente con ese CUIT/CUIL' },
          { status: 400 }
        )
      }
    }

    const cliente = await prisma.cliente.create({
      data: {
        ...validatedData,
        estudioId: user.estudioId
      },
      include: {
        _count: {
          select: {
            expedientes: true,
            facturas: true,
          }
        }
      }
    })

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    console.error('Error creating cliente:', error)
    
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
