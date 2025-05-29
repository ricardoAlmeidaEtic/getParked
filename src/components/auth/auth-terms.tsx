"use client"

import Link from "next/link"

export default function AuthTerms() {
  return (
    <div className="mt-6">
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
