import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import MainLayout from '@/components/MainLayout'
import DocumentosList from '@/components/documentos/DocumentosList'

export default async function DocumentosPage({
  searchParams
}: {
  searchParams: Promise<{ expediente?: string; tipo?: string; search?: string }>
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Await searchParams
  const params = await searchParams

  // Construir filtros de búsqueda
  const where: any = {}
  
  if (params.expediente) {
    where.expedienteId = params.expediente
  }
  
  if (params.tipo) {
    where.tipoDocumento = params.tipo
  }
  
  if (params.search) {
    where.OR = [
      { nombre: { contains: params.search, mode: 'insensitive' } },
      { descripcion: { contains: params.search, mode: 'insensitive' } },
      { tags: { contains: params.search, mode: 'insensitive' } }
    ]
  }

  // Obtener documentos con relaciones
  const documentos = await prisma.documento.findMany({
    where,
    include: {
      expediente: {
        include: {
          cliente: {
            select: {
              nombre: true,
              apellido: true,
            }
          }
        }
      },
      creador: {
        select: {
          name: true,
          email: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50
  })

  // Obtener expedientes para el filtro
  const expedientes = await prisma.expediente.findMany({
    where: {
      estado: 'ACTIVO'
    },
    include: {
      cliente: {
        select: {
          nombre: true,
          apellido: true,
        }
      }
    },
    orderBy: {
      numero: 'desc'
    }
  })

  // Estadísticas rápidas
  const totalDocumentos = await prisma.documento.count()
  const documentosRecientes = await prisma.documento.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
      }
    }
  })

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Documentos</h1>
          <p className="text-muted-foreground">Repositorio centralizado de documentos legales</p>
        </div>
      </div>
      
      <DocumentosList 
        documentos={documentos}
        expedientes={expedientes}
        searchParams={params}
        stats={{
          total: totalDocumentos,
          recientes: documentosRecientes
        }}
      />
    </div>
  )
}
