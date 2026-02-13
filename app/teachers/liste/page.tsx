"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Download, Users, User } from "lucide-react"
import { TeachersTable } from "@/components/teachers/teachers-table"
import { AddTeacherModal } from "@/components/teachers/add-teacher-modal"
import { TeacherDetailsModal } from "@/components/teachers/teacher-details-modal"
import { EditTeacherModal } from "@/components/teachers/edit-teacher-modal"
import { useTeachers } from "@/hooks/use-teachers"
import { useSubjects } from "@/hooks/use-subjects"
import { NotificationBellMain } from "@/components/notifications/notification-bell-main"

export default function TeachersListPage() {
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
      teacher.last_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSubject = selectedSubject === "all" || teacher.speciality_names.some((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = selectedStatus === "all" || teacher.status === selectedStatus

    return matchesSearch && matchesSubject && matchesStatus
  })

  const handleAddTeacher = async (newTeacher: Omit<Teacher, "id" | "created" | "updated">) => {
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
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce professeur ?')) {
      return
    }

    try {
      await deleteTeacher(teacherId)
    } catch (error) {
      console.error('Erreur lors de la suppression du professeur:', error)
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

  const maleTeachers = teachers.filter((t) => t.gender === "Masculin").length
  const femaleTeachers = teachers.filter((t) => t.gender === "Féminin").length
  const activeTeachers = teachers.filter((t) => t.status === "active").length
  const onLeaveTeachers = teachers.filter((t) => t.status === "on_leave").length

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader title="Gestion des Professeurs" description="Gérer le personnel enseignant et administratif">
            <div className="flex items-center space-x-2">
              <NotificationBellMain />
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
                  {Math.round((maleTeachers / teachers.length) * 100)}%
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
                  {Math.round((femaleTeachers / teachers.length) * 100)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En congé</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">{onLeaveTeachers}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((onLeaveTeachers / teachers.length) * 100)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Recherche et filtres</CardTitle>
              <CardDescription>Filtrer la liste des professeurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Recherche */}
                <div className="relative">
                  <Label htmlFor="search">Recherche</Label>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Rechercher par nom ou spécialité..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filtres */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Matière</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Toutes les matières" />
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

                  <div className="space-y-2">
                    <Label>Statut</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                        <SelectItem value="on_leave">En congé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Actions</Label>
                    <Button variant="default" onClick={() => setIsAddModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau professeur
                    </Button>
                  </div>
                </div>
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
            subjects={subjects}
            onEdit={handleEditTeacher}
          />
        </div>
      </main>
    </div>
  )
}
