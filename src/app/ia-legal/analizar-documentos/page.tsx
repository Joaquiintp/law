import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AnalizadorDocumentos from '@/components/ia-legal/AnalizadorDocumentos'

async function getDocumentos(userId: string) {
  return await prisma.documento.findMany({
    where: {
      creador: {
        id: userId
      }
    },
    include: {
      expediente: {
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      },
      consultasIA: {
        where: {
          tipo: 'ANALISIS_DOCUMENTO'
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50
  })
}

async function getHistorialAnalisis(userId: string) {
  return await prisma.consultaIA.findMany({
    where: {
      usuarioId: userId,
      tipo: 'ANALISIS_DOCUMENTO'
    },
    include: {
      documento: {
        select: {
          id: true,
          nombre: true,
          tipoDocumento: true
        }
      },
      expediente: {
        select: {
          id: true,
          numero: true,
          caratula: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 20
  })
}

export default async function AnalizarDocumentosPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const [documentos, historialAnalisis] = await Promise.all([
    getDocumentos(session.user.id),
    getHistorialAnalisis(session.user.id)
  ])

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Análisis de Documentos con IA
        </h1>
        <p className="text-gray-600">
          Analiza contratos, demandas y otros documentos legales con inteligencia artificial
        </p>
      </div>

      <Suspense fallback={<div>Cargando analizador...</div>}>
        <AnalizadorDocumentos 
          documentos={documentos}
          historial={historialAnalisis}
          userId={session.user.id}
        />
      </Suspense>
    </div>
  )
}
