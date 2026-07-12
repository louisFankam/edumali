"use client"

import { useState, useMemo, useCallback, useRef } from "react"
import { AppLayout } from "@/components/app-layout"
import { HelpButton } from "@/components/help-button"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, ImageIcon, Printer, ArrowLeft, AlertCircle } from "lucide-react"
import { useClasses } from "@/hooks/use-classes"
import { useStudents } from "@/hooks/use-students"
import { useSchoolInfo } from "@/hooks/use-school-info"
import { useAcademicYears } from "@/hooks/use-settings"
import { cn } from "@/lib/utils"
import { buildIdCardHTML, idCardStyles } from "@/lib/id-card/template"
import { IdCard } from "@/components/id-card"

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase()
}

function formatDateDDMMYYYY(dateStr: string) {
  if (!dateStr) return "-"
  const d = new Date(dateStr)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export function IdCardsClient() {
  const [selectedClassId, setSelectedClassId] = useState("")
  const [showPrintView, setShowPrintView] = useState(false)
  const [localPhotos, setLocalPhotos] = useState<Record<string, string>>({})
  const [savingPhotoId, setSavingPhotoId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null)
  const [capByClass, setCapByClass] = useState<Record<string, string>>({})

  const { classes, isLoading: classesLoading } = useClasses()
  const { currentYear } = useAcademicYears()
  const { schoolInfo } = useSchoolInfo()
  const { students, isLoading: studentsLoading, editStudent } = useStudents({
    classId: selectedClassId || undefined,
    academicYearId: currentYear?.id,
  })

  const selectedClassName = useMemo(
    () => classes.find((c) => c.id === selectedClassId)?.name ?? "",
    [classes, selectedClassId],
  )

  const visibleStudents = useMemo(() => {
    if (!selectedClassId) return []
    return students
  }, [students, selectedClassId])

  const allHavePhotos = useMemo(() => {
    if (visibleStudents.length === 0) return false
    return visibleStudents.every((s) => {
      if (s.photo) return true
      if (localPhotos[s.id]) return true
      return false
    })
  }, [visibleStudents, localPhotos])

  const photoCount = useMemo(
    () =>
      visibleStudents.filter((s) => {
        if (s.photo) return true
        if (localPhotos[s.id]) return true
        return false
      }).length,
    [visibleStudents, localPhotos],
  )

  const getStudentPhoto = useCallback(
    (student: { id: string; photo?: string }) => {
      return localPhotos[student.id] || student.photo || ""
    },
    [localPhotos],
  )

  const openFilePicker = useCallback((studentId: string) => {
    setPendingStudentId(studentId)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
      fileInputRef.current.click()
    }
  }, [])

  const handleFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const studentId = pendingStudentId
      if (!studentId) return

      const file = e.target.files?.[0]
      if (!file) return

      setError(null)
      const reader = new FileReader()
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string
        setLocalPhotos((prev) => ({ ...prev, [studentId]: base64 }))
        setSavingPhotoId(studentId)
        try {
          await editStudent(studentId, { photo: base64 })
        } catch {
          setError("Erreur lors de la sauvegarde de la photo")
        } finally {
          setSavingPhotoId(null)
          setPendingStudentId(null)
        }
      }
      reader.onerror = () => {
        setError("Erreur lors de la lecture du fichier")
        setPendingStudentId(null)
      }
      reader.readAsDataURL(file)
    },
    [pendingStudentId, editStudent],
  )

  const handlePrintSingle = useCallback(
    (student: (typeof visibleStudents)[number]) => {
      const photo = localPhotos[student.id] || student.photo || ""
      const capName = capByClass[selectedClassId] || ""
      const printWin = window.open("", "_blank")
      if (!printWin) return

      const cardHtml = buildIdCardHTML(student, schoolInfo, photo, selectedClassName, currentYear?.name || "", capName)
      const styles = `
        @page { margin: 0; size: A4 portrait; }
        body {
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: white;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        ${idCardStyles}
      `

      printWin.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Carte d'identité - ${student.firstName} ${student.lastName}</title><style>${styles}</style></head><body>${cardHtml}</body></html>`)
      printWin.document.close()
      printWin.focus()
      setTimeout(() => printWin.print(), 300)
    },
    [localPhotos, capByClass, selectedClassId, schoolInfo, selectedClassName, currentYear],
  )

  const handlePrint = () => {
    window.print()
  }

  const cardPages = useMemo(() => {
    if (!showPrintView) return []
    const pages: (typeof visibleStudents)[] = []
    for (let i = 0; i < visibleStudents.length; i += 8) {
      pages.push(visibleStudents.slice(i, i + 8))
    }
    return pages
  }, [visibleStudents, showPrintView])

  if (showPrintView) {
    return (
      <>
        <style>{`
          @media print {
            @page { margin: 0; size: A4 portrait; }
            body { margin: 8mm; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .no-print { display: none !important; }
            .print-page { page-break-after: always; }
            .print-page:last-child { page-break-after: avoid; }
          }
          .id-card {
            height: 65mm;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .id-cards-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3mm;
            padding: 2mm;
          }
          .print-page { padding: 3mm 0; }
          @media screen {
            .id-cards-grid { max-width: 210mm; margin: 0 auto; }
          }
          ${idCardStyles}
        `}</style>

        <div className="no-print flex items-center justify-between p-4 border-b bg-white sticky top-0 z-50">
          <Button variant="outline" onClick={() => setShowPrintView(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="text-sm text-muted-foreground">
            {visibleStudents.length} élève{visibleStudents.length > 1 ? "s" : ""} • {cardPages.length} page
            {cardPages.length > 1 ? "s" : ""}
          </div>
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
        </div>

        <div className="p-4 bg-gray-50 print:bg-white">
          {cardPages.map((pageStudents, pageIdx) => (
            <div key={pageIdx} className="print-page">
              <div className="id-cards-grid">
                {pageStudents.map((student) => (
                  <IdCard
                    key={student.id}
                    student={student}
                    schoolInfo={schoolInfo}
                    photo={getStudentPhoto(student)}
                    selectedClassName={selectedClassName}
                    currentYearName={currentYear?.name || ""}
                    capName={capByClass[selectedClassId] || ""}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
  )
}

  return (
    <AppLayout>
      <PageHeader title="Cartes d'identité" description="Générer les cartes d'identité des élèves">
  <HelpButton section="eleves" />
</PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Sélectionner une classe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="space-y-2">
              <Label>Classe</Label>
              <Select
                value={selectedClassId}
                onValueChange={(v) => {
                  setSelectedClassId(v)
                  setShowPrintView(false)
                  setLocalPhotos({})
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Choisir une classe" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedClassId && (
              <div className="space-y-2">
                <Label>Nom du CAP</Label>
                <Input
                  placeholder="Ex: C.A.P de Sogoniko"
                  value={capByClass[selectedClassId] || ""}
                  onChange={(e) =>
                    setCapByClass((prev) => ({ ...prev, [selectedClassId]: e.target.value }))
                  }
                  className="w-64"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      {!selectedClassId ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Sélectionnez une classe pour commencer
          </CardContent>
        </Card>
      ) : studentsLoading ? (
        <Card>
          <CardContent className="p-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {photoCount}/{visibleStudents.length} élève
                {visibleStudents.length > 1 ? "s" : ""} ont une photo
              </p>
              <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    allHavePhotos ? "bg-green-500" : "bg-blue-500",
                  )}
                  style={{
                    width: `${
                      visibleStudents.length > 0
                        ? (photoCount / visibleStudents.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            <Button
              onClick={() => setShowPrintView(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Printer className="h-4 w-4 mr-2" />
              Générer les cartes
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Élève</TableHead>
                    <TableHead>Date naissance</TableHead>
                    <TableHead>Domicile</TableHead>
                    <TableHead>Photo</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleStudents.map((student) => {
                    const photoUrl = getStudentPhoto(student)
                    const isSaving = savingPhotoId === student.id
                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              {photoUrl ? (
                                <AvatarImage
                                  src={photoUrl}
                                  alt={`${student.firstName} ${student.lastName}`}
                                />
                              ) : null}
                              <AvatarFallback>
                                {getInitials(student.firstName, student.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDateDDMMYYYY(student.birthDate)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                          {student.address || "—"}
                        </TableCell>
                        <TableCell>
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt="Photo"
                              className="h-14 w-11 object-cover rounded border"
                            />
                          ) : (
                            <div className="h-14 w-11 rounded border border-dashed flex items-center justify-center text-muted-foreground bg-muted/30">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {photoUrl ? (
                            <Badge variant="default" className="bg-green-600">
                              Photo prise
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              En attente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openFilePicker(student.id)}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <ImageIcon className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrintSingle(student)}
                              disabled={!photoUrl}
                              title="Imprimer la carte"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </AppLayout>
  )
}


