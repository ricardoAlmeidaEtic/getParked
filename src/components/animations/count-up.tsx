"use client"

import { useEffect, useState, useRef } from "react"

interface CountUpProps {
  end: number
  start?: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
}

export default function CountUp({
  end,
  start = 0,
  duration = 2000,
  prefix = "",
  suffix = "",
  decimals = 0,
}: CountUpProps) {
  const [count, setCount] = useState(start)
  const countRef = useRef<number>(start)
  const startTimeRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)
      const currentCount = start + progress * (end - start)

      countRef.current = currentCount
      setCount(currentCount)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [start, end, duration])

  const formatNumber = (num: number) => {
    return `${prefix}${num.toFixed(decimals)}${suffix}`
  }

  return <>{formatNumber(count)}</>
}
