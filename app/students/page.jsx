"use client"

import { useState, useEffect } from "react"
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
import { Plus, Search, Download, Users, Loader2, RefreshCw } from "lucide-react"
import { NotificationBellMain } from "@/components/notifications/notification-bell-main"
import { useStudents } from "@/hooks/use-students"

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { 
    students, 
    classes, 
    isLoading, 
    error, 
    newRegistrations,
    fetchStudents, 
    createStudent, 
    updateStudent, 
    deleteStudent 
  } = useStudents()

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  // Filter students based on search and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = selectedClass === "all" || student.class === selectedClass
    return matchesSearch && matchesClass
  })

  const handleAddStudent = async (newStudent) => {
    try {
      await createStudent(newStudent)
      setIsAddModalOpen(false)
    } catch (err) {
      console.error('Erreur lors de l\'ajout:', err)
    }
  }

  const handleEditStudent = async (updatedStudent) => {
    try {
      await updateStudent(updatedStudent.id, updatedStudent)
      setIsEditModalOpen(false)
    } catch (err) {
      console.error('Erreur lors de la modification:', err)
    }
  }

  const handleDeleteStudent = async (studentId, classId) => {
    try {
      await deleteStudent(studentId, classId)
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
    }
  }

  const handleViewDetails = (student) => {
    setSelectedStudent(student)
    setIsDetailsModalOpen(true)
  }

  const handleEditClick = (student) => {
    setSelectedStudent(student)
    setIsEditModalOpen(true)
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 md:ml-64 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6 text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchStudents}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
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
              <Button onClick={() => setIsAddModalOpen(true)} disabled={isLoading}>
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
                <div className="text-2xl font-serif font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : students.length}
                </div>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nouvelles inscriptions</CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : newRegistrations}
                </div>
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
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                    students.filter((s) => s.gender === "Féminin").length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "-" : 
                    Math.round((students.filter((s) => s.gender === "Féminin").length / students.length) * 100)
                  }%
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
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                    students.filter((s) => s.gender === "Masculin").length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "-" : 
                    Math.round((students.filter((s) => s.gender === "Masculin").length / students.length) * 100)
                  }%
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
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isLoading}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrer par classe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les classes</SelectItem>
                    {classes.map((classe) => (
                      <SelectItem key={classe.id} value={classe.name}>
                        {classe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" className="bg-transparent" disabled={isLoading}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          {isLoading ? (
            <Card>
              <CardContent className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </CardContent>
            </Card>
          ) : (
            <StudentsTable
              students={filteredStudents}
              onViewDetails={handleViewDetails}
              onEdit={handleEditClick}
              onDelete={handleDeleteStudent}
              isLoading={isLoading}
            />
          )}

          {/* Modals */}
          <AddStudentModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            onAdd={handleAddStudent} 
            classes={classes} 
          />

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
        </div>
      </main>
    </div>
  )
}