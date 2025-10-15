import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ReportesDashboard from '@/components/reportes/ReportesDashboard'

async function getEstadisticasGenerales(userId: string) {
  const [
    totalExpedientes,
    expedientesActivos,
    totalClientes,
    clientesActivos,
    totalFacturacion,
    facturacionPendiente,
    audienciasPendientes,
    documentosCreados,
    consultasIA,
    expedientesPorEstado,
    facturacionPorMes,
    audienciasPorMes
  ] = await Promise.all([
    // Total de expedientes
    prisma.expediente.count({
      where: { creadorId: userId }
    }),
    
    // Expedientes activos
    prisma.expediente.count({
      where: { 
        creadorId: userId,
        estado: 'ACTIVO'
      }
    }),
    
    // Total de clientes
    prisma.cliente.count(),
    
    // Clientes activos (con expedientes activos)
    prisma.cliente.count({
      where: {
        expedientes: {
          some: {
            estado: 'ACTIVO'
          }
        }
      }
    }),
    
    // Total facturación
    prisma.factura.aggregate({
      _sum: { total: true }
    }),
    
    // Facturación pendiente
    prisma.factura.aggregate({
      where: { 
        estado: 'PENDIENTE'
      },
      _sum: { total: true }
    }),
    
    // Audiencias pendientes
    prisma.audiencia.count({
      where: {
        responsableId: userId,
        estado: 'PROGRAMADA'
      }
    }),
    
    // Documentos creados en el último mes
    prisma.documento.count({
      where: {
        creadorId: userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    
    // Consultas IA realizadas
    prisma.consultaIA.count({
      where: { usuarioId: userId }
    }),
    
    // Expedientes por estado
    prisma.expediente.groupBy({
      by: ['estado'],
      where: { creadorId: userId },
      _count: { id: true }
    }),
    
    // Facturación por mes (últimos 6 meses)
    prisma.factura.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
        }
      },
      _sum: { total: true }
    }),
    
    // Audiencias por mes (últimos 6 meses)
    prisma.audiencia.groupBy({
      by: ['fecha'],
      where: {
        responsableId: userId,
        fecha: {
          gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
        }
      },
      _count: { id: true }
    })
  ])

  return {
    resumenGeneral: {
      totalExpedientes,
      expedientesActivos,
      totalClientes,
      clientesActivos,
      totalFacturacion: totalFacturacion._sum.total || 0,
      facturacionPendiente: facturacionPendiente._sum.total || 0,
      audienciasPendientes,
      documentosCreados,
      consultasIA
    },
    graficos: {
      expedientesPorEstado,
      facturacionPorMes,
      audienciasPorMes
    }
  }
}

export default async function ReportesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const estadisticas = await getEstadisticasGenerales(session.user.id)

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Reportes y Analytics
        </h1>
        <p className="text-gray-600">
          Análisis detallado del rendimiento y métricas de tu estudio jurídico
        </p>
      </div>

      <Suspense fallback={<div>Cargando reportes...</div>}>
        <ReportesDashboard 
          estadisticas={estadisticas}
          userId={session.user.id}
        />
      </Suspense>
    </div>
  )
}
