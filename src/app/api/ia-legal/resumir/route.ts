import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  openai,
  llamarOpenAI,
  extraerTextoDocumento,
  detectarTipoDocumento,
  PROMPTS_JURIDICOS
} from '@/lib/openai'

/**
 * POST /api/ia-legal/resumir
 * 
 * Resumir un documento legal utilizando GPT-4o
 * 
 * Body (FormData):
 * - file: File (PDF, DOCX, TXT)
 * - tipo?: 'sentencia' | 'demanda' | 'contrato' | 'general'
 * 
 * Response:
 * - resumen: objeto JSON con información estructurada
 * - tokensUsados: cantidad de tokens consumidos
 * - costo: costo en USD
 * - tipoDetectado: tipo de documento detectado
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // 1. Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // 2. Obtener usuario y estudio
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        estudio: true
      }
    })

    if (!user || !user.estudio) {
      return NextResponse.json(
        { error: 'Usuario o estudio no encontrado' },
        { status: 404 }
      )
    }

    // 3. Verificar que el Add-on IA Legal esté activo
    if (!user.estudio.iaLegalActivo) {
      return NextResponse.json(
        {
          error: 'Add-on IA Legal no está activo',
          mensaje: 'Contacte al administrador para activar el Add-on de IA Legal',
          paquete: user.estudio.paquete
        },
        { status: 403 }
      )
    }

    // 4. Verificar cuota si es tipo FIJO
    if (user.estudio.iaLegalTipo === 'FIJO') {
      const consultasRestantes = user.estudio.iaLegalMaxConsultas - user.estudio.iaLegalConsultasUsadas
      if (consultasRestantes <= 0) {
        return NextResponse.json(
          {
            error: 'Cuota de consultas IA agotada',
            mensaje: `Has utilizado todas las ${user.estudio.iaLegalMaxConsultas} consultas del mes`,
            consultasUsadas: user.estudio.iaLegalConsultasUsadas,
            consultasMaximas: user.estudio.iaLegalMaxConsultas
          },
          { status: 429 }
        )
      }
    }

    // 5. Determinar si es FormData (archivo nuevo) o JSON (documento existente)
    const contentType = request.headers.get('content-type')
    let file: File | null = null
    let tipoManual: string | null = null
    let nombreArchivo = 'documento'

    if (contentType?.includes('multipart/form-data')) {
      // Caso 1: Archivo nuevo desde FormData
      const formData = await request.formData()
      file = formData.get('file') as File
      tipoManual = formData.get('tipo') as string | null

      if (!file) {
        return NextResponse.json(
          { error: 'No se proporcionó archivo' },
          { status: 400 }
        )
      }

      // Validar tamaño del archivo (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'El archivo excede el tamaño máximo de 10MB' },
          { status: 400 }
        )
      }

      nombreArchivo = file.name
    } else {
      // Caso 2: Documento existente desde JSON
      const body = await request.json()
      const { documentoId, tipo } = body
      tipoManual = tipo

      if (!documentoId) {
        return NextResponse.json(
          { error: 'Se requiere documentoId o file' },
          { status: 400 }
        )
      }

      // Buscar el documento en la base de datos
      const documento = await prisma.documento.findUnique({
        where: { id: documentoId },
        include: {
          expediente: {
            select: {
              numero: true,
              caratula: true,
              estudioId: true
            }
          }
        }
      })

      if (!documento) {
        return NextResponse.json(
          { error: 'Documento no encontrado' },
          { status: 404 }
        )
      }

      // Verificar que el documento pertenece al estudio del usuario
      if (documento.expediente.estudioId !== user.estudio.id) {
        return NextResponse.json(
          { error: 'No tiene permisos para este documento' },
          { status: 403 }
        )
      }

      // Leer el archivo del sistema de archivos
      const fs = require('fs')
      const path = require('path')
      const filePath = path.join(process.cwd(), 'uploads', documento.rutaArchivo)

      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { error: 'Archivo no encontrado en el servidor' },
          { status: 404 }
        )
      }

      // Determinar el MIME type basado en la extensión
      const mimeTypes: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc': 'application/msword',
        '.txt': 'text/plain'
      }
      const mimeType = mimeTypes[documento.extension] || 'application/octet-stream'

      // Leer el archivo y crear un File object
      const fileBuffer = fs.readFileSync(filePath)
      const fileBlob = new Blob([fileBuffer])
      file = new File([fileBlob], documento.nombre, {
        type: mimeType
      })

      nombreArchivo = documento.nombre
    }

    // 6. Extraer texto del documento
    let textoDocumento: string
    try {
      textoDocumento = await extraerTextoDocumento(file)
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Error procesando documento', detalle: error.message },
        { status: 400 }
      )
    }

    // Validar que el texto no esté vacío
    if (!textoDocumento || textoDocumento.trim().length < 100) {
      return NextResponse.json(
        { error: 'El documento no contiene suficiente texto para analizar' },
        { status: 400 }
      )
    }

    // 8. Detectar tipo de documento automáticamente
    const tipoDocumento = tipoManual || detectarTipoDocumento(textoDocumento)

    // 9. Seleccionar prompt adecuado
    const promptSistema = PROMPTS_JURIDICOS[tipoDocumento as keyof typeof PROMPTS_JURIDICOS] || PROMPTS_JURIDICOS.general

    // Limitar texto a ~8000 tokens (aprox 32,000 caracteres)
    const textoLimitado = textoDocumento.slice(0, 32000)

    // 10. Llamar a OpenAI
    let resultado
    try {
      resultado = await llamarOpenAI(
        `${promptSistema}\n\n===DOCUMENTO===\n${textoLimitado}\n===FIN DOCUMENTO===\n\nAnaliza el documento y extrae la información en formato JSON.`,
        {
          modelo: 'gpt-4o',
          temperatura: 0.3,
          maxTokens: 2000,
          formatoJSON: true,
          systemPrompt: 'Eres un experto legal especializado en derecho argentino. Analiza documentos legales con precisión y extrae información estructurada en formato JSON.'
        }
      )
    } catch (error: any) {
      // Log del error en base de datos
      await prisma.logIA.create({
        data: {
          estudioId: user.estudio.id,
          usuarioId: user.id,
          accion: 'resumir',
          modelo: 'gpt-4o',
          tokensUsados: 0,
          costo: 0,
          exitoso: false,
          errorMensaje: error.message,
          metadata: JSON.stringify({
            tipoDocumento,
            nombreArchivo,
            tamañoArchivo: file.size
          })
        }
      })

      return NextResponse.json(
        { error: 'Error al procesar con IA', detalle: error.message },
        { status: 500 }
      )
    }

    // 11. Parsear resultado JSON
    let resumenEstructurado
    try {
      resumenEstructurado = JSON.parse(resultado.contenido)
    } catch (error) {
      // Si falla el parse, devolver como texto plano
      resumenEstructurado = { resumen: resultado.contenido }
    }

    // 12. Registrar uso en base de datos
    const duracionMs = Date.now() - startTime

    await prisma.logIA.create({
      data: {
        estudioId: user.estudio.id,
        usuarioId: user.id,
        accion: 'resumir',
        modelo: resultado.modelo,
        tokensUsados: resultado.tokens,
        costo: resultado.costo,
        duracionMs,
        exitoso: true,
        metadata: JSON.stringify({
          tipoDocumento,
          nombreArchivo,
          tamañoArchivo: file.size,
          caracteresAnalizados: textoLimitado.length
        })
      }
    })

    // 13. Incrementar contador de consultas si es tipo FIJO
    if (user.estudio.iaLegalTipo === 'FIJO') {
      await prisma.estudio.update({
        where: { id: user.estudio.id },
        data: {
          iaLegalConsultasUsadas: {
            increment: 1
          }
        }
      })
    }

    // 14. Devolver resultado
    return NextResponse.json({
      success: true,
      resumen: resumenEstructurado,
      metadata: {
        tipoDocumento,
        tipoDetectado: tipoDocumento !== tipoManual,
        nombreArchivo,
        tokensUsados: resultado.tokens,
        costo: resultado.costo,
        costoFormateado: `$${resultado.costo.toFixed(4)} USD`,
        modelo: resultado.modelo,
        duracionMs,
        consultasRestantes: user.estudio.iaLegalTipo === 'FIJO' 
          ? user.estudio.iaLegalMaxConsultas - user.estudio.iaLegalConsultasUsadas - 1
          : null
      }
    })

  } catch (error: any) {
    console.error('Error en /api/ia-legal/resumir:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', detalle: error.message },
      { status: 500 }
    )
  }
}
