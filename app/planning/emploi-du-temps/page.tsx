"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useClasses } from "@/hooks/use-classes"
import { useAcademicYears, useSchoolInfo, useSubjects } from "@/hooks/use-settings"
import { useSchedules } from "@/hooks/use-schedules"
import { Clock, Plus, Trash2, Download, Pencil, Save } from "lucide-react"

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]

function fmtTime(t: string) {
  return t.slice(0, 5)
}

export default function EmploiDuTempsPage() {
  const { classes } = useClasses()
  const { schoolInfo } = useSchoolInfo()
  const { years, currentYear } = useAcademicYears()
  const { subjects: allSubjects } = useSubjects()

  const [classId, setClassId] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const { slots, create, update, remove, refetch } = useSchedules(classId, selectedYear)

  const [classSubjects, setClassSubjects] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [showAddRow, setShowAddRow] = useState(false)
  const [newRowStart, setNewRowStart] = useState("08:00")
  const [newRowEnd, setNewRowEnd] = useState("09:00")
  const [editSlot, setEditSlot] = useState<any>(null)
  const [editSubjectId, setEditSubjectId] = useState("")
  const [editTeacherId, setEditTeacherId] = useState("")
  const [draggedSubj, setDraggedSubj] = useState<any>(null)

  useEffect(() => {
    if (!currentYear) return
    setSelectedYear(String(currentYear.id))
  }, [currentYear])

  useEffect(() => {
    if (!classId) return
    window.fetch(`/api/class-subjects?classId=${classId}`)
      .then(r => r.json()).then(j => { if (j.ok) setClassSubjects(j.data) }).catch(() => {})
    window.fetch(`/api/teachers?limit=200`)
      .then(r => r.json()).then(j => { if (j.ok) setTeachers(j.data || j) }).catch(() => {})
  }, [classId])

  const subjectMap = useMemo(() => {
    const m = new Map<number, any>()
    allSubjects.forEach(s => m.set(Number(s.id), s))
    return m
  }, [allSubjects])

  const classSubjectList = useMemo(() => {
    return classSubjects.map((cs: any) => ({
      ...cs,
      subject: subjectMap.get(Number(cs.subjectId)),
    })).filter(cs => cs.subject)
  }, [classSubjects, subjectMap])

  const teacherSubjectMap = useMemo(() => {
    const m = new Map<number, any[]>()
    if (!teachers.length) return m
    teachers.forEach((t: any) => {
      const tid = Number(t.id)
      if (t.subjectIds) {
        t.subjectIds.forEach((sid: number) => {
          if (!m.has(sid)) m.set(sid, [])
          m.get(sid)!.push(t)
        })
      }
    })
    return m
  }, [teachers])

  const timeRows = useMemo(() => {
    const seen = new Set<string>()
    const rows: { startTime: string; endTime: string }[] = []
    slots.forEach(s => {
      const key = s.startTime + "|" + s.endTime
      if (!seen.has(key)) {
        seen.add(key)
        rows.push({ startTime: s.startTime, endTime: s.endTime })
      }
    })
    rows.sort((a, b) => a.startTime.localeCompare(b.startTime))
    return rows
  }, [slots])

  const getSlot = (startTime: string, endTime: string, day: number) => {
    return slots.find(s => s.startTime === startTime && s.endTime === endTime && s.day === day)
  }

  const handleDrop = async (startTime: string, endTime: string, day: number, subjData: any) => {
    if (!classId || !selectedYear) return
    const existing = getSlot(startTime, endTime, day)
    const subjId = Number(subjData.subjectId || subjData.id)
    const csItem = classSubjectList.find((cs: any) => Number(cs.subjectId) === subjId)
    const teacherId = csItem?.teacherId ? Number(csItem.teacherId) : null
    if (existing) {
      await update(existing.id, { subjectId: subjId, teacherId })
    } else {
      await create({
        classId: Number(classId),
        academicYearId: Number(selectedYear),
        day,
        startTime,
        endTime,
        subjectId: subjId,
        teacherId,
      })
    }
  }

  const handleAddRow = async () => {
    if (!classId || !selectedYear) return
    for (let d = 0; d < 5; d++) {
      const existing = getSlot(newRowStart, newRowEnd, d)
      if (!existing) {
        await create({
          classId: Number(classId),
          academicYearId: Number(selectedYear),
          day: d,
          startTime: newRowStart,
          endTime: newRowEnd,
          subjectId: null,
          teacherId: null,
        })
      }
    }
    setShowAddRow(false)
  }

  const handleDeleteRow = async (startTime: string, endTime: string) => {
    const toRemove = slots.filter(s => s.startTime === startTime && s.endTime === endTime)
    for (const s of toRemove) {
      await remove(s.id)
    }
  }

  const handleClearSlot = async (slot: any) => {
    await update(slot.id, { subjectId: null, teacherId: null })
  }

  const handleEditSave = async () => {
    if (!editSlot) return
    await update(editSlot.id, {
      subjectId: editSubjectId && editSubjectId !== "__none__" ? Number(editSubjectId) : null,
      teacherId: editTeacherId && editTeacherId !== "__none__" ? Number(editTeacherId) : null,
    })
    setEditSlot(null)
  }

  const openEdit = (slot: any) => {
    setEditSlot(slot)
    setEditSubjectId(slot.subjectId ? String(slot.subjectId) : "")
    setEditTeacherId(slot.teacherId ? String(slot.teacherId) : "")
  }

  const teachersForSubject = useMemo(() => {
    if (!editSubjectId) return teachers
    const filtered = teacherSubjectMap.get(Number(editSubjectId)) || []
    return filtered.length > 0 ? filtered : teachers
  }, [editSubjectId, teachers, teacherSubjectMap])

  function buildPrintHTML() {
    const logo = schoolInfo?.logoUrl || ""
    const schoolName = schoolInfo?.name || "Établissement"
    const schoolAddr = schoolInfo?.address || ""
    const schoolPhone = schoolInfo?.phone || ""
    const className = classes.find(c => c.id === classId)?.name || ""
    const yearName = years.find(y => y.id === selectedYear)?.name || ""

    let tableRows = timeRows.map(row => {
      const cells = DAYS.map((_, di) => {
        const slot = getSlot(row.startTime, row.endTime, di)
        if (!slot || !slot.subjectId) return "<td></td>"
        const subj = subjectMap.get(Number(slot.subjectId))
        const tch = teachers.find((t: any) => Number(t.id) === slot.teacherId)
        return `<td style="border:1px solid #000;padding:2mm;text-align:center;font-size:8pt">
          <strong>${subj?.name || ""}</strong><br/>
          <span style="font-size:7pt">${tch ? tch.firstName + " " + tch.lastName : ""}</span>
        </td>`
      })
      return `<tr>
        <td style="border:1px solid #000;padding:2mm;font-weight:bold;font-size:8pt;background:#f0f0f0">${fmtTime(row.startTime)} – ${fmtTime(row.endTime)}</td>
        ${cells.join("")}
      </tr>`
    }).join("")

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Emploi du temps - ${className}</title>
    <style>
      @page { size: A4 portrait; margin: 8mm; }
      body { font-family: 'Times New Roman', Times, serif; color: #000; background: #fff; margin: 0; padding: 8mm; }
      .header { text-align: center; margin-bottom: 5mm; }
      .header .logo { text-align: center; margin-bottom: 2mm; }
      .header .logo img { max-height: 18mm; object-fit: contain; }
      .header .school { font-size: 12pt; font-weight: bold; text-transform: uppercase; }
      .header .detail { font-size: 9pt; color: #333; }
      .header .title { font-size: 14pt; font-weight: bold; text-decoration: underline; margin: 3mm 0; }
      .header .subtitle { font-size: 10pt; margin-bottom: 3mm; }
      table { width: 100%; border-collapse: collapse; }
      th { border: 1px solid #000; padding: 2mm; font-size: 9pt; background: #f0f0f0; }
      td { border: 1px solid #000; padding: 2mm; text-align: center; font-size: 8pt; }
      .footer { margin-top: 5mm; display: flex; justify-content: space-between; font-size: 9pt; }
    </style></head><body>
      <div class="header">
        ${logo ? `<div class="logo"><img src="${logo}" alt="Logo" /></div>` : ""}
        <div class="school">${schoolName}</div>
        <div class="detail">${schoolAddr}</div>
        <div class="detail">${schoolPhone}</div>
        <div class="title">EMPLOI DU TEMPS</div>
        <div class="subtitle">${className} — ${yearName}</div>
      </div>
      <table>
        <tr><th>Heure</th>${DAYS.map(d => `<th>${d}</th>`).join("")}</tr>
        ${tableRows}
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
      <PageHeader title="Emploi du temps" description="Gérer les emplois du temps par classe">
        <Button variant="outline" onClick={handlePrint}><Download className="h-4 w-4 mr-2" /> Télécharger</Button>
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
            <Button onClick={() => { setNewRowStart("08:00"); setNewRowEnd("09:00"); setShowAddRow(true) }} disabled={!classId}>
              <Plus className="h-4 w-4 mr-2" /> Ajouter ligne
            </Button>
          </div>
        </CardContent>
      </Card>

      {classId && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {/* Subject palette */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader><CardTitle className="text-sm">Matières</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {classSubjectList.length === 0 && <p className="text-xs text-muted-foreground">Aucune matière assignée</p>}
                {classSubjectList.map((cs: any) => (
                  <div
                    key={cs.subjectId}
                    className="p-2 rounded border cursor-grab hover:bg-accent text-xs"
                    draggable
                    onDragStart={() => setDraggedSubj({ subjectId: cs.subjectId, name: cs.subject?.name })}
                  >
                    <strong>{cs.subject?.name}</strong>
                    {teachersForSubject.length > 0 && (
                      <div className="text-muted-foreground mt-0.5">{teachersForSubject[0]?.firstName} {teachersForSubject[0]?.lastName}</div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Grid */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Grille horaire</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {timeRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">Cliquez sur "Ajouter ligne" pour créer des créneaux</p>
                ) : (
                  <table className="w-full border-collapse border border-gray-300" style={{ minWidth: 600 }}>
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-xs font-medium" style={{ width: 100 }}>Heure</th>
                        {DAYS.map(d => <th key={d} className="border border-gray-300 p-2 text-xs font-medium">{d}</th>)}
                        <th className="border border-gray-300 p-2 text-xs font-medium" style={{ width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeRows.map(row => (
                        <tr key={row.startTime + row.endTime}>
                          <td className="border border-gray-300 p-1.5 text-xs font-medium text-center bg-gray-50">
                            {fmtTime(row.startTime)}<br/>{fmtTime(row.endTime)}
                          </td>
                          {DAYS.map((_, di) => {
                            const slot = getSlot(row.startTime, row.endTime, di)
                            const subj = slot?.subjectId ? subjectMap.get(Number(slot.subjectId)) : null
                            const tch = slot?.teacherId ? teachers.find((t: any) => Number(t.id) === slot.teacherId) : null
                            return (
                              <td
                                key={di}
                                className="border border-gray-300 p-1 text-center text-xs min-h-[48px] cursor-pointer hover:bg-blue-50"
                                onDragOver={e => { e.preventDefault() }}
                                onDrop={e => {
                                  e.preventDefault()
                                  if (draggedSubj) handleDrop(row.startTime, row.endTime, di, draggedSubj)
                                }}
                                onClick={() => slot ? openEdit(slot) : handleDrop(row.startTime, row.endTime, di, classSubjectList[0] || {})}
                                style={{ minWidth: 80, height: 48 }}
                              >
                                {subj ? (
                                  <div className="flex flex-col items-center">
                                    <span className="font-medium">{subj.name}</span>
                                    {tch && <span className="text-[9px] text-muted-foreground">{tch.firstName} {tch.lastName}</span>}
                                    <div className="flex gap-1 mt-1">
                                      <button className="text-[9px] text-blue-600 hover:underline" onClick={e => { e.stopPropagation(); openEdit(slot!) }}><Pencil className="h-3 w-3" /></button>
                                      <button className="text-[9px] text-red-600 hover:underline" onClick={e => { e.stopPropagation(); handleClearSlot(slot!) }}>×</button>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-300 text-[9px]">+</span>
                                )}
                              </td>
                            )
                          })}
                          <td className="border border-gray-300 p-1 text-center">
                            <button className="text-red-500 hover:text-red-700" onClick={() => handleDeleteRow(row.startTime, row.endTime)} title="Supprimer la ligne">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Add row dialog */}
      <Dialog open={showAddRow} onOpenChange={setShowAddRow}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Nouveau créneau</DialogTitle><DialogDescription>Définir l'heure de début et de fin</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium">Début</label>
                <Input type="time" value={newRowStart} onChange={e => setNewRowStart(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium">Fin</label>
                <Input type="time" value={newRowEnd} onChange={e => setNewRowEnd(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddRow(false)}>Annuler</Button>
              <Button onClick={handleAddRow}><Save className="h-4 w-4 mr-2" /> Ajouter</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit slot dialog */}
      <Dialog open={!!editSlot} onOpenChange={() => setEditSlot(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Modifier le créneau</DialogTitle></DialogHeader>
          {editSlot && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium">Matière</label>
                <Select value={editSubjectId} onValueChange={setEditSubjectId}>
                  <SelectTrigger><SelectValue placeholder="Aucune" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Aucune —</SelectItem>
                    {classSubjectList.map((cs: any) => (
                      <SelectItem key={cs.subjectId} value={String(cs.subjectId)}>{cs.subject?.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium">Professeur</label>
                <Select value={editTeacherId} onValueChange={setEditTeacherId}>
                  <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Aucun —</SelectItem>
                    {teachersForSubject.map((t: any) => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.firstName} {t.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditSlot(null)}>Annuler</Button>
                <Button onClick={handleEditSave}><Save className="h-4 w-4 mr-2" /> Enregistrer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
