"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EditStudentProfileModal } from "@/components/students/edit-student-profile-modal"
import {
  User,
  Users,
  Heart,
  GraduationCap,
  FileText,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Download,
  Mail,
} from "lucide-react"

// Mock detailed student data
const getStudentById = (id) => {
  const students = {
    1: {
      id: 1,
      firstName: "Aminata",
      lastName: "Traoré",
      fullName: "Aminata Traoré",
      dateOfBirth: "2010-03-15",
      placeOfBirth: "Bamako, Mali",
      gender: "Féminin",
      nationality: "Malienne",
      religion: "Islam",
      bloodType: "O+",
      class: "CM2",
      school: "École Primaire de Bamako",
      studentId: "EPB-2024-001",
      enrollmentDate: "2024-09-01",
      status: "Actif",
      photo: "/diverse-student-girl.png",

      // Parent/Guardian Info
      parentInfo: {
        fatherName: "Mamadou Traoré",
        fatherPhone: "+223 76 12 34 56",
        fatherProfession: "Commerçant",
        motherName: "Fatoumata Traoré",
        motherPhone: "+223 65 43 21 87",
        motherProfession: "Enseignante",
        guardianName: "Mamadou Traoré",
        guardianRelation: "Père",
        guardianPhone: "+223 76 12 34 56",
        email: "mamadou.traore@email.com",
      },

      // Address Info
      address: {
        street: "Rue 245, Porte 156",
        neighborhood: "Quartier Hippodrome",
        city: "Bamako",
        region: "District de Bamako",
        country: "Mali",
      },

      // Medical Info
      medicalInfo: {
        bloodType: "O+",
        allergies: "Aucune allergie connue",
        medicalConditions: "Aucune condition particulière",
        medications: "Aucun médicament",
        doctorName: "Dr. Sekou Keita",
        doctorPhone: "+223 78 90 12 34",
        emergencyContact: "Fatoumata Traoré (+223 65 43 21 87)",
        vaccinationStatus: "À jour",
      },

      // Academic Info
      academicInfo: {
        previousSchool: "École Maternelle de Bamako",
        previousClass: "Grande Section",
        currentGPA: "16.5/20",
        subjects: [
          { name: "Français", grade: "17/20", teacher: "Mme Diallo" },
          { name: "Mathématiques", grade: "16/20", teacher: "M. Keita" },
          { name: "Sciences", grade: "15/20", teacher: "Mme Coulibaly" },
          { name: "Histoire-Géographie", grade: "18/20", teacher: "M. Sangaré" },
        ],
        attendance: "95%",
        behavior: "Excellent",
        specialNeeds: "Aucun besoin particulier",
      },

      // Financial Info
      financialInfo: {
        tuitionFee: "150,000 FCFA",
        paidAmount: "150,000 FCFA",
        remainingAmount: "0 FCFA",
        paymentStatus: "Payé",
        scholarshipStatus: "Aucune bourse",
      },
    },
  }

  return students[id] || null
}

