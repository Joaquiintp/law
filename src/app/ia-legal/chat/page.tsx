import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ChatIA from '@/components/ia-legal/ChatIA'

async function getHistorialChat(userId: string) {
  return await prisma.consultaIA.findMany({
    where: {
      usuarioId: userId,
      tipo: 'CHAT_GENERAL'
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 20
  })
}

export default async function ChatIAPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const params = await searchParams
  const historial = await getHistorialChat(session.user.id)

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Chat con Asistente Legal IA
        </h1>
        <p className="text-gray-600">
          Conversa con nuestro asistente especializado en derecho
        </p>
      </div>

      <Suspense fallback={<div>Cargando chat...</div>}>
        <ChatIA 
          historial={historial}
          preguntaInicial={params.q}
          userId={session.user.id}
        />
      </Suspense>
    </div>
  )
}
