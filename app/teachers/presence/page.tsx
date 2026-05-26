"use client"

import { useState, useMemo, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, UserCheck, UserX, Clock, Users, Save, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTeachers, useTeacherAttendance } from "@/hooks/use-teachers"
import { useAcademicYears } from "@/hooks/use-settings"

export default function TeacherAttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const { teachers, isLoading: teachersLoading } = useTeachers()
  const { currentYear } = useAcademicYears()

  const dateStr = format(selectedDate, "yyyy-MM-dd")
  const { records: attendanceRecords, isLoading: attendanceLoading, refetch: reloadAttendance, saveAttendance } = useTeacherAttendance({
    date: dateStr,
    from: currentYear?.startDate,
    to: currentYear?.endDate,
  })

  const [teachersAttendance, setTeachersAttendance] = useState<{ teacherId: string; status: string }[]>([])

  useEffect(() => {
    if (teachers.length === 0) return;
    if (attendanceRecords.length > 0) {
      setTeachersAttendance(
        teachers.map(t => {
          const saved = attendanceRecords.find(r => r.teacher_id === t.id)
          return { teacherId: t.id, status: saved?.status ?? "present" }
        })
      )
    } else {
      setTeachersAttendance(
        teachers.map(t => ({ teacherId: t.id, status: "present" }))
      )
    }
  }, [teachers, attendanceRecords])

  const handleAttendanceChange = (teacherId: string, status: string) => {
    setTeachersAttendance(prev => prev.map(t => t.teacherId === teacherId ? { ...t, status } : t))
  }

  const handleMarkAllPresent = () => {
    setTeachersAttendance(prev => prev.map(t => ({ ...t, status: "present" })))
  }

  const handleSaveAttendance = async () => {
    const records = teachersAttendance.map(t => ({
      teacher_id: t.teacherId,
      date: dateStr,
      status: t.status,
    }))
    await saveAttendance(records)
    setShowSaveDialog(false)
  }

  const getTeacherInfo = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId)
  }

  const stats = useMemo(() => {
    const total = teachersAttendance.length
    const present = teachersAttendance.filter(t => t.status === "present").length
    const absent = teachersAttendance.filter(t => t.status === "absent").length
    const late = teachersAttendance.filter(t => t.status === "retard").length
    const excused = teachersAttendance.filter(t => t.status === "excused").length
    return { total, present, absent, late, excused }
  }, [teachersAttendance])

  const historyStats = useMemo(() => {
    const grouped: Record<string, { total: number; present: number }> = {}
    attendanceRecords.forEach(r => {
      if (!grouped[r.date]) grouped[r.date] = { total: 0, present: 0 }
      grouped[r.date].total++
      if (r.status === "present") grouped[r.date].present++
    })
    return Object.entries(grouped).map(([date, data]) => ({
      date,
      total: data.total,
      present: data.present,
      rate: Math.round((data.present / data.total) * 100),
    })).sort((a, b) => b.date.localeCompare(a.date))
  }, [attendanceRecords])

  const isLoading = teachersLoading || attendanceLoading

  return (
    <AppLayout>
          <PageHeader title="Présences des Professeurs" description="Suivre les présences quotidiennes du personnel" />

          <Tabs defaultValue="daily" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="daily">Présences du jour</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contrôle du jour</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-48 justify-start bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(selectedDate, "dd MMMM yyyy", { locale: fr })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={selectedDate} onSelect={(d) => { if (d) { setSelectedDate(d); reloadAttendance() } }} locale={fr} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleMarkAllPresent} variant="outline" className="bg-transparent">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Tous présents
                    </Button>
                    <Button onClick={() => setShowSaveDialog(true)} className="bg-green-600 hover:bg-green-700">
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-4">
                <StatCard title="Total" value={stats.total} icon={Users} color="text-foreground" />
                <StatCard title="Présents" value={stats.present} icon={UserCheck} color="text-green-600" />
                <StatCard title="Absents" value={stats.absent} icon={UserX} color="text-red-600" />
                <StatCard title="Retards" value={stats.late} icon={Clock} color="text-yellow-600" />
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Professeur</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          </TableCell>
                        </TableRow>
                      ) : teachersAttendance.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Aucun professeur</TableCell>
                        </TableRow>
                      ) : teachersAttendance.map((ta) => {
                        const info = getTeacherInfo(ta.teacherId)
                        return (
                          <TableRow key={ta.teacherId}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{info?.first_name?.[0]}{info?.last_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{info?.full_name || "Inconnu"}</div>
                                  <div className="text-xs text-muted-foreground">{info?.speciality_names?.join(", ") || ""}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={ta.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                {["present", "retard", "excused", "absent"].map((s) => (
                                  <Button
                                    key={s}
                                    variant={ta.status === s ? "default" : "outline"}
                                    size="sm"
                                    className={cn("h-8 w-8 p-0", ta.status === s ? getStatusColor(s) : "bg-transparent")}
                                    onClick={() => handleAttendanceChange(ta.teacherId, s)}
                                  >
                                    {getStatusIcon(s)}
                                  </Button>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Présents</TableHead>
                        <TableHead>Taux</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyStats.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Aucun historique</TableCell>
                        </TableRow>
                      ) : historyStats.map((h) => (
                        <TableRow key={h.date}>
                          <TableCell>{format(new Date(h.date), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{h.present}/{h.total}</TableCell>
                          <TableCell>
                            <Badge variant={h.rate >= 90 ? "default" : "secondary"}>
                              {h.rate}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmer la sauvegarde</DialogTitle>
                <DialogDescription>
                  Sauvegarder les présences pour le {format(selectedDate, "dd MMMM yyyy", { locale: fr })} ?
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Annuler</Button>
                <Button onClick={handleSaveAttendance}>Confirmer</Button>
              </div>
            </DialogContent>
          </Dialog>
        </AppLayout>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", color)} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", color)}>{value}</div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const labels: any = { present: "Présent", absent: "Absent", retard: "Retard", excused: "Excusé" }
  const variants: any = { present: "default", absent: "destructive", retard: "secondary", excused: "outline" }
  return <Badge variant={variants[status]}>{labels[status]}</Badge>
}

function getStatusIcon(status: string) {
  switch (status) {
    case "present": return <UserCheck className="h-3 w-3" />
    case "absent": return <UserX className="h-3 w-3" />
    case "retard": return <Clock className="h-3 w-3" />
    case "excused": return <AlertCircle className="h-3 w-3" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "present": return "bg-green-600 hover:bg-green-700"
    case "retard": return "bg-yellow-600 hover:bg-yellow-700 text-white"
    case "excused": return "bg-blue-600 hover:bg-blue-700 text-white"
    case "absent": return "bg-red-600 hover:bg-red-700"
  }
}
