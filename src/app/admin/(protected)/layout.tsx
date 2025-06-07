'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminSupabase } from '@/providers/AdminSupabaseProvider';

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut, supabase } = useAdminSupabase();
  const router = useRouter();

  useEffect(() => {
    const checkUserAndParking = async () => {
      if (!loading && !user) {
        console.log('No admin user found, redirecting to login');
        router.replace('/admin/login');
        return;
      }

      if (!loading && user) {
        // Check if owner has parking (skip for admins)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'owner') {
          const { data: parking } = await supabase
            .from('parkings')
            .select('*')
            .eq('owner_id', user.id)
            .single();

          if (!parking) {
            console.log('Owner has no parking registered, redirecting to register_park');
            router.replace('/admin/register_park');
            return;
          }
        }
      }
    };

    checkUserAndParking();
  }, [user, loading, router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Verificando autenticação admin...</h2>
          <p className="text-gray-600">Por favor, aguarde.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar navigation for admin */}
      <aside className="w-64 bg-white shadow h-screen flex flex-col p-6">
        <span className="text-2xl font-bold text-primary mb-10">GetParked Admin</span>
        <nav className="flex flex-col gap-4 flex-1">
          <a href="/admin/dashboard" className="text-gray-700 hover:text-primary font-medium">Dashboard</a>
          <a href="/admin/parking" className="text-gray-700 hover:text-primary font-medium">Vagas</a>
          <a href="/admin/reservations" className="text-gray-700 hover:text-primary font-medium">Reservas</a>
          <a href="/admin/settings" className="text-gray-700 hover:text-primary font-medium">Configurações</a>
          
          {/* Admin Section */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Administração</h3>
            <a href="/admin/owners" className="text-gray-700 hover:text-primary font-medium block">Gerenciar Proprietários</a>
          </div>
        </nav>
        <div className="mt-auto pt-4 border-t">
          <div className="text-sm text-gray-600 mb-2">Logado como: {user.email}</div>
          <button 
            onClick={signOut}
            className="w-full text-left text-red-600 hover:text-red-800 font-medium"
          >
            Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 container mx-auto px-8 py-8">
        {children}
      </main>
    </div>
  );
} 