import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ClientesList from '@/components/clientes/ClientesList'

export default async function ClientesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Obtener clientes con estadísticas de expedientes
  const clientes = await prisma.cliente.findMany({
    include: {
      expedientes: {
        select: {
          id: true,
          numero: true,
          estado: true,
          fechaInicio: true,
        }
      },
      facturas: {
        select: {
          id: true,
          total: true,
          estado: true,
        }
      },
      _count: {
        select: {
          expedientes: true,
          facturas: true,
        }
      }
    },
    orderBy: {
      razonSocial: 'asc'
    }
  })

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
      </div>
      
      <ClientesList clientes={clientes} />
    </div>
  )
}
