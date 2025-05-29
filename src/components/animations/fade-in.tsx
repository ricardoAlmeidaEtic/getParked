"use client"

<<<<<<< HEAD
import type React from "react"

=======
import { motion } from "framer-motion"
import React from "react"
>>>>>>> 476f46b (Perfil)
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface FadeInProps {
  children: React.ReactNode
  direction?: "up" | "down" | "left" | "right"
  duration?: number
  delay?: number
  className?: string
<<<<<<< HEAD
  threshold?: number
=======
>>>>>>> 476f46b (Perfil)
}

export default function FadeIn({
  children,
  direction = "up",
  duration = 500,
  delay = 0,
  className,
<<<<<<< HEAD
  threshold = 0.1,
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      {
        threshold,
      },
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold])

  const getDirectionStyles = () => {
    switch (direction) {
      case "up":
        return "translate-y-10"
      case "down":
        return "-translate-y-10"
      case "left":
        return "translate-x-10"
      case "right":
        return "-translate-x-10"
      default:
        return "translate-y-10"
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all transform",
        isVisible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${getDirectionStyles()}`,
        className,
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
=======
}: FadeInProps) {
  // Definir a configuração de animação baseada na direção
  let initial = {}
  
  switch (direction) {
    case "up":
      initial = { opacity: 0, y: 20 }
      break
    case "down":
      initial = { opacity: 0, y: -20 }
      break
    case "left":
      initial = { opacity: 0, x: 20 }
      break
    case "right":
      initial = { opacity: 0, x: -20 }
      break
    default:
      initial = { opacity: 0 }
  }

  return (
    <motion.div
      className={cn(className)}
      initial={initial}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: duration / 1000, delay: delay / 1000 }}
    >
      {children}
    </motion.div>
>>>>>>> 476f46b (Perfil)
  )
}
