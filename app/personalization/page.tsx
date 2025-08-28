"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  Moon,
  Sun,
  Palette,
  Eye,
  Download,
  Save,
  RefreshCw,
  CheckCircle
} from "lucide-react"

interface ThemeSettings {
  mode: "light" | "dark" | "auto"
  primaryColor: string
  accentColor: string
  sidebarColor: string
  borderRadius: "none" | "small" | "medium" | "large"
  fontSize: "small" | "medium" | "large"
}

const colorOptions = [
  { name: "Rouge", value: "red", hex: "#ef4444" },
  { name: "Bleu", value: "blue", hex: "#3b82f6" },
  { name: "Vert", value: "green", hex: "#10b981" },
  { name: "Violet", value: "purple", hex: "#8b5cf6" },
  { name: "Orange", value: "orange", hex: "#f97316" },
  { name: "Rose", value: "pink", hex: "#ec4899" },
  { name: "Indigo", value: "indigo", hex: "#6366f1" },
  { name: "Emeraude", value: "emerald", hex: "#059669" },
]

const mockSettings: ThemeSettings = {
  mode: "light",
  primaryColor: "red",
  accentColor: "blue",
  sidebarColor: "gray",
  borderRadius: "medium",
  fontSize: "medium"
}

export default function PersonalizationPage() {
  const [settings, setSettings] = useState<ThemeSettings>(mockSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Appliquer les paramètres au document
  useEffect(() => {
    const root = document.documentElement
    
    // Mode sombre/clair
    if (settings.mode === "dark") {
      root.classList.add("dark")
    } else if (settings.mode === "light") {
      root.classList.remove("dark")
    } else {
      // Auto - basé sur les préférences système
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      if (prefersDark) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }

    // Couleurs personnalisées
    const primaryColor = colorOptions.find(c => c.value === settings.primaryColor)?.hex || "#ef4444"
    const accentColor = colorOptions.find(c => c.value === settings.accentColor)?.hex || "#3b82f6"
    
    root.style.setProperty("--primary-color", primaryColor)
    root.style.setProperty("--accent-color", accentColor)

    // Border radius
    const borderRadiusMap = {
      none: "0px",
      small: "4px",
      medium: "8px",
      large: "12px"
    }
    root.style.setProperty("--border-radius", borderRadiusMap[settings.borderRadius])

    // Font size
    const fontSizeMap = {
      small: "14px",
      medium: "16px",
      large: "18px"
    }
    root.style.setProperty("--font-size", fontSizeMap[settings.fontSize])
  }, [settings])

  const handleSave = async () => {
    setIsLoading(true)
    // Simuler une sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaved(true)
    setIsLoading(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    setSettings(mockSettings)
  }

  const getColorPreview = (colorValue: string) => {
    const color = colorOptions.find(c => c.value === colorValue)
    return color?.hex || "#ef4444"
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader
            title="Personnalisation"
            description="Personnalisez l'apparence de l'application"
          />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Mode d'affichage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Moon className="h-5 w-5" />
                  <span>Mode d'affichage</span>
                </CardTitle>
                <CardDescription>
                  Choisissez entre le mode clair, sombre ou automatique
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mode">Mode</Label>
                    <Select value={settings.mode} onValueChange={(value: "light" | "dark" | "auto") => 
                      setSettings({...settings, mode: value})
                    }>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center space-x-2">
                            <Sun className="h-4 w-4" />
                            <span>Clair</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center space-x-2">
                            <Moon className="h-4 w-4" />
                            <span>Sombre</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="auto">
                          <div className="flex items-center space-x-2">
                            <Eye className="h-4 w-4" />
                            <span>Auto</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        settings.mode === "light" 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 bg-gray-50"
                      }`}
                      onClick={() => setSettings({...settings, mode: "light"})}
                    >
                      <div className="text-center">
                        <Sun className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                        <p className="text-sm font-medium">Clair</p>
                        <p className="text-xs text-muted-foreground">Mode clair</p>
                      </div>
                    </div>

                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        settings.mode === "dark" 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 bg-gray-50"
                      }`}
                      onClick={() => setSettings({...settings, mode: "dark"})}
                    >
                      <div className="text-center">
                        <Moon className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                        <p className="text-sm font-medium">Sombre</p>
                        <p className="text-xs text-muted-foreground">Mode sombre</p>
                      </div>
                    </div>

                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        settings.mode === "auto" 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 bg-gray-50"
                      }`}
                      onClick={() => setSettings({...settings, mode: "auto"})}
                    >
                      <div className="text-center">
                        <Eye className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-sm font-medium">Auto</p>
                        <p className="text-xs text-muted-foreground">Système</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Couleurs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Couleurs</span>
                </CardTitle>
                <CardDescription>
                  Personnalisez les couleurs de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="primaryColor">Couleur principale</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {colorOptions.map((color) => (
                        <div
                          key={color.value}
                          className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-all ${
                            settings.primaryColor === color.value 
                              ? "border-gray-800 scale-110" 
                              : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color.hex }}
                          onClick={() => setSettings({...settings, primaryColor: color.value})}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accentColor">Couleur d'accent</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {colorOptions.map((color) => (
                        <div
                          key={color.value}
                          className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-all ${
                            settings.accentColor === color.value 
                              ? "border-gray-800 scale-110" 
                              : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color.hex }}
                          onClick={() => setSettings({...settings, accentColor: color.value})}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Aperçu</p>
                      <p className="text-xs text-muted-foreground">Couleurs sélectionnées</p>
                    </div>
                    <div className="flex space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: getColorPreview(settings.primaryColor) }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: getColorPreview(settings.accentColor) }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interface */}
            <Card>
              <CardHeader>
                <CardTitle>Interface</CardTitle>
                <CardDescription>
                  Personnalisez l'apparence de l'interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="borderRadius">Rayon des bordures</Label>
                    <Select value={settings.borderRadius} onValueChange={(value: "none" | "small" | "medium" | "large") => 
                      setSettings({...settings, borderRadius: value})
                    }>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun</SelectItem>
                        <SelectItem value="small">Petit</SelectItem>
                        <SelectItem value="medium">Moyen</SelectItem>
                        <SelectItem value="large">Grand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="fontSize">Taille de police</Label>
                    <Select value={settings.fontSize} onValueChange={(value: "small" | "medium" | "large") => 
                      setSettings({...settings, fontSize: value})
                    }>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Petite</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Aperçu</Label>
                    <div className="p-4 border rounded-lg bg-card">
                      <p className="text-sm">Ceci est un aperçu de l'interface avec vos paramètres actuels.</p>
                      <Button size="sm" className="mt-2">Bouton exemple</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Sauvegardez ou réinitialisez vos paramètres
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button 
                    onClick={handleSave} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : saved ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? "Sauvegarde..." : saved ? "Sauvegardé !" : "Sauvegarder"}
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Réinitialiser
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exporter les paramètres
                  </Button>
                </div>

                <Separator />

                <div className="text-sm text-muted-foreground">
                  <p>• Les paramètres sont sauvegardés automatiquement</p>
                  <p>• Le mode sombre réduit la fatigue oculaire</p>
                  <p>• Les couleurs s'appliquent à toute l'application</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}


