"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { SchoolYearSelector } from "@/components/school-year-selector"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

// Mock data for teachers with attendance
const mockTeachersAttendance = [
  {
    id: 1,
    firstName: "Fatoumata",
    lastName: "Diarra",
    subject: "Mathématiques",
    school: "École Primaire de Bamako",
    status: "present", // present, absent, late
    arrivalTime: "07:30",
    photo: "/diverse-teacher-girl.png",
  },
  {
    id: 2,
    firstName: "Moussa",
    lastName: "Koné",
    subject: "Français",
    school: "École Primaire de Bamako",
    status: "present",
    arrivalTime: "07:45",
    photo: "/diverse-teacher-boy.png",
  },
  {
    id: 3,
    firstName: "Aïcha",
    lastName: "Traoré",
    subject: "Histoire-Géographie",
    school: "École Primaire de Bamako",
    status: "present",
    arrivalTime: "07:40",
    photo: "/diverse-teacher-girl.png",
  },
  {
    id: 4,
    firstName: "Sékou",
    lastName: "Keita",
    subject: "Sciences",
    school: "École Primaire de Bamako",
    status: "present",
    arrivalTime: "07:35",
    photo: "/diverse-teacher-boy.png",
  },
  {
    id: 5,
    firstName: "Aminata",
    lastName: "Touré",
    subject: "Anglais",
    school: "École Primaire de Bamako",
    status: "present",
    arrivalTime: "07:50",
    photo: "/diverse-teacher-girl.png",
  },
  {
    id: 6,
    firstName: "Oumar",
    lastName: "Diallo",
    subject: "Éducation physique",
    school: "École Primaire de Bamako",
    status: "present",
    arrivalTime: "07:25",
    photo: "/diverse-teacher-boy.png",
  },
]

// Mock attendance history data
const mockAttendanceHistory = [
  {
    date: "2024-12-20",
    school: "École Primaire de Bamako",
    totalTeachers: 6,
    present: 6,
    absent: 0,
    late: 0,
    attendanceRate: 100,
  },
  {
    date: "2024-12-19",
    school: "École Primaire de Bamako",
    totalTeachers: 6,
    present: 5,
    absent: 1,
    late: 0,
    attendanceRate: 83,
  },
  {
    date: "2024-12-18",
    school: "École Primaire de Bamako",
    totalTeachers: 6,
    present: 6,
    absent: 0,
    late: 0,
    attendanceRate: 100,
  },
]

