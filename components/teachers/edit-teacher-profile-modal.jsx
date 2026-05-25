"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function EditTeacherProfileModal({ isOpen, onClose, teacher, onEdit }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    gender: "Masculin",
    hire_date: "",
    salary: 0,
    contrat: "mensuel",
    status: "active",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (teacher) {
      setFormData({
        first_name: teacher.first_name || "",
        last_name: teacher.last_name || "",
        email: teacher.email || "",
        phone: teacher.phone || "",
        address: teacher.address || "",
        gender: teacher.gender || "Masculin",
        hire_date: teacher.hire_date || "",
        salary: teacher.salary || 0,
        contrat: teacher.contrat || "mensuel",
        status: teacher.status || "active",
      })
    }
  }, [teacher])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!onEdit) return
    setIsSubmitting(true)
    try {
      await onEdit(formData)
      onClose()
    } catch {
      // error handled by caller
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!teacher) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier le profil de {teacher.first_name} {teacher.last_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Prénom</Label>
              <Input id="first_name" value={formData.first_name} onChange={e => handleChange("first_name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="last_name">Nom</Label>
              <Input id="last_name" value={formData.last_name} onChange={e => handleChange("last_name", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={e => handleChange("email", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" value={formData.phone} onChange={e => handleChange("phone", e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" value={formData.address} onChange={e => handleChange("address", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">Sexe</Label>
              <Select value={formData.gender} onValueChange={v => handleChange("gender", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculin">Masculin</SelectItem>
                  <SelectItem value="Féminin">Féminin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="contrat">Contrat</Label>
              <Select value={formData.contrat} onValueChange={v => handleChange("contrat", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensuel">Mensuel</SelectItem>
                  <SelectItem value="horaire">Horaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary">{formData.contrat === "horaire" ? "Taux horaire (FCFA)" : "Salaire mensuel (FCFA)"}</Label>
              <Input id="salary" type="number" min="0" value={formData.salary} onChange={e => handleChange("salary", Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={v => handleChange("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="on_leave">En congé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="hire_date">Date d'embauche</Label>
            <Input id="hire_date" type="date" value={formData.hire_date} onChange={e => handleChange("hire_date", e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
