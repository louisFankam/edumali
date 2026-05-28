"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function validateName(name, existingNames) {
  if (!name.trim()) return "Le nom est requis"
  if (!/^\d{4}-\d{4}$/.test(name)) return "Format invalide. Utilisez le format AAAA-AAAA (ex: 2025-2026)"
  const start = Number.parseInt(name.split("-")[0])
  const end = Number.parseInt(name.split("-")[1])
  if (end - start !== 1) return "L'écart entre les années doit être de 1 an (ex: 2025-2026)"
  if (existingNames.includes(name.trim())) return "Cette année scolaire existe déjà"
  return null
}

export function CreateSchoolYearModal({ isOpen, onClose, onCreate, existingNames = [] }) {
  const [formData, setFormData] = useState({
    name: "",
    startDate: null,
    endDate: null,
  })
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.startDate) {
      setError("Veuillez sélectionner une date de début")
      return
    }
    if (!formData.endDate) {
      setError("Veuillez sélectionner une date de fin")
      return
    }
    const validationError = validateName(formData.name, existingNames)
    if (validationError) {
      setError(validationError)
      return
    }
    onCreate({
      name: formData.name.trim(),
      startDate: formData.startDate.toISOString().split("T")[0],
      endDate: formData.endDate.toISOString().split("T")[0],
    })
    setFormData({ name: "", startDate: null, endDate: null })
    setError("")
    onClose()
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "name") setError("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle année scolaire</DialogTitle>
          <DialogDescription>Définissez les paramètres de la nouvelle année scolaire.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'année *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="2025-2026"
              className={error ? "border-red-500" : ""}
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Date de début *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate ? formData.startDate.toISOString().split("T")[0] : ""}
              onChange={(e) => {
                const val = e.target.value
                handleInputChange("startDate", val ? new Date(val + "T00:00:00") : null)
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Date de fin *</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate ? formData.endDate.toISOString().split("T")[0] : ""}
              onChange={(e) => {
                const val = e.target.value
                handleInputChange("endDate", val ? new Date(val + "T00:00:00") : null)
              }}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="bg-transparent">
              Annuler
            </Button>
            <Button type="submit">Créer l'année scolaire</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
