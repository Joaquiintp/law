import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AdminPanel from '@/components/admin/AdminPanel'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  // Verificar que el usuario esté autenticado
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Verificar que el usuario tenga rol ADMIN
  if (session.user.role !== 'ADMIN') {
    redirect('/') // Redirigir al dashboard si no es admin
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm mb-6">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-sm text-gray-600">Acceso exclusivo para administradores del sistema</p>
            </div>
            <div className="text-xs text-gray-500">
              Usuario: <span className="font-semibold">{session.user.email}</span>
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded">ADMIN</span>
            </div>
          </div>
        </div>
      </div>
      <AdminPanel />
    </div>
  )
}
