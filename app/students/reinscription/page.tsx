"use client"

import { useState, useMemo, useCallback } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, UserCheck, Loader2 } from "lucide-react"
import { useStudents } from "@/hooks/use-students"
import { useClasses } from "@/hooks/use-classes"
import { useAcademicYears } from "@/hooks/use-settings"
import { useEnrollments } from "@/hooks/use-enrollments"

export default function ReinscriptionPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClassId, setSelectedClassId] = useState("all")
  const [selectedClassIdFilter, setSelectedClassIdFilter] = useState("all")

  const { students, isLoading: studentsLoading } = useStudents()
  const { classes, isLoading: classesLoading } = useClasses()
  const { currentYear, isLoading: yearLoading } = useAcademicYears()
  const currentYearId = currentYear?.id

  const { enrollments, isLoading: enrollmentsLoading, create: createEnrollment, refetch: refetchEnrollments } = useEnrollments(
    currentYearId ? { academicYearId: currentYearId } : undefined
  )

  const [reinscribingId, setReinscribingId] = useState<string | null>(null)

  const enrolledStudentIds = useMemo(() => {
    if (!enrollments.length) return new Set<string>()
    return new Set(enrollments.map(e => e.studentId))
  }, [enrollments])

  const unenrolled = useMemo(() => {
    return students.filter(s => !enrolledStudentIds.has(s.id))
  }, [students, enrolledStudentIds])

  const filtered = useMemo(() => {
    return unenrolled.filter(s => {
      const matchesSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesClass = selectedClassIdFilter === "all" || s.classId === selectedClassIdFilter
      return matchesSearch && matchesClass
    })
  }, [unenrolled, searchTerm, selectedClassIdFilter])

  const handleReinscribe = useCallback(async (studentId: string, classId: string) => {
    if (!currentYearId) return
    if (!confirm("Réinscrire cet élève pour l'année en cours ?")) return

    setReinscribingId(studentId)
    try {
      await createEnrollment({
        studentId: Number(studentId),
        classId: Number(classId),
        academicYearId: Number(currentYearId),
        enrollmentDate: new Date().toISOString().split("T")[0],
        status: "réinscrit",
      })
      await refetchEnrollments()
    } catch (e) {
      console.error("Erreur lors de la réinscription:", e)
    } finally {
      setReinscribingId(null)
    }
  }, [currentYearId, createEnrollment, refetchEnrollments])

  const isLoading = studentsLoading || classesLoading || yearLoading || enrollmentsLoading

  return (
    <AppLayout>
      <PageHeader title="Réinscription" description="Réinscrire les anciens élèves pour la nouvelle année" />

      <Card>
        <CardHeader><CardTitle>Recherche</CardTitle></CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Nom de l'élève..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Select value={selectedClassIdFilter} onValueChange={setSelectedClassIdFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Classe" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Élève</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{s.firstName[0]}{s.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{s.firstName} {s.lastName}</div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{s.className}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleReinscribe(s.id, s.classId)}
                        disabled={reinscribingId === s.id}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        {reinscribingId === s.id ? "..." : "Réinscrire"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && filtered.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Aucun élève à réinscrire</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  )
}
