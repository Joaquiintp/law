import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const {
      numero,
      clienteId,
      fecha,
      fechaVencimiento,
      moneda,
      observaciones,
      items,
      subtotal,
      impuestos,
      total,
      puntoVenta,
      userId
    } = await request.json()

    // Validaciones básicas
    if (!numero || !clienteId || !fecha || !fechaVencimiento || !items || items.length === 0) {
      return NextResponse.json(
        { message: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId }
    })

    if (!cliente) {
      return NextResponse.json(
        { message: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el número de factura no existe
    const facturaExistente = await prisma.factura.findUnique({
      where: { numero }
    })

    if (facturaExistente) {
      return NextResponse.json(
        { message: 'El número de factura ya existe' },
        { status: 400 }
      )
    }

    // Crear la factura en una transacción
    const nuevaFactura = await prisma.$transaction(async (tx) => {
      // Crear la factura
      const factura = await tx.factura.create({
        data: {
          numero,
          fecha: new Date(fecha),
          fechaVencimiento: new Date(fechaVencimiento),
          subtotal,
          impuestos,
          total,
          moneda: moneda as 'ARS' | 'USD',
          clienteId,
          puntoVenta
        }
      })

      // Crear los honorarios asociados y actualizar los existentes
      for (const item of items) {
        if (item.honorarioId) {
          // Actualizar honorario existente
          await tx.honorario.update({
            where: { id: item.honorarioId },
            data: {
              facturaId: factura.id,
              estado: 'FACTURADO'
            }
          })
        } else {
          // Crear nuevo honorario
          await tx.honorario.create({
            data: {
              concepto: item.concepto,
              monto: item.cantidad * item.precio,
              fechaServicio: new Date(fecha),
              estado: 'FACTURADO',
              facturaId: factura.id,
              // Necesitaríamos un expedienteId por defecto o manejarlo diferente
              expedienteId: 'default' // Esto debería ser manejado mejor
            }
          })
        }
      }

      // Registrar actividad
      await tx.actividadLog.create({
        data: {
          accion: 'FACTURA_CREADA',
          descripcion: `Factura ${numero} creada por ${formatCurrency(total, moneda)}`,
          entidad: 'FACTURA',
          entidadId: factura.id,
          userId: userId
        }
      })

      return factura
    })

    return NextResponse.json({
      id: nuevaFactura.id,
      message: 'Factura creada correctamente',
      factura: nuevaFactura
    })

  } catch (error) {
    console.error('Error al crear factura:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const clienteId = searchParams.get('clienteId')
    const estado = searchParams.get('estado')
    const fechaDesde = searchParams.get('fechaDesde')
    const fechaHasta = searchParams.get('fechaHasta')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}

    if (clienteId) {
      where.clienteId = clienteId
    }

    if (estado) {
      where.estado = estado
    }

    if (fechaDesde || fechaHasta) {
      where.fecha = {}
      if (fechaDesde) {
        where.fecha.gte = new Date(fechaDesde)
      }
      if (fechaHasta) {
        where.fecha.lte = new Date(fechaHasta)
      }
    }

    const [facturas, total] = await Promise.all([
      prisma.factura.findMany({
        where,
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true
            }
          },
          honorarios: {
            select: {
              id: true,
              concepto: true,
              monto: true,
              estado: true
            }
          }
        },
        orderBy: {
          fecha: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.factura.count({ where })
    ])

    return NextResponse.json({
      facturas,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('Error al obtener facturas:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

function formatCurrency(amount: number, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency === 'ARS' ? 'ARS' : 'USD',
    minimumFractionDigits: 2
  }).format(amount)
}
