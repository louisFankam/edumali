"use client"

import { useState, useEffect, useMemo } from "react"
import { AppLayout } from "@/components/app-layout"
import { HelpButton } from "@/components/help-button"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, UserCheck, UserX, Clock, AlertCircle, Loader2, ArrowLeft, ChevronLeft, ChevronRight, CalendarCheck } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useStudents } from "@/hooks/use-students"
import { useClasses } from "@/hooks/use-classes"
import { useAcademicYears } from "@/hooks/use-settings"
import { useAttendanceByDateClass, useAttendanceStats } from "@/hooks/use-attendance"
import { useAttendanceHistory } from "@/hooks/use-attendance-history"

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedClassId, setSelectedClassId] = useState("")
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const { currentYear } = useAcademicYears()
  const { students, isLoading: studentsLoading } = useStudents({
    classId: selectedClassId || undefined,
    academicYearId: currentYear?.id,
  })
  const { classes, isLoading: classesLoading } = useClasses()
  const { records, load: loadAttendance, save: saveAttendance } = useAttendanceByDateClass()
  const { stats: attStats, load: loadStats } = useAttendanceStats()
  const { summary: historySummary, isLoading: historyLoading, load: loadHistory } = useAttendanceHistory()
  const [historyFrom, setHistoryFrom] = useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d
  })
  const [historyTo, setHistoryTo] = useState<Date>(new Date())
  const [selectedHistoryStudent, setSelectedHistoryStudent] = useState<string | null>(null)
  const [historyPage, setHistoryPage] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const HISTORY_PAGE_SIZE = 10

  const dateStr = format(selectedDate, "yyyy-MM-dd")

  useEffect(() => {
    if (selectedClassId) {
      loadStats({ classId: selectedClassId, from: dateStr, to: dateStr })
    }
  }, [selectedClassId, dateStr, loadStats])

  // When students load, try to load existing attendance
  useEffect(() => {
    if (selectedClassId && students.length > 0) {
      loadAttendance(dateStr, selectedClassId, currentYear?.startDate, currentYear?.endDate).then(() => {
        // set attendance from existing records
      })
    }
  }, [selectedClassId, dateStr, students.length, loadAttendance, currentYear?.startDate, currentYear?.endDate])

  useEffect(() => {
    if (records.length > 0) {
      const map: Record<string, string> = {}
      const statusMap: Record<string, string> = { présent: "present", absent: "absent", retard: "late", congé: "congé" }
      records.forEach(r => { map[r.studentId] = statusMap[r.status] || "present" })
      setAttendance(map)
    } else {
      // Default all to present
      const map: Record<string, string> = {}
      students.forEach(s => { map[s.id] = "present" })
      setAttendance(map)
    }
  }, [records, students])

  const filteredStudents = useMemo(() => {
    if (!selectedClassId) return []
    return students
  }, [students, selectedClassId])

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  const handleMarkAllPresent = () => {
    const newAttendance = { ...attendance }
    filteredStudents.forEach(s => { newAttendance[s.id] = "present" })
    setAttendance(newAttendance)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const statusMap: Record<string, string> = { present: "présent", absent: "absent", late: "retard", congé: "congé" }
      const records = filteredStudents.map(s => ({
        studentId: Number(s.id),
        classId: Number(selectedClassId),
        date: dateStr,
        status: statusMap[attendance[s.id]] || "présent",
        justification: "",
      }))
      const res = await saveAttendance(records)
      if (res.ok) alert("Présences sauvegardées")
    } finally {
      setIsSaving(false)
    }
  }

  const stats = useMemo(() => {
    const total = filteredStudents.length
    const statuses = filteredStudents.map(s => attendance[s.id] || "present")
    const present = statuses.filter(s => s === "present").length
    const absent = statuses.filter(s => s === "absent").length
    const late = statuses.filter(s => s === "late").length
    const congé = statuses.filter(s => s === "congé").length
    return { total, present, absent, late, congé }
  }, [filteredStudents, attendance])

  if (classesLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
          <PageHeader title="Présences Élèves" description="Suivi quotidien des absences et retards">
  <HelpButton section="eleves" />
</PageHeader>

          <Tabs defaultValue="daily" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="daily">Présences du jour</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Filtres</CardTitle></CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-48 justify-start bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(selectedDate, "dd MMMM yyyy", { locale: fr })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} locale={fr}
                          disabled={currentYear ? [{ before: new Date(currentYear.startDate) }, { after: new Date(currentYear.endDate) }] as any : undefined} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Classe</Label>
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                      <SelectTrigger className="w-48"><SelectValue placeholder="Choisir une classe" /></SelectTrigger>
                      <SelectContent>
                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleMarkAllPresent} variant="outline" className="bg-transparent" disabled={!selectedClassId}>
                      Tous présents
                    </Button>
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700" disabled={!selectedClassId || isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Sauvegarder
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {!selectedClassId ? (
                <Card><CardContent className="p-12 text-center text-muted-foreground">Sélectionnez une classe</CardContent></Card>
              ) : studentsLoading ? (
                <Card><CardContent className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></CardContent></Card>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-5">
                    <StatCard title="Total" value={stats.total} icon={CalendarIcon} color="text-foreground" />
                    <StatCard title="Présents" value={stats.present} icon={UserCheck} color="text-green-600" />
                    <StatCard title="Absents" value={stats.absent} icon={UserX} color="text-red-600" />
                    <StatCard title="Retards" value={stats.late} icon={Clock} color="text-yellow-600" />
                    <StatCard title="Congés" value={stats.congé} icon={CalendarCheck} color="text-blue-600" />
                  </div>

                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Élève</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.map((s) => (
                            <TableRow key={s.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>{s.firstName[0]}{s.lastName[0]}</AvatarFallback>
                                  </Avatar>
                                  <div className="font-medium">{s.firstName} {s.lastName}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={attendance[s.id] || "present"} />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-1">
                                  {["present", "late", "absent", "congé"].map((status) => (
                                    <Button
                                      key={status}
                                      variant={(attendance[s.id] || "present") === status ? "default" : "outline"}
                                      size="sm"
                                      className={cn("h-8 w-8 p-0", (attendance[s.id] || "present") === status ? getStatusColor(status) : "bg-transparent")}
                                      onClick={() => handleAttendanceChange(s.id, status)}
                                    >
                                      {getStatusIcon(status)}
                                    </Button>
                                  ))}
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
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Filtres</CardTitle></CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Classe</Label>
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                      <SelectTrigger className="w-48"><SelectValue placeholder="Choisir une classe" /></SelectTrigger>
                      <SelectContent>
                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Du</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-40 justify-start bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(historyFrom, "dd/MM/yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={historyFrom} onSelect={(d) => d && setHistoryFrom(d)} locale={fr}
                          disabled={currentYear ? [{ before: new Date(currentYear.startDate) }, { after: new Date(currentYear.endDate) }] as any : undefined} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Au</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-40 justify-start bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(historyTo, "dd/MM/yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={historyTo} onSelect={(d) => d && setHistoryTo(d)} locale={fr}
                          disabled={currentYear ? [{ before: new Date(currentYear.startDate) }, { after: new Date(currentYear.endDate) }] as any : undefined} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button
                    onClick={() => { setHistoryPage(1); loadHistory(selectedClassId, format(historyFrom, "yyyy-MM-dd"), format(historyTo, "yyyy-MM-dd")) }}
                    disabled={!selectedClassId || historyLoading}
                  >
                    {historyLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Charger
                  </Button>
                </CardContent>
              </Card>

              {!selectedClassId ? (
                <Card><CardContent className="p-12 text-center text-muted-foreground">Sélectionnez une classe</CardContent></Card>
              ) : historyLoading ? (
                <Card><CardContent className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></CardContent></Card>
              ) : historySummary.length === 0 ? (
                <Card><CardContent className="p-12 text-center text-muted-foreground">Aucune donnée pour cette période</CardContent></Card>
              ) : selectedHistoryStudent ? (
                <StudentDetailView
                  student={historySummary.find(s => s.studentId === selectedHistoryStudent)!}
                  onBack={() => setSelectedHistoryStudent(null)}
                />
              ) : (
                <Card>
                  <CardHeader><CardTitle>Récapitulatif par élève</CardTitle></CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Élève</TableHead>
                          <TableHead className="text-center">Présents</TableHead>
                          <TableHead className="text-center">Absents</TableHead>
                          <TableHead className="text-center">Retards</TableHead>
                          <TableHead className="text-center">Congés</TableHead>
                          <TableHead className="text-center">Total</TableHead>
                          <TableHead className="text-center">Taux</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          const start = (historyPage - 1) * HISTORY_PAGE_SIZE
                          const pageItems = historySummary.slice(start, start + HISTORY_PAGE_SIZE)
                          return pageItems.map(s => (
                            <TableRow key={s.studentId} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedHistoryStudent(s.studentId)}>
                              <TableCell className="font-medium">{s.studentName}</TableCell>
                              <TableCell className="text-center text-green-600">{s.present}</TableCell>
                              <TableCell className="text-center text-red-600">{s.absent}</TableCell>
                              <TableCell className="text-center text-yellow-600">{s.late}</TableCell>
                              <TableCell className="text-center text-blue-600">{s.excused}</TableCell>
                              <TableCell className="text-center">{s.total}</TableCell>
                              <TableCell className="text-center">
                                <RateBadge rate={s.rate} />
                              </TableCell>
                            </TableRow>
                          ))
                        })()}
                      </TableBody>
                    </Table>
                  </CardContent>
                  {historySummary.length > HISTORY_PAGE_SIZE && (
                    <div className="flex items-center justify-between px-6 pb-4">
                      <p className="text-sm text-muted-foreground">
                        {Math.min((historyPage - 1) * HISTORY_PAGE_SIZE + 1, historySummary.length)}–{Math.min(historyPage * HISTORY_PAGE_SIZE, historySummary.length)} sur {historySummary.length}
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" disabled={historyPage === 1} onClick={() => setHistoryPage(p => p - 1)}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" disabled={historyPage * HISTORY_PAGE_SIZE >= historySummary.length} onClick={() => setHistoryPage(p => p + 1)}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </AppLayout>
  )
}

function RateBadge({ rate }: { rate: number }) {
  let color = "text-green-600 bg-green-100"
  if (rate < 50) color = "text-red-600 bg-red-100"
  else if (rate < 75) color = "text-yellow-600 bg-yellow-100"
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color}`}>{rate}%</span>
}

function StudentDetailView({ student, onBack }: { student: any; onBack: () => void }) {
  const uniqueDays = [...new Set(student.details.map((d: any) => d.date))].length
  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour au récapitulatif
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{student.studentName}</span>
            <RateBadge rate={student.rate} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{student.present}</p>
              <p className="text-xs text-muted-foreground">Présents</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{student.absent}</p>
              <p className="text-xs text-muted-foreground">Absents</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{student.late}</p>
              <p className="text-xs text-muted-foreground">Retards</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{student.excused}</p>
              <p className="text-xs text-muted-foreground">Congés</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{uniqueDays} jour(s) avec relevé de présence</p>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.details.map((d: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>{format(new Date(d.date), "dd MMMM yyyy", { locale: fr })}</TableCell>
                    <TableCell><StatusBadge status={d.status === "présent" ? "present" : d.status === "absent" ? "absent" : d.status === "retard" ? "late" : d.status === "congé" ? "congé" : "present"} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", color)} />
      </CardHeader>
      <CardContent><div className={cn("text-2xl font-bold", color)}>{value}</div></CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const labels: any = { present: "Présent", absent: "Absent", late: "Retard", congé: "Congé" }
  const variants: any = { present: "default", absent: "destructive", late: "secondary", congé: "outline" }
  return <Badge variant={variants[status]}>{labels[status]}</Badge>
}

function getStatusIcon(status: string) {
  switch (status) {
    case "present": return <UserCheck className="h-3 w-3" />
    case "absent": return <UserX className="h-3 w-3" />
    case "late": return <Clock className="h-3 w-3" />
    case "congé": return <CalendarCheck className="h-3 w-3" />
    default: return <AlertCircle className="h-3 w-3" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "present": return "bg-green-600 hover:bg-green-700"
    case "late": return "bg-yellow-600 hover:bg-yellow-700 text-white"
    case "absent": return "bg-red-600 hover:bg-red-700"
    case "congé": return "bg-blue-600 hover:bg-blue-700 text-white"
    default: return ""
  }
}
