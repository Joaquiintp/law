'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Search,
  Plus,
  Eye,
  Edit,
  Calendar,
  FileText,
  Users,
  CheckSquare
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ExpedienteWithRelations {
  id: string
  numero: string
  caratula: string
  fuero: string
  materia: string
  estado: string
  fechaInicio: Date
  fechaProximaAudiencia?: Date | null
  cliente: {
    id: string
    razonSocial: string
    email?: string | null
    tipoPersona?: string
  }
  responsable: {
    id: string
    name?: string | null
  }
  creador: {
    id: string
    name?: string | null
  }
  tareas?: Array<{
    id: string
    titulo: string
    prioridad: string
    fechaVencimiento?: Date | null
  }>
  _count: {
    documentos: number
    audiencias: number
    tareas: number
  }
}

interface ExpedientesListProps {
  expedientes: ExpedienteWithRelations[]
  searchParams?: {
    razonSocial?: string
    urgentes?: string
    categoria?: string
  }
}

const getEstadoBadge = (estado: string) => {
  const variants = {
    ACTIVO: 'bg-green-100 text-green-700',
    SUSPENDIDO: 'bg-yellow-100 text-yellow-700', 
    CERRADO: 'bg-gray-100 text-gray-700',
    ARCHIVADO: 'bg-blue-100 text-blue-700'
  }
  
  return variants[estado as keyof typeof variants] || 'bg-gray-100 text-gray-700'
}

export default function ExpedientesList({ expedientes, searchParams }: ExpedientesListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState<string>('TODOS')

  const filteredExpedientes = expedientes.filter(exp => {
    const matchesSearch = 
      exp.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.caratula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.cliente.razonSocial.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterEstado === 'TODOS' || exp.estado === filterEstado
    
    return matchesSearch && matchesFilter
  })

  const hayFiltrosActivos = searchParams?.razonSocial || searchParams?.urgentes || searchParams?.categoria

  const abrirModalFiltros = () => {
    router.push('/expedientes?mostrarFiltros=true')
  }

  const limpiarFiltros = () => {
    router.push('/expedientes')
  }

  return (
    <div className="space-y-6">
      {/* Banner de filtros activos */}
      {hayFiltrosActivos && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-blue-900 mb-2">Filtros aplicados:</div>
                <div className="flex flex-wrap gap-2">
                  {searchParams?.razonSocial && (
                    <Badge variant="secondary" className="bg-white">
                      Cliente: {searchParams.razonSocial}
                    </Badge>
                  )}
                  {searchParams?.urgentes === 'true' && (
                    <Badge className="bg-orange-500">
                      Solo urgentes
                    </Badge>
                  )}
                  {searchParams?.categoria && (
                    <Badge className="bg-blue-600">
                      {searchParams.categoria === 'PROCESAL' && 'Procesales'}
                      {searchParams.categoria === 'EXTRA_PROCESAL' && 'Extra Procesales'}
                      {searchParams.categoria === 'AUDITORIA' && 'Auditoría'}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={abrirModalFiltros}
                  variant="outline"
                  size="sm"
                >
                  Modificar Filtros
                </Button>
                <Button
                  onClick={limpiarFiltros}
                  variant="outline"
                  size="sm"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controles de búsqueda y filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Búsqueda Adicional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por número, carátula o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="SUSPENDIDO">Suspendido</option>
                <option value="CERRADO">Cerrado</option>
                <option value="ARCHIVADO">Archivado</option>
              </select>
              <Link href="/expedientes/nuevo">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Expediente
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {expedientes.filter(e => e.estado === 'ACTIVO').length}
            </div>
            <div className="text-sm text-gray-500">Expedientes Activos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {expedientes.filter(e => e.estado === 'SUSPENDIDO').length}
            </div>
            <div className="text-sm text-gray-500">Suspendidos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {expedientes.filter(e => e.estado === 'CERRADO').length}
            </div>
            <div className="text-sm text-gray-500">Cerrados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {expedientes.filter(e => e.fechaProximaAudiencia && new Date(e.fechaProximaAudiencia) > new Date()).length}
            </div>
            <div className="text-sm text-gray-500">Próximas Audiencias</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de expedientes */}
      <Card>
        <CardHeader>
          <CardTitle>Expedientes ({filteredExpedientes.length})</CardTitle>
          <CardDescription>
            Lista completa de expedientes del estudio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Carátula</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fuero/Materia</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Próxima Audiencia</TableHead>
                <TableHead>Estadísticas</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpedientes.map((expediente) => {
                const tieneUrgentes = expediente.tareas?.some(t => t.prioridad === 'URGENTE')
                
                return (
                  <TableRow 
                    key={expediente.id}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                      tieneUrgentes ? 'border-l-4 border-l-orange-500 bg-orange-50/30' : ''
                    }`}
                    onClick={() => router.push(`/expedientes/${expediente.id}`)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 font-semibold">
                          {expediente.numero}
                        </span>
                        {tieneUrgentes && (
                          <Badge className="bg-orange-500 text-xs">
                            Urgente
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={expediente.caratula}>
                      {expediente.caratula}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {expediente.cliente.razonSocial}
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={getEstadoBadge(expediente.estado)}>
                      {expediente.estado}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{expediente.fuero}</div>
                      <div className="text-gray-500 text-xs">{expediente.materia}</div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {expediente.responsable.name || 'Sin asignar'}
                  </TableCell>
                  
                  <TableCell>
                    {expediente.fechaProximaAudiencia ? (
                      <div className="text-sm">
                        {format(new Date(expediente.fechaProximaAudiencia), 'dd/MM/yyyy', { locale: es })}
                      </div>
                    ) : (
                      <span className="text-gray-400">Sin programar</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex gap-2 text-xs">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {expediente._count.documentos}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {expediente._count.audiencias}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckSquare className="h-3 w-3" />
                        {expediente._count.tareas}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/expedientes/${expediente.id}`}>
                        <Button variant="ghost" size="sm" title="Ver detalles">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/expedientes/${expediente.id}/editar`}>
                        <Button variant="ghost" size="sm" title="Editar expediente">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              )
              })}
            </TableBody>
          </Table>
          
          {filteredExpedientes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No se encontraron expedientes que coincidan con los filtros.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
