"use client"

import { useState, useEffect, useMemo } from "react"
import { AppLayout } from "@/components/app-layout"
import { HelpButton } from "@/components/help-button"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useClasses } from "@/hooks/use-classes"
import { useAcademicYears, useSubjects, useSchoolInfo } from "@/hooks/use-settings"
import { useExams } from "@/hooks/use-exams"
import { Plus, Trash2, Download, Save, Zap, Pencil } from "lucide-react"

export default function ExamensPage() {
  const { classes } = useClasses()
  const { years, currentYear } = useAcademicYears()
  const { subjects: allSubjects } = useSubjects()
  const { schoolInfo } = useSchoolInfo()

  const [classId, setClassId] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [trimester, setTrimester] = useState("1")
  const { exams, create, remove, refetch } = useExams(classId, selectedYear, trimester)

  const [classSubjects, setClassSubjects] = useState<any[]>([])

  const [showAdd, setShowAdd] = useState(false)
  const [formSubjectId, setFormSubjectId] = useState<string | undefined>(undefined)
  const [formDate, setFormDate] = useState("")
  const [formStart, setFormStart] = useState("08:00")
  const [formEnd, setFormEnd] = useState("10:00")
  const [formRoom, setFormRoom] = useState("")

  const [showBulk, setShowBulk] = useState(false)
  const [bulkSubjectIds, setBulkSubjectIds] = useState<string[]>([])
  const [bulkStartDate, setBulkStartDate] = useState("")
  const [bulkStartTime, setBulkStartTime] = useState("08:00")
  const [bulkEndTime, setBulkEndTime] = useState("10:00")
  const [bulkRoom, setBulkRoom] = useState("")
  const [bulkDaysGap, setBulkDaysGap] = useState(1)

  const [editExam, setEditExam] = useState<any>(null)
  const [editDate, setEditDate] = useState("")
  const [editStart, setEditStart] = useState("")
  const [editEnd, setEditEnd] = useState("")
  const [editRoom, setEditRoom] = useState("")

  useEffect(() => {
    if (!currentYear) return
    setSelectedYear(String(currentYear.id))
  }, [currentYear])

  useEffect(() => {
    if (!classId) return
    window.fetch(`/api/class-subjects?classId=${classId}`)
      .then(r => r.json()).then(j => { if (j.ok) setClassSubjects(j.data) }).catch(() => {})
  }, [classId])

  const subjectMap = useMemo(() => {
    const m = new Map<number, any>()
    allSubjects.forEach((s: any) => m.set(Number(s.id), s))
    return m
  }, [allSubjects])

  const classSubjectList = useMemo(() => {
    return classSubjects.map((cs: any) => ({
      ...cs,
      subject: subjectMap.get(Number(cs.subjectId)),
    })).filter(cs => cs.subject)
  }, [classSubjects, subjectMap])

  const handleCreate = async () => {
    if (!classId || !selectedYear || !formSubjectId) return
    const res = await create({
      classId: Number(classId),
      academicYearId: Number(selectedYear),
      subjectId: Number(formSubjectId),
      trimester: Number(trimester),
      date: formDate,
      startTime: formStart,
      endTime: formEnd,
      room: formRoom,
      status: "draft",
    })
    if (res?.ok || res?.data) {
      setShowAdd(false)
      setFormSubjectId(undefined)
      setFormDate("")
      setFormStart("08:00")
      setFormEnd("10:00")
      setFormRoom("")
    }
  }

  const handleDelete = async (id: number) => {
    await remove(id)
  }

  const handleBulkCreate = async () => {
    if (!classId || !selectedYear || !bulkStartDate || bulkSubjectIds.length === 0) return
    const res = await window.fetch("/api/exams/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId: Number(classId),
        academicYearId: Number(selectedYear),
        trimester: Number(trimester),
        subjectIds: bulkSubjectIds.map(Number),
        startDate: bulkStartDate,
        daysGap: bulkDaysGap,
        startTime: bulkStartTime,
        endTime: bulkEndTime,
        room: bulkRoom,
      }),
    })
    const json = await res.json()
    if (json.ok) {
      refetch()
      setShowBulk(false)
      setBulkSubjectIds([])
      setBulkStartDate("")
      setBulkStartTime("08:00")
      setBulkEndTime("10:00")
      setBulkRoom("")
      setBulkDaysGap(1)
    }
  }

  const toggleBulkSubject = (subjectId: string) => {
    setBulkSubjectIds(prev =>
      prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
    )
  }

  const handleEditOpen = (exam: any) => {
    setEditExam(exam)
    setEditDate(exam.date || "")
    setEditStart(exam.startTime?.slice(0, 5) || "08:00")
    setEditEnd(exam.endTime?.slice(0, 5) || "10:00")
    setEditRoom(exam.room || "")
  }

  const handleEditSave = async () => {
    if (!editExam) return
    await update(editExam.id, {
      date: editDate,
      startTime: editStart,
      endTime: editEnd,
      room: editRoom,
    })
    setEditExam(null)
  }

  function buildPrintHTML() {
    const logo = schoolInfo?.logoUrl || ""
    const schoolName = schoolInfo?.name || "Établissement"
    const schoolAddr = schoolInfo?.address || ""
    const schoolPhone = schoolInfo?.phone || ""
    const className = classes.find(c => c.id === classId)?.name || ""
    const yearName = years.find(y => y.id === selectedYear)?.name || ""

    let rows = exams.map(e => {
      const subj = subjectMap.get(Number(e.subjectId))
      return `<tr>
        <td style="border:1px solid #000;padding:2mm;text-align:center;font-size:9pt">${subj?.name || "—"}</td>
        <td style="border:1px solid #000;padding:2mm;text-align:center;font-size:9pt">${e.date || "—"}</td>
        <td style="border:1px solid #000;padding:2mm;text-align:center;font-size:9pt">${e.startTime?.slice(0, 5)} – ${e.endTime?.slice(0, 5)}</td>
        <td style="border:1px solid #000;padding:2mm;text-align:center;font-size:9pt">${e.room || "—"}</td>
      </tr>`
    }).join("")

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${schoolName}</title>
    <style>
      @page { size: A4 landscape; margin: 0; }
      body { font-family: 'Times New Roman', Times, serif; color: #000; background: #fff; margin: 0; padding: 5mm; display: flex; flex-direction: column; align-items: center; }
      .header { text-align: center; margin-bottom: 5mm; width: 100%; }
      .header .logo { text-align: center; margin-bottom: 2mm; }
      .header .logo img { max-height: 18mm; object-fit: contain; }
      .header .school { font-size: 12pt; font-weight: bold; text-transform: uppercase; }
      .header .detail { font-size: 9pt; color: #333; }
      .header .title { font-size: 14pt; font-weight: bold; text-decoration: underline; margin: 3mm 0; }
      .header .subtitle { font-size: 10pt; margin-bottom: 3mm; }
      table { width: auto; border-collapse: collapse; margin: 0 auto; }
      th { border: 1px solid #000; padding: 2mm; font-size: 10pt; background: #f0f0f0; white-space: nowrap; }
      td { border: 1px solid #000; padding: 2mm; font-size: 9pt; white-space: nowrap; }
      .footer { margin-top: 5mm; display: flex; justify-content: space-between; font-size: 9pt; width: 100%; }
    </style></head><body>
      <div class="header">
        ${logo ? `<div class="logo"><img src="${logo}" alt="Logo" /></div>` : ""}
        <div class="school">${schoolName}</div>
        <div class="detail">${schoolAddr}</div>
        <div class="detail">${schoolPhone}</div>
        <div class="title">PROGRAMME DES EXAMENS</div>
        <div class="subtitle">${className} — ${yearName} — Trimestre ${trimester}</div>
      </div>
      <table>
        <tr><th>Matière</th><th>Date</th><th>Horaire</th><th>Salle</th></tr>
        ${rows}
      </table>
      <div class="footer">
        <div>Fait à Bamako, le ...............</div>
        <div>Le Directeur<br/>${schoolInfo?.director || ""}</div>
      </div>
    </body></html>`
  }

  const handlePrint = () => {
    const w = window.open("", "_blank")
    if (!w) return
    w.document.write(buildPrintHTML())
    w.document.close()
    w.print()
  }

  return (
    <AppLayout>
      <PageHeader title="Examens" description="Programme des examens par classe et trimestre">
        <HelpButton section="planning" />
        <Button variant="outline" onClick={handlePrint} disabled={exams.length === 0}>
          <Download className="h-4 w-4 mr-2" /> Télécharger
        </Button>
        <Button variant="outline" onClick={() => { setBulkSubjectIds(classSubjectList.map((cs: any) => String(cs.subjectId))); setShowBulk(true) }} disabled={classSubjectList.length === 0}>
          <Zap className="h-4 w-4 mr-2" /> Générer
        </Button>
        <Button onClick={() => { setFormDate(""); setFormRoom(""); setShowAdd(true) }} disabled={!classId}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Classe</label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger className="w-44"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Année</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder={currentYear?.name || "—"} />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Trimestre</label>
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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Liste des examens</CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Aucun examen pour cette sélection</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matière</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Horaire</TableHead>
                  <TableHead>Salle</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map(e => {
                  const subj = subjectMap.get(Number(e.subjectId))
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{subj?.name || "—"}</TableCell>
                      <TableCell>{e.date || "—"}</TableCell>
                      <TableCell>{e.startTime?.slice(0, 5)} – {e.endTime?.slice(0, 5)}</TableCell>
                      <TableCell>{e.room || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditOpen(e)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(e.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add exam dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nouvel examen</DialogTitle><DialogDescription>Ajouter un examen au programme</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium">Matière</label>
              <Select value={formSubjectId} onValueChange={v => setFormSubjectId(v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {classSubjectList.length === 0 ? (
                    <SelectItem value="__placeholder__" disabled>Aucune matière assignée — ajoutez-en dans la classe</SelectItem>
                  ) : classSubjectList.map((cs: any) => (
                    <SelectItem key={cs.subjectId} value={String(cs.subjectId)}>{cs.subject?.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Date</label>
              <Input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium">Début</label>
                <Input type="time" value={formStart} onChange={e => setFormStart(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium">Fin</label>
                <Input type="time" value={formEnd} onChange={e => setFormEnd(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Salle</label>
              <Input value={formRoom} onChange={e => setFormRoom(e.target.value)} placeholder="ex: Salle 1" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Annuler</Button>
              <Button onClick={handleCreate}><Save className="h-4 w-4 mr-2" /> Ajouter</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk generate dialog */}
      <Dialog open={showBulk} onOpenChange={setShowBulk}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Générer le planning d&apos;examens</DialogTitle>
          <DialogDescription>Créer des examens pour toutes les matières sélectionnées en une fois</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Matières</label>
              <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-1">
                {classSubjectList.map((cs: any) => (
                  <label key={cs.subjectId} className="flex items-center space-x-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bulkSubjectIds.includes(String(cs.subjectId))}
                      onChange={() => toggleBulkSubject(String(cs.subjectId))}
                      className="h-4 w-4"
                    />
                    <span>{cs.subject?.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Date de début</label>
              <Input type="date" value={bulkStartDate} onChange={e => setBulkStartDate(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium">Début</label>
                <Input type="time" value={bulkStartTime} onChange={e => setBulkStartTime(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium">Fin</label>
                <Input type="time" value={bulkEndTime} onChange={e => setBulkEndTime(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium">Salle</label>
                <Input value={bulkRoom} onChange={e => setBulkRoom(e.target.value)} placeholder="ex: Salle 1" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium">Intervalle (jours)</label>
                <Input type="number" min={1} value={bulkDaysGap} onChange={e => setBulkDaysGap(Number(e.target.value))} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBulk(false)}>Annuler</Button>
              <Button onClick={handleBulkCreate} disabled={bulkSubjectIds.length === 0 || !bulkStartDate}>
                <Zap className="h-4 w-4 mr-2" /> Générer ({bulkSubjectIds.length} examens)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit exam dialog */}
      <Dialog open={!!editExam} onOpenChange={() => setEditExam(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Modifier l&apos;examen</DialogTitle></DialogHeader>
          {editExam && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium">Matière</label>
                <p className="text-sm py-1.5">{subjectMap.get(Number(editExam.subjectId))?.name || "—"}</p>
              </div>
              <div>
                <label className="text-xs font-medium">Date</label>
                <Input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-medium">Début</label>
                  <Input type="time" value={editStart} onChange={e => setEditStart(e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium">Fin</label>
                  <Input type="time" value={editEnd} onChange={e => setEditEnd(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Salle</label>
                <Input value={editRoom} onChange={e => setEditRoom(e.target.value)} placeholder="ex: Salle 1" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditExam(null)}>Annuler</Button>
                <Button onClick={handleEditSave}><Save className="h-4 w-4 mr-2" /> Enregistrer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
