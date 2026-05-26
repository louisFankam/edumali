"use client"

import { useState, useEffect } from "react"
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

export function EditSchoolYearModal({ isOpen, onClose, schoolYear, onUpdate }) {
  const [formData, setFormData] = useState({
    name: "",
    startDate: null,
    endDate: null,
  })

  useEffect(() => {
    if (schoolYear) {
      setFormData({
        name: schoolYear.name || "",
        startDate: schoolYear.startDate ? new Date(schoolYear.startDate) : null,
        endDate: schoolYear.endDate ? new Date(schoolYear.endDate) : null,
      })
    }
  }, [schoolYear])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name && formData.startDate && formData.endDate) {
      onUpdate({
        name: formData.name,
        startDate: format(formData.startDate, "yyyy-MM-dd"),
        endDate: format(formData.endDate, "yyyy-MM-dd"),
      })
      onClose()
    }
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="2024-2025"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Date de début</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? format(formData.startDate, "PPP", { locale: fr }) : "Choisir une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.startDate}
                  onSelect={(date) => setFormData({ ...formData, startDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Date de fin</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.endDate ? format(formData.endDate, "PPP", { locale: fr }) : "Choisir une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.endDate}
                  onSelect={(date) => setFormData({ ...formData, endDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
