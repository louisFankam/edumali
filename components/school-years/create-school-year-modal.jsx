"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

export function CreateSchoolYearModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: "",
    startDate: null,
    endDate: null,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name && formData.startDate && formData.endDate) {
      onCreate({
        name: formData.name,
        startDate: format(formData.startDate, "yyyy-MM-dd"),
        endDate: format(formData.endDate, "yyyy-MM-dd"),
      })
      setFormData({ name: "", startDate: null, endDate: null })
      onClose()
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Date de début *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-transparent",
                    !formData.startDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? (
                    format(formData.startDate, "dd MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Sélectionner</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.startDate}
                  onSelect={(date) => handleInputChange("startDate", date)}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Date de fin *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-transparent",
                    !formData.endDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.endDate ? (
                    format(formData.endDate, "dd MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Sélectionner</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.endDate}
                  onSelect={(date) => handleInputChange("endDate", date)}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
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
