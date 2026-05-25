"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, FileEdit, Trash2, CheckCircle, XCircle, Pencil } from "lucide-react"
import { useEvaluations } from "@/hooks/use-evaluations"
import { useGrades } from "@/hooks/use-grades"
import { useClasses } from "@/hooks/use-classes"
import { useSubjects } from "@/hooks/use-settings"
import { useAcademicYears } from "@/hooks/use-settings"
import { useStudents } from "@/hooks/use-students"
import { useClassSubjects } from "@/hooks/use-class-subjects"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function ExamensPage() {
  const { classes } = useClasses()
  const { subjects } = useSubjects()
  const { years, currentYear } = useAcademicYears()
  const [filters, setFilters] = useState<{ classId?: string; subjectId?: string; trimester?: string; status?: string }>({})
  const { subjects: classSubjects } = useClassSubjects(filters.classId)
  const today = format(new Date(), "yyyy-MM-dd")

  const classSubjectIds = new Set(classSubjects.map(s => s.subjectId))
  const filteredSubjects = filters.classId
    ? subjects.filter(s => classSubjectIds.has(s.id))
    : subjects
  const { evaluations, isLoading, create, update, remove, refetch } = useEvaluations(filters)

  const [showCreate, setShowCreate] = useState(false)
  const [showGrades, setShowGrades] = useState<{ id: string; classId: string } | null>(null)
  const [showEdit, setShowEdit] = useState<string | null>(null)

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader title="Évaluations" description="Gérer les devoirs et les évaluations trimestrielles">
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter une évaluation
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1.5">
                <Label className="text-xs">Classe</Label>
                <Select value={filters.classId || ""} onValueChange={(v) => setFilters(p => ({ ...p, classId: v || undefined }))}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Toutes les classes" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">Toutes les classes</SelectItem>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Matière</Label>
                <Select value={filters.subjectId || ""} onValueChange={(v) => setFilters(p => ({ ...p, subjectId: v || undefined }))}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Toutes les matières" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">Toutes les matières</SelectItem>
                    {filteredSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Trimestre</Label>
                <Select value={filters.trimester || ""} onValueChange={(v) => setFilters(p => ({ ...p, trimester: v || undefined }))}>
                  <SelectTrigger className="w-32"><SelectValue placeholder="Tous" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">Tous</SelectItem>
                    <SelectItem value="1">Trimestre 1</SelectItem>
                    <SelectItem value="2">Trimestre 2</SelectItem>
                    <SelectItem value="3">Trimestre 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Statut</Label>
                <Select value={filters.status || ""} onValueChange={(v) => setFilters(p => ({ ...p, status: v || undefined }))}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="Tous" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">Tous</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Liste des évaluations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Matière</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Chargement...</TableCell></TableRow>
                ) : evaluations.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucune évaluation trouvée</TableCell></TableRow>
                ) : evaluations.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell className="font-medium">{ev.name}</TableCell>
                    <TableCell>
                      <Badge variant={ev.type === "devoir" ? "secondary" : "default"}>{ev.type === "devoir" ? "Devoir" : "Trimestrielle"}</Badge>
                    </TableCell>
                    <TableCell>{ev.className}</TableCell>
                    <TableCell>{ev.subjectName}</TableCell>
                    <TableCell>{ev.date}</TableCell>
                    <TableCell>
                      <Badge variant={ev.status === "published" ? "success" : "outline"} className="gap-1">
                        {ev.status === "published" ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {ev.status === "published" ? "Publié" : "Brouillon"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="sm" onClick={() => setShowGrades({ id: ev.id, classId: ev.classId })}>
                          <FileEdit className="h-3.5 w-3.5 mr-1" /> Notes
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowEdit(ev.id)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={async () => { if (confirm("Supprimer cette évaluation ?")) await remove(ev.id) }}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {showCreate && (
        <CreateEvaluationDialog
          open={showCreate}
          onClose={() => setShowCreate(false)}
          classes={classes}
          subjects={subjects}
          years={years}
          currentYear={currentYear}
          onCreate={create}
        />
      )}

      {showGrades && (
        <GradeDialog
          evaluationId={showGrades.id}
          classId={showGrades.classId}
          open={!!showGrades}
          onClose={() => setShowGrades(null)}
        />
      )}

      {showEdit && (
        <EditEvaluationDialog
          evaluationId={showEdit}
          open={!!showEdit}
          onClose={() => setShowEdit(null)}
          evaluation={evaluations.find(e => e.id === showEdit) || null}
          onUpdate={update}
        />
      )}
    </AppLayout>
  )
}

