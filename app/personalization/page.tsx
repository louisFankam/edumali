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
import { useUserPreferences, type UserPreferences } from "@/hooks/use-user-preferences"
import { 
  Moon,
  Sun,
  Palette,
  Eye,
  Download,
  Save,
  RefreshCw,
  CheckCircle,
  Layout,
  Type,
  Monitor,
  Smartphone,
  Zap,
  Contrast,
  Plus
} from "lucide-react"

const colorOptions = [
  { name: "Rouge", value: "#ef4444", hex: "#ef4444" },
  { name: "Bleu", value: "#3b82f6", hex: "#3b82f6" },
  { name: "Vert", value: "#10b981", hex: "#10b981" },
  { name: "Violet", value: "#8b5cf6", hex: "#8b5cf6" },
  { name: "Orange", value: "#f97316", hex: "#f97316" },
  { name: "Rose", value: "#ec4899", hex: "#ec4899" },
  { name: "Indigo", value: "#6366f1", hex: "#6366f1" },
  { name: "Emeraude", value: "#059669", hex: "#059669" },
  { name: "Cyan", value: "#06b6d4", hex: "#06b6d4" },
  { name: "Ambre", value: "#f59e0b", hex: "#f59e0b" },
]

const fontOptions = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Open Sans", value: "'Open Sans', sans-serif" },
  { name: "Montserrat", value: "Montserrat, sans-serif" },
  { name: "Poppins", value: "Poppins, sans-serif" },
  { name: "Lato", value: "Lato, sans-serif" },
]

