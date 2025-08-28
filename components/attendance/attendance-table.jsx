"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserCheck, UserX, Clock } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function AttendanceTable({ students, onAttendanceChange, selectedDate, selectedClass }) {
  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "present":
        return (
          <Badge variant="default" className="bg-accent text-accent-foreground">
            <UserCheck className="h-3 w-3 mr-1" />
            Présent
          </Badge>
        )
      case "absent":
        return (
          <Badge variant="destructive">
            <UserX className="h-3 w-3 mr-1" />
            Absent
          </Badge>
        )
      case "late":
        return (
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
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
          Présences - {selectedClass} - {format(selectedDate, "dd MMMM yyyy", { locale: fr })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Élève</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Heure d'arrivée</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={student.photo || "/placeholder.svg"}
                          alt={`${student.firstName} ${student.lastName}`}
                        />
                        <AvatarFallback>{getInitials(student.firstName, student.lastName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {student.firstName} {student.lastName}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.class}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
                  <TableCell>{student.arrivalTime || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant={student.status === "present" ? "default" : "outline"}
                        size="sm"
                        onClick={() => onAttendanceChange(student.id, "present")}
                        className={student.status === "present" ? "" : "bg-transparent"}
                      >
                        <UserCheck className="h-3 w-3" />
                      </Button>
                      <Button
                        variant={student.status === "late" ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => onAttendanceChange(student.id, "late")}
                        className={student.status === "late" ? "" : "bg-transparent"}
                      >
                        <Clock className="h-3 w-3" />
                      </Button>
                      <Button
                        variant={student.status === "absent" ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => onAttendanceChange(student.id, "absent")}
                        className={student.status === "absent" ? "" : "bg-transparent"}
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
