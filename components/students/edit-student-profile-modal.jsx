"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EditStudentProfileModal({ isOpen, onClose, student }) {
  const [formData, setFormData] = useState(student || {})

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNestedInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleSubmit = () => {
    console.log("Profil élève modifié:", formData)
    onClose()
  }

  if (!student) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le profil de {student.fullName}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="family">Famille</TabsTrigger>
            <TabsTrigger value="medical">Médical</TabsTrigger>
            <TabsTrigger value="academic">Académique</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName || ""}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName || ""}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date de naissance</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth || ""}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="placeOfBirth">Lieu de naissance</Label>
                    <Input
                      id="placeOfBirth"
                      value={formData.placeOfBirth || ""}
                      onChange={(e) => handleInputChange("placeOfBirth", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Sexe</Label>
                    <Select value={formData.gender || ""} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculin">Masculin</SelectItem>
                        <SelectItem value="Féminin">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="nationality">Nationalité</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality || ""}
                      onChange={(e) => handleInputChange("nationality", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="family" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations familiales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fatherName">Nom du père</Label>
                    <Input
                      id="fatherName"
                      value={formData.parentInfo?.fatherName || ""}
                      onChange={(e) => handleNestedInputChange("parentInfo", "fatherName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fatherPhone">Téléphone du père</Label>
                    <Input
                      id="fatherPhone"
                      value={formData.parentInfo?.fatherPhone || ""}
                      onChange={(e) => handleNestedInputChange("parentInfo", "fatherPhone", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="motherName">Nom de la mère</Label>
                    <Input
                      id="motherName"
                      value={formData.parentInfo?.motherName || ""}
                      onChange={(e) => handleNestedInputChange("parentInfo", "motherName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="motherPhone">Téléphone de la mère</Label>
                    <Input
                      id="motherPhone"
                      value={formData.parentInfo?.motherPhone || ""}
                      onChange={(e) => handleNestedInputChange("parentInfo", "motherPhone", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations médicales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bloodType">Groupe sanguin</Label>
                    <Select
                      value={formData.medicalInfo?.bloodType || ""}
                      onValueChange={(value) => handleNestedInputChange("medicalInfo", "bloodType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                      value={formData.medicalInfo?.doctorName || ""}
                      onChange={(e) => handleNestedInputChange("medicalInfo", "doctorName", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    value={formData.medicalInfo?.allergies || ""}
                    onChange={(e) => handleNestedInputChange("medicalInfo", "allergies", e.target.value)}
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
                    <Label htmlFor="class">Classe actuelle</Label>
                    <Input
                      id="class"
                      value={formData.class || ""}
                      onChange={(e) => handleInputChange("class", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="school">École</Label>
                    <Input
                      id="school"
                      value={formData.school || ""}
                      onChange={(e) => handleInputChange("school", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>Sauvegarder les modifications</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
