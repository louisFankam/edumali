"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Plus,
  Search,
  Eye,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  DollarSign,
  Trash2,
  Edit,
  Save,
  X
} from "lucide-react"
import { useSubstitutes } from "@/hooks/use-substitutes"
import { useSubjects } from "@/hooks/use-subjects"

// Modal pour voir les détails d'un remplaçant
function SubstituteDetailsModal({ substitute, isOpen, onClose, onEdit, subjects }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: substitute.first_name,
    last_name: substitute.last_name,
    subject_id: substitute.subject_id || [],
    phone: substitute.phone,
    email: substitute.email,
    address: substitute.address,
    hourly_rate: substitute.hourly_rate,
    status: substitute.status
  })

  const handleSave = async () => {
    try {
      await onEdit(substitute.id, formData)
      setIsEditing(false)
      onClose()
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails du remplaçant</DialogTitle>
          <DialogDescription>
            Informations sur {substitute.first_name} {substitute.last_name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {isEditing ? (
            // Mode édition
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Prénom</label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nom</label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Matières</label>
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                  {subjects.map(subject => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`subject-${subject.id}`}
                        className="cursor-pointer border border-black"
                        checked={formData.subject_id.includes(subject.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData, 
                              subject_id: [...formData.subject_id, subject.id]
                            })
                          } else {
                            setFormData({
                              ...formData, 
                              subject_id: formData.subject_id.filter(id => id !== subject.id)
                            })
                          }
                        }}
                      />
                      <Label htmlFor={`subject-${subject.id}`} className="text-sm">
                        {subject.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Téléphone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Adresse</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tarif horaire (FCFA)</label>
                  <Input
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({...formData, hourly_rate: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Statut</label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="busy">En remplacement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : (
            // Mode affichage
            <>
              {/* Informations de base */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium mb-2">Informations personnelles</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Nom :</strong> {substitute.first_name} {substitute.last_name}</p>
                    <p><strong>Statut :</strong> 
                      <Badge variant={substitute.status === "available" ? "default" : "secondary"} className="ml-2">
                        {substitute.status === "available" ? "Disponible" : "En remplacement"}
                      </Badge>
                    </p>
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
                      {substitute.subject_names.map(subject => (
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
                      {substitute.hourly_rate.toLocaleString()} FCFA
                    </div>
                    <p className="text-sm text-muted-foreground">par heure</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsEditing(false)
              onClose()
            }}>
              {isEditing ? <X className="h-4 w-4 mr-2" /> : null}
              {isEditing ? "Annuler" : "Fermer"}
            </Button>
            {isEditing ? (
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Modal pour ajouter un nouveau remplaçant
function AddSubstituteModal({ isOpen, onClose, onAdd, subjects }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    subject_id: [],
    phone: "",
    email: "",
    address: "",
    hourly_rate: "",
    status: "available"
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await onAdd({
        ...formData,
        hourly_rate: parseInt(formData.hourly_rate),
        subject_id: formData.subject_id
      })
      setFormData({
        first_name: "",
        last_name: "",
        subject_id: [],
        phone: "",
        email: "",
        address: "",
        hourly_rate: "",
        status: "available"
      })
      onClose()
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error)
    }
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
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nom</label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Matières enseignées</label>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
              {subjects.map(subject => (
                <div key={subject.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`add-subject-${subject.id}`}
                    className="cursor-pointer border border-black"
                    checked={formData.subject_id.includes(subject.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData, 
                          subject_id: [...formData.subject_id, subject.id]
                        })
                      } else {
                        setFormData({
                          ...formData, 
                          subject_id: formData.subject_id.filter(id => id !== subject.id)
                        })
                      }
                    }}
                  />
                  <Label htmlFor={`add-subject-${subject.id}`} className="text-sm">
                    {subject.name}
                  </Label>
                </div>
              ))}
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Tarif horaire (FCFA)</label>
              <Input
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Statut</label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="busy">En remplacement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Ajouter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function RemplacantPage() {
  const { substitutes, fetchSubstitutes, createSubstitute, updateSubstitute, deleteSubstitute, getStatusDisplay } = useSubstitutes()
  const { subjects, fetchSubjects } = useSubjects()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedSubstitute, setSelectedSubstitute] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchSubstitutes()
    fetchSubjects()
  }, [fetchSubstitutes, fetchSubjects])

  // Filtrage des remplaçants
  const filteredSubstitutes = substitutes.filter(substitute => {
    const matchesSearch = `${substitute.first_name} ${substitute.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === "all" || substitute.subject_id.includes(selectedSubject)
    return matchesSearch && matchesSubject
  })

  const handleAddSubstitute = async (newSubstitute) => {
    await createSubstitute(newSubstitute)
  }

  const handleEditSubstitute = async (id, data) => {
    await updateSubstitute(id, data)
  }

  const handleDeleteSubstitute = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce remplaçant ?')) {
      await deleteSubstitute(id)
    }
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
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
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
                    <CardTitle className="text-lg">{substitute.first_name} {substitute.last_name}</CardTitle>
                    <Badge variant={substitute.status === "available" ? "default" : "secondary"}>
                      {getStatusDisplay(substitute.status)}
                    </Badge>
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
                      {substitute.subject_names.map(subject => (
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
                        {substitute.hourly_rate.toLocaleString()} FCFA
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShowDetails(substitute)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Détails
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteSubstitute(substitute.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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
          onEdit={handleEditSubstitute}
          subjects={subjects}
        />
      )}

      <AddSubstituteModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSubstitute}
        subjects={subjects}
      />
    </div>
  )
}