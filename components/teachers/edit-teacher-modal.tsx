"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface Subject {
  id: string
  name: string
  code: string
  teacher_number: number
  teacher_name?: string
  hours_per_week: number
  coefficient: number
  color: string
  description: string
  status: string
}

interface Teacher {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  address: string
  hire_date: string
  salary: number
  status: "active" | "inactive" | "on_leave"
  photo: string
  user_id: string
  gender: "Masculin" | "Feminin"
  contrat: "horaire" | "mensuel"
  speciality: string[]
  speciality_names: string[]
  created: string
  updated: string
}

interface EditTeacherModalProps {
  isOpen: boolean
  onClose: () => void
  teacher: Teacher | null
  onEdit: (teacher: Partial<Teacher>) => Promise<void>
  subjects: Subject[]
}

export function EditTeacherModal({ isOpen, onClose, teacher, onEdit, subjects }: EditTeacherModalProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    hire_date: "",
    salary: 0,
    status: "active" as "active" | "inactive" | "on_leave",
    photo: "",
    user_id: "",
    gender: "Masculin" as const,
    contrat: "mensuel" as const,
    speciality: [] as string[]
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (teacher) {
      setFormData({
        first_name: teacher.first_name,
        last_name: teacher.last_name,
        email: teacher.email,
        phone: teacher.phone,
        address: teacher.address,
        hire_date: teacher.hire_date,
        salary: teacher.salary,
        status: teacher.status,
        photo: teacher.photo,
        user_id: teacher.user_id,
        gender: teacher.gender,
        contrat: teacher.contrat,
        speciality: teacher.speciality || []
      })
    }
  }, [teacher])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onEdit(formData)
      onClose()
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSpecialityChange = (subjectId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        speciality: [...prev.speciality, subjectId]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        speciality: prev.speciality.filter(id => id !== subjectId)
      }))
    }
  }

  if (!teacher) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le professeur</DialogTitle>
          <DialogDescription>
            Modifiez les informations du professeur.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">
                {formData.contrat === "horaire" ? "Salaire horaire (FCFA/heure) *" : "Salaire mensuel (FCFA) *"}
              </Label>
              <Input
                id="salary"
                type="number"
                min="0"
                value={formData.salary}
                onChange={(e) => setFormData(prev => ({ ...prev, salary: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut *</Label>
              <Select value={formData.status} onValueChange={(value: "active" | "inactive" | "on_leave") => 
                setFormData(prev => ({ ...prev, status: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="on_leave">En congé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Genre *</Label>
              <Select value={formData.gender} onValueChange={(value: "Masculin" | "Feminin") => 
                setFormData(prev => ({ ...prev, gender: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculin">Masculin</SelectItem>
                  <SelectItem value="Feminin">Féminin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contrat">Type de contrat *</Label>
              <Select value={formData.contrat} onValueChange={(value: "horaire" | "mensuel") => 
                setFormData(prev => ({ ...prev, contrat: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horaire">Horaire</SelectItem>
                  <SelectItem value="mensuel">Mensuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date d'embauche *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.hire_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.hire_date ? (
                    format(new Date(formData.hire_date), "PPP", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={new Date(formData.hire_date)}
                  onSelect={(date) => {
                    if (date) {
                      setFormData(prev => ({ 
                        ...prev, 
                        hire_date: date.toISOString().split("T")[0] 
                      }))
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Spécialités</Label>
            <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto border rounded-md p-3">
              {subjects.map((subject) => (
                <div key={subject.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`subject-${subject.id}`}
                    className="cursor-pointer border border-black"
                    checked={formData.speciality.includes(subject.id)}
                    onCheckedChange={(checked) => handleSpecialityChange(subject.id, checked as boolean)}
                  />
                  <Label
                    htmlFor={`subject-${subject.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {subject.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Modification en cours..." : "Modifier le professeur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}