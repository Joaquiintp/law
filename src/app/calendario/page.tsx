import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CalendarioView from '@/components/calendario/CalendarioView'
import { addDays, startOfMonth, endOfMonth } from 'date-fns'

export default async function CalendarioPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const today = new Date()
  const startOfCurrentMonth = startOfMonth(today)
  const endOfCurrentMonth = endOfMonth(today)

  // Obtener audiencias del mes actual
  const audiencias = await prisma.audiencia.findMany({
    where: {
      fecha: {
        gte: startOfCurrentMonth,
        lte: endOfCurrentMonth,
      }
    },
    include: {
      expediente: {
        include: {
          cliente: {
            select: {
              nombre: true,
              apellido: true,
            }
          }
        }
      }
    },
    orderBy: {
      fecha: 'asc'
    }
  })

  // Obtener tareas con vencimiento próximo
  const tareasProximas = await prisma.tarea.findMany({
    where: {
      fechaVencimiento: {
        gte: today,
        lte: addDays(today, 30)
      },
      estado: {
        not: 'COMPLETADA'
      }
    },
    include: {
      expediente: {
        include: {
          cliente: {
            select: {
              nombre: true,
              apellido: true,
            }
          }
        }
      },

    },
    orderBy: {
      fechaVencimiento: 'asc'
    },
    take: 20
  })

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendario y Agenda</h1>
          <p className="text-muted-foreground">Gestiona audiencias, citas y vencimientos</p>
        </div>
      </div>
      
      <CalendarioView 
        audiencias={audiencias}
        tareas={tareasProximas}
        session={session}
      />
    </div>
  )
}
