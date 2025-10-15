import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ConfiguracionDashboard from '@/components/configuracion/ConfiguracionDashboard'

export default async function ConfiguracionPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configuración y Administración
        </h1>
        <p className="text-gray-600">
          Gestiona la configuración del sistema, usuarios y preferencias
        </p>
      </div>

      <Suspense fallback={<div>Cargando configuración...</div>}>
        <ConfiguracionDashboard userId={session.user.id} />
      </Suspense>
    </div>
  )
}
