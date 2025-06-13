"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, Loader2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useLogout } from "@/hooks/useLogout"

interface NavItem {
  href: string
  label: string
  icon?: string
}

interface MobileNavProps {
  items: NavItem[]
}

export default function MobileNav({ items }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pathname = usePathname()
  const { handleLogout } = useLogout()

  const handleMobileLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    await handleLogout()
  }

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="text-primary-foreground hover:text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-primary shadow-lg py-3 px-4 sm:py-4 sm:px-6 space-y-2 sm:space-y-3">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "block text-primary-foreground hover:text-white font-medium transition-all duration-200 py-2 px-3 sm:py-2.5 sm:px-4 rounded-md text-sm sm:text-base",
                pathname === item.href && "bg-white/10 text-white"
              )}
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                {item.icon && (
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={18}
                    height={18}
                    className={cn(
                      "transition-colors duration-200 sm:w-5 sm:h-5",
                      pathname === item.href ? "text-white" : "text-primary-foreground"
                    )}
                  />
                )}
                {item.label}
              </div>
            </Link>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none flex items-center justify-center gap-2 px-4 transition-all duration-200 text-sm sm:text-base mt-2 sm:mt-3"
            onClick={handleMobileLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
