"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, FileText, User, Users, Heart } from "lucide-react"

export function NewRegistrationModal({ open, onOpenChange }) {
  const [currentTab, setCurrentTab] = useState("student")
  const [formData, setFormData] = useState({
    // Student info
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    placeOfBirth: "",
    gender: "",
    nationality: "Malienne",
    religion: "",
    previousSchool: "",
    previousClass: "",

    // Parent/Guardian info
    parentFirstName: "",
    parentLastName: "",
    parentRelation: "",
    parentPhone: "",
    parentEmail: "",
    parentProfession: "",
    parentAddress: "",

    // Emergency contact
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",

    // Medical info
    bloodType: "",
    allergies: "",
    medicalConditions: "",
    medications: "",
    doctorName: "",
    doctorPhone: "",

    // Academic info
    desiredClass: "",
    desiredSchool: "",
    subjects: [],

    // Documents
    documents: [],
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    console.log("Nouvelle inscription:", formData)
    onOpenChange(false)
    // Reset form
    setFormData({})
  }

  const requiredDocuments = [
    { id: "birth_certificate", label: "Acte de naissance", required: true },
    { id: "medical_certificate", label: "Certificat médical", required: true },
    { id: "photo", label: "Photo d'identité", required: true },
    { id: "previous_report", label: "Bulletin de l'année précédente", required: false },
    { id: "vaccination_card", label: "Carnet de vaccination", required: false },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Nouvelle Inscription</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="student">Élève</TabsTrigger>
            <TabsTrigger value="parent">Parent/Tuteur</TabsTrigger>
            <TabsTrigger value="medical">Médical</TabsTrigger>
            <TabsTrigger value="academic">Académique</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Informations de l'élève</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Prénom de l'élève"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Nom de famille"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date de naissance *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="placeOfBirth">Lieu de naissance *</Label>
                    <Input
                      id="placeOfBirth"
                      value={formData.placeOfBirth}
                      onChange={(e) => handleInputChange("placeOfBirth", e.target.value)}
                      placeholder="Ville, Région"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Sexe *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculin</SelectItem>
                        <SelectItem value="F">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="nationality">Nationalité</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => handleInputChange("nationality", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="religion">Religion</Label>
                    <Select value={formData.religion} onValueChange={(value) => handleInputChange("religion", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Islam">Islam</SelectItem>
                        <SelectItem value="Christianisme">Christianisme</SelectItem>
                        <SelectItem value="Animisme">Animisme</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="previousSchool">École précédente</Label>
                    <Input
                      id="previousSchool"
                      value={formData.previousSchool}
                      onChange={(e) => handleInputChange("previousSchool", e.target.value)}
                      placeholder="Nom de l'école précédente"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Informations du parent/tuteur</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parentFirstName">Prénom du parent *</Label>
                    <Input
                      id="parentFirstName"
                      value={formData.parentFirstName}
                      onChange={(e) => handleInputChange("parentFirstName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentLastName">Nom du parent *</Label>
                    <Input
                      id="parentLastName"
                      value={formData.parentLastName}
                      onChange={(e) => handleInputChange("parentLastName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentRelation">Relation avec l'élève *</Label>
                    <Select
                      value={formData.parentRelation}
                      onValueChange={(value) => handleInputChange("parentRelation", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Père">Père</SelectItem>
                        <SelectItem value="Mère">Mère</SelectItem>
                        <SelectItem value="Tuteur">Tuteur</SelectItem>
                        <SelectItem value="Grand-parent">Grand-parent</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="parentPhone">Téléphone *</Label>
                    <Input
                      id="parentPhone"
                      value={formData.parentPhone}
                      onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                      placeholder="+223 XX XX XX XX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentEmail">Email</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentProfession">Profession</Label>
                    <Input
                      id="parentProfession"
                      value={formData.parentProfession}
                      onChange={(e) => handleInputChange("parentProfession", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="parentAddress">Adresse complète *</Label>
                  <Textarea
                    id="parentAddress"
                    value={formData.parentAddress}
                    onChange={(e) => handleInputChange("parentAddress", e.target.value)}
                    placeholder="Adresse complète du domicile"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact d'urgence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="emergencyName">Nom complet</Label>
                    <Input
                      id="emergencyName"
                      value={formData.emergencyName}
                      onChange={(e) => handleInputChange("emergencyName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Téléphone</Label>
                    <Input
                      id="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyRelation">Relation</Label>
                    <Input
                      id="emergencyRelation"
                      value={formData.emergencyRelation}
                      onChange={(e) => handleInputChange("emergencyRelation", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>Informations médicales</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bloodType">Groupe sanguin</Label>
                    <Select value={formData.bloodType} onValueChange={(value) => handleInputChange("bloodType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="doctorName">Médecin traitant</Label>
                    <Input
                      id="doctorName"
                      value={formData.doctorName}
                      onChange={(e) => handleInputChange("doctorName", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="allergies">Allergies connues</Label>
                  <Textarea
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange("allergies", e.target.value)}
                    placeholder="Décrivez les allergies de l'élève"
                  />
                </div>
                <div>
                  <Label htmlFor="medicalConditions">Conditions médicales</Label>
                  <Textarea
                    id="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                    placeholder="Conditions médicales particulières"
                  />
                </div>
                <div>
                  <Label htmlFor="medications">Médicaments</Label>
                  <Textarea
                    id="medications"
                    value={formData.medications}
                    onChange={(e) => handleInputChange("medications", e.target.value)}
                    placeholder="Médicaments pris régulièrement"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations académiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="desiredSchool">École souhaitée *</Label>
                    <Select
                      value={formData.desiredSchool}
                      onValueChange={(value) => handleInputChange("desiredSchool", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une école" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lycee-askia">Lycée Askia Mohamed</SelectItem>
                        <SelectItem value="college-soundiata">Collège Soundiata</SelectItem>
                        <SelectItem value="ecole-primaire-bamako">École Primaire de Bamako</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="desiredClass">Classe souhaitée *</Label>
                    <Select
                      value={formData.desiredClass}
                      onValueChange={(value) => handleInputChange("desiredClass", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une classe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6eme">6ème</SelectItem>
                        <SelectItem value="5eme">5ème</SelectItem>
                        <SelectItem value="4eme">4ème</SelectItem>
                        <SelectItem value="3eme">3ème</SelectItem>
                        <SelectItem value="2nde">2nde</SelectItem>
                        <SelectItem value="1ere">1ère</SelectItem>
                        <SelectItem value="terminale">Terminale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Documents requis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {requiredDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox id={doc.id} />
                      <div>
                        <Label htmlFor={doc.id} className="font-medium">
                          {doc.label}
                          {doc.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => console.log("Brouillon sauvegardé")}>
              Sauvegarder brouillon
            </Button>
            <Button onClick={handleSubmit}>Soumettre inscription</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
