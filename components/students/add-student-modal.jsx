"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

export function AddStudentModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: null,
    gender: "",
    class: "",
    school: "École Primaire de Bamako",
    parentName: "",
    parentPhone: "",
    address: "",
    enrollmentDate: new Date().toISOString().split("T")[0],
    status: "Actif",
    photo: "/diverse-students-studying.png",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.firstName && formData.lastName && formData.dateOfBirth) {
      onAdd({
        ...formData,
        dateOfBirth: format(formData.dateOfBirth, "yyyy-MM-dd"),
      })
      setFormData({
        firstName: "",
        lastName: "",
        dateOfBirth: null,
        gender: "",
        class: "",
        school: "École Primaire de Bamako",
        parentName: "",
        parentPhone: "",
        address: "",
        enrollmentDate: new Date().toISOString().split("T")[0],
        status: "Actif",
        photo: "/diverse-students-studying.png",
      })
      onClose()
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel élève</DialogTitle>
          <DialogDescription>Remplissez les informations de l'élève pour l'inscrire dans le système.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Prénom de l'élève"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom de famille *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Nom de famille"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de naissance *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-transparent",
                        !formData.dateOfBirth && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateOfBirth ? (
                        format(formData.dateOfBirth, "dd MMMM yyyy", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dateOfBirth}
                      onSelect={(date) => handleInputChange("dateOfBirth", date)}
                      required
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Genre</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculin">Masculin</SelectItem>
                    <SelectItem value="Féminin">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* School Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations scolaires</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Classe</Label>
                <Select value={formData.class} onValueChange={(value) => handleInputChange("class", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la classe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CP">CP</SelectItem>
                    <SelectItem value="CE1">CE1</SelectItem>
                    <SelectItem value="CE2">CE2</SelectItem>
                    <SelectItem value="CM1">CM1</SelectItem>
                    <SelectItem value="CM2">CM2</SelectItem>
                    <SelectItem value="6ème">6ème</SelectItem>
                    <SelectItem value="5ème">5ème</SelectItem>
                    <SelectItem value="4ème">4ème</SelectItem>
                    <SelectItem value="3ème">3ème</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>École</Label>
                <Input
                  value={formData.school}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="Inactif">Inactif</SelectItem>
                  <SelectItem value="Suspendu">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Parent Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations du parent/tuteur</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Nom du parent/tuteur</Label>
                <Input
                  id="parentName"
                  value={formData.parentName}
                  onChange={(e) => handleInputChange("parentName", e.target.value)}
                  placeholder="Nom complet du parent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone">Téléphone</Label>
                <Input
                  id="parentPhone"
                  value={formData.parentPhone}
                  onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                  placeholder="+223 XX XX XX XX"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Adresse complète de résidence"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="bg-transparent">
              Annuler
            </Button>
            <Button type="submit">Ajouter l'élève</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
