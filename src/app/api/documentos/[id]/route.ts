import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const documentoId = params.id

    // Buscar el documento
    const documento = await prisma.documento.findUnique({
      where: {
        id: documentoId
      },
      include: {
        expediente: true
      }
    })

    if (!documento) {
      return NextResponse.json(
        { message: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    // Verificar permisos - por ejemplo, solo el creador o admin puede eliminar
    // Por ahora permitimos que cualquier usuario autenticado elimine
    
    try {
      // Intentar eliminar el archivo físico
      const rutaCompleta = join(process.cwd(), documento.rutaArchivo)
      await unlink(rutaCompleta)
    } catch (fileError) {
      // El archivo puede no existir, continuamos con la eliminación del registro
      console.warn('No se pudo eliminar el archivo físico:', fileError)
    }

    // Eliminar el registro de la base de datos
    await prisma.documento.delete({
      where: {
        id: documentoId
      }
    })

    // Registrar la actividad
    await prisma.actividadLog.create({
      data: {
        accion: 'DOCUMENTO_ELIMINADO',
        descripcion: `Documento "${documento.nombre}" eliminado`,
        entidad: 'EXPEDIENTE',
        entidadId: documento.expedienteId,
        userId: session.user.id
      }
    })

    return NextResponse.json({
      message: 'Documento eliminado correctamente'
    })

  } catch (error) {
    console.error('Error al eliminar documento:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const documentoId = params.id

    const documento = await prisma.documento.findUnique({
      where: {
        id: documentoId
      },
      include: {
        expediente: {
          include: {
            cliente: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
                telefono: true
              }
            }
          }
        },
        creador: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!documento) {
      return NextResponse.json(
        { message: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(documento)

  } catch (error) {
    console.error('Error al obtener documento:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const documentoId = params.id
    const { nombre, tipoDocumento, descripcion, tags } = await request.json()

    const documentoActualizado = await prisma.documento.update({
      where: {
        id: documentoId
      },
      data: {
        nombre,
        tipoDocumento,
        descripcion,
        tags,
        updatedAt: new Date()
      },
      include: {
        expediente: {
          include: {
            cliente: {
              select: {
                nombre: true,
                apellido: true
              }
            }
          }
        },
        creador: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Registrar la actividad
    await prisma.actividadLog.create({
      data: {
        accion: 'DOCUMENTO_ACTUALIZADO',
        descripcion: `Documento "${nombre}" actualizado`,
        entidad: 'DOCUMENTO',
        entidadId: documentoId,
        userId: session.user.id
      }
    })

    return NextResponse.json({
      message: 'Documento actualizado correctamente',
      documento: documentoActualizado
    })

  } catch (error) {
    console.error('Error al actualizar documento:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
