import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import FacturasList from '@/components/facturacion/FacturasList'

async function getFacturasConFiltros(searchParams: any) {
  const {
    clienteId,
    estado,
    fechaDesde,
    fechaHasta,
    search,
    page = '1',
    limit = '20'
  } = searchParams

  const where: any = {}

  if (clienteId) {
    where.clienteId = clienteId
  }

  if (estado) {
    where.estado = estado
  }

  if (fechaDesde || fechaHasta) {
    where.fecha = {}
    if (fechaDesde) {
      where.fecha.gte = new Date(fechaDesde)
    }
    if (fechaHasta) {
      where.fecha.lte = new Date(fechaHasta)
    }
  }

  if (search) {
    where.OR = [
      { numero: { contains: search, mode: 'insensitive' } },
      { cliente: { 
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { apellido: { contains: search, mode: 'insensitive' } }
        ]
      }}
    ]
  }

  const [facturas, total] = await Promise.all([
    prisma.factura.findMany({
      where,
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
            monto: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    }),
    prisma.factura.count({ where })
  ])

  return {
    facturas,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit))
  }
}

async function getClientesParaFiltro() {
  return await prisma.cliente.findMany({
    where: {
      estado: 'ACTIVO'
    },
    select: {
      id: true,
      nombre: true,
      apellido: true
    },
    orderBy: {
      apellido: 'asc'
    }
  })
}

export default async function TodasFacturasPage({
  searchParams
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const [data, clientes] = await Promise.all([
    getFacturasConFiltros(searchParams),
    getClientesParaFiltro()
  ])

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Todas las Facturas
        </h1>
        <p className="text-gray-600">
          Gestión completa del historial de facturación
        </p>
      </div>

      <Suspense fallback={<div>Cargando facturas...</div>}>
        <FacturasList 
          data={data}
          clientes={clientes}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  )
}
