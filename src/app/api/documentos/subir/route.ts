import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const archivo = formData.get('archivo') as File
    const nombre = formData.get('nombre') as string
    const tipoDocumento = formData.get('tipoDocumento') as string
    const expedienteId = formData.get('expedienteId') as string
    const descripcion = formData.get('descripcion') as string | null
    const tags = formData.get('tags') as string | null
    const userId = formData.get('userId') as string

    if (!archivo) {
      return NextResponse.json(
        { message: 'No se ha proporcionado ningún archivo' },
        { status: 400 }
      )
    }

    if (!nombre || !tipoDocumento || !expedienteId) {
      return NextResponse.json(
        { message: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el expediente existe y el usuario tiene acceso
    const expediente = await prisma.expediente.findFirst({
      where: {
        id: expedienteId,
        // Aquí podrías agregar verificaciones de permisos
      }
    })

    if (!expediente) {
      return NextResponse.json(
        { message: 'Expediente no encontrado' },
        { status: 404 }
      )
    }

    // Generar información del archivo
    const bytes = await archivo.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const extension = archivo.name.split('.').pop()?.toLowerCase() || ''
    const nombreUnico = `${randomUUID()}.${extension}`
    
    // Crear estructura de directorios
    const uploadDir = join(process.cwd(), 'uploads', 'documentos')
    await mkdir(uploadDir, { recursive: true })
    
    // Guardar archivo
    const rutaArchivo = join(uploadDir, nombreUnico)
    await writeFile(rutaArchivo, buffer)

    // Obtener la versión del documento (si ya existe uno con el mismo nombre en el expediente)
    const documentoExistente = await prisma.documento.findFirst({
      where: {
        nombre,
        expedienteId
      },
      orderBy: {
        version: 'desc'
      }
    })

    const version = documentoExistente ? documentoExistente.version + 1 : 1

    // Crear registro en la base de datos
    const nuevoDocumento = await prisma.documento.create({
      data: {
        nombre,
        tipoDocumento: tipoDocumento as any,
        version,
        rutaArchivo: `uploads/documentos/${nombreUnico}`,
        tamaño: archivo.size,
        extension,
        descripcion,
        tags,
        expedienteId,
        creadorId: userId
      },
      include: {
        expediente: {
          include: {
            cliente: {
              select: {
                razonSocial: true,
                
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

    // Registrar actividad en el expediente
    await prisma.actividadLog.create({
      data: {
        accion: 'DOCUMENTO_SUBIDO',
        descripcion: `Documento "${nombre}" subido al expediente`,
        entidad: 'EXPEDIENTE',
        entidadId: expedienteId,
        userId: userId
      }
    })

    return NextResponse.json({
      id: nuevoDocumento.id,
      message: 'Documento subido correctamente',
      documento: nuevoDocumento
    })

  } catch (error) {
    console.error('Error al subir documento:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const expedienteId = searchParams.get('expedienteId')
    const tipo = searchParams.get('tipo')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (expedienteId) {
      where.expedienteId = expedienteId
    }

    if (tipo) {
      where.tipoDocumento = tipo
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [documentos, total] = await Promise.all([
      prisma.documento.findMany({
        where,
        include: {
          expediente: {
            include: {
              cliente: {
                select: {
                  razonSocial: true,
                  
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
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.documento.count({ where })
    ])

    return NextResponse.json({
      documentos,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('Error al obtener documentos:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
