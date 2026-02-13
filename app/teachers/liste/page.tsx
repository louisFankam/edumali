"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { TeachersTable } from "@/components/teachers/teachers-table"
import { AddTeacherModal } from "@/components/teachers/add-teacher-modal"
import { TeacherDetailsModal } from "@/components/teachers/teacher-details-modal"
import { EditTeacherModal } from "@/components/teachers/edit-teacher-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Download, Users, User } from "lucide-react"
import { NotificationBellMain } from "@/components/notifications/notification-bell-main"
import { useTeachers } from "@/hooks/use-teachers"
import { useSubjects } from "@/hooks/use-subjects"

interface Teacher {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  address: string
  hire_date: string
  salary: number
  status: "active" | "inactive" | "on_leave"
  photo: string
  user_id: string
  gender: "Masculin" | "Feminin"
  contrat: "horaire" | "mensuel"
  speciality: string[]
  speciality_names: string[]
  created: string
  updated: string
}

export default function TeachersPage() {
  const { teachers, isLoading, error, fetchTeachers, createTeacher, updateTeacher, deleteTeacher } = useTeachers()
  const { subjects, fetchSubjects } = useSubjects()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    fetchTeachers()
    fetchSubjects()
  }, [fetchTeachers, fetchSubjects])

  // Filter teachers based on search and filters
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.speciality_names.some((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSubject = selectedSubject === "all" || teacher.speciality.includes(selectedSubject)
    const matchesStatus = selectedStatus === "all" || teacher.status === selectedStatus
    return matchesSearch && matchesSubject && matchesStatus
  })

  const handleAddTeacher = async (newTeacher: Omit<Teacher, "id" | "created" | "updated" | "full_name" | "speciality_names">) => {
    try {
      await createTeacher(newTeacher)
      setIsAddModalOpen(false)
    } catch (error) {
      console.error('Erreur lors de l\'ajout du professeur:', error)
    }
  }

  const handleEditTeacher = async (updatedTeacher: Partial<Teacher>) => {
    if (!selectedTeacher) return
    try {
      await updateTeacher(selectedTeacher.id, updatedTeacher)
      setIsEditModalOpen(false)
      setSelectedTeacher(null)
    } catch (error) {
      console.error('Erreur lors de la modification du professeur:', error)
    }
  }

  const handleDeleteTeacher = async (teacherId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce professeur ?')) {
      try {
        await deleteTeacher(teacherId)
      } catch (error) {
        console.error('Erreur lors de la suppression du professeur:', error)
      }
    }
  }

  const handleViewDetails = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setIsDetailsModalOpen(true)
  }

  const handleEditClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setIsEditModalOpen(true)
  }

  // Calculate statistics
  const maleTeachers = teachers.filter(t => t.gender === "Masculin").length
  const femaleTeachers = teachers.filter(t => t.gender === "Feminin").length
  const activeTeachers = teachers.filter(t => t.status === "active").length
  const onLeaveTeachers = teachers.filter(t => t.status === "on_leave").length

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader title="Gestion des Professeurs" description="Gérer le personnel enseignant et administratif" className="">
            <div className="flex items-center space-x-2">
              <NotificationBellMain />
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
                <p className="text-xs text-muted-foreground">
                  {activeTeachers} actifs
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hommes</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">{maleTeachers}</div>
                <p className="text-xs text-muted-foreground">
                  {teachers.length > 0 ? Math.round((maleTeachers / teachers.length) * 100) : 0}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Femmes</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">{femaleTeachers}</div>
                <p className="text-xs text-muted-foreground">
                  {teachers.length > 0 ? Math.round((femaleTeachers / teachers.length) * 100) : 0}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En congé</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">{onLeaveTeachers}</div>
                <p className="text-xs text-muted-foreground">
                  {teachers.length > 0 ? Math.round((onLeaveTeachers / teachers.length) * 100) : 0}%
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
                      placeholder="Rechercher par nom ou spécialité..."
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
                    <SelectItem value="all">Toutes les spécialités</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="on_leave">En congé</SelectItem>
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
            isLoading={isLoading}
            error={error}
            onViewDetails={handleViewDetails}
            onEdit={handleEditClick}
            onDelete={handleDeleteTeacher}
          />

          {/* Modals */}
          <AddTeacherModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            onAdd={handleAddTeacher}
            subjects={subjects}
          />

          <TeacherDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => {
              setIsDetailsModalOpen(false)
              setSelectedTeacher(null)
            }}
            teacher={selectedTeacher}
          />

          <EditTeacherModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false)
              setSelectedTeacher(null)
            }}
            teacher={selectedTeacher}
            onEdit={handleEditTeacher}
            subjects={subjects}
          />
        </div>
      </main>
    </div>
  )
}