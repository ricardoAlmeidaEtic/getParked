'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminSupabase } from '@/providers/AdminSupabaseProvider';

export default function AdminLogin() {
  const router = useRouter();
  const { user, loading: authLoading, supabase } = useAdminSupabase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in - check for parking first
  useEffect(() => {
    const checkUserAndParking = async () => {
      if (user && !authLoading) {
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
            router.push('/admin/register_park');
            return;
          }
        }

        router.push('/admin/dashboard');
      }
    };

    checkUserAndParking();
  }, [user, authLoading, router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (signInError) {
        // Provide more specific error messages
        if (signInError.message === 'Invalid login credentials') {
          // Check if user exists in database
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, role')
            .eq('email', email)
            .single();
          
          if (!profile) {
            throw new Error('Account does not exist. Please check your email or contact an administrator.');
          } else if (profile.role !== 'owner' && profile.role !== 'admin') {
            throw new Error('Access denied. This account does not have admin privileges.');
          } else {
            throw new Error('Incorrect password. Please try again.');
          }
        }
        throw signInError;
      }
      
      if (!authData.user) {
        throw new Error('Login failed. Please try again.');
      }

      // Check if owner has a parking space (only for owners, not admins)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profile?.role === 'owner') {
        const { data: parking, error: parkingError } = await supabase
          .from('parkings')
          .select('*')
          .eq('owner_id', authData.user.id)
          .single();

        if (parkingError && parkingError.code !== 'PGRST116') {
          console.error('Error checking parking:', parkingError);
          throw new Error('Error checking parking information');
        }

        if (!parking) {
          // Owner doesn't have parking, redirect to register
          router.push('/admin/register_park');
          return;
        }
      }

      // Redirect to dashboard (AdminSupabaseProvider handles auth state)
      router.push('/admin/dashboard');

    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="admin@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 rounded hover:bg-primary-hover transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an admin account?{' '}
            <Link href="/admin/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 