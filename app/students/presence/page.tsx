"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { SchoolYearSelector } from "@/components/school-year-selector"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, UserCheck, UserX, Clock, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock Data
const MOCK_CLASSES = [
  { id: "1", name: "1ère Année" },
  { id: "2", name: "2ème Année" },
]

const MOCK_STUDENTS = [
  { id: "s_1", firstName: "Amadou", lastName: "Diallo", class: "1ère Année", gender: "Masculin" },
  { id: "s_2", firstName: "Fatoumata", lastName: "Traoré", class: "1ère Année", gender: "Féminin" },
  { id: "s_3", firstName: "Issa", lastName: "Coulibaly", class: "2ème Année", gender: "Masculin" },
]

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedClass, setSelectedClass] = useState("1ère Année")
  const [attendance, setAttendance] = useState<Record<string, string>>({})

  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter(s => s.class === selectedClass)
  }, [selectedClass])

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  const handleMarkAllPresent = () => {
    const newAttendance = { ...attendance }
    filteredStudents.forEach(s => { newAttendance[s.id] = "present" })
    setAttendance(newAttendance)
  }

  const stats = useMemo(() => {
    const studentsInClass = filteredStudents
    const total = studentsInClass.length
    const statuses = studentsInClass.map(s => attendance[s.id] || "present")
    const present = statuses.filter(s => s === "present").length
    const absent = statuses.filter(s => s === "absent").length
    const late = statuses.filter(s => s === "late").length
    return { total, present, absent, late }
  }, [filteredStudents, attendance])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader title="Présences Élèves" description="Suivi quotidien des absences et retards">
            <SchoolYearSelector />
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
                        <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} locale={fr} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Classe</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MOCK_CLASSES.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleMarkAllPresent} variant="outline" className="bg-transparent">
                      Tous présents
                    </Button>
                    <Button onClick={() => alert("Sauvegardé")} className="bg-green-600 hover:bg-green-700">
                      Sauvegarder
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-4">
                <StatCard title="Total" value={stats.total} icon={CalendarIcon} color="text-foreground" />
                <StatCard title="Présents" value={stats.present} icon={UserCheck} color="text-green-600" />
                <StatCard title="Absents" value={stats.absent} icon={UserX} color="text-red-600" />
                <StatCard title="Retards" value={stats.late} icon={Clock} color="text-yellow-600" />
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
                              {["present", "late", "absent"].map((status) => (
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
            </TabsContent>
            
            <TabsContent value="history">
              <Card><CardContent className="p-8 text-center text-muted-foreground">Historique simulation</CardContent></Card>
            </TabsContent>
          </Tabs>
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
      <CardContent><div className={cn("text-2xl font-bold", color)}>{value}</div></CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const labels: any = { present: "Présent", absent: "Absent", late: "Retard" }
  const variants: any = { present: "default", absent: "destructive", late: "secondary" }
  return <Badge variant={variants[status]}>{labels[status]}</Badge>
}

function getStatusIcon(status: string) {
  switch (status) {
    case "present": return <UserCheck className="h-3 w-3" />
    case "absent": return <UserX className="h-3 w-3" />
    case "late": return <Clock className="h-3 w-3" />
    default: return <AlertCircle className="h-3 w-3" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "present": return "bg-green-600 hover:bg-green-700"
    case "late": return "bg-yellow-600 hover:bg-yellow-700 text-white"
    case "absent": return "bg-red-600 hover:bg-red-700"
    default: return ""
  }
}
