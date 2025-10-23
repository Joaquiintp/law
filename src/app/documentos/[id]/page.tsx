import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DocumentoDetailView from '@/components/documentos/DocumentoDetailView'

async function getDocumento(id: string) {
  return await prisma.documento.findUnique({
    where: { id },
    include: {
      expediente: {
        include: {
          cliente: {
            select: {
              id: true,
              razonSocial: true,
              
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
}

async function getVersionesDocumento(nombre: string, expedienteId: string) {
  return await prisma.documento.findMany({
    where: {
      nombre,
      expedienteId
    },
    include: {
      creador: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      version: 'desc'
    }
  })
}

async function getActividadDocumento(documentoId: string) {
  return await prisma.actividadLog.findMany({
    where: {
      entidad: 'DOCUMENTO',
      entidadId: documentoId
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 20
  })
}

export default async function DocumentoDetailPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const documento = await getDocumento(params.id)
  
  if (!documento) {
    notFound()
  }

  const [versiones, actividad] = await Promise.all([
    getVersionesDocumento(documento.nombre, documento.expedienteId),
    getActividadDocumento(documento.id)
  ])

  return (
    <div className="container mx-auto px-6 py-8">
      <Suspense fallback={<div>Cargando documento...</div>}>
        <DocumentoDetailView 
          documento={documento}
          versiones={versiones}
          actividad={actividad}
        />
      </Suspense>
    </div>
  )
}
