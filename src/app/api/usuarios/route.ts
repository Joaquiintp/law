import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/usuarios
 * Obtiene la lista de usuarios del estudio del usuario autenticado
 * Query params:
 * - activos: boolean (opcional) - filtra solo usuarios activos
 * - roles: string (opcional) - filtra por roles (ej: "ABOGADO,SECRETARIO")
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener el usuario con su estudio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        estudioId: true,
        estudio: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    })

    if (!user || !user.estudioId) {
      return NextResponse.json(
        { error: 'Usuario no pertenece a ningún estudio' },
        { status: 400 }
      )
    }

    // Parsear query params
    const { searchParams } = new URL(request.url)
    const activosParam = searchParams.get('activos')
    const rolesParam = searchParams.get('roles')

    // Construir filtros
    const where: any = {
      estudioId: user.estudioId
    }

    if (activosParam === 'true') {
      where.activo = true
    }

    if (rolesParam) {
      const roles = rolesParam.split(',')
      where.role = {
        in: roles
      }
    }

    // Obtener usuarios del estudio
    const usuarios = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        activo: true,
        color: true
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({
      usuarios,
      estudio: user.estudio
    })

  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}
