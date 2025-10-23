'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  FileText, 
  Sparkles, 
  Scale, 
  Search,
  MessageSquare,
  Upload,
  Wand2
} from 'lucide-react'

// Importar componentes existentes
import ResumidorDocumentos from '@/components/ia-legal/ResumidorDocumentos'
import GeneradorEscritos from '@/components/ia-legal/GeneradorEscritos'
import BuscadorJurisprudencia from '@/components/ia-legal/BuscadorJurisprudencia'

export default function IALegalDashboard() {
  const [activeTab, setActiveTab] = useState('inicio')

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Asistente Legal IA
            </h1>
            <p className="text-muted-foreground text-lg">
              Tu copiloto jurídico impulsado por inteligencia artificial
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-5 h-auto gap-2 bg-transparent">
          <TabsTrigger 
            value="inicio" 
            className="flex flex-col items-center gap-2 h-20 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600"
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-sm">Inicio</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="analizar" 
            className="flex flex-col items-center gap-2 h-20 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
          >
            <FileText className="h-5 w-5" />
            <span className="text-sm">Analizar</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="clasificar" 
            className="flex flex-col items-center gap-2 h-20 data-[state=active]:bg-green-50 data-[state=active]:text-green-600"
          >
            <Scale className="h-5 w-5" />
            <span className="text-sm">Clasificar</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="generar" 
            className="flex flex-col items-center gap-2 h-20 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600"
          >
            <Wand2 className="h-5 w-5" />
            <span className="text-sm">Generar</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="buscar" 
            className="flex flex-col items-center gap-2 h-20 data-[state=active]:bg-pink-50 data-[state=active]:text-pink-600"
          >
            <Search className="h-5 w-5" />
            <span className="text-sm">Buscar</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Inicio */}
        <TabsContent value="inicio" className="space-y-6">
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Brain className="h-6 w-6 text-purple-600" />
                ¿Qué puedo hacer por ti hoy?
              </CardTitle>
              <CardDescription className="text-base">
                Selecciona una herramienta para comenzar o explora las capacidades de IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Card Analizar */}
                <Card 
                  className="cursor-pointer hover:border-blue-500 transition-all hover:shadow-lg"
                  onClick={() => setActiveTab('analizar')}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">Analizar Documentos</CardTitle>
                    </div>
                    <CardDescription>
                      Extrae información clave de sentencias, contratos y demandas automáticamente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">PDF</Badge>
                      <Badge variant="secondary" className="text-xs">DOCX</Badge>
                      <Badge variant="secondary" className="text-xs">Sentencias</Badge>
                      <Badge variant="secondary" className="text-xs">Contratos</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Card Clasificar */}
                <Card 
                  className="cursor-pointer hover:border-green-500 transition-all hover:shadow-lg"
                  onClick={() => setActiveTab('clasificar')}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Scale className="h-5 w-5 text-green-600" />
                      </div>
                      <CardTitle className="text-lg">Clasificar Expedientes</CardTitle>
                    </div>
                    <CardDescription>
                      Determina materia, urgencia, complejidad y probabilidad de éxito
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Urgencia</Badge>
                      <Badge variant="secondary" className="text-xs">Complejidad</Badge>
                      <Badge variant="secondary" className="text-xs">Riesgos</Badge>
                      <Badge variant="secondary" className="text-xs">Tags</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Card Generar */}
                <Card 
                  className="cursor-pointer hover:border-orange-500 transition-all hover:shadow-lg"
                  onClick={() => setActiveTab('generar')}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Wand2 className="h-5 w-5 text-orange-600" />
                      </div>
                      <CardTitle className="text-lg">Generar Escritos</CardTitle>
                    </div>
                    <CardDescription>
                      Crea demandas, contestaciones, recursos y más escritos judiciales
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Demandas</Badge>
                      <Badge variant="secondary" className="text-xs">Recursos</Badge>
                      <Badge variant="secondary" className="text-xs">Contestaciones</Badge>
                      <Badge variant="secondary" className="text-xs">Alegatos</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Card Buscar */}
                <Card 
                  className="cursor-pointer hover:border-pink-500 transition-all hover:shadow-lg"
                  onClick={() => setActiveTab('buscar')}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Search className="h-5 w-5 text-pink-600" />
                      </div>
                      <CardTitle className="text-lg">Buscar Jurisprudencia</CardTitle>
                    </div>
                    <CardDescription>
                      Encuentra precedentes, normas aplicables y doctrina relevante
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Fallos</Badge>
                      <Badge variant="secondary" className="text-xs">Doctrina</Badge>
                      <Badge variant="secondary" className="text-xs">Normas</Badge>
                      <Badge variant="secondary" className="text-xs">Argumentos</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Modelo de IA */}
              <Card className="bg-gradient-to-r from-purple-100 to-blue-100 border-none">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">GPT-4o</div>
                    <div className="text-sm text-muted-foreground">Modelo de Razonamiento</div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Analizar Documentos */}
        <TabsContent value="analizar">
          <ResumidorDocumentos />
        </TabsContent>

        {/* Tab: Clasificar Expedientes */}
        <TabsContent value="clasificar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-green-600" />
                Clasificar Expediente con IA
              </CardTitle>
              <CardDescription>
                Próximamente: Selecciona un expediente para clasificarlo automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Scale className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Esta funcionalidad estará disponible desde la página de detalle del expediente
                </p>
                <Button className="mt-4" onClick={() => window.location.href = '/expedientes'}>
                  Ir a Expedientes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Generar Escritos */}
        <TabsContent value="generar">
          <GeneradorEscritos />
        </TabsContent>

        {/* Tab: Buscar Jurisprudencia */}
        <TabsContent value="buscar">
          <BuscadorJurisprudencia />
        </TabsContent>
      </Tabs>
    </div>
  )
}
