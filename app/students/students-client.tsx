// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { SchoolYearSelector } from "@/components/school-year-selector"
import { StudentsTable } from "@/components/students/students-table"
import { AddStudentModal } from "@/components/students/add-student-modal"
import { StudentDetailsModal } from "@/components/students/student-details-modal"
import { EditStudentModal } from "@/components/students/edit-student-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Download, Users } from "lucide-react"
import { NotificationBellMain } from "@/components/notifications/notification-bell-main"
import { Student, Class } from "@/types/student"

// Données en dur intégrées pour éviter les dépendances externes
const INITIAL_CLASSES: Class[] = [
  { id: "1", name: "1ère Année" },
  { id: "2", name: "2ème Année" },
  { id: "3", name: "3ème Année" },
]

const INITIAL_STUDENTS: Student[] = [
  {
    id: "stud_1",
    firstName: "Amadou",
    lastName: "Diallo",
    gender: "Masculin",
    birthDate: "2015-05-12",
    parentName: "Moussa Diallo",
    parentPhone: "70123456",
    classId: "1",
    className: "1ère Année",
    registrationDate: "2023-09-01",
    status: "Actif",
  },
  {
    id: "stud_2",
    firstName: "Fatoumata",
    lastName: "Traoré",
    gender: "Féminin",
    birthDate: "2015-08-22",
    parentName: "Oumar Traoré",
    parentPhone: "66123456",
    classId: "1",
    className: "1ère Année",
    registrationDate: "2023-09-05",
    status: "Actif",
  }
]

export function StudentsClient() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS)
  const [classes] = useState<Class[]>(INITIAL_CLASSES)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClassId, setSelectedClassId] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesClass = selectedClassId === "all" || student.classId === selectedClassId
      return matchesSearch && matchesClass
    })
  }, [students, searchTerm, selectedClassId])

  const stats = useMemo(() => {
    const total = students.length
    const girls = students.filter(s => s.gender === "Féminin").length
    const boys = students.filter(s => s.gender === "Masculin").length
    
    return {
      total,
      girls,
      boys,
      girlsPercentage: total > 0 ? Math.round((girls / total) * 100) : 0,
      boysPercentage: total > 0 ? Math.round((boys / total) * 100) : 0,
    }
  }, [students])

  const handleAddStudent = async (newStudent: any) => {
    const id = `stud_${Date.now()}`
    const studentWithId = { ...newStudent, id }
    setStudents([...students, studentWithId])
    setIsAddModalOpen(false)
  }

  const handleEditStudent = async (updatedStudent: Student) => {
    setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s))
    setIsEditModalOpen(false)
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élève ?")) {
      setStudents(students.filter(s => s.id !== studentId))
    }
  }

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student)
    setIsDetailsModalOpen(true)
  }

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student)
    setIsEditModalOpen(true)
  }

  return (
    <AppLayout>
          <PageHeader title="Gestion des Élèves" description="Gérer les inscriptions et profils des élèves">
            <div className="flex items-center space-x-2">
              <NotificationBellMain />
              <SchoolYearSelector />
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel élève
              </Button>
            </div>
          </PageHeader>

          <div className="grid gap-4 md:grid-cols-4">
            <StatCard title="Total Élèves" value={stats.total} subtext="Total" icon={Users} />
            <StatCard title="Filles" value={stats.girls} subtext={`${stats.girlsPercentage}%`} icon={Users} />
            <StatCard title="Garçons" value={stats.boys} subtext={`${stats.boysPercentage}%`} icon={Users} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rechercher et filtrer</CardTitle>
              <CardDescription>Trouvez rapidement les élèves que vous cherchez</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Rechercher par nom d'élève ou parent..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrer par classe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les classes</SelectItem>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" className="bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardContent>
          </Card>

          <StudentsTable
            students={filteredStudents}
            onViewDetails={handleViewDetails}
            onEdit={handleEditClick}
            onDelete={handleDeleteStudent}
          />

          <AddStudentModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            onAdd={handleAddStudent} 
            classes={classes} 
          />

          {selectedStudent && (
            <>
              <StudentDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                student={selectedStudent}
              />

              <EditStudentModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                student={selectedStudent}
                onEdit={handleEditStudent}
                classes={classes}
              />
            </>
          )}
        </AppLayout>
  )
}

function StatCard({ title, value, subtext, icon: Icon }: { title: string, value: number, subtext: string, icon: any }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-serif font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </CardContent>
    </Card>
  )
}
