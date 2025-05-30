"use client"

import { motion } from "framer-motion"
import React from "react"
import { cn } from "@/lib/utils"

interface FadeInProps {
  children: React.ReactNode
  direction?: "up" | "down" | "left" | "right"
  duration?: number
  delay?: number
  className?: string
}

export default function FadeIn({
  children,
  direction = "up",
  duration = 500,
  delay = 0,
  className,
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
  )
}
