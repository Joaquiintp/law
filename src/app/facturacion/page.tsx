import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import FacturacionDashboard from '@/components/facturacion/FacturacionDashboard'

async function getFacturacionData() {
  const now = new Date()
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1)
  const inicioAño = new Date(now.getFullYear(), 0, 1)
  const hace30Dias = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Obtener facturas recientes
  const facturas = await prisma.factura.findMany({
    include: {
      cliente: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true
        }
      },
      honorarios: {
        select: {
          id: true,
          concepto: true,
          monto: true,
          estado: true,
          fechaServicio: true
        }
      }
    },
    orderBy: {
      fecha: 'desc'
    },
    take: 10
  })

  // Estadísticas del mes actual
  const estadisticasMes = await prisma.factura.aggregate({
    where: {
      fecha: {
        gte: inicioMes
      }
    },
    _sum: {
      total: true
    },
    _count: {
      id: true
    }
  })

  // Estadísticas del año
  const estadisticasAño = await prisma.factura.aggregate({
    where: {
      fecha: {
        gte: inicioAño
      }
    },
    _sum: {
      total: true
    }
  })

  // Facturas pendientes de pago
  const facturasPendientes = await prisma.factura.aggregate({
    where: {
      estado: 'PENDIENTE'
    },
    _sum: {
      total: true
    },
    _count: {
      id: true
    }
  })

  // Facturas vencidas
  const facturasVencidas = await prisma.factura.aggregate({
    where: {
      estado: 'VENCIDA'
    },
    _sum: {
      total: true
    },
    _count: {
      id: true
    }
  })

  // Ingresos por mes (últimos 6 meses)
  const ingresosPorMes = await prisma.factura.groupBy({
    by: ['fecha'],
    where: {
      fecha: {
        gte: hace30Dias
      },
      estado: 'PAGADA'
    },
    _sum: {
      total: true
    }
  })

  // Top clientes por facturación
  const topClientes = await prisma.factura.groupBy({
    by: ['clienteId'],
    where: {
      fecha: {
        gte: inicioAño
      }
    },
    _sum: {
      total: true
    },
    _count: {
      id: true
    },
    orderBy: {
      _sum: {
        total: 'desc'
      }
    },
    take: 5
  })

  // Obtener datos de los clientes para el ranking
  const clientesIds = topClientes.map(tc => tc.clienteId)
  const clientesData = await prisma.cliente.findMany({
    where: {
      id: {
        in: clientesIds
      }
    },
    select: {
      id: true,
      nombre: true,
      apellido: true
    }
  })

  return {
    facturas,
    estadisticas: {
      totalMes: estadisticasMes._sum?.total || 0,
      facturasMes: estadisticasMes._count?.id || 0,
      totalAño: estadisticasAño._sum?.total || 0,
      pendientes: {
        total: facturasPendientes._sum?.total || 0,
        count: facturasPendientes._count?.id || 0
      },
      vencidas: {
        total: facturasVencidas._sum?.total || 0,
        count: facturasVencidas._count?.id || 0
      }
    },
    ingresosPorMes,
    topClientes: topClientes.map(tc => ({
      clienteId: tc.clienteId,
      _sum: tc._sum,
      _count: tc._count.id,
      cliente: clientesData.find(c => c.id === tc.clienteId)
    }))
  }
}

export default async function FacturacionPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const data = await getFacturacionData()

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Facturación y Finanzas
        </h1>
        <p className="text-gray-600">
          Gestión completa de honorarios, facturas y finanzas del estudio
        </p>
      </div>

      <Suspense fallback={<div>Cargando datos financieros...</div>}>
        <FacturacionDashboard data={data} />
      </Suspense>
    </div>
  )
}
