"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const ITEMS_PER_PAGE = 10

export function AttendanceHistory({ history }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedSchool, setSelectedSchool] = useState("all")

  // Filter history based on selections
  const filteredHistory = history.filter((record) => {
    const matchesClass = selectedClass === "all" || record.class === selectedClass
    const matchesSchool = selectedSchool === "all" || record.school === selectedSchool
    return matchesClass && matchesSchool
  })

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentHistory = filteredHistory.slice(startIndex, endIndex)

  const getAttendanceRateBadge = (rate) => {
    if (rate >= 95) return <Badge className="bg-accent text-accent-foreground">{rate}%</Badge>
    if (rate >= 85) return <Badge variant="secondary">{rate}%</Badge>
    return <Badge variant="destructive">{rate}%</Badge>
  }

  const getTrend = (currentRate, previousRate) => {
    if (!previousRate) return null
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

            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Filtrer par école" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les écoles</SelectItem>
                <SelectItem value="École Primaire de Bamako">École Primaire de Bamako</SelectItem>
                <SelectItem value="Collège de Sikasso">Collège de Sikasso</SelectItem>
                <SelectItem value="École Primaire de Mopti">École Primaire de Mopti</SelectItem>
                <SelectItem value="Collège de Gao">Collège de Gao</SelectItem>
                <SelectItem value="École Primaire de Kayes">École Primaire de Kayes</SelectItem>
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
