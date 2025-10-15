import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AsistenteIADashboard from '@/components/ia-legal/AsistenteIADashboard'

async function getEstadisticasIA() {
  // Obtener consultas recientes del usuario
  const consultasRecientes = await prisma.consultaIA.findMany({
    include: {
      usuario: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  })

  // Estadísticas generales
  const totalConsultas = await prisma.consultaIA.count()
  
  const consultasHoy = await prisma.consultaIA.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    }
  })

  const consultasPorTipo = await prisma.consultaIA.groupBy({
    by: ['tipo'],
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    }
  })

  // Expedientes que podrían beneficiarse de análisis IA
  const expedientesParaAnalisis = await prisma.expediente.findMany({
    where: {
      estado: 'ACTIVO',
      // Expedientes que no han sido analizados recientemente
      NOT: {
        consultasIA: {
          some: {
            tipo: 'ANALISIS_EXPEDIENTE',
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Última semana
            }
          }
        }
      }
    },
    include: {
      cliente: {
        select: {
          nombre: true,
          apellido: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    },
    take: 5
  })

  return {
    consultasRecientes,
    estadisticas: {
      total: totalConsultas,
      hoy: consultasHoy,
      porTipo: consultasPorTipo
    },
    expedientesParaAnalisis
  }
}

export default async function IALegalPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const data = await getEstadisticasIA()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Asistente IA Legal</h1>
        <p className="mt-2 text-gray-600">
          Consulta con inteligencia artificial especializada en temas legales
        </p>
      </div>
      
      <Suspense fallback={<div>Cargando...</div>}>
        <AsistenteIADashboard data={data} userId={session.user.id} />
      </Suspense>
    </div>
  )
}
