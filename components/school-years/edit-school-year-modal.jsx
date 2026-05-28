"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function validateName(name, existingNames, currentName) {
  if (!name.trim()) return "Le nom est requis"
  if (!/^\d{4}-\d{4}$/.test(name)) return "Format invalide. Utilisez le format AAAA-AAAA (ex: 2025-2026)"
  const start = Number.parseInt(name.split("-")[0])
  const end = Number.parseInt(name.split("-")[1])
  if (end - start !== 1) return "L'écart entre les années doit être de 1 an (ex: 2025-2026)"
  const isDuplicate = currentName
    ? existingNames.includes(name.trim()) && name.trim() !== currentName
    : existingNames.includes(name.trim())
  if (isDuplicate) return "Cette année scolaire existe déjà"
  return null
}

export function EditSchoolYearModal({ isOpen, onClose, schoolYear, onUpdate, existingNames = [] }) {
  const [formData, setFormData] = useState({
    name: "",
    startDate: null,
    endDate: null,
  })
  const [error, setError] = useState("")

  useEffect(() => {
    if (schoolYear) {
      setFormData({
        name: schoolYear.name || "",
        startDate: schoolYear.startDate ? new Date(schoolYear.startDate) : null,
        endDate: schoolYear.endDate ? new Date(schoolYear.endDate) : null,
      })
      setError("")
    }
  }, [schoolYear])

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
    const validationError = validateName(formData.name, existingNames, schoolYear?.name)
    if (validationError) {
      setError(validationError)
      return
    }
    onUpdate({
      name: formData.name.trim(),
      startDate: formData.startDate.toISOString().split("T")[0],
      endDate: formData.endDate.toISOString().split("T")[0],
    })
    onClose()
  }

  if (!schoolYear) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier l'année scolaire</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'année scolaire {schoolYear.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Année scolaire</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                setError("")
              }}
              placeholder="2024-2025"
              className={error ? "border-red-500" : ""}
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="editStartDate">Date de début</Label>
            <Input
              id="editStartDate"
              type="date"
              value={formData.startDate ? formData.startDate.toISOString().split("T")[0] : ""}
              onChange={(e) => {
                const val = e.target.value
                setFormData({ ...formData, startDate: val ? new Date(val + "T00:00:00") : null })
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editEndDate">Date de fin</Label>
            <Input
              id="editEndDate"
              type="date"
              value={formData.endDate ? formData.endDate.toISOString().split("T")[0] : ""}
              onChange={(e) => {
                const val = e.target.value
                setFormData({ ...formData, endDate: val ? new Date(val + "T00:00:00") : null })
              }}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
