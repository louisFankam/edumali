"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { EditTeacherProfileModal } from "@/components/teachers/edit-teacher-profile-modal"
import {
  User,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Download,
  DollarSign,
  GraduationCap,
} from "lucide-react"
import { useTeacher, useTeacherAttendance } from "@/hooks/use-teachers"

export default function TeacherProfilePage() {
  const params = useParams()
  const teacherId = params?.id
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { teacher, isLoading, error } = useTeacher(teacherId)
  const { records: attendanceRecords } = useTeacherAttendance(teacherId ? { teacherId } : undefined)

  const handleEditProfile = async (data) => {
    const res = await window.fetch(`/api/teachers/${teacherId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!json.ok) throw new Error(json.message)
    window.location.reload()
  }
  const { editTeacher } = useTeachers()

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    )
  }

  if (error || !teacher) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-red-500">{error || "Enseignant non trouvé"}</p>
        </div>
      </AppLayout>
    )
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      on_leave: "bg-yellow-100 text-yellow-800",
    }
    return <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>{status === "active" ? "Actif" : status === "inactive" ? "Inactif" : "En congé"}</Badge>
  }

  return (
    <AppLayout>
          <PageHeader
            title={`Profil de ${teacher.full_name}`}
            description={`${teacher.speciality_names?.join(", ") || "Aucune spécialité"} - ${teacher.contrat === "mensuel" ? "Mensuel" : "Horaire"}`}
          >
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button onClick={() => setIsEditModalOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </div>
          </PageHeader>

          {/* Teacher Header Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-lg">
                    {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{teacher.full_name}</h2>
                    </div>
                    {getStatusBadge(teacher.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span>{teacher.speciality_names?.join(", ") || "Aucune spécialité"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Embauché le {new Date(teacher.hire_date).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{teacher.phone || "Non renseigné"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="teaching">Enseignement</TabsTrigger>
              <TabsTrigger value="attendance">Présences</TabsTrigger>
              <TabsTrigger value="financial">Financier</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Informations personnelles</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Prénom</span>
                        <p className="text-gray-900">{teacher.first_name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Nom</span>
                        <p className="text-gray-900">{teacher.last_name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Sexe</span>
                        <p className="text-gray-900">{teacher.gender}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Date d'embauche</span>
                        <p className="text-gray-900">{new Date(teacher.hire_date).toLocaleDateString("fr-FR")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Contact</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{teacher.phone || "Non renseigné"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{teacher.email}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                      <p className="text-gray-900">{teacher.address || "Non renseignée"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="teaching" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Matières enseignées</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Spécialités</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {teacher.speciality_names?.length > 0 ? teacher.speciality_names.map((subject, index) => (
                          <Badge key={index} className="bg-primary/10 text-primary">{subject}</Badge>
                        )) : <p className="text-gray-500">Aucune spécialité</p>}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Contrat</span>
                      <p className="text-gray-900 capitalize">{teacher.contrat}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>Qualifications</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">Informations non disponibles</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des présences</CardTitle>
                </CardHeader>
                <CardContent>
                  {attendanceRecords.length === 0 ? (
                    <p className="text-gray-500">Aucune présence enregistrée</p>
                  ) : (
                    <div className="space-y-2">
                      {attendanceRecords.slice(0, 20).map((record) => (
                        <div key={record.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>{new Date(record.date).toLocaleDateString("fr-FR")}</span>
                          <Badge variant={record.status === "present" ? "default" : record.status === "absent" ? "destructive" : "secondary"}>
                            {record.status === "present" ? "Présent" : record.status === "absent" ? "Absent" : record.status === "retard" ? "Retard" : "Excusé"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations salariales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Salaire</span>
                      <p className="text-lg font-semibold text-gray-900">{teacher.salary?.toLocaleString("fr-FR")} FCFA</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Type de contrat</span>
                      <Badge className="bg-blue-100 text-blue-800 ml-2 capitalize">{teacher.contrat}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <EditTeacherProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            teacher={teacher}
            onEdit={handleEditProfile}
          />
        </AppLayout>
  )
}
