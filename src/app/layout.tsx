import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'
import FrontendWrapper from '../components/auth/frontend-wrapper'
import { CookieConsent } from "@/components/ui/cookie-consent"

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
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={poppins.className} suppressHydrationWarning>
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
        <FrontendWrapper>
          {children}
        </FrontendWrapper>
        <CookieConsent />
      </body>
    </html>
  )
}
