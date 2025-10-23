import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SubirDocumentoForm from '@/components/documentos/SubirDocumentoForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload } from 'lucide-react'

async function getExpedientesActivos() {
  return await prisma.expediente.findMany({
    where: {
      estado: 'ACTIVO'
    },
    include: {
      cliente: {
        select: {
          id: true,
          razonSocial: true,
          
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })
}

export default async function SubirDocumentoPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const expedientes = await getExpedientesActivos()

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Subir Documento
        </h1>
        <p className="text-gray-600">
          Agrega un nuevo documento al sistema de gestión documental
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Información del Documento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Cargando formulario...</div>}>
              <SubirDocumentoForm 
                expedientes={expedientes}
                userId={session.user.id}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
