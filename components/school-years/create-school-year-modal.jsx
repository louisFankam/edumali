"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

export function CreateSchoolYearModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: "",
    startDate: null,
    endDate: null,
    status: "upcoming",
    periods: [
      { name: "1er Trimestre", startDate: null, endDate: null },
      { name: "2ème Trimestre", startDate: null, endDate: null },
      { name: "3ème Trimestre", startDate: null, endDate: null },
    ],
    holidays: [
      { name: "Vacances de Noël", startDate: null, endDate: null },
      { name: "Vacances de Pâques", startDate: null, endDate: null },
    ],
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name && formData.startDate && formData.endDate) {
      onCreate({
        ...formData,
        startDate: format(formData.startDate, "yyyy-MM-dd"),
        endDate: format(formData.endDate, "yyyy-MM-dd"),
        periods: formData.periods.map((period) => ({
          ...period,
          startDate: period.startDate ? format(period.startDate, "yyyy-MM-dd") : null,
          endDate: period.endDate ? format(period.endDate, "yyyy-MM-dd") : null,
        })),
        holidays: formData.holidays.map((holiday) => ({
          ...holiday,
          startDate: holiday.startDate ? format(holiday.startDate, "yyyy-MM-dd") : null,
          endDate: holiday.endDate ? format(holiday.endDate, "yyyy-MM-dd") : null,
        })),
      })
      // Reset form
      setFormData({
        name: "",
        startDate: null,
        endDate: null,
        status: "upcoming",
        periods: [
          { name: "1er Trimestre", startDate: null, endDate: null },
          { name: "2ème Trimestre", startDate: null, endDate: null },
          { name: "3ème Trimestre", startDate: null, endDate: null },
        ],
        holidays: [
          { name: "Vacances de Noël", startDate: null, endDate: null },
          { name: "Vacances de Pâques", startDate: null, endDate: null },
        ],
      })
      onClose()
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePeriodChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      periods: prev.periods.map((period, i) => (i === index ? { ...period, [field]: value } : period)),
    }))
  }

  const handleHolidayChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      holidays: prev.holidays.map((holiday, i) => (i === index ? { ...holiday, [field]: value } : holiday)),
    }))
  }

  const addPeriod = () => {
    setFormData((prev) => ({
      ...prev,
      periods: [...prev.periods, { name: "", startDate: null, endDate: null }],
    }))
  }

  const removePeriod = (index) => {
    setFormData((prev) => ({
      ...prev,
      periods: prev.periods.filter((_, i) => i !== index),
    }))
  }

  const addHoliday = () => {
    setFormData((prev) => ({
      ...prev,
      holidays: [...prev.holidays, { name: "", startDate: null, endDate: null }],
    }))
  }

  const removeHoliday = (index) => {
    setFormData((prev) => ({
      ...prev,
      holidays: prev.holidays.filter((_, i) => i !== index),
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle année scolaire</DialogTitle>
          <DialogDescription>Définissez les paramètres de la nouvelle année scolaire.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations générales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
          </div>

          {/* Periods */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Trimestres/Semestres</h3>
              <Button type="button" variant="outline" size="sm" onClick={addPeriod} className="bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter période
              </Button>
            </div>
            <div className="space-y-4">
              {formData.periods.map((period, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Nom de la période</Label>
                    <Input
                      value={period.name}
                      onChange={(e) => handlePeriodChange(index, "name", e.target.value)}
                      placeholder="1er Trimestre"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de début</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-transparent",
                            !period.startDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {period.startDate ? format(period.startDate, "dd MMM", { locale: fr }) : <span>Date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={period.startDate}
                          onSelect={(date) => handlePeriodChange(index, "startDate", date)}
                          initialFocus
                          locale={fr}
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
                            "w-full justify-start text-left font-normal bg-transparent",
                            !period.endDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {period.endDate ? format(period.endDate, "dd MMM", { locale: fr }) : <span>Date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={period.endDate}
                          onSelect={(date) => handlePeriodChange(index, "endDate", date)}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePeriod(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Holidays */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Vacances</h3>
              <Button type="button" variant="outline" size="sm" onClick={addHoliday} className="bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter vacances
              </Button>
            </div>
            <div className="space-y-4">
              {formData.holidays.map((holiday, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Nom des vacances</Label>
                    <Input
                      value={holiday.name}
                      onChange={(e) => handleHolidayChange(index, "name", e.target.value)}
                      placeholder="Vacances de Noël"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de début</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-transparent",
                            !holiday.startDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {holiday.startDate ? format(holiday.startDate, "dd MMM", { locale: fr }) : <span>Date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={holiday.startDate}
                          onSelect={(date) => handleHolidayChange(index, "startDate", date)}
                          initialFocus
                          locale={fr}
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
                            "w-full justify-start text-left font-normal bg-transparent",
                            !holiday.endDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {holiday.endDate ? format(holiday.endDate, "dd MMM", { locale: fr }) : <span>Date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={holiday.endDate}
                          onSelect={(date) => handleHolidayChange(index, "endDate", date)}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHoliday(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
