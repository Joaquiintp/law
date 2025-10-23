'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  AlertCircle, 
  Briefcase, 
  FileText, 
  ClipboardCheck,
  X,
  Filter
} from 'lucide-react'

export default function ExpedientesFiltroModal() {
  const router = useRouter()
  const [mostrarModal, setMostrarModal] = useState(true)
  const [razonSocial, setRazonSocial] = useState('')
  const [urgentes, setUrgentes] = useState(false)
  const [categoria, setCategoria] = useState<'PROCESAL' | 'EXTRA_PROCESAL' | 'AUDITORIA' | ''>('')

  const aplicarFiltros = () => {
    const params = new URLSearchParams()
    
    if (razonSocial) {
      params.set('razonSocial', razonSocial)
    }
    
    if (urgentes) {
      params.set('urgentes', 'true')
    }
    
    if (categoria) {
      params.set('categoria', categoria)
    }

    router.push(`/expedientes?${params.toString()}`)
    setMostrarModal(false)
  }

  const verTodos = () => {
    router.push('/expedientes')
    setMostrarModal(false)
  }

  if (!mostrarModal) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <button
            onClick={() => setMostrarModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Filter className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">¿Qué expedientes te gustaría ver?</CardTitle>
              <CardDescription className="mt-1">
                Filtra los expedientes según tus necesidades
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Búsqueda por Razón Social */}
          <div>
            <Label htmlFor="razonSocial" className="text-base font-semibold flex items-center mb-3">
              <Search className="h-4 w-4 mr-2 text-gray-600" />
              Buscar por Cliente
            </Label>
            <Input
              id="razonSocial"
              type="text"
              placeholder="Ingresa nombre del cliente o razón social..."
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Busca por nombre, apellido o razón social del cliente
            </p>
          </div>

          {/* Filtro de Urgentes */}
          <div>
            <Label className="text-base font-semibold flex items-center mb-3">
              <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
              Mostrar solo urgentes
            </Label>
            <button
              onClick={() => setUrgentes(!urgentes)}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                urgentes
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${urgentes ? 'bg-orange-100' : 'bg-gray-100'}`}>
                    <AlertCircle className={`h-5 w-5 ${urgentes ? 'text-orange-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Expedientes con tareas urgentes</div>
                    <div className="text-sm text-gray-500">
                      Solo casos activos con tareas de prioridad urgente pendientes
                    </div>
                  </div>
                </div>
                {urgentes && (
                  <Badge className="bg-orange-500">Activo</Badge>
                )}
              </div>
            </button>
            
            {/* Leyenda informativa */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="mt-0.5">
                  <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-xs text-blue-800">
                  <span className="font-semibold">💡 Tip: </span>
                  {razonSocial ? (
                    <>Mostraré solo expedientes urgentes de <span className="font-semibold">{razonSocial}</span></>
                  ) : (
                    <>Si no filtras por cliente, te mostraré <span className="font-semibold">todos los expedientes</span> que tengan tareas urgentes pendientes</>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Selección de Categoría */}
          <div>
            <Label className="text-base font-semibold flex items-center mb-3">
              <Briefcase className="h-4 w-4 mr-2 text-blue-600" />
              Categoría de Expedientes
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Procesales */}
              <button
                onClick={() => setCategoria(categoria === 'PROCESAL' ? '' : 'PROCESAL')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  categoria === 'PROCESAL'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`p-3 rounded-full ${
                    categoria === 'PROCESAL' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <FileText className={`h-6 w-6 ${
                      categoria === 'PROCESAL' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <div className="font-semibold">Procesales</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Civil, Penal, Laboral, Comercial, etc.
                    </div>
                  </div>
                  {categoria === 'PROCESAL' && (
                    <Badge className="bg-blue-500">Seleccionado</Badge>
                  )}
                </div>
              </button>

              {/* Extra Procesales */}
              <button
                onClick={() => setCategoria(categoria === 'EXTRA_PROCESAL' ? '' : 'EXTRA_PROCESAL')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  categoria === 'EXTRA_PROCESAL'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`p-3 rounded-full ${
                    categoria === 'EXTRA_PROCESAL' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Briefcase className={`h-6 w-6 ${
                      categoria === 'EXTRA_PROCESAL' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <div className="font-semibold">Extra Procesales</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Asesoramiento, negociaciones, consultas
                    </div>
                  </div>
                  {categoria === 'EXTRA_PROCESAL' && (
                    <Badge className="bg-green-500">Seleccionado</Badge>
                  )}
                </div>
              </button>

              {/* Auditoría */}
              <button
                onClick={() => setCategoria(categoria === 'AUDITORIA' ? '' : 'AUDITORIA')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  categoria === 'AUDITORIA'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`p-3 rounded-full ${
                    categoria === 'AUDITORIA' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <ClipboardCheck className={`h-6 w-6 ${
                      categoria === 'AUDITORIA' ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <div className="font-semibold">Auditoría</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Compliance, auditorías, consultoría
                    </div>
                  </div>
                  {categoria === 'AUDITORIA' && (
                    <Badge className="bg-purple-500">Seleccionado</Badge>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={verTodos}
              variant="outline"
              className="flex-1"
            >
              Ver Todos
            </Button>
            <Button
              onClick={aplicarFiltros}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
          </div>

          {/* Resumen de filtros activos */}
          {(razonSocial || urgentes || categoria) && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Filtros activos:</div>
              <div className="flex flex-wrap gap-2">
                {razonSocial && (
                  <Badge variant="secondary">
                    Cliente: {razonSocial}
                  </Badge>
                )}
                {urgentes && (
                  <Badge className="bg-orange-500">
                    Solo urgentes
                  </Badge>
                )}
                {categoria && (
                  <Badge className="bg-blue-500">
                    {categoria === 'PROCESAL' && 'Procesales'}
                    {categoria === 'EXTRA_PROCESAL' && 'Extra Procesales'}
                    {categoria === 'AUDITORIA' && 'Auditoría'}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
