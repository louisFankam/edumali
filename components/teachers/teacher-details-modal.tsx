"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Calendar, MapPin, Phone, Mail, GraduationCap, DollarSign, Award } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Teacher {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  address: string
  hire_date: string
  salary: number
  status: "active" | "inactive" | "on_leave"
  photo: string
  user_id: string
  gender: "Masculin" | "Feminin"
  contrat: "horaire" | "mensuel"
  speciality: string[]
  speciality_names: string[]
  created: string
  updated: string
}

interface TeacherDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  teacher: Teacher | null
}

export function TeacherDetailsModal({ isOpen, onClose, teacher }: TeacherDetailsModalProps) {
  if (!teacher) return null

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const getYearsOfService = (hireDate: string) => {
    const today = new Date()
    const hireDateObj = new Date(hireDate)
    let years = today.getFullYear() - hireDateObj.getFullYear()
    const monthDiff = today.getMonth() - hireDateObj.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < hireDateObj.getDate())) {
      years--
    }
    return years
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Actif</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactif</Badge>
      case "on_leave":
        return <Badge variant="outline">En congé</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const yearsOfService = getYearsOfService(teacher.hire_date)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du professeur</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header avec photo et infos de base */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={teacher.photo || "/placeholder.svg"}
                alt={`${teacher.first_name} ${teacher.last_name}`}
              />
              <AvatarFallback className="text-lg">
                {getInitials(teacher.first_name, teacher.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">
                {teacher.first_name} {teacher.last_name}
              </h2>
              <p className="text-muted-foreground">{teacher.email}</p>
              <div className="mt-1">{getStatusBadge(teacher.status)}</div>
            </div>
          </div>

          <Separator />

          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informations personnelles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{teacher.email}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{teacher.phone}</span>
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-medium flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{teacher.address}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informations professionnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Informations professionnelles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date d'embauche</p>
                  <p className="font-medium flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(teacher.hire_date), "PPP", { locale: fr })}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Années effectuées</p>
                  <p className="font-medium flex items-center space-x-2">
                    <Award className="h-4 w-4" />
                    <span>{yearsOfService} ans</span>
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Salaire mensuel</p>
                <p className="font-medium flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>{teacher.salary.toLocaleString('fr-FR')} FCFA</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Spécialité(s)</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {teacher.speciality_names.length > 0 ? (
                    teacher.speciality_names.map((speciality, index) => (
                      <Badge key={index} variant="outline">
                        {speciality}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">Aucune spécialité définie</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations système */}
          <Card>
            <CardHeader>
              <CardTitle>Informations système</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Créé le: </span>
                  <span>{format(new Date(teacher.created), "PPP", { locale: fr })}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Modifié le: </span>
                  <span>{format(new Date(teacher.updated), "PPP", { locale: fr })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}