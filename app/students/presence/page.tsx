"use client"

import { useState, useEffect } from "react"
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
import { useStudents } from "@/hooks/use-students"
import { useAttendance } from "@/hooks/use-attendance"
import { useSchoolInfo } from "@/hooks/use-school-info"

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedSchool, setSelectedSchool] = useState("")
  
  const { students, classes, isLoading, fetchStudents } = useStudents()
  const { saveAttendance, getAttendanceByDate, isLoading: isSaving } = useAttendance()
  const { schoolInfo } = useSchoolInfo()

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  // Initialiser avec la première classe disponible
  useEffect(() => {
    if (classes.length > 0 && selectedClass === "all") {
      setSelectedClass(classes[0].name)
    }
  }, [classes, selectedClass])

  // Initialiser avec le nom de l'école
  useEffect(() => {
    if (schoolInfo && !selectedSchool) {
      setSelectedSchool(schoolInfo.name)
    }
  }, [schoolInfo, selectedSchool])

  // Charger les présences existantes quand la date ou la classe change
  useEffect(() => {
    const loadExistingAttendance = async () => {
      if (students.length === 0) return
      
      try {
        const formattedDate = format(selectedDate, "yyyy-MM-dd")
        console.log("Chargement des présences pour le", formattedDate)
        
        // Récupérer toutes les présences pour cette date
        const existingAttendance = await getAttendanceByDate(formattedDate)
        console.log("Présences brutes chargées:", existingAttendance)
        
        // Filtrer les étudiants selon la classe sélectionnée
        const filteredStudents = selectedClass === "all" 
          ? students 
          : students.filter(student => student.class === selectedClass)
        
        console.log("Étudiants filtrés pour la classe", selectedClass, ":", filteredStudents.map(s => `${s.firstName} ${s.lastName} (ID: ${s.id})`))
        
        // Mettre à jour l'état des présences avec les données existantes
        const updatedAttendance = filteredStudents.map(student => {
          // Le student_id dans la base contient bien l'UUID de l'étudiant
          const attendanceRecord = existingAttendance.find(record => record.student_id === student.id)
          const status = attendanceRecord?.status || "present"
          console.log(`Étudiant ${student.firstName} ${student.lastName} (ID: ${student.id}):`)
          console.log(`  - Recherche de présence par ID: ${attendanceRecord ? 'TROUVÉ' : 'NON TROUVÉ'}`)
          console.log(`  - Statut final: ${status}`)
          
          return {
            ...student,
            status: status
          }
        })
        
        console.log("Présences finales:", updatedAttendance.map(a => `${a.firstName} ${a.lastName}: ${a.status}`))
        setStudentsAttendance(updatedAttendance)
        
      } catch (error) {
        console.error("Erreur lors du chargement des présences:", error)
      }
    }

    loadExistingAttendance()
  }, [selectedDate, selectedClass, students, getAttendanceByDate])

  // État local pour gérer les présences
  const [studentsAttendance, setStudentsAttendance] = useState<any[]>([])

  
  useEffect(() => {
    // Mettre à jour les données de présence quand les étudiants changent
    const updatedAttendance = students
      .filter(student => selectedClass === "all" || student.class === selectedClass)
      .map(student => ({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        class: student.class,
        school: "École Primaire de Bamako",
        status: "present", // Valeur par défaut
        photo: student.gender === "Masculin" ? "/homme.png" : "/femme.png",
      }))
    setStudentsAttendance(updatedAttendance)
  }, [students, selectedClass])

  const handleAttendanceChange = (studentId: string, status: string) => {
    setStudentsAttendance((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? {
              ...student,
              status
            }
          : student,
      ),
    )
  }

  const handleMarkAllPresent = () => {
    setStudentsAttendance((prev) =>
      prev.map((student) => ({
        ...student,
        status: "present"
      })),
    )
  }

  const handleSaveAttendance = async () => {
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      
      // Récupérer l'ID de la classe sélectionnée
      const selectedClassData = classes.find(c => c.name === selectedClass)
      if (!selectedClassData && selectedClass !== "all") {
        alert("Classe non trouvée!")
        return
      }

      // Préparer les données pour la sauvegarde
      const attendanceData = studentsAttendance.map(student => ({
        studentId: student.id, // Utiliser l'UUID comme dans la base
        status: student.status
      }))

      // Sauvegarder les présences
      await saveAttendance(
        formattedDate,
        selectedClassData?.id || "all",
        attendanceData
      )

      alert("Présences sauvegardées avec succès!")
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      alert("Erreur lors de la sauvegarde des présences. Veuillez réessayer.")
    }
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
                          <SelectItem value={schoolInfo?.name || "École Primaire de Bamako"}>
                            {schoolInfo?.name || "École Primaire de Bamako"}
                          </SelectItem>
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
                          <SelectItem value="all">Toutes les classes</SelectItem>
                          {classes.map((classItem) => (
                            <SelectItem key={classItem.id} value={classItem.name}>
                              {classItem.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end space-x-2">
                      <Button onClick={handleMarkAllPresent} variant="outline" className="bg-transparent">
                        <UserCheck className="h-4 w-4 mr-2" />
                        Tous présents
                      </Button>
                      <Button onClick={handleSaveAttendance} disabled={isSaving}>
                {isSaving ? "Sauvegarde en cours..." : "Sauvegarder"}
              </Button>
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
              <AttendanceHistory history={[]} classes={classes} />
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