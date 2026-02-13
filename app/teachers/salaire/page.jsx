"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSalaries } from "@/hooks/use-salaries"
import { useSalaryExport } from "@/hooks/use-salary-export"
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
  ChevronLeft,
  ChevronRight,
  } from "lucide-react"

// Fonction pour formater le mois
const formatMonth = (monthString) => {
  if (!monthString) return ''
  const [year, month] = monthString.split('-')
  const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
  return `${monthNames[parseInt(month) - 1]} ${year}`
}

// Composant Modal pour les détails du salaire
function SalaryDetailsModal({ salary, isOpen, onClose, calculateSalary }) {
  const calculatedSalary = salary.calculated || calculateSalary(salary)
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails du salaire - {salary.first_name} {salary.last_name}</DialogTitle>
          <DialogDescription>
            Calcul détaillé du salaire pour {salary.type === 'titulaire' ? (salary.contrat === 'horaire' ? 'le contrat horaire' : 'le contrat mensuel') : 'le remplaçant'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informations du professeur */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <h4 className="font-medium mb-2">Informations personnelles</h4>
              <div className="text-sm space-y-1">
                <p><strong>Nom :</strong> {salary.first_name} {salary.last_name}</p>
                {salary.type === 'titulaire' && (
                  <p><strong>Matières :</strong> {(salary.speciality_names || (salary.speciality || []).join(", "))}</p>
                )}
                {salary.type === 'remplaçant' && (
                  <p><strong>Matières :</strong> {(salary.subject_names || []).join(", ")}</p>
                )}
                <p><strong>Statut :</strong> 
                  <Badge variant={salary.type === 'titulaire' ? 'default' : 'secondary'} className="ml-2">
                    {salary.type === 'titulaire' ? 'Titulaire' : 'Remplaçant'}
                  </Badge>
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Contrat</h4>
              <div className="text-sm space-y-1">
                <p><strong>Type :</strong> {salary.type === 'titulaire' ? (salary.contrat === 'horaire' ? 'Horaire' : 'Mensuel') : 'Horaire'}</p>
                {salary.type === 'titulaire' && salary.contrat === 'horaire' && (
                  <>
                    <p><strong>Taux horaire :</strong> {salary.salary.toLocaleString()} FCFA/h</p>
                    <p><strong>Heures travaillées :</strong> {salary.hours_worked || 0}h</p>
                    <p><strong>Majoration :</strong> {salary.majoration || 0} FCFA</p>
                  </>
                )}
                {salary.type === 'titulaire' && salary.contrat === 'mensuel' && (
                  <>
                    <p><strong>Salaire de base :</strong> {salary.salary.toLocaleString()} FCFA</p>
                    <p><strong>Majoration (prime) :</strong> {salary.majoration?.toLocaleString() || 0} FCFA</p>
                  </>
                )}
                {salary.type === 'remplaçant' && (
                  <>
                    <p><strong>Taux horaire :</strong> {salary.hourly_rate.toLocaleString()} FCFA/h</p>
                    <p><strong>Heures travaillées :</strong> {salary.hours_worked || 0}h</p>
                    <p><strong>Majoration :</strong> {salary.majoration || 0} FCFA</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Calcul du salaire */}
          <div className="space-y-4">
            <h4 className="font-medium">Calcul du salaire</h4>
            
            {salary.type === 'titulaire' && salary.contrat === 'mensuel' ? (
              <>
                <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                  <span>Salaire de base</span>
                  <span className="font-medium">{calculatedSalary.baseSalary.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between p-3 bg-yellow-50 rounded-lg">
                  <span>Majoration (prime)</span>
                  <span className="font-medium">{calculatedSalary.majoration.toLocaleString()} FCFA</span>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                  <span>Salaire régulier</span>
                  <span className="font-medium">{calculatedSalary.regularPay.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between p-3 bg-yellow-50 rounded-lg">
                  <span>Majoration (prime)</span>
                  <span className="font-medium">{calculatedSalary.majoration.toLocaleString()} FCFA</span>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between p-4 bg-primary/10 rounded-lg font-bold text-lg">
              <span>Salaire net</span>
              <span className="text-primary">{calculatedSalary.total.toLocaleString()} FCFA</span>
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
  const { salaries, fetchSalaries, calculateSalary, updateSalaryData, isLoading, error } = useSalaries()
  const { checkMonthChange, exportAndReset, performAutoExport, isExportDay } = useSalaryExport()
  const [searchTerm, setSearchTerm] = useState("")
  const currentDate = new Date()
  const currentMonth = currentDate.toISOString().slice(0, 7)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSalary, setSelectedSalary] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  const [itemsPerPage] = useState(5)

  useEffect(() => {
    fetchSalaries(selectedMonth, selectedStatus)
  }, [fetchSalaries, selectedMonth, selectedStatus])

  // Vérification automatique pour l'export le 28 du mois
  useEffect(() => {
    const checkAutoExport = async () => {
      if (isExportDay()) {
        await performAutoExport(generatePDFContent)
      }
    }
    
    checkAutoExport()
    
    // Vérifier toutes les heures
    const interval = setInterval(checkAutoExport, 3600000) // Toutes les heures
    
    return () => clearInterval(interval)
  }, [isExportDay, performAutoExport])

  const filteredSalaries = salaries.filter(salary => {
    const matchesSearch = `${salary.first_name} ${salary.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || salary.type === selectedStatus
    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredSalaries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedSalaries = filteredSalaries.slice(startIndex, endIndex)

  const totalSalary = filteredSalaries.reduce((sum, salary) => {
    const calculatedSalary = calculateSalary(salary)
    return sum + calculatedSalary.total
  }, 0)

  const titulaireCount = filteredSalaries.filter(s => s.type === 'titulaire').length
  const remplacantCount = filteredSalaries.filter(s => s.type === 'remplaçant').length

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleShowDetails = (salary) => {
    const calculatedSalary = calculateSalary(salary)
    setSelectedSalary({ ...salary, calculated: calculatedSalary })
    setShowDetailsModal(true)
  }

  const handleEdit = (salary) => {
    setSelectedSalary(salary)
    if (salary.type === 'titulaire' && salary.contrat === 'mensuel') {
      // Pour les titulaires avec contrat mensuel - seulement la majoration (prime)
      setEditFormData({
        majoration: salary.majoration || 0
      })
    } else {
      // Pour les contrats horaires (titulaires et remplaçants) - heures travaillées et majoration (prime)
      setEditFormData({
        hours_worked: salary.hours_worked || 0,
        majoration: salary.majoration || 0
      })
    }
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    try {
      await updateSalaryData(selectedSalary.id, editFormData, selectedSalary.type)
      setShowEditModal(false)
      setSelectedSalary(null)
      setEditFormData({})
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
    }
  }

  const handleExportPDF = async () => {
    try {
      // Créer le contenu HTML pour le PDF (sans les filtres et boutons)
      const htmlContent = generatePDFContent()
      await exportAndReset(htmlContent, selectedMonth)
      alert('Export PDF réussi et enregistré dans la base de données!')
      
      // Rafraîchir les données après l'export
      fetchSalaries(selectedMonth, selectedStatus)
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
      alert(`Erreur lors de l'export PDF: ${error.message}`)
    }
  }

  const generatePDFContent = () => {
    const monthName = formatMonth(selectedMonth)
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; color: #333; margin-bottom: 30px;">
          Détails des salaires du mois de ${monthName}
        </h1>
        
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Total des salaires</h3>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #28a745;">${totalSalary.toLocaleString()} FCFA</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${monthName}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Titulaires</h3>
            <p style="margin: 0; font-size: 24px; font-weight: bold;">${titulaireCount}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Professeurs</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Remplaçants</h3>
            <p style="margin: 0; font-size: 24px; font-weight: bold;">${remplacantCount}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">En activité</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Total effectif</h3>
            <p style="margin: 0; font-size: 24px; font-weight: bold;">${filteredSalaries.length}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Personnes</p>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Professeur</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Type de contrat</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Taux/Salaire de base</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Heures travaillées</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Majoration</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Statut</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Total</th>
            </tr>
          </thead>
          <tbody>
    `
    
    filteredSalaries.forEach((salary) => {
      const calculatedSalary = calculateSalary(salary)
      html += `
        <tr style="border-bottom: 1px solid #dee2e6;">
          <td style="padding: 12px; border: 1px solid #dee2e6;">
            <div style="font-weight: bold;">${salary.first_name} ${salary.last_name}</div>
            <div style="font-size: 12px; color: #666;">
              ${salary.type === 'titulaire' ? (salary.speciality_names || (salary.speciality || []).join(", ")) : (salary.subject_names || []).join(", ")}
            </div>
          </td>
          <td style="padding: 12px; border: 1px solid #dee2e6;">
            ${salary.type === 'titulaire' ? (salary.contrat === 'horaire' ? 'Horaire' : 'Mensuel') : 'Horaire'}
          </td>
          <td style="padding: 12px; border: 1px solid #dee2e6;">
            ${salary.type === 'titulaire' 
              ? (salary.contrat === 'horaire' 
                ? `${salary.salary.toLocaleString()} FCFA/h`
                : `${salary.salary.toLocaleString()} FCFA`)
              : `${salary.hourly_rate.toLocaleString()} FCFA/h`
            }
          </td>
          <td style="padding: 12px; border: 1px solid #dee2e6;">
            ${(salary.type === 'titulaire' && salary.contrat === 'horaire') || salary.type === 'remplaçant'
              ? `${salary.hours_worked || 0}h`
              : "-"
            }
          </td>
          <td style="padding: 12px; border: 1px solid #dee2e6;">
            ${salary.type === 'titulaire' && salary.contrat === 'mensuel'
              ? `${salary.majoration?.toLocaleString() || 0} FCFA`
              : (salary.type === 'titulaire' && salary.contrat === 'horaire') || salary.type === 'remplaçant'
                ? `${salary.majoration || 0} FCFA`
                : "-"
            }
          </td>
          <td style="padding: 12px; border: 1px solid #dee2e6;">
            ${salary.type === 'titulaire' ? 'Titulaire' : 'Remplaçant'}
          </td>
          <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold; color: #28a745;">
            ${calculatedSalary.total.toLocaleString()} FCFA
          </td>
        </tr>
      `
    })
    
    html += `
          </tbody>
        </table>
        
        <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Résumé</h3>
          <p style="margin: 0; font-size: 14px; color: #666;">
            Document généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} 
            à ${new Date().toLocaleTimeString('fr-FR')}
          </p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
            Période concernée: ${monthName}
          </p>
        </div>
      </div>
    `
    
    return html
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
            <Button onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Exporter la fiche des salaires du mois
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
                <p className="text-xs text-muted-foreground">{formatMonth(selectedMonth)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Titulaires</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{titulaireCount}</div>
                <p className="text-xs text-muted-foreground">Professeurs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remplaçants</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{remplacantCount}</div>
                <p className="text-xs text-muted-foreground">En activité</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total effectif</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredSalaries.length}</div>
                <p className="text-xs text-muted-foreground">Personnes</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle>Filtres et recherche</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rechercher</label>
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
                  <label className="text-sm font-medium">Statut</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="titulaire">Titulaires</SelectItem>
                      <SelectItem value="remplaçant">Remplaçants</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des salaires */}
          <Card>
            <CardHeader>
              <CardTitle>Détails des salaires du mois de {formatMonth(selectedMonth)}</CardTitle>
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
                      <th className="text-left p-2">Majoration</th>
                      <th className="text-left p-2">Statut</th>
                      <th className="text-left p-2">Total</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSalaries.map((salary) => {
                      const calculatedSalary = calculateSalary(salary)
                      return (
                        <tr key={salary.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                {salary.photo ? (
                                  <img 
                                    src={salary.photo} 
                                    alt={`${salary.first_name} ${salary.last_name}`} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <img 
                                    src={salary.gender === "Masculin" ? "/homme.png" : "/femme.png"} 
                                    alt={`${salary.first_name} ${salary.last_name}`} 
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{salary.first_name} {salary.last_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {salary.type === 'titulaire' ? (salary.speciality_names || (salary.speciality || []).join(", ")) : (salary.subject_names || []).join(", ")}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge variant={salary.type === 'titulaire' && salary.contrat === 'mensuel' ? 'secondary' : 'default'}>
                              {salary.type === 'titulaire' ? (salary.contrat === 'horaire' ? 'Horaire' : 'Mensuel') : 'Horaire'}
                            </Badge>
                          </td>
                          <td className="p-2">
                            {salary.type === 'titulaire' 
                              ? (salary.contrat === 'horaire' 
                                ? `${salary.salary.toLocaleString()} FCFA/h`
                                : `${salary.salary.toLocaleString()} FCFA`)
                              : `${salary.hourly_rate.toLocaleString()} FCFA/h`
                            }
                          </td>
                          <td className="p-2">
                            {(salary.type === 'titulaire' && salary.contrat === 'horaire') || salary.type === 'remplaçant'
                              ? `${salary.hours_worked || 0}h`
                              : "-"
                            }
                          </td>
                          <td className="p-2">
                            {salary.type === 'titulaire' && salary.contrat === 'mensuel'
                              ? `${salary.majoration?.toLocaleString() || 0} FCFA`
                              : (salary.type === 'titulaire' && salary.contrat === 'horaire') || salary.type === 'remplaçant'
                                ? `${salary.majoration || 0} FCFA`
                                : "-"
                            }
                          </td>
                          <td className="p-2">
                            <Badge variant={salary.type === 'titulaire' ? 'default' : 'secondary'}>
                              {salary.type === 'titulaire' ? 'Titulaire' : 'Remplaçant'}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="font-bold text-green-600">
                              {calculatedSalary.total.toLocaleString()} FCFA
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex space-x-1">
                              <Button 
                                size="sm"
                                title="Voir les détails"
                                variant="outline"
                                onClick={() => handleShowDetails(salary)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                title="Modifier"
                                variant="outline"
                                onClick={() => handleEdit(salary)}
                              >
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
      {selectedSalary && (
        <SalaryDetailsModal
          salary={selectedSalary}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          calculateSalary={calculateSalary}
        />
      )}

      {/* Modal de modification */}
      {selectedSalary && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Modifier {selectedSalary.first_name} {selectedSalary.last_name}
              </DialogTitle>
              <DialogDescription>
                {selectedSalary.type === 'titulaire' && selectedSalary.contrat === 'mensuel'
                  ? 'Modifier la majoration (prime) pour ce professeur titulaire'
                  : 'Modifier les heures travaillées et la majoration (prime) pour ce contrat horaire'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {(selectedSalary.type === 'titulaire' && selectedSalary.contrat === 'mensuel') ? (
                // Pour les titulaires avec contrat mensuel - seulement la majoration (prime)
                <div>
                  <label className="text-sm font-medium">Majoration (FCFA)</label>
                  <Input
                    type="number"
                    min="0"
                    value={editFormData.majoration || ''}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      majoration: parseInt(e.target.value) || 0
                    })}
                    placeholder="Montant de la majoration en FCFA"
                  />
                </div>
              ) : (
                // Pour les contrats horaires (titulaires et remplaçants) - heures travaillées et majoration (prime)
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Heures travaillées</label>
                    <Input
                      type="number"
                      min="0"
                      value={editFormData.hours_worked || ''}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        hours_worked: parseInt(e.target.value) || 0
                      })}
                      placeholder="Nombre d'heures travaillées"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Majoration (FCFA)</label>
                    <Input
                      type="number"
                      min="0"
                      value={editFormData.majoration || ''}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        majoration: parseInt(e.target.value) || 0
                      })}
                      placeholder="Montant de la majoration en FCFA"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveEdit}>
                Sauvegarder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}