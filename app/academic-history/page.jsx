"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { SchoolYearSelector } from "@/components/school-year-selector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { StatsGrid } from "@/components/ui/stats-grid"
import { AcademicRecordModal } from "@/components/academic-history/academic-record-modal"
import { BulletinModal } from "@/components/academic-history/bulletin-modal"
import { ProgressionModal } from "@/components/academic-history/progression-modal"
import { Search, FileText, TrendingUp, Award, Calendar, Users, BarChart3, Eye, Download } from "lucide-react"

export default function AcademicHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedYear, setSelectedYear] = useState("2024-2025")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [showBulletinModal, setShowBulletinModal] = useState(false)
  const [showProgressionModal, setShowProgressionModal] = useState(false)

  // Mock data for academic records
  const academicRecords = [
    {
      id: 1,
      studentId: "EPB-2024-001",
      studentName: "Aminata Traoré",
      class: "CM2",
      school: "École Primaire de Bamako",
      schoolYear: "2024-2025",
      trimester: "1er Trimestre",
      averageGrade: "16.5/20",
      rank: "2/35",
      status: "Admis",
      subjects: [
        { name: "Français", grade: "17/20", coefficient: 4, teacher: "Mme Diallo" },
        { name: "Mathématiques", grade: "16/20", coefficient: 4, teacher: "M. Keita" },
        { name: "Sciences", grade: "15/20", coefficient: 3, teacher: "Mme Coulibaly" },
        { name: "Histoire-Géo", grade: "18/20", coefficient: 2, teacher: "M. Sangaré" },
        { name: "Anglais", grade: "14/20", coefficient: 2, teacher: "Mme Touré" },
      ],
      attendance: "95%",
      behavior: "Très bien",
      teacherComments: "Élève sérieuse et appliquée. Excellents résultats en littérature.",
    },
    {
      id: 2,
      studentId: "CS-2024-002",
      studentName: "Ibrahim Keita",
      class: "6ème A",
      school: "Collège Soundiata",
      schoolYear: "2024-2025",
      trimester: "1er Trimestre",
      averageGrade: "14.2/20",
      rank: "8/42",
      status: "Admis",
      subjects: [
        { name: "Français", grade: "13/20", coefficient: 4, teacher: "M. Diabaté" },
        { name: "Mathématiques", grade: "15/20", coefficient: 4, teacher: "Mme Koné" },
        { name: "SVT", grade: "16/20", coefficient: 3, teacher: "Dr. Sidibé" },
        { name: "Histoire-Géo", grade: "12/20", coefficient: 3, teacher: "M. Traoré" },
        { name: "Anglais", grade: "14/20", coefficient: 2, teacher: "Mme Johnson" },
      ],
      attendance: "92%",
      behavior: "Bien",
      teacherComments: "Bon élève avec des capacités. Doit améliorer la régularité dans le travail.",
    },
  ]

  const stats = [
    {
      title: "Bulletins générés",
      value: "1,247",
      change: "+15%",
      icon: FileText,
      iconColor: "text-blue-600",
    },
    {
      title: "Moyenne générale",
      value: "14.8/20",
      change: "+0.5",
      icon: TrendingUp,
      iconColor: "text-green-600",
    },
    {
      title: "Taux de réussite",
      value: "87%",
      change: "+3%",
      icon: Award,
      iconColor: "text-yellow-600",
    },
    {
      title: "Élèves suivis",
      value: "856",
      change: "+12%",
      icon: Users,
      iconColor: "text-purple-600",
    },
  ]

  const getStatusBadge = (status) => {
    const statusColors = {
      Admis: "bg-green-100 text-green-800",
      "En cours": "bg-blue-100 text-blue-800",
      Redoublant: "bg-yellow-100 text-yellow-800",
      Exclu: "bg-red-100 text-red-800",
    }
    return <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
  }

  const columns = [
    {
      key: "studentName",
      header: "Élève",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.studentId}</div>
        </div>
      ),
    },
    {
      key: "class",
      header: "Classe",
      sortable: true,
    },
    {
      key: "school",
      header: "École",
      sortable: true,
    },
    {
      key: "trimester",
      header: "Période",
      sortable: true,
    },
    {
      key: "averageGrade",
      header: "Moyenne",
      sortable: true,
      render: (value) => <span className="font-semibold text-primary">{value}</span>,
    },
    {
      key: "rank",
      header: "Rang",
      sortable: true,
    },
    {
      key: "status",
      header: "Statut",
      sortable: true,
      render: (value) => getStatusBadge(value),
    },
  ]

  const actions = [
    {
      label: "Voir bulletin",
      icon: Eye,
      onClick: (row) => {
        setSelectedStudent(row)
        setShowBulletinModal(true)
      },
    },
    {
      label: "Voir progression",
      icon: BarChart3,
      onClick: (row) => {
        setSelectedStudent(row)
        setShowProgressionModal(true)
      },
    },
    {
      label: "Dossier complet",
      icon: FileText,
      onClick: (row) => {
        setSelectedStudent(row)
        setShowRecordModal(true)
      },
    },
  ]

  const filteredRecords = academicRecords.filter((record) => {
    const matchesSearch =
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = selectedClass === "all" || record.class === selectedClass
    const matchesYear = selectedYear === "all" || record.schoolYear === selectedYear
    return matchesSearch && matchesClass && matchesYear
  })

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader
            title="Historique Académique"
            description="Suivi des résultats scolaires et progression des élèves"
          >
            <div className="flex items-center space-x-2">
              <SchoolYearSelector />
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </PageHeader>

          <StatsGrid stats={stats} />

          <Tabs defaultValue="bulletins" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="bulletins">Bulletins</TabsTrigger>
              <TabsTrigger value="progression">Progression</TabsTrigger>
              <TabsTrigger value="statistics">Statistiques</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
            </TabsList>

            <TabsContent value="bulletins" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rechercher et filtrer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Rechercher par nom ou ID élève..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
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
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Année scolaire" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les années</SelectItem>
                        <SelectItem value="2024-2025">2024-2025</SelectItem>
                        <SelectItem value="2023-2024">2023-2024</SelectItem>
                        <SelectItem value="2022-2023">2022-2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <DataTable
                    data={filteredRecords}
                    columns={columns}
                    actions={actions}
                    onRowClick={(row) => {
                      setSelectedStudent(row)
                      setShowBulletinModal(true)
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progression" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Évolution des moyennes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">1er Trimestre</span>
                        <span className="text-lg font-semibold text-primary">14.8/20</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">2ème Trimestre</span>
                        <span className="text-lg font-semibold text-primary">15.2/20</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">3ème Trimestre</span>
                        <span className="text-lg font-semibold text-gray-400">En cours</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="h-4 w-4" />
                      <span>Répartition des résultats</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Excellent (≥16)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div className="w-3/5 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-medium">35%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Bien (14-16)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div className="w-2/5 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-medium">28%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Assez bien (12-14)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div className="w-1/4 h-2 bg-yellow-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-medium">22%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Passable (10-12)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div className="w-1/6 h-2 bg-orange-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-medium">15%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Matières les mieux réussies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Histoire-Géographie</span>
                        <span className="font-semibold text-green-600">16.2/20</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Français</span>
                        <span className="font-semibold text-green-600">15.8/20</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Sciences</span>
                        <span className="font-semibold text-green-600">15.5/20</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Matières à améliorer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Anglais</span>
                        <span className="font-semibold text-orange-600">12.8/20</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Mathématiques</span>
                        <span className="font-semibold text-orange-600">13.2/20</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Physique</span>
                        <span className="font-semibold text-orange-600">13.5/20</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tendances générales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Progression</span>
                        <Badge className="bg-green-100 text-green-800">+0.4 pts</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Assiduité</span>
                        <Badge className="bg-blue-100 text-blue-800">94%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Comportement</span>
                        <Badge className="bg-green-100 text-green-800">Très bien</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Rapports disponibles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <FileText className="h-4 w-4 mr-2" />
                      Bulletin trimestriel
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Rapport de progression
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Award className="h-4 w-4 mr-2" />
                      Certificat de scolarité
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Calendar className="h-4 w-4 mr-2" />
                      Relevé de présences
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter tous les bulletins
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      <FileText className="h-4 w-4 mr-2" />
                      Générer rapport de classe
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analyse comparative
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Modals */}
          <AcademicRecordModal open={showRecordModal} onOpenChange={setShowRecordModal} student={selectedStudent} />

          <BulletinModal open={showBulletinModal} onOpenChange={setShowBulletinModal} student={selectedStudent} />

          <ProgressionModal
            open={showProgressionModal}
            onOpenChange={setShowProgressionModal}
            student={selectedStudent}
          />
        </div>
      </main>
    </div>
  )
}
