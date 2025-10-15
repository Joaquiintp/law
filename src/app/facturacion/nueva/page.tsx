import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import NuevaFacturaForm from '@/components/facturacion/NuevaFacturaForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

async function getClientesActivos() {
  return await prisma.cliente.findMany({
    where: {
      estado: 'ACTIVO'
    },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
      cuitCuil: true,
      condicionIva: true
    },
    orderBy: {
      apellido: 'asc'
    }
  })
}

async function getHonorariosPendientes() {
  return await prisma.honorario.findMany({
    where: {
      estado: 'PENDIENTE',
      facturaId: null // No facturados aún
    },
    include: {
      expediente: {
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellido: true
            }
          }
        }
      }
    },
    orderBy: {
      fechaServicio: 'desc'
    }
  })
}

async function getConfiguracionFacturacion() {
  // Aquí podrías tener una tabla de configuración
  // Por ahora devolvemos valores por defecto
  return {
    puntoVenta: 1,
    numeroSiguiente: await getProximoNumeroFactura(),
    iva: 21,
    monedaDefecto: 'ARS'
  }
}

async function getProximoNumeroFactura() {
  const ultimaFactura = await prisma.factura.findFirst({
    orderBy: {
      numero: 'desc'
    },
    select: {
      numero: true
    }
  })

  if (!ultimaFactura) {
    return 'FAC-0001'
  }

  const numero = ultimaFactura.numero
  const partes = numero.split('-')
  if (partes.length === 2) {
    const numeroInt = parseInt(partes[1]) + 1
    return `FAC-${numeroInt.toString().padStart(4, '0')}`
  }

  return 'FAC-0001'
}

export default async function NuevaFacturaPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const [clientes, honorarios, config] = await Promise.all([
    getClientesActivos(),
    getHonorariosPendientes(),
    getConfiguracionFacturacion()
  ])

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Nueva Factura
        </h1>
        <p className="text-gray-600">
          Crear una nueva factura para servicios legales
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Datos de la Factura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Cargando formulario...</div>}>
              <NuevaFacturaForm 
                clientes={clientes}
                honorarios={honorarios}
                config={config}
                userId={session.user.id}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
