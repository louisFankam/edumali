"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { SchoolYearSelector } from "@/components/school-year-selector"
import { TeachersTable } from "@/components/teachers/teachers-table"
import { AddTeacherModal } from "@/components/teachers/add-teacher-modal"
import { TeacherDetailsModal } from "@/components/teachers/teacher-details-modal"
import { EditTeacherModal } from "@/components/teachers/edit-teacher-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Download, Users, DollarSign, Award } from "lucide-react"
import { NotificationBellMain } from "@/components/notifications/notification-bell-main"

// Mock data for teachers
const mockTeachers = [
  {
    id: 1,
    firstName: "Mamadou",
    lastName: "Keita",
    dateOfBirth: "1985-06-15",
    gender: "Masculin",
    phone: "+223 76 12 34 56",
    email: "mamadou.keita@edumali.ml",
    address: "Quartier Hippodrome, Bamako",
    school: "École Primaire de Bamako",
    subjects: ["Mathématiques", "Sciences"],
    classes: ["CM1", "CM2"],
    qualification: "Licence en Mathématiques",
    experience: "8 ans",
    salary: 150000,
    hireDate: "2016-09-01",
    status: "Actif",
    photo: "/placeholder.svg?key=teacher1",
  },
  {
    id: 2,
    firstName: "Fatoumata",
    lastName: "Traoré",
    dateOfBirth: "1990-03-22",
    gender: "Féminin",
    phone: "+223 65 98 76 54",
    email: "fatoumata.traore@edumali.ml",
    address: "Médina Coura, Bamako",
    school: "École Primaire de Bamako",
    subjects: ["Français", "Histoire-Géographie"],
    classes: ["CE1", "CE2"],
    qualification: "Master en Lettres Modernes",
    experience: "5 ans",
    salary: 180000,
    hireDate: "2019-09-01",
    status: "Actif",
    photo: "/placeholder.svg?key=teacher2",
  },
  {
    id: 3,
    firstName: "Ibrahim",
    lastName: "Coulibaly",
    dateOfBirth: "1982-11-08",
    gender: "Masculin",
    phone: "+223 78 45 67 89",
    email: "ibrahim.coulibaly@edumali.ml",
    address: "Komoguel, Bamako",
    school: "École Primaire de Bamako",
    subjects: ["Français", "Éducation Civique"],
    classes: ["CP", "CE1"],
    qualification: "École Normale Supérieure",
    experience: "12 ans",
    salary: 165000,
    hireDate: "2012-09-01",
    status: "Actif",
    photo: "/placeholder.svg?key=teacher3",
  },
  {
    id: 4,
    firstName: "Aïssata",
    lastName: "Diarra",
    dateOfBirth: "1988-12-03",
    gender: "Féminin",
    phone: "+223 69 87 54 32",
    email: "aissata.diarra@edumali.ml",
    address: "Château, Bamako",
    school: "École Primaire de Bamako",
    subjects: ["Anglais", "Éducation Physique"],
    classes: ["CM1", "CM2"],
    qualification: "Licence en Anglais",
    experience: "6 ans",
    salary: 170000,
    hireDate: "2018-09-01",
    status: "Actif",
    photo: "/placeholder.svg?key=teacher4",
  },
  {
    id: 5,
    firstName: "Seydou",
    lastName: "Sangaré",
    dateOfBirth: "1975-05-17",
    gender: "Masculin",
    phone: "+223 77 23 45 67",
    email: "seydou.sangare@edumali.ml",
    address: "Liberté, Kayes",
    school: "École Primaire de Kayes",
    subjects: ["Mathématiques", "Sciences"],
    classes: ["CM1", "CM2"],
    qualification: "École Normale Supérieure",
    experience: "20 ans",
    salary: 200000,
    hireDate: "2004-09-01",
    status: "Actif",
    photo: "/placeholder.svg?key=teacher5",
  },
]

