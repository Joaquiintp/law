import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ResumidorDocumentos from '@/components/ia-legal/ResumidorDocumentos'

/**
 * Página para analizar documentos legales con IA
 * 
 * Características:
 * - Sube documentos PDF, DOCX o TXT
 * - Detección automática de tipo de documento
 * - Análisis estructurado con GPT-4o
 * - Extracción de información clave
 * - Control de cuota según paquete
 */
export default async function AnalizarDocumentosPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return <ResumidorDocumentos />
}
