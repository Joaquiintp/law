import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validación para actualizar tarea
const tareaUpdateSchema = z.object({
  titulo: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  estado: z.enum(['PENDIENTE', 'IMPORTANTE', 'HECHO', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA']).optional(),
  asignadoId: z.string().optional(),
  fechaVencimiento: z.string().transform(str => new Date(str)).optional(),
  fechaCompletado: z.string().transform(str => new Date(str)).optional().nullable(),
  prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
})

// GET /api/tareas/[id] - Obtener tarea específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { estudio: { select: { id: true } } }
    })

    if (!user || !user.estudio) {
      return NextResponse.json(
        { error: 'Usuario sin estudio asignado' },
        { status: 403 }
      )
    }

    const tarea = await prisma.tarea.findUnique({
      where: { id: params.id },
      include: {
        expediente: {
          select: {
            id: true,
            numero: true,
            caratula: true,
            estudioId: true
          }
        },
        asignado: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!tarea) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que la tarea pertenece al estudio del usuario
    if (tarea.expediente.estudioId !== user.estudio.id) {
      return NextResponse.json(
        { error: 'No autorizado para acceder a esta tarea' },
        { status: 403 }
      )
    }

    return NextResponse.json(tarea)
  } catch (error) {
    console.error('Error al obtener tarea:', error)
    return NextResponse.json(
      { error: 'Error al obtener tarea' },
      { status: 500 }
    )
  }
}

// PUT /api/tareas/[id] - Actualizar tarea
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { estudio: { select: { id: true } } }
    })

    if (!user || !user.estudio) {
      return NextResponse.json(
        { error: 'Usuario sin estudio asignado' },
        { status: 403 }
      )
    }

    // Verificar que la tarea existe y pertenece al estudio
    const tareaExistente = await prisma.tarea.findUnique({
      where: { id: params.id },
      include: {
        expediente: {
          select: { estudioId: true }
        }
      }
    })

    if (!tareaExistente) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      )
    }

    if (tareaExistente.expediente.estudioId !== user.estudio.id) {
      return NextResponse.json(
        { error: 'No autorizado para modificar esta tarea' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validar datos
    const validacion = tareaUpdateSchema.safeParse(body)
    
    if (!validacion.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validacion.error.issues },
        { status: 400 }
      )
    }

    const updateData: any = { ...validacion.data }

    // Si el estado cambia a HECHO o COMPLETADA, establecer fechaCompletado
    if ((updateData.estado === 'HECHO' || updateData.estado === 'COMPLETADA') && !tareaExistente.fechaCompletado) {
      updateData.fechaCompletado = new Date()
    }

    // Actualizar tarea
    const tareaActualizada = await prisma.tarea.update({
      where: { id: params.id },
      data: updateData,
      include: {
        expediente: {
          select: {
            id: true,
            numero: true,
            caratula: true
          }
        },
        asignado: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(tareaActualizada)
  } catch (error) {
    console.error('Error al actualizar tarea:', error)
    return NextResponse.json(
      { error: 'Error al actualizar tarea' },
      { status: 500 }
    )
  }
}

// DELETE /api/tareas/[id] - Eliminar tarea
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { estudio: { select: { id: true } } }
    })

    if (!user || !user.estudio) {
      return NextResponse.json(
        { error: 'Usuario sin estudio asignado' },
        { status: 403 }
      )
    }

    // Verificar que la tarea existe y pertenece al estudio
    const tarea = await prisma.tarea.findUnique({
      where: { id: params.id },
      include: {
        expediente: {
          select: { estudioId: true }
        }
      }
    })

    if (!tarea) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      )
    }

    if (tarea.expediente.estudioId !== user.estudio.id) {
      return NextResponse.json(
        { error: 'No autorizado para eliminar esta tarea' },
        { status: 403 }
      )
    }

    // Eliminar tarea
    await prisma.tarea.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Tarea eliminada correctamente' 
    })
  } catch (error) {
    console.error('Error al eliminar tarea:', error)
    return NextResponse.json(
      { error: 'Error al eliminar tarea' },
      { status: 500 }
    )
  }
}