// Composant pour le tableau de présence des professeurs
function TeacherAttendanceTable({ teachers, onAttendanceChange, selectedDate, selectedSchool }: {
  teachers: any[];
  onAttendanceChange: (teacherId: number, status: string) => void;
  selectedDate: Date;
  selectedSchool: string;
}) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
            <UserCheck className="h-3 w-3 mr-1" />
            Présent
          </Badge>
        )
      case "absent":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">
            <UserX className="h-3 w-3 mr-1" />
            Absent
          </Badge>
        )
      case "late":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Retard
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Présences des professeurs - {selectedSchool} - {format(selectedDate, "dd MMMM yyyy", { locale: fr })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Professeur</TableHead>
                <TableHead>Matière</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Heure d'arrivée</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={teacher.photo || "/placeholder.svg"}
                          alt={`${teacher.firstName} ${teacher.lastName}`}
                        />
                        <AvatarFallback>{getInitials(teacher.firstName, teacher.lastName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {teacher.firstName} {teacher.lastName}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{teacher.subject}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                  <TableCell>{teacher.arrivalTime || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant={teacher.status === "present" ? "default" : "outline"}
                        size="sm"
                        onClick={() => onAttendanceChange(teacher.id, "present")}
                        className={teacher.status === "present" ? "bg-green-600 hover:bg-green-700" : "bg-transparent"}
                      >
                        <UserCheck className="h-3 w-3" />
                      </Button>
                      <Button
                        variant={teacher.status === "late" ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => onAttendanceChange(teacher.id, "late")}
                        className={teacher.status === "late" ? "bg-yellow-600 hover:bg-yellow-700" : "bg-transparent"}
                      >
                        <Clock className="h-3 w-3" />
                      </Button>
                      <Button
                        variant={teacher.status === "absent" ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => onAttendanceChange(teacher.id, "absent")}
                        className={teacher.status === "absent" ? "" : "bg-transparent"}
                      >
                        <UserX className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// Composant pour les statistiques de présence
function TeacherAttendanceStats({ stats }: { stats: any }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Professeurs</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Tous établissements</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Présents</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.present}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((stats.present / stats.total) * 100)}% du total
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Absents</CardTitle>
          <UserX className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((stats.absent / stats.total) * 100)}% du total
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En retard</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((stats.late / stats.total) * 100)}% du total
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Composant pour l'historique des présences
function TeacherAttendanceHistory({ history }: { history: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des présences</CardTitle>
        <CardDescription>Historique des présences des professeurs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>École</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Présents</TableHead>
                <TableHead>Absents</TableHead>
                <TableHead>Retards</TableHead>
                <TableHead>Taux de présence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{format(new Date(record.date), "dd/MM/yyyy", { locale: fr })}</TableCell>
                  <TableCell>{record.school}</TableCell>
                  <TableCell>{record.totalTeachers}</TableCell>
                  <TableCell className="text-green-600 font-medium">{record.present}</TableCell>
                  <TableCell className="text-red-600 font-medium">{record.absent}</TableCell>
                  <TableCell className="text-yellow-600 font-medium">{record.late}</TableCell>
                  <TableCell>
                    <Badge variant={record.attendanceRate >= 90 ? "default" : "secondary"}>
                      {record.attendanceRate}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TeacherAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())

  const [teachersAttendance, setTeachersAttendance] = useState(mockTeachersAttendance)
  const [attendanceHistory] = useState(mockAttendanceHistory)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleAttendanceChange = (teacherId: number, status: string) => {
    setTeachersAttendance((prev) =>
      prev.map((teacher) =>
        teacher.id === teacherId
          ? {
              ...teacher,
              status,
              arrivalTime: status === "absent" ? "" : status === "late" ? "08:15" : "07:30",
            }
          : teacher,
      ),
    )
  }

  const handleMarkAllPresent = () => {
    setTeachersAttendance((prev) =>
      prev.map((teacher) => ({
        ...teacher,
        status: "present",
        arrivalTime: "07:30",
      })),
    )
  }

  const handleSaveAttendance = async () => {
    setIsSaving(true)
    // Simuler une sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSaving(false)
    setShowSaveDialog(false)
    alert("Présences des professeurs sauvegardées avec succès!")
  }

  // Calculate stats for current selection
  const currentStats = {
    total: teachersAttendance.length,
    present: teachersAttendance.filter((t) => t.status === "present").length,
    absent: teachersAttendance.filter((t) => t.status === "absent").length,
    late: teachersAttendance.filter((t) => t.status === "late").length,
    attendanceRate: Math.round((teachersAttendance.filter((t) => t.status === "present").length / teachersAttendance.length) * 100),
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader className="" title="Gestion des Présences des Professeurs" description="Marquer et suivre les présences du personnel enseignant">
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
              {/* Date and School Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Sélection de l'école et date</CardTitle>
                  <CardDescription>Choisissez l'école et la date pour marquer les présences des professeurs</CardDescription>
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



                    <div className="flex items-end space-x-2">
                      <Button onClick={handleMarkAllPresent} variant="outline" className="bg-transparent">
                        <UserCheck className="h-4 w-4 mr-2" />
                        Tous présents
                      </Button>
                      <Button onClick={() => setShowSaveDialog(true)} className="bg-green-600 hover:bg-green-700">
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Stats */}
              <TeacherAttendanceStats stats={currentStats} />

              {/* Attendance Table */}
              <TeacherAttendanceTable
                teachers={teachersAttendance}
                onAttendanceChange={handleAttendanceChange}
                selectedDate={selectedDate}
                selectedSchool="École Primaire de Bamako"
              />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <TeacherAttendanceHistory history={attendanceHistory} />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rapports de présence des professeurs</CardTitle>
                  <CardDescription>Générer des rapports détaillés sur les présences du personnel enseignant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Rapport mensuel</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Présences de tous les professeurs pour le mois en cours
                        </p>
                        <Button size="sm" className="w-full">
                          Générer rapport
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Rapport par école</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Statistiques détaillées par école et période
                        </p>
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          Générer rapport
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Professeurs absents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">Liste des professeurs avec absences répétées</p>
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

          {/* Dialog de confirmation de sauvegarde */}
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogContent>
                <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  Confirmer la sauvegarde
                </DialogTitle>
                  <DialogDescription>
                  Êtes-vous sûr de vouloir sauvegarder les modifications de présence des professeurs pour le {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })} ?
                  </DialogDescription>
                </DialogHeader>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSaveAttendance} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </>
                  )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
        </div>
    </main>
    </div>
  )
}
