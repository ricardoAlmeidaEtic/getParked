<<<<<<< HEAD
=======
"use client"

>>>>>>> 476f46b (Perfil)
import Link from "next/link"

export default function AuthTerms() {
  return (
<<<<<<< HEAD
    <p className="mt-10 text-center text-sm text-gray-500">
      Ao continuar, você concorda com nossos{" "}
      <Link href="#" className="font-medium text-primary hover:text-primary-hover transition-colors duration-300">
        Termos de Serviço
      </Link>{" "}
      e{" "}
      <Link href="#" className="font-medium text-primary hover:text-primary-hover transition-colors duration-300">
        Política de Privacidade
      </Link>
      .
    </p>
=======
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
>>>>>>> 476f46b (Perfil)
  )
}
