"use client"

import { useState, useRef, useMemo } from "react"
import { AppLayout } from "@/components/app-layout"
import { HelpButton } from "@/components/help-button"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Users, BookOpen, Star, CheckCircle, Eye, Printer, AlertCircle, FileText, ClipboardList } from "lucide-react"
import { useClasses } from "@/hooks/use-classes"
import { useSubjects } from "@/hooks/use-settings"
import { useAcademicYears, useSchoolInfo } from "@/hooks/use-settings"
import { useBulletins, type BulletinData, type StudentBulletin, type AnnualBulletinData, type AnnualStudentResult } from "@/hooks/use-bulletins"
import { fmt, escHtml } from "@/lib/reports/helpers"
import { buildBulletinHTML, buildBulletinDocument, bulletinStyles, previewStyles, type StudentBulletinData } from "@/lib/reports/bulletin"
import { buildAnnualBulletinHTML, buildAnnualBulletinDocument, annualBulletinStyles, annualPreviewStyles, type AnnualStudentBulletinData } from "@/lib/reports/bulletin"

export default function BulletinPage() {
  const { classes } = useClasses()
  const { schoolInfo } = useSchoolInfo()
  const { years, currentYear } = useAcademicYears()

  const [classId, setClassId] = useState("")
  const [trimester, setTrimester] = useState("1")
  const [includeAbsentCoeff, setIncludeAbsentCoeff] = useState(false)
  const [data, setData] = useState<BulletinData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [previewStudent, setPreviewStudent] = useState<StudentBulletin | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [annualMode, setAnnualMode] = useState(false)
  const [selectedTrimesters, setSelectedTrimesters] = useState<number[]>([1, 2])
  const [annualData, setAnnualData] = useState<AnnualBulletinData | null>(null)
  const [annualPreviewStudent, setAnnualPreviewStudent] = useState<AnnualStudentResult | null>(null)
  const [showAnnualPreview, setShowAnnualPreview] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const toggleTrimester = (t: number) => {
    if (t === 1 || t === 2) return // always included
    setSelectedTrimesters(prev =>
      prev.includes(t) ? prev.filter(v => v !== t) : [...prev, t]
    )
  }

  const handleGenerate = async () => {
    if (!classId || !currentYear?.id) return
    setIsLoading(true)
    setError(null)
    setData(null)
    setAnnualData(null)
    try {
      const params = new URLSearchParams({
        classId,
        academicYearId: String(currentYear.id),
      })
      if (annualMode) {
        params.set("annual", "true")
        params.set("trimesters", selectedTrimesters.join(","))
      } else {
        if (!trimester) { setIsLoading(false); return }
        params.set("trimester", trimester)
      }
      if (includeAbsentCoeff) params.set("includeAbsentCoeff", "true")
      const res = await window.fetch(`/api/bulletins?${params}`)
      const json = await res.json()
      if (json.ok) {
        if (annualMode) setAnnualData(json.data)
        else setData(json.data)
      } else setError(json.message)
    } catch (e: any) {
      setError(String(e))
    } finally {
      setIsLoading(false)
    }
  }

  const totalStudents = data?.students?.length ?? annualData?.students?.length ?? 0

  const handlePreview = (student: StudentBulletin) => {
    setPreviewStudent(student)
    setShowPreview(true)
  }

  const mapStudent = (s: StudentBulletin): StudentBulletinData => ({
    lastName: s.lastName,
    firstName: s.firstName,
    subjects: s.subjects,
    generalAverage: s.generalAverage,
    rank: s.rank,
    totalStudents,
    mention: s.mention,
    totalActiveCoeffs: s.totalActiveCoeffs,
    weightedSum: s.weightedSum,
  })

  const mapAnnualStudent = (s: AnnualStudentResult): AnnualStudentBulletinData => ({
    lastName: s.lastName,
    firstName: s.firstName,
    subjects: s.subjects.map(subj => ({
      subjectName: subj.subjectName,
      coefficient: subj.coefficient,
      trimesterAverages: subj.trimesterAverages,
      annualAverage: subj.annualAverage,
      points: subj.points,
    })),
    annualGeneralAverage: s.annualGeneralAverage,
    annualRank: s.annualRank,
    totalStudents: s.totalStudents,
    totalPoints: s.totalPoints,
    totalCoeffs: s.totalCoeffs,
    admis: s.admis,
  })

  const handleAnnualPreview = (student: AnnualStudentResult) => {
    setAnnualPreviewStudent(student)
    setShowAnnualPreview(true)
  }

  const handlePrintAnnualStudent = (student: AnnualStudentResult) => {
    const printWin = window.open("", "_blank")
    if (!printWin) return
    const lUrl = schoolInfo?.logoUrl || ""
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Bulletin annuel - ${student.lastName} ${student.firstName}</title><style>${annualBulletinStyles}</style></head><body><div class="bulletin" style="width:auto">${buildAnnualBulletinHTML(mapAnnualStudent(student), schoolName, schoolAddress, schoolPhone, directorName, academicYearName, annualData?.className || "", annualData?.trimesters || [1, 2], lUrl)}</div></body></html>`
    printWin.document.write(html)
    printWin.document.close()
    printWin.print()
  }

  const handlePrintAllAnnual = () => {
    if (!annualData) return
    const lUrl = schoolInfo?.logoUrl || ""
    const html = buildAnnualBulletinDocument(annualData.students.map(mapAnnualStudent), schoolName, schoolAddress, schoolPhone, directorName, academicYearName, annualData.className, annualData.trimesters, lUrl)
    const printWin = window.open("", "_blank")
    if (!printWin) return
    printWin.document.write(html)
    printWin.document.close()
    printWin.print()
  }

  const handlePrintStudent = (student: StudentBulletin) => {
    const printWin = window.open("", "_blank")
    if (!printWin) return
    const lUrl = schoolInfo?.logoUrl || ""
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Bulletin - ${student.lastName} ${student.firstName}</title><style>${bulletinStyles}</style></head><body><div class="bulletin" style="width:auto">${buildBulletinHTML(mapStudent(student), schoolName, schoolAddress, schoolPhone, directorName, academicYearName, data?.className || "", data?.trimester || 1, lUrl)}</div></body></html>`
    printWin.document.write(html)
    printWin.document.close()
    printWin.print()
  }

  const handlePrintAll = () => {
    if (!data) return
    const lUrl = schoolInfo?.logoUrl || ""
    const html = buildBulletinDocument(data.students.map(mapStudent), schoolName, schoolAddress, schoolPhone, directorName, academicYearName, data.className, data.trimester, lUrl)
    const printWin = window.open("", "_blank")
    if (!printWin) return
    printWin.document.write(html)
    printWin.document.close()
    printWin.print()
  }

  const schoolName = schoolInfo?.name || "Établissement scolaire"
  const schoolAddress = schoolInfo?.address || ""
  const schoolPhone = schoolInfo?.phone || ""
  const directorName = schoolInfo?.director || "Le Directeur"
  const academicYearName = currentYear?.name || years[0]?.name || ""

  const displayedStudents = data?.students.filter(s => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return s.lastName.toLowerCase().includes(q) || s.firstName.toLowerCase().includes(q)
  }) || []

  const classAverage = displayedStudents.length > 0
    ? Math.round((displayedStudents.reduce((sum, s) => sum + (s.generalAverage || 0), 0) / displayedStudents.length) * 100) / 100
    : null

  const successRate = displayedStudents.length > 0
    ? Math.round((displayedStudents.filter(s => (s.generalAverage || 0) >= 10).length / displayedStudents.length) * 100)
    : null

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader title="Bulletins" description="Générer les bulletins scolaires par classe et trimestre">
          <HelpButton section="notes" />
          {data && (
            <Button variant="outline" onClick={handlePrintAll}>
              <Printer className="h-4 w-4 mr-2" /> Tout imprimer
            </Button>
          )}
          {annualData && (
            <Button variant="outline" onClick={handlePrintAllAnnual}>
              <Printer className="h-4 w-4 mr-2" /> Tout imprimer
            </Button>
          )}
        </PageHeader>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1.5">
                <Label className="text-xs">Classe</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Sélectionner une classe" /></SelectTrigger>
                  <SelectContent>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {annualMode ? (
                <div className="space-y-1.5">
                  <Label className="text-xs">Trimestres</Label>
                  <div className="flex items-center gap-3 pt-1.5">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input type="checkbox" checked={true} disabled className="h-4 w-4" />
                      T1
                    </label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input type="checkbox" checked={true} disabled className="h-4 w-4" />
                      T2
                    </label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTrimesters.includes(3)}
                        onChange={() => toggleTrimester(3)}
                        className="h-4 w-4"
                      />
                      T3
                    </label>
                  </div>
                </div>
              ) : (
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
              )}
              <div className="space-y-1.5">
                <Label className="text-xs">Année académique</Label>
                <Select value={currentYear?.id || ""} disabled>
                  <SelectTrigger className="w-44"><SelectValue placeholder={currentYear?.name || years[0]?.name || "—"} /></SelectTrigger>
                </Select>
              </div>
              <div className="flex items-center gap-2 pb-1.5">
                <input
                  type="checkbox"
                  id="includeAbsentCoeff"
                  checked={includeAbsentCoeff}
                  onChange={e => setIncludeAbsentCoeff(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="includeAbsentCoeff" className="text-xs cursor-pointer leading-none">
                  Compter les coeff. des absents
                </Label>
              </div>
              <Button onClick={handleGenerate} disabled={isLoading || !classId}>
                {isLoading ? "Génération..." : <><FileText className="h-4 w-4 mr-2" /> Générer</>}
              </Button>
              <Button
                variant={annualMode ? "default" : "outline"}
                onClick={() => {
                  setAnnualMode(!annualMode)
                  setData(null)
                  setAnnualData(null)
                  setError(null)
                }}
              >
                <ClipboardList className="h-4 w-4 mr-2" /> {annualMode ? "Mode trimestriel" : "Bulletin annuel"}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </CardContent>
        </Card>

        {data && !annualMode && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Élèves</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.studentCount}</div>
                  <p className="text-xs text-muted-foreground">Inscrits dans la classe</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Matières</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.subjectCount}</div>
                  <p className="text-xs text-muted-foreground">Évaluées ce trimestre</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Moyenne classe</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{classAverage !== null ? `${classAverage}/20` : "—"}</div>
                  <p className="text-xs text-muted-foreground">Générale</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taux réussite</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{successRate !== null ? `${successRate}%` : "—"}</div>
                  <p className="text-xs text-muted-foreground">Moyenne ≥ 10</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Bulletins générés</CardTitle>
                    <CardDescription>
                      {data.className} - Trimestre {data.trimester} - {data.studentCount} élève{data.studentCount > 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  <div className="relative w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full h-9 pl-10 pr-3 rounded-md border border-input bg-background text-sm"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Élève</TableHead>
                      <TableHead className="text-center">Moy. générale</TableHead>
                      <TableHead className="text-center">Rang</TableHead>
                      <TableHead>Mention</TableHead>
                      <TableHead className="text-center">Absences</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedStudents.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucun élève trouvé</TableCell></TableRow>
                    ) : displayedStudents.map(s => (
                      <TableRow key={s.studentId} className={s.generalAverage === null ? "text-muted-foreground" : ""}>
                        <TableCell className="font-medium">
                          {s.lastName} {s.firstName}
                          {s.generalAverage === null && <Badge variant="outline" className="ml-2 text-xs">Absent total</Badge>}
                        </TableCell>
                        <TableCell className="text-center">
                          {s.generalAverage !== null ? (
                            <Badge variant={s.generalAverage >= 10 ? "success" : "destructive"}>
                              {s.generalAverage.toFixed(2).replace(".", ",")}/20
                            </Badge>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-center">{s.rank || "—"}</TableCell>
                        <TableCell>{s.mention}</TableCell>
                        <TableCell className="text-center">{s.absentCount > 0 ? <span className="text-amber-600">{s.absentCount}</span> : "0"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="outline" size="sm" onClick={() => handlePreview(s)}>
                              <Eye className="h-3.5 w-3.5 mr-1" /> Voir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {annualData && annualMode && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Élèves</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{annualData.studentCount}</div>
                  <p className="text-xs text-muted-foreground">Dans la classe</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Matières</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{annualData.subjectCount}</div>
                  <p className="text-xs text-muted-foreground">Évaluées</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Moy. annuelle classe</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(() => {
                      const avgs = annualData.students.map(s => s.annualGeneralAverage).filter(Boolean) as number[]
                      return avgs.length > 0 ? `${(avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(2).replace(".", ",")}/20` : "—"
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground">Générale</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taux réussite</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(() => {
                      const avgs = annualData.students.map(s => s.annualGeneralAverage).filter(Boolean) as number[]
                      return avgs.length > 0 ? `${Math.round((avgs.filter(a => a >= 10).length / avgs.length) * 100)}%` : "—"
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground">Moyenne ≥ 10</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Bulletins annuels générés</CardTitle>
                    <CardDescription>
                      {annualData.className} - Synthèse {annualData.trimesters.map(t => `T${t}`).join("/")} - {annualData.studentCount} élève{annualData.studentCount > 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  <div className="relative w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full h-9 pl-10 pr-3 rounded-md border border-input bg-background text-sm"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Élève</TableHead>
                      <TableHead className="text-center">Moy. annuelle</TableHead>
                      <TableHead className="text-center">Points</TableHead>
                      <TableHead className="text-center">Rang ann.</TableHead>
                      <TableHead className="text-center">Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const displayed = annualData.students.filter(s => {
                        if (!searchTerm) return true
                        const q = searchTerm.toLowerCase()
                        return s.lastName.toLowerCase().includes(q) || s.firstName.toLowerCase().includes(q)
                      })
                      return displayed.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun élève trouvé</TableCell></TableRow>
                      ) : displayed.map(s => (
                        <TableRow key={s.studentId}>
                          <TableCell className="font-medium">{s.lastName} {s.firstName}</TableCell>
                          <TableCell className="text-center">
                            {s.annualGeneralAverage !== null ? (
                              <Badge variant={s.annualGeneralAverage >= 10 ? "success" : "destructive"}>
                                {s.annualGeneralAverage.toFixed(2).replace(".", ",")}/20
                              </Badge>
                            ) : "—"}
                          </TableCell>
                          <TableCell className="text-center font-medium">{s.totalPoints.toFixed(2).replace(".", ",")}</TableCell>
                          <TableCell className="text-center">{s.annualRank ? `${s.annualRank}/${s.totalStudents}` : "—"}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={s.admis ? "success" : "destructive"}>
                              {s.admis ? "Admis" : "Échoué"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => handleAnnualPreview(s)}>
                              <Eye className="h-3.5 w-3.5 mr-1" /> Voir
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    })()}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent style={{ width: '148mm', maxWidth: '148mm', height: '210mm' }} className="overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulletin - {previewStudent?.lastName} {previewStudent?.firstName}</DialogTitle>
          </DialogHeader>
          {previewStudent && data && (
            <div>
              <style>{previewStyles}</style>
              <div className="bulletin" dangerouslySetInnerHTML={{
                __html: buildBulletinHTML(mapStudent(previewStudent), schoolName, schoolAddress, schoolPhone, directorName, academicYearName, data?.className || "", data?.trimester || 1, schoolInfo?.logoUrl || "")
              }} />

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowPreview(false)}>Fermer</Button>
                <Button onClick={handlePrintStudent.bind(null, previewStudent)}>
                  <Printer className="h-4 w-4 mr-2" /> Imprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAnnualPreview} onOpenChange={setShowAnnualPreview}>
        <DialogContent style={{ width: '148mm', maxWidth: '148mm', height: '210mm' }} className="overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulletin annuel - {annualPreviewStudent?.lastName} {annualPreviewStudent?.firstName}</DialogTitle>
          </DialogHeader>
          {annualPreviewStudent && annualData && (
            <div>
              <style>{annualPreviewStyles}</style>
              <div className="bulletin" dangerouslySetInnerHTML={{
                __html: buildAnnualBulletinHTML(mapAnnualStudent(annualPreviewStudent), schoolName, schoolAddress, schoolPhone, directorName, academicYearName, annualData.className, annualData.trimesters, schoolInfo?.logoUrl || "")
              }} />

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowAnnualPreview(false)}>Fermer</Button>
                <Button onClick={handlePrintAnnualStudent.bind(null, annualPreviewStudent)}>
                  <Printer className="h-4 w-4 mr-2" /> Imprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
