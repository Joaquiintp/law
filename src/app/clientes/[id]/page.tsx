import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import ClienteDetail from '@/components/clientes/ClienteDetail'

interface ClientePageProps {
  params: {
    id: string
  }
}

export default async function ClientePage({ params }: ClientePageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const cliente = await prisma.cliente.findUnique({
    where: { id: params.id },
    include: {
      expedientes: {
        include: {
          _count: {
            select: {
              documentos: true,
              audiencias: true,
              tareas: true,
            }
          }
        },
        orderBy: {
          fechaInicio: 'desc'
        }
      },
      facturas: {
        orderBy: {
          createdAt: 'desc'
        }
      },
      _count: {
        select: {
          expedientes: true,
          facturas: true,
        }
      }
    }
  })

  if (!cliente) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <ClienteDetail cliente={cliente} />
    </div>
  )
}
