'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminSupabase } from '@/providers/AdminSupabaseProvider';
import AdminSidebar from '@/components/admin/AdminSidebar';
import OwnerSidebar from '@/components/admin/OwnerSidebar';

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut, supabase } = useAdminSupabase();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

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

        setUserRole(profile?.role || null);

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

  const isAdmin = userRole === 'admin';
  const isOwner = userRole === 'owner';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {isAdmin && <AdminSidebar user={user} signOut={signOut} />}
      {isOwner && <OwnerSidebar user={user} signOut={signOut} />}
      <main className="flex-1 container mx-auto px-8 py-8">
        {children}
      </main>
    </div>
  );
} 