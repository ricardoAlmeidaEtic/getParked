"use client"

import React from "react"
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from "lucide-react"
import toast, {
  type Toast,
  type ToastPosition,
  type ToastOptions,
  type Renderable,
  type ValueOrFunction,
} from "react-hot-toast"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function to merge class names (replicates cn)
function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

// Custom toast types
export type ToastType = "success" | "error" | "info" | "warning"

// Default toast options
export const DEFAULT_TOAST_OPTIONS: ToastOptions = {
  duration: 4000,
  position: "top-right" as ToastPosition,
  className: "getparked-toast",
  style: {
    background: "white",
    color: "black",
    padding: "12px 16px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    maxWidth: "350px",
    width: "100%",
  },
}

// Custom Toast component
export const CustomToast = ({
  t,
  type,
  message,
  icon,
}: {
  t: Toast
  type: ToastType
  message: string
  icon?: React.ReactNode
}) => {
  const getToastStyles = () => {
    switch (type) {
      case "success":
        return {
          borderLeft: "4px solid #10b981", // green
          icon: icon || <CheckCircle className="h-5 w-5 text-green-500" />,
          background: "bg-green-50",
        }
      case "error":
        return {
          borderLeft: "4px solid #ef4444", // red
          icon: icon || <AlertCircle className="h-5 w-5 text-red-500" />,
          background: "bg-red-50",
        }
      case "warning":
        return {
          borderLeft: "4px solid #f59e0b", // yellow
          icon: icon || <AlertTriangle className="h-5 w-5 text-amber-500" />,
          background: "bg-amber-50",
        }
      case "info":
      default:
        return {
          borderLeft: "4px solid #3b82f6", // blue
          icon: icon || <Info className="h-5 w-5 text-blue-500" />,
          background: "bg-blue-50",
        }
    }
  }

  const styles = getToastStyles()

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md py-3 px-4 shadow-md",
        styles.background,
        t.visible ? "animate-enter" : "animate-leave",
      )}
      style={{ borderLeft: styles.borderLeft }}
    >
      {styles.icon}
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="rounded-full p-1 transition-colors hover:bg-gray-200"
        aria-label="Close notification"
      >
        <X className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  )
}

// Toast helper functions
export const showToast = {
  success: (message: string, options?: ToastOptions) =>
    toast.custom((t: Toast) => <CustomToast t={t} type="success" message={message} />, {
      ...DEFAULT_TOAST_OPTIONS,
      ...options,
    }),

  error: (message: string, options?: ToastOptions) =>
    toast.custom((t: Toast) => <CustomToast t={t} type="error" message={message} />, {
      ...DEFAULT_TOAST_OPTIONS,
      ...options,
    }),

  info: (message: string, options?: ToastOptions) =>
    toast.custom((t: Toast) => <CustomToast t={t} type="info" message={message} />, {
      ...DEFAULT_TOAST_OPTIONS,
      ...options,
    }),

  warning: (message: string, options?: ToastOptions) =>
    toast.custom((t: Toast) => <CustomToast t={t} type="warning" message={message} />, {
      ...DEFAULT_TOAST_OPTIONS,
      ...options,
    }),

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: ValueOrFunction<Renderable, T>
      error: ValueOrFunction<Renderable, any>
    },
    options?: ToastOptions,
  ) =>
    toast.promise(
      promise,
      {
        loading,
        success: (result: T) => (typeof success === "function" ? success(result) : success) as string,
        error: (err: any) => (typeof error === "function" ? error(err) : error) as string,
      },
      { ...DEFAULT_TOAST_OPTIONS, ...options },
    ),
}

/*
Add these animations to your global CSS:

@keyframes enter {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes leave {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-8px); }
}

.animate-enter {
  animation: enter 0.2s ease-out;
}

.animate-leave {
  animation: leave 0.15s ease-in forwards;
}
*/
