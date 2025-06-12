"use client"

import { useState } from "react"
import { User as UserIcon } from "lucide-react"
import { useSupabase } from "@/providers/SupabaseProvider"
import LogoutButton from "@/components/auth/logout-button"

interface UserProfileProps {
  showLogout?: boolean
}

export default function UserProfile({ showLogout = true }: UserProfileProps) {
  const { user } = useSupabase()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  if (!user) return null

  // Acessando os metadados do usuário do Supabase de forma segura
  const displayName = user.user_metadata?.name || (user.email ? user.email.split('@')[0] : 'Utilizador')
  const avatarUrl = user.user_metadata?.avatar_url || null
  const userInitial = displayName.charAt(0).toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="font-medium text-lg">{userInitial}</span>
          )}
        </div>
        <span className="hidden md:block font-medium">{displayName}</span>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <a
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
          >
            <UserIcon className="h-4 w-4 mr-2" />
            Perfil
          </a>
          {showLogout && (
            <div className="px-4 py-2">
              <LogoutButton variant="outline" className="w-full justify-center" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}