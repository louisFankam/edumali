"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import { StatsGrid } from "@/components/ui/stats-grid"
import { PageHeader } from "@/components/page-header"
import { NewRegistrationModal } from "@/components/registrations/new-registration-modal"
import { ReenrollmentModal } from "@/components/registrations/reenrollment-modal"
import { RegistrationDetailsModal } from "@/components/registrations/registration-details-modal"
import { UserPlus, RefreshCw, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function RegistrationsPage() {
  const [showNewRegistration, setShowNewRegistration] = useState(false)
  const [showReenrollment, setShowReenrollment] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [activeTab, setActiveTab] = useState("new")

  // Mock data for registrations
  const registrations = [
    {
      id: 1,
      studentName: "Aminata Traoré",
      parentName: "Mamadou Traoré",
      phone: "+223 76 12 34 56",
      class: "6ème A",
      school: "Lycée Askia Mohamed",
      status: "pending",
      submittedDate: "2024-01-15",
      type: "new",
      documents: ["acte_naissance", "certificat_medical", "photo"],
      missingDocs: ["bulletin_precedent"],
    },
    {
      id: 2,
      studentName: "Ibrahim Keita",
      parentName: "Fatoumata Keita",
      phone: "+223 65 43 21 87",
      class: "5ème B",
      school: "Collège Soundiata",
      status: "approved",
      submittedDate: "2024-01-12",
      type: "reenrollment",
      documents: ["acte_naissance", "certificat_medical", "photo", "bulletin_precedent"],
      missingDocs: [],
    },
    {
      id: 3,
      studentName: "Mariam Coulibaly",
      parentName: "Sekou Coulibaly",
      phone: "+223 78 90 12 34",
      class: "3ème C",
      school: "Lycée Askia Mohamed",
      status: "rejected",
      submittedDate: "2024-01-10",
      type: "new",
      documents: ["acte_naissance", "photo"],
      missingDocs: ["certificat_medical", "bulletin_precedent"],
      rejectionReason: "Documents incomplets",
    },
  ]

  const stats = [
    {
      title: "Nouvelles Inscriptions",
      value: "156",
      change: "+12%",
      icon: UserPlus,
      iconColor: "text-blue-600",
    },
    {
      title: "Réinscriptions",
      value: "89",
      change: "+8%",
      icon: RefreshCw,
      iconColor: "text-green-600",
    },
    {
      title: "En Attente",
      value: "23",
      change: "-5%",
      icon: Clock,
      iconColor: "text-yellow-600",
    },
    {
      title: "Approuvées",
      value: "198",
      change: "+15%",
      icon: CheckCircle,
      iconColor: "text-green-600",
    },
  ]

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "En attente", variant: "secondary", color: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Approuvée", variant: "default", color: "bg-green-100 text-green-800" },
      rejected: { label: "Rejetée", variant: "destructive", color: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status] || statusConfig.pending
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getTypeIcon = (type) => {
    return type === "new" ? (
      <UserPlus className="h-4 w-4 text-blue-600" />
    ) : (
      <RefreshCw className="h-4 w-4 text-green-600" />
    )
  }

  const columns = [
    {
      key: "studentName",
      header: "Élève",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          {getTypeIcon(row.type)}
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.parentName}</div>
          </div>
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
      key: "status",
      header: "Statut",
      sortable: true,
      render: (value) => getStatusBadge(value),
    },
    {
      key: "submittedDate",
      header: "Date de soumission",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString("fr-FR"),
    },
    {
      key: "documents",
      header: "Documents",
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {value.length}/{value.length + row.missingDocs.length}
          </span>
          {row.missingDocs.length > 0 && <AlertCircle className="h-4 w-4 text-yellow-500" />}
        </div>
      ),
    },
  ]

  const actions = [
    {
      label: "Voir détails",
      onClick: (row) => setSelectedRegistration(row),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inscriptions et Réinscriptions"
        description="Gérez les nouvelles inscriptions et réinscriptions des élèves"
      />

      <StatsGrid stats={stats} />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new">Nouvelles Inscriptions</TabsTrigger>
            <TabsTrigger value="reenrollment">Réinscriptions</TabsTrigger>
            <TabsTrigger value="all">Toutes</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setShowNewRegistration(true)} className="flex-1 sm:flex-none">
            <UserPlus className="h-4 w-4 mr-2" />
            Nouvelle Inscription
          </Button>
          <Button variant="outline" onClick={() => setShowReenrollment(true)} className="flex-1 sm:flex-none">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réinscription
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <DataTable
            data={registrations.filter(
              (reg) =>
                activeTab === "all" ||
                (activeTab === "new" && reg.type === "new") ||
                (activeTab === "reenrollment" && reg.type === "reenrollment"),
            )}
            columns={columns}
            actions={actions}
            onRowClick={(row) => setSelectedRegistration(row)}
          />
        </CardContent>
      </Card>

      <NewRegistrationModal open={showNewRegistration} onOpenChange={setShowNewRegistration} />

      <ReenrollmentModal open={showReenrollment} onOpenChange={setShowReenrollment} />

      {selectedRegistration && (
        <RegistrationDetailsModal
          registration={selectedRegistration}
          open={!!selectedRegistration}
          onOpenChange={() => setSelectedRegistration(null)}
        />
      )}
    </div>
  )
}
