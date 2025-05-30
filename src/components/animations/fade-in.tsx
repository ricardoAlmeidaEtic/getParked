"use client"

import { motion } from "framer-motion"
import React from "react"
import { cn } from "@/lib/utils"

interface FadeInProps {
  children: React.ReactNode
  direction?: "up" | "down" | "left" | "right"
  duration?: number // in milliseconds
  delay?: number // in milliseconds
  className?: string
}

export default function FadeIn({
  children,
  direction = "up",
  duration = 500,
  delay = 0,
  className,
}: FadeInProps) {
  // Animation configuration based on direction
  const getInitial = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: 20 }
      case "down":
        return { opacity: 0, y: -20 }
      case "left":
        return { opacity: 0, x: 20 }
      case "right":
        return { opacity: 0, x: -20 }
      default:
        return { opacity: 0 }
    }
  }

  return (
    <motion.div
      className={cn(className)}
      initial={getInitial()}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: duration / 1000, delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  )
}
