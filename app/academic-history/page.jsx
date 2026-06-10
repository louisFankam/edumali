"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/app-layout"
import { HelpButton } from "@/components/help-button"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { StatsGrid } from "@/components/ui/stats-grid"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AcademicRecordModal } from "@/components/academic-history/academic-record-modal"
import { BulletinModal } from "@/components/academic-history/bulletin-modal"
import { ProgressionModal } from "@/components/academic-history/progression-modal"
import { useAcademicOverview } from "@/hooks/use-academic-overview"
import { useClasses } from "@/hooks/use-classes"
import { useAcademicYears, useSchoolInfo } from "@/hooks/use-settings"
import { downloadBulletinPDF } from "@/lib/reports/bulletin"
import { downloadCertificatePDF } from "@/lib/reports/certificate"
import { downloadAttendancePDF } from "@/lib/reports/attendance"
import { downloadClassReportPDF } from "@/lib/reports/class-report"
import { Search, FileText, TrendingUp, Award, Users, BarChart3, Eye, Download, Loader2 } from "lucide-react"

export default function AcademicHistoryPage() {
  const { classes } = useClasses()
  const { years, currentYear } = useAcademicYears()
  const { schoolInfo } = useSchoolInfo()
  const schoolName = schoolInfo?.name || "Établissement scolaire"
  const schoolAddress = schoolInfo?.address || ""
  const schoolPhone = schoolInfo?.phone || ""
  const directorName = schoolInfo?.director || "Le Directeur"
  const logoUrl = schoolInfo?.logoUrl || ""

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedTrimester, setSelectedTrimester] = useState("1")

  useEffect(() => {
    if (!selectedClass && classes.length > 0) {
      setSelectedClass(classes[0].id)
    }
  }, [classes, selectedClass])

  useEffect(() => {
    if (!selectedYear && currentYear?.id) {
      setSelectedYear(String(currentYear.id))
    }
  }, [currentYear, selectedYear])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [showBulletinModal, setShowBulletinModal] = useState(false)
  const [showProgressionModal, setShowProgressionModal] = useState(false)
  const [reportLoading, setReportLoading] = useState("")
  const [certificateOpen, setCertificateOpen] = useState(false)
  const [certificateStudentId, setCertificateStudentId] = useState("")

  const filters = useMemo(() => ({
    classId: selectedClass ? Number(selectedClass) : undefined,
    academicYearId: selectedYear ? Number(selectedYear) : currentYear?.id ? Number(currentYear.id) : undefined,
    trimester: Number(selectedTrimester),
  }), [selectedClass, selectedYear, selectedTrimester, currentYear])

  const { data, isLoading, error } = useAcademicOverview(filters)

  const getStatusBadge = (status) => {
    const statusColors = {
      Admis: "bg-green-100 text-green-800",
      "En cours": "bg-blue-100 text-blue-800",
      Redoublant: "bg-yellow-100 text-yellow-800",
      Exclu: "bg-red-100 text-red-800",
    }
    return <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
  }

  const columns = [
    {
      key: "studentName",
      header: "Élève",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.studentId}</div>
        </div>
      ),
    },
    {
      key: "class",
      header: "Classe",
      sortable: true,
    },
    {
      key: "trimester",
      header: "Période",
      sortable: true,
    },
    {
      key: "averageGrade",
      header: "Moyenne",
      sortable: true,
      render: (value) => <span className="font-semibold text-primary">{value}</span>,
    },
    {
      key: "rank",
      header: "Rang",
      sortable: true,
    },
    {
      key: "status",
      header: "Statut",
      sortable: true,
      render: (value) => getStatusBadge(value),
    },
  ]

  const actions = [
    {
      label: "Voir bulletin",
      icon: Eye,
      onClick: (row) => {
        setSelectedStudent(row)
        setShowBulletinModal(true)
      },
    },
    {
      label: "Voir progression",
      icon: BarChart3,
      onClick: (row) => {
        setSelectedStudent(row)
        setShowProgressionModal(true)
      },
    },
    {
      label: "Dossier complet",
      icon: FileText,
      onClick: (row) => {
        setSelectedStudent(row)
        setShowRecordModal(true)
      },
    },
  ]

  const filteredStudents = useMemo(() => {
    if (!data?.students) return []
    return data.students.filter((record) => {
      const matchesSearch =
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [data, searchTerm])

  const getYearName = useCallback((id) => years.find(y => String(y.id) === String(id))?.name || "", [years])
  const getClassName = useCallback((id) => classes.find(c => String(c.id) === String(id))?.name || "", [classes])

  function getTrimesterDates(yrId, trimester) {
    const year = years.find(y => String(y.id) === String(yrId))
    if (!year) return { from: "", to: "" }
    const start = new Date(year.startDate)
    const end = new Date(year.endDate)
    const duration = (end - start) / 3
    const tStart = trimester === 1 ? start : new Date(start.getTime() + (trimester - 1) * duration)
    const tEnd = trimester === 3 ? end : new Date(start.getTime() + trimester * duration)
    return { from: tStart.toISOString().split("T")[0], to: tEnd.toISOString().split("T")[0] }
  }

  function downloadHTML(html, filename) {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename.replace(/[^a-zA-Z0-9._-]/g, "_")
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function fetchTrimesterStats(classId, academicYearId) {
    const results = await Promise.all(
      [1, 2, 3].map(t =>
        fetch(`/api/bulletins?classId=${classId}&trimester=${t}&academicYearId=${academicYearId}`)
          .then(r => r.json())
          .then(json => {
            if (!json.ok) return { avg: null, studentCount: 0, passRate: 0 }
            const withAvg = json.data.students.filter(s => s.generalAverage !== null)
            const avg = withAvg.length > 0 ? Math.round(withAvg.reduce((s, a) => s + a.generalAverage, 0) / withAvg.length * 100) / 100 : null
            const passed = withAvg.filter(s => s.generalAverage >= 10).length
            return {
              avg,
              studentCount: json.data.students.length,
              passRate: withAvg.length > 0 ? Math.round((passed / withAvg.length) * 100) : 0,
            }
          })
          .catch(() => ({ avg: null, studentCount: 0, passRate: 0 })),
      ),
    )
    return {
      trimesterAverages: results.map(r => r.avg),
      studentCounts: results.map(r => r.studentCount),
      passRates: results.map(r => r.passRate),
    }
  }

  async function fetchAllBulletins(classId, academicYearId) {
    const results = await Promise.all(
      [1, 2, 3].map(t =>
        fetch(`/api/bulletins?classId=${classId}&trimester=${t}&academicYearId=${academicYearId}`)
          .then(r => r.json())
          .catch(() => null),
      ),
    )
    return results.filter(r => r && r.ok).map(r => r.data)
  }

  const handleDownloadBulletins = useCallback(async () => {
    if (!selectedClass || !selectedYear) { toast.error("Veuillez sélectionner une classe et une année scolaire."); return }
    setReportLoading("bulletins")
    try {
      const res = await fetch(`/api/bulletins?classId=${selectedClass}&trimester=${selectedTrimester}&academicYearId=${selectedYear}`)
      const json = await res.json()
      if (!json.ok) throw new Error(json.message)
      const students = json.data.students.map(s => ({
        lastName: s.lastName,
        firstName: s.firstName,
        subjects: s.subjects,
        generalAverage: s.generalAverage,
        rank: s.rank,
        totalStudents: json.data.students.length,
        mention: s.mention,
        totalActiveCoeffs: s.totalActiveCoeffs,
      }))
      const yearName = getYearName(selectedYear)
      await downloadBulletinPDF(students, schoolName, schoolAddress, schoolPhone, directorName, yearName, json.data.className, json.data.trimester, logoUrl)
    } catch (e) {
      toast.error("Erreur : " + e.message)
    } finally {
      setReportLoading("")
    }
  }, [selectedClass, selectedYear, selectedTrimester, schoolName, schoolAddress, schoolPhone, directorName, logoUrl, getYearName])



  const handleGenerateCertificate = useCallback(async () => {
    if (!certificateStudentId || !data) return
    setReportLoading("certificate")
    try {
      const student = data.students.find(s => String(s.id) === certificateStudentId)
      if (!student) throw new Error("Élève introuvable")
      const yearName = getYearName(selectedYear)
      const clsName = getClassName(selectedClass)
      await downloadCertificatePDF({
        studentName: student.studentName,
        studentId: student.studentId,
        className: clsName,
        schoolName,
        schoolAddress,
        schoolPhone,
        directorName,
        academicYearName: yearName,
      })
      setCertificateOpen(false)
      setCertificateStudentId("")
    } catch (e) {
      toast.error("Erreur : " + e.message)
    } finally {
      setReportLoading("")
    }
  }, [certificateStudentId, data, selectedClass, selectedYear, schoolName, schoolAddress, schoolPhone, directorName, getYearName, getClassName])

  const handleDownloadAttendance = useCallback(async () => {
    if (!selectedClass || !selectedYear) { toast.error("Veuillez sélectionner une classe et une année scolaire."); return }
    setReportLoading("attendance")
    try {
      const { from, to } = getTrimesterDates(selectedYear, Number(selectedTrimester))
      const params = new URLSearchParams({ stats: "true", classId: selectedClass })
      if (from) params.set("from", from)
      if (to) params.set("to", to)
      const res = await fetch(`/api/attendance?${params}`)
      const json = await res.json()
      if (!json.ok) throw new Error(json.message)
      const stats = json.data
      const yearName = getYearName(selectedYear)
      const clsName = getClassName(selectedClass)
      await downloadAttendancePDF({
        className: clsName,
        trimester: Number(selectedTrimester),
        academicYearName: yearName,
        schoolName,
        schoolAddress,
        schoolPhone,
        directorName,
        total: stats.total || 0,
        présent: stats["présent"] || 0,
        absent: stats.absent || 0,
        retard: stats.retard || 0,
        congé: stats.congé || 0,
        rate: stats.rate || 0,
      })
    } catch (e) {
      toast.error("Erreur : " + e.message)
    } finally {
      setReportLoading("")
    }
  }, [selectedClass, selectedYear, selectedTrimester, schoolName, schoolAddress, schoolPhone, directorName, getYearName, getClassName])

  const handleExportAllBulletins = useCallback(async () => {
    if (!selectedClass || !selectedYear) { toast.error("Veuillez sélectionner une classe et une année scolaire."); return }
    setReportLoading("bulletins")
    try {
      const bulletinsData = await fetchAllBulletins(selectedClass, selectedYear)
      if (bulletinsData.length === 0) throw new Error("Aucune donnée")
      const allStudents = bulletinsData.flatMap(d =>
        d.students.map(s => ({
          lastName: s.lastName,
          firstName: s.firstName,
          subjects: s.subjects,
          generalAverage: s.generalAverage,
          rank: s.rank,
          totalStudents: d.students.length,
          mention: s.mention,
          totalActiveCoeffs: s.totalActiveCoeffs,
        })),
      )
      const yearName = getYearName(selectedYear)
      const clsName = getClassName(selectedClass)
      await downloadBulletinPDF(allStudents, schoolName, schoolAddress, schoolPhone, directorName, yearName, clsName, 0, logoUrl)
    } catch (e) {
      toast.error("Erreur : " + e.message)
    } finally {
      setReportLoading("")
    }
  }, [selectedClass, selectedYear, schoolName, schoolAddress, schoolPhone, directorName, logoUrl, getYearName, getClassName])

  const handleDownloadClassReport = useCallback(async () => {
    if (!data || !selectedClass || !selectedYear) { toast.error("Veuillez sélectionner une classe et une année scolaire."); return }
    setReportLoading("classreport")
    try {
      const [attendanceStats, { trimesterAverages }] = await Promise.all([
        fetch(`/api/attendance?stats=true&classId=${selectedClass}`)
          .then(r => r.json())
          .then(j => j.ok ? j.data : null)
          .catch(() => null),
        fetchTrimesterStats(selectedClass, selectedYear),
      ])
      const yearName = getYearName(selectedYear)
      const clsName = getClassName(selectedClass)
      await downloadClassReportPDF({
        className: clsName,
        academicYearName: yearName,
        trimester: Number(selectedTrimester),
        totalStudents: data.stats.totalStudents,
        studentsFollowed: data.stats.studentsFollowed,
        averageGrade: data.stats.averageGrade,
        numericAverage: data.stats.numericAverage,
        passRate: data.stats.passRate,
        distribution: data.distribution,
        topSubjects: data.topSubjects,
        weakSubjects: data.weakSubjects,
        trimesterAverages,
        attendance: attendanceStats ? {
          total: attendanceStats.total,
          présent: attendanceStats["présent"],
          absent: attendanceStats.absent,
          retard: attendanceStats.retard,
          congé: attendanceStats.congé,
          rate: attendanceStats.rate,
        } : undefined,
        schoolName,
        schoolAddress,
        schoolPhone,
        directorName,
      })
    } catch (e) {
      toast.error("Erreur : " + e.message)
    } finally {
      setReportLoading("")
    }
  }, [data, selectedClass, selectedYear, selectedTrimester, schoolName, schoolAddress, schoolPhone, directorName, getYearName, getClassName])



  const stats = data ? [
    {
      title: "Élèves",
      value: String(data.stats.totalStudents),
      icon: Users,
      iconColor: "text-purple-600",
    },
    {
      title: "Moyenne générale",
      value: data.stats.averageGrade || "—",
      icon: TrendingUp,
      iconColor: "text-green-600",
    },
    {
      title: "Taux de réussite",
      value: `${data.stats.passRate}%`,
      icon: Award,
      iconColor: "text-yellow-600",
    },
    {
      title: "Élèves suivis",
      value: String(data.stats.studentsFollowed),
      icon: FileText,
      iconColor: "text-blue-600",
    },
  ] : [
    { title: "Élèves", value: "—", icon: Users, iconColor: "text-purple-600" },
    { title: "Moyenne générale", value: "—", icon: TrendingUp, iconColor: "text-green-600" },
    { title: "Taux de réussite", value: "—", icon: Award, iconColor: "text-yellow-600" },
    { title: "Élèves suivis", value: "—", icon: FileText, iconColor: "text-blue-600" },
  ]

  const distributionBars = data ? [
    { label: "Excellent (≥16)", value: data.distribution.excellent, color: "bg-green-500" },
    { label: "Bien (14-16)", value: data.distribution.bien, color: "bg-blue-500" },
    { label: "Assez bien (12-14)", value: data.distribution.assezBien, color: "bg-yellow-500" },
    { label: "Passable (10-12)", value: data.distribution.passable, color: "bg-orange-500" },
    { label: "Insuffisant (<10)", value: data.distribution.insuffisant, color: "bg-red-500" },
  ] : []

  const maxDist = Math.max(...distributionBars.map(d => d.value), 1)

  const trimesterLabels = ["1er Trimestre", "2ème Trimestre", "3ème Trimestre"]

  return (
    <AppLayout>
      <PageHeader
        title="Historique Académique"
        description="Suivi des résultats scolaires et progression des élèves"
      >
        <HelpButton section="historique-academique" />
        <div className="flex items-center space-x-2">
          <Select value={selectedTrimester} onValueChange={setSelectedTrimester}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trimestre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1er Trimestre</SelectItem>
              <SelectItem value="2">2ème Trimestre</SelectItem>
              <SelectItem value="3">3ème Trimestre</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleDownloadBulletins} disabled={!!reportLoading}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}><CardContent className="h-24" /></Card>
            ))}
          </div>
          <Card><CardContent className="h-64" /></Card>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-red-600">
            Erreur : {error}
          </CardContent>
        </Card>
      ) : !data ? (
        <Card>
          <CardContent className="p-6 text-gray-500 text-center">
            Sélectionnez une classe et une année scolaire pour afficher les données.
          </CardContent>
        </Card>
      ) : (
        <>
          <StatsGrid stats={stats} />

          <Tabs defaultValue="bulletins" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="bulletins">Bulletins</TabsTrigger>
              <TabsTrigger value="progression">Progression</TabsTrigger>
              <TabsTrigger value="statistics">Statistiques</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
            </TabsList>

            <TabsContent value="bulletins" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rechercher et filtrer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Rechercher par nom ou ID élève..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filtrer par classe" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Année scolaire" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((yr) => (
                          <SelectItem key={yr.id} value={yr.id}>{yr.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <DataTable
                    data={filteredStudents}
                    columns={columns}
                    actions={actions}
                    onRowClick={(row) => {
                      setSelectedStudent(row)
                      setShowBulletinModal(true)
                    }}
                    searchable={false}
                    filterable={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progression" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Évolution des moyennes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data?.trimesterAverages.map((avg, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{trimesterLabels[i]}</span>
                          <span className={`text-lg font-semibold ${avg !== null ? "text-primary" : "text-gray-400"}`}>
                            {avg !== null ? `${avg}/20` : "En cours"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="h-4 w-4" />
                      <span>Répartition des résultats</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {distributionBars.map((item, i) => {
                        const pct = data?.stats.studentsFollowed > 0
                          ? Math.round((item.value / data.stats.studentsFollowed) * 100) : 0
                        return (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-sm">{item.label}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full">
                                <div
                                  className={`h-2 ${item.color} rounded-full`}
                                  style={{ width: `${Math.min((item.value / maxDist) * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{item.value} ({pct}%)</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Matières les mieux réussies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data?.topSubjects.length > 0 ? data.topSubjects.map((subj, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm">{subj.name}</span>
                          <span className="font-semibold text-green-600">{subj.average}/20</span>
                        </div>
                      )) : (
                        <p className="text-sm text-gray-500">Aucune donnée</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Matières à améliorer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data?.weakSubjects.length > 0 ? data.weakSubjects.map((subj, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm">{subj.name}</span>
                          <span className="font-semibold text-orange-600">{subj.average}/20</span>
                        </div>
                      )) : (
                        <p className="text-sm text-gray-500">Aucune donnée</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tendances générales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Progression</span>
                        <Badge className={
                          (data?.trimesterAverages[1] ?? 0) > (data?.trimesterAverages[0] ?? 0)
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }>
                          {(data?.trimesterAverages[1] !== null && data?.trimesterAverages[0] !== null)
                            ? `${(data.trimesterAverages[1] - data.trimesterAverages[0]).toFixed(1)} pts`
                            : "—"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Taux réussite</span>
                        <Badge className={
                          (data?.stats.passRate ?? 0) >= 70
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }>
                          {data?.stats.passRate ?? 0}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Effectif</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {data?.stats.totalStudents ?? 0} élèves
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Rapports disponibles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={handleDownloadBulletins}
                      disabled={reportLoading === "bulletins"}
                    >
                      {reportLoading === "bulletins" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                      Bulletin trimestriel
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => { setCertificateOpen(true); setCertificateStudentId("") }}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Certificat de scolarité
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={handleDownloadAttendance}
                      disabled={reportLoading === "attendance"}
                    >
                      {reportLoading === "attendance" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                      Relevé de présences
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full"
                      onClick={handleExportAllBulletins}
                      disabled={reportLoading === "bulletins"}
                    >
                      {reportLoading === "bulletins" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                      Exporter tous les bulletins
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={handleDownloadClassReport}
                      disabled={reportLoading === "classreport"}
                    >
                      {reportLoading === "classreport" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                      Générer rapport de classe
                    </Button>

                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Certificat de scolarité */}
          <Dialog open={certificateOpen} onOpenChange={setCertificateOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Certificat de scolarité</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-gray-600">Sélectionnez l'élève pour générer son certificat de scolarité.</p>
                <Select value={certificateStudentId} onValueChange={setCertificateStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un élève..." />
                  </SelectTrigger>
                  <SelectContent>
                    {data?.students.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.studentName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCertificateOpen(false)}>Annuler</Button>
                <Button onClick={handleGenerateCertificate} disabled={!certificateStudentId || reportLoading === "certificate"}>
                  {reportLoading === "certificate" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Générer et télécharger
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modals */}
          <AcademicRecordModal open={showRecordModal} onOpenChange={setShowRecordModal} student={selectedStudent} />

          <BulletinModal open={showBulletinModal} onOpenChange={setShowBulletinModal} student={selectedStudent} />

          <ProgressionModal
            open={showProgressionModal}
            onOpenChange={setShowProgressionModal}
            student={selectedStudent}
          />
        </>
      )}
    </AppLayout>
  )
}
