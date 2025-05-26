import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import '@/styles/globals.css'

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
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
} 