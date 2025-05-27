"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface FadeInProps {
  children: React.ReactNode
  direction?: "up" | "down" | "left" | "right"
  duration?: number
  delay?: number
  className?: string
  threshold?: number
}

export default function FadeIn({
  children,
  direction = "up",
  duration = 500,
  delay = 0,
  className,
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
  )
}