export default function StudentProfilePage() {
  const params = useParams()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const student = getStudentById(params.id)

  if (!student) {
    return <div>Élève non trouvé</div>
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      Actif: "bg-green-100 text-green-800",
      Inactif: "bg-red-100 text-red-800",
      Suspendu: "bg-yellow-100 text-yellow-800",
    }
    return <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader title={`Profil de ${student.fullName}`} description={`${student.class} - ${student.school}`}>
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

          {/* Student Header Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={student.photo || "/placeholder.svg"} alt={student.fullName} />
                  <AvatarFallback className="text-lg">
                    {student.firstName[0]}
                    {student.lastName[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{student.fullName}</h2>
                      <p className="text-gray-600">ID: {student.studentId}</p>
                    </div>
                    {getStatusBadge(student.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <span>
                        {student.class} - {student.school}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Né(e) le {new Date(student.dateOfBirth).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{student.parentInfo.guardianPhone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="family">Famille</TabsTrigger>
              <TabsTrigger value="medical">Médical</TabsTrigger>
              <TabsTrigger value="academic">Académique</TabsTrigger>
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
                        <p className="text-gray-900">{student.firstName}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Nom</span>
                        <p className="text-gray-900">{student.lastName}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Date de naissance</span>
                        <p className="text-gray-900">{new Date(student.dateOfBirth).toLocaleDateString("fr-FR")}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Lieu de naissance</span>
                        <p className="text-gray-900">{student.placeOfBirth}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Sexe</span>
                        <p className="text-gray-900">{student.gender}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Nationalité</span>
                        <p className="text-gray-900">{student.nationality}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Religion</span>
                        <p className="text-gray-900">{student.religion}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Groupe sanguin</span>
                        <p className="text-gray-900">{student.bloodType}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Adresse</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Rue</span>
                      <p className="text-gray-900">{student.address.street}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Quartier</span>
                      <p className="text-gray-900">{student.address.neighborhood}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Ville</span>
                      <p className="text-gray-900">{student.address.city}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Région</span>
                      <p className="text-gray-900">{student.address.region}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Pays</span>
                      <p className="text-gray-900">{student.address.country}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="family" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Informations des parents</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-b pb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Père</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Nom</span>
                          <p className="text-gray-900">{student.parentInfo.fatherName}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Téléphone</span>
                          <p className="text-gray-900">{student.parentInfo.fatherPhone}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Profession</span>
                          <p className="text-gray-900">{student.parentInfo.fatherProfession}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Mère</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Nom</span>
                          <p className="text-gray-900">{student.parentInfo.motherName}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Téléphone</span>
                          <p className="text-gray-900">{student.parentInfo.motherPhone}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Profession</span>
                          <p className="text-gray-900">{student.parentInfo.motherProfession}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact principal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Tuteur/Responsable</span>
                      <p className="text-gray-900">{student.parentInfo.guardianName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Relation</span>
                      <p className="text-gray-900">{student.parentInfo.guardianRelation}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{student.parentInfo.guardianPhone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{student.parentInfo.email}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-4 w-4" />
                    <span>Informations médicales</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Groupe sanguin</span>
                        <p className="text-gray-900">{student.medicalInfo.bloodType}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Allergies</span>
                        <p className="text-gray-900">{student.medicalInfo.allergies}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Conditions médicales</span>
                        <p className="text-gray-900">{student.medicalInfo.medicalConditions}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Médicaments</span>
                        <p className="text-gray-900">{student.medicalInfo.medications}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Médecin traitant</span>
                        <p className="text-gray-900">{student.medicalInfo.doctorName}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Téléphone médecin</span>
                        <p className="text-gray-900">{student.medicalInfo.doctorPhone}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Contact d'urgence</span>
                        <p className="text-gray-900">{student.medicalInfo.emergencyContact}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Statut vaccinal</span>
                        <Badge className="bg-green-100 text-green-800">{student.medicalInfo.vaccinationStatus}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>Informations scolaires</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">École précédente</span>
                      <p className="text-gray-900">{student.academicInfo.previousSchool}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Classe précédente</span>
                      <p className="text-gray-900">{student.academicInfo.previousClass}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Moyenne générale</span>
                      <p className="text-gray-900 font-semibold">{student.academicInfo.currentGPA}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Taux de présence</span>
                      <p className="text-gray-900">{student.academicInfo.attendance}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Comportement</span>
                      <Badge className="bg-green-100 text-green-800">{student.academicInfo.behavior}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notes par matière</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {student.academicInfo.subjects.map((subject, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{subject.name}</p>
                            <p className="text-sm text-gray-600">Prof. {subject.teacher}</p>
                          </div>
                          <Badge variant="outline" className="font-semibold">
                            {subject.grade}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Informations financières</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Frais de scolarité</span>
                        <p className="text-gray-900 font-semibold">{student.financialInfo.tuitionFee}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Montant payé</span>
                        <p className="text-green-600 font-semibold">{student.financialInfo.paidAmount}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Montant restant</span>
                        <p className="text-gray-900 font-semibold">{student.financialInfo.remainingAmount}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Statut de paiement</span>
                        <Badge className="bg-green-100 text-green-800 ml-2">
                          {student.financialInfo.paymentStatus}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Bourse</span>
                        <p className="text-gray-900">{student.financialInfo.scholarshipStatus}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <EditStudentProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            student={student}
          />
        </div>
      </main>
    </div>
  )
}
