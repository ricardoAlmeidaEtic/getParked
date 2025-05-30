"use client"

import Link from "next/link"

interface AuthTermsProps {
  message?: string
  linkText?: string
  linkHref?: string
}

export default function AuthTerms({ message, linkText, linkHref }: AuthTermsProps) {
  return (
    <div className="mt-6">
      {message && linkText && linkHref && (
        <p className="text-center text-sm text-gray-600 mb-4">
          {message}{" "}
          <Link href={linkHref} className="font-medium text-primary hover:text-primary-hover">
            {linkText}
          </Link>
        </p>
      )}
      <p className="text-center text-sm text-gray-600">
        © {new Date().getFullYear()} GetParked. Todos os direitos reservados.{" "}
        <Link
          href="#"
          className="font-medium text-primary hover:text-primary-hover transition-colors duration-300"
        >
          Termos de Serviço
        </Link>{" "}
        e{" "}
        <Link
          href="#"
          className="font-medium text-primary hover:text-primary-hover transition-colors duration-300"
        >
          Política de Privacidade
        </Link>
        .
      </p>
    </div>
  )
}
