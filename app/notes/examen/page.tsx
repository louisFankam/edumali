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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus,
  Search,
  Download,
  Save,
  Edit,
  Eye,
  FileText,
  Users,
  BookOpen,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react"

// Types pour les données
interface Student {
  id: number;
  firstName: string;
  lastName: string;
  class: string;
}

interface Subject {
  id: number;
  name: string;
  coefficient: number;
}

interface Exam {
  id: number;
  name: string;
  type: "composition" | "trimestre";
  date: string;
  class: string;
  subject: string;
  coefficient: number;
  isActive: boolean;
}

interface Grade {
  id: number;
  studentId: number;
  examId: number;
  grade: number;
  remarks?: string;
}

// Mock data
const mockStudents: Student[] = [
  { id: 1, firstName: "Aminata", lastName: "Traoré", class: "CM2" },
  { id: 2, firstName: "Ibrahim", lastName: "Keita", class: "CM2" },
  { id: 3, firstName: "Mariam", lastName: "Coulibaly", class: "CM2" },
  { id: 4, firstName: "Ousmane", lastName: "Diarra", class: "CM2" },
  { id: 5, firstName: "Kadiatou", lastName: "Sangaré", class: "CM2" },
]

const mockSubjects: Subject[] = [
  { id: 1, name: "Mathématiques", coefficient: 3 },
  { id: 2, name: "Français", coefficient: 3 },
  { id: 3, name: "Sciences", coefficient: 2 },
  { id: 4, name: "Histoire-Géographie", coefficient: 2 },
  { id: 5, name: "Anglais", coefficient: 1 },
]

const mockExams: Exam[] = [
  {
    id: 1,
    name: "Composition 1 - Mathématiques",
    type: "composition",
    date: "2024-12-15",
    class: "CM2",
    subject: "Mathématiques",
    coefficient: 1,
    isActive: true
  },
  {
    id: 2,
    name: "Composition 1 - Français",
    type: "composition",
    date: "2024-12-16",
    class: "CM1",
    subject: "Français",
    coefficient: 1,
    isActive: true
  },
  {
    id: 3,
    name: "1er Trimestre - Mathématiques",
    type: "trimestre",
    date: "2024-12-20",
    class: "CM2",
    subject: "Mathématiques",
    coefficient: 2,
    isActive: false
  }
]

const mockGrades: Grade[] = [
  { id: 1, studentId: 1, examId: 1, grade: 15, remarks: "Bon travail" },
  { id: 2, studentId: 2, examId: 1, grade: 12, remarks: "Peut mieux faire" },
  { id: 3, studentId: 3, examId: 1, grade: 18, remarks: "Excellent" },
  { id: 4, studentId: 4, examId: 1, grade: 8, remarks: "Doit réviser" },
  { id: 5, studentId: 5, examId: 1, grade: 14, remarks: "Satisfaisant" },
]

// Composant pour créer un nouvel examen
function CreateExamModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "composition",
    date: "",
    class: "",
    subject: "",
    coefficient: 1
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newExam = {
      id: Date.now(),
      ...formData,
      isActive: false
    }
    onAdd(newExam)
    setFormData({
      name: "",
      type: "composition",
      date: "",
      class: "",
      subject: "",
      coefficient: 1
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer un nouvel examen</DialogTitle>
          <DialogDescription>
            Définissez les paramètres du nouvel examen
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
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Classe</label>
              <Select value={formData.class} onValueChange={(value) => setFormData({...formData, class: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
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
            <div>
              <label className="text-sm font-medium">Coefficient</label>
              <Input
                type="number"
                min="1"
                max="5"
                value={formData.coefficient}
                onChange={(e) => setFormData({...formData, coefficient: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Matière</label>
            <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une matière" />
              </SelectTrigger>
              <SelectContent>
                {mockSubjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.name}>
                    {subject.name} (coef: {subject.coefficient})
                  </SelectItem>
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

// Composant pour saisir les notes
function GradeEntryModal({ exam, students, grades, isOpen, onClose, onSave }) {
  const [gradeData, setGradeData] = useState(grades || [])
  const [remarks, setRemarks] = useState({})

  const handleGradeChange = (studentId, value) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue < 0 || numValue > 20) return

    setGradeData(prev => {
      const existing = prev.find(g => g.studentId === studentId)
      if (existing) {
        return prev.map(g => g.studentId === studentId ? { ...g, grade: numValue } : g)
      } else {
        return [...prev, { id: Date.now(), studentId, examId: exam.id, grade: numValue }]
      }
    })
  }

  const handleRemarksChange = (studentId, value) => {
    setRemarks(prev => ({ ...prev, [studentId]: value }))
  }

  const handleSave = () => {
    const gradesWithRemarks = gradeData.map(grade => ({
      ...grade,
      remarks: remarks[grade.studentId] || ""
    }))
    onSave(gradesWithRemarks)
    onClose()
  }

  const getGradeStatus = (grade) => {
    if (grade >= 16) return { status: "excellent", color: "text-green-600", icon: CheckCircle }
    if (grade >= 14) return { status: "bien", color: "text-blue-600", icon: CheckCircle }
    if (grade >= 12) return { status: "assez bien", color: "text-yellow-600", icon: CheckCircle }
    if (grade >= 10) return { status: "passable", color: "text-orange-600", icon: CheckCircle }
    return { status: "insuffisant", color: "text-red-600", icon: XCircle }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Saisie des notes - {exam.name}</DialogTitle>
          <DialogDescription>
            Saisissez les notes des élèves (échelle 0-20)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <strong>Classe:</strong> {exam.class}
            </div>
            <div>
              <strong>Matière:</strong> {exam.subject}
            </div>
            <div>
              <strong>Date:</strong> {exam.date}
            </div>
            <div>
              <strong>Coefficient:</strong> {exam.coefficient}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Élève</TableHead>
                <TableHead>Note /20</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Appréciation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const grade = gradeData.find(g => g.studentId === student.id)
                const gradeValue = grade ? grade.grade : ""
                const status = gradeValue ? getGradeStatus(gradeValue) : null
                
                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="font-medium">
                        {student.firstName} {student.lastName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={gradeValue}
                        onChange={(e) => handleGradeChange(student.id, e.target.value)}
                        className="w-20"
                        placeholder="0-20"
                      />
                    </TableCell>
                    <TableCell>
                      {status && (
                        <Badge variant="outline" className={status.color}>
                          <status.icon className="h-3 w-3 mr-1" />
                          {status.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={remarks[student.id] || ""}
                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                        placeholder="Appréciation (optionnel)"
                        className="w-48"
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder les notes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ExamPage() {
  const [exams, setExams] = useState(mockExams)
  const [grades, setGrades] = useState(mockGrades)
  const [selectedClass, setSelectedClass] = useState("CM2")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)
  const [showGradeModal, setShowGradeModal] = useState(false)

  // Filtrage des examens
  const filteredExams = exams.filter(exam => {
    const matchesClass = selectedClass === "all" || exam.class === selectedClass
    const matchesSubject = selectedSubject === "all" || exam.subject === selectedSubject
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesClass && matchesSubject && matchesSearch
  })

  const handleAddExam = (newExam) => {
    setExams([...exams, newExam])
  }

  const handleSaveGrades = (newGrades) => {
    setGrades(prev => {
      const filtered = prev.filter(g => g.examId !== selectedExam.id)
      return [...filtered, ...newGrades]
    })
  }

  const handleActivateExam = (examId) => {
    setExams(prev => prev.map(exam => ({
      ...exam,
      isActive: exam.id === examId
    })))
  }

  const handleExportGrades = (examId) => {
    const examGrades = grades.filter(g => g.examId === examId)
    const exam = exams.find(e => e.id === examId)
    
    // Simulation d'export Excel
    const data = examGrades.map(grade => {
      const student = mockStudents.find(s => s.id === grade.studentId)
      return {
        "Nom": student?.lastName,
        "Prénom": student?.firstName,
        "Classe": exam?.class,
        "Matière": exam?.subject,
        "Note": grade.grade,
        "Appréciation": grade.remarks || ""
      }
    })
    
    console.log("Export des notes:", data)
    alert("Export Excel généré avec succès!")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader
            title="Gestion des Examens"
            description="Créer des examens et saisir les notes des élèves"
          >
            <div className="flex space-x-2">
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel examen
              </Button>
            </div>
          </PageHeader>

          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle>Rechercher et filtrer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Rechercher un examen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrer par classe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les classes</SelectItem>
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
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrer par matière" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les matières</SelectItem>
                    {mockSubjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.name}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Liste des examens */}
          <Card>
            <CardHeader>
              <CardTitle>Examens créés</CardTitle>
              <CardDescription>
                Gérez vos examens et saisissez les notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredExams.map((exam) => {
                  const examGrades = grades.filter(g => g.examId === exam.id)
                  const hasGrades = examGrades.length > 0
                  
                  return (
                    <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{exam.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {exam.class} • {exam.subject} • Coef: {exam.coefficient} • {exam.date}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={exam.type === "composition" ? "outline" : "default"}>
                              {exam.type}
                            </Badge>
                            <Badge variant={exam.isActive ? "default" : "secondary"}>
                              {exam.isActive ? "Actif" : "Inactif"}
                            </Badge>
                            {hasGrades && (
                              <Badge variant="outline" className="text-green-600">
                                {examGrades.length} notes saisies
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!exam.isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivateExam(exam.id)}
                          >
                            Activer
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedExam(exam)
                            setShowGradeModal(true)
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Saisir notes
                        </Button>
                        {hasGrades && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExportGrades(exam.id)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Exporter
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {filteredExams.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun examen trouvé avec les critères sélectionnés.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      <CreateExamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onAdd={handleAddExam}
      />

      {selectedExam && (
        <GradeEntryModal
          exam={selectedExam}
          students={mockStudents.filter(s => s.class === selectedExam.class)}
          grades={grades.filter(g => g.examId === selectedExam.id)}
          isOpen={showGradeModal}
          onClose={() => setShowGradeModal(false)}
          onSave={handleSaveGrades}
        />
      )}
    </div>
  )
}




