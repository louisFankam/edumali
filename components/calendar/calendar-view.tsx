"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

const EVENT_COLORS: Record<string, string> = {
  holiday: "#ef4444",
  event: "#3b82f6",
  meeting: "#22c55e",
  exam: "#f97316",
  deadline: "#a855f7",
}

const EVENT_LABELS: Record<string, string> = {
  holiday: "Vacances",
  event: "Événement",
  meeting: "Réunion",
  exam: "Examen",
  deadline: "Date limite",
}

interface CalendarEvent {
  id: string
  title: string
  description: string | null
  type: string
  startDate: string
  endDate: string | null
  startTime: string | null
  endTime: string | null
  allDay: boolean
  color: string | null
}

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDay, setSelectedDay] = useState<Date>(new Date())
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [formData, setFormData] = useState({
    title: "", description: "", type: "event",
    startDate: "", endDate: "", startTime: "", endTime: "",
  })

  const loadEvents = useCallback(async (from: string, to: string) => {
    try {
      const res = await fetch(`/api/calendar?from=${from}&to=${to}`)
      const json = await res.json()
      if (json.ok) setEvents(json.data as CalendarEvent[])
    } catch {
      toast.error("Erreur de chargement")
    }
  }, [])

  const handleDatesSet = useCallback((arg: { start: Date; end: Date }) => {
    const from = arg.start.toISOString().split("T")[0]
    const to = arg.end.toISOString().split("T")[0]
    loadEvents(from, to)
  }, [loadEvents])

  const fcEvents = events.map(ev => ({
    id: ev.id,
    title: ev.title,
    start: ev.startTime ? `${ev.startDate}T${ev.startTime}` : ev.startDate,
    end: ev.endDate ? (ev.endTime ? `${ev.endDate}T${ev.endTime}` : ev.endDate) : undefined,
    allDay: ev.allDay,
    backgroundColor: ev.color ?? EVENT_COLORS[ev.type] ?? "#3b82f6",
    borderColor: ev.color ?? EVENT_COLORS[ev.type] ?? "#3b82f6",
    textColor: "#fff",
    extendedProps: { ...ev },
  }))

  const todayEvents = useMemo(() => {
    const ds = format(selectedDay, "yyyy-MM-dd")
    return events.filter(ev => {
      if (!ev.endDate || ev.endDate === ev.startDate) return ev.startDate === ds
      return ds >= ev.startDate && ds <= ev.endDate
    })
  }, [selectedDay, events])

  const openCreate = (dateStr: string) => {
    setSelectedEvent(null)
    setFormData({ title: "", description: "", type: "event", startDate: dateStr, endDate: "", startTime: "", endTime: "" })
    setModalMode("create")
  }

  const openEdit = (ev: CalendarEvent) => {
    setSelectedEvent(ev)
    setFormData({
      title: ev.title, description: ev.description ?? "", type: ev.type,
      startDate: ev.startDate, endDate: ev.endDate ?? "",
      startTime: ev.startTime ?? "", endTime: ev.endTime ?? "",
    })
    setModalMode("edit")
  }

  const handleSave = async () => {
    if (!formData.title) { toast.error("Le titre est requis"); return }
    try {
      const body = {
        title: formData.title, description: formData.description || undefined,
        type: formData.type, startDate: formData.startDate,
        endDate: formData.endDate || undefined, startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined, allDay: !formData.startTime,
      }
      if (modalMode === "create") {
        const res = await fetch("/api/calendar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        const json = await res.json()
        if (!json.ok) throw new Error(json.message)
        toast.success("Événement créé")
      } else if (modalMode === "edit" && selectedEvent) {
        const res = await fetch(`/api/calendar/${selectedEvent.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        const json = await res.json()
        if (!json.ok) throw new Error(json.message)
        toast.success("Événement modifié")
      }
      setModalMode(null)
      handleDatesSet({ start: new Date(selectedDay.getFullYear(), selectedDay.getMonth(), 1), end: new Date(selectedDay.getFullYear(), selectedDay.getMonth() + 1, 0) })
    } catch (e) { toast.error(String(e)) }
  }

  const handleDelete = async () => {
    if (!selectedEvent) return
    try {
      const res = await fetch(`/api/calendar/${selectedEvent.id}`, { method: "DELETE" })
      const json = await res.json()
      if (!json.ok) throw new Error(json.message)
      toast.success("Événement supprimé")
      setModalMode(null)
      handleDatesSet({ start: new Date(selectedDay.getFullYear(), selectedDay.getMonth(), 1), end: new Date(selectedDay.getFullYear(), selectedDay.getMonth() + 1, 0) })
    } catch (e) { toast.error(String(e)) }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-card rounded-lg border p-2">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="fr"
          firstDay={1}
          height="auto"
          events={fcEvents}
          datesSet={handleDatesSet}
          dateClick={(arg) => { setSelectedDay(new Date(arg.dateStr + "T12:00:00")); openCreate(arg.dateStr) }}
          eventClick={(arg) => { arg.jsEvent.preventDefault(); openEdit(arg.event.extendedProps as unknown as CalendarEvent) }}
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: "",
          }}
          titleFormat={{ year: "numeric", month: "long" }}
          eventTimeFormat={{ hour: "2-digit", minute: "2-digit" }}
          dayMaxEvents={2}
        />
      </div>

      <div className="bg-card rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{format(selectedDay, "d MMMM yyyy", { locale: fr })}</h3>
          <Button size="sm" onClick={() => openCreate(format(selectedDay, "yyyy-MM-dd"))}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter
          </Button>
        </div>

        {todayEvents.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucun événement ce jour.</p>
        ) : (
          <div className="space-y-2">
            {todayEvents.map(ev => (
              <button key={ev.id} onClick={() => openEdit(ev)}
                className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: ev.color ?? EVENT_COLORS[ev.type] ?? "#3b82f6" }} />
                  <span className="font-medium text-sm">{ev.title}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {EVENT_LABELS[ev.type] ?? ev.type}
                  {ev.startTime && <span> · {ev.startTime}{ev.endTime ? `-${ev.endTime}` : ""}</span>}
                  {ev.endDate && ev.endDate !== ev.startDate &&
                    <span> · → {format(new Date(ev.endDate), "d MMM", { locale: fr })}</span>}
                </div>
              </button>
            ))}
          </div>
        )}

        <div>
          <p className="text-xs text-muted-foreground mb-2">Légende</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(EVENT_LABELS).map(([key, label]) => (
              <span key={key} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: EVENT_COLORS[key] }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={modalMode !== null} onOpenChange={(o) => { if (!o) setModalMode(null) }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{modalMode === "create" ? "Nouvel événement" : "Modifier l'événement"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input id="title" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={v => setFormData(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_LABELS).map(([k, l]) => (<SelectItem key={k} value={k}>{l}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date début *</Label>
                <Input id="startDate" type="date" value={formData.startDate} onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date fin</Label>
                <Input id="endDate" type="date" value={formData.endDate} onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Heure début</Label>
                <Input id="startTime" type="time" value={formData.startTime} onChange={e => setFormData(p => ({ ...p, startTime: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Heure fin</Label>
                <Input id="endTime" type="time" value={formData.endTime} onChange={e => setFormData(p => ({ ...p, endTime: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} />
            </div>
            <div className="flex justify-between pt-2">
              <div>
                {modalMode === "edit" && (
                  <Button type="button" variant="destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                  </Button>
                )}
              </div>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => setModalMode(null)}>Annuler</Button>
                <Button type="button" onClick={handleSave}>{modalMode === "create" ? "Créer" : "Enregistrer"}</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
