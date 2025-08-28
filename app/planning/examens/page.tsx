"use client"

import { useState } from "react"
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
  Plus,
  Save,
  Edit,
  Trash2,
  Users,
  BookOpen,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar
} from "lucide-react"

// Types pour les données
interface Exam {
  id: number;
  name: string;
  type: "composition" | "trimestre";
  subject: string;
  class: string;
  duration: number; // en minutes
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  supervisor: string;
  color: string;
}

interface ExamSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  exam?: Exam;
}

interface Room {
  id: number;
  name: string;
  capacity: number;
  building: string;
}

// Mock data
const mockExams: Exam[] = [
  {
    id: 1,
    name: "Composition 1 - Mathématiques",
    type: "composition",
    subject: "Mathématiques",
    class: "CM2",
    duration: 60,
    date: "2024-12-15",
    startTime: "08:00",
    endTime: "09:00",
    room: "Salle 1",
    supervisor: "Fatoumata Diarra",
    color: "bg-blue-100 text-blue-700"
  },
  {
    id: 2,
    name: "Composition 1 - Français",
    type: "composition",
    subject: "Français",
    class: "CM2",
    duration: 60,
    date: "2024-12-16",
    startTime: "08:00",
    endTime: "09:00",
    room: "Salle 2",
    supervisor: "Moussa Koné",
    color: "bg-green-100 text-green-700"
  },
  {
    id: 3,
    name: "1er Trimestre - Mathématiques",
    type: "trimestre",
    subject: "Mathématiques",
    class: "CM2",
    duration: 120,
    date: "2025-02-15",
    startTime: "08:00",
    endTime: "10:00",
    room: "Salle 1",
    supervisor: "Fatoumata Diarra",
    color: "bg-purple-100 text-purple-700"
  }
]

const mockRooms: Room[] = [
  { id: 1, name: "Salle 1", capacity: 30, building: "Bâtiment A" },
  { id: 2, name: "Salle 2", capacity: 25, building: "Bâtiment A" },
  { id: 3, name: "Salle 3", capacity: 35, building: "Bâtiment B" },
  { id: 4, name: "Salle informatique", capacity: 20, building: "Bâtiment B" },
  { id: 5, name: "Salle de sciences", capacity: 25, building: "Bâtiment C" },
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

const mockSubjects = [
  "Mathématiques",
  "Français",
  "Sciences",
  "Histoire-Géographie",
  "Anglais",
  "Éducation Physique",
  "Arts Plastiques",
  "Informatique"
]

const mockClasses = [
  "CP", "CE1", "CE2", "CM1", "CM2", "6ème", "5ème", "4ème", "3ème"
]

const timeSlots = [
  { time: "08:00-09:00", startTime: "08:00", endTime: "09:00" },
  { time: "09:00-10:00", startTime: "09:00", endTime: "10:00" },
  { time: "10:00-11:00", startTime: "10:00", endTime: "11:00" },
  { time: "11:00-12:00", startTime: "11:00", endTime: "12:00" },
  { time: "13:00-14:00", startTime: "13:00", endTime: "14:00" },
  { time: "14:00-15:00", startTime: "14:00", endTime: "15:00" },
]

// Composant pour créer un nouvel examen
function CreateExamModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "composition",
    subject: "",
    class: "",
    duration: 60,
    date: "",
    startTime: "08:00",
    room: "",
    supervisor: ""
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const endTime = new Date(`2000-01-01T${formData.startTime}`)
    endTime.setMinutes(endTime.getMinutes() + formData.duration)
    
    const newExam = {
      id: Date.now(),
      ...formData,
      endTime: endTime.toTimeString().slice(0, 5),
      color: formData.type === "composition" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
    }
    onAdd(newExam)
    setFormData({
      name: "",
      type: "composition",
      subject: "",
      class: "",
      duration: 60,
      date: "",
      startTime: "08:00",
      room: "",
      supervisor: ""
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer un nouvel examen</DialogTitle>
          <DialogDescription>
            Planifiez un nouvel examen avec ses détails
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nom de l'examen</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Composition 1 - Mathématiques"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="composition">Composition</SelectItem>
                  <SelectItem value="trimestre">Trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Matière</label>
              <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {mockSubjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Classe</label>
              <Select value={formData.class} onValueChange={(value) => setFormData({...formData, class: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {mockClasses.map(classe => (
                    <SelectItem key={classe} value={classe}>{classe}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Durée (minutes)</label>
              <Input
                type="number"
                min="30"
                max="180"
                step="30"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Heure de début</label>
              <Select value={formData.startTime} onValueChange={(value) => setFormData({...formData, startTime: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(slot => (
                    <SelectItem key={slot.startTime} value={slot.startTime}>{slot.startTime}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Salle</label>
              <Select value={formData.room} onValueChange={(value) => setFormData({...formData, room: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {mockRooms.map(room => (
                    <SelectItem key={room.id} value={room.name}>{room.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Surveillant</label>
            <Select value={formData.supervisor} onValueChange={(value) => setFormData({...formData, supervisor: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un surveillant" />
              </SelectTrigger>
              <SelectContent>
                {mockTeachers.map(teacher => (
                  <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Créer l'examen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Composant pour le planning des examens
function ExamScheduleGrid({ exams, onExamDrop, onExamRemove }) {
  const [draggedExam, setDraggedExam] = useState(null)
  const [dragOverSlot, setDragOverSlot] = useState(null)

  const handleDragStart = (e, exam) => {
    setDraggedExam(exam)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e, slotId) => {
    e.preventDefault()
    setDragOverSlot(slotId)
  }

  const handleDrop = (e, slotId) => {
    e.preventDefault()
    if (draggedExam && slotId) {
      const [date, startTime] = slotId.split('-')
      const timeSlot = timeSlots.find(ts => ts.startTime === startTime)
      
      const endTime = new Date(`2000-01-01T${startTime}`)
      endTime.setMinutes(endTime.getMinutes() + draggedExam.duration)
      
      const updatedExam = {
        ...draggedExam,
        date,
        startTime,
        endTime: endTime.toTimeString().slice(0, 5)
      }
      
      onExamDrop(slotId, updatedExam)
    }
    setDraggedExam(null)
    setDragOverSlot(null)
  }

  const handleDragEnd = () => {
    setDraggedExam(null)
    setDragOverSlot(null)
  }

  const getSlotContent = (date, timeSlot) => {
    const slotId = `${date}-${timeSlot.startTime}`
    const existingExam = exams.find(exam => exam.date === date && exam.startTime === timeSlot.startTime)
    
    if (existingExam) {
      return (
        <div 
          className={`${existingExam.color} p-2 rounded cursor-move hover:opacity-80 transition-opacity`}
          draggable
          onDragStart={(e) => handleDragStart(e, existingExam)}
          onDragEnd={handleDragEnd}
        >
          <div className="font-medium text-xs">{existingExam.name}</div>
          <div className="text-xs opacity-75">{existingExam.class}</div>
          <div className="text-xs opacity-75">{existingExam.room}</div>
          <div className="text-xs opacity-75">{existingExam.supervisor}</div>
        </div>
      )
    }

    return (
      <div 
        className={`h-full min-h-[80px] border-2 border-dashed border-gray-300 rounded p-2 flex items-center justify-center text-gray-400 text-xs ${
          dragOverSlot === slotId ? 'border-blue-500 bg-blue-50' : ''
        }`}
        onDragOver={(e) => handleDragOver(e, slotId)}
        onDrop={(e) => handleDrop(e, slotId)}
        onDragEnd={handleDragEnd}
      >
        Glisser un examen
      </div>
    )
  }

  // Générer les dates pour la semaine en cours
  const getWeekDates = () => {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1)
    
    const dates = []
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  const weekDates = getWeekDates()
  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 p-2 text-sm font-medium text-gray-700 w-24">Heure</th>
            {days.map((day, index) => (
              <th key={day} className="border border-gray-200 p-2 text-sm font-medium text-gray-700 w-48">
                <div>{day}</div>
                <div className="text-xs text-gray-500">{weekDates[index]}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(timeSlot => (
            <tr key={timeSlot.time}>
              <td className="border border-gray-200 p-2 text-sm font-medium text-gray-600 bg-gray-50">
                {timeSlot.time}
              </td>
              {weekDates.map(date => (
                <td key={`${date}-${timeSlot.time}`} className="border border-gray-200 p-2 h-24">
                  {getSlotContent(date, timeSlot)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Composant pour la liste des examens
function ExamList({ exams, onExamDrag, onExamEdit, onExamDelete }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Examens disponibles</h3>
      {exams.map(exam => (
        <div
          key={exam.id}
          className={`${exam.color} p-3 rounded-lg cursor-move hover:opacity-80 transition-opacity`}
          draggable
          onDragStart={(e) => onExamDrag(e, exam)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium text-sm">{exam.name}</div>
              <div className="text-xs opacity-75">{exam.class} • {exam.subject}</div>
              <div className="text-xs opacity-75">{exam.duration} min • {exam.room}</div>
            </div>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onExamEdit(exam)}
                className="h-6 w-6 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onExamDelete(exam.id)}
                className="h-6 w-6 p-0 text-red-600"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ExamPlanningPage() {
  const [exams, setExams] = useState(mockExams)
  const [scheduledExams, setScheduledExams] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)

  const handleAddExam = (newExam) => {
    setExams([...exams, newExam])
  }

  const handleExamDrop = (slotId, exam) => {
    // Vérifier les conflits
    const conflicts = scheduledExams.filter(e => 
      e.date === exam.date && 
      e.startTime === exam.startTime && 
      (e.room === exam.room || e.supervisor === exam.supervisor)
    )
    
    if (conflicts.length > 0) {
      alert("Conflit détecté ! Même salle ou même surveillant à la même heure.")
      return
    }
    
    setScheduledExams(prev => [
      ...prev.filter(e => !(e.date === exam.date && e.startTime === exam.startTime)),
      exam
    ])
  }

  const handleExamRemove = (examId) => {
    setExams(prev => prev.filter(exam => exam.id !== examId))
  }

  const handleExportExcel = () => {
    const data = []
    
    // En-tête
    data.push(["Planning des examens"])
    data.push([])
    data.push(["Date", "Heure", "Examen", "Classe", "Matière", "Durée", "Salle", "Surveillant"])
    
    // Données
    scheduledExams.forEach(exam => {
      data.push([
        exam.date,
        `${exam.startTime}-${exam.endTime}`,
        exam.name,
        exam.class,
        exam.subject,
        `${exam.duration} min`,
        exam.room,
        exam.supervisor
      ])
    })
    
    // Simulation d'export Excel
    console.log("Export Excel:", data)
    alert("Planning des examens exporté en Excel avec succès!")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader
            title="Planning des Examens"
            description="Planifier les examens avec gestion des salles et surveillants"
          >
            <div className="flex space-x-2">
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel examen
              </Button>
              <Button onClick={handleExportExcel}>
                <Download className="h-4 w-4 mr-2" />
                Exporter Excel
              </Button>
            </div>
          </PageHeader>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Examens créés</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{exams.length}</div>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Examens planifiés</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scheduledExams.length}</div>
                <p className="text-xs text-muted-foreground">Cette semaine</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Salles disponibles</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockRooms.length}</div>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Surveillants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockTeachers.length}</div>
                <p className="text-xs text-muted-foreground">Disponibles</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Liste des examens */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Examens</CardTitle>
                  <CardDescription>
                    Glissez-déposez les examens dans le planning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExamList 
                    exams={exams}
                    onExamDrag={(e, exam) => {
                      e.dataTransfer.setData("text/plain", JSON.stringify(exam))
                    }}
                    onExamEdit={(exam) => {
                      setSelectedExam(exam)
                      // Ici on pourrait ouvrir un modal d'édition
                    }}
                    onExamDelete={handleExamRemove}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Planning des examens */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Planning des examens - Semaine en cours</CardTitle>
                  <CardDescription>
                    Lundi - Vendredi • 8h00 - 15h00
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExamScheduleGrid
                    exams={scheduledExams}
                    onExamDrop={handleExamDrop}
                    onExamRemove={handleExamRemove}
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
                    <strong>Glisser-déposer :</strong> Glissez un examen depuis la liste vers un créneau horaire
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Conflits :</strong> Le système détecte automatiquement les conflits de salles et surveillants
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Export :</strong> Exportez le planning en format Excel
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal de création */}
      <CreateExamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onAdd={handleAddExam}
      />
    </div>
  )
}




