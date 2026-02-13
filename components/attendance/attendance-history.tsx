"use client"

import { useState, useEffect } from "react"

interface AttendanceHistoryRecord {
  date: string
  class: string
  school: string
  totalStudents: number
  present: number
  absent: number
  late: number
  attendanceRate: number
}

interface AttendanceHistoryProps {
  history: AttendanceHistoryRecord[]
  classes?: Array<{
    id: string
    name: string
    level: string
  }>
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useStudents } from "@/hooks/use-students"
import { useSchoolInfo } from "@/hooks/use-school-info"
import { useAttendance } from "@/hooks/use-attendance"
import { pb, COLLECTIONS } from "@/lib/pocketbase"

const ITEMS_PER_PAGE = 10

export function AttendanceHistory({ history, classes: propsClasses }: AttendanceHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedSchool, setSelectedSchool] = useState("all")
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceHistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const { schoolInfo } = useSchoolInfo()

  // Utiliser les classes passées en props ou celles du hook
  const classesToUse = propsClasses || []

  // Débogage
  console.log("AttendanceHistory - Classes reçues en props:", propsClasses)
  console.log("AttendanceHistory - Classes à utiliser:", classesToUse)
  console.log("AttendanceHistory - École reçue:", schoolInfo)

  // Fonction pour récupérer les vraies statistiques par classe
  const getRealAttendanceStatsByClass = async (startDateStr: string, endDateStr: string) => {
    try {
      // Récupérer tous les enregistrements de présence pour la période
      const fullStartDate = `${startDateStr} 00:00:00.000Z`
      const fullEndDate = `${endDateStr} 00:00:00.000Z`
      
      const attendanceRecords = await pb.collection(COLLECTIONS.ATTENDANCE).getList(1, 1000, {
        filter: `date >= "${fullStartDate}" && date <= "${fullEndDate}"`
      })
      
      console.log("Tous les enregistrements de présence:", attendanceRecords.items)
      
      // Récupérer tous les étudiants avec leur classe
      const students = await pb.collection(COLLECTIONS.STUDENTS).getList(1, 500, {
        expand: 'class_id'
      })
      
      console.log("Tous les étudiants:", students.items)
      
      // Créer un mapping student_id -> classe
      const studentClassMap: { [key: string]: string } = {}
      students.items.forEach((student: any) => {
        const className = student.expand?.class_id?.name || 'Inconnu'
        studentClassMap[student.id] = className
      })
      
      console.log("Mapping student -> classe:", studentClassMap)
      
      // Regrouper les présences par classe
      const classStats: { [key: string]: { present: number; absent: number; late: number; total: number } } = {}
      
      // Initialiser les stats pour chaque classe
      classesToUse.forEach(classItem => {
        classStats[classItem.name] = { present: 0, absent: 0, late: 0, total: 0 }
      })
      
      // Compter les présences par classe
      attendanceRecords.items.forEach((record: any) => {
        const className = studentClassMap[record.student_id]
        if (className && classStats[className]) {
          classStats[className].total++
          if (record.status === 'present') classStats[className].present++
          else if (record.status === 'absent') classStats[className].absent++
          else if (record.status === 'late') classStats[className].late++
        }
      })
      
      console.log("Stats par classe:", classStats)
      
      return classStats
    } catch (error) {
      console.error('Erreur récupération stats par classe:', error)
      return {}
    }
  }

  // Charger l'historique des présences depuis la base
  useEffect(() => {
    const loadAttendanceHistory = async () => {
      if (classesToUse.length === 0) return
      
      setIsLoading(true)
      try {
        console.log("Chargement de l'historique pour les classes:", classesToUse)
        
        // Récupérer les statistiques pour les 30 derniers jours
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 30)
        
        const startDateStr = startDate.toISOString().split('T')[0]
        const endDateStr = endDate.toISOString().split('T')[0]
        
        console.log("Période:", startDateStr, "à", endDateStr)
        
        // Récupérer les vraies statistiques par classe
        const classStats = await getRealAttendanceStatsByClass(startDateStr, endDateStr)
        
        // Créer les enregistrements d'historique
        const historyData = classesToUse.map(classItem => {
          const stats = classStats[classItem.name] || { present: 0, absent: 0, late: 0, total: 0 }
          const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
          
          return {
            date: endDateStr,
            class: classItem.name,
            school: schoolInfo?.name || "École Primaire de Bamako",
            totalStudents: stats.total,
            present: stats.present,
            absent: stats.absent,
            late: stats.late,
            attendanceRate: attendanceRate
          }
        })
        
        console.log("Historique final chargé:", historyData)
        setAttendanceHistory(historyData)
      } catch (error) {
        console.error('Erreur chargement historique:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadAttendanceHistory()
  }, [classesToUse, schoolInfo])

  // Utiliser les données réelles ou les données passées en props
  const displayHistory = attendanceHistory.length > 0 ? attendanceHistory : history

  // Filter history based on selections
  const filteredHistory = displayHistory.filter((record) => {
    const matchesClass = selectedClass === "all" || record.class === selectedClass
    const matchesSchool = selectedSchool === "all" || record.school === selectedSchool
    return matchesClass && matchesSchool
  })

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentHistory = filteredHistory.slice(startIndex, endIndex)

  const getAttendanceRateBadge = (rate: any) => {
    if (rate >= 95) return <Badge className="bg-accent text-accent-foreground">{rate}%</Badge>
    if (rate >= 85) return <Badge variant="secondary">{rate}%</Badge>
    return <Badge variant="destructive">{rate}%</Badge>
  }

  const getTrend = (currentRate: any, previousRate: any) => {
    if (!previousRate) return <div className="text-xs text-muted-foreground">N/A</div>
    const diff = currentRate - previousRate
    if (diff > 0) {
      return (
        <div className="flex items-center text-accent text-xs">
          <TrendingUp className="h-3 w-3 mr-1" />+{diff}%
        </div>
      )
    }
    if (diff < 0) {
      return (
        <div className="flex items-center text-destructive text-xs">
          <TrendingDown className="h-3 w-3 mr-1" />
          {diff}%
        </div>
      )
    }
    return <div className="text-xs text-muted-foreground">Stable</div>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de l'historique...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrer l'historique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrer par classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                {classesToUse.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.name}>
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Filtrer par école" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les écoles</SelectItem>
                {schoolInfo && (
                  <SelectItem value={schoolInfo.name}>
                    {schoolInfo.name}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des présences ({filteredHistory.length} enregistrements)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>École</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Présents</TableHead>
                  <TableHead>Absents</TableHead>
                  <TableHead>Retards</TableHead>
                  <TableHead>Taux</TableHead>
                  <TableHead>Tendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentHistory.map((record, index) => (
                  <TableRow key={`${record.date}-${record.class}`}>
                    <TableCell className="font-medium">
                      {format(new Date(record.date), "dd MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.class}</Badge>
                    </TableCell>
                    <TableCell className="max-w-48 truncate">{record.school}</TableCell>
                    <TableCell>{record.totalStudents}</TableCell>
                    <TableCell className="text-accent font-medium">{record.present}</TableCell>
                    <TableCell className="text-destructive font-medium">{record.absent}</TableCell>
                    <TableCell className="text-secondary font-medium">{record.late}</TableCell>
                    <TableCell>{getAttendanceRateBadge(record.attendanceRate)}</TableCell>
                    <TableCell>
                      {getTrend(
                        record.attendanceRate,
                        index < currentHistory.length - 1 ? currentHistory[index + 1].attendanceRate : null,
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Affichage de {startIndex + 1} à {Math.min(endIndex, filteredHistory.length)} sur{" "}
                {filteredHistory.length} enregistrements
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "" : "bg-transparent"}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-transparent"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
