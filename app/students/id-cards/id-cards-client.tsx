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
  const { students, isLoading: studentsLoading, editStudent } = useStudents({
    classId: selectedClassId || undefined,
  })
  const { schoolInfo } = useSchoolInfo()
  const { currentYear } = useAcademicYears()

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
            @page { margin: 8mm; size: A4 portrait; }
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .no-print { display: none !important; }
            .print-page { page-break-after: always; }
            .print-page:last-child { page-break-after: avoid; }
          }
          .id-cards-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3mm;
            padding: 2mm;
          }
          .print-page { padding: 3mm 0; }

          .id-card {
            border: 1mm solid #111;
            border-radius: 2mm;
            background: white;
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            height: 68mm;
            display: flex;
            flex-direction: column;
            page-break-inside: avoid;
            break-inside: avoid;
            overflow: hidden;
          }

          /* En-tête pays */
          .id-card-country-bar {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5mm 2mm 1mm;
            position: relative;
          }
          .id-card-flag {
            position: absolute;
            left: 2mm;
            top: 1.5mm;
            display: flex;
            flex-direction: row;
            width: 15mm;
            height: 10mm;
            border: 0.3mm solid #333;
          }
          .id-card-flag-green { flex: 1; background: #14b53a; }
          .id-card-flag-yellow { flex: 1; background: #fcd116; }
          .id-card-flag-red { flex: 1; background: #ce1126; }
          .id-card-country {
            font-size: 11pt;
            font-weight: 800;
            letter-spacing: 0.5px;
            color: #000;
          }
          .id-card-devise {
            font-size: 7.5pt;
            color: #555;
            font-style: italic;
            text-align: center;
            padding-bottom: 0.5mm;
          }

          /* Bannière titre */
          .id-card-title-bar {
            background: #b3e5fc;
            text-align: center;
            padding: 1.5mm 2mm;
            position: relative;
          }
          .id-card-title {
            font-size: 11pt;
            font-weight: 800;
            color: #c62828;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          .id-card-year {
            position: absolute;
            right: 2mm;
            top: 50%;
            transform: translateY(-50%);
            font-size: 9pt;
            font-weight: 700;
            color: #c62828;
          }

          /* Bloc CAP */
          .id-card-school-bar {
            text-align: center;
            padding: 1.5mm 2mm;
            border-bottom: 0.5mm solid #111;
          }
          .id-card-school-name {
            font-size: 9pt;
            font-weight: 700;
            color: #1f2937;
          }

          /* Corps */
          .id-card-body {
            display: flex;
            flex: 1;
            padding: 2.5mm;
            gap: 2mm;
          }

          /* Colonne infos */
          .id-card-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.8mm;
            justify-content: center;
          }
          .id-card-row {
            display: flex;
            font-size: 8.5pt;
            line-height: 1.4;
          }
          .id-card-label {
            font-weight: 700;
            color: #1e40af;
            white-space: nowrap;
            margin-right: 2px;
            min-width: 24mm;
          }
          .id-card-value {
            color: #000;
            font-weight: 500;
            word-break: break-word;
          }
          .id-card-director {
            margin-top: 1mm;
            font-size: 7.5pt;
            font-weight: 600;
            color: #1e40af;
          }

          /* Photo */
          .id-card-photo-wrapper {
            flex-shrink: 0;
            display: flex;
            align-items: center;
          }
          .id-card-photo {
            width: 24mm;
            height: 32mm;
            object-fit: cover;
            border: 0.3mm solid #999;
            background: #f5f5f5;
          }
          .id-card-photo-placeholder {
            width: 24mm;
            height: 32mm;
            border: 0.3mm dashed #999;
            background: #f5f5f5;
          }

          @media screen {
            .id-cards-grid { max-width: 210mm; margin: 0 auto; }
          }
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
              disabled={!allHavePhotos}
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openFilePicker(student.id)}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <ImageIcon className="h-4 w-4 mr-1" />
                            )}
                            {photoUrl ? "Changer" : "Choisir"}
                          </Button>
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

function IdCard({
  student,
  schoolInfo,
  photo,
  selectedClassName,
  currentYearName,
  capName,
}: {
  student: {
    id: string
    firstName: string
    lastName: string
    gender: string
    birthDate: string
    parentName: string
    parentPhone: string
    address?: string
  }
  schoolInfo: { name: string; director: string } | null
  photo: string
  selectedClassName: string
  currentYearName: string
  capName: string
}) {
  return (
    <div className="id-card">
      {/* En-tête pays */}
      <div className="id-card-country-bar">
        <span className="id-card-flag">
          <span className="id-card-flag-green" />
          <span className="id-card-flag-yellow" />
          <span className="id-card-flag-red" />
        </span>
        <div className="id-card-country">RÉPUBLIQUE DU MALI</div>
      </div>
      <div className="id-card-devise">Un Peuple – Un But – Une Foi</div>

      {/* Bannière titre */}
      <div className="id-card-title-bar">
        <span className="id-card-title">CARTE D&apos;IDENTITÉ SCOLAIRE</span>
        <span className="id-card-year">{currentYearName || ""}</span>
      </div>

      {/* Nom du CAP */}
      <div className="id-card-school-bar">
        <div className="id-card-school-name">
          CAP : {capName || schoolInfo?.name || "Établissement"}
        </div>
      </div>

      {/* Corps */}
      <div className="id-card-body">
        <div className="id-card-info">
          <div className="id-card-row">
            <span className="id-card-label">Nom :</span>
            <span className="id-card-value">{student.lastName}</span>
          </div>
          <div className="id-card-row">
            <span className="id-card-label">Prénoms :</span>
            <span className="id-card-value">{student.firstName}</span>
          </div>
          <div className="id-card-row">
            <span className="id-card-label">Né(e) le :</span>
            <span className="id-card-value">
              {formatDateDDMMYYYY(student.birthDate)}
            </span>
          </div>
          <div className="id-card-row">
            <span className="id-card-label">Classe :</span>
            <span className="id-card-value">{selectedClassName}</span>
          </div>
          <div className="id-card-row">
            <span className="id-card-label">Domicile :</span>
            <span className="id-card-value">{student.address || "—"}</span>
          </div>
          <div className="id-card-director">
            Le Directeur<br/>
            {schoolInfo?.director || ""}
          </div>
        </div>
        <div className="id-card-photo-wrapper">
          {photo ? (
            <img
              src={photo}
              alt={`${student.firstName} ${student.lastName}`}
              className="id-card-photo"
            />
          ) : (
            <div className="id-card-photo-placeholder" />
          )}
        </div>
      </div>
    </div>
  )
}
