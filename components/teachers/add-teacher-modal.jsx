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
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

const subjects = [
  "Mathématiques",
  "Français",
  "Sciences",
  "Histoire-Géographie",
  "Anglais",
  "Éducation Physique",
  "Éducation Civique",
  "Arts Plastiques",
  "Musique",
]

const classes = ["CP", "CE1", "CE2", "CM1", "CM2", "6ème", "5ème", "4ème", "3ème"]

export function AddTeacherModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: null,
    gender: "",
    phone: "",
    email: "",
    address: "",
    school: "École Primaire de Bamako",
    subjects: [],
    classes: [],
    qualification: "",
    experience: "",
    salary: "",
    hireDate: new Date().toISOString().split("T")[0],
    status: "Actif",
    photo: "/placeholder.svg?key=teacher",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.firstName && formData.lastName && formData.dateOfBirth && formData.subjects.length > 0) {
      onAdd({
        ...formData,
        dateOfBirth: format(formData.dateOfBirth, "yyyy-MM-dd"),
        salary: Number.parseInt(formData.salary) || 0,
      })
      setFormData({
        firstName: "",
        lastName: "",
        dateOfBirth: null,
        gender: "",
        phone: "",
        email: "",
        address: "",
        school: "École Primaire de Bamako",
        subjects: [],
        classes: [],
        qualification: "",
        experience: "",
        salary: "",
        hireDate: new Date().toISOString().split("T")[0],
        status: "Actif",
        photo: "/placeholder.svg?key=teacher2",
      })
      onClose()
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubjectChange = (subject, checked) => {
    if (checked) {
      setFormData((prev) => ({ ...prev, subjects: [...prev.subjects, subject] }))
    } else {
      setFormData((prev) => ({ ...prev, subjects: prev.subjects.filter((s) => s !== subject) }))
    }
  }

  const handleClassChange = (classe, checked) => {
    if (checked) {
      setFormData((prev) => ({ ...prev, classes: [...prev.classes, classe] }))
    } else {
      setFormData((prev) => ({ ...prev, classes: prev.classes.filter((c) => c !== classe) }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau professeur</DialogTitle>
          <DialogDescription>Remplissez les informations du professeur pour l'ajouter au système.</DialogDescription>
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
                  placeholder="Prénom du professeur"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+223 XX XX XX XX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@edumali.ml"
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
                rows={2}
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations professionnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>École</Label>
                <Input
                  value={formData.school}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={formData.qualification}
                  onChange={(e) => handleInputChange("qualification", e.target.value)}
                  placeholder="Ex: Licence en Mathématiques"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Expérience</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  placeholder="Ex: 5 ans"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salaire mensuel (FCFA)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleInputChange("salary", e.target.value)}
                  placeholder="150000"
                />
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
                    <SelectItem value="Congé">En congé</SelectItem>
                    <SelectItem value="Suspendu">Suspendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subjects */}
            <div className="space-y-2">
              <Label>Matières enseignées *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {subjects.map((subject) => (
                  <div key={subject} className="flex items-center space-x-2">
                    <Checkbox
                      id={subject}
                      checked={formData.subjects.includes(subject)}
                      onCheckedChange={(checked) => handleSubjectChange(subject, checked)}
                    />
                    <Label htmlFor={subject} className="text-sm">
                      {subject}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Classes */}
            <div className="space-y-2">
              <Label>Classes enseignées</Label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {classes.map((classe) => (
                  <div key={classe} className="flex items-center space-x-2">
                    <Checkbox
                      id={classe}
                      checked={formData.classes.includes(classe)}
                      onCheckedChange={(checked) => handleClassChange(classe, checked)}
                    />
                    <Label htmlFor={classe} className="text-sm">
                      {classe}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="bg-transparent">
              Annuler
            </Button>
            <Button type="submit">Ajouter le professeur</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
