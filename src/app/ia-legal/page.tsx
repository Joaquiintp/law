import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import IALegalDashboard from '@/components/ia-legal/IALegalDashboard'

/**
 * Página principal del módulo de IA Legal
 * Verifica acceso al add-on y muestra el dashboard unificado
 */
export default async function IALegalPage() {
  // Verificar autenticación
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  // Verificar que el usuario tenga acceso al módulo IA Legal
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      estudio: true
    }
  })

  if (!user || !user.estudio) {
    redirect('/auth/signin')
  }

  // Verificar que el estudio tenga el add-on IA Legal activo
  if (!user.estudio.iaLegalActivo) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">
            Módulo IA Legal no disponible
          </h2>
          <p className="text-yellow-700 mb-4">
            Tu estudio no tiene activado el add-on de IA Legal. 
            Contacta al administrador para activar esta funcionalidad.
          </p>
          <a
            href="/configuracion"
            className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Ir a Configuración
          </a>
        </div>
      </div>
    )
  }

  // Verificar cuota si es modalidad CONSUMO
  if (user.estudio.iaLegalTipo === 'CONSUMO') {
    const consultasUsadas = user.estudio.iaLegalConsultasUsadas || 0
    const consultasDisponibles = user.estudio.iaLegalMaxConsultas || 0
    
    if (consultasUsadas >= consultasDisponibles) {
      return (
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Cuota de consultas agotada
            </h2>
            <p className="text-red-700 mb-4">
              Has alcanzado el límite de {consultasDisponibles} consultas mensuales. 
              Contacta al administrador para aumentar tu cuota o cambiar a modalidad FIJO.
            </p>
            <a
              href="/configuracion"
              className="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Ir a Configuración
            </a>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <IALegalDashboard />
    </div>
  )
}
