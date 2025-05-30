"use client"

import {
  toast,
  type Toast,
  type ToasterProps,
  type DefaultToastOptions,
  type Renderable,
  type ValueOrFunction,
} from "react-hot-toast"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react"

// Replicando a função cn aqui para evitar problemas de importação
function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

// Tipos de toast personalizados
export type ToastType = "success" | "error" | "info" | "warning"

// Configuração padrão para todos os toasts
export const toastConfig: DefaultToastOptions = {
  duration: 4000,
  position: "top-right",
}

// Função para renderizar o toast com estilo personalizado
const renderStyledToast = ({
  t,
  type,
  message,
  icon,
}: { t: Toast; type: ToastType; message: string; icon?: React.ReactNode }) => {
  // Definir cores e ícones com base no tipo
  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 text-green-900 border-green-200"
      case "error":
        return "bg-red-50 text-red-900 border-red-200"
      case "warning":
        return "bg-yellow-50 text-yellow-900 border-yellow-200"
      case "info":
        return "bg-blue-50 text-blue-900 border-blue-200"
      default:
        return "bg-gray-50 text-gray-900 border-gray-200"
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-2 px-4 rounded-lg border shadow-sm",
        getToastStyles(),
        t.visible ? "animate-enter" : "animate-leave"
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

// Funções de toast personalizadas
export const showToast = {
  success: (message: string, icon?: React.ReactNode) =>
    toast.custom((t) => renderStyledToast({ t, type: "success", message, icon })),
  error: (message: string, icon?: React.ReactNode) =>
    toast.custom((t) => renderStyledToast({ t, type: "error", message, icon })),
  warning: (message: string, icon?: React.ReactNode) =>
    toast.custom((t) => renderStyledToast({ t, type: "warning", message, icon })),
  info: (message: string, icon?: React.ReactNode) =>
    toast.custom((t) => renderStyledToast({ t, type: "info", message, icon })),
}

// Adicione animações ao seu arquivo globals.css
// @keyframes enter { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }
// @keyframes leave { from { opacity: 1; transform: translateY(0) } to { opacity: 0; transform: translateY(-8px) } }
// .animate-enter { animation: enter 0.2s ease-out; }
// .animate-leave { animation: leave 0.15s ease-in forwards; }
