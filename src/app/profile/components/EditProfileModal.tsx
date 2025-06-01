import { useState, useEffect } from "react"
import { User, Mail } from "lucide-react"
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
import { Profile } from "@/lib/api/profile"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: Profile
  onProfileUpdate: (updatedProfile: Profile) => void
}

export function EditProfileModal({ isOpen, onClose, profile, onProfileUpdate }: EditProfileModalProps) {
  const { supabase, session } = useSupabase()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    email: profile.email || '',
  })

  // Atualizar formData quando o perfil mudar
  useEffect(() => {
    setFormData({
      full_name: profile.full_name || '',
      email: profile.email || '',
    })
  }, [profile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    // Validar se houve alterações
    if (formData.full_name === profile.full_name) {
      showToast.info('Nenhuma alteração para salvar')
      onClose()
      return
    }

    setIsSaving(true)
    try {
      // Atualizar apenas o nome no Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: formData.full_name }
      })

      if (authError) throw authError

      // Buscar o perfil atualizado
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError) throw profileError

      // Atualizar apenas o campo alterado no estado local
      onProfileUpdate({
        ...profile,
        full_name: formData.full_name
      })

      showToast.success('Perfil atualizado com sucesso!')
      onClose()
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error)
      showToast.error(error.message || 'Erro ao atualizar perfil. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais aqui. Estas informações serão exibidas publicamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right flex items-center">
                <User className="h-4 w-4 mr-2" /> Nome
              </Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right flex items-center">
                <Mail className="h-4 w-4 mr-2" /> Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 