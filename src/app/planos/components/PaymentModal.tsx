import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { showToast } from "@/lib/toast"
import { CreditCard, Loader2 } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  planName: string
  planType: string
  price: number
  onSuccess: () => void
}

export function PaymentModal({ isOpen, onClose, planName, planType, price, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }
    return v
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simular processamento do pagamento
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simular sucesso do pagamento (90% de chance)
      const isSuccess = Math.random() < 0.9

      if (!isSuccess) {
        throw new Error("Falha no processamento do pagamento")
      }

      showToast.success("Pagamento processado com sucesso!")
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Erro no pagamento:", error)
      showToast.error(error.message || "Erro ao processar pagamento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pagamento</DialogTitle>
          <DialogDescription>
            Complete o pagamento para assinar o plano {planName} ({planType})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Número do Cartão</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  cardNumber: formatCardNumber(e.target.value)
                }))}
                maxLength={19}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardName">Nome no Cartão</Label>
            <Input
              id="cardName"
              name="cardName"
              placeholder="Nome como está no cartão"
              value={formData.cardName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Data de Expiração</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                placeholder="MM/AA"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  expiryDate: formatExpiryDate(e.target.value)
                }))}
                maxLength={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                name="cvv"
                placeholder="123"
                value={formData.cvv}
                onChange={handleInputChange}
                maxLength={3}
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">Total a pagar:</span>
              <span className="text-lg font-bold">€{price.toFixed(2)}</span>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Confirmar Pagamento"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 