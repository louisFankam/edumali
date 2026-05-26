"use client"

import { useState, useMemo } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Users } from "lucide-react"
import { TeachersTable } from "@/components/teachers/teachers-table"
import { AddTeacherModal } from "@/components/teachers/add-teacher-modal"
import { TeacherDetailsModal } from "@/components/teachers/teacher-details-modal"
import { EditTeacherModal } from "@/components/teachers/edit-teacher-modal"

import { useTeachers, useSubjectsList, TeacherData } from "@/hooks/use-teachers"

export default function TeachersListPage() {
  const { teachers, isLoading, error, refetch, addTeacher, editTeacher, deleteTeacher: deleteTeacherApi } = useTeachers()
  const { subjects } = useSubjectsList()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherData | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSearch =
        teacher.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.last_name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSubject = selectedSubject === "all" || teacher.speciality.includes(selectedSubject)
      const matchesStatus = selectedStatus === "all" || teacher.status === selectedStatus

      return matchesSearch && matchesSubject && matchesStatus
    })
  }, [teachers, searchTerm, selectedSubject, selectedStatus])

  const handleAddTeacher = async (formData: any) => {
    await addTeacher(formData)
    setIsAddModalOpen(false)
  }

  const handleEditTeacher = async (updatedTeacher: Partial<TeacherData>) => {
    if (!selectedTeacher) return
    await editTeacher(selectedTeacher.id, updatedTeacher)
    setIsEditModalOpen(false)
    setSelectedTeacher(null)
  }

  const handleDeleteTeacher = async (teacherId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce professeur ?')) {
      await deleteTeacherApi(teacherId)
    }
  }

  const handleViewDetails = (teacher: TeacherData) => {
    setSelectedTeacher(teacher)
    setIsDetailsModalOpen(true)
  }

  const handleEditClick = (teacher: TeacherData) => {
    setSelectedTeacher(teacher)
    setIsEditModalOpen(true)
  }

  const stats = useMemo(() => {
    const total = teachers.length
    const male = teachers.filter((t) => t.gender === "Masculin").length
    const female = teachers.filter((t) => t.gender === "Féminin").length
    const active = teachers.filter((t) => t.status === "active").length
    const onLeave = teachers.filter((t) => t.status === "on_leave").length

    return {
      total,
      male,
      female,
      active,
      onLeave,
      malePercent: total > 0 ? Math.round((male / total) * 100) : 0,
      femalePercent: total > 0 ? Math.round((female / total) * 100) : 0,
      onLeavePercent: total > 0 ? Math.round((onLeave / total) * 100) : 0,
    }
  }, [teachers])

  return (
    <AppLayout>
          <PageHeader title="Gestion des Professeurs" description="Gérer le personnel enseignant et administratif">
            <div className="flex items-center space-x-2">
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau professeur
              </Button>
            </div>
          </PageHeader>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard title="Total Professeurs" value={stats.total} subtext={`${stats.active} actifs`} />
            <StatCard title="Hommes" value={stats.male} subtext={`${stats.malePercent}%`} />
            <StatCard title="Femmes" value={stats.female} subtext={`${stats.femalePercent}%`} />
            <StatCard title="En congé" value={stats.onLeave} subtext={`${stats.onLeavePercent}%`} />
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Recherche et filtres</CardTitle>
              <CardDescription>Filtrer la liste des professeurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Recherche</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Rechercher par nom..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Matière</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les matières" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les matières</SelectItem>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
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
              </div>
            </CardContent>
          </Card>

          <TeachersTable
            teachers={filteredTeachers}
            isLoading={isLoading}
            error={error}
            onViewDetails={handleViewDetails}
            onEdit={handleEditClick}
            onDelete={handleDeleteTeacher}
          />

          <AddTeacherModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAdd={handleAddTeacher}
            subjects={subjects}
          />

          {selectedTeacher && (
            <>
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
            </>
          )}
        </AppLayout>
  )
}

function StatCard({ title, value, subtext }: { title: string, value: number, subtext: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-serif font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </CardContent>
    </Card>
  )
}
