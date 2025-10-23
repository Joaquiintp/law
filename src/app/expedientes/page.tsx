import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ExpedientesList from '@/components/expedientes/ExpedientesList'
import ExpedientesFiltroModal from '@/components/expedientes/ExpedientesFiltroModal'

type SearchParams = {
  razonSocial?: string
  urgentes?: string
  categoria?: 'PROCESAL' | 'EXTRA_PROCESAL' | 'AUDITORIA'
  mostrarFiltros?: string
}

export default async function ExpedientesPage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Construir filtros dinámicos
  const where: any = {}

  // Filtro por urgentes: si NO hay cliente específico, mostrar TODAS las tareas urgentes
  // Si HAY cliente, filtrar solo ese cliente
  if (searchParams.urgentes === 'true') {
    // Siempre requerimos que el expediente esté ACTIVO
    where.estado = 'ACTIVO'
    
    // Y que tenga al menos una tarea urgente pendiente
    where.tareas = {
      some: {
        prioridad: 'URGENTE',
        estado: {
          not: 'COMPLETADA'
        }
      }
    }
  }

  // Filtro por razón social del cliente (se combina con urgentes si ambos están activos)
  if (searchParams.razonSocial) {
    where.cliente = {
      razonSocial: {
        contains: searchParams.razonSocial,
        mode: 'insensitive'
      }
    }
  }

  // Filtro por categoría (Procesal, Extra Procesal, Auditoría)
  if (searchParams.categoria) {
    switch (searchParams.categoria) {
      case 'PROCESAL':
        where.fuero = {
          in: ['CIVIL', 'PENAL', 'LABORAL', 'CONTENCIOSO_ADMINISTRATIVO', 'COMERCIAL', 'FAMILIA']
        }
        break
      case 'EXTRA_PROCESAL':
        // Extra procesal incluye FEDERAL y otros casos no judiciales tradicionales
        where.fuero = 'FEDERAL'
        break
      case 'AUDITORIA':
        // Asumiendo que auditorías son expedientes de materia específica
        where.materia = {
          in: ['AUDITORIA', 'COMPLIANCE', 'CONSULTORIA']
        }
        break
    }
  }

  // Obtener expedientes con filtros aplicados
  const expedientes = await prisma.expediente.findMany({
    where,
    include: {
      cliente: {
        select: {
          id: true,
          razonSocial: true,
          email: true,
          tipoPersona: true,
        }
      },
      responsable: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      creador: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      tareas: {
        where: {
          estado: {
            not: 'COMPLETADA'
          }
        },
        select: {
          id: true,
          titulo: true,
          prioridad: true,
          fechaVencimiento: true,
        },
        orderBy: {
          fechaVencimiento: 'asc'
        },
        take: 3
      },
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

  // Mostrar modal de filtros si no hay parámetros o si se solicita explícitamente
  const mostrarModalFiltros = !searchParams.razonSocial && 
                               !searchParams.urgentes && 
                               !searchParams.categoria ||
                               searchParams.mostrarFiltros === 'true'

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Expedientes</h1>
      </div>
      
      {mostrarModalFiltros && <ExpedientesFiltroModal />}
      
      <ExpedientesList 
        expedientes={expedientes} 
        searchParams={searchParams}
      />
    </div>
  )
}
