import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ReporteDetallado from '@/components/reportes/ReporteDetallado'

async function getReporteDetallado(userId: string, tipo: string, periodo: string) {
  const fechaInicio = getFechaInicio(periodo)
  
  switch (tipo) {
    case 'clientes':
      return await getReporteClientes(userId, fechaInicio)
    case 'expedientes':
      return await getReporteExpedientes(userId, fechaInicio)
    case 'financiero':
      return await getReporteFinanciero(userId, fechaInicio)
    case 'productividad':
      return await getReporteProductividad(userId, fechaInicio)
    default:
      return null
  }
}

function getFechaInicio(periodo: string): Date {
  const ahora = new Date()
  switch (periodo) {
    case '1mes':
      return new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate())
    case '3meses':
      return new Date(ahora.getFullYear(), ahora.getMonth() - 3, ahora.getDate())
    case '6meses':
      return new Date(ahora.getFullYear(), ahora.getMonth() - 6, ahora.getDate())
    case '1ano':
      return new Date(ahora.getFullYear() - 1, ahora.getMonth(), ahora.getDate())
    default:
      return new Date(ahora.getFullYear(), ahora.getMonth() - 6, ahora.getDate())
  }
}

async function getReporteClientes(userId: string, fechaInicio: Date) {
  const [
    clientesTotales,
    clientesNuevos,
    clientesConExpedientesActivos,
    topClientesPorFacturacion,
    evolucionClientes
  ] = await Promise.all([
    prisma.cliente.count(),
    
    prisma.cliente.count({
      where: {
        createdAt: {
          gte: fechaInicio
        }
      }
    }),
    
    prisma.cliente.count({
      where: {
        expedientes: {
          some: {
            estado: 'ACTIVO'
          }
        }
      }
    }),
    
    prisma.cliente.findMany({
      include: {
        facturas: {
          select: {
            total: true
          }
        },
        expedientes: {
          select: {
            id: true,
            estado: true
          }
        }
      },
      take: 10
    }),
    
    prisma.cliente.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: fechaInicio
        }
      },
      _count: { id: true }
    })
  ])

  return {
    tipo: 'clientes',
    periodo: fechaInicio,
    resumen: {
      total: clientesTotales,
      nuevos: clientesNuevos,
      activos: clientesConExpedientesActivos
    },
    detalles: {
      topClientes: topClientesPorFacturacion.map(cliente => ({
        ...cliente,
        totalFacturado: cliente.facturas.reduce((sum, f) => sum + f.total, 0),
        expedientesActivos: cliente.expedientes.filter(e => e.estado === 'ACTIVO').length
      })),
      evolucion: evolucionClientes
    }
  }
}

async function getReporteExpedientes(userId: string, fechaInicio: Date) {
  const [
    expedientesTotales,
    expedientesNuevos,
    expedientesPorEstado,
    expedientesPorMateria,
    tiempoPromedioCierre
  ] = await Promise.all([
    prisma.expediente.count({
      where: { creadorId: userId }
    }),
    
    prisma.expediente.count({
      where: {
        creadorId: userId,
        createdAt: {
          gte: fechaInicio
        }
      }
    }),
    
    prisma.expediente.groupBy({
      by: ['estado'],
      where: { creadorId: userId },
      _count: { id: true }
    }),
    
    prisma.expediente.groupBy({
      by: ['materia'],
      where: { creadorId: userId },
      _count: { id: true }
    }),
    
    prisma.expediente.findMany({
      where: {
        creadorId: userId,
        estado: 'CERRADO',
        fechaCierre: {
          not: null
        }
      },
      select: {
        createdAt: true,
        fechaCierre: true
      }
    })
  ])

  return {
    tipo: 'expedientes',
    periodo: fechaInicio,
    resumen: {
      total: expedientesTotales,
      nuevos: expedientesNuevos,
      porEstado: expedientesPorEstado,
      porMateria: expedientesPorMateria
    },
    detalles: {
      tiempoPromedio: calcularTiempoPromedio(tiempoPromedioCierre)
    }
  }
}

async function getReporteFinanciero(userId: string, fechaInicio: Date) {
  const [
    facturacionTotal,
    facturacionPeriodo,
    facturasPendientes,
    facturasVencidas,
    evolucionFacturacion
  ] = await Promise.all([
    prisma.factura.aggregate({
      _sum: { total: true }
    }),
    
    prisma.factura.aggregate({
      where: {
        createdAt: {
          gte: fechaInicio
        }
      },
      _sum: { total: true }
    }),
    
    prisma.factura.aggregate({
      where: {
        estado: 'PENDIENTE'
      },
      _sum: { total: true },
      _count: { id: true }
    }),
    
    prisma.factura.aggregate({
      where: {
        estado: 'PENDIENTE',
        fechaVencimiento: {
          lt: new Date()
        }
      },
      _sum: { total: true },
      _count: { id: true }
    }),
    
    prisma.factura.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: fechaInicio
        }
      },
      _sum: { total: true }
    })
  ])

  return {
    tipo: 'financiero',
    periodo: fechaInicio,
    resumen: {
      totalGeneral: facturacionTotal._sum.total || 0,
      totalPeriodo: facturacionPeriodo._sum.total || 0,
      pendiente: facturasPendientes._sum.total || 0,
      vencidas: facturasVencidas._sum.total || 0,
      cantidadPendientes: facturasPendientes._count || 0,
      cantidadVencidas: facturasVencidas._count || 0
    },
    detalles: {
      evolucion: evolucionFacturacion
    }
  }
}

async function getReporteProductividad(userId: string, fechaInicio: Date) {
  const [
    documentosCreados,
    audienciasRealizadas,
    consultasIA,
    actividadDiaria
  ] = await Promise.all([
    prisma.documento.count({
      where: {
        creadorId: userId,
        createdAt: {
          gte: fechaInicio
        }
      }
    }),
    
    prisma.audiencia.count({
      where: {
        responsableId: userId,
        fecha: {
          gte: fechaInicio
        }
      }
    }),
    
    prisma.consultaIA.count({
      where: {
        usuarioId: userId,
        createdAt: {
          gte: fechaInicio
        }
      }
    }),
    
    // Actividad diaria (simulada por ahora)
    Promise.resolve([])
  ])

  return {
    tipo: 'productividad',
    periodo: fechaInicio,
    resumen: {
      documentos: documentosCreados,
      audiencias: audienciasRealizadas,
      consultasIA: consultasIA
    },
    detalles: {
      actividad: actividadDiaria
    }
  }
}

function calcularTiempoPromedio(expedientes: Array<{createdAt: Date, fechaCierre: Date | null}>) {
  const expedientesConCierre = expedientes.filter(e => e.fechaCierre)
  if (expedientesConCierre.length === 0) return 0
  
  const tiempos = expedientesConCierre.map(e => {
    if (!e.fechaCierre) return 0
    return Math.abs(e.fechaCierre.getTime() - e.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  })
  
  return Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length)
}

export default async function ReporteDetalladoPage({
  searchParams
}: {
  searchParams: Promise<{ tipo?: string; periodo?: string }>
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const params = await searchParams
  const tipo = params.tipo || 'clientes'
  const periodo = params.periodo || '6meses'
  
  const datosReporte = await getReporteDetallado(session.user.id, tipo, periodo)

  if (!datosReporte) {
    redirect('/reportes')
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <Suspense fallback={<div>Cargando reporte detallado...</div>}>
        <ReporteDetallado 
          datos={datosReporte}
          userId={session.user.id}
        />
      </Suspense>
    </div>
  )
}
