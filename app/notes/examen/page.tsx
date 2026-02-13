"use client"

import { useState, useEffect } from "react"
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
import { useExams } from "@/hooks/use-exams"
import { useGrades } from "@/hooks/use-grades"
import { useClasses } from "@/hooks/use-classes"
import { useSubjects } from "@/hooks/use-subjects"
import { useStudents } from "@/hooks/use-students"
import { useAcademicYears } from "@/hooks/use-academic-years"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

// Types pour les données
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  classId?: string;
  class: string;
}

interface Subject {
  id: string;
  name: string;
  coefficient: number;
}

interface Exam {
  id: string;
  name: string;
  type: "composition" | "trimestre" | "semestre" | "annuel";
  exam_date: string;
  class_id: string;
  subject_id: string;
  coefficient: number;
  max_score?: number;
  duration?: number;
  instructions?: string;
  is_active: boolean;
  academic_year: string;
  expand?: {
    class_id?: {
      id: string;
      name: string
    }
    subject_id?: {
      id: string;
      name: string;
      coefficient: number
    }
  }
}

interface Grade {
  id: string;
  student_id: string;
  exam_id: string;
  grade: number;
  remarks?: string;
  expand?: {
    student_id?: {
      id: string
      first_name: string
      last_name: string
    }
  }
}

// Composant pour créer un nouvel examen
function CreateExamModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  classes, 
  subjects,
  academicYears
}: { 
  isOpen: boolean
  onClose: () => void
  onAdd: (exam: Omit<Exam, "id" | "created" | "updated">) => Promise<void>
  classes: { id: string; name: string }[]
  subjects: { id: string; name: string; coefficient: number }[]
  academicYears: { id?: string; year: string }[]
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "composition" as "composition" | "trimestre" | "semestre" | "annuel",
    exam_date: "",
    class_id: "",
    subject_id: "",
    coefficient: 1,
    max_score: 20,
    duration: 60,
    instructions: "",
    is_active: false
  })

  const [selectedAcademicYear, setSelectedAcademicYear] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAcademicYear) {
      alert("Veuillez sélectionner une année académique")
      return
    }
    const newExam: Omit<Exam, "id" | "created" | "updated"> = {
      ...formData,
      academic_year: selectedAcademicYear
    }
    await onAdd(newExam)
    setFormData({
      name: "",
      type: "composition",
      exam_date: "",
      class_id: "",
      subject_id: "",
      coefficient: 1,
      max_score: 20,
      duration: 60,
      instructions: "",
      is_active: false
    })
    setSelectedAcademicYear("")
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
              <Select value={formData.type} onValueChange={(value: "composition" | "trimestre" | "semestre" | "annuel") => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="composition">Composition</SelectItem>
                  <SelectItem value="trimestre">Trimestre</SelectItem>
                  <SelectItem value="semestre">Semestre</SelectItem>
                  <SelectItem value="annuel">Annuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={formData.exam_date}
                onChange={(e) => setFormData({...formData, exam_date: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Classe</label>
              <Select value={formData.class_id} onValueChange={(value: string) => setFormData({...formData, class_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem: any) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </SelectItem>
                  ))}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, coefficient: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Matière</label>
            <Select value={formData.subject_id} onValueChange={(value: string) => setFormData({...formData, subject_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une matière" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject: any) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} (coef: {subject.coefficient})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Note maximale</label>
              <Input
                type="number"
                min="1"
                value={formData.max_score}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, max_score: parseInt(e.target.value)})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Durée (minutes)</label>
              <Input
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, duration: parseInt(e.target.value)})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Coefficient</label>
              <Input
                type="number"
                min="1"
                max="5"
                value={formData.coefficient}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, coefficient: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Instructions</label>
            <Input
              value={formData.instructions}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, instructions: e.target.value})}
              placeholder="Instructions pour l'examen (optionnel)"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Année académique</label>
            <Select value={selectedAcademicYear} onValueChange={(value: string) => setSelectedAcademicYear(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une année académique" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year.id || year.year} value={year.id || year.year}>
                    {year.year}
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
function GradeEntryModal({ 
  exam, 
  students, 
  grades, 
  isOpen, 
  onClose, 
  onSave, 
  isSaving 
}: { 
  exam: Exam
  students: Student[]
  grades: Grade[]
  isOpen: boolean
  onClose: () => void
  onSave: (grades: Omit<Grade, "id" | "created" | "updated">[]) => Promise<void>
  isSaving: boolean
}) {
  // Filtrer les étudiants par la classe de l'examen
  const examStudents = students.filter(student => student.classId === exam.class_id)
  
  const [gradeData, setGradeData] = useState<Grade[]>(grades || [])
  const [remarks, setRemarks] = useState<Record<string, string>>({})

  const handleGradeChange = (studentId: string, value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue < 0 || numValue > 20) return

    setGradeData((prev) => {
      const existing = prev.find(g => g.student_id === studentId)
      if (existing) {
        return prev.map(g => g.student_id === studentId ? { ...g, grade: numValue } : g)
      } else {
        return [...prev, { 
          id: Date.now().toString(), 
          student_id: studentId, 
          exam_id: exam.id, 
          grade: numValue 
        }]
      }
    })
  }

  const handleRemarksChange = (studentId: string, value: string) => {
    setRemarks((prev) => ({ ...prev, [studentId]: value }))
  }

  const handleSave = async () => {
    const gradesWithRemarks: Omit<Grade, "id" | "created" | "updated">[] = gradeData.map((grade) => ({
      ...grade,
      remarks: remarks[grade.student_id] || ""
    }))
    await onSave(gradesWithRemarks)
    onClose()
  }

  const getGradeStatus = (grade: number) => {
    if (grade >= 16) return { status: "excellent", color: "text-green-600", icon: CheckCircle }
    if (grade >= 14) return { status: "bien", color: "text-blue-600", icon: CheckCircle }
    if (grade >= 12) return { status: "assez bien", color: "text-yellow-600", icon: CheckCircle }
    if (grade >= 10) return { status: "passable", color: "text-orange-600", icon: CheckCircle }
    return { status: "insuffisant", color: "text-red-600", icon: XCircle }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[98vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Saisie des notes - {exam.name}</DialogTitle>
          <DialogDescription>
            Saisissez les notes des élèves (échelle 0-20)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <strong>Classe:</strong> {exam.expand?.class_id?.name || exam.class_id}
            </div>
            <div>
              <strong>Matière:</strong> {exam.expand?.subject_id?.name || exam.subject_id}
            </div>
            <div>
              <strong>Date:</strong> {format(new Date(exam.exam_date), "dd MMMM yyyy", { locale: fr })}
            </div>
            <div>
              <strong>Coefficient:</strong> {exam.coefficient}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Élève</TableHead>
                <TableHead className="w-[120px] text-center">Note /20</TableHead>
                <TableHead className="w-[140px] text-center">Statut</TableHead>
                <TableHead className="w-[300px]">Appréciation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {examStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="text-muted-foreground">
                      Aucun élève trouvé pour cette classe. 
                      <br />
                      <small>Classe: {exam.class_id} | Total élèves: {students.length}</small>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                examStudents.map((student) => {
                const grade = gradeData.find(g => g.student_id === student.id)
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
                        className="w-full text-center"
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
                        className="w-full"
                      />
                    </TableCell>
                  </TableRow>
                )
              })
              )}
            </TableBody>
          </Table>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Save className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? "Sauvegarde..." : "Sauvegarder les notes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ExamPage() {
  const { exams, isLoading: examsLoading, fetchExams, createExam, updateExam } = useExams()
  const { grades, createGrade, updateGrade, getExamGrades, fetchGrades } = useGrades()
  const { classes, fetchClasses } = useClasses()
  const { subjects, fetchSubjects } = useSubjects()
  const { students, fetchStudents } = useStudents()
  const { academicYears } = useAcademicYears()
  const { toast } = useToast()
  
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [isSavingGrades, setIsSavingGrades] = useState(false)
  const [examGrades, setExamGrades] = useState<Grade[]>([])

  useEffect(() => {
    fetchExams()
    fetchClasses()
    fetchSubjects()
    fetchStudents()
  }, [fetchExams, fetchClasses, fetchSubjects, fetchStudents])

  // Filtrage des examens
  const filteredExams = exams.filter(exam => {
    const matchesClass = selectedClass === "all" || exam.class_id === selectedClass
    const matchesSubject = selectedSubject === "all" || exam.subject_id === selectedSubject
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesClass && matchesSubject && matchesSearch
  })

  const handleAddExam = async (newExam: Omit<Exam, "id" | "created" | "updated">) => {
    try {
      await createExam(newExam)
      toast({
        title: "Succès",
        description: "L'examen a été créé avec succès"
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "La création de l'examen a échoué",
        variant: "destructive"
      })
    }
  }

  const handleSaveGrades = async (newGrades: Omit<Grade, "id" | "created" | "updated">[]) => {
    setIsSavingGrades(true)
    try {
      for (const grade of newGrades) {
        // Vérifier si une note existe déjà pour cet élève et cet examen
        const existingGrade = examGrades.find(g => 
          g.student_id === grade.student_id && g.exam_id === grade.exam_id
        )
        
        if (existingGrade) {
          // Mettre à jour la note existante
          await updateGrade(existingGrade.id, grade)
        } else {
          // Créer une nouvelle note
          await createGrade(grade)
        }
      }
      
      // Rafraîchir les notes pour l'examen
      const updatedGrades = await getExamGrades(selectedExam?.id || "")
      setExamGrades(updatedGrades)
      
      toast({
        title: "Succès",
        description: "Les notes ont été sauvegardées avec succès"
      })
      setShowGradeModal(false)
      setSelectedExam(null)
      setExamGrades([])
    } catch (error) {
      toast({
        title: "Erreur",
        description: "La sauvegarde des notes a échoué",
        variant: "destructive"
      })
    } finally {
      setIsSavingGrades(false)
    }
  }

  const handleToggleExamStatus = async (examId: string, currentStatus: boolean) => {
    try {
      await updateExam(examId, { is_active: !currentStatus })
      toast({
        title: "Succès",
        description: `L'examen a été ${!currentStatus ? "activé" : "désactivé"} avec succès`
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: `La ${!currentStatus ? "activation" : "désactivation"} de l'examen a échoué`,
        variant: "destructive"
      })
    }
  }

  const handleOpenGradeModal = async (exam: Exam) => {
    try {
      setSelectedExam(exam)
      
      // Charger les notes existantes pour cet examen
      const existingGrades = await getExamGrades(exam.id)
      setExamGrades(existingGrades)
      
      setShowGradeModal(true)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des notes existantes",
        variant: "destructive"
      })
    }
  }

  const handleExportGrades = async (examId: string) => {
    try {
      const examGrades = await getExamGrades(examId)
      const exam = exams.find(e => e.id === examId)
      
      // Simulation d'export Excel
      const data = examGrades.map((grade: Grade) => {
        const student = students.find(s => s.id === grade.student_id)
        return {
          "Nom": student?.lastName,
          "Prénom": student?.firstName,
          "Classe": exam?.expand?.class_id?.name,
          "Matière": exam?.expand?.subject_id?.name,
          "Note": grade.grade,
          "Appréciation": grade.remarks || ""
        }
      })
      
      console.log("Export des notes:", data)
      toast({
        title: "Export réussi",
        description: "Les données ont été préparées pour l'export"
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "L'export des notes a échoué",
        variant: "destructive"
      })
    }
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
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrer par matière" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les matières</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
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
              {examsLoading ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                  <p>Chargement des examens...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredExams.map((exam) => {
                    const examGrades = grades.filter(g => g.exam_id === exam.id)
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
                              {exam.expand?.class_id?.name || exam.class_id} • {exam.expand?.subject_id?.name || exam.subject_id} • Coef: {exam.coefficient} • {format(new Date(exam.exam_date), "dd/MM/yyyy", { locale: fr })}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={exam.type === "composition" ? "outline" : "default"}>
                                {exam.type}
                              </Badge>
                              <Badge variant={exam.is_active ? "default" : "secondary"}>
                                {exam.is_active ? "Actif" : "Inactif"}
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
                          <Button
                            size="sm"
                            variant={exam.is_active ? "secondary" : "default"}
                            onClick={() => handleToggleExamStatus(exam.id, exam.is_active)}
                          >
                            {exam.is_active ? "Désactiver" : "Activer"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenGradeModal(exam)}
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
              )}

              {filteredExams.length === 0 && !examsLoading && (
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
        classes={classes}
        subjects={subjects}
        academicYears={academicYears}
      />

      {selectedExam && (
        <GradeEntryModal
          exam={selectedExam}
          students={students}
          grades={examGrades}
          isOpen={showGradeModal}
          onClose={() => {
            setShowGradeModal(false)
            setSelectedExam(null)
            setExamGrades([])
          }}
          onSave={handleSaveGrades}
          isSaving={isSavingGrades}
        />
      )}
    </div>
  )
}