'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/providers/SupabaseProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/admin/login');
      } else {
        setLoading(false);
      }
    };
    checkSession();
    // Listen for sign out/login events
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/admin/login');
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase, router]);

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