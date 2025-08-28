"use client"

import { useState, useRef, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Clock,
  Download,
  Copy,
  Save,
  Edit,
  Trash2,
  Plus,
  Users,
  BookOpen,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react"
import { documentGenerator } from "@/lib/document-generator"

// Types pour les données
interface Subject {
  id: number;
  name: string;
  color: string;
  teacher?: string;
}

interface TimeSlot {
  id: string;
  day: string;
  time: string;
  startTime: string;
  endTime: string;
  type: "course" | "break" | "lunch";
  subject?: Subject;
  teacher?: string;
  duration: number; // en minutes
}

interface Schedule {
  id: number;
  class: string;
  timeSlots: TimeSlot[];
}

// Mock data
const mockSubjects: Subject[] = [
  { id: 1, name: "Mathématiques", color: "bg-blue-100 text-blue-700", teacher: "Fatoumata Diarra" },
  { id: 2, name: "Français", color: "bg-green-100 text-green-700", teacher: "Moussa Koné" },
  { id: 3, name: "Sciences", color: "bg-yellow-100 text-yellow-700", teacher: "Aïcha Traoré" },
  { id: 4, name: "Histoire-Géographie", color: "bg-purple-100 text-purple-700", teacher: "Sékou Keita" },
  { id: 5, name: "Anglais", color: "bg-red-100 text-red-700", teacher: "Aminata Touré" },
  { id: 6, name: "Éducation Physique", color: "bg-orange-100 text-orange-700", teacher: "Oumar Diallo" },
  { id: 7, name: "Arts Plastiques", color: "bg-pink-100 text-pink-700", teacher: "Kadiatou Sidibé" },
  { id: 8, name: "Informatique", color: "bg-indigo-100 text-indigo-700", teacher: "Moussa Diarra" },
]

const mockTeachers = [
  "Fatoumata Diarra",
  "Moussa Koné", 
  "Aïcha Traoré",
  "Sékou Keita",
  "Aminata Touré",
  "Oumar Diallo",
  "Kadiatou Sidibé",
  "Moussa Diarra"
]

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]
const timeSlots = [
  { time: "07:00-08:00", startTime: "07:00", endTime: "08:00", duration: 60 },
  { time: "08:00-09:00", startTime: "08:00", endTime: "09:00", duration: 60 },
  { time: "09:00-10:00", startTime: "09:00", endTime: "10:00", duration: 60 },
  { time: "10:00-10:15", startTime: "10:00", endTime: "10:15", duration: 15, type: "break" },
  { time: "10:15-11:15", startTime: "10:15", endTime: "11:15", duration: 60 },
  { time: "11:15-12:15", startTime: "11:15", endTime: "12:15", duration: 60 },
  { time: "12:15-13:00", startTime: "12:15", endTime: "13:00", duration: 45, type: "lunch" },
  { time: "13:00-14:00", startTime: "13:00", endTime: "14:00", duration: 60 },
  { time: "14:00-15:00", startTime: "14:00", endTime: "15:00", duration: 60 },
]

// Composant pour l'emploi du temps
function ScheduleGrid({ schedule, onUpdateSchedule, onSubjectDrop, onEditSlot, onDeleteSlot, onAddCustomSlot, onUpdateTimeSlot }) {
  const [draggedSubject, setDraggedSubject] = useState(null)
  const [dragOverSlot, setDragOverSlot] = useState(null)

  const handleDragStart = (e, subject, slotId) => {
    setDraggedSubject({ subject, sourceSlotId: slotId })
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", JSON.stringify({ subject, sourceSlotId: slotId }))
  }

  const handleDragOver = (e, slotId) => {
    e.preventDefault()
    setDragOverSlot(slotId)
  }

  const handleDrop = (e, slotId) => {
    e.preventDefault()
    try {
      const subjectData = e.dataTransfer.getData("text/plain")
      if (subjectData) {
        const data = JSON.parse(subjectData)
        
        // Vérifier si c'est un déplacement de cours existant
        if (data.sourceSlotId) {
          // Déplacer le cours d'un créneau à un autre
          if (data.sourceSlotId !== slotId) {
            const existingSlot = schedule.timeSlots.find(slot => slot.id === slotId)
            if (existingSlot && existingSlot.subject) {
              if (confirm(`Voulez-vous échanger "${existingSlot.subject.name}" avec "${data.subject.name}" ?`)) {
                onSubjectDrop(slotId, data.subject, data.sourceSlotId)
              }
            } else {
              onSubjectDrop(slotId, data.subject, data.sourceSlotId)
            }
          }
        } else {
          // Nouveau cours depuis la liste des matières
          const subject = data
          const existingSlot = schedule.timeSlots.find(slot => slot.id === slotId)
          if (existingSlot && existingSlot.subject) {
            if (confirm(`Voulez-vous remplacer "${existingSlot.subject.name}" par "${subject.name}" ?`)) {
              onSubjectDrop(slotId, subject)
            }
          } else {
            onSubjectDrop(slotId, subject)
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors du drop:", error)
    }
    setDraggedSubject(null)
    setDragOverSlot(null)
  }

  const handleDragEnd = () => {
    setDraggedSubject(null)
    setDragOverSlot(null)
  }

  const handleSlotClick = (slot) => {
    if (slot && slot.subject) {
      onEditSlot(slot)
    }
  }

  const handleDeleteSlot = (e, slotId) => {
    e.stopPropagation()
    if (confirm("Voulez-vous supprimer ce cours ?")) {
      onDeleteSlot(slotId)
    }
  }

  const handleAddCustomSlot = (day, timeSlot) => {
    const startTime = prompt("Heure de début (format HH:MM):", timeSlot.startTime)
    if (startTime) {
      const endTime = prompt("Heure de fin (format HH:MM):", timeSlot.endTime)
      if (endTime) {
        onAddCustomSlot(day, startTime, endTime)
      }
    }
  }

  const getSlotContent = (day, timeSlot) => {
    const slotId = `${day}-${timeSlot.startTime}`
    const existingSlot = schedule.timeSlots.find(slot => slot.id === slotId)
    
    // Vérifier aussi les créneaux personnalisés
    const customSlotId = `${day}-${timeSlot.startTime}-custom`
    const customSlot = schedule.timeSlots.find(slot => slot.id === customSlotId)
    
    if (timeSlot.type === "break") {
      return (
        <div className="bg-yellow-50 text-yellow-700 text-xs font-medium p-2 text-center">
          Récréation
        </div>
      )
    }
    
    if (timeSlot.type === "lunch") {
      return (
        <div className="bg-orange-50 text-orange-700 text-xs font-medium p-2 text-center">
          Pause déjeuner
        </div>
      )
    }

    // Afficher le créneau personnalisé s'il existe
    if (customSlot) {
      if (customSlot.subject) {
        return (
          <div 
            className={`${customSlot.subject.color} p-2 rounded cursor-pointer hover:opacity-80 transition-opacity relative group`}
            draggable
            onDragStart={(e) => handleDragStart(e, customSlot.subject, customSlot.id)}
            onDragEnd={handleDragEnd}
            onClick={() => handleSlotClick(customSlot)}
          >
            <div className="font-medium text-xs">{customSlot.subject.name}</div>
            <div className="text-xs opacity-75">{customSlot.teacher}</div>
            <div className="text-xs opacity-75">{customSlot.startTime}-{customSlot.endTime}</div>
            
            {/* Bouton de suppression */}
            <button
              className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              onClick={(e) => handleDeleteSlot(e, customSlot.id)}
              title="Supprimer ce cours"
            >
              ×
            </button>
          </div>
        )
      } else {
        return (
          <div 
            className="bg-gray-100 text-gray-600 p-2 rounded cursor-pointer hover:bg-gray-200 transition-colors relative group"
            onClick={() => handleSlotClick(customSlot)}
          >
            <div className="text-xs font-medium">Créneau libre</div>
            <div className="text-xs opacity-75">{customSlot.startTime}-{customSlot.endTime}</div>
            
            {/* Bouton de suppression */}
            <button
              className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              onClick={(e) => handleDeleteSlot(e, customSlot.id)}
              title="Supprimer ce créneau"
            >
              ×
            </button>
          </div>
        )
      }
    }

    if (existingSlot && existingSlot.subject) {
      return (
        <div 
          className={`${existingSlot.subject.color} p-2 rounded cursor-pointer hover:opacity-80 transition-opacity relative group`}
          draggable
          onDragStart={(e) => handleDragStart(e, existingSlot.subject, existingSlot.id)}
          onDragEnd={handleDragEnd}
          onClick={() => handleSlotClick(existingSlot)}
        >
          <div className="font-medium text-xs">{existingSlot.subject.name}</div>
          <div className="text-xs opacity-75">{existingSlot.teacher}</div>
          <div className="text-xs opacity-75">{existingSlot.startTime}-{existingSlot.endTime}</div>
          
          {/* Bouton de suppression */}
          <button
            className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            onClick={(e) => handleDeleteSlot(e, existingSlot.id)}
            title="Supprimer ce cours"
          >
            ×
          </button>
        </div>
      )
    }

    return (
      <div 
        className={`h-full min-h-[60px] border-2 border-dashed border-gray-300 rounded p-2 flex flex-col items-center justify-center text-gray-400 text-xs hover:border-blue-400 hover:bg-blue-50 transition-colors relative group ${
          dragOverSlot === slotId ? 'border-blue-500 bg-blue-50' : ''
        }`}
        onDragOver={(e) => handleDragOver(e, slotId)}
        onDrop={(e) => handleDrop(e, slotId)}
        onDragEnd={handleDragEnd}
      >
                  <div 
            className="text-xs font-medium mb-1 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => {
              const newStartTime = prompt("Nouvelle heure de début (HH:MM):", timeSlot.startTime)
              if (newStartTime) {
                const newEndTime = prompt("Nouvelle heure de fin (HH:MM):", timeSlot.endTime)
                if (newEndTime) {
                  handleAddCustomSlot(day, newStartTime, newEndTime)
                }
              }
            }}
            title="Cliquer pour modifier les heures"
          >
            {timeSlot.startTime}-{timeSlot.endTime}
          </div>
          <div>Glisser une matière</div>
        
        {/* Bouton pour ajouter un créneau personnalisé */}
        <button
          className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          onClick={() => handleAddCustomSlot(day, timeSlot)}
          title="Créer un créneau personnalisé"
        >
          +
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 p-2 text-sm font-medium text-gray-700 w-24">Heure</th>
            {days.map(day => (
              <th key={day} className="border border-gray-200 p-2 text-sm font-medium text-gray-700 w-48">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(timeSlot => (
            <tr key={timeSlot.time}>
                            <td className="border border-gray-200 p-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors group">
                <div className="flex items-center justify-between">
                  <span 
                    className="cursor-pointer hover:text-blue-600 transition-colors" 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      alert(`Clic détecté sur ${timeSlot.time}!`)
                      
                      const newStartTime = prompt("Nouvelle heure de début (HH:MM):", timeSlot.startTime)
                      
                      if (newStartTime) {
                        const newEndTime = prompt("Nouvelle heure de fin (HH:MM):", timeSlot.endTime)
                        
                        if (newEndTime) {
                          // Mettre à jour le timeSlot
                          const updatedTimeSlot = {
                            ...timeSlot,
                            startTime: newStartTime,
                            endTime: newEndTime,
                            time: `${newStartTime}-${newEndTime}`
                          }
                          console.log("TimeSlot mis à jour:", updatedTimeSlot)
                          onUpdateTimeSlot(updatedTimeSlot)
                        }
                      }
                    }}
                    title="Cliquer pour modifier les heures"
                  >
                    {timeSlot.time}
                  </span>
                  <button
                    className="ml-2 w-5 h-5 bg-blue-500 text-white rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-blue-600"
                    onClick={() => {
                      const newStartTime = prompt("Nouvelle heure de début (HH:MM):", timeSlot.startTime)
                      if (newStartTime) {
                        const newEndTime = prompt("Nouvelle heure de fin (HH:MM):", timeSlot.endTime)
                        if (newEndTime) {
                          // Mettre à jour le timeSlot
                          const updatedTimeSlot = {
                            ...timeSlot,
                            startTime: newStartTime,
                            endTime: newEndTime,
                            time: `${newStartTime}-${newEndTime}`
                          }
                          onUpdateTimeSlot(updatedTimeSlot)
                        }
                      }
                    }}
                    title="Modifier les heures"
                  >
                    ✏️
                  </button>
                </div>
              </td>
              {days.map(day => (
                <td key={`${day}-${timeSlot.time}`} className="border border-gray-200 p-2 h-20">
                  {getSlotContent(day, timeSlot)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Composant pour la liste des matières
function SubjectList({ subjects, onSubjectDrag }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Matières disponibles</h3>
      {subjects.map(subject => (
        <div
          key={subject.id}
          className={`${subject.color} p-3 rounded-lg cursor-move hover:opacity-80 transition-opacity`}
          draggable
          onDragStart={(e) => onSubjectDrag(e, subject)}
        >
          <div className="font-medium">{subject.name}</div>
          <div className="text-sm opacity-75">{subject.teacher}</div>
        </div>
      ))}
    </div>
  )
}

// Composant pour créer un créneau personnalisé
function CustomSlotModal({ isOpen, onClose, onSave, days }) {
  const [formData, setFormData] = useState({
    day: "Lundi",
    startTime: "08:00",
    endTime: "09:00"
  })

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Jour</label>
        <Select value={formData.day} onValueChange={(value) => setFormData({...formData, day: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {days.map(day => (
              <SelectItem key={day} value={day}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Heure de début</label>
          <Input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Heure de fin</label>
          <Input
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Durées rapides</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {[
            { label: "30 min", duration: 30 },
            { label: "45 min", duration: 45 },
            { label: "1h", duration: 60 },
            { label: "1h30", duration: 90 },
            { label: "2h", duration: 120 }
          ].map(({ label, duration }) => (
            <Button
              key={duration}
              variant="outline"
              size="sm"
              onClick={() => {
                const start = new Date(`2000-01-01T${formData.startTime}:00`)
                const end = new Date(start.getTime() + duration * 60000)
                const endTime = end.toTimeString().slice(0, 5)
                setFormData({...formData, endTime})
              }}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            💡 <strong>Astuce :</strong> Vous pouvez créer des créneaux de n'importe quelle durée entre 15 minutes et 3 heures.
            <br />
            💡 <strong>Raccourci :</strong> Cliquez sur les heures dans l'emploi du temps pour les modifier rapidement.
          </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={handleSave}>
          Créer le créneau
        </Button>
      </div>
    </div>
  )
}

// Composant pour modifier un créneau
function EditSlotModal({ slot, isOpen, onClose, onSave, subjects, teachers, timeSlots }) {
  const [formData, setFormData] = useState({
    subjectId: slot?.subject?.id || "",
    teacher: slot?.teacher || "",
    startTime: slot?.startTime || "",
    endTime: slot?.endTime || "",
    duration: slot?.duration || 60
  })

  // Mettre à jour le formulaire quand le slot change
  useEffect(() => {
    if (slot) {
      setFormData({
        subjectId: slot.subject?.id || "",
        teacher: slot.teacher || "",
        startTime: slot.startTime || "",
        endTime: slot.endTime || "",
        duration: slot.duration || 60
      })
    }
  }, [slot])

  const handleSave = () => {
    const selectedSubject = subjects.find(s => s.id === parseInt(formData.subjectId))
    
    // Calculer automatiquement la durée si les heures sont définies
    let duration = formData.duration
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}:00`)
      const end = new Date(`2000-01-01T${formData.endTime}:00`)
      const diffMs = end.getTime() - start.getTime()
      duration = Math.round(diffMs / (1000 * 60)) // Convertir en minutes
    }
    
    onSave({
      ...slot,
      subject: selectedSubject,
      teacher: formData.teacher,
      startTime: formData.startTime,
      endTime: formData.endTime,
      duration: duration
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le créneau</DialogTitle>
          <DialogDescription>
            Modifiez les détails du créneau horaire
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Matière</label>
            <Select value={formData.subjectId.toString()} onValueChange={(value) => setFormData({...formData, subjectId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une matière" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Professeur</label>
            <Select value={formData.teacher} onValueChange={(value) => setFormData({...formData, teacher: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un professeur" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map(teacher => (
                  <SelectItem key={teacher} value={teacher}>
                    {teacher}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Heure de début</label>
              <div className="flex gap-2">
                <Select value={formData.startTime} onValueChange={(value) => setFormData({...formData, startTime: value})}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sélectionner l'heure" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.filter(ts => ts.type !== "break" && ts.type !== "lunch").map(timeSlot => (
                      <SelectItem key={timeSlot.startTime} value={timeSlot.startTime}>
                        {timeSlot.startTime}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  className="w-24"
                  placeholder="HH:MM"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Heure de fin</label>
              <div className="flex gap-2">
                <Select value={formData.endTime} onValueChange={(value) => setFormData({...formData, endTime: value})}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sélectionner l'heure" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.filter(ts => ts.type !== "break" && ts.type !== "lunch").map(timeSlot => (
                      <SelectItem key={timeSlot.endTime} value={timeSlot.endTime}>
                        {timeSlot.endTime}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  className="w-24"
                  placeholder="HH:MM"
                />
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            💡 <strong>Astuce :</strong> Vous pouvez modifier les heures pour créer des créneaux personnalisés. 
            Le système ajustera automatiquement la durée.
          </div>

          <div>
            <label className="text-sm font-medium">Durée (minutes)</label>
            <Input
              type="number"
              min="15"
              max="120"
              step="15"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function EmploiDuTempsPage() {
  const [selectedClass, setSelectedClass] = useState("CM2")
  const [schedules, setSchedules] = useState({
    "CM2": {
      id: 1,
      class: "CM2",
      timeSlots: []
    }
  })
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showCustomSlotModal, setShowCustomSlotModal] = useState(false)

  const currentSchedule = schedules[selectedClass] || {
    id: Date.now(),
    class: selectedClass,
    timeSlots: []
  }

  const handleSubjectDrop = (slotId, subject, sourceSlotId = null) => {
    const [day, startTime] = slotId.split('-')
    const timeSlot = timeSlots.find(ts => ts.startTime === startTime)
    
    const newTimeSlot = {
      id: slotId,
      day,
      time: timeSlot.time,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      type: "course",
      subject,
      teacher: subject.teacher,
      duration: timeSlot.duration
    }

    setSchedules(prev => {
      const currentSchedule = prev[selectedClass] || { timeSlots: [] }
      let updatedTimeSlots = [...currentSchedule.timeSlots]

      // Si c'est un déplacement, supprimer le cours de l'ancien créneau
      if (sourceSlotId) {
        updatedTimeSlots = updatedTimeSlots.filter(slot => slot.id !== sourceSlotId)
      }

      // Supprimer l'ancien cours du nouveau créneau s'il existe
      updatedTimeSlots = updatedTimeSlots.filter(slot => slot.id !== slotId)

      // Ajouter le nouveau cours
      updatedTimeSlots.push(newTimeSlot)

      return {
        ...prev,
        [selectedClass]: {
          ...currentSchedule,
          timeSlots: updatedTimeSlots
        }
      }
    })
  }

  const handleDeleteSlot = (slotId) => {
    setSchedules(prev => ({
      ...prev,
      [selectedClass]: {
        ...prev[selectedClass],
        timeSlots: prev[selectedClass].timeSlots.filter(slot => slot.id !== slotId)
      }
    }))
  }

  const handleAddCustomSlot = (day, startTime, endTime) => {
    // Calculer la durée en minutes
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    const diffMs = end.getTime() - start.getTime()
    const duration = Math.round(diffMs / (1000 * 60))

    const customSlotId = `${day}-${startTime}-custom`
    
    const newTimeSlot = {
      id: customSlotId,
      day,
      time: `${startTime}-${endTime}`,
      startTime,
      endTime,
      type: "course",
      subject: null,
      teacher: "",
      duration,
      isCustom: true
    }

    setSchedules(prev => ({
      ...prev,
      [selectedClass]: {
        ...prev[selectedClass],
        timeSlots: [
          ...prev[selectedClass]?.timeSlots || [],
          newTimeSlot
        ]
      }
    }))
  }

  const handleUpdateTimeSlot = (updatedTimeSlot) => {
    console.log("handleUpdateTimeSlot appelée avec:", updatedTimeSlot)
    
    // Mettre à jour le timeSlot global
    const updatedTimeSlots = timeSlots.map(ts => 
      ts.startTime === updatedTimeSlot.startTime && ts.endTime === updatedTimeSlot.endTime 
        ? updatedTimeSlot 
        : ts
    )
    console.log("TimeSlots mis à jour:", updatedTimeSlots)
    
    // Mettre à jour les créneaux existants avec les nouvelles heures
    setSchedules(prev => {
      console.log("Mise à jour des schedules, prev:", prev)
      const currentSchedule = prev[selectedClass] || { timeSlots: [] }
      const updatedScheduleTimeSlots = currentSchedule.timeSlots.map(slot => {
        // Si le slot correspond à l'ancien créneau horaire, mettre à jour son ID
        if (slot.startTime === updatedTimeSlot.startTime && slot.endTime === updatedTimeSlot.endTime) {
          return {
            ...slot,
            startTime: updatedTimeSlot.startTime,
            endTime: updatedTimeSlot.endTime,
            time: updatedTimeSlot.time,
            id: `${slot.day}-${updatedTimeSlot.startTime}`
          }
        }
        return slot
      })

      const newSchedules = {
        ...prev,
        [selectedClass]: {
          ...currentSchedule,
          timeSlots: updatedScheduleTimeSlots
        }
      }
      console.log("Nouveaux schedules:", newSchedules)
      return newSchedules
    })
  }

  const handleEditSlot = (slot) => {
    setSelectedSlot(slot)
    setShowEditModal(true)
  }

  const handleSaveSlot = (updatedSlot) => {
    setSchedules(prev => {
      const currentSchedule = prev[selectedClass] || { timeSlots: [] }
      let updatedTimeSlots = [...currentSchedule.timeSlots]

      // Supprimer l'ancien slot
      updatedTimeSlots = updatedTimeSlots.filter(slot => slot.id !== updatedSlot.id)

      // Ajouter le slot mis à jour avec le nouvel ID si les heures ont changé
      const newSlotId = `${updatedSlot.day}-${updatedSlot.startTime}`
      const finalSlot = {
        ...updatedSlot,
        id: newSlotId
      }

      updatedTimeSlots.push(finalSlot)

      return {
        ...prev,
        [selectedClass]: {
          ...currentSchedule,
          timeSlots: updatedTimeSlots
        }
      }
    })
  }

  const handleExportExcel = () => {
    try {
      const scheduleData = {
        class: selectedClass,
        timeSlots: timeSlots,
        days: days,
        schedule: currentSchedule.timeSlots
      }

      const designConfig = {
        template: 'modern',
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        accentColor: '#f59e0b'
      }

      documentGenerator.generateSchedule(scheduleData, designConfig)
      alert("Emploi du temps exporté en Excel avec succès!")
    } catch (error) {
      console.error("Erreur lors de l'export:", error)
      alert("Erreur lors de l'export de l'emploi du temps")
    }
  }

  const handleCopySchedule = () => {
    const targetClass = prompt("Entrez la classe de destination (ex: CM1):")
    if (targetClass && targetClass !== selectedClass) {
      setSchedules(prev => ({
        ...prev,
        [targetClass]: {
          id: Date.now(),
          class: targetClass,
          timeSlots: currentSchedule.timeSlots.map(slot => ({
            ...slot,
            id: `${slot.day}-${slot.startTime}-${targetClass}`
          }))
        }
      }))
      alert(`Emploi du temps copié vers ${targetClass} avec succès!`)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader
            title="Emploi du temps"
            description="Gérer les emplois du temps des classes avec glisser-déposer"
          >
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCopySchedule}>
                <Copy className="h-4 w-4 mr-2" />
                Copier vers une autre classe
              </Button>
              <Button onClick={handleExportExcel}>
                <Download className="h-4 w-4 mr-2" />
                Exporter Excel
              </Button>
              <Button onClick={() => setShowCustomSlotModal(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Créneau personnalisé
              </Button>
            </div>
          </PageHeader>

          {/* Sélection de classe */}
          <Card>
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div>
                  <label className="text-sm font-medium">Classe</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CP">CP</SelectItem>
                      <SelectItem value="CE1">CE1</SelectItem>
                      <SelectItem value="CE2">CE2</SelectItem>
                      <SelectItem value="CM1">CM1</SelectItem>
                      <SelectItem value="CM2">CM2</SelectItem>
                      <SelectItem value="6ème">6ème</SelectItem>
                      <SelectItem value="5ème">5ème</SelectItem>
                      <SelectItem value="4ème">4ème</SelectItem>
                      <SelectItem value="3ème">3ème</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentSchedule.timeSlots.filter(slot => slot.type === "course").length} cours programmés
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Liste des matières */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Matières</CardTitle>
                  <CardDescription>
                    Glissez-déposez les matières dans l'emploi du temps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubjectList 
                    subjects={mockSubjects}
                    onSubjectDrag={(e, subject) => {
                      e.dataTransfer.setData("text/plain", JSON.stringify(subject))
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Emploi du temps */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Emploi du temps - {selectedClass}</CardTitle>
                  <CardDescription>
                    Horaires : 7h00 - 15h00 • Lundi - Vendredi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                                      <ScheduleGrid
                      schedule={currentSchedule}
                      onUpdateSchedule={setSchedules}
                      onSubjectDrop={handleSubjectDrop}
                      onEditSlot={handleEditSlot}
                      onDeleteSlot={handleDeleteSlot}
                      onAddCustomSlot={handleAddCustomSlot}
                      onUpdateTimeSlot={handleUpdateTimeSlot}
                    />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Glisser-déposer :</strong> Glissez une matière depuis la liste vers un créneau horaire
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Modifier les heures :</strong> Cliquez sur les heures dans la première colonne pour les modifier
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Modification :</strong> Cliquez sur un créneau pour modifier les détails
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Export :</strong> Exportez l'emploi du temps en format Excel
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal d'édition */}
      <EditSlotModal
        slot={selectedSlot}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveSlot}
        subjects={mockSubjects}
        teachers={mockTeachers}
        timeSlots={timeSlots}
      />

      {/* Modal pour créer un créneau personnalisé */}
      <Dialog open={showCustomSlotModal} onOpenChange={setShowCustomSlotModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un créneau personnalisé</DialogTitle>
            <DialogDescription>
              Définissez un nouveau créneau horaire pour {selectedClass}
            </DialogDescription>
          </DialogHeader>
          <CustomSlotModal
            isOpen={showCustomSlotModal}
            onClose={() => setShowCustomSlotModal(false)}
            onSave={(customSlot) => {
              handleAddCustomSlot(customSlot.day, customSlot.startTime, customSlot.endTime)
              setShowCustomSlotModal(false)
            }}
            days={days}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}



