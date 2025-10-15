import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const clienteUpdateSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  email: z.string().email().optional().nullable(),
  telefono: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  tipoPersona: z.enum(['FISICA', 'JURIDICA']),
  cuitCuil: z.string().optional().nullable(),
  razonSocial: z.string().optional().nullable(),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'SUSPENDIDO']),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        expedientes: {
          include: {
            _count: {
              select: {
                documentos: true,
                audiencias: true,
                tareas: true,
              }
            }
          },
          orderBy: {
            fechaInicio: 'desc'
          }
        },
        facturas: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            expedientes: true,
            facturas: true,
          }
        }
      }
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Error fetching cliente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = clienteUpdateSchema.parse(body)

    // Verificar que el cliente existe
    const existingCliente = await prisma.cliente.findUnique({
      where: { id }
    })

    if (!existingCliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Verificar email único (excluyendo el cliente actual)
    if (validatedData.email && validatedData.email !== existingCliente.email) {
      const emailExists = await prisma.cliente.findFirst({
        where: { 
          email: validatedData.email,
          id: { not: id }
        }
      })
      
      if (emailExists) {
        return NextResponse.json(
          { error: 'Ya existe otro cliente con ese email' },
          { status: 400 }
        )
      }
    }

    // Verificar CUIT/CUIL único (excluyendo el cliente actual)
    if (validatedData.cuitCuil && validatedData.cuitCuil !== existingCliente.cuitCuil) {
      const cuitExists = await prisma.cliente.findFirst({
        where: { 
          cuitCuil: validatedData.cuitCuil,
          id: { not: id }
        }
      })
      
      if (cuitExists) {
        return NextResponse.json(
          { error: 'Ya existe otro cliente con ese CUIT/CUIL' },
          { status: 400 }
        )
      }
    }

    const updatedCliente = await prisma.cliente.update({
      where: { id },
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

    return NextResponse.json(updatedCliente)
  } catch (error) {
    console.error('Error updating cliente:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Verificar que el cliente existe
    const existingCliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            expedientes: true,
            facturas: true,
          }
        }
      }
    })

    if (!existingCliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Verificar si tiene expedientes o facturas asociadas
    if (existingCliente._count.expedientes > 0 || existingCliente._count.facturas > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar el cliente porque tiene expedientes o facturas asociadas. Cambia su estado a INACTIVO en su lugar.' 
        },
        { status: 400 }
      )
    }

    await prisma.cliente.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Cliente eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting cliente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
