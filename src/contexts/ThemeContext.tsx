'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Theme } from '@/lib/themes'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // Cargar tema del localStorage al montar
  useEffect(() => {
    const savedTheme = localStorage.getItem('erp-theme') as Theme
    if (savedTheme && ['light', 'dark', 'colorful'].includes(savedTheme)) {
      setThemeState(savedTheme)
    }
    setMounted(true)
  }, [])

  // Aplicar tema al documento
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    
    // Remover clases anteriores
    root.classList.remove('theme-light', 'theme-dark', 'theme-colorful')
    
    // Agregar clase del tema actual
    root.classList.add(`theme-${theme}`)
    
    // Aplicar clase dark para Tailwind (solo en tema oscuro)
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // Guardar en localStorage
    localStorage.setItem('erp-theme', theme)
  }, [theme, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    setThemeState(current => {
      if (current === 'light') return 'dark'
      if (current === 'dark') return 'colorful'
      return 'light'
    })
  }

  const value = { theme, setTheme, toggleTheme }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // Durante SSR o antes de montar, retornar valores por defecto
    if (typeof window === 'undefined') {
      return { 
        theme: 'light' as Theme, 
        setTheme: () => {}, 
        toggleTheme: () => {} 
      }
    }
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
