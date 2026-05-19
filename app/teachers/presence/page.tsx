"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { SchoolYearSelector } from "@/components/school-year-selector"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Mock Data
const MOCK_TEACHERS = [
  { id: "t_1", firstName: "Fatoumata", lastName: "Diarra", subject: "Mathématiques", gender: "Féminin", photo: "" },
  { id: "t_2", firstName: "Moussa", lastName: "Koné", subject: "Français", gender: "Masculin", photo: "" },
  { id: "t_3", firstName: "Aïcha", lastName: "Traoré", subject: "Sciences", gender: "Féminin", photo: "" },
]

const MOCK_HISTORY = [
  { date: "2024-05-15", school: "École Bamako", totalTeachers: 15, present: 14, absent: 0, late: 1, excused: 0, attendanceRate: 93 },
  { date: "2024-05-14", school: "École Bamako", totalTeachers: 15, present: 15, absent: 0, late: 0, excused: 0, attendanceRate: 100 },
]

export default function TeacherAttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [teachersAttendance, setTeachersAttendance] = useState(
    MOCK_TEACHERS.map(t => ({ ...t, status: "present" }))
  )
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const handleAttendanceChange = (teacherId: string, status: string) => {
    setTeachersAttendance(prev => prev.map(t => t.id === teacherId ? { ...t, status } : t))
  }

  const handleMarkAllPresent = () => {
    setTeachersAttendance(prev => prev.map(t => ({ ...t, status: "present" })))
  }

  const handleSaveAttendance = () => {
    console.log("Saving attendance:", teachersAttendance)
    setShowSaveDialog(false)
    alert("Présences sauvegardées (Simulation)")
  }

  const stats = useMemo(() => {
    const total = teachersAttendance.length
    const present = teachersAttendance.filter(t => t.status === "present").length
    const absent = teachersAttendance.filter(t => t.status === "absent").length
    const late = teachersAttendance.filter(t => t.status === "late").length
    const excused = teachersAttendance.filter(t => t.status === "excused").length
    return { total, present, absent, late, excused }
  }, [teachersAttendance])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader title="Présences des Professeurs" description="Suivre les présences quotidiennes du personnel">
            <SchoolYearSelector />
          </PageHeader>

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
                        <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} locale={fr} />
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
                      {teachersAttendance.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{t.firstName[0]}{t.lastName[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{t.firstName} {t.lastName}</div>
                                <div className="text-xs text-muted-foreground">{t.subject}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={t.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              {["present", "late", "excused", "absent"].map((s) => (
                                <Button
                                  key={s}
                                  variant={t.status === s ? "default" : "outline"}
                                  size="sm"
                                  className={cn("h-8 w-8 p-0", t.status === s ? getStatusColor(s) : "bg-transparent")}
                                  onClick={() => handleAttendanceChange(t.id, s)}
                                >
                                  {getStatusIcon(s)}
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
                      {MOCK_HISTORY.map((h, i) => (
                        <TableRow key={i}>
                          <TableCell>{format(new Date(h.date), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{h.present}/{h.totalTeachers}</TableCell>
                          <TableCell>
                            <Badge variant={h.attendanceRate >= 90 ? "default" : "secondary"}>
                              {h.attendanceRate}%
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
        </div>
      </main>
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
      <CardContent>
        <div className={cn("text-2xl font-bold", color)}>{value}</div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const labels: any = { present: "Présent", absent: "Absent", late: "Retard", excused: "Excusé" }
  const variants: any = { present: "default", absent: "destructive", late: "secondary", excused: "outline" }
  return <Badge variant={variants[status]}>{labels[status]}</Badge>
}

function getStatusIcon(status: string) {
  switch (status) {
    case "present": return <UserCheck className="h-3 w-3" />
    case "absent": return <UserX className="h-3 w-3" />
    case "late": return <Clock className="h-3 w-3" />
    case "excused": return <AlertCircle className="h-3 w-3" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "present": return "bg-green-600 hover:bg-green-700"
    case "late": return "bg-yellow-600 hover:bg-yellow-700 text-white"
    case "excused": return "bg-blue-600 hover:bg-blue-700 text-white"
    case "absent": return "bg-red-600 hover:bg-red-700"
  }
}
