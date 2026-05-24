"use client"

import { useMemo, useState } from "react"
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
import { Plus, Search, Download, Users, Loader2 } from "lucide-react"
import { NotificationBellMain } from "@/components/notifications/notification-bell-main"
import { useStudents, useStudentStats } from "@/hooks/use-students"
import { useClasses } from "@/hooks/use-classes"
import type { StudentData } from "@/hooks/use-students"

export function StudentsClient() {
  const { students, isLoading, error, refetch, addStudent, editStudent, deleteStudent } = useStudents()
  const { classes } = useClasses()
  const { stats, isLoading: statsLoading } = useStudentStats()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClassId, setSelectedClassId] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null)
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

  const handleAddStudent = async (newStudent: any) => {
    await addStudent(newStudent)
    setIsAddModalOpen(false)
  }

  const handleEditStudent = async (updatedStudent: StudentData) => {
    await editStudent(updatedStudent.id, updatedStudent)
    setIsEditModalOpen(false)
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élève ?")) {
      await deleteStudent(studentId)
    }
  }

  const handleViewDetails = (student: StudentData) => {
    setSelectedStudent(student)
    setIsDetailsModalOpen(true)
  }

  const handleEditClick = (student: StudentData) => {
    setSelectedStudent(student)
    setIsEditModalOpen(true)
  }

  if (error) {
    return (
      <AppLayout>
        <PageHeader title="Gestion des Élèves" description="Gérer les inscriptions et profils des élèves" />
        <Card>
          <CardContent className="py-8 text-center text-red-500">
            Erreur de chargement : {error}
          </CardContent>
        </Card>
      </AppLayout>
    )
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

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Élèves" value={statsLoading ? "..." : stats?.total ?? 0} subtext="Total" icon={Users} />
        <StatCard title="Filles" value={statsLoading ? "..." : stats?.girls ?? 0} subtext={`${stats?.girlsPercentage ?? 0}%`} icon={Users} />
        <StatCard title="Garçons" value={statsLoading ? "..." : stats?.boys ?? 0} subtext={`${stats?.boysPercentage ?? 0}%`} icon={Users} />
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

      {isLoading ? (
        <Card>
          <CardContent className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : (
        <StudentsTable
          students={filteredStudents}
          onViewDetails={handleViewDetails}
          onEdit={handleEditClick}
          onDelete={handleDeleteStudent}
        />
      )}

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

function StatCard({ title, value, subtext, icon: Icon }: { title: string; value: number | string; subtext: string; icon: any }) {
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
