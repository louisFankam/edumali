"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
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

// Mock data for students
const mockStudents = [
  {
    id: 1,
    firstName: "Aminata",
    lastName: "Traoré",
    dateOfBirth: "2010-03-15",
    gender: "Féminin",
    class: "CM2",
    school: "École Primaire de Bamako",
    parentName: "Mamadou Traoré",
    parentPhone: "+223 76 12 34 56",
    address: "Quartier Hippodrome, Bamako",
    enrollmentDate: "2024-09-01",
    status: "Actif",
    photo: "/diverse-student-girl.png",
  },
  {
    id: 2,
    firstName: "Ibrahim",
    lastName: "Keita",
    dateOfBirth: "2009-07-22",
    gender: "Masculin",
    class: "CM1",
    school: "École Primaire de Bamako",
    parentName: "Fatoumata Keita",
    parentPhone: "+223 65 98 76 54",
    address: "Médina Coura, Bamako",
    enrollmentDate: "2024-09-01",
    status: "Actif",
    photo: "/student-boy.png",
  },
  {
    id: 3,
    firstName: "Mariam",
    lastName: "Coulibaly",
    dateOfBirth: "2011-11-08",
    gender: "Féminin",
    class: "CE2",
    school: "École Primaire de Bamako",
    parentName: "Seydou Coulibaly",
    parentPhone: "+223 78 45 67 89",
    address: "Komoguel, Bamako",
    enrollmentDate: "2024-09-01",
    status: "Actif",
    photo: "/diverse-student-girl.png",
  },
  {
    id: 4,
    firstName: "Ousmane",
    lastName: "Diarra",
    dateOfBirth: "2008-12-03",
    gender: "Masculin",
    class: "CE1",
    school: "École Primaire de Bamako",
    parentName: "Aïssata Diarra",
    parentPhone: "+223 69 87 54 32",
    address: "Château, Bamako",
    enrollmentDate: "2024-09-01",
    status: "Actif",
    photo: "/student-boy.png",
  },
  {
    id: 5,
    firstName: "Kadiatou",
    lastName: "Sangaré",
    dateOfBirth: "2010-05-17",
    gender: "Féminin",
    class: "CP",
    school: "École Primaire de Bamako",
    parentName: "Bakary Sangaré",
    parentPhone: "+223 77 23 45 67",
    address: "Liberté, Bamako",
    enrollmentDate: "2024-09-01",
    status: "Actif",
    photo: "/diverse-student-girl.png",
  },
]

export default function StudentsPage() {
  const [students, setStudents] = useState(mockStudents)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Filter students based on search and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = selectedClass === "all" || student.class === selectedClass
    return matchesSearch && matchesClass
  })

  const handleAddStudent = (newStudent) => {
    const student = {
      ...newStudent,
      id: students.length + 1,
      enrollmentDate: new Date().toISOString().split("T")[0],
      status: "Actif",
    }
    setStudents([...students, student])
  }

  const handleEditStudent = (updatedStudent) => {
    setStudents(students.map((student) => (student.id === updatedStudent.id ? updatedStudent : student)))
  }

  const handleDeleteStudent = (studentId) => {
    setStudents(students.filter((student) => student.id !== studentId))
  }

  const handleViewDetails = (student) => {
    setSelectedStudent(student)
    setIsDetailsModalOpen(true)
  }

  const handleEditClick = (student) => {
    setSelectedStudent(student)
    setIsEditModalOpen(true)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
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

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Élèves</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">{students.length}</div>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nouvelles inscriptions</CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">47</div>
                <p className="text-xs text-muted-foreground">Ce mois-ci</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Filles</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">
                  {students.filter((s) => s.gender === "Féminin").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((students.filter((s) => s.gender === "Féminin").length / students.length) * 100)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Garçons</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">
                  {students.filter((s) => s.gender === "Masculin").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((students.filter((s) => s.gender === "Masculin").length / students.length) * 100)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
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

                <Button variant="outline" className="bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <StudentsTable
            students={filteredStudents}
            onViewDetails={handleViewDetails}
            onEdit={handleEditClick}
            onDelete={handleDeleteStudent}
          />

          {/* Modals */}
          <AddStudentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddStudent} />

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
          />
        </div>
      </main>
    </div>
  )
}
