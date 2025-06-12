import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Container principal que ocupa toda a largura */}
      <div className="w-full bg-gray-900">
        {/* Apenas a seção de copyright com padding adequado */}
        <div className="container mx-auto border-t border-gray-800 py-8 px-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">© {new Date().getFullYear()} GetParked. Todos os direitos reservados.</p>
          <div className="mt-4 md:mt-0 flex items-center">
            <span className="text-gray-400 mr-2">Feito com</span>
            <svg className="h-5 w-5 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-gray-400 ml-2">na EticAlgarve</span>
          </div>
        </div>
      </div>
    </footer>
  );
}