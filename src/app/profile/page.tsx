"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Car, CreditCard, Calendar, Plus, Edit, Save, Trash2, LogOut } from "lucide-react"
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
import { showToast } from "@/components/ui/toast"
import { useSupabase } from "@/providers/SupabaseProvider"

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
  name: string
  plate: string
  type: string
  length: number
  width: number
  height: number
}

export default function ProfilePage() {
  const router = useRouter()
  const { supabase, user, loading } = useSupabase()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })
  const [newVehicle, setNewVehicle] = useState<Vehicle>({
    id: "",
    name: "",
    plate: "",
    type: "Carro",
    length: 4.5,
    width: 1.8,
    height: 1.5,
  })
  const [isAddingVehicle, setIsAddingVehicle] = useState(false)
  const [profileImage, setProfileImage] = useState<string>("/images/parking-map.png")

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        // Criar dados do usuário baseado apenas na autenticação do Supabase
        const userInfo: UserData = {
          id: user.id,
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
          email: user.email || '',
          plan: 'Gratuito',
          joinDate: new Date(user.created_at).toLocaleDateString('pt-BR', { 
            month: 'long', 
            year: 'numeric' 
          }),
          credits: 10, // Créditos iniciais
          vehicles: [], // Começar com array vazio por enquanto
          profileImage: user.user_metadata?.avatar_url
        }
        
        setUserData(userInfo)
        setFormData({
          name: userInfo.name,
          email: userInfo.email,
        })
        
        if (userInfo.profileImage) {
          setProfileImage(userInfo.profileImage)
        }
        
        console.log("Dados do usuário carregados:", userInfo)
        
      } catch (error) {
        console.error("Error fetching user data:", error)
        showToast.error("Erro ao carregar perfil")
      } finally {
        setIsLoading(false)
      }
    }

    if (!loading) {
      fetchUserData()
    }
  }, [user, loading, supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleVehicleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewVehicle({
      ...newVehicle,
      [name]: name === "length" || name === "width" || name === "height" ? Number.parseFloat(value) : value,
    })
  }

  const handleSave = async () => {
    if (!user || !userData) return
    
    setIsSaving(true)
    try {
      // Atualizar metadados do usuário no Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          full_name: formData.name,
          name: formData.name 
        }
      })
      
      if (authError) throw authError
      
      // Atualizar estado local
      setUserData({
        ...userData,
        name: formData.name,
        email: formData.email,
      })
      
      showToast.success("Perfil atualizado com sucesso!")
      setIsEditing(false)
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error)
      showToast.error(error.message || "Ocorreu um erro ao atualizar o perfil")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (userData) {
      setFormData({
        name: userData.name,
        email: userData.email,
      })
    }
    setIsEditing(false)
  }

  const handleAddVehicle = async () => {
    if (!user || !userData) return
    
    // Check vehicle limit based on plan
    const maxVehicles = userData.plan === "Premium" ? 2 : 1
    if (userData.vehicles.length >= maxVehicles) {
      showToast.error(`Plano ${userData.plan} permite apenas ${maxVehicles} veículo${maxVehicles > 1 ? "s" : ""}`)
      return
    }

    if (!newVehicle.name || !newVehicle.plate) {
      showToast.error("Preencha todos os campos obrigatórios")
      return
    }

    setIsSaving(true)
    
    try {
      // Por enquanto, vamos salvar apenas localmente
      // No futuro, quando as tabelas estiverem prontas, isso será salvo no banco
      const vehicle = {
        id: Date.now().toString(), // ID temporário
        name: newVehicle.name,
        plate: newVehicle.plate,
        type: newVehicle.type,
        length: newVehicle.length,
        width: newVehicle.width,
        height: newVehicle.height
      }
      
      // Atualizar estado local
      const updatedUserData = {
        ...userData,
        vehicles: [...userData.vehicles, vehicle]
      }
      
      setUserData(updatedUserData)
      showToast.success("Veículo adicionado com sucesso!")
      
      // Limpar formulário
      setNewVehicle({
        id: "",
        name: "",
        plate: "",
        type: "Carro",
        length: 4.5,
        width: 1.8,
        height: 1.5,
      })
      
      setIsAddingVehicle(false)
    } catch (error: any) {
      console.error("Erro ao adicionar veículo:", error)
      showToast.error(error.message || "Ocorreu um erro ao adicionar o veículo")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteVehicle = async (id: string) => {
    if (!user || !userData) return
    
    try {
      // Por enquanto, remover apenas localmente
      // No futuro, quando as tabelas estiverem prontas, isso será removido do banco
      const updatedVehicles = userData.vehicles.filter((vehicle) => vehicle.id !== id)
      setUserData({
        ...userData,
        vehicles: updatedVehicles,
      })
      
      showToast.success("Veículo removido com sucesso!")
    } catch (error: any) {
      console.error("Erro ao excluir veículo:", error)
      showToast.error(error.message || "Ocorreu um erro ao remover o veículo")
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      showToast.success("Logout realizado com sucesso!")
      router.push("/auth/signin")
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error)
      showToast.error(error.message || "Ocorreu um erro ao fazer logout")
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !userData) return
    
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      // Por enquanto, apenas simular o upload da imagem
      // No futuro, quando o storage estiver configurado, isso será implementado
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setProfileImage(imageUrl)
        setUserData({
          ...userData,
          profileImage: imageUrl,
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
  if (loading || isLoading) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="flex-1 pt-24 pb-16 px-4 md:px-8 flex items-center justify-center">
          <div className="animate-spin text-primary text-4xl">⏳</div>
        </div>
      </main>
    )
  }

  // Redirecionar se não houver usuário
  if (!user) {
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

  if (!userData) {
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

  // O restante do componente continua igual, mas usando userData ao invés de user
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
                        <AvatarImage src={userData.profileImage || profileImage} alt={userData.name} />
                        <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
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
                  <CardTitle>{userData.name}</CardTitle>
                  <CardDescription>{userData.email}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-sm text-gray-500 space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <p>
                        Plano: <span className="font-medium text-gray-700">{userData.plan}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <p>
                        Membro desde: <span className="font-medium text-gray-700">{userData.joinDate}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                      >
                        <span className="font-bold">{userData.credits}</span> créditos
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sair
                  </Button>
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
                        <Label htmlFor="name" className="flex items-center">
                          <User className="h-4 w-4 mr-2" /> Nome
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" /> Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={true} // Email não pode ser alterado - deve fazer isso via Auth
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      {isEditing ? (
                        <>
                          <Button variant="outline" onClick={handleCancel}>
                            Cancelar
                          </Button>
                          <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                              <>
                                <span className="animate-spin mr-2">⏳</span> Salvando...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setIsEditing(true)}>Editar Perfil</Button>
                      )}
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Veículos tab - continuação do código original */}
                <TabsContent value="vehicles" className="mt-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Meus Veículos</CardTitle>
                        <CardDescription>Gerencie os veículos cadastrados em sua conta.</CardDescription>
                        <div className="text-sm text-gray-600 mt-2">
                          <p>
                            Plano {userData.plan}: {userData.vehicles.length}/{userData.plan === "Premium" ? 2 : 1} veículo
                            {userData.plan === "Premium" ? "s" : ""} cadastrado{userData.plan === "Premium" ? "s" : ""}
                          </p>
                          {userData.plan === "Gratuita" && userData.vehicles.length >= 1 && (
                            <p className="text-amber-600 mt-1">
                              Atualize para o plano Premium para adicionar mais veículos!
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Rest of vehicle management UI remains the same, but uses userData instead of user */}
                      <Dialog open={isAddingVehicle} onOpenChange={setIsAddingVehicle}>
                        <DialogTrigger asChild>
                          <Button size="sm" disabled={userData.vehicles.length >= (userData.plan === "Premium" ? 2 : 1)}>
                            <Plus className="mr-2 h-4 w-4" /> Adicionar Veículo
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white">
                          <DialogHeader>
                            <DialogTitle>Adicionar Novo Veículo</DialogTitle>
                            <DialogDescription>
                              Preencha os detalhes do seu veículo para encontrar vagas compatíveis.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4 bg-white">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="vehicle-name" className="text-right">
                                Nome
                              </Label>
                              <Input
                                id="vehicle-name"
                                name="name"
                                placeholder="Ex: Meu Carro"
                                className="col-span-3"
                                value={newVehicle.name}
                                onChange={handleVehicleInputChange}
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="vehicle-plate" className="text-right">
                                Placa
                              </Label>
                              <Input
                                id="vehicle-plate"
                                name="plate"
                                placeholder="Ex: ABC1234"
                                className="col-span-3"
                                value={newVehicle.plate}
                                onChange={handleVehicleInputChange}
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="vehicle-type" className="text-right">
                                Tipo
                              </Label>
                              <select
                                id="vehicle-type"
                                name="type"
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={newVehicle.type}
                                onChange={handleVehicleInputChange}
                              >
                                <option value="Carro">Carro</option>
                                <option value="SUV">SUV</option>
                                <option value="Caminhonete">Caminhonete</option>
                                <option value="Moto">Moto</option>
                                <option value="Van">Van</option>
                              </select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="vehicle-length" className="text-right">
                                Comprimento (m)
                              </Label>
                              <Input
                                id="vehicle-length"
                                name="length"
                                type="number"
                                step="0.1"
                                className="col-span-3"
                                value={newVehicle.length}
                                onChange={handleVehicleInputChange}
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="vehicle-width" className="text-right">
                                Largura (m)
                              </Label>
                              <Input
                                id="vehicle-width"
                                name="width"
                                type="number"
                                step="0.1"
                                className="col-span-3"
                                value={newVehicle.width}
                                onChange={handleVehicleInputChange}
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="vehicle-height" className="text-right">
                                Altura (m)
                              </Label>
                              <Input
                                id="vehicle-height"
                                name="height"
                                type="number"
                                step="0.1"
                                className="col-span-3"
                                value={newVehicle.height}
                                onChange={handleVehicleInputChange}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddingVehicle(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleAddVehicle} disabled={isSaving}>
                              {isSaving ? (
                                <>
                                  <span className="animate-spin mr-2">⏳</span> Salvando...
                                </>
                              ) : (
                                "Adicionar"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    
                    <CardContent>
                      {userData.vehicles.length === 0 ? (
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
                          {userData.vehicles.map((vehicle) => (
                            <Card key={vehicle.id}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <div className="bg-gray-100 p-2 rounded-full">
                                      <Car className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                      <h3 className="font-medium">{vehicle.name}</h3>
                                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <Badge variant="outline">{vehicle.plate}</Badge>
                                        <span>•</span>
                                        <span>{vehicle.type}</span>
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
                                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                                  <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
                                    <span className="text-gray-500">Comprimento</span>
                                    <span className="font-medium">{vehicle.length} m</span>
                                  </div>
                                  <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
                                    <span className="text-gray-500">Largura</span>
                                    <span className="font-medium">{vehicle.width} m</span>
                                  </div>
                                  <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
                                    <span className="text-gray-500">Altura</span>
                                    <span className="font-medium">{vehicle.height} m</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
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
    </main>
  )
}
