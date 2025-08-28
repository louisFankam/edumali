"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EditTeacherProfileModal({ isOpen, onClose, teacher }) {
  const [formData, setFormData] = useState(teacher || {})

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
    console.log("Profil enseignant modifié:", formData)
    onClose()
  }

  if (!teacher) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le profil de {teacher.fullName}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
            <TabsTrigger value="teaching">Enseignement</TabsTrigger>
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
                  <div>
                    <Label htmlFor="hireDate">Date d'embauche</Label>
                    <Input
                      id="hireDate"
                      type="date"
                      value={formData.hireDate || ""}
                      onChange={(e) => handleInputChange("hireDate", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations de contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={formData.contactInfo?.phone || ""}
                      onChange={(e) => handleNestedInputChange("contactInfo", "phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.contactInfo?.email || ""}
                      onChange={(e) => handleNestedInputChange("contactInfo", "email", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact">Contact d'urgence</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.contactInfo?.emergencyContact || ""}
                      onChange={(e) => handleNestedInputChange("contactInfo", "emergencyContact", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qualifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Qualifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="specialization">Spécialisation</Label>
                  <Input
                    id="specialization"
                    value={formData.teachingInfo?.specialization || ""}
                    onChange={(e) => handleNestedInputChange("teachingInfo", "specialization", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Expérience</Label>
                  <Input
                    id="experience"
                    value={formData.teachingInfo?.experience || ""}
                    onChange={(e) => handleNestedInputChange("teachingInfo", "experience", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teaching" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations d'enseignement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="teachingLoad">Charge horaire</Label>
                  <Input
                    id="teachingLoad"
                    value={formData.teachingInfo?.teachingLoad || ""}
                    onChange={(e) => handleNestedInputChange("teachingInfo", "teachingLoad", e.target.value)}
                  />
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
