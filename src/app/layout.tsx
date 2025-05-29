import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'
import { SupabaseProvider } from '@/providers/SupabaseProvider'

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GetParked - Sistema de Gerenciamento de Estacionamento',
  description: 'Sistema inteligente para gerenciamento de estacionamentos',
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
          <Toaster />
          <main className="min-h-screen">
            {children}
          </main>
        </SupabaseProvider>
      </body>
    </html>
  )
} 