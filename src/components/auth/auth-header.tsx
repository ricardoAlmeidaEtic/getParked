"use client"

import Link from "next/link"
import FadeIn from "@/components/animations/fade-in"

interface AuthHeaderProps {
  title: string
  subtitle?: string
  subtitleLink?: {
    text: string
    href: string
    label: string
  }
}

export default function AuthHeader({ title, subtitle, subtitleLink }: AuthHeaderProps) {
  return (
    <FadeIn direction="down" duration={800}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center transition-transform duration-300 hover:scale-105">
          <span className="font-bold text-2xl text-primary uppercase tracking-wider">
            GET<span className="font-black">PARKED</span>
          </span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight">{title}</h2>
        {subtitle && (
          <p className="mt-2 text-center text-sm text-gray-600">
            {subtitle}{" "}
            {subtitleLink && (
              <Link
                href={subtitleLink.href}
                className="font-medium text-primary hover:text-primary-hover transition-colors duration-300"
              >
                {subtitleLink.label}
              </Link>
            )}
          </p>
        )}
      </div>
    </FadeIn>
  )
}
