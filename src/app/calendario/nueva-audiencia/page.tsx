import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AudienciaForm from '@/components/calendario/AudienciaForm'

export default async function NuevaAudienciaPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Obtener expedientes activos para el selector
  const expedientes = await prisma.expediente.findMany({
    where: {
      estado: 'ACTIVO'
    },
    include: {
      cliente: {
        select: {
          nombre: true,
          apellido: true,
        }
      }
    },
    orderBy: {
      numero: 'desc'
    }
  })

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Nueva Audiencia</h1>
          <p className="text-muted-foreground">Programa una nueva audiencia o cita</p>
        </div>
        
        <AudienciaForm expedientes={expedientes} session={session} />
      </div>
    </div>
  )
}
