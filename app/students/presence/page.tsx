"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { SchoolYearSelector } from "@/components/school-year-selector"
import { AttendanceTable } from "@/components/attendance/attendance-table"
import { AttendanceStats } from "@/components/attendance/attendance-stats"
import { AttendanceHistory } from "@/components/attendance/attendance-history"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, UserCheck } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

// Mock data for students with attendance
const mockStudentsAttendance = [
  {
    id: 1,
    firstName: "Aminata",
    lastName: "Traoré",
    class: "CM2",
    school: "École Primaire de Bamako",
    status: "present", // present, absent, late
    arrivalTime: "08:00",
    photo: "/placeholder.svg?key=student1",
  },
  {
    id: 2,
    firstName: "Ibrahim",
    lastName: "Keita",
    class: "CM1",
    school: "École Primaire de Bamako",
    status: "late",
    arrivalTime: "08:15",
    photo: "/placeholder.svg?key=student2",
  },
  {
    id: 3,
    firstName: "Mariam",
    lastName: "Coulibaly",
    class: "CE2",
    school: "École Primaire de Bamako",
    status: "absent",
    arrivalTime: null,
    photo: "/placeholder.svg?key=student3",
  },
  {
    id: 4,
    firstName: "Ousmane",
    lastName: "Diarra",
    class: "CE1",
    school: "École Primaire de Bamako",
    status: "present",
    arrivalTime: "07:55",
    photo: "/placeholder.svg?key=student4",
  },
  {
    id: 5,
    firstName: "Kadiatou",
    lastName: "Sangaré",
    class: "CP",
    school: "École Primaire de Bamako",
    status: "present",
    arrivalTime: "08:05",
    photo: "/placeholder.svg?key=student5",
  },
]

// Mock attendance history data
const mockAttendanceHistory = [
  {
    date: "2024-12-20",
    class: "CM2",
    school: "École Primaire de Bamako",
    totalStudents: 25,
    present: 23,
    absent: 1,
    late: 1,
    attendanceRate: 92,
  },
  {
    date: "2024-12-19",
    class: "CM2",
    school: "École Primaire de Bamako",
    totalStudents: 25,
    present: 24,
    absent: 1,
    late: 0,
    attendanceRate: 96,
  },
  {
    date: "2024-12-18",
    class: "CM2",
    school: "École Primaire de Bamako",
    totalStudents: 25,
    present: 22,
    absent: 2,
    late: 1,
    attendanceRate: 88,
  },
]

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedClass, setSelectedClass] = useState("CM2")
  const [selectedSchool, setSelectedSchool] = useState("École Primaire de Bamako")
  const [studentsAttendance, setStudentsAttendance] = useState(mockStudentsAttendance)
  const [attendanceHistory] = useState(mockAttendanceHistory)

  const handleAttendanceChange = (studentId: number, status: string) => {
    setStudentsAttendance((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? {
              ...student,
              status,
              arrivalTime: status === "absent" ? null : status === "late" ? "08:15" : "08:00",
            }
          : student,
      ),
    )
  }

  const handleMarkAllPresent = () => {
    setStudentsAttendance((prev) =>
      prev.map((student) => ({
        ...student,
        status: "present",
        arrivalTime: "08:00",
      })),
    )
  }

  const handleSaveAttendance = () => {
    // Here you would save to your backend
    console.log("Saving attendance for", format(selectedDate, "yyyy-MM-dd"), selectedClass, selectedSchool)
    alert("Présences sauvegardées avec succès!")
  }

  // Calculate stats for current selection
  const currentStats = {
    total: studentsAttendance.length,
    present: studentsAttendance.filter((s) => s.status === "present").length,
    absent: studentsAttendance.filter((s) => s.status === "absent").length,
    late: studentsAttendance.filter((s) => s.status === "late").length,
    attendanceRate: Math.round((studentsAttendance.filter((s) => s.status === "present").length / studentsAttendance.length) * 100),
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader className={''} title="Gestion des Présences" description="Marquer et suivre les présences des élèves">
            <div className="flex items-center space-x-2">
              <SchoolYearSelector />
            </div>
          </PageHeader>

          <Tabs defaultValue="daily" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">Présences du jour</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="space-y-6">
              {/* Date and Class Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Sélection de la classe et date</CardTitle>
                  <CardDescription>Choisissez la classe et la date pour marquer les présences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn("w-full md:w-48 justify-start text-left font-normal bg-transparent")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(selectedDate, "dd MMMM yyyy", { locale: fr })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            locale={fr}
                            required
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">École</label>
                      <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                        <SelectTrigger className="w-full md:w-64">
                          <SelectValue placeholder="Sélectionner l'école" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="École Primaire de Bamako">École Primaire de Bamako</SelectItem>
                          <SelectItem value="Collège de Sikasso">Collège de Sikasso</SelectItem>
                          <SelectItem value="École Primaire de Mopti">École Primaire de Mopti</SelectItem>
                          <SelectItem value="Collège de Gao">Collège de Gao</SelectItem>
                          <SelectItem value="École Primaire de Kayes">École Primaire de Kayes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Classe</label>
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="w-full md:w-32">
                          <SelectValue placeholder="Classe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CP">CP</SelectItem>
                          <SelectItem value="CE1">CE1</SelectItem>
                          <SelectItem value="CE2">CE2</SelectItem>
                          <SelectItem value="CM1">CM1</SelectItem>
                          <SelectItem value="CM2">CM2</SelectItem>
                          <SelectItem value="6ème">6ème</SelectItem>
                          <SelectItem value="5ème">5ème</SelectItem>
                          <SelectItem value="4ème">4ème</SelectItem>
                          <SelectItem value="3ème">3ème</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end space-x-2">
                      <Button onClick={handleMarkAllPresent} variant="outline" className="bg-transparent">
                        <UserCheck className="h-4 w-4 mr-2" />
                        Tous présents
                      </Button>
                      <Button onClick={handleSaveAttendance}>Sauvegarder</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Stats */}
              <AttendanceStats stats={currentStats} />

              {/* Attendance Table */}
              <AttendanceTable
                students={studentsAttendance}
                onAttendanceChange={handleAttendanceChange}
                selectedDate={selectedDate}
                selectedClass={selectedClass}
              />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <AttendanceHistory history={attendanceHistory} />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rapports de présence</CardTitle>
                  <CardDescription>Générer des rapports détaillés sur les présences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Rapport mensuel</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Présences de tous les élèves pour le mois en cours
                        </p>
                        <Button size="sm" className="w-full">
                          Générer rapport
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Rapport par classe</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Statistiques détaillées par classe et période
                        </p>
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          Générer rapport
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Élèves absents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">Liste des élèves avec absences répétées</p>
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          Générer rapport
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
