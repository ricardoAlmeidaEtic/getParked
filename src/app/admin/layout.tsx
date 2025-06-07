import AdminSupabaseProvider from '@/providers/AdminSupabaseProvider'
import { Toaster } from 'react-hot-toast'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminSupabaseProvider>
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
      {children}
    </AdminSupabaseProvider>
  )
} 