import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const expedienteId = params.id

    const notas = await prisma.notaExpediente.findMany({
      where: { expedienteId },
      include: {
        autor: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        archivoReferenciado: {
          select: {
            id: true,
            nombre: true,
            tipoDocumento: true,
          }
        },
        tareaReferenciada: {
          select: {
            id: true,
            tipo: true,
            titulo: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(notas)
  } catch (error) {
    console.error('Error al obtener notas:', error)
    return NextResponse.json(
      { error: 'Error al obtener notas' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const expedienteId = params.id
    const body = await req.json()
    const { texto, archivoReferenciadoId, tareaReferenciadaId } = body

    if (!texto?.trim()) {
      return NextResponse.json(
        { error: 'El texto de la nota es requerido' },
        { status: 400 }
      )
    }

    // Obtener el usuario actual
    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Crear la nota
    const nota = await prisma.notaExpediente.create({
      data: {
        texto,
        expedienteId,
        autorId: usuario.id,
        ...(archivoReferenciadoId && { archivoReferenciadoId }),
        ...(tareaReferenciadaId && { tareaReferenciadaId }),
      },
      include: {
        autor: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        archivoReferenciado: {
          select: {
            id: true,
            nombre: true,
            tipoDocumento: true,
          }
        },
        tareaReferenciada: {
          select: {
            id: true,
            tipo: true,
            titulo: true,
          }
        }
      }
    })

    return NextResponse.json(nota, { status: 201 })
  } catch (error) {
    console.error('Error al crear nota:', error)
    return NextResponse.json(
      { error: 'Error al crear nota' },
      { status: 500 }
    )
  }
}
