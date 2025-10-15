'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Mail,
  Palette,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Key,
  Globe,
  Server,
  HardDrive,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface ConfiguracionDashboardProps {
  userId: string
}

export default function ConfiguracionDashboard({ userId }: ConfiguracionDashboardProps) {
  // Estados para configuraciones
  const [configuracionGeneral, setConfiguracionGeneral] = useState({
    nombreEstudio: 'Estudio Jurídico García & Asociados',
    direccion: 'Av. Corrientes 1234, CABA',
    telefono: '+54 11 4000-0000',
    email: 'contacto@estudiojuridico.com.ar',
    cuit: '20-12345678-9',
    web: 'www.estudiojuridico.com.ar'
  })

  const [configuracionNotificaciones, setConfiguracionNotificaciones] = useState({
    emailExpedientes: true,
    emailAudiencias: true,
    emailFacturacion: true,
    pushNotifications: true,
    recordatoriosAudiencias: true,
    alertasVencimientos: true,
    reportesSemanal: false,
    notificacionesIA: true
  })

  const [configuracionSistema, setConfiguracionSistema] = useState({
    idioma: 'es',
    zonaHoraria: 'America/Argentina/Buenos_Aires',
    formatoFecha: 'DD/MM/YYYY',
    monedaPredeterminada: 'ARS',
    respaldoAutomatico: true,
    sesionSegura: true,
    autenticacionDosFactor: false,
    logActividad: true
  })

  const [configuracionLegal, setConfiguracionLegal] = useState({
    numeroMatricula: '12345',
    colegioAbogados: 'CPACF',
    especializaciones: ['Civil', 'Comercial', 'Laboral'],
    firmaDigital: true,
    selloDigital: '',
    certificadoSSL: true
  })

  const [estadoSistema, setEstadoSistema] = useState({
    version: '1.0.0',
    ultimaActualizacion: '2024-10-01',
    baseDatos: 'Conectada',
    almacenamiento: '2.3 GB / 10 GB',
    respaldos: 15,
    usuarios: 1,
    sesionesActivas: 1
  })

  const [guardando, setGuardando] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)

  const guardarConfiguracion = async () => {
    setGuardando(true)
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Configuración guardada exitosamente')
    } catch (error) {
      toast.error('Error al guardar la configuración')
    } finally {
      setGuardando(false)
    }
  }

  const exportarConfiguracion = () => {
    const config = {
      general: configuracionGeneral,
      notificaciones: configuracionNotificaciones,
      sistema: configuracionSistema,
      legal: configuracionLegal,
      fecha: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'configuracion-erp-juridico.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const reiniciarSistema = () => {
    toast.info('Función disponible en producción')
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones rápidas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Panel de Configuración</h2>
          <p className="text-gray-600">Gestiona todas las configuraciones del sistema</p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={exportarConfiguracion}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Config
          </Button>
          <Button onClick={guardarConfiguracion} disabled={guardando}>
            {guardando ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {guardando ? 'Guardando...' : 'Guardar Todo'}
          </Button>
        </div>
      </div>

      {/* Estado del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Sistema</p>
                <p className="text-xs text-green-600">Funcionando</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Base de Datos</p>
                <p className="text-xs text-blue-600">{estadoSistema.baseDatos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Almacenamiento</p>
                <p className="text-xs text-yellow-600">{estadoSistema.almacenamiento}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">Usuarios</p>
                <p className="text-xs text-purple-600">{estadoSistema.usuarios} activo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de configuración */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Información del Estudio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombreEstudio">Nombre del Estudio</Label>
                  <Input
                    id="nombreEstudio"
                    value={configuracionGeneral.nombreEstudio}
                    onChange={(e) => setConfiguracionGeneral(prev => ({
                      ...prev,
                      nombreEstudio: e.target.value
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cuit">CUIT</Label>
                  <Input
                    id="cuit"
                    value={configuracionGeneral.cuit}
                    onChange={(e) => setConfiguracionGeneral(prev => ({
                      ...prev,
                      cuit: e.target.value
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={configuracionGeneral.direccion}
                    onChange={(e) => setConfiguracionGeneral(prev => ({
                      ...prev,
                      direccion: e.target.value
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={configuracionGeneral.telefono}
                    onChange={(e) => setConfiguracionGeneral(prev => ({
                      ...prev,
                      telefono: e.target.value
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={configuracionGeneral.email}
                    onChange={(e) => setConfiguracionGeneral(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="web">Sitio Web</Label>
                  <Input
                    id="web"
                    value={configuracionGeneral.web}
                    onChange={(e) => setConfiguracionGeneral(prev => ({
                      ...prev,
                      web: e.target.value
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificaciones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferencias de Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones por Email - Expedientes</Label>
                    <p className="text-sm text-gray-500">Recibir emails sobre cambios en expedientes</p>
                  </div>
                  <Switch
                    checked={configuracionNotificaciones.emailExpedientes}
                    onCheckedChange={(checked) => setConfiguracionNotificaciones(prev => ({
                      ...prev,
                      emailExpedientes: checked
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones por Email - Audiencias</Label>
                    <p className="text-sm text-gray-500">Recibir emails sobre audiencias programadas</p>
                  </div>
                  <Switch
                    checked={configuracionNotificaciones.emailAudiencias}
                    onCheckedChange={(checked) => setConfiguracionNotificaciones(prev => ({
                      ...prev,
                      emailAudiencias: checked
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones por Email - Facturación</Label>
                    <p className="text-sm text-gray-500">Recibir emails sobre facturas vencidas</p>
                  </div>
                  <Switch
                    checked={configuracionNotificaciones.emailFacturacion}
                    onCheckedChange={(checked) => setConfiguracionNotificaciones(prev => ({
                      ...prev,
                      emailFacturacion: checked
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones Push</Label>
                    <p className="text-sm text-gray-500">Notificaciones en tiempo real en el navegador</p>
                  </div>
                  <Switch
                    checked={configuracionNotificaciones.pushNotifications}
                    onCheckedChange={(checked) => setConfiguracionNotificaciones(prev => ({
                      ...prev,
                      pushNotifications: checked
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Recordatorios de Audiencias</Label>
                    <p className="text-sm text-gray-500">Recordatorios 24h antes de audiencias</p>
                  </div>
                  <Switch
                    checked={configuracionNotificaciones.recordatoriosAudiencias}
                    onCheckedChange={(checked) => setConfiguracionNotificaciones(prev => ({
                      ...prev,
                      recordatoriosAudiencias: checked
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de Vencimientos</Label>
                    <p className="text-sm text-gray-500">Alertas sobre plazos legales próximos a vencer</p>
                  </div>
                  <Switch
                    checked={configuracionNotificaciones.alertasVencimientos}
                    onCheckedChange={(checked) => setConfiguracionNotificaciones(prev => ({
                      ...prev,
                      alertasVencimientos: checked
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reportes Semanales</Label>
                    <p className="text-sm text-gray-500">Resumen semanal de actividad por email</p>
                  </div>
                  <Switch
                    checked={configuracionNotificaciones.reportesSemanal}
                    onCheckedChange={(checked) => setConfiguracionNotificaciones(prev => ({
                      ...prev,
                      reportesSemanal: checked
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones IA</Label>
                    <p className="text-sm text-gray-500">Notificaciones sobre consultas y análisis de IA</p>
                  </div>
                  <Switch
                    checked={configuracionNotificaciones.notificacionesIA}
                    onCheckedChange={(checked) => setConfiguracionNotificaciones(prev => ({
                      ...prev,
                      notificacionesIA: checked
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sistema" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Configuración del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="idioma">Idioma</Label>
                  <Select value={configuracionSistema.idioma} onValueChange={(value) => 
                    setConfiguracionSistema(prev => ({ ...prev, idioma: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español (Argentina)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="zonaHoraria">Zona Horaria</Label>
                  <Select value={configuracionSistema.zonaHoraria} onValueChange={(value) => 
                    setConfiguracionSistema(prev => ({ ...prev, zonaHoraria: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires</SelectItem>
                      <SelectItem value="America/Argentina/Cordoba">Córdoba</SelectItem>
                      <SelectItem value="America/Argentina/Mendoza">Mendoza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="formatoFecha">Formato de Fecha</Label>
                  <Select value={configuracionSistema.formatoFecha} onValueChange={(value) => 
                    setConfiguracionSistema(prev => ({ ...prev, formatoFecha: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="moneda">Moneda Predeterminada</Label>
                  <Select value={configuracionSistema.monedaPredeterminada} onValueChange={(value) => 
                    setConfiguracionSistema(prev => ({ ...prev, monedaPredeterminada: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                      <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Respaldo Automático</Label>
                    <p className="text-sm text-gray-500">Crear respaldos automáticos diarios</p>
                  </div>
                  <Switch
                    checked={configuracionSistema.respaldoAutomatico}
                    onCheckedChange={(checked) => setConfiguracionSistema(prev => ({
                      ...prev,
                      respaldoAutomatico: checked
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sesión Segura</Label>
                    <p className="text-sm text-gray-500">Requerir HTTPS y tokens seguros</p>
                  </div>
                  <Switch
                    checked={configuracionSistema.sesionSegura}
                    onCheckedChange={(checked) => setConfiguracionSistema(prev => ({
                      ...prev,
                      sesionSegura: checked
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Log de Actividad</Label>
                    <p className="text-sm text-gray-500">Registrar todas las acciones del sistema</p>
                  </div>
                  <Switch
                    checked={configuracionSistema.logActividad}
                    onCheckedChange={(checked) => setConfiguracionSistema(prev => ({
                      ...prev,
                      logActividad: checked
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Información del sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Versión:</span>
                    <Badge>{estadoSistema.version}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Última Actualización:</span>
                    <span className="text-sm">{estadoSistema.ultimaActualizacion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Respaldos Disponibles:</span>
                    <span className="text-sm">{estadoSistema.respaldos}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Base de Datos:</span>
                    <Badge className="bg-green-100 text-green-800">{estadoSistema.baseDatos}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Almacenamiento:</span>
                    <span className="text-sm">{estadoSistema.almacenamiento}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sesiones Activas:</span>
                    <span className="text-sm">{estadoSistema.sesionesActivas}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-6">
                <Button variant="outline" onClick={reiniciarSistema}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reiniciar Sistema
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Crear Respaldo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configuración Legal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numeroMatricula">Número de Matrícula</Label>
                  <Input
                    id="numeroMatricula"
                    value={configuracionLegal.numeroMatricula}
                    onChange={(e) => setConfiguracionLegal(prev => ({
                      ...prev,
                      numeroMatricula: e.target.value
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="colegioAbogados">Colegio de Abogados</Label>
                  <Select value={configuracionLegal.colegioAbogados} onValueChange={(value) => 
                    setConfiguracionLegal(prev => ({ ...prev, colegioAbogados: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CPACF">CPACF</SelectItem>
                      <SelectItem value="CACBA">CACBA</SelectItem>
                      <SelectItem value="CAEF">CAEF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="especializaciones">Especializaciones</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {configuracionLegal.especializaciones.map((esp, index) => (
                    <Badge key={index} variant="outline">
                      {esp}
                      <button 
                        onClick={() => setConfiguracionLegal(prev => ({
                          ...prev,
                          especializaciones: prev.especializaciones.filter((_, i) => i !== index)
                        }))}
                        className="ml-2 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="selloDigital">Sello Digital (Certificado)</Label>
                <Textarea
                  id="selloDigital"
                  placeholder="Pegar certificado digital aquí..."
                  value={configuracionLegal.selloDigital}
                  onChange={(e) => setConfiguracionLegal(prev => ({
                    ...prev,
                    selloDigital: e.target.value
                  }))}
                  rows={4}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Firma Digital Habilitada</Label>
                    <p className="text-sm text-gray-500">Permitir firma digital de documentos</p>
                  </div>
                  <Switch
                    checked={configuracionLegal.firmaDigital}
                    onCheckedChange={(checked) => setConfiguracionLegal(prev => ({
                      ...prev,
                      firmaDigital: checked
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Certificado SSL</Label>
                    <p className="text-sm text-gray-500">Conexión segura habilitada</p>
                  </div>
                  <Switch
                    checked={configuracionLegal.certificadoSSL}
                    onCheckedChange={(checked) => setConfiguracionLegal(prev => ({
                      ...prev,
                      certificadoSSL: checked
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguridad" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Configuración de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="passwordActual">Contraseña Actual</Label>
                  <div className="relative">
                    <Input
                      id="passwordActual"
                      type={mostrarPassword ? "text" : "password"}
                      placeholder="Ingrese su contraseña actual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                    >
                      {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="passwordNueva">Nueva Contraseña</Label>
                  <Input
                    id="passwordNueva"
                    type="password"
                    placeholder="Ingrese nueva contraseña"
                  />
                </div>
                
                <div>
                  <Label htmlFor="passwordConfirmar">Confirmar Contraseña</Label>
                  <Input
                    id="passwordConfirmar"
                    type="password"
                    placeholder="Confirme la nueva contraseña"
                  />
                </div>
              </div>
              
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticación de Dos Factores</Label>
                    <p className="text-sm text-gray-500">Agregar una capa extra de seguridad</p>
                  </div>
                  <Switch
                    checked={configuracionSistema.autenticacionDosFactor}
                    onCheckedChange={(checked) => setConfiguracionSistema(prev => ({
                      ...prev,
                      autenticacionDosFactor: checked
                    }))}
                  />
                </div>
                
                {configuracionSistema.autenticacionDosFactor && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        La autenticación de dos factores requiere una aplicación como Google Authenticator.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">
                      Configurar 2FA
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Sesiones Activas</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Sesión Actual</p>
                      <p className="text-sm text-gray-500">Chrome en Windows - IP: 192.168.1.100</p>
                      <p className="text-xs text-gray-400">Iniciada hace 2 horas</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Activa</Badge>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button variant="outline" size="sm">
                    Ver Todas las Sesiones
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Cerrar Otras Sesiones
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
