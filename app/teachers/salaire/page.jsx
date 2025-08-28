"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DollarSign, 
  Clock, 
  Calendar, 
  Download, 
  Search, 
  Calculator,
  FileText,
  Users,
  Eye,
  Edit,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal
} from "lucide-react"

// Types de contrats
const CONTRACT_TYPES = {
  HOURLY: "horaire",
  MONTHLY: "mensuel"
}

// Mock data pour les professeurs avec leurs contrats
const mockTeachers = [
  {
    id: 1,
    firstName: "Mamadou",
    lastName: "Keita",
    contractType: CONTRACT_TYPES.HOURLY,
    hourlyRate: 2500,
    monthlyBase: 0,
    hoursWorked: 120,
    overtimeHours: 8,
    subjects: ["Mathématiques", "Sciences"],
    classes: ["CM1", "CM2"],
    status: "Actif",
    bonuses: {
      seniority: 15000,
      responsibility: 10000,
      performance: 5000
    },
    deductions: {
      absences: 0,
      late: 2000
    }
  },
  {
    id: 2,
    firstName: "Fatoumata",
    lastName: "Traoré",
    contractType: CONTRACT_TYPES.MONTHLY,
    hourlyRate: 0,
    monthlyBase: 180000,
    hoursWorked: 0,
    overtimeHours: 0,
    subjects: ["Français", "Histoire-Géographie"],
    classes: ["6ème", "5ème"],
    status: "Actif",
    bonuses: {
      seniority: 20000,
      responsibility: 15000,
      performance: 8000
    },
    deductions: {
      absences: 5000,
      late: 0
    }
  },
  {
    id: 3,
    firstName: "Ibrahim",
    lastName: "Coulibaly",
    contractType: CONTRACT_TYPES.HOURLY,
    hourlyRate: 2200,
    monthlyBase: 0,
    hoursWorked: 110,
    overtimeHours: 5,
    subjects: ["Français", "Éducation Civique"],
    classes: ["CE1", "CE2"],
    status: "Actif",
    bonuses: {
      seniority: 12000,
      responsibility: 8000,
      performance: 4000
    },
    deductions: {
      absences: 0,
      late: 1500
    }
  },
  {
    id: 4,
    firstName: "Aïssata",
    lastName: "Diarra",
    contractType: CONTRACT_TYPES.MONTHLY,
    hourlyRate: 0,
    monthlyBase: 170000,
    hoursWorked: 0,
    overtimeHours: 0,
    subjects: ["Anglais", "Éducation Physique"],
    classes: ["4ème", "3ème"],
    status: "Actif",
    bonuses: {
      seniority: 18000,
      responsibility: 12000,
      performance: 6000
    },
    deductions: {
      absences: 3000,
      late: 1000
    }
  },
  {
    id: 5,
    firstName: "Seydou",
    lastName: "Sangaré",
    contractType: CONTRACT_TYPES.HOURLY,
    hourlyRate: 2800,
    monthlyBase: 0,
    hoursWorked: 130,
    overtimeHours: 12,
    subjects: ["Mathématiques", "Physique"],
    classes: ["3ème", "2nde"],
    status: "Actif",
    bonuses: {
      seniority: 25000,
      responsibility: 20000,
      performance: 10000
    },
    deductions: {
      absences: 0,
      late: 0
    }
  },
  {
    id: 6,
    firstName: "Kadiatou",
    lastName: "Koné",
    contractType: CONTRACT_TYPES.MONTHLY,
    hourlyRate: 0,
    monthlyBase: 160000,
    hoursWorked: 0,
    overtimeHours: 0,
    subjects: ["SVT", "Chimie"],
    classes: ["5ème", "4ème"],
    status: "Actif",
    bonuses: {
      seniority: 15000,
      responsibility: 10000,
      performance: 7000
    },
    deductions: {
      absences: 2000,
      late: 500
    }
  },
  {
    id: 7,
    firstName: "Bakary",
    lastName: "Diallo",
    contractType: CONTRACT_TYPES.HOURLY,
    hourlyRate: 2400,
    monthlyBase: 0,
    hoursWorked: 115,
    overtimeHours: 6,
    subjects: ["Histoire", "Géographie"],
    classes: ["6ème", "5ème"],
    status: "Actif",
    bonuses: {
      seniority: 10000,
      responsibility: 8000,
      performance: 4000
    },
    deductions: {
      absences: 0,
      late: 1200
    }
  },
  {
    id: 8,
    firstName: "Mariam",
    lastName: "Coulibaly",
    contractType: CONTRACT_TYPES.MONTHLY,
    hourlyRate: 0,
    monthlyBase: 175000,
    hoursWorked: 0,
    overtimeHours: 0,
    subjects: ["Français", "Littérature"],
    classes: ["2nde", "1ère"],
    status: "Actif",
    bonuses: {
      seniority: 22000,
      responsibility: 18000,
      performance: 9000
    },
    deductions: {
      absences: 4000,
      late: 800
    }
  }
]

