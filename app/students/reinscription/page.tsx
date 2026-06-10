"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { HelpButton } from "@/components/help-button"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Search, UserCheck, Loader2, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { useStudents } from "@/hooks/use-students"
import { useClasses } from "@/hooks/use-classes"
import { useAcademicYears } from "@/hooks/use-settings"
import { useEnrollments } from "@/hooks/use-enrollments"

export default function ReinscriptionPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClassIdFilter, setSelectedClassIdFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null)
  const [reEnrollMode, setReEnrollMode] = useState<"promote" | "repeat">("promote")
  const [selectedClassId, setSelectedClassId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { students, isLoading: studentsLoading, editStudent } = useStudents()
  const { classes, isLoading: classesLoading } = useClasses()
  const { currentYear, isLoading: yearLoading } = useAcademicYears()
  const currentYearId = currentYear?.id

  const { enrollments, isLoading: enrollmentsLoading, create: createEnrollment, refetch: refetchEnrollments } = useEnrollments(
    currentYearId ? { academicYearId: currentYearId } : undefined
  )

  const classLevelMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of classes) {
      if (c.level != null) map.set(c.id, c.level)
    }
    return map
  }, [classes])

  const nextClassFor = useCallback((classId: string) => {
    const level = classLevelMap.get(classId)
    if (level == null) return null
    return classes.find(c => c.level === level + 1) ?? null
  }, [classes, classLevelMap])

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

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginated = filtered.slice(startIndex, endIndex)

  const openDialog = useCallback((student: StudentData) => {
    setSelectedStudent(student)
    const next = nextClassFor(student.classId)
    if (next) {
      setReEnrollMode("promote")
      setSelectedClassId(next.id)
    } else {
      setReEnrollMode("repeat")
      setSelectedClassId(student.classId)
    }
    setEnrollmentSuccess(false)
    setSubmitError(null)
    setDialogOpen(true)
  }, [nextClassFor])

  const handleModeChange = useCallback((mode: "promote" | "repeat") => {
    if (!selectedStudent) return
    setReEnrollMode(mode)
    if (mode === "repeat") {
      setSelectedClassId(selectedStudent.classId)
    } else {
      const next = nextClassFor(selectedStudent.classId)
      if (next) setSelectedClassId(next.id)
    }
  }, [selectedStudent, nextClassFor])

  const handleSubmit = useCallback(async () => {
    if (!currentYearId || !selectedStudent) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await createEnrollment({
        studentId: Number(selectedStudent.id),
        classId: Number(selectedClassId),
        academicYearId: Number(currentYearId),
        enrollmentDate: new Date().toISOString().split("T")[0],
        status: "réinscrit",
      })
      await editStudent(selectedStudent.id, { classId: selectedClassId })
      await refetchEnrollments()
      setEnrollmentSuccess(true)
      toast.success(`${selectedStudent.firstName} ${selectedStudent.lastName} réinscrit`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setSubmitError(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }, [currentYearId, selectedStudent, selectedClassId, createEnrollment, editStudent, refetchEnrollments])

  const resetDialog = useCallback(() => {
    setDialogOpen(false)
    setSelectedStudent(null)
    setEnrollmentSuccess(false)
    setSubmitError(null)
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }, [])

  const handleClassFilterChange = useCallback((val: string) => {
    setSelectedClassIdFilter(val)
    setCurrentPage(1)
  }, [])

  const isLoading = studentsLoading || classesLoading || yearLoading || enrollmentsLoading

  const activeClasses = useMemo(() => classes.filter(c => c.status !== "inactive"), [classes])

  return (
    <AppLayout>
      <PageHeader title="Réinscription" description="Réinscrire les anciens élèves pour la nouvelle année">
  <HelpButton section="eleves" />
</PageHeader>

      <Card>
        <CardHeader><CardTitle>Recherche</CardTitle></CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Nom de l'élève..." className="pl-10" value={searchTerm} onChange={handleSearchChange} />
          </div>
          <Select value={selectedClassIdFilter} onValueChange={handleClassFilterChange}>
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
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Élève</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map(s => (
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
                        <Button size="sm" onClick={() => openDialog(s)}>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Réinscrire
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && filtered.length === 0 && (
                    <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Aucun élève à réinscrire</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {startIndex + 1} à {Math.min(endIndex, filtered.length)} sur {filtered.length}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .map((p, idx, arr) => (
                        <span key={p} className="flex items-center">
                          {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-muted-foreground">...</span>}
                          <Button
                            variant={currentPage === p ? "default" : "outline"}
                            size="sm"
                            className="min-w-9"
                            onClick={() => setCurrentPage(p)}
                          >
                            {p}
                          </Button>
                        </span>
                      ))}
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      Suivant <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={open => { if (!open) resetDialog() }}>
        <DialogContent className="sm:max-w-md">
              {!enrollmentSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle>Réinscrire un élève</DialogTitle>
                <DialogDescription>
                  Choisissez la classe d&apos;accueil pour {selectedStudent?.firstName} {selectedStudent?.lastName}
                </DialogDescription>
              </DialogHeader>

              {!currentYearId && (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                  Aucune année académique active. Veuillez d&apos;abord définir une année scolaire courante dans les paramètres.
                </p>
              )}

              {selectedStudent && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{selectedStudent.firstName[0]}{selectedStudent.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                      <Badge variant="outline">{selectedStudent.className}</Badge>
                    </div>
                  </div>

                  <RadioGroup value={reEnrollMode} onValueChange={(v: "promote" | "repeat") => handleModeChange(v)}>
                    {nextClassFor(selectedStudent.classId) && (
                      <div className="flex items-center gap-3 p-3 border rounded-lg has-[[data-state=checked]]:border-primary">
                        <RadioGroupItem value="promote" id="promote" />
                        <Label htmlFor="promote" className="flex-1 cursor-pointer">
                          <span className="font-medium">Passage en classe supérieure</span>
                          <p className="text-sm text-muted-foreground">{nextClassFor(selectedStudent.classId)?.name}</p>
                        </Label>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-3 border rounded-lg has-[[data-state=checked]]:border-primary">
                      <RadioGroupItem value="repeat" id="repeat" />
                      <Label htmlFor="repeat" className="flex-1 cursor-pointer">
                        <span className="font-medium">Redoublement</span>
                        <p className="text-sm text-muted-foreground">{selectedStudent.className}</p>
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="space-y-1.5">
                    <Label htmlFor="class-override">Classe d&apos;affectation</Label>
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                      <SelectTrigger id="class-override"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {activeClasses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {submitError && (
                    <p className="text-sm text-destructive">{submitError}</p>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={resetDialog}>Annuler</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting || !selectedClassId || !currentYearId}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserCheck className="h-4 w-4 mr-2" />}
                  Réinscrire
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  Réinscription réussie
                </DialogTitle>
                <DialogDescription>
                  {selectedStudent?.firstName} {selectedStudent?.lastName} a été réinscrit en {classes.find(c => c.id === selectedClassId)?.name ?? selectedClassId}
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="sm:justify-between">
                <Button variant="outline" onClick={resetDialog}>Fermer</Button>
                <Button asChild>
                  <Link href={`/students/eleves_pages/${selectedStudent?.id}`}>
                    Voir le profil →
                  </Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
