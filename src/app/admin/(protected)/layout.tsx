'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storageKey: 'admin-sb-token',
          storage: window.localStorage
        }
      }
    );

    const checkSession = async () => {
      const { data: { session } } = await adminSupabase.auth.getSession();
      if (!session) {
        router.replace('/admin/login');
        return;
      }

      // Check if user has admin role
      const { data: { user } } = await adminSupabase.auth.getUser();
      if (!user || user.user_metadata?.role !== 'owner') {
        router.replace('/admin/login');
        return;
      }

      setLoading(false);
    };

    checkSession();

    // Listen for sign out/login events
    const { data: listener } = adminSupabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        router.replace('/admin/login');
        return;
      }

      // Check admin role on auth state change
      const { data: { user } } = await adminSupabase.auth.getUser();
      if (!user || user.user_metadata?.role !== 'owner') {
        router.replace('/admin/login');
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar navigation for admin */}
      <aside className="w-64 bg-white shadow h-screen flex flex-col p-6">
        <span className="text-2xl font-bold text-blue-700 mb-10">GetParked Admin</span>
        <nav className="flex flex-col gap-4">
          <a href="/admin/dashboard" className="text-gray-700 hover:text-blue-700 font-medium">Dashboard</a>
          <a href="/admin/parking" className="text-gray-700 hover:text-blue-700 font-medium">Vagas</a>
          <a href="/admin/clients" className="text-gray-700 hover:text-blue-700 font-medium">Clientes</a>
          <a href="/admin/reservations" className="text-gray-700 hover:text-blue-700 font-medium">Reservas</a>
          <a href="/admin/settings" className="text-gray-700 hover:text-blue-700 font-medium">Configurações</a>
        </nav>
      </aside>
      <main className="flex-1 container mx-auto px-8 py-8">
        {children}
      </main>
    </div>
  );
} 