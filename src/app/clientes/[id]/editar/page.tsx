import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import ClienteForm from '@/components/clientes/ClienteForm'

interface EditClientePageProps {
  params: {
    id: string
  }
}

export default async function EditClientePage({ params }: EditClientePageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const cliente = await prisma.cliente.findUnique({
    where: { id: params.id }
  })

  if (!cliente) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Editar Cliente</h1>
          <p className="text-muted-foreground">
            Modifica la información de {cliente.razonSocial}
          </p>
        </div>
        
        <ClienteForm 
          cliente={{
            ...cliente,
            email: cliente.email || '',
            telefono: cliente.telefono || '',
            direccion: cliente.direccion || '',
            cuitCuil: cliente.cuitCuil || '',
            razonSocial: cliente.razonSocial || ''
          }} 
          isEditing 
        />
      </div>
    </div>
  )
}
