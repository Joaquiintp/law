'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquarePlus } from 'lucide-react'
import CuadernoNotas from './CuadernoNotas'

interface CuadernoNotasButtonProps {
  expedienteId: string
}

export default function CuadernoNotasButton({ expedienteId }: CuadernoNotasButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Botón flotante */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 z-50"
        title="Abrir Cuaderno de Notas"
      >
        <MessageSquarePlus className="h-6 w-6" />
      </Button>

      {/* Dialog del cuaderno */}
      <CuadernoNotas
        expedienteId={expedienteId}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
