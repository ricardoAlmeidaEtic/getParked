"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/providers/SupabaseProvider"

interface MobileNavProps {
  items: {
    href: string
    label: string
  }[]
}

export default function MobileNav({ items }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useSupabase()

  const closeMenu = () => setIsOpen(false)
  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <div className="md:hidden">
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-primary-foreground hover:bg-white/10"
        onClick={toggleMenu}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Menu</span>
      </Button>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={closeMenu} />}

      {/* Menu Panel */}
      <div
        className={`
        fixed top-0 right-0 h-full w-[280px] bg-white z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
      >
        {/* Header */}
        <div className="p-4 bg-primary flex justify-between items-center">
          <span className="font-bold text-lg text-primary-foreground">Menu</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMenu}
            className="h-8 w-8 text-primary-foreground hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col p-4 space-y-1">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="flex items-center p-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}

          {/* Separator */}
          <div className="border-t border-gray-200 my-4"></div>

          {user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center p-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                onClick={closeMenu}
              >
                <User className="h-4 w-4 mr-2" />
                O Meu Perfil
              </Link>
              <Link
                href="/map"
                className="flex items-center p-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                onClick={closeMenu}
              >
                Mapa
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="flex items-center p-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                onClick={closeMenu}
              >
                Iniciar sessão
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center p-3 rounded-md text-primary font-medium hover:bg-primary/10 transition-colors duration-200"
                onClick={closeMenu}
              >
                Registar-se
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
