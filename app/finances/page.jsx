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
import { AddFeeModal } from "@/components/finances/add-fee-modal"
import { PaymentModal } from "@/components/finances/payment-modal"
import { InvoiceModal } from "@/components/finances/invoice-modal"
import { FinancialReportModal } from "@/components/finances/financial-report-modal"
import {
  Search,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
  Plus,
  Eye,
  CreditCard,
  FileText,
  Download,
  Calculator,
} from "lucide-react"
import { NotificationBellMain } from "@/components/notifications/notification-bell-main"

export default function FinancesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedFeeType, setSelectedFeeType] = useState("all")
  const [showAddFeeModal, setShowAddFeeModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Mock data for student fees
  const studentFees = [
    {
      id: 1,
      studentId: "EPB-2024-001",
      studentName: "Aminata Traoré",
      class: "CM2",
      school: "École Primaire de Bamako",
      tuitionFee: 150000,
      canteenFee: 25000,
      transportFee: 15000,
      uniformFee: 12000,
      totalFees: 202000,
      paidAmount: 202000,
      remainingAmount: 0,
      paymentStatus: "paid",
      lastPaymentDate: "2024-01-15",
      parentName: "Mamadou Traoré",
      parentPhone: "+223 76 12 34 56",
    },
    {
      id: 2,
      studentId: "CS-2024-002",
      studentName: "Ibrahim Keita",
      class: "6ème A",
      school: "Collège Soundiata",
      tuitionFee: 200000,
      canteenFee: 30000,
      transportFee: 20000,
      uniformFee: 15000,
      totalFees: 265000,
      paidAmount: 150000,
      remainingAmount: 115000,
      paymentStatus: "partial",
      lastPaymentDate: "2024-01-10",
      parentName: "Fatoumata Keita",
      parentPhone: "+223 65 43 21 87",
    },
    {
      id: 3,
      studentId: "LAM-2024-003",
      studentName: "Mariam Coulibaly",
      class: "3ème C",
      school: "Lycée Askia Mohamed",
      tuitionFee: 250000,
      canteenFee: 35000,
      transportFee: 25000,
      uniformFee: 18000,
      totalFees: 328000,
      paidAmount: 0,
      remainingAmount: 328000,
      paymentStatus: "unpaid",
      lastPaymentDate: null,
      parentName: "Sekou Coulibaly",
      parentPhone: "+223 78 90 12 34",
    },
  ]

  const stats = [
    {
      title: "Revenus totaux",
      value: "45,250,000 FCFA",
      change: "+12%",
      icon: DollarSign,
      iconColor: "text-green-600",
    },
    {
      title: "Paiements en attente",
      value: "8,750,000 FCFA",
      change: "-5%",
      icon: AlertTriangle,
      iconColor: "text-yellow-600",
    },
    {
      title: "Taux de recouvrement",
      value: "84%",
      change: "+3%",
      icon: TrendingUp,
      iconColor: "text-blue-600",
    },
    {
      title: "Élèves à jour",
      value: "756/890",
      change: "+15",
      icon: Users,
      iconColor: "text-purple-600",
    },
  ]

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { label: "Payé", color: "bg-green-100 text-green-800" },
      partial: { label: "Partiel", color: "bg-yellow-100 text-yellow-800" },
      unpaid: { label: "Impayé", color: "bg-red-100 text-red-800" },
      overdue: { label: "En retard", color: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status] || statusConfig.unpaid
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA"
  }

  const columns = [
    {
      key: "studentName",
      header: "Élève",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">
            {row.studentId} - {row.class}
          </div>
        </div>
      ),
    },
    {
      key: "school",
      header: "École",
      sortable: true,
    },
    {
      key: "totalFees",
      header: "Frais totaux",
      sortable: true,
      render: (value) => <span className="font-semibold">{formatCurrency(value)}</span>,
    },
    {
      key: "paidAmount",
      header: "Montant payé",
      sortable: true,
      render: (value) => <span className="text-green-600 font-semibold">{formatCurrency(value)}</span>,
    },
    {
      key: "remainingAmount",
      header: "Reste à payer",
      sortable: true,
      render: (value) => (
        <span className={`font-semibold ${value > 0 ? "text-red-600" : "text-green-600"}`}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      header: "Statut",
      sortable: true,
      render: (value) => getStatusBadge(value),
    },
    {
      key: "lastPaymentDate",
      header: "Dernier paiement",
      sortable: true,
      render: (value) => (value ? new Date(value).toLocaleDateString("fr-FR") : "Aucun"),
    },
  ]

  const actions = [
    {
      label: "Voir détails",
      icon: Eye,
      onClick: (row) => {
        setSelectedStudent(row)
        setShowInvoiceModal(true)
      },
    },
    {
      label: "Enregistrer paiement",
      icon: CreditCard,
      onClick: (row) => {
        setSelectedStudent(row)
        setShowPaymentModal(true)
      },
    },
  ]

  const filteredFees = studentFees.filter((fee) => {
    const matchesSearch =
      fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.parentName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || fee.paymentStatus === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader title="Gestion Financière" description="Suivi des frais de scolarité et paiements">
            <div className="flex items-center space-x-2">
              <NotificationBellMain />
              <SchoolYearSelector />
              <Button variant="outline" onClick={() => setShowReportModal(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Rapports
              </Button>
              <Button onClick={() => setShowAddFeeModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau frais
              </Button>
            </div>
          </PageHeader>

          <StatsGrid stats={stats} />

          <Tabs defaultValue="fees" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="fees">Frais de scolarité</TabsTrigger>
              <TabsTrigger value="payments">Paiements</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>

            <TabsContent value="fees" className="space-y-4">
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
                          placeholder="Rechercher par nom, ID élève ou parent..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Statut de paiement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="paid">Payé</SelectItem>
                        <SelectItem value="partial">Paiement partiel</SelectItem>
                        <SelectItem value="unpaid">Impayé</SelectItem>
                        <SelectItem value="overdue">En retard</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedFeeType} onValueChange={setSelectedFeeType}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Type de frais" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les frais</SelectItem>
                        <SelectItem value="tuition">Scolarité</SelectItem>
                        <SelectItem value="canteen">Cantine</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="uniform">Uniformes</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <DataTable
                    data={filteredFees}
                    columns={columns}
                    actions={actions}
                    onRowClick={(row) => {
                      setSelectedStudent(row)
                      setShowInvoiceModal(true)
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Paiements du jour</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">2,450,000 FCFA</div>
                    <p className="text-sm text-gray-600">15 paiements reçus</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Paiements du mois</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">18,750,000 FCFA</div>
                    <p className="text-sm text-gray-600">+12% vs mois dernier</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Paiements en retard</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">134</div>
                    <p className="text-sm text-gray-600">Élèves concernés</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Paiements récents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        student: "Aminata Traoré",
                        amount: 150000,
                        type: "Scolarité",
                        date: "2024-01-15",
                        method: "Espèces",
                      },
                      {
                        student: "Ibrahim Keita",
                        amount: 75000,
                        type: "Scolarité (partiel)",
                        date: "2024-01-14",
                        method: "Mobile Money",
                      },
                      {
                        student: "Kadiatou Sangaré",
                        amount: 25000,
                        type: "Cantine",
                        date: "2024-01-14",
                        method: "Virement",
                      },
                    ].map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{payment.student}</div>
                          <div className="text-sm text-gray-600">
                            {payment.type} - {payment.method}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{formatCurrency(payment.amount)}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(payment.date).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Rapports financiers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <FileText className="h-4 w-4 mr-2" />
                      Rapport mensuel des recettes
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Calculator className="h-4 w-4 mr-2" />
                      État des impayés
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analyse des tendances
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Users className="h-4 w-4 mr-2" />
                      Rapport par classe
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Répartition des frais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Frais de scolarité</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div className="w-4/5 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-medium">75%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Cantine</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div className="w-1/6 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-medium">15%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Transport</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div className="w-1/12 h-2 bg-yellow-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-medium">7%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Uniformes</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div className="w-1/20 h-2 bg-purple-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-medium">3%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tarifs par niveau</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { level: "Primaire (CP-CM2)", tuition: "120,000 FCFA", canteen: "20,000 FCFA" },
                      { level: "Collège (6ème-3ème)", tuition: "180,000 FCFA", canteen: "25,000 FCFA" },
                      { level: "Lycée (2nde-Tle)", tuition: "220,000 FCFA", canteen: "30,000 FCFA" },
                    ].map((tariff, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">{tariff.level}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Scolarité:</span>
                            <p className="font-semibold">{tariff.tuition}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Cantine:</span>
                            <p className="font-semibold">{tariff.canteen}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Modes de paiement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Espèces</span>
                      <Badge className="bg-green-100 text-green-800">Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Mobile Money</span>
                      <Badge className="bg-green-100 text-green-800">Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Virement bancaire</span>
                      <Badge className="bg-green-100 text-green-800">Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Chèque</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Limité</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Modals */}
          <AddFeeModal open={showAddFeeModal} onOpenChange={setShowAddFeeModal} />

          <PaymentModal open={showPaymentModal} onOpenChange={setShowPaymentModal} student={selectedStudent} />

          <InvoiceModal open={showInvoiceModal} onOpenChange={setShowInvoiceModal} student={selectedStudent} />

          <FinancialReportModal open={showReportModal} onOpenChange={setShowReportModal} />
        </div>
      </main>
    </div>
  )
}
