"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Save, Users, CheckCircle, XCircle } from "lucide-react"
import { useClassSubjects } from "@/hooks/use-class-subjects"
import { useTeachers } from "@/hooks/use-teachers"

export function AffectationsPanel({ classes, allSubjects }: { classes: any[]; allSubjects: any[] }) {
  const [selectedClassId, setSelectedClassId] = useState("")
  const { subjects: assigned, isLoading, save } = useClassSubjects(selectedClassId || undefined)
  const { teachers } = useTeachers()
  const [assignments, setAssignments] = useState<Record<string, { checked: boolean; coefficient: number; teacherId?: string | null }>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const map: Record<string, { checked: boolean; coefficient: number; teacherId?: string | null }> = {}
    for (const a of assigned) {
      map[a.subjectId] = { checked: true, coefficient: a.coefficient, teacherId: a.teacherId }
    }
    for (const s of allSubjects) {
      if (!map[s.id]) map[s.id] = { checked: false, coefficient: s.coefficient || 1, teacherId: null }
    }
    setAssignments(map)
  }, [assigned, allSubjects])

  const handleToggle = (subjectId: string) => {
    setAssignments(prev => ({
      ...prev,
      [subjectId]: { ...prev[subjectId], checked: !prev[subjectId]?.checked },
    }))
  }

  const handleCoeff = (subjectId: string, value: string) => {
    const coeff = parseInt(value) || 1
    setAssignments(prev => ({
      ...prev,
      [subjectId]: { ...prev[subjectId], checked: prev[subjectId]?.checked ?? false, coefficient: coeff },
    }))
  }

  const handleTeacher = (subjectId: string, teacherId: string) => {
    setAssignments(prev => ({
      ...prev,
      [subjectId]: { ...prev[subjectId], checked: prev[subjectId]?.checked ?? false, teacherId: teacherId || null },
    }))
  }

  const handleSave = async () => {
    if (!selectedClassId) return
    setSaving(true)
    const data = Object.entries(assignments)
      .filter(([, v]) => v.checked)
      .map(([subjectId, v]) => ({ subjectId: Number(subjectId), coefficient: v.coefficient, teacherId: v.teacherId ? Number(v.teacherId) : null }))
    await save(data)
    setSaving(false)
  }

  const hasChanges = () => {
    if (!selectedClassId) return false
    for (const subj of allSubjects) {
      const state = assignments[subj.id] || { checked: false, coefficient: 1, teacherId: null }
      const existing = assigned.find(a => a.subjectId === subj.id)
      const wasChecked = !!existing
      const wasCoeff = existing?.coefficient || 1
      const wasTeacherId = existing?.teacherId || null
      if (state.checked !== wasChecked || state.coefficient !== wasCoeff || state.teacherId !== wasTeacherId) return true
    }
    return false
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="space-y-1.5 flex-1 max-w-xs">
          <Label>Classe</Label>
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger><SelectValue placeholder="Sélectionner une classe" /></SelectTrigger>
            <SelectContent>
              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {selectedClassId && (
          <Button onClick={handleSave} disabled={saving || !hasChanges()}>
            {saving ? "Enregistrement..." : <><Save className="h-4 w-4 mr-2" />Enregistrer</>}
          </Button>
        )}
      </div>

      {!selectedClassId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Sélectionnez une classe</h3>
            <p className="text-muted-foreground text-center">
              Choisissez une classe pour gérer ses matières et coefficients.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Assignée</TableHead>
                  <TableHead>Matière</TableHead>
                  <TableHead className="w-32">Coefficient</TableHead>
                  <TableHead>Enseignant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allSubjects.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Aucune matière. Créez d'abord des matières.</TableCell></TableRow>
                ) : (
                  allSubjects.map(s => {
                    const state = assignments[s.id] || { checked: false, coefficient: s.coefficient || 1, teacherId: null }
                    return (
                      <TableRow key={s.id}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 w-8 p-0 ${state.checked ? "text-green-600" : "text-muted-foreground"}`}
                            onClick={() => handleToggle(s.id)}
                          >
                            {state.checked ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            className="w-20 h-9 text-center"
                            value={state.coefficient}
                            onChange={e => handleCoeff(s.id, e.target.value)}
                            disabled={!state.checked}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={state.teacherId ?? ""}
                            onValueChange={(val) => handleTeacher(s.id, val)}
                            disabled={!state.checked}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Non assigné" />
                            </SelectTrigger>
                            <SelectContent>
                              {teachers.map(t => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
