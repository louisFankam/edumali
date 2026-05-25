"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Calendar, MapPin } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function StudentDetailsModal({ isOpen, onClose, student }) {
  if (!student) return null

  const getAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--
    return age
  }

  const getInitials = (firstName, lastName) => `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profil de l'élève</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={student.photo || (student.gender === "Masculin" ? "/homme.png" : "/femme.png")} alt={`${student.firstName} ${student.lastName}`} />
              <AvatarFallback className="text-lg">{getInitials(student.firstName, student.lastName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-serif font-bold">{student.firstName} {student.lastName}</h2>
              <p className="text-muted-foreground">{getAge(student.birthDate)} ans • {student.gender}</p>
              <Badge variant={student.status === "Actif" ? "default" : "secondary"} className="mt-2">{student.status}</Badge>
            </div>
          </div>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><User className="h-5 w-5 mr-2" />Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date de naissance</p>
                  <p className="flex items-center"><Calendar className="h-4 w-4 mr-2" />{format(new Date(student.birthDate), "dd MMMM yyyy", { locale: fr })}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Genre</p>
                  <p>{student.gender}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Adresse</p>
                <p className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{student.address || "-"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
