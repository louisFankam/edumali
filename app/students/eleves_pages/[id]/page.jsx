"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EditStudentProfileModal } from "@/components/students/edit-student-profile-modal"
import {
  User, Users, Heart, GraduationCap, FileText,
  Phone, MapPin, Calendar, Edit, Download, Mail, Loader2,
} from "lucide-react"
import { useStudent } from "@/hooks/use-students"

const MOCK_EXTRA = {
  fullName: "",
  placeOfBirth: "Bamako, Mali",
  religion: "Islam",
  bloodType: "O+",
  class: "CM2",
  school: "École Primaire de Bamako",
  studentId: "EPB-2024-001",
  enrollmentDate: new Date().toISOString().split("T")[0],
  photo: "/placeholder.svg",

  parentInfo: {
    fatherName: "", fatherPhone: "", fatherProfession: "",
    motherName: "", motherPhone: "", motherProfession: "",
    guardianName: "", guardianRelation: "", guardianPhone: "", email: "",
  },

  address: {
    street: "", neighborhood: "", city: "Bamako", region: "District de Bamako", country: "Mali",
  },

  medicalInfo: {
    bloodType: "O+", allergies: "Aucune allergie connue",
    medicalConditions: "Aucune condition particulière", medications: "Aucun médicament",
    doctorName: "", doctorPhone: "", emergencyContact: "", vaccinationStatus: "À jour",
  },

  academicInfo: {
    previousSchool: "", previousClass: "", currentGPA: "",
    subjects: [],
    attendance: "", behavior: "", specialNeeds: "Aucun besoin particulier",
  },

  financialInfo: {
    tuition: "", paid: "", remaining: "",
    lastPayment: "",   paymentHistory: [],
  },

  documents: [],
}

export default function StudentProfilePage() {
  const params = useParams()
  const id = params?.id
  const { student, isLoading } = useStudent(id)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </AppLayout>
    )
  }

  if (!student) {
    return (
      <AppLayout>
        <Card><CardContent className="py-12 text-center text-muted-foreground">Élève non trouvé</CardContent></Card>
      </AppLayout>
    )
  }

  const extra = MOCK_EXTRA
  extra.fullName = `${student.firstName} ${student.lastName}`
  extra.class = student.className
  extra.studentId = `EDM-${String(student.id).padStart(4, "0")}`
  extra.enrollmentDate = student.registrationDate
  extra.parentInfo.fatherName = student.parentName
  extra.parentInfo.guardianName = student.parentName
  extra.parentInfo.guardianPhone = student.parentPhone

  return (
    <AppLayout>
      <PageHeader title={`Profil de ${extra.fullName}`} description={`Élève · ${extra.class} · ${student.status}`}>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => setIsEditModalOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={extra.photo} alt={extra.fullName} />
              <AvatarFallback className="text-lg">
                {student.firstName[0]}{student.lastName[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-serif font-bold">{extra.fullName}</h2>
                <p className="text-muted-foreground">{extra.studentId}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem icon={Calendar} label="Date naissance" value={student.birthDate} />
                <InfoItem icon={User} label="Genre" value={student.gender} />
                <InfoItem icon={GraduationCap} label="Classe" value={extra.class} />
                <InfoItem icon={MapPin} label="Nationalité" value={student.nationality || "N/A"} />
              </div>
            </div>

            <Badge variant={student.status === "Actif" ? "default" : "secondary"} className="text-sm px-3 py-1">
              {student.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="family">Famille</TabsTrigger>
          <TabsTrigger value="medical">Médical</TabsTrigger>
          <TabsTrigger value="academic">Académique</TabsTrigger>
          <TabsTrigger value="financial">Financier</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader><CardTitle>Informations Générales</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoItem icon={User} label="Prénom" value={student.firstName} />
              <InfoItem icon={User} label="Nom" value={student.lastName} />
              <InfoItem icon={Calendar} label="Date de naissance" value={student.birthDate} />
              <InfoItem icon={MapPin} label="Lieu de naissance" value={extra.placeOfBirth} />
              <InfoItem icon={User} label="Genre" value={student.gender} />
              <InfoItem icon={Users} label="Nationalité" value={student.nationality || "N/A"} />
              <InfoItem icon={GraduationCap} label="Classe" value={extra.class} />
              <InfoItem icon={Calendar} label="Date d'inscription" value={extra.enrollmentDate} />
              <InfoItem icon={FileText} label="Statut" value={student.status} />
              <InfoItem icon={FileText} label="N° Étudiant" value={extra.studentId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="family">
          <Card>
            <CardHeader><CardTitle>Informations Familiales</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem icon={User} label="Père" value={extra.parentInfo.fatherName || "Non renseigné"} />
              <InfoItem icon={Phone} label="Tél. père" value={extra.parentInfo.fatherPhone || "Non renseigné"} />
              <InfoItem icon={User} label="Mère" value={extra.parentInfo.motherName || "Non renseignée"} />
              <InfoItem icon={Phone} label="Tél. mère" value={extra.parentInfo.motherPhone || "Non renseigné"} />
              <InfoItem icon={User} label="Tuteur" value={extra.parentInfo.guardianName} />
              <InfoItem icon={Phone} label="Tél. tuteur" value={extra.parentInfo.guardianPhone} />
              <InfoItem icon={Mail} label="Email" value={extra.parentInfo.email || "Non renseigné"} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical">
          <Card>
            <CardHeader><CardTitle>Informations Médicales</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem icon={Heart} label="Groupe sanguin" value={extra.medicalInfo.bloodType} />
              <InfoItem icon={FileText} label="Allergies" value={extra.medicalInfo.allergies} />
              <InfoItem icon={FileText} label="Conditions médicales" value={extra.medicalInfo.medicalConditions} />
              <InfoItem icon={FileText} label="Vaccination" value={extra.medicalInfo.vaccinationStatus} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardHeader><CardTitle>Informations Académiques</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={GraduationCap} label="École précédente" value={extra.academicInfo.previousSchool || "Non renseigné"} />
                <InfoItem icon={FileText} label="Classe précédente" value={extra.academicInfo.previousClass || "Non renseigné"} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader><CardTitle>Informations Financières</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">
              Les informations financières seront disponibles après configuration de la scolarité.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditStudentProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} student={{ ...student, fullName: `${student.firstName} ${student.lastName}` }} />
    </AppLayout>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
      <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  )
}
