'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Palette, Sun, Moon, Sparkles, Check } from 'lucide-react'

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  const themes = [
    {
      value: 'light',
      label: 'Claro',
      icon: Sun,
      description: 'Tema clásico con fondo blanco',
      preview: 'bg-white border border-gray-200'
    },
    {
      value: 'dark',
      label: 'Oscuro',
      icon: Moon,
      description: 'Ideal para trabajar de noche',
      preview: 'bg-gray-900 border border-gray-700'
    },
    {
      value: 'colorful',
      label: 'Colorido',
      icon: Sparkles,
      description: 'Colores vibrantes por módulo',
      preview: 'bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 border border-pink-200'
    },
  ]

  const currentTheme = themes.find(t => t.value === theme)
  const CurrentIcon = currentTheme?.icon || Palette

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{currentTheme?.label}</span>
          <Palette className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Tema de la Interfaz
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          const isSelected = theme === themeOption.value
          
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value as any)}
              className="flex items-start gap-3 p-3 cursor-pointer"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{themeOption.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 ml-auto text-blue-600" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {themeOption.description}
                </p>
                <div className={`mt-2 h-8 rounded-md ${themeOption.preview}`} />
              </div>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <div className="px-3 py-2 text-xs text-muted-foreground">
          <p className="mb-1">
            <strong className="text-foreground">Tip:</strong> El tema colorido asigna colores únicos a cada módulo
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] rounded">Expedientes</span>
            <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] rounded">Tareas</span>
            <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] rounded">Clientes</span>
            <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded">Audiencias</span>
            <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] rounded">Docs</span>
            <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] rounded">$$$</span>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