export default function PersonalizationPage() {
  const { 
    preferences, 
    isLoading: prefsLoading, 
    error, 
    updatePreference, 
    resetPreferences,
    savePreferences 
  } = useUserPreferences()
  
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [exportData, setExportData] = useState<string | null>(null)
  
  // États pour les color pickers personnalisés
  const [showColorPickers, setShowColorPickers] = useState({
    primary: false,
    secondary: false,
    accent: false,
    sidebar: false,
    sidebar_text: false
  })

  // Fonction pour ajouter l'option de couleur personnalisée
  const renderColorOptions = (currentColor: string, colorType: 'primary' | 'secondary' | 'accent' | 'sidebar' | 'sidebar_text') => {
    const isCustomColor = !colorOptions.some(option => option.value === currentColor)
    
    return (
      <div className="grid grid-cols-6 gap-2 mt-2">
        {colorOptions.map((color) => (
          <div
            key={color.value}
            className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-all ${
              currentColor === color.value 
                ? "border-gray-800 scale-110 ring-2 ring-offset-2" 
                : "border-gray-300 hover:scale-105"
            }`}
            style={{ backgroundColor: color.hex }}
            onClick={() => updatePreference(`${colorType}_color` as keyof UserPreferences, color.value)}
            title={color.name}
          />
        ))}
        
        {/* Option "Autre couleur" avec color picker */}
        <div className="relative">
          <div
            className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-all flex items-center justify-center ${
              isCustomColor 
                ? "border-gray-800 scale-110 ring-2 ring-offset-2" 
                : "border-gray-300 hover:scale-105 bg-gradient-to-br from-red-400 via-green-400 to-blue-400"
            }`}
            onClick={() => setShowColorPickers(prev => ({ ...prev, [colorType]: !prev[colorType] }))}
            title="Autre couleur"
          >
            {isCustomColor && (
              <div 
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: currentColor }}
              />
            )}
            {!isCustomColor && (
              <Plus className="h-4 w-4 text-white" />
            )}
          </div>
          
          {showColorPickers[colorType] && (
            <div className="absolute top-10 left-0 z-50 bg-white border border-gray-300 rounded-lg p-2 shadow-lg">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => {
                  updatePreference(`${colorType}_color` as keyof UserPreferences, e.target.value)
                  setShowColorPickers(prev => ({ ...prev, [colorType]: false }))
                }}
                className="w-16 h-8 border-none cursor-pointer"
              />
              <div className="text-xs text-gray-600 mt-1 text-center">Personnalisé</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    if (!preferences) return
    
    setIsSaving(true)
    try {
      const success = await savePreferences(preferences)
      if (success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (!preferences) return
    
    setIsSaving(true)
    try {
      const success = await resetPreferences()
      if (success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    if (preferences) {
      const dataStr = JSON.stringify(preferences, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'edumali-preferences.json'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && preferences) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const importedPrefs = JSON.parse(e.target?.result as string)
          const mergedPrefs = { ...preferences, ...importedPrefs }
          await savePreferences(mergedPrefs)
          setSaved(true)
          setTimeout(() => setSaved(false), 3000)
        } catch (error) {
          console.error('Erreur lors de l\'import:', error)
          alert('Erreur lors de l\'import des préférences')
        }
      }
      reader.readAsText(file)
    }
    // Reset l'input
    event.target.value = ''
  }

  if (prefsLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 md:ml-64">
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Chargement des préférences...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !preferences) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 md:ml-64">
          <div className="p-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">Erreur de chargement des préférences</p>
              <Button onClick={() => window.location.reload()}>Réessayer</Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader
            title="Personnalisation"
            description="Personnalisez l'apparence et le comportement de l'application"
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Thème */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Moon className="h-5 w-5" />
                  <span>Thème</span>
                </CardTitle>
                <CardDescription>
                  Choisissez votre thème préféré
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme">Mode</Label>
                    <Select value={preferences.theme} onValueChange={(value: "light" | "dark" | "auto") => 
                      updatePreference('theme', value)
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

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { mode: 'light' as const, icon: Sun, label: 'Clair', desc: 'Mode clair' },
                      { mode: 'dark' as const, icon: Moon, label: 'Sombre', desc: 'Mode sombre' },
                      { mode: 'auto' as const, icon: Eye, label: 'Auto', desc: 'Système' }
                    ].map(({ mode, icon: Icon, label, desc }) => (
                      <div 
                        key={mode}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                          preferences.theme === mode 
                            ? "border-primary bg-primary/5" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => updatePreference('theme', mode)}
                      >
                        <Icon className="h-5 w-5 mx-auto mb-1" />
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    ))}
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
                    <Label>Couleur principale</Label>
                    {renderColorOptions(preferences.primary_color, 'primary')}
                  </div>

                  <div>
                    <Label>Couleur secondaire</Label>
                    {renderColorOptions(preferences.secondary_color, 'secondary')}
                  </div>

                  <div>
                    <Label>Couleur d'accent</Label>
                    {renderColorOptions(preferences.accent_color, 'accent')}
                  </div>

                  <div>
                    <Label>Couleur du sidebar</Label>
                    {renderColorOptions(preferences.sidebar_color, 'sidebar')}
                  </div>

                  <div>
                    <Label>Couleur du texte du sidebar</Label>
                    {renderColorOptions(preferences.sidebar_text_color, 'sidebar_text')}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Aperçu</span>
                    <div className="flex space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: preferences.primary_color }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: preferences.secondary_color }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: preferences.accent_color }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: preferences.sidebar_color }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: preferences.sidebar_text_color }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Typographie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Type className="h-5 w-5" />
                  <span>Typographie</span>
                </CardTitle>
                <CardDescription>
                  Personnalisez la police et la taille du texte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fontSize">Taille de police</Label>
                    <Select value={preferences.font_size} onValueChange={(value: "small" | "medium" | "large") => 
                      updatePreference('font_size', value)
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

                  <div className="flex items-center justify-between">
                    <Label htmlFor="fontFamily">Police</Label>
                    <Select value={preferences.font_family} onValueChange={(value) => 
                      updatePreference('font_family', value)
                    }>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="borderRadius">Bordures</Label>
                    <Select value={preferences.border_radius} onValueChange={(value: "none" | "small" | "medium" | "large") => 
                      updatePreference('border_radius', value)
                    }>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune</SelectItem>
                        <SelectItem value="small">Petite</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 border rounded-lg" style={{ 
                    fontFamily: preferences.font_family,
                    fontSize: preferences.font_size === 'small' ? '14px' : 
                              preferences.font_size === 'medium' ? '16px' : '18px',
                    borderRadius: preferences.border_radius === 'none' ? '0px' :
                               preferences.border_radius === 'small' ? '4px' :
                               preferences.border_radius === 'medium' ? '8px' : '12px'
                  }}>
                    <p className="mb-2">Aperçu du texte avec vos paramètres</p>
                    <Button size="sm">Exemple de bouton</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Layout */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Layout className="h-5 w-5" />
                  <span>Interface</span>
                </CardTitle>
                <CardDescription>
                  Personnalisez la disposition et les comportements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mode compacte</Label>
                      <p className="text-xs text-muted-foreground">Réduit l'espacement</p>
                    </div>
                    <Switch 
                      checked={preferences.dense_mode}
                      onCheckedChange={(checked) => updatePreference('dense_mode', checked)}
                    />
                  </div>

  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Animations</Label>
                      <p className="text-xs text-muted-foreground">Effets visuels</p>
                    </div>
                    <Switch 
                      checked={preferences.animations}
                      onCheckedChange={(checked) => updatePreference('animations', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Contraste élevé</Label>
                      <p className="text-xs text-muted-foreground">Pour l'accessibilité</p>
                    </div>
                    <Switch 
                      checked={preferences.high_contrast}
                      onCheckedChange={(checked) => updatePreference('high_contrast', checked)}
                    />
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
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : saved ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSaving ? "Sauvegarde..." : saved ? "Sauvegardé !" : "Sauvegarder"}
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    disabled={isSaving}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Réinitialiser
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleExport}
                      disabled={isSaving}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>

                    <Label 
                      htmlFor="import-settings"
                      className="flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer"
                    >
                      Importer
                    </Label>
                    <input 
                      id="import-settings"
                      type="file" 
                      accept=".json" 
                      onChange={handleImport}
                      className="hidden"
                    />
                  </div>
                </div>

                <Separator />

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Les paramètres sont sauvegardés automatiquement</p>
                  <p>• Le mode sombre réduit la fatigue oculaire</p>
                  <p>• Les couleurs s'appliquent à toute l'application</p>
                  <p>• Importez/exportez pour partager vos préférences</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}