function CreateEvaluationDialog({
  open, onClose, classes, subjects, years, currentYear, onCreate,
}: {
  open: boolean; onClose: () => void
  classes: { id: string; name: string }[]
  subjects: { id: string; name: string }[]
  years: { id: string; year: string }[]
  currentYear: { id: string; year: string } | null
  onCreate: (input: any) => Promise<any>
}) {
  const [name, setName] = useState("")
  const [type, setType] = useState("devoir")
  const [classId, setClassId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [trimester, setTrimester] = useState("1")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [saving, setSaving] = useState(false)
  const { subjects: classSubjects } = useClassSubjects(classId || undefined)

  const classSubjectIds = new Set(classSubjects.map(s => s.subjectId))
  const availableSubjects = classId
    ? subjects.filter(s => classSubjectIds.has(s.id))
    : subjects

  useEffect(() => {
    if (subjectId && !classSubjectIds.has(subjectId)) setSubjectId("")
  }, [classId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !classId || !subjectId) return
    const yearId = currentYear?.id || years[0]?.id
    if (!yearId) { alert("Aucune année académique trouvée"); return }
    setSaving(true)
    await onCreate({ name, type, classId: Number(classId), subjectId: Number(subjectId), trimester: Number(trimester), academicYearId: Number(yearId), date })
    setSaving(false)
    onClose()
    setName(""); setType("devoir"); setClassId(""); setSubjectId(""); setTrimester("1")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nouvelle évaluation</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nom de l'évaluation</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Devoir 1 - Maths" required />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="devoir">Devoir</SelectItem>
                <SelectItem value="trimestrielle">Trimestrielle</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Classe</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Matière</Label>
              <Select value={subjectId} onValueChange={setSubjectId} disabled={!classId}>
                <SelectTrigger><SelectValue placeholder={classId ? "Sélectionner" : "Choisissez d'abord une classe"} /></SelectTrigger>
                <SelectContent>
                  {availableSubjects.length === 0 ? (
                    <SelectItem value="" disabled>Aucune matière assignée à cette classe</SelectItem>
                  ) : availableSubjects.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Trimestre</Label>
              <Select value={trimester} onValueChange={setTrimester}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Trimestre 1</SelectItem>
                  <SelectItem value="2">Trimestre 2</SelectItem>
                  <SelectItem value="3">Trimestre 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={saving}>{saving ? "Création..." : "Créer"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditEvaluationDialog({
  evaluationId, open, onClose, evaluation, onUpdate,
}: {
  evaluationId: string; open: boolean; onClose: () => void
  evaluation: any; onUpdate: (id: string, input: any) => Promise<any>
}) {
  const [name, setName] = useState(evaluation?.name || "")
  const [date, setDate] = useState(evaluation?.date || "")
  const [saving, setSaving] = useState(false)

  if (!evaluation) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onUpdate(evaluationId, { name, date })
    setSaving(false)
    onClose()
  }

  const toggleStatus = async () => {
    await onUpdate(evaluationId, { status: evaluation.status === "draft" ? "published" : "draft" })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Modifier l'évaluation</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nom</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Statut</Label>
            <div className="flex items-center gap-2">
              <Badge variant={evaluation.status === "published" ? "success" : "outline"}>
                {evaluation.status === "published" ? "Publié" : "Brouillon"}
              </Badge>
              <Button type="button" variant="outline" size="sm" onClick={toggleStatus}>
                {evaluation.status === "draft" ? "Publier" : "Dépublier"}
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function GradeDialog({
  evaluationId, classId, open, onClose,
}: {
  evaluationId: string; classId: string; open: boolean; onClose: () => void
}) {
  const { grades, stats, isLoading: gradesLoading, save, refetch } = useGrades(evaluationId)
  const { students, isLoading: studentsLoading } = useStudents({ classId, limit: 100 })
  const [scores, setScores] = useState<Record<string, string>>({})
  const [remarks, setRemarks] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState("saisie")

  const gradeMap = new Map(grades.map(g => [g.studentId, g]))

  const allStudents = students.length > 0
    ? students
    : grades.map(g => ({ id: g.studentId, firstName: g.studentFirstName, lastName: g.studentLastName }))

  const handleScoreChange = (studentId: string, value: string) => {
    setScores(p => ({ ...p, [studentId]: value }))
  }

  const handleRemarksChange = (studentId: string, value: string) => {
    setRemarks(p => ({ ...p, [studentId]: value }))
  }

  const handleSave = async () => {
    const gradeInputs = allStudents.map(s => ({
      studentId: Number(s.id),
      score: Number(scores[s.id] ?? gradeMap.get(s.id)?.score ?? ""),
      remarks: (remarks[s.id] ?? gradeMap.get(s.id)?.remarks) || undefined,
    })).filter(g => !isNaN(g.score))
    setSaving(true)
    await save(gradeInputs)
    setSaving(false)
  }

  const isLoading = gradesLoading || (studentsLoading && grades.length === 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Saisie des notes</DialogTitle></DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="saisie">Saisie</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="saisie" className="space-y-4">
            {isLoading ? (
              <p className="text-center py-4 text-muted-foreground">Chargement...</p>
            ) : allStudents.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">Aucun élève trouvé pour cette classe.</p>
            ) : (
              <div className="space-y-2">
                {allStudents.map((s) => {
                  const existing = gradeMap.get(s.id)
                  return (
                    <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg border bg-card">
                      <span className="flex-1 font-medium text-sm">{s.lastName} {s.firstName}</span>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        className="w-20 h-9 rounded-md border border-input bg-background px-3 text-center text-sm"
                        placeholder="Note"
                        value={scores[s.id] ?? (existing?.score !== undefined && existing?.score !== null ? String(existing.score) : "")}
                        onChange={e => handleScoreChange(s.id, e.target.value)}
                      />
                      <span className="text-xs text-muted-foreground w-6">/20</span>
                      <input
                        className="w-32 h-9 rounded-md border border-input bg-background px-2 text-xs"
                        placeholder="Observation"
                        value={remarks[s.id] ?? existing?.remarks || ""}
                        onChange={e => handleRemarksChange(s.id, e.target.value)}
                      />
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>Fermer</Button>
              <Button onClick={handleSave} disabled={saving || isLoading}>
                {saving ? "Enregistrement..." : "Enregistrer les notes"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            {stats && stats.count > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Moyenne</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{stats.average}/20</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Note min</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{stats.min}/20</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Note max</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{stats.max}/20</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Taux réussite</CardTitle></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{stats.successRate}%</p></CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">Enregistrez des notes pour voir les statistiques.</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
