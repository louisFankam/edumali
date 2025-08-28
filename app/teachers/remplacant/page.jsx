"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Plus,
  Search,
  Eye,
  Phone,
  Mail,
  MapPin,
  Star,
  UserPlus,
  BookOpen,
  DollarSign
} from "lucide-react"

// Mock data simplifié pour les remplaçants
const mockSubstitutes = [
  {
    id: 1,
    firstName: "Aminata",
    lastName: "Diallo",
    subjects: ["Mathématiques", "Sciences"],
    phone: "+223 76 12 34 56",
    email: "aminata.diallo@edumali.ml",
    address: "Quartier Hippodrome, Bamako",
    hourlyRate: 3000,
    rating: 4.5,
    status: "Disponible"
  },
  {
    id: 2,
    firstName: "Bakary",
    lastName: "Koné",
    subjects: ["Français", "Histoire-Géographie"],
    phone: "+223 65 98 76 54",
    email: "bakary.kone@edumali.ml",
    address: "Médina Coura, Sikasso",
    hourlyRate: 2800,
    rating: 4.2,
    status: "Disponible"
  },
  {
    id: 3,
    firstName: "Kadiatou",
    lastName: "Sidibé",
    subjects: ["Anglais", "Éducation Physique"],
    phone: "+223 78 45 67 89",
    email: "kadiatou.sidibe@edumali.ml",
    address: "Komoguel, Mopti",
    hourlyRate: 2500,
    rating: 4.0,
    status: "En remplacement"
  },
  {
    id: 4,
    firstName: "Seydou",
    lastName: "Traoré",
    subjects: ["Physique", "Chimie"],
    phone: "+223 69 87 54 32",
    email: "seydou.traore@edumali.ml",
    address: "Château, Gao",
    hourlyRate: 3200,
    rating: 4.7,
    status: "Disponible"
  },
  {
    id: 5,
    firstName: "Fatoumata",
    lastName: "Coulibaly",
    subjects: ["Biologie", "SVT"],
    phone: "+223 77 23 45 67",
    email: "fatoumata.coulibaly@edumali.ml",
    address: "Liberté, Kayes",
    hourlyRate: 2900,
    rating: 4.3,
    status: "Disponible"
  },
  {
    id: 6,
    firstName: "Moussa",
    lastName: "Diarra",
    subjects: ["Informatique", "Technologie"],
    phone: "+223 66 78 90 12",
    email: "moussa.diarra@edumali.ml",
    address: "Hamdallaye, Bamako",
    hourlyRate: 3500,
    rating: 4.6,
    status: "Disponible"
  }
]

