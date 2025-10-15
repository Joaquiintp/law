import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const clienteSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  email: z.string().email().optional().nullable(),
  telefono: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  tipoPersona: z.enum(['FISICA', 'JURIDICA']),
  cuitCuil: z.string().optional().nullable(),
  razonSocial: z.string().optional().nullable(),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'SUSPENDIDO']),
  cbu: z.string().optional().nullable(),
  banco: z.string().optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const estado = searchParams.get('estado') || ''

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { telefono: { contains: search } },
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
          apellido: 'asc'
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
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
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
      data: validatedData,
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