// Fonction de calcul du salaire selon le type de contrat
const calculateSalary = (teacher) => {
  if (teacher.contractType === CONTRACT_TYPES.HOURLY) {
    const regularPay = teacher.hoursWorked * teacher.hourlyRate
    const overtimePay = teacher.overtimeHours * (teacher.hourlyRate * 1.5)
    const totalBonuses = Object.values(teacher.bonuses).reduce((sum, bonus) => sum + bonus, 0)
    const totalDeductions = Object.values(teacher.deductions).reduce((sum, deduction) => sum + deduction, 0)
    
    return {
      regularPay,
      overtimePay,
      totalBonuses,
      totalDeductions,
      total: regularPay + overtimePay + totalBonuses - totalDeductions,
      type: "horaire"
    }
  } else {
    const baseSalary = teacher.monthlyBase
    const totalBonuses = Object.values(teacher.bonuses).reduce((sum, bonus) => sum + bonus, 0)
    const totalDeductions = Object.values(teacher.deductions).reduce((sum, deduction) => sum + deduction, 0)
    
    return {
      baseSalary,
      totalBonuses,
      totalDeductions,
      total: baseSalary + totalBonuses - totalDeductions,
      type: "mensuel"
    }
  }
}

// Composant Modal pour les détails du salaire
function SalaryDetailsModal({ teacher, isOpen, onClose }) {
  const salary = calculateSalary(teacher)
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails du salaire - {teacher.firstName} {teacher.lastName}</DialogTitle>
          <DialogDescription>
            Calcul détaillé du salaire pour {teacher.contractType === CONTRACT_TYPES.HOURLY ? "le contrat horaire" : "le contrat mensuel"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informations du professeur */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <h4 className="font-medium mb-2">Informations personnelles</h4>
              <div className="text-sm space-y-1">
                <p><strong>Nom :</strong> {teacher.firstName} {teacher.lastName}</p>
                <p><strong>Matières :</strong> {teacher.subjects.join(", ")}</p>
                <p><strong>Classes :</strong> {teacher.classes.join(", ")}</p>
                <p><strong>Statut :</strong> {teacher.status}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Contrat</h4>
              <div className="text-sm space-y-1">
                <p><strong>Type :</strong> {teacher.contractType === CONTRACT_TYPES.HOURLY ? "Horaire" : "Mensuel"}</p>
                {teacher.contractType === CONTRACT_TYPES.HOURLY ? (
                  <>
                    <p><strong>Taux horaire :</strong> {teacher.hourlyRate.toLocaleString()} FCFA/h</p>
                    <p><strong>Heures travaillées :</strong> {teacher.hoursWorked}h</p>
                    <p><strong>Heures supplémentaires :</strong> {teacher.overtimeHours}h</p>
                  </>
                ) : (
                  <p><strong>Salaire de base :</strong> {teacher.monthlyBase.toLocaleString()} FCFA</p>
                )}
              </div>
            </div>
          </div>

          {/* Calcul du salaire */}
          <div className="space-y-4">
            <h4 className="font-medium">Calcul du salaire</h4>
            
            {teacher.contractType === CONTRACT_TYPES.HOURLY ? (
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                  <span>Salaire régulier</span>
                  <span className="font-medium">{salary.regularPay.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                  <span>Heures supplémentaires</span>
                  <span className="font-medium">{salary.overtimePay.toLocaleString()} FCFA</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                <span>Salaire de base</span>
                <span className="font-medium">{salary.baseSalary.toLocaleString()} FCFA</span>
              </div>
            )}

            {/* Primes */}
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Primes</h5>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Ancienneté</span>
                  <span>{teacher.bonuses.seniority.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Responsabilités</span>
                  <span>{teacher.bonuses.responsibility.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Performance</span>
                  <span>{teacher.bonuses.performance.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between p-2 bg-green-50 rounded-lg font-medium">
                  <span>Total primes</span>
                  <span>{salary.totalBonuses.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>

            {/* Déductions */}
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Déductions</h5>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Absences</span>
                  <span>{teacher.deductions.absences.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Retards</span>
                  <span>{teacher.deductions.late.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between p-2 bg-red-50 rounded-lg font-medium">
                  <span>Total déductions</span>
                  <span>{salary.totalDeductions.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between p-4 bg-primary/10 rounded-lg font-bold text-lg">
              <span>Salaire net</span>
              <span className="text-primary">{salary.total.toLocaleString()} FCFA</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Générer fiche de paie
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Composant de pagination
function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = []
  const maxVisiblePages = 5
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} sur {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {pages.map(page => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function SalairesPage() {
  const [teachers, setTeachers] = useState(mockTeachers)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("2024-12")
  const [selectedContractType, setSelectedContractType] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [itemsPerPage] = useState(5)

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesContractType = selectedContractType === "all" || teacher.contractType === selectedContractType
    return matchesSearch && matchesContractType
  })

  // Pagination
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex)

  const totalSalary = filteredTeachers.reduce((sum, teacher) => {
    const salary = calculateSalary(teacher)
    return sum + salary.total
  }, 0)

  const hourlyTeachers = filteredTeachers.filter(t => t.contractType === CONTRACT_TYPES.HOURLY).length
  const monthlyTeachers = filteredTeachers.filter(t => t.contractType === CONTRACT_TYPES.MONTHLY).length

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleShowDetails = (teacher) => {
    setSelectedTeacher(teacher)
    setShowDetailsModal(true)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader
            title="Gestion des Salaires"
            description="Calcul et gestion des salaires des professeurs selon leur type de contrat"
          >
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Exporter les fiches de paie
            </Button>
          </PageHeader>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total des salaires</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSalary.toLocaleString()} FCFA</div>
                <p className="text-xs text-muted-foreground">Ce mois</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contrats horaires</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hourlyTeachers}</div>
                <p className="text-xs text-muted-foreground">Professeurs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contrats mensuels</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthlyTeachers}</div>
                <p className="text-xs text-muted-foreground">Professeurs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total professeurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredTeachers.length}</div>
                <p className="text-xs text-muted-foreground">Actifs</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle>Filtres et recherche</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rechercher un professeur</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nom ou prénom..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mois/Année</label>
                  <Input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type de contrat</label>
                  <Select value={selectedContractType} onValueChange={setSelectedContractType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les contrats" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les contrats</SelectItem>
                      <SelectItem value={CONTRACT_TYPES.HOURLY}>Contrats horaires</SelectItem>
                      <SelectItem value={CONTRACT_TYPES.MONTHLY}>Contrats mensuels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Actions</label>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-1" />
                      Filtres avancés
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calculator className="h-4 w-4 mr-1" />
                      Calculer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des salaires */}
          <Card>
            <CardHeader>
              <CardTitle>Détail des salaires - {selectedMonth}</CardTitle>
              <CardDescription>
                Calcul automatique selon le type de contrat de chaque professeur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Professeur</th>
                      <th className="text-left p-2">Type de contrat</th>
                      <th className="text-left p-2">Taux/Salaire de base</th>
                      <th className="text-left p-2">Heures travaillées</th>
                      <th className="text-left p-2">Heures supplémentaires</th>
                      <th className="text-left p-2">Salaire régulier</th>
                      <th className="text-left p-2">Majorations</th>
                      <th className="text-left p-2">Total</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTeachers.map((teacher) => {
                      const salary = calculateSalary(teacher)
                      return (
                        <tr key={teacher.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {teacher.firstName[0]}{teacher.lastName[0]}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{teacher.firstName} {teacher.lastName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {teacher.subjects.join(", ")}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge variant={teacher.contractType === CONTRACT_TYPES.HOURLY ? "default" : "secondary"}>
                              {teacher.contractType === CONTRACT_TYPES.HOURLY ? "Horaire" : "Mensuel"}
                            </Badge>
                          </td>
                          <td className="p-2">
                            {teacher.contractType === CONTRACT_TYPES.HOURLY 
                              ? `${teacher.hourlyRate.toLocaleString()} FCFA/h`
                              : `${teacher.monthlyBase.toLocaleString()} FCFA`
                            }
                          </td>
                          <td className="p-2">
                            {teacher.contractType === CONTRACT_TYPES.HOURLY 
                              ? `${teacher.hoursWorked}h`
                              : "-"
                            }
                          </td>
                          <td className="p-2">
                            {teacher.contractType === CONTRACT_TYPES.HOURLY 
                              ? `${teacher.overtimeHours}h`
                              : "-"
                            }
                          </td>
                          <td className="p-2">
                            {teacher.contractType === CONTRACT_TYPES.HOURLY 
                              ? `${salary.regularPay.toLocaleString()} FCFA`
                              : `${salary.baseSalary.toLocaleString()} FCFA`
                            }
                          </td>
                          <td className="p-2">
                            {teacher.contractType === CONTRACT_TYPES.HOURLY 
                              ? `${salary.overtimePay.toLocaleString()} FCFA`
                              : "-"
                            }
                          </td>
                          <td className="p-2">
                            <div className="font-bold text-green-600">
                              {salary.total.toLocaleString()} FCFA
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex space-x-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleShowDetails(teacher)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <FileText className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal de détails */}
      {selectedTeacher && (
        <SalaryDetailsModal
          teacher={selectedTeacher}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  )
}
