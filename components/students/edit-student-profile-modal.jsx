"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function EditStudentProfileModal({ isOpen, onClose, student, onEdit }) {
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        birthDate: student.birthDate || "",
        gender: student.gender || "",
        nationality: student.nationality || "",
        parentName: student.parentName || "",
        parentPhone: student.parentPhone || "",
        address: student.address || "",
      })
    }
  }, [student])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!student?.id) return
    setSaving(true)
    try {
      const res = await window.fetch(`/api/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.message || "Erreur lors de la modification")
      toast.success("Profil mis à jour")
      if (onEdit) onEdit()
      onClose()
    } catch (err) {
      toast.error(err.message || "Erreur lors de la modification")
    } finally {
      setSaving(false)
    }
  }

  if (!student) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le profil de {student.fullName || `${student.firstName} ${student.lastName}`}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" value={formData.firstName || ""} onChange={e => handleChange("firstName", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" value={formData.lastName || ""} onChange={e => handleChange("lastName", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="birthDate">Date de naissance</Label>
                  <Input id="birthDate" type="date" value={formData.birthDate || ""} onChange={e => handleChange("birthDate", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="gender">Sexe</Label>
                  <Select value={formData.gender || ""} onValueChange={value => handleChange("gender", value)}>
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
                  <Input id="nationality" value={formData.nationality || ""} onChange={e => handleChange("nationality", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parentName">Nom du parent / tuteur</Label>
                  <Input id="parentName" value={formData.parentName || ""} onChange={e => handleChange("parentName", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="parentPhone">Téléphone</Label>
                  <Input id="parentPhone" value={formData.parentPhone || ""} onChange={e => handleChange("parentPhone", e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input id="address" value={formData.address || ""} onChange={e => handleChange("address", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enregistrement...</> : "Sauvegarder les modifications"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