// Modal pour voir les détails d'un remplaçant
function SubstituteDetailsModal({ substitute, isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails du remplaçant</DialogTitle>
          <DialogDescription>
            Informations complètes sur {substitute.firstName} {substitute.lastName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <h4 className="font-medium mb-2">Informations personnelles</h4>
              <div className="text-sm space-y-1">
                <p><strong>Nom :</strong> {substitute.firstName} {substitute.lastName}</p>
                <p><strong>Statut :</strong> 
                  <Badge variant={substitute.status === "Disponible" ? "default" : "secondary"} className="ml-2">
                    {substitute.status}
                  </Badge>
                </p>
                <div className="flex items-center text-yellow-600">
                  <Star className="h-3 w-3" />
                  <span className="text-sm ml-1">{substitute.rating}/5</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Contact</h4>
              <div className="text-sm space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="h-3 w-3" />
                  <span>{substitute.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-3 w-3" />
                  <span>{substitute.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-3 w-3" />
                  <span>{substitute.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Matières et tarif */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Matières enseignées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {substitute.subjects.map(subject => (
                    <Badge key={subject} variant="outline" className="mr-1 mb-1">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Tarif horaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {substitute.hourlyRate.toLocaleString()} FCFA
                </div>
                <p className="text-sm text-muted-foreground">par heure</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button>
              <Phone className="h-4 w-4 mr-2" />
              Contacter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Modal pour ajouter un nouveau remplaçant
function AddSubstituteModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    subjects: [],
    phone: "",
    email: "",
    address: "",
    hourlyRate: ""
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newSubstitute = {
      id: Date.now(),
      ...formData,
      hourlyRate: parseInt(formData.hourlyRate),
      rating: 0,
      status: "Disponible"
    }
    onAdd(newSubstitute)
    setFormData({
      firstName: "",
      lastName: "",
      subjects: [],
      phone: "",
      email: "",
      address: "",
      hourlyRate: ""
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau remplaçant</DialogTitle>
          <DialogDescription>
            Remplissez les informations du nouveau professeur remplaçant
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Prénom</label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nom</label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Matières enseignées</label>
            <Select onValueChange={(value) => setFormData({...formData, subjects: [value]})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une matière" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mathématiques">Mathématiques</SelectItem>
                <SelectItem value="Français">Français</SelectItem>
                <SelectItem value="Sciences">Sciences</SelectItem>
                <SelectItem value="Anglais">Anglais</SelectItem>
                <SelectItem value="Histoire-Géographie">Histoire-Géographie</SelectItem>
                <SelectItem value="Physique">Physique</SelectItem>
                <SelectItem value="Chimie">Chimie</SelectItem>
                <SelectItem value="Biologie">Biologie</SelectItem>
                <SelectItem value="Éducation Physique">Éducation Physique</SelectItem>
                <SelectItem value="Informatique">Informatique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Téléphone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Adresse</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tarif horaire (FCFA)</label>
            <Input
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
          </Button>
            <Button type="submit">
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter
        </Button>
      </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function RemplacantPage() {
  const [substitutes, setSubstitutes] = useState(mockSubstitutes)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedSubstitute, setSelectedSubstitute] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  // Filtrage des remplaçants
  const filteredSubstitutes = substitutes.filter(substitute => {
    const matchesSearch = `${substitute.firstName} ${substitute.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === "all" || substitute.subjects.includes(selectedSubject)
    return matchesSearch && matchesSubject
  })

  const handleAddSubstitute = (newSubstitute) => {
    setSubstitutes([...substitutes, newSubstitute])
  }

  const handleShowDetails = (substitute) => {
    setSelectedSubstitute(substitute)
    setShowDetailsModal(true)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader
            title="Professeurs Remplaçants"
            description="Gestion des professeurs remplaçants disponibles"
          >
            <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
              Ajouter un remplaçant
              </Button>
          </PageHeader>

          {/* Filtres */}
            <Card>
              <CardHeader>
              <CardTitle>Rechercher et filtrer</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Rechercher par nom..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrer par matière" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les matières</SelectItem>
                        <SelectItem value="Mathématiques">Mathématiques</SelectItem>
                        <SelectItem value="Français">Français</SelectItem>
                        <SelectItem value="Sciences">Sciences</SelectItem>
                        <SelectItem value="Anglais">Anglais</SelectItem>
                    <SelectItem value="Histoire-Géographie">Histoire-Géographie</SelectItem>
                    <SelectItem value="Physique">Physique</SelectItem>
                    <SelectItem value="Chimie">Chimie</SelectItem>
                    <SelectItem value="Biologie">Biologie</SelectItem>
                    <SelectItem value="Éducation Physique">Éducation Physique</SelectItem>
                    <SelectItem value="Informatique">Informatique</SelectItem>
                      </SelectContent>
                    </Select>
              </div>
            </CardContent>
          </Card>

          {/* Liste des remplaçants */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubstitutes.map((substitute) => (
              <Card key={substitute.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{substitute.firstName} {substitute.lastName}</CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <div className="flex items-center text-yellow-600">
                          <Star className="h-3 w-3" />
                          <span className="text-sm ml-1">{substitute.rating}</span>
                        </div>
                        <Badge variant={substitute.status === "Disponible" ? "default" : "secondary"}>
                          {substitute.status}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
              </CardHeader>
                <CardContent className="space-y-4">
                  {/* Matières */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Matières
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {substitute.subjects.map(subject => (
                        <Badge key={subject} variant="outline" className="text-xs">
                          {subject}
                              </Badge>
                      ))}
                            </div>
                              </div>

                  {/* Contact */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{substitute.phone}</span>
                              </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span>{substitute.email}</span>
                              </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{substitute.address}</span>
                              </div>
                            </div>

                  {/* Tarif */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <span className="text-sm text-muted-foreground">Tarif horaire</span>
                      <div className="text-lg font-bold text-green-600">
                        {substitute.hourlyRate.toLocaleString()} FCFA
                              </div>
                          </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShowDetails(substitute)}
                    >
                              <Eye className="h-3 w-3 mr-1" />
                              Détails
                            </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>

          {filteredSubstitutes.length === 0 && (
          <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  Aucun remplaçant trouvé avec les critères sélectionnés.
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      </main>

      {/* Modals */}
      {selectedSubstitute && (
        <SubstituteDetailsModal
          substitute={selectedSubstitute}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      <AddSubstituteModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSubstitute}
      />
    </div>
  )
}
