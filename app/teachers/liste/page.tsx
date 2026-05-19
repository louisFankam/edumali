"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Users, User } from "lucide-react"
import { TeachersTable } from "@/components/teachers/teachers-table"
import { AddTeacherModal } from "@/components/teachers/add-teacher-modal"
import { TeacherDetailsModal } from "@/components/teachers/teacher-details-modal"
import { EditTeacherModal } from "@/components/teachers/edit-teacher-modal"
import { NotificationBellMain } from "@/components/notifications/notification-bell-main"
import { Teacher, Subject } from "@/types/teacher"

const INITIAL_SUBJECTS: Subject[] = [
  { id: "1", name: "Mathématiques" },
  { id: "2", name: "Français" },
  { id: "3", name: "Sciences" },
  { id: "4", name: "Histoire-Géo" },
]

const INITIAL_TEACHERS: Teacher[] = [
  {
    id: "t_1",
    first_name: "Fatoumata",
    last_name: "Diarra",
    full_name: "Fatoumata Diarra",
    email: "f.diarra@edumali.ml",
    phone: "70000001",
    address: "Bamako Coura",
    hire_date: "2020-09-01",
    salary: 150000,
    status: "active",
    photo: "",
    user_id: "u_1",
    gender: "Féminin",
    contrat: "mensuel",
    speciality: ["1"],
    speciality_names: ["Mathématiques"],
    created: "2020-09-01",
    updated: "2020-09-01",
  },
  {
    id: "t_2",
    first_name: "Moussa",
    last_name: "Koné",
    full_name: "Moussa Koné",
    email: "m.kone@edumali.ml",
    phone: "70000002",
    address: "Kalaban Coro",
    hire_date: "2021-10-15",
    salary: 140000,
    status: "active",
    photo: "",
    user_id: "u_2",
    gender: "Masculin",
    contrat: "mensuel",
    speciality: ["2"],
    speciality_names: ["Français"],
    created: "2021-10-15",
    updated: "2021-10-15",
  }
]

export default function TeachersListPage() {
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS)
  const [subjects] = useState<Subject[]>(INITIAL_SUBJECTS)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
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

  const handleAddTeacher = (newTeacher: any) => {
    const teacherWithId = { 
      ...newTeacher, 
      id: `t_${Date.now()}`,
      full_name: `${newTeacher.first_name} ${newTeacher.last_name}`,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      speciality_names: subjects.filter(s => newTeacher.speciality?.includes(s.id)).map(s => s.name)
    }
    setTeachers([...teachers, teacherWithId])
    setIsAddModalOpen(false)
  }

  const handleEditTeacher = (updatedTeacher: Partial<Teacher>) => {
    if (!selectedTeacher) return
    setTeachers(teachers.map(t => t.id === selectedTeacher.id ? { ...t, ...updatedTeacher } as Teacher : t))
    setIsEditModalOpen(false)
    setSelectedTeacher(null)
  }

  const handleDeleteTeacher = (teacherId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce professeur ?')) {
      setTeachers(teachers.filter(t => t.id !== teacherId))
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
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader title="Gestion des Professeurs" description="Gérer le personnel enseignant et administratif">
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
        </div>
      </main>
    </div>
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
