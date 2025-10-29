import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; notaId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const notaId = params.notaId
    const body = await req.json()
    const { texto } = body

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

    // Verificar que la nota exista y pertenezca al usuario
    const notaExistente = await prisma.notaExpediente.findUnique({
      where: { id: notaId }
    })

    if (!notaExistente) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 })
    }

    if (notaExistente.autorId !== usuario.id) {
      return NextResponse.json({ error: 'No tienes permiso para editar esta nota' }, { status: 403 })
    }

    // Actualizar la nota
    const notaActualizada = await prisma.notaExpediente.update({
      where: { id: notaId },
      data: {
        texto,
        editado: true,
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

    return NextResponse.json(notaActualizada)
  } catch (error) {
    console.error('Error al actualizar nota:', error)
    return NextResponse.json(
      { error: 'Error al actualizar nota' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; notaId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const notaId = params.notaId

    // Obtener el usuario actual
    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Verificar que la nota exista y pertenezca al usuario
    const notaExistente = await prisma.notaExpediente.findUnique({
      where: { id: notaId }
    })

    if (!notaExistente) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 })
    }

    if (notaExistente.autorId !== usuario.id) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar esta nota' }, { status: 403 })
    }

    // Eliminar la nota
    await prisma.notaExpediente.delete({
      where: { id: notaId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar nota:', error)
    return NextResponse.json(
      { error: 'Error al eliminar nota' },
      { status: 500 }
    )
  }
}
