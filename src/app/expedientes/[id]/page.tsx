import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import ExpedienteDetail from '@/components/expedientes/ExpedienteDetail'

interface ExpedientePageProps {
  params: {
    id: string
  }
}

export default async function ExpedientePage({ params }: ExpedientePageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const expediente = await prisma.expediente.findUnique({
    where: {
      id: params.id
    },
    include: {
      cliente: true,
      responsable: true,
      creador: true,
      documentos: {
        include: {
          creador: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      audiencias: {
        include: {
          responsable: true
        },
        orderBy: {
          fecha: 'asc'
        }
      },
      tareas: {
        include: {
          asignado: true
        },
        orderBy: {
          fechaVencimiento: 'asc'
        }
      },
      honorarios: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!expediente) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <ExpedienteDetail expediente={expediente} />
    </div>
  )
}
