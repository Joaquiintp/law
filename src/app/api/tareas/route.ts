import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validación para crear tarea
const tareaSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido'),
  descripcion: z.string().optional(),
  estado: z.enum(['PENDIENTE', 'IMPORTANTE', 'HECHO', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA']),
  expedienteId: z.string(),
  asignadoId: z.string(),
  fechaVencimiento: z.string().transform(str => new Date(str)),
  prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
})

// GET /api/tareas - Listar tareas con filtros
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener estudio del usuario
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

    const { searchParams } = new URL(request.url)
    const expedienteId = searchParams.get('expedienteId')
    const estado = searchParams.get('estado')
    const asignadoId = searchParams.get('asignadoId')

    // Construir filtros
    const where: any = {
      expediente: {
        estudioId: user.estudio.id
      }
    }

    if (expedienteId) {
      where.expedienteId = expedienteId
    }

    if (estado) {
      where.estado = estado
    }

    if (asignadoId) {
      where.asignadoId = asignadoId
    }

    const tareas = await prisma.tarea.findMany({
      where,
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
      },
      orderBy: {
        fechaVencimiento: 'asc'
      }
    })

    return NextResponse.json(tareas)
  } catch (error) {
    console.error('Error al obtener tareas:', error)
    return NextResponse.json(
      { error: 'Error al obtener tareas' },
      { status: 500 }
    )
  }
}

// POST /api/tareas - Crear nueva tarea
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener estudio del usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        estudio: { select: { id: true } } 
      }
    })

    if (!user || !user.estudio) {
      return NextResponse.json(
        { error: 'Usuario sin estudio asignado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validar datos
    const validacion = tareaSchema.safeParse(body)
    
    if (!validacion.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validacion.error.issues },
        { status: 400 }
      )
    }

    const { titulo, descripcion, estado, expedienteId, asignadoId, fechaVencimiento, prioridad } = validacion.data

    // Verificar que el expediente pertenece al estudio
    const expediente = await prisma.expediente.findUnique({
      where: { id: expedienteId },
      select: { estudioId: true }
    })

    if (!expediente || expediente.estudioId !== user.estudio.id) {
      return NextResponse.json(
        { error: 'Expediente no encontrado o no pertenece al estudio' },
        { status: 404 }
      )
    }

    // Verificar que el usuario asignado pertenece al estudio
    const usuarioAsignado = await prisma.user.findUnique({
      where: { id: asignadoId },
      select: { estudioId: true }
    })

    if (!usuarioAsignado || usuarioAsignado.estudioId !== user.estudio.id) {
      return NextResponse.json(
        { error: 'Usuario asignado no encontrado o no pertenece al estudio' },
        { status: 404 }
      )
    }

    // Crear tarea
    const tarea = await prisma.tarea.create({
      data: {
        titulo,
        descripcion,
        estado,
        expedienteId,
        asignadoId,
        fechaVencimiento,
        prioridad: prioridad || 'MEDIA',
      },
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

    return NextResponse.json(tarea, { status: 201 })
  } catch (error) {
    console.error('Error al crear tarea:', error)
    return NextResponse.json(
      { error: 'Error al crear tarea' },
      { status: 500 }
    )
  }
}
