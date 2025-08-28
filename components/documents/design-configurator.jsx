"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Palette, Type, Layout, Eye } from "lucide-react"

const designTemplates = {
  modern: {
    name: "Moderne",
    description: "Design épuré et professionnel",
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    accentColor: '#f59e0b',
    titleFont: 'Arial',
    style: 'minimal'
  },
  classic: {
    name: "Classique",
    description: "Style traditionnel et formel",
    primaryColor: '#1f2937',
    secondaryColor: '#6b7280',
    accentColor: '#d97706',
    titleFont: 'Times New Roman',
    style: 'formal'
  },
  colorful: {
    name: "Coloré",
    description: "Design dynamique et moderne",
    primaryColor: '#ef4444',
    secondaryColor: '#f59e0b',
    accentColor: '#10b981',
    titleFont: 'Arial',
    style: 'playful'
  }
}

const fontOptions = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Courier New', label: 'Courier New' }
]

export function DesignConfigurator({ designConfig, onDesignChange, onPreview }) {
  const [config, setConfig] = useState(designConfig || {
    template: 'modern',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    accentColor: '#f59e0b',
    titleFont: 'Arial',
    bodyFont: 'Helvetica',
    titleSize: 24,
    bodySize: 12,
    showLogo: true,
    showWatermark: false,
    borderStyle: 'solid',
    borderColor: '#e5e7eb'
  })

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    onDesignChange?.(newConfig)
  }

  const handleTemplateChange = (template) => {
    const templateConfig = designTemplates[template]
    const newConfig = {
      ...config,
      template,
      primaryColor: templateConfig.primaryColor,
      secondaryColor: templateConfig.secondaryColor,
      accentColor: templateConfig.accentColor,
      titleFont: templateConfig.titleFont
    }
    setConfig(newConfig)
    onDesignChange?.(newConfig)
  }

  const resetToDefault = () => {
    const defaultConfig = {
      template: 'modern',
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      accentColor: '#f59e0b',
      titleFont: 'Arial',
      bodyFont: 'Helvetica',
      titleSize: 24,
      bodySize: 12,
      showLogo: true,
      showWatermark: false,
      borderStyle: 'solid',
      borderColor: '#e5e7eb'
    }
    setConfig(defaultConfig)
    onDesignChange?.(defaultConfig)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Personnalisation du design</h3>
          <p className="text-sm text-muted-foreground">
            Personnalisez l'apparence de vos documents
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={resetToDefault}>
            Réinitialiser
          </Button>
          <Button size="sm" onClick={() => onPreview?.(config)}>
            <Eye className="h-4 w-4 mr-2" />
            Prévisualiser
          </Button>
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="colors">Couleurs</TabsTrigger>
          <TabsTrigger value="typography">Typographie</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(designTemplates).map(([key, template]) => (
              <Card 
                key={key}
                className={`cursor-pointer transition-all ${
                  config.template === key 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleTemplateChange(key)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div 
                      className="h-20 rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, ${template.primaryColor} 0%, ${template.accentColor} 100%)`
                      }}
                    />
                    <div>
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="primaryColor">Couleur principale</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={config.primaryColor}
                  onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="secondaryColor">Couleur secondaire</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={config.secondaryColor}
                  onChange={(e) => handleConfigChange('secondaryColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={config.secondaryColor}
                  onChange={(e) => handleConfigChange('secondaryColor', e.target.value)}
                  placeholder="#64748b"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="accentColor">Couleur d'accent</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={config.accentColor}
                  onChange={(e) => handleConfigChange('accentColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={config.accentColor}
                  onChange={(e) => handleConfigChange('accentColor', e.target.value)}
                  placeholder="#f59e0b"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="borderColor">Couleur des bordures</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="borderColor"
                  type="color"
                  value={config.borderColor}
                  onChange={(e) => handleConfigChange('borderColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={config.borderColor}
                  onChange={(e) => handleConfigChange('borderColor', e.target.value)}
                  placeholder="#e5e7eb"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="titleFont">Police des titres</Label>
              <Select value={config.titleFont} onValueChange={(value) => handleConfigChange('titleFont', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map(font => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="bodyFont">Police du texte</Label>
              <Select value={config.bodyFont} onValueChange={(value) => handleConfigChange('bodyFont', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map(font => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="titleSize">Taille des titres (px)</Label>
              <Input
                id="titleSize"
                type="number"
                min="12"
                max="48"
                value={config.titleSize}
                onChange={(e) => handleConfigChange('titleSize', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="bodySize">Taille du texte (px)</Label>
              <Input
                id="bodySize"
                type="number"
                min="8"
                max="24"
                value={config.bodySize}
                onChange={(e) => handleConfigChange('bodySize', parseInt(e.target.value))}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="showLogo">Afficher le logo</Label>
                <Switch
                  id="showLogo"
                  checked={config.showLogo}
                  onCheckedChange={(checked) => handleConfigChange('showLogo', checked)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="showWatermark">Filigrane</Label>
                <Switch
                  id="showWatermark"
                  checked={config.showWatermark}
                  onCheckedChange={(checked) => handleConfigChange('showWatermark', checked)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="borderStyle">Style des bordures</Label>
              <Select value={config.borderStyle} onValueChange={(value) => handleConfigChange('borderStyle', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Pleine</SelectItem>
                  <SelectItem value="dashed">Pointillés</SelectItem>
                  <SelectItem value="dotted">Points</SelectItem>
                  <SelectItem value="none">Aucune</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Prévisualisation rapide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Aperçu du design</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="p-4 rounded-lg border"
            style={{
              borderColor: config.borderColor,
              borderStyle: config.borderStyle,
              fontFamily: config.bodyFont
            }}
          >
            <h3 
              style={{
                color: config.primaryColor,
                fontFamily: config.titleFont,
                fontSize: `${config.titleSize}px`
              }}
            >
              Exemple de titre
            </h3>
            <p 
              style={{
                color: config.secondaryColor,
                fontSize: `${config.bodySize}px`
              }}
            >
              Ceci est un exemple de texte avec les couleurs et polices sélectionnées.
            </p>
            <div 
              className="mt-2 px-3 py-1 rounded text-white text-sm inline-block"
              style={{ backgroundColor: config.accentColor }}
            >
              Élément d'accent
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

