"use client"

import { useState, useEffect, useRef } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DesignConfigurator } from "@/components/documents/design-configurator"
import { documentGenerator } from "@/lib/document-generator"
import { documentStorage } from "@/lib/document-storage"
import { 
  FileText,
  Download,
  Eye,
  Search,
  Trash2,
  Plus,
  Filter,
  Calendar,
  User,
  FileType,
  Settings,
  Palette,
  Upload,
  Database,
  RefreshCw
} from "lucide-react"

const documentTypes = {
  bulletin: { label: "Bulletins", icon: FileText, color: "bg-blue-100 text-blue-800" },
  emploi_temps: { label: "Emplois du temps", icon: Calendar, color: "bg-green-100 text-green-800" },
  rapport: { label: "Rapports", icon: FileText, color: "bg-purple-100 text-purple-800" },
  certificat: { label: "Certificats", icon: FileText, color: "bg-orange-100 text-orange-800" }
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [showDesignModal, setShowDesignModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [designConfig, setDesignConfig] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)

  const [stats, setStats] = useState({
    total: 0,
    bulletins: 0,
    emplois_temps: 0,
    rapports: 0,
    certificats: 0
  })

  useEffect(() => {
    loadDocuments()
  }, [])

  useEffect(() => {
    const loadStats = async () => {
      const documentStats = await documentGenerator.getDocumentStats()
      setStats(documentStats)
    }
    loadStats()
  }, [documents])

  const loadDocuments = async () => {
    setIsLoading(true)
    try {
      const docs = await documentGenerator.getAllDocuments()
      setDocuments(docs)
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.generated_for.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || doc.type === selectedType
    return matchesSearch && matchesType
  })

  const handleDownload = async (documentId) => {
    try {
      await documentGenerator.downloadDocument(documentId)
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      alert('Erreur lors du téléchargement du document')
    }
  }

  const handleDelete = async (documentId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        await documentGenerator.deleteDocument(documentId)
        loadDocuments()
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        alert('Erreur lors de la suppression du document')
      }
    }
  }

  const handleDesignChange = (config) => {
    setDesignConfig(config)
  }

  const handlePreview = (config) => {
    // Ici vous pouvez implémenter la prévisualisation
    console.log("Prévisualisation avec config:", config)
  }

  const handleExportMetadata = async () => {
    try {
      await documentStorage.exportMetadata()
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
      alert('Erreur lors de l\'export des métadonnées')
    }
  }

  const handleImportMetadata = async (event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        const count = await documentStorage.importMetadata(file)
        alert(`${count} documents importés avec succès`)
        loadDocuments()
      } catch (error) {
        console.error('Erreur lors de l\'import:', error)
        alert('Erreur lors de l\'import des métadonnées')
      }
    }
  }

  const handleCleanup = async () => {
    if (confirm("Voulez-vous nettoyer les métadonnées orphelines ?")) {
      try {
        const count = await documentStorage.cleanupOrphanedMetadata()
        alert(`${count} métadonnées orphelines supprimées`)
        loadDocuments()
      } catch (error) {
        console.error('Erreur lors du nettoyage:', error)
        alert('Erreur lors du nettoyage')
      }
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader
            title="Gestion des Documents"
            description="Gérez et personnalisez tous vos documents générés"
          >
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCleanup}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Nettoyer
              </Button>
              <Button variant="outline" onClick={handleExportMetadata}>
                <Database className="h-4 w-4 mr-2" />
                Exporter DB
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Importer DB
              </Button>
              <Button variant="outline" onClick={() => setShowDesignModal(true)}>
                <Palette className="h-4 w-4 mr-2" />
                Design global
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau document
              </Button>
            </div>
          </PageHeader>

          {/* Input caché pour l'import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportMetadata}
            style={{ display: 'none' }}
          />

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.bulletins}</p>
                    <p className="text-sm text-muted-foreground">Bulletins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.emplois_temps}</p>
                    <p className="text-sm text-muted-foreground">Emplois du temps</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.rapports}</p>
                    <p className="text-sm text-muted-foreground">Rapports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.certificats}</p>
                    <p className="text-sm text-muted-foreground">Certificats</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle>Filtres et recherche</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Rechercher par nom ou élève..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Type de document" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {Object.entries(documentTypes).map(([key, type]) => (
                      <SelectItem key={key} value={key}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Liste des documents */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documents générés</CardTitle>
                  <CardDescription>
                    {isLoading ? "Chargement..." : `${filteredDocuments.length} document(s) trouvé(s)`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Chargement des documents...</p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun document trouvé</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Généré pour</TableHead>
                      <TableHead>Taille</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => {
                      const typeInfo = documentTypes[doc.type] || documentTypes.bulletin
                      return (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <typeInfo.icon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{doc.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={typeInfo.color}>
                              {typeInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{doc.generated_for}</TableCell>
                          <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                          <TableCell>{formatDate(doc.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(doc.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedDocument(doc)
                                  setDesignConfig(doc.design_config)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(doc.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal de configuration du design global */}
      <Dialog open={showDesignModal} onOpenChange={setShowDesignModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configuration du design global</DialogTitle>
            <DialogDescription>
              Personnalisez l'apparence par défaut de tous vos documents
            </DialogDescription>
          </DialogHeader>
          <DesignConfigurator
            designConfig={designConfig}
            onDesignChange={handleDesignChange}
            onPreview={handlePreview}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de prévisualisation du document */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prévisualisation du document</DialogTitle>
            <DialogDescription>
              {selectedDocument?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Type:</strong> {documentTypes[selectedDocument.type]?.label}
                </div>
                <div>
                  <strong>Généré pour:</strong> {selectedDocument.generated_for}
                </div>
                <div>
                  <strong>Taille:</strong> {formatFileSize(selectedDocument.file_size)}
                </div>
                <div>
                  <strong>Date:</strong> {formatDate(selectedDocument.created_at)}
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Configuration du design</h4>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(selectedDocument.design_config, null, 2)}
                </pre>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedDocument(null)}>
                  Fermer
                </Button>
                <Button onClick={() => handleDownload(selectedDocument.id)}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
