'use client'

import Navigation from '@/components/Navigation'
import { usePathname } from 'next/navigation'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  
  // No mostrar navegación en páginas de autenticación
  const hideNavigation = pathname?.startsWith('/auth/')

  if (hideNavigation) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
