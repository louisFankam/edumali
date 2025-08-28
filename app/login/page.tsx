"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Eye,
  EyeOff,
  Lock,
  User,
  GraduationCap,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Simulation d'une authentification
    try {
      // Simuler un délai de connexion
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Vérification des identifiants (en production, ceci serait une API)
      if (formData.username === "admin" && formData.password === "admin123") {
        setSuccess("Connexion réussie ! Redirection...")
        
        // Simuler la redirection
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      } else {
        setError("Nom d'utilisateur ou mot de passe incorrect")
      }
    } catch (err) {
      setError("Erreur de connexion. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-lg mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <div className="mb-4">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              EduMali
            </h1>
            <p className="text-sm text-gray-600">
              Gestion Scolaire
            </p>
          </div>
          
          
        </div>

        {/* Carte de connexion */}
        <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">
              Connexion
            </CardTitle>
            <CardDescription className="text-center">
              Connectez-vous à votre compte administrateur
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Messages d'erreur/succès */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom d'utilisateur */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Nom d'utilisateur
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Entrez votre nom d'utilisateur"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => handleInputChange("rememberMe", checked)}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-normal cursor-pointer"
                >
                  Se souvenir de moi
                </Label>
              </div>

              {/* Bouton de connexion */}
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Connexion en cours...</span>
                  </div>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

            {/* Informations de test */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Identifiants de test :
              </h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Utilisateur :</strong> admin</p>
                <p><strong>Mot de passe :</strong> admin123</p>
              </div>
            </div>

            {/* Liens utiles */}
            <div className="text-center space-y-2">
              <Button
                variant="link"
                className="text-sm text-gray-600 hover:text-red-600 transition-colors duration-200"
                disabled={isLoading}
              >
                Mot de passe oublié ?
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 École Primaire de Bamako. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  )
}