export default function TeachersPage() {
  const [teachers, setTeachers] = useState(mockTeachers)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedSchool, setSelectedSchool] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Filter teachers based on search and filters
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjects.some((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSubject = selectedSubject === "all" || teacher.subjects.includes(selectedSubject)
    const matchesSchool = selectedSchool === "all" || teacher.school === selectedSchool
    return matchesSearch && matchesSubject && matchesSchool
  })

  const handleAddTeacher = (newTeacher) => {
    const teacher = {
      ...newTeacher,
      id: teachers.length + 1,
      hireDate: new Date().toISOString().split("T")[0],
      status: "Actif",
    }
    setTeachers([...teachers, teacher])
  }

  const handleEditTeacher = (updatedTeacher) => {
    setTeachers(teachers.map((teacher) => (teacher.id === updatedTeacher.id ? updatedTeacher : teacher)))
  }

  const handleDeleteTeacher = (teacherId) => {
    setTeachers(teachers.filter((teacher) => teacher.id !== teacherId))
  }

  const handleViewDetails = (teacher) => {
    setSelectedTeacher(teacher)
    setIsDetailsModalOpen(true)
  }

  const handleEditClick = (teacher) => {
    setSelectedTeacher(teacher)
    setIsEditModalOpen(true)
  }

  // Calculate statistics
  const averageSalary = Math.round(teachers.reduce((sum, teacher) => sum + teacher.salary, 0) / teachers.length)
  const averageExperience = Math.round(
    teachers.reduce((sum, teacher) => sum + Number.parseInt(teacher.experience), 0) / teachers.length,
  )

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader title="Gestion des Professeurs" description="Gérer le personnel enseignant et administratif">
            <div className="flex items-center space-x-2">
              <NotificationBellMain />
              <SchoolYearSelector />
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau professeur
              </Button>
            </div>
          </PageHeader>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Professeurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">{teachers.length}</div>
                <p className="text-xs text-muted-foreground">Personnel actif</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Salaire moyen</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">{averageSalary.toLocaleString()} F</div>
                <p className="text-xs text-muted-foreground">Par mois</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expérience moyenne</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">{averageExperience} ans</div>
                <p className="text-xs text-muted-foreground">D'enseignement</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Femmes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">
                  {teachers.filter((t) => t.gender === "Féminin").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((teachers.filter((t) => t.gender === "Féminin").length / teachers.length) * 100)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Rechercher et filtrer</CardTitle>
              <CardDescription>Trouvez rapidement les professeurs que vous cherchez</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Rechercher par nom ou matière..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrer par matière" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les matières</SelectItem>
                    <SelectItem value="Mathématiques">Mathématiques</SelectItem>
                    <SelectItem value="Français">Français</SelectItem>
                    <SelectItem value="Sciences">Sciences</SelectItem>
                    <SelectItem value="Histoire-Géographie">Histoire-Géographie</SelectItem>
                    <SelectItem value="Anglais">Anglais</SelectItem>
                    <SelectItem value="Éducation Physique">Éducation Physique</SelectItem>
                    <SelectItem value="Éducation Civique">Éducation Civique</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrer par école" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les écoles</SelectItem>
                    <SelectItem value="École Primaire de Bamako">École Primaire de Bamako</SelectItem>
                    <SelectItem value="Collège de Sikasso">Collège de Sikasso</SelectItem>
                    <SelectItem value="École Primaire de Mopti">École Primaire de Mopti</SelectItem>
                    <SelectItem value="Collège de Gao">Collège de Gao</SelectItem>
                    <SelectItem value="École Primaire de Kayes">École Primaire de Kayes</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Teachers Table */}
          <TeachersTable
            teachers={filteredTeachers}
            onViewDetails={handleViewDetails}
            onEdit={handleEditClick}
            onDelete={handleDeleteTeacher}
          />

          {/* Modals */}
          <AddTeacherModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddTeacher} />

          <TeacherDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            teacher={selectedTeacher}
          />

          <EditTeacherModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            teacher={selectedTeacher}
            onEdit={handleEditTeacher}
          />
        </div>
      </main>
    </div>
  )
}
