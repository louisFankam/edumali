"use client"

import { useState, useEffect } from "react"
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
import { useTeacherAttendance } from "@/hooks/use-teacher-attendance"
import { useTeachers } from "@/hooks/use-teachers"
import { useSchoolInfo } from "@/hooks/use-school-info"

// Composant pour le tableau de présence des professeurs
function TeacherAttendanceTable({ teachers, onAttendanceChange, selectedDate, selectedSchool }: {
  teachers: any[];
  onAttendanceChange: (teacherId: string, status: string) => void;
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
      case "excused":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Excusé
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
                          src={teacher.photo || (teacher.gender === "Masculin" ? "/homme.png" : "/femme.png")}
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
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant={teacher.status === "present" ? "default" : "outline"}
                        size="sm"
                        title="Présent"
                        onClick={() => onAttendanceChange(teacher.id, "present")}
                        className={teacher.status === "present" ? "bg-green-600 hover:bg-green-700" : "bg-transparent"}
                      >
                        <UserCheck className="h-3 w-3" />
                      </Button>
                      <Button
                        variant={teacher.status === "late" ? "secondary" : "outline"}
                        size="sm"
                        title="Retard"
                        onClick={() => onAttendanceChange(teacher.id, "late")}
                        className={teacher.status === "late" ? "bg-yellow-600 hover:bg-yellow-700" : "bg-transparent"}
                      >
                        <Clock className="h-3 w-3" />
                      </Button>
                      <Button
                        variant={teacher.status === "excused" ? "outline" : "outline"}
                        size="sm"
                        title="Excusé"
                        onClick={() => onAttendanceChange(teacher.id, "excused")}
                        className={teacher.status === "excused" ? "bg-blue-600 hover:bg-blue-700" : "bg-transparent"}
                      >
                        <AlertCircle className="h-3 w-3" />
                      </Button>
                      <Button
                        variant={teacher.status === "absent" ? "destructive" : "outline"}
                        size="sm"
                        title="Absent"
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
    <div className="grid gap-4 md:grid-cols-5">
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
            {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}% du total
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
            {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}% du total
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
            {stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}% du total
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Excusés</CardTitle>
          <AlertCircle className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total > 0 ? Math.round((stats.excused / stats.total) * 100) : 0}% du total
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
                <TableHead>Excusés</TableHead>
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
                  <TableCell className="text-blue-600 font-medium">{record.excused || 0}</TableCell>
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
  const [selectedSchool, setSelectedSchool] = useState("")
  
  const { teachers, fetchTeachers } = useTeachers()
  const { 
    saveTeacherAttendance, 
    getTeacherAttendanceHistory,
    fetchAttendanceByDate,
  } = useTeacherAttendance()
  const { schoolInfo } = useSchoolInfo()

  const [teachersAttendance, setTeachersAttendance] = useState<any[]>([])
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchTeachers()
  }, [fetchTeachers])

  // Initialiser avec le nom de l'école
  useEffect(() => {
    if (schoolInfo && !selectedSchool) {
      setSelectedSchool(schoolInfo.name)
    }
  }, [schoolInfo, selectedSchool])

  // Charger les présences existantes quand la date change
  useEffect(() => {
    const loadExistingAttendance = async () => {
      if (teachers.length === 0) return
      
      try {
        const formattedDate = format(selectedDate, "yyyy-MM-dd")
        console.log("Chargement des présences professeurs pour le", formattedDate)
        
        // Récupérer toutes les présences pour cette date
        const existingAttendance = await fetchAttendanceByDate(formattedDate)
        console.log("Présences brutes chargées:", existingAttendance)
        
        // Mettre à jour l'état des présences avec les données existantes
        const updatedAttendance = teachers.map(teacher => {
          const attendanceRecord = existingAttendance.find(record => record.teacher_id === teacher.id)
          const status = attendanceRecord?.status || "present"
          console.log(`Professeur ${teacher.first_name} ${teacher.last_name} (ID: ${teacher.id}):`)
          console.log(`  - Recherche de présence par ID: ${attendanceRecord ? 'TROUVÉ' : 'NON TROUVÉ'}`)
          console.log(`  - Statut final: ${status}`)
          
          return {
            id: teacher.id,
            firstName: teacher.first_name,
            lastName: teacher.last_name,
            subject: teacher.speciality_names.join(", "),
            school: schoolInfo?.name || "École Primaire de Bamako",
            status: status,
            gender: teacher.gender,
            photo: teacher.photo || (teacher.gender === "Masculin" ? "/homme.png" : "/femme.png"),
          }
        })
        
        console.log("Présences finales:", updatedAttendance.map(a => `${a.firstName} ${a.lastName}: ${a.status}`))
        setTeachersAttendance(updatedAttendance)
        
      } catch (error) {
        console.error("Erreur lors du chargement des présences professeurs:", error)
      }
    }

    loadExistingAttendance()
  }, [selectedDate, teachers, fetchAttendanceByDate, schoolInfo])

  useEffect(() => {
    // Charger l'historique des présences
    const loadHistory = async () => {
      try {
        const history = await getTeacherAttendanceHistory()
        console.log("Historique brut:", history)
        
        // Grouper les données par date pour calculer les statistiques
        const groupedHistory = history.reduce((acc: any, record: any) => {
          const date = record.date.split(' ')[0] // Extraire juste la date
          if (!acc[date]) {
            acc[date] = {
              date: date,
              school: schoolInfo?.name || "École Primaire de Bamako",
              totalTeachers: 0,
              present: 0,
              absent: 0,
              late: 0,
              excused: 0
            }
          }
          acc[date].totalTeachers++
          if (record.status === 'present') acc[date].present++
          else if (record.status === 'absent') acc[date].absent++
          else if (record.status === 'late') acc[date].late++
          else if (record.status === 'excused') acc[date].excused++
          
          return acc
        }, {} as any)
        
        // Convertir en tableau et calculer les taux de présence
        const formattedHistory = Object.values(groupedHistory).map((record: any) => ({
          ...record,
          attendanceRate: Math.round((record.present / record.totalTeachers) * 100)
        }))
        
        console.log("Historique formaté:", formattedHistory)
        setAttendanceHistory(formattedHistory)
      } catch (error) {
        console.error('Erreur chargement historique:', error)
      }
    }
    loadHistory()
  }, [getTeacherAttendanceHistory, schoolInfo])

  const handleAttendanceChange = (teacherId: string, status: string) => {
    setTeachersAttendance((prev) =>
      prev.map((teacher) =>
        teacher.id === teacherId
          ? {
              ...teacher,
              status
            }
          : teacher,
      ),
    )
  }

  const handleMarkAllPresent = () => {
    setTeachersAttendance((prev) =>
      prev.map((teacher) => ({
        ...teacher,
        status: "present"
      })),
    )
  }

  const handleSaveAttendance = async () => {
    try {
      setIsSaving(true)
      
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      
      // Préparer les données pour la sauvegarde
      const attendanceData = teachersAttendance.map(teacher => ({
        teacherId: teacher.id,
        status: teacher.status
      }))

      // Sauvegarder les présences
      await saveTeacherAttendance(formattedDate, attendanceData)
      
      setIsSaving(false)
      setShowSaveDialog(false)
      alert("Présences des professeurs sauvegardées avec succès!")
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert("Erreur lors de la sauvegarde des présences. Veuillez réessayer.")
      setIsSaving(false)
    }
  }

  // Calculate stats for current selection
  const currentStats = {
    total: teachersAttendance.length,
    present: teachersAttendance.filter((t) => t.status === "present").length,
    absent: teachersAttendance.filter((t) => t.status === "absent").length,
    late: teachersAttendance.filter((t) => t.status === "late").length,
    excused: teachersAttendance.filter((t) => t.status === "excused").length,
    attendanceRate: teachersAttendance.length > 0 ? 
      Math.round((teachersAttendance.filter((t) => t.status === "present").length / teachersAttendance.length) * 100) : 0,
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
                  <CardTitle>Sélection de la date</CardTitle>
                  <CardDescription>Choisissez la date pour marquer les présences des professeurs</CardDescription>
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
                selectedSchool={selectedSchool}
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
