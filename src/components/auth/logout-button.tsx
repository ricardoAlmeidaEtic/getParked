"use client"
import { useState } from "react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLogout } from "@/hooks/useLogout"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  showIcon?: boolean
  className?: string
  onlyIcon?: boolean
}

export default function LogoutButton({
  variant = "default",
  size = "default",
  showIcon = true,
  className = "",
  onlyIcon = false
}: LogoutButtonProps) {
  const { handleLogout } = useLogout()
  const [isLoading, setIsLoading] = useState(false)

  const onClick = async () => {
    if (isLoading) return
    setIsLoading(true)
    await handleLogout()
  }

  return (
    <Button 
      onClick={onClick}
      variant={variant}
      size={size}
      className={className}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center">
          <span className="animate-spin mr-2">⏳</span> A sair...
        </span>
      ) : (
        <>
          {showIcon && <LogOut className={`h-4 w-4 ${onlyIcon ? "" : "mr-2"}`} />}
          {!onlyIcon && "Sair"}
        </>
      )}
    </Button>
  )
}
