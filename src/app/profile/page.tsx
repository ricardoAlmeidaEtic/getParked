"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Car, CreditCard, Calendar, Plus, Edit, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { showToast } from "@/lib/toast"
import { useSupabase } from "@/providers/SupabaseProvider"
import { useProfile } from '@/hooks/useProfile'
import { Profile } from '@/lib/api/profile'
import LogoutButton from "@/components/auth/logout-button"
import { EditProfileModal } from "@/app/profile/components/EditProfileModal"
import { AddVehicleModal } from "@/app/profile/components/AddVehicleModal"

interface UserData {
  id: string
  name: string
  email: string
  plan: string
  joinDate: string
  credits: number
  vehicles: Vehicle[]
  profileImage?: string
}

interface Vehicle {
  id: string
  owner_id: string
  plate: string
  model: string
  color: string
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { supabase, session } = useSupabase()
  const { profile: supabaseProfile, loading: profileLoading, updateProfile } = useProfile()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isAddingVehicle, setIsAddingVehicle] = useState(false)
  const [profileImage, setProfileImage] = useState<string>("/images/parking-map.png")
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    const fetchProfileAndVehicles = async () => {
      try {
        // Buscar perfil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) throw profileError

        // Buscar veículos
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('owner_id', session.user.id)

        if (vehiclesError) throw vehiclesError

        setProfile(profileData)
        setVehicles(vehiclesData || [])
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        showToast.error('Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    fetchProfileAndVehicles()
  }, [session, router, supabase])

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile)
  }

  const handleVehicleAdded = (newVehicle: Vehicle) => {
    setVehicles(prev => [...prev, newVehicle])
  }

  const handleDeleteVehicle = async (id: string) => {
    if (!session || !profile) return
    
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)
        .eq('owner_id', session.user.id)

      if (error) throw error

      setVehicles(vehicles.filter(vehicle => vehicle.id !== id))
      showToast.success("Veículo removido com sucesso!")
    } catch (error: any) {
      console.error("Erro ao excluir veículo:", error)
      showToast.error(error.message || "Ocorreu um erro ao remover o veículo")
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!session || !profile) return
    
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      // Por enquanto, apenas simular o upload da imagem
      // No futuro, quando o storage estiver configurado, isso será implementado
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setProfileImage(imageUrl)
        updateProfile({
          ...profile,
          profile_image: imageUrl,
        })
        showToast.success("Imagem de perfil atualizada!")
      }
      reader.readAsDataURL(file)
    } catch (error: any) {
      console.error("Erro ao atualizar imagem:", error)
      showToast.error(error.message || "Ocorreu um erro ao atualizar a imagem")
    }
  }

  // Exibir tela de carregamento
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="flex-1 pt-24 pb-16 px-4 md:px-8 flex items-center justify-center">
          <div className="animate-spin text-primary text-4xl">⏳</div>
        </div>
      </main>
    )
  }

  // Redirecionar se não houver usuário
  if (!session) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="flex-1 pt-24 pb-16 px-4 md:px-8 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Sessão expirada</h1>
          <p className="mb-6">Por favor, faça login novamente para acessar seu perfil.</p>
          <Button onClick={() => router.push("/auth/signin")}>Fazer Login</Button>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="flex-1 pt-24 pb-16 px-4 md:px-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Erro ao carregar perfil</h1>
            <p className="mb-6">Não foi possível carregar seus dados de usuário.</p>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex-1 pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Perfil do Utilizador</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais e preferências</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profile.profile_image || profileImage} alt={profile.full_name} />
                        <AvatarFallback>{profile.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="profile-image-upload"
                        className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md cursor-pointer hover:bg-primary/90 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <input
                          id="profile-image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                  <CardTitle>{profile.full_name}</CardTitle>
                  <CardDescription>{profile.email}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-sm text-gray-500 space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <p>
                        Plano: <span className="font-medium text-gray-700">{profile.plan}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <p>
                        Membro desde: <span className="font-medium text-gray-700">{profile.join_date}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                      >
                        <span className="font-bold">{profile.credits}</span> créditos
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <LogoutButton
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  />
                </CardFooter>
              </Card>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2">
              <Tabs defaultValue="profile">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">Perfil</TabsTrigger>
                  <TabsTrigger value="vehicles">Veículos</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações Pessoais</CardTitle>
                      <CardDescription>
                        Atualize suas informações pessoais aqui. Estas informações serão exibidas publicamente.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name" className="flex items-center">
                          <User className="h-4 w-4 mr-2" /> Nome
                        </Label>
                        <Input
                          id="full_name"
                          value={profile.full_name}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" /> Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="credits" className="flex items-center">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                          >
                            <span className="font-bold">{profile.credits}</span> créditos
                          </Badge>
                        </Label>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => setIsEditingProfile(true)}
                        className="w-full"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Perfil
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="vehicles" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Meus Veículos</CardTitle>
                      <CardDescription>
                        Gerencie seus veículos cadastrados.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {vehicles.length === 0 ? (
                        <div className="text-center py-8">
                          <Car className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum veículo cadastrado</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Adicione seu primeiro veículo para começar a buscar vagas compatíveis.
                          </p>
                          <div className="mt-6">
                            <Button onClick={() => setIsAddingVehicle(true)}>
                              <Plus className="mr-2 h-4 w-4" /> Adicionar Veículo
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {vehicles.map((vehicle) => (
                            <Card key={vehicle.id}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <div className="bg-gray-100 p-2 rounded-full">
                                      <Car className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                      <h3 className="font-medium">{vehicle.model}</h3>
                                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <Badge variant="outline">{vehicle.plate}</Badge>
                                        <span>•</span>
                                        <span>{vehicle.color}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteVehicle(vehicle.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          <div className="flex justify-center mt-4">
                            <Button onClick={() => setIsAddingVehicle(true)}>
                              <Plus className="mr-2 h-4 w-4" /> Adicionar Veículo
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Modais */}
      {profile && (
        <EditProfileModal
          isOpen={isEditingProfile}
          onClose={() => setIsEditingProfile(false)}
          profile={profile}
          onProfileUpdate={handleProfileUpdate}
        />
      )}

      <AddVehicleModal
        isOpen={isAddingVehicle}
        onClose={() => setIsAddingVehicle(false)}
        onVehicleAdded={handleVehicleAdded}
        currentVehiclesCount={vehicles.length}
        maxVehicles={profile?.plan === "Premium" ? 3 : 1}
      />
    </main>
  )
}
