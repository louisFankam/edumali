"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

export function EditSchoolYearModal({ isOpen, onClose, schoolYear, onUpdate }) {
  const [formData, setFormData] = useState({
    year: "",
    start_date: null,
    end_date: null,
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

  useEffect(() => {
    if (schoolYear) {
      setFormData({
        year: schoolYear.year || "",
        start_date: schoolYear.start_date ? new Date(schoolYear.start_date) : null,
        end_date: schoolYear.end_date ? new Date(schoolYear.end_date) : null,
        status: schoolYear.status || "upcoming",
        periods: schoolYear.periods || [
          { name: "1er Trimestre", startDate: null, endDate: null },
          { name: "2ème Trimestre", startDate: null, endDate: null },
          { name: "3ème Trimestre", startDate: null, endDate: null },
        ],
        holidays: schoolYear.holidays || [
          { name: "Vacances de Noël", startDate: null, endDate: null },
          { name: "Vacances de Pâques", startDate: null, endDate: null },
        ],
      })
    }
  }, [schoolYear])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.year && formData.start_date && formData.end_date) {
      onUpdate({
        year: formData.year,
        start_date: format(formData.start_date, "yyyy-MM-dd"),
        end_date: format(formData.end_date, "yyyy-MM-dd"),
        status: formData.status,
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
      onClose()
    }
  }

  const updatePeriod = (index, field, value) => {
    const newPeriods = [...formData.periods]
    newPeriods[index] = { ...newPeriods[index], [field]: value }
    setFormData({ ...formData, periods: newPeriods })
  }

  const updateHoliday = (index, field, value) => {
    const newHolidays = [...formData.holidays]
    newHolidays[index] = { ...newHolidays[index], [field]: value }
    setFormData({ ...formData, holidays: newHolidays })
  }

  const addPeriod = () => {
    setFormData({
      ...formData,
      periods: [...formData.periods, { name: "", startDate: null, endDate: null }]
    })
  }

  const addHoliday = () => {
    setFormData({
      ...formData,
      holidays: [...formData.holidays, { name: "", startDate: null, endDate: null }]
    })
  }

  const removePeriod = (index) => {
    const newPeriods = formData.periods.filter((_, i) => i !== index)
    setFormData({ ...formData, periods: newPeriods })
  }

  const removeHoliday = (index) => {
    const newHolidays = formData.holidays.filter((_, i) => i !== index)
    setFormData({ ...formData, holidays: newHolidays })
  }

  if (!schoolYear) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'année scolaire</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'année scolaire {schoolYear.year}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Année scolaire</Label>
              <Input
                id="year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2024-2025"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">À venir</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archivée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "PPP", { locale: fr }) : "Choisir une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => setFormData({ ...formData, start_date: date })}
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
                      !formData.end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, "PPP", { locale: fr }) : "Choisir une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => setFormData({ ...formData, end_date: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Périodes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Périodes</h3>
              <Button type="button" variant="outline" size="sm" onClick={addPeriod}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une période
              </Button>
            </div>
            <div className="space-y-4">
              {formData.periods.map((period, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 items-end">
                  <Input
                    value={period.name}
                    onChange={(e) => updatePeriod(index, "name", e.target.value)}
                    placeholder="Nom de la période"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !period.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {period.startDate ? format(period.startDate, "PP", { locale: fr }) : "Début"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={period.startDate}
                        onSelect={(date) => updatePeriod(index, "startDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !period.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {period.endDate ? format(period.endDate, "PP", { locale: fr }) : "Fin"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={period.endDate}
                        onSelect={(date) => updatePeriod(index, "endDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {formData.periods.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePeriod(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Vacances */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Vacances</h3>
              <Button type="button" variant="outline" size="sm" onClick={addHoliday}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter des vacances
              </Button>
            </div>
            <div className="space-y-4">
              {formData.holidays.map((holiday, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 items-end">
                  <Input
                    value={holiday.name}
                    onChange={(e) => updateHoliday(index, "name", e.target.value)}
                    placeholder="Nom des vacances"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !holiday.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {holiday.startDate ? format(holiday.startDate, "PP", { locale: fr }) : "Début"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={holiday.startDate}
                        onSelect={(date) => updateHoliday(index, "startDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !holiday.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {holiday.endDate ? format(holiday.endDate, "PP", { locale: fr }) : "Fin"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={holiday.endDate}
                        onSelect={(date) => updateHoliday(index, "endDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {formData.holidays.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeHoliday(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
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