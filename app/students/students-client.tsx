"use client"

import { useMemo, useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { HelpButton } from "@/components/help-button"
import { PageHeader } from "@/components/page-header"
import { StudentsTable } from "@/components/students/students-table"
import { AddStudentModal } from "@/components/students/add-student-modal"
import { StudentDetailsModal } from "@/components/students/student-details-modal"
import { EditStudentModal } from "@/components/students/edit-student-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Download, ChevronLeft, ChevronRight, Users, Loader2 } from "lucide-react"

import { useStudents, useStudentStats } from "@/hooks/use-students"
import { useClasses } from "@/hooks/use-classes"
import { useAcademicYears } from "@/hooks/use-settings"
import type { StudentData } from "@/hooks/use-students"

const PAGE_SIZE = 20

export function StudentsClient() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClassId, setSelectedClassId] = useState("all")
  const [page, setPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { currentYear } = useAcademicYears()

  const effectiveClassId = selectedClassId === "all" ? undefined : selectedClassId

  const { students, total, isLoading, error, refetch, addStudent, editStudent, deleteStudent } = useStudents({
    search: searchTerm || undefined,
    classId: effectiveClassId,
    academicYearId: currentYear?.id,
    page,
    limit: PAGE_SIZE,
  })
  const { classes } = useClasses()
  const { stats, isLoading: statsLoading } = useStudentStats(currentYear?.id)

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const filteredStudents = useMemo(() => students, [students])

  const handleExportCSV = () => {
    const headers = ["Prénom,Nom,Genre,Date Naissance,Nationalité,Parent,Téléphone,Classe,Date Inscription,Statut"]
    const rows = students.map(s =>
      [s.firstName, s.lastName, s.gender, s.birthDate, s.nationality ?? "", s.parentName, s.parentPhone, s.className, s.registrationDate, s.status]
        .map(v => `"${v}"`).join(",")
    )
    const csv = [...headers, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `eleves_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handleClassFilterChange = (value: string) => {
    setSelectedClassId(value)
    setPage(1)
  }

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
        <PageHeader title="Gestion des Élèves" description="Gérer les inscriptions et profils des élèves">
          <HelpButton section="eleves" />
        </PageHeader>
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
          <HelpButton section="eleves" />
        <div className="flex items-center space-x-2">
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
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
              </div>
            </div>
            <Select value={selectedClassId} onValueChange={handleClassFilterChange}>
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

            <Button variant="outline" className="bg-transparent" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
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
        <>
          <StudentsTable
            students={filteredStudents}
            onViewDetails={handleViewDetails}
            onEdit={handleEditClick}
            onDelete={handleDeleteStudent}
          />
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">{total} élève(s) — Page {page}/{totalPages}</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  Suivant <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
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
