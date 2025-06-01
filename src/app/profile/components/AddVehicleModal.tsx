import { useState } from "react"
import { Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { showToast } from "@/lib/toast"
import { useSupabase } from "@/providers/SupabaseProvider"

interface Vehicle {
  id: string
  owner_id: string
  plate: string
  model: string
  color: string
  created_at: string
}

interface AddVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onVehicleAdded: (vehicle: Vehicle) => void
  currentVehiclesCount: number
  maxVehicles: number
}

export function AddVehicleModal({ 
  isOpen, 
  onClose, 
  onVehicleAdded,
  currentVehiclesCount,
  maxVehicles 
}: AddVehicleModalProps) {
  const { supabase, session } = useSupabase()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    plate: "",
    model: "",
    color: "Preto"
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    if (currentVehiclesCount >= maxVehicles) {
      showToast.error(`Você já atingiu o limite de ${maxVehicles} veículo${maxVehicles > 1 ? 's' : ''} para seu plano`)
      return
    }

    if (!formData.model || !formData.plate) {
      showToast.error("Preencha todos os campos obrigatórios")
      return
    }

    setIsSaving(true)
    try {
      const { data: vehicle, error } = await supabase
        .from('vehicles')
        .insert({
          owner_id: session.user.id,
          plate: formData.plate,
          model: formData.model,
          color: formData.color
        })
        .select()
        .single()

      if (error) throw error

      onVehicleAdded(vehicle)
      showToast.success("Veículo adicionado com sucesso!")
      onClose()
      
      // Limpar formulário
      setFormData({
        plate: "",
        model: "",
        color: "Preto"
      })
    } catch (error: any) {
      console.error("Erro ao adicionar veículo:", error)
      showToast.error(error.message || "Ocorreu um erro ao adicionar o veículo")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Veículo</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do seu veículo para encontrar vagas compatíveis.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddVehicle}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right flex items-center">
                <Car className="h-4 w-4 mr-2" /> Modelo
              </Label>
              <Input
                id="model"
                name="model"
                placeholder="Ex: Fiat Uno"
                className="col-span-3"
                value={formData.model}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plate" className="text-right">
                Placa
              </Label>
              <Input
                id="plate"
                name="plate"
                placeholder="Ex: ABC1234"
                className="col-span-3"
                value={formData.plate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Cor
              </Label>
              <select
                id="color"
                name="color"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.color}
                onChange={handleInputChange}
              >
                <option value="Preto">Preto</option>
                <option value="Branco">Branco</option>
                <option value="Prata">Prata</option>
                <option value="Cinza">Cinza</option>
                <option value="Vermelho">Vermelho</option>
                <option value="Azul">Azul</option>
                <option value="Verde">Verde</option>
                <option value="Amarelo">Amarelo</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> Salvando...
                </>
              ) : (
                "Adicionar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 