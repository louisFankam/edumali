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
  FileText,
  Download,
  Eye,
  Search,
  Users,
  BookOpen,
  Star,
  CheckCircle,
  AlertCircle,
  Printer,
  Settings
} from "lucide-react"
import { documentGenerator } from "@/lib/document-generator"

// Types pour les données
interface Student {
  id: number;
  firstName: string;
  lastName: string;
  class: string;
  dateOfBirth: string;
  enrollmentDate: string;
}

interface Subject {
  id: number;
  name: string;
  coefficient: number;
}

interface Grade {
  id: number;
  studentId: number;
  examId: number;
  grade: number;
  remarks?: string;
}

interface Exam {
  id: number;
  name: string;
  type: "composition" | "trimestre";
  date: string;
  class: string;
  subject: string;
  coefficient: number;
}

interface ReportCard {
  id: number;
  studentId: number;
  class: string;
  trimester: number;
  schoolYear: string;
  subjects: {
    name: string;
    coefficient: number;
    average: number;
    rank: number;
    remarks: string;
  }[];
  generalAverage: number;
  generalRank: number;
  generalMention: string;
  generalRemarks: string;
  date: string;
}

// Mock data
const mockStudents: Student[] = [
  { id: 1, firstName: "Aminata", lastName: "Traoré", class: "CM2", dateOfBirth: "2010-03-15", enrollmentDate: "2024-09-01" },
  { id: 2, firstName: "Ibrahim", lastName: "Keita", class: "CM2", dateOfBirth: "2009-07-22", enrollmentDate: "2024-09-01" },
  { id: 3, firstName: "Mariam", lastName: "Coulibaly", class: "CM2", dateOfBirth: "2011-11-08", enrollmentDate: "2024-09-01" },
  { id: 4, firstName: "Ousmane", lastName: "Diarra", class: "CM2", dateOfBirth: "2008-12-03", enrollmentDate: "2024-09-01" },
  { id: 5, firstName: "Kadiatou", lastName: "Sangaré", class: "CM2", dateOfBirth: "2010-05-17", enrollmentDate: "2024-09-01" },
]

const mockSubjects: Subject[] = [
  { id: 1, name: "Mathématiques", coefficient: 3 },
  { id: 2, name: "Français", coefficient: 3 },
  { id: 3, name: "Sciences", coefficient: 2 },
  { id: 4, name: "Histoire-Géographie", coefficient: 2 },
  { id: 5, name: "Anglais", coefficient: 1 },
]

const mockExams: Exam[] = [
  { id: 1, name: "Composition 1 - Mathématiques", type: "composition", date: "2024-12-15", class: "CM2", subject: "Mathématiques", coefficient: 1 },
  { id: 2, name: "Composition 1 - Français", type: "composition", date: "2024-12-16", class: "CM2", subject: "Français", coefficient: 1 },
  { id: 3, name: "Composition 2 - Mathématiques", type: "composition", date: "2025-01-20", class: "CM2", subject: "Mathématiques", coefficient: 1 },
  { id: 4, name: "Composition 2 - Français", type: "composition", date: "2025-01-21", class: "CM2", subject: "Français", coefficient: 1 },
  { id: 5, name: "1er Trimestre - Mathématiques", type: "trimestre", date: "2025-02-15", class: "CM2", subject: "Mathématiques", coefficient: 2 },
  { id: 6, name: "1er Trimestre - Français", type: "trimestre", date: "2025-02-16", class: "CM2", subject: "Français", coefficient: 2 },
]

const mockGrades: Grade[] = [
  // Composition 1 - Mathématiques
  { id: 1, studentId: 1, examId: 1, grade: 15, remarks: "Bon travail" },
  { id: 2, studentId: 2, examId: 1, grade: 12, remarks: "Peut mieux faire" },
  { id: 3, studentId: 3, examId: 1, grade: 18, remarks: "Excellent" },
  { id: 4, studentId: 4, examId: 1, grade: 8, remarks: "Doit réviser" },
  { id: 5, studentId: 5, examId: 1, grade: 14, remarks: "Satisfaisant" },
  
  // Composition 1 - Français
  { id: 6, studentId: 1, examId: 2, grade: 16, remarks: "Très bien" },
  { id: 7, studentId: 2, examId: 2, grade: 13, remarks: "Bien" },
  { id: 8, studentId: 3, examId: 2, grade: 17, remarks: "Excellent" },
  { id: 9, studentId: 4, examId: 2, grade: 9, remarks: "Moyen" },
  { id: 10, studentId: 5, examId: 2, grade: 15, remarks: "Bon travail" },
  
  // Composition 2 - Mathématiques
  { id: 11, studentId: 1, examId: 3, grade: 14, remarks: "Bon" },
  { id: 12, studentId: 2, examId: 3, grade: 11, remarks: "Assez bien" },
  { id: 13, studentId: 3, examId: 3, grade: 19, remarks: "Excellent" },
  { id: 14, studentId: 4, examId: 3, grade: 7, remarks: "Insuffisant" },
  { id: 15, studentId: 5, examId: 3, grade: 13, remarks: "Bien" },
  
  // Composition 2 - Français
  { id: 16, studentId: 1, examId: 4, grade: 15, remarks: "Bon travail" },
  { id: 17, studentId: 2, examId: 4, grade: 12, remarks: "Assez bien" },
  { id: 18, studentId: 3, examId: 4, grade: 16, remarks: "Très bien" },
  { id: 19, studentId: 4, examId: 4, grade: 10, remarks: "Passable" },
  { id: 20, studentId: 5, examId: 4, grade: 14, remarks: "Bon" },
]

const mockReportCards: ReportCard[] = [
  {
    id: 1,
    studentId: 1,
    class: "CM2",
    trimester: 1,
    schoolYear: "2024-2025",
    subjects: [
      { name: "Mathématiques", coefficient: 3, average: 14.5, rank: 2, remarks: "Bon niveau, continuez ainsi" },
      { name: "Français", coefficient: 3, average: 15.5, rank: 1, remarks: "Excellent travail" },
      { name: "Sciences", coefficient: 2, average: 13.0, rank: 3, remarks: "Peut mieux faire" },
      { name: "Histoire-Géographie", coefficient: 2, average: 14.0, rank: 2, remarks: "Bon travail" },
      { name: "Anglais", coefficient: 1, average: 15.0, rank: 1, remarks: "Très bien" },
    ],
    generalAverage: 14.6,
    generalRank: 1,
    generalMention: "Bien",
    generalRemarks: "Élève sérieux et travailleur. Continue dans cette voie.",
    date: "2025-02-20"
  },
  {
    id: 2,
    studentId: 2,
    class: "CM2",
    trimester: 1,
    schoolYear: "2024-2025",
    subjects: [
      { name: "Mathématiques", coefficient: 3, average: 11.5, rank: 4, remarks: "Doit s'améliorer" },
      { name: "Français", coefficient: 3, average: 12.5, rank: 3, remarks: "Assez bien" },
      { name: "Sciences", coefficient: 2, average: 12.0, rank: 4, remarks: "Moyen" },
      { name: "Histoire-Géographie", coefficient: 2, average: 13.0, rank: 3, remarks: "Bon" },
      { name: "Anglais", coefficient: 1, average: 13.0, rank: 2, remarks: "Bien" },
    ],
    generalAverage: 12.3,
    generalRank: 4,
    generalMention: "Passable",
    generalRemarks: "Doit fournir plus d'efforts pour progresser.",
    date: "2025-02-20"
  }
]

// Fonction pour calculer les moyennes et mentions
function calculateAverages(studentId: number, trimester: number) {
  const studentGrades = mockGrades.filter(g => g.studentId === studentId)
  const trimesterExams = mockExams.filter(e => e.type === "trimestre" || (e.type === "composition" && e.date.includes(trimester === 1 ? "2024-12" : trimester === 2 ? "2025-01" : "2025-02")))
  
  const subjectAverages = mockSubjects.map(subject => {
    const subjectGrades = studentGrades.filter(g => {
      const exam = mockExams.find(e => e.id === g.examId)
      return exam?.subject === subject.name && trimesterExams.some(te => te.id === g.examId)
    })
    
    if (subjectGrades.length === 0) return null
    
    const average = subjectGrades.reduce((sum, g) => sum + g.grade, 0) / subjectGrades.length
    return {
      name: subject.name,
      coefficient: subject.coefficient,
      average: Math.round(average * 10) / 10,
      remarks: subjectGrades[subjectGrades.length - 1]?.remarks || ""
    }
  }).filter(Boolean)
  
  const totalCoefficient = subjectAverages.reduce((sum, s) => sum + s.coefficient, 0)
  const generalAverage = totalCoefficient > 0 
    ? Math.round((subjectAverages.reduce((sum, s) => sum + (s.average * s.coefficient), 0) / totalCoefficient) * 10) / 10
    : 0
  
  const getMention = (average: number) => {
    if (average >= 16) return "Très Bien"
    if (average >= 14) return "Bien"
    if (average >= 12) return "Assez Bien"
    if (average >= 10) return "Passable"
    return "Insuffisant"
  }
  
  return {
    subjects: subjectAverages,
    generalAverage,
    generalMention: getMention(generalAverage)
  }
}

// Composant pour prévisualiser un bulletin
function ReportCardPreview({ reportCard, student, isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prévisualisation du bulletin</DialogTitle>
          <DialogDescription>
            Bulletin de {student.firstName} {student.lastName} - {reportCard.class}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* En-tête du bulletin */}
          <div className="text-center border-b pb-4">
            <h2 className="text-2xl font-bold">BULLETIN SCOLAIRE</h2>
            <p className="text-lg">Année scolaire {reportCard.schoolYear}</p>
            <p className="text-md">{reportCard.trimester}er Trimestre</p>
          </div>

          {/* Informations de l'élève */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p><strong>Nom et Prénom:</strong> {student.lastName} {student.firstName}</p>
              <p><strong>Classe:</strong> {reportCard.class}</p>
              <p><strong>Date de naissance:</strong> {student.dateOfBirth}</p>
            </div>
            <div>
              <p><strong>Année scolaire:</strong> {reportCard.schoolYear}</p>
              <p><strong>Trimestre:</strong> {reportCard.trimester}er</p>
              <p><strong>Date:</strong> {reportCard.date}</p>
            </div>
          </div>

          {/* Notes par matière */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Notes par matière</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matière</TableHead>
                  <TableHead>Coefficient</TableHead>
                  <TableHead>Moyenne</TableHead>
                  <TableHead>Rang</TableHead>
                  <TableHead>Appréciation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportCard.subjects.map((subject, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>{subject.coefficient}</TableCell>
                    <TableCell>
                      <Badge variant={subject.average >= 10 ? "default" : "destructive"}>
                        {subject.average}/20
                      </Badge>
                    </TableCell>
                    <TableCell>{subject.rank}</TableCell>
                    <TableCell className="max-w-xs">{subject.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Moyenne générale */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{reportCard.generalAverage}/20</div>
              <div className="text-sm text-muted-foreground">Moyenne générale</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{reportCard.generalRank}</div>
              <div className="text-sm text-muted-foreground">Rang</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{reportCard.generalMention}</div>
              <div className="text-sm text-muted-foreground">Mention</div>
            </div>
          </div>

          {/* Appréciation générale */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Appréciation générale</h3>
            <p className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
              {reportCard.generalRemarks}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Composant pour les paramètres du bulletin
function BulletinSettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    schoolName: "École Primaire de Bamako",
    schoolAddress: "Quartier Hippodrome, Bamako, Mali",
    directorName: "Mamadou Traoré",
    includeRank: true,
    includeRemarks: true,
    autoMentions: true,
    template: "default"
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Paramètres des bulletins</DialogTitle>
          <DialogDescription>
            Personnalisez l'apparence et le contenu des bulletins
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nom de l'école</label>
              <Input
                value={settings.schoolName}
                onChange={(e) => setSettings({...settings, schoolName: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Adresse</label>
              <Input
                value={settings.schoolAddress}
                onChange={(e) => setSettings({...settings, schoolAddress: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Nom du directeur</label>
            <Input
              value={settings.directorName}
              onChange={(e) => setSettings({...settings, directorName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeRank"
                checked={settings.includeRank}
                onChange={(e) => setSettings({...settings, includeRank: e.target.checked})}
              />
              <label htmlFor="includeRank" className="text-sm">Inclure les rangs</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeRemarks"
                checked={settings.includeRemarks}
                onChange={(e) => setSettings({...settings, includeRemarks: e.target.checked})}
              />
              <label htmlFor="includeRemarks" className="text-sm">Inclure les appréciations</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoMentions"
                checked={settings.autoMentions}
                onChange={(e) => setSettings({...settings, autoMentions: e.target.checked})}
              />
              <label htmlFor="autoMentions" className="text-sm">Mentions automatiques</label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Template</label>
            <Select value={settings.template} onValueChange={(value) => setSettings({...settings, template: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Template par défaut</SelectItem>
                <SelectItem value="modern">Template moderne</SelectItem>
                <SelectItem value="classic">Template classique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={onClose}>
              <Settings className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function BulletinPage() {
  const [selectedClass, setSelectedClass] = useState("CM2")
  const [selectedTrimester, setSelectedTrimester] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReportCard, setSelectedReportCard] = useState(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // Générer les bulletins pour la classe et trimestre sélectionnés
  const generateReportCards = () => {
    return mockStudents
      .filter(student => student.class === selectedClass)
      .map(student => {
        const averages = calculateAverages(student.id, selectedTrimester)
        return {
          id: Date.now() + student.id,
          studentId: student.id,
          class: selectedClass,
          trimester: selectedTrimester,
          schoolYear: "2024-2025",
          subjects: averages.subjects,
          generalAverage: averages.generalAverage,
          generalRank: Math.floor(Math.random() * 5) + 1, // Simulation du rang
          generalMention: averages.generalMention,
          generalRemarks: "Appréciation générale générée automatiquement.",
          date: new Date().toISOString().split('T')[0]
        }
      })
  }

  const reportCards = generateReportCards()

  const handleGenerateBulletins = async () => {
    try {
      const designConfig = {
        template: 'modern',
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        accentColor: '#f59e0b'
      }

      for (const reportCard of reportCards) {
        const student = mockStudents.find(s => s.id === reportCard.studentId)
        if (student) {
          await documentGenerator.generateBulletin(student, reportCard, designConfig)
        }
      }
      
      alert("Bulletins générés avec succès!")
    } catch (error) {
      console.error("Erreur lors de la génération des bulletins:", error)
      alert("Erreur lors de la génération des bulletins")
    }
  }

  const handleExportAll = async () => {
    try {
      const designConfig = {
        template: 'modern',
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        accentColor: '#f59e0b'
      }

      for (const reportCard of reportCards) {
        const student = mockStudents.find(s => s.id === reportCard.studentId)
        if (student) {
          await documentGenerator.generateBulletin(student, reportCard, designConfig)
        }
      }
      
      alert("Export PDF de tous les bulletins généré!")
    } catch (error) {
      console.error("Erreur lors de l'export des bulletins:", error)
      alert("Erreur lors de l'export des bulletins")
    }
  }

  const handlePreviewBulletin = (reportCard) => {
    const student = mockStudents.find(s => s.id === reportCard.studentId)
    setSelectedReportCard({ ...reportCard, student })
    setShowPreviewModal(true)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader
            title="Génération des Bulletins"
            description="Générer automatiquement les bulletins à partir des notes des examens"
          >
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowSettingsModal(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
              <Button onClick={handleGenerateBulletins}>
                <FileText className="h-4 w-4 mr-2" />
                Générer bulletins
              </Button>
            </div>
          </PageHeader>

          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de génération</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Rechercher un élève..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Sélectionner une classe" />
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
                <Select value={selectedTrimester.toString()} onValueChange={(value) => setSelectedTrimester(parseInt(value))}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Sélectionner un trimestre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1er Trimestre</SelectItem>
                    <SelectItem value="2">2ème Trimestre</SelectItem>
                    <SelectItem value="3">3ème Trimestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Élèves</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportCards.length}</div>
                <p className="text-xs text-muted-foreground">Dans la classe</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Matières</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockSubjects.length}</div>
                <p className="text-xs text-muted-foreground">Évaluées</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Moyenne classe</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportCards.length > 0 
                    ? Math.round((reportCards.reduce((sum, rc) => sum + rc.generalAverage, 0) / reportCards.length) * 10) / 10
                    : 0
                  }/20
                </div>
                <p className="text-xs text-muted-foreground">Générale</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de réussite</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportCards.length > 0 
                    ? Math.round((reportCards.filter(rc => rc.generalAverage >= 10).length / reportCards.length) * 100)
                    : 0
                  }%
                </div>
                <p className="text-xs text-muted-foreground">Moyenne ≥ 10</p>
              </CardContent>
            </Card>
          </div>

          {/* Liste des bulletins */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bulletins générés</CardTitle>
                  <CardDescription>
                    {selectedClass} - {selectedTrimester}er Trimestre - {reportCards.length} élèves
                  </CardDescription>
                </div>
                <Button onClick={handleExportAll}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter tous
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportCards
                  .filter(rc => {
                    const student = mockStudents.find(s => s.id === rc.studentId)
                    return student && `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
                  })
                  .map((reportCard) => {
                    const student = mockStudents.find(s => s.id === reportCard.studentId)
                    if (!student) return null
                    
                    return (
                      <div key={reportCard.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">{student.firstName} {student.lastName}</div>
                            <div className="text-sm text-muted-foreground">
                              {reportCard.class} • {reportCard.trimester}er Trimestre
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={reportCard.generalAverage >= 10 ? "default" : "destructive"}>
                                {reportCard.generalAverage}/20
                              </Badge>
                              <Badge variant="outline">
                                Rang {reportCard.generalRank}
                              </Badge>
                              <Badge variant="secondary">
                                {reportCard.generalMention}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreviewBulletin(reportCard)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Prévisualiser
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    )
                  })}
              </div>

              {reportCards.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun bulletin généré pour les critères sélectionnés.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      {selectedReportCard && (
        <ReportCardPreview
          reportCard={selectedReportCard}
          student={selectedReportCard.student}
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      <BulletinSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  )
}





