"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface CancelConfirmationProps {
  planName: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export default function CancelConfirmation({
  planName,
  onConfirm,
  onCancel,
  isLoading = false,
}: CancelConfirmationProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto bg-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-xl">Cancelar Plano {planName}</CardTitle>
          <CardDescription>
            Tem certeza de que deseja cancelar sua assinatura? Esta ação não pode ser desfeita.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-2">O que acontecerá:</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Seu plano será cancelado imediatamente</li>
              <li>• Você perderá acesso aos recursos premium</li>
              <li>• Seus veículos extras serão removidos</li>
              <li>• Você será transferido para o plano gratuito</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isLoading}>
            Manter Plano
          </Button>
          <Button variant="destructive" className="flex-1" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span> Cancelando...
              </>
            ) : (
              "Confirmar Cancelamento"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 