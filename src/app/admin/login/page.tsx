'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Create a new Supabase client for admin session
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

      const { data: authData, error: signInError } = await adminSupabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (signInError) throw signInError;
      
      if (!authData.user) {
        throw new Error('User not found');
      }

      // Check if user has admin role
      if (authData.user.user_metadata?.role !== 'owner') {
        throw new Error('Access denied. Admin privileges required.');
      }

      // Fetch the profile
      const { data: profile, error: profileError } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Failed to fetch user profile');
      }

      if (!profile) {
        throw new Error('User profile not found');
      }

      // Check if user has a parking space
      const { data: parking, error: parkingError } = await adminSupabase
        .from('parkings')
        .select('*')
        .eq('owner_id', authData.user.id)
        .single();

      if (!parking) {
        router.push('/admin/register_park');
        return;
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
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
              className="w-full px-3 py-2 border rounded"
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
              className="w-full px-3 py-2 border rounded"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
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