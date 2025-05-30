import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'
import { SupabaseProvider } from '@/providers/SupabaseProvider'
import ProtectedRoute from '@/components/auth/protected-route'
import Navbar from '@/components/layout/navbar'

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GetParked - Sistema de Gerenciamento de Estacionamento',
  description: 'Sistema inteligente para gerenciamento de estacionamentos',
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={poppins.className}>
        <SupabaseProvider>
          <Toaster
            toastOptions={{
              className: '',
              style: {
                background: '#fff',
                color: '#333',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              },
            }}
          />
          <ProtectedRoute>
            <AppLayout>
              {children}
            </AppLayout>
          </ProtectedRoute>
        </SupabaseProvider>
      </body>
    </html>
  )
}
