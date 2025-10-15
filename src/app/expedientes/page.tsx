import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ExpedientesList from '@/components/expedientes/ExpedientesList'

export default async function ExpedientesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Obtener expedientes con relaciones
  const expedientes = await prisma.expediente.findMany({
    include: {
      cliente: true,
      responsable: true,
      creador: true,
      _count: {
        select: {
          documentos: true,
          audiencias: true,
          tareas: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Expedientes</h1>
      </div>
      
      <ExpedientesList expedientes={expedientes} />
    </div>
  )
}
