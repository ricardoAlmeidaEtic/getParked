"use client"

import { usePathname } from 'next/navigation'
import { SupabaseProvider } from '@/providers/SupabaseProvider'
import ProtectedRoute from '@/components/auth/protected-route'
import Navbar from '@/components/layout/navbar'

export default function FrontendWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  // Admin routes: No wrapper (they have their own AdminSupabaseProvider)
  if (isAdminRoute) {
    return <>{children}</>
  }

  // Frontend routes: SupabaseProvider + ProtectedRoute + Navbar
  return (
    <SupabaseProvider>
      <ProtectedRoute>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </ProtectedRoute>
    </SupabaseProvider>
  )
} 