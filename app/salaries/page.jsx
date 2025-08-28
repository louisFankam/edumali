"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { SchoolYearSelector } from "@/components/school-year-selector"
import { SalariesTable } from "@/components/salaries/salaries-table"
import { SalaryStats } from "@/components/salaries/salary-stats"
import { PayrollModal } from "@/components/salaries/payroll-modal"
import { PaymentHistoryModal } from "@/components/salaries/payment-history-modal"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

// Mock data for teacher salaries
const mockTeacherSalaries = [
  {
    id: 1,
    teacherId: 1,
    firstName: "Mamadou",
    lastName: "Keita",
    school: "École Primaire de Bamako",
    baseSalary: 150000,
    allowances: 25000,
    deductions: 15000,
    netSalary: 160000,
    paymentStatus: "paid", // paid, pending, processing
    paymentDate: "2024-12-01",
    month: "2024-12",
    photo: "/placeholder.svg?key=teacher1",
  },
  {
    id: 2,
    teacherId: 2,
    firstName: "Fatoumata",
    lastName: "Traoré",
    school: "Collège de Sikasso",
    baseSalary: 180000,
    allowances: 30000,
    deductions: 18000,
    netSalary: 192000,
    paymentStatus: "pending",
    paymentDate: null,
    month: "2024-12",
    photo: "/placeholder.svg?key=teacher2",
  },
  {
    id: 3,
    teacherId: 3,
    firstName: "Ibrahim",
    lastName: "Coulibaly",
    school: "École Primaire de Mopti",
    baseSalary: 165000,
    allowances: 20000,
    deductions: 12000,
    netSalary: 173000,
    paymentStatus: "processing",
    paymentDate: null,
    month: "2024-12",
    photo: "/placeholder.svg?key=teacher3",
  },
  {
    id: 4,
    teacherId: 4,
    firstName: "Aïssata",
    lastName: "Diarra",
    school: "Collège de Gao",
    baseSalary: 170000,
    allowances: 28000,
    deductions: 16000,
    netSalary: 182000,
    paymentStatus: "paid",
    paymentDate: "2024-12-01",
    month: "2024-12",
    photo: "/placeholder.svg?key=teacher4",
  },
  {
    id: 5,
    teacherId: 5,
    firstName: "Seydou",
    lastName: "Sangaré",
    school: "École Primaire de Kayes",
    baseSalary: 200000,
    allowances: 35000,
    deductions: 20000,
    netSalary: 215000,
    paymentStatus: "paid",
    paymentDate: "2024-12-01",
    month: "2024-12",
    photo: "/placeholder.svg?key=teacher5",
  },
]

// Mock payment history
const mockPaymentHistory = [
  {
    id: 1,
    teacherId: 1,
    teacherName: "Mamadou Keita",
    month: "2024-11",
    netSalary: 158000,
    paymentDate: "2024-11-30",
    paymentMethod: "Virement bancaire",
    status: "completed",
  },
  {
    id: 2,
    teacherId: 2,
    teacherName: "Fatoumata Traoré",
    month: "2024-11",
    netSalary: 190000,
    paymentDate: "2024-11-30",
    paymentMethod: "Espèces",
    status: "completed",
  },
]

export default function SalariesPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [selectedSchool, setSelectedSchool] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [salaries, setSalaries] = useState(mockTeacherSalaries)
  const [paymentHistory] = useState(mockPaymentHistory)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  // Filter salaries based on selections
  const filteredSalaries = salaries.filter((salary) => {
    const matchesSchool = selectedSchool === "all" || salary.school === selectedSchool
    const matchesStatus = selectedStatus === "all" || salary.paymentStatus === selectedStatus
    const matchesMonth = salary.month === format(selectedMonth, "yyyy-MM")
    return matchesSchool && matchesStatus && matchesMonth
  })

  const handlePaySalary = (salaryId) => {
    setSalaries((prev) =>
      prev.map((salary) =>
        salary.id === salaryId
          ? {
              ...salary,
              paymentStatus: "paid",
              paymentDate: new Date().toISOString().split("T")[0],
            }
          : salary,
      ),
    )
  }

  const handleProcessPayroll = () => {
    setSalaries((prev) =>
      prev.map((salary) =>
        salary.paymentStatus === "pending"
          ? {
              ...salary,
              paymentStatus: "processing",
            }
          : salary,
      ),
    )
    alert("Traitement de la paie lancé pour tous les salaires en attente!")
  }

  const handleViewPayroll = (teacher) => {
    setSelectedTeacher(teacher)
    setIsPayrollModalOpen(true)
  }

  const handleViewHistory = (teacher) => {
    setSelectedTeacher(teacher)
    setIsHistoryModalOpen(true)
  }

  // Calculate statistics
  const stats = {
    totalSalaries: filteredSalaries.length,
    totalAmount: filteredSalaries.reduce((sum, salary) => sum + salary.netSalary, 0),
    paidCount: filteredSalaries.filter((s) => s.paymentStatus === "paid").length,
    pendingCount: filteredSalaries.filter((s) => s.paymentStatus === "pending").length,
    processingCount: filteredSalaries.filter((s) => s.paymentStatus === "processing").length,
    paidAmount: filteredSalaries
      .filter((s) => s.paymentStatus === "paid")
      .reduce((sum, salary) => sum + salary.netSalary, 0),
    pendingAmount: filteredSalaries
      .filter((s) => s.paymentStatus === "pending")
      .reduce((sum, salary) => sum + salary.netSalary, 0),
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader title="Gestion des Salaires" description="Gérer les salaires et paiements du personnel">
            <div className="flex items-center space-x-2">
              <SchoolYearSelector />
              <Button onClick={handleProcessPayroll} variant="secondary">
                <DollarSign className="h-4 w-4 mr-2" />
                Traiter la paie
              </Button>
            </div>
          </PageHeader>

          <Tabs defaultValue="current" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="current">Salaires actuels</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-6">
              {/* Month and Filters Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Filtres et période</CardTitle>
                  <CardDescription>Sélectionnez le mois et les filtres pour afficher les salaires</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mois</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn("w-full md:w-48 justify-start text-left font-normal bg-transparent")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(selectedMonth, "MMMM yyyy", { locale: fr })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedMonth}
                            onSelect={setSelectedMonth}
                            initialFocus
                            locale={fr}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">École</label>
                      <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                        <SelectTrigger className="w-full md:w-64">
                          <SelectValue placeholder="Sélectionner l'école" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les écoles</SelectItem>
                          <SelectItem value="École Primaire de Bamako">École Primaire de Bamako</SelectItem>
                          <SelectItem value="Collège de Sikasso">Collège de Sikasso</SelectItem>
                          <SelectItem value="École Primaire de Mopti">École Primaire de Mopti</SelectItem>
                          <SelectItem value="Collège de Gao">Collège de Gao</SelectItem>
                          <SelectItem value="École Primaire de Kayes">École Primaire de Kayes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Statut</label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-full md:w-48">
                          <SelectValue placeholder="Statut de paiement" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les statuts</SelectItem>
                          <SelectItem value="paid">Payé</SelectItem>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="processing">En traitement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button variant="outline" className="bg-transparent">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Salary Statistics */}
              <SalaryStats stats={stats} />

              {/* Salaries Table */}
              <SalariesTable
                salaries={filteredSalaries}
                onPaySalary={handlePaySalary}
                onViewPayroll={handleViewPayroll}
                onViewHistory={handleViewHistory}
                selectedMonth={selectedMonth}
              />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des paiements</CardTitle>
                  <CardDescription>Consultez l'historique complet des paiements de salaires</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4">Professeur</th>
                          <th className="text-left p-4">Mois</th>
                          <th className="text-left p-4">Montant</th>
                          <th className="text-left p-4">Date de paiement</th>
                          <th className="text-left p-4">Méthode</th>
                          <th className="text-left p-4">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.map((payment) => (
                          <tr key={payment.id} className="border-b">
                            <td className="p-4 font-medium">{payment.teacherName}</td>
                            <td className="p-4">{format(new Date(payment.month), "MMMM yyyy", { locale: fr })}</td>
                            <td className="p-4 font-medium">{payment.netSalary.toLocaleString()} F</td>
                            <td className="p-4">
                              {format(new Date(payment.paymentDate), "dd MMM yyyy", { locale: fr })}
                            </td>
                            <td className="p-4">{payment.paymentMethod}</td>
                            <td className="p-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent text-accent-foreground">
                                Terminé
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rapports de paie</CardTitle>
                  <CardDescription>Générer des rapports détaillés sur les salaires et paiements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Rapport mensuel</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Récapitulatif des salaires pour le mois sélectionné
                        </p>
                        <Button size="sm" className="w-full">
                          Générer rapport
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Masse salariale</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Évolution de la masse salariale par période
                        </p>
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          Générer rapport
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Fiches de paie</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">Générer les fiches de paie individuelles</p>
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          Générer fiches
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Modals */}
          <PayrollModal
            isOpen={isPayrollModalOpen}
            onClose={() => setIsPayrollModalOpen(false)}
            teacher={selectedTeacher}
          />

          <PaymentHistoryModal
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
            teacher={selectedTeacher}
            history={paymentHistory}
          />
        </div>
      </main>
    </div>
  )
}
