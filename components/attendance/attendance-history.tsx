"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  classes?: Array<{ id: string; name: string; level: string }>
}

export function AttendanceHistory({ history }: AttendanceHistoryProps) {
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedSchool, setSelectedSchool] = useState("all")

  const classes = useMemo(() => Array.from(new Set(history.map((h) => h.class))), [history])
  const schools = useMemo(() => Array.from(new Set(history.map((h) => h.school))), [history])

  const filtered = history.filter((record) => {
    const matchesClass = selectedClass === "all" || record.class === selectedClass
    const matchesSchool = selectedSchool === "all" || record.school === selectedSchool
    return matchesClass && matchesSchool
  })

  const rateBadge = (rate: number) => {
    if (rate >= 95) return <Badge className="bg-accent text-accent-foreground">{rate}%</Badge>
    if (rate >= 85) return <Badge variant="secondary">{rate}%</Badge>
    return <Badge variant="destructive">{rate}%</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Historique des présences</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Classe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les classes</SelectItem>
              {classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selectedSchool} onValueChange={setSelectedSchool}>
            <SelectTrigger>
              <SelectValue placeholder="École" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les écoles</SelectItem>
              {schools.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Présents</TableHead>
                <TableHead>Absents</TableHead>
                <TableHead>Retards</TableHead>
                <TableHead>Taux</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((record, idx) => (
                <TableRow key={`${record.class}-${record.date}-${idx}`}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.class}</TableCell>
                  <TableCell>{record.present}</TableCell>
                  <TableCell>{record.absent}</TableCell>
                  <TableCell>{record.late}</TableCell>
                  <TableCell>{rateBadge(record.attendanceRate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
