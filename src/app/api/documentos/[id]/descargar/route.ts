import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'

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

    // Buscar el documento
    const documento = await prisma.documento.findUnique({
      where: {
        id: documentoId
      },
      include: {
        expediente: true,
        creador: {
          select: {
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

    // Verificar permisos - aquí podrías agregar lógica más compleja
    // Por ahora, todos los usuarios autenticados pueden descargar

    try {
      // Leer el archivo
      const rutaCompleta = join(process.cwd(), documento.rutaArchivo)
      const buffer = await readFile(rutaCompleta)

      // Determinar el Content-Type basado en la extensión
      const contentTypes: { [key: string]: string } = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'txt': 'text/plain'
      }

      const contentType = contentTypes[documento.extension] || 'application/octet-stream'

      // Registrar la descarga
      await prisma.actividadLog.create({
        data: {
          accion: 'DOCUMENTO_DESCARGADO',
          descripcion: `Documento "${documento.nombre}" descargado`,
          entidad: 'DOCUMENTO',
          entidadId: documento.id,
          userId: session.user.id
        }
      })

      // Crear la respuesta con el archivo
      const response = new NextResponse(buffer)
      
      response.headers.set('Content-Type', contentType)
      response.headers.set(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(documento.nombre)}.${documento.extension}"`
      )
      response.headers.set('Content-Length', buffer.length.toString())

      return response

    } catch (fileError) {
      console.error('Error al leer archivo:', fileError)
      return NextResponse.json(
        { message: 'Archivo no disponible' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Error al descargar documento:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
