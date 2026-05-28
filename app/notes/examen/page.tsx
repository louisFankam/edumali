"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { HelpButton } from "@/components/help-button"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileEdit, Trash2, CheckCircle, XCircle, Pencil, PlusCircle, FileText, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { useEvaluations } from "@/hooks/use-evaluations"
import { useGrades } from "@/hooks/use-grades"
import { useClasses } from "@/hooks/use-classes"
import { useSubjects } from "@/hooks/use-settings"
import { useAcademicYears } from "@/hooks/use-settings"
import { useStudents } from "@/hooks/use-students"
import { useClassSubjects } from "@/hooks/use-class-subjects"
import { format } from "date-fns"

export default function ExamensPage() {
  const { classes } = useClasses()
  const { subjects: allSubjects } = useSubjects()
  const { years, currentYear } = useAcademicYears()
  const [classId, setClassId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [trimester, setTrimester] = useState("1")

  const { subjects: classSubjects } = useClassSubjects(classId || undefined)
  const classSubjectIds = new Set(classSubjects.map(s => s.subjectId))
  const availableSubjects = classId
    ? allSubjects.filter(s => classSubjectIds.has(s.id))
    : allSubjects

  useEffect(() => { setSubjectId("") }, [classId])

  const filters = {
    classId: classId || undefined,
    subjectId: subjectId || undefined,
    trimester,
    academicYearId: currentYear?.id,
  }
  const { evaluations, isLoading, create, update, remove, refetch } = useEvaluations(filters)

  const devoir = evaluations.find(e => e.type === "devoir") || null
  const trimestrielle = evaluations.find(e => e.type === "trimestrielle") || null
  const subjectName = allSubjects.find(s => s.id === subjectId)?.name || ""

  const [showEdit, setShowEdit] = useState<string | null>(null)
  const [showGrades, setShowGrades] = useState<{ id: string; classId: string } | null>(null)

  const handleCreate = async (type: "devoir" | "trimestrielle") => {
    if (!classId || !subjectId) return
    const yearId = currentYear?.id || years[0]?.id
    if (!yearId) { alert("Aucune année académique trouvée"); return }
    try {
      await create({
        name: type === "devoir" ? `Devoir - ${subjectName}` : `Trimestrielle - ${subjectName}`,
        type,
        classId: Number(classId),
        subjectId: Number(subjectId),
        trimester: Number(trimester),
        academicYearId: Number(yearId),
        date: format(new Date(), "yyyy-MM-dd"),
      })
    } catch {}
  }

  const showCards = classId && subjectId

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader title="Évaluations" description="Gérer les devoirs et les évaluations trimestrielles">
  <HelpButton section="notes" />
</PageHeader>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1.5">
                <Label className="text-xs">Classe</Label>
                <Select value={classId || undefined} onValueChange={setClassId}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Sélectionner une classe" /></SelectTrigger>
                  <SelectContent>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Matière</Label>
                <Select value={subjectId || undefined} onValueChange={setSubjectId} disabled={!classId}>
                  <SelectTrigger className="w-44"><SelectValue placeholder={classId ? "Sélectionner" : "Choisissez d'abord une classe"} /></SelectTrigger>
                  <SelectContent>
                    {availableSubjects.length === 0 ? (
                      <SelectItem value=" " disabled>Aucune matière assignée</SelectItem>
                    ) : availableSubjects.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Trimestre</Label>
                <Select value={trimester} onValueChange={setTrimester}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Trimestre 1</SelectItem>
                    <SelectItem value="2">Trimestre 2</SelectItem>
                    <SelectItem value="3">Trimestre 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {showCards && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EvaluationCard
              type="devoir"
              subjectName={subjectName}
              evaluation={devoir}
              onEdit={setShowEdit}
              onGrades={setShowGrades}
              onCreate={() => handleCreate("devoir")}
              onDelete={remove}
            />
            <EvaluationCard
              type="trimestrielle"
              subjectName={subjectName}
              evaluation={trimestrielle}
              onEdit={setShowEdit}
              onGrades={setShowGrades}
              onCreate={() => handleCreate("trimestrielle")}
              onDelete={remove}
            />
          </div>
        )}

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
                ) : evaluations.map(ev => (
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

      {showEdit && (
        <EditEvaluationDialog
          evaluationId={showEdit}
          open={!!showEdit}
          onClose={() => setShowEdit(null)}
          evaluation={evaluations.find(e => e.id === showEdit) || null}
          onUpdate={update}
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
    </AppLayout>
  )
}

function EvaluationCard({
  type, subjectName, evaluation, onEdit, onGrades, onCreate, onDelete,
}: {
  type: "devoir" | "trimestrielle"
  subjectName: string
  evaluation: any
  onEdit: (id: string) => void
  onGrades: (data: { id: string; classId: string }) => void
  onCreate: () => void
  onDelete: (id: string) => Promise<any>
}) {
  const label = type === "devoir" ? "Devoir" : "Trimestrielle"
  const Icon = type === "devoir" ? FileText : BookOpen

  if (!evaluation) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Icon className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="font-medium mb-1">{label}</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">{label} - {subjectName}</p>
          <Button onClick={onCreate}>
            <PlusCircle className="h-4 w-4 mr-2" /> Créer le {label.toLowerCase()}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <Badge variant={type === "devoir" ? "secondary" : "default"} className="mb-2">{label}</Badge>
            <h3 className="font-medium">{evaluation.name}</h3>
          </div>
          <Badge variant={evaluation.status === "published" ? "success" : "outline"} className="gap-1">
            {evaluation.status === "published" ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {evaluation.status === "published" ? "Publié" : "Brouillon"}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground mb-4">
          Date: {evaluation.date}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(evaluation.id)}>
            <Pencil className="h-3.5 w-3.5 mr-1" /> Modifier
          </Button>
          <Button variant="outline" size="sm" onClick={() => onGrades({ id: evaluation.id, classId: evaluation.classId })}>
            <FileEdit className="h-3.5 w-3.5 mr-1" /> Notes
          </Button>
          <Button variant="ghost" size="sm" onClick={async () => { if (confirm("Supprimer ?")) await onDelete(evaluation.id) }}>
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
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
  const [absentIds, setAbsentIds] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState("saisie")

  const gradeMap = new Map(grades.map(g => [g.studentId, g]))

  const allStudents = students.length > 0
    ? students
    : grades.map(g => ({ id: g.studentId, firstName: g.studentFirstName, lastName: g.studentLastName }))

  useEffect(() => {
    const absent = new Set<string>()
    for (const g of grades) {
      if (g.isAbsent) absent.add(g.studentId)
    }
    setAbsentIds(absent)
  }, [grades])

  const handleScoreChange = (studentId: string, value: string) => {
    setScores(p => ({ ...p, [studentId]: value }))
  }

  const handleRemarksChange = (studentId: string, value: string) => {
    setRemarks(p => ({ ...p, [studentId]: value }))
  }

  const toggleAbsent = (studentId: string) => {
    setAbsentIds(prev => {
      const next = new Set(prev)
      if (next.has(studentId)) next.delete(studentId)
      else next.add(studentId)
      return next
    })
  }

  const handleSave = async () => {
    const gradeInputs = allStudents.map(s => {
      const isAbsent = absentIds.has(s.id)
      const existing = gradeMap.get(s.id)
      return {
        studentId: Number(s.id),
        score: isAbsent ? 0 : Number(scores[s.id] ?? existing?.score ?? ""),
        remarks: isAbsent ? "Absent" : (remarks[s.id] ?? existing?.remarks) || undefined,
        isAbsent,
      }
    }).filter(g => !isNaN(g.score) || g.isAbsent)
    setSaving(true)
    await save(gradeInputs)
    setSaving(false)
    toast.success("Notes enregistrées")
  }

  const counted = allStudents.filter(s => {
    const existing = gradeMap.get(s.id)
    const score = scores[s.id] ?? (existing?.score !== undefined && existing?.score !== null ? String(existing.score) : "")
    return score !== "" || absentIds.has(s.id)
  }).length

  const isLoading = gradesLoading || (studentsLoading && grades.length === 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Saisie des notes</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Chargement..." : `${counted}/${allStudents.length} élèves renseignés`}
          </p>
        </DialogHeader>

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
                {allStudents.map(s => {
                  const existing = gradeMap.get(s.id)
                  const isAbsent = absentIds.has(s.id)
                  const scoreVal = scores[s.id] ?? (existing?.score !== undefined && existing?.score !== null ? String(existing.score) : "")
                  const scoreNum = scoreVal !== "" ? Number(scoreVal) : undefined
                  const isEmpty = scoreVal === "" && !isAbsent && !existing
                  const scoreColor = isAbsent ? "bg-red-50 border-red-300"
                    : scoreNum !== undefined && scoreNum >= 10 ? "bg-green-50 border-green-400"
                    : scoreNum !== undefined && scoreNum < 10 ? "bg-red-50 border-red-400"
                    : isEmpty ? "border-amber-300"
                    : ""

                  return (
                    <div key={s.id} className={`flex items-center gap-2 p-2 rounded-lg border ${isAbsent ? "bg-red-50/50 border-red-200" : "bg-card"}`}>
                      <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${
                        isAbsent ? "bg-red-400"
                        : scoreNum !== undefined && scoreNum >= 10 ? "bg-green-500"
                        : scoreNum !== undefined && scoreNum < 10 ? "bg-red-500"
                        : isEmpty ? "bg-amber-400"
                        : "bg-transparent"
                      }`} />
                      <span className="flex-1 font-medium text-sm min-w-0 truncate">
                        {s.lastName} {s.firstName}
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        className={`w-20 h-9 rounded-md border ${scoreColor} bg-background px-3 text-center text-sm ${isAbsent ? "opacity-50" : ""}`}
                        placeholder="Note"
                        value={isAbsent ? "" : scoreVal}
                        onChange={e => handleScoreChange(s.id, e.target.value)}
                        disabled={isAbsent}
                      />
                      <span className="text-xs text-muted-foreground w-6">/20</span>
                      <input
                        className={`w-32 h-9 rounded-md border border-input bg-background px-2 text-xs ${isAbsent ? "opacity-50" : ""}`}
                        placeholder="Observation"
                        value={isAbsent ? "Absent" : (remarks[s.id] ?? existing?.remarks || "")}
                        onChange={e => handleRemarksChange(s.id, e.target.value)}
                        disabled={isAbsent}
                      />
                      <label className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isAbsent}
                          onChange={() => toggleAbsent(s.id)}
                          className="h-3.5 w-3.5"
                        />
                        Absent
                      </label>
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
            {stats && stats.count + stats.absentCount > 0 ? (
              <div className="space-y-4">
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
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Total élèves : <strong>{stats.totalStudents}</strong></span>
                  <span>Notés : <strong>{stats.count}</strong></span>
                  <span className="text-amber-600">Absents : <strong>{stats.absentCount}</strong></span>
                  {stats.missingCount > 0 && <span className="text-red-600">Manquants : <strong>{stats.missingCount}</strong></span>}
                </div>
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
