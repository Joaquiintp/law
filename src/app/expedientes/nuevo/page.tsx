import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ExpedienteForm from '@/components/expedientes/ExpedienteForm'

export default async function NuevoExpedientePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Obtener clientes y usuarios para los selects
  const [clientes, usuarios] = await Promise.all([
    prisma.cliente.findMany({
      orderBy: {
        apellido: 'asc'
      }
    }),
    prisma.user.findMany({
      where: {
        role: {
          in: ['ABOGADO', 'SOCIO']
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
  ])

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Expediente</h1>
        <p className="text-gray-600 mt-1">Crear un nuevo expediente en el sistema</p>
      </div>
      
      <ExpedienteForm clientes={clientes} usuarios={usuarios} />
    </div>
  )
}
