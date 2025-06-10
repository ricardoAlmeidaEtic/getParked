"use client"

import React from 'react';
import { User } from '@supabase/supabase-js';

interface AdminSidebarProps {
  user: User;
  signOut: () => void;
}

export default function AdminSidebar({ user, signOut }: AdminSidebarProps) {
  return (
    <aside className="w-64 bg-white shadow h-screen flex flex-col p-6">
      <span className="text-2xl font-bold text-primary mb-10">GetParked Admin</span>
      <nav className="flex flex-col gap-4 flex-1">
        <a href="/admin/dashboard" className="text-gray-700 hover:text-primary font-medium">Administração</a>
        <a href="/admin/owners" className="text-gray-700 hover:text-primary font-medium">Gerenciar Proprietários</a>
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
  );
} 