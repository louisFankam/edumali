"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, UserCheck, ChevronLeft, ChevronRight, Loader2, XCircle } from "lucide-react"
import { getApiUrl, getAuthToken } from '@/lib/pocketbase'
import { cn } from "@/lib/utils"
import { useStudents } from "@/hooks/use-students"
import { useClasses } from "@/hooks/use-classes"
import { useToast } from "@/hooks/use-toast"
import { StudentDetailsModal } from "@/components/students/student-details-modal"
import { ReinscriptionConfirmationModal } from "@/components/students/reinscription-confirmation-modal"

// Types pour la réinscription
interface PreviousStudent {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  class: string
  classId: string
  parentName: string
  parentPhone: string
  address: string
  nationality: string
  previousAcademicYearId: string
  previousAcademicYearName: string
  previousStatus: string
  photo?: string
}

interface ReinscriptionFilters {
  searchQuery: string
  selectedClass: string
  selectedStatus: string
  selectedGender: string
  previousAcademicYearFilter: string
}

export default function ReinscriptionPage() {
  const { fetchStudents, createStudent } = useStudents()
  const { classes: allClasses, isLoading: classesLoading, fetchClasses } = useClasses()
  const { toast } = useToast()
  
  // États pour les filtres
  const [filters, setFilters] = useState<ReinscriptionFilters>({
    searchQuery: "",
    selectedClass: "all",
    selectedStatus: "all",
    selectedGender: "all",
    previousAcademicYearFilter: "all"
  })
  
  const [previousStudents, setPreviousStudents] = useState<PreviousStudent[]>([])
  const [filteredStudents, setFilteredStudents] = useState<PreviousStudent[]>([])
  const [selectedStudent, setSelectedStudent] = useState<PreviousStudent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [studentToReinscribe, setStudentToReinscribe] = useState<PreviousStudent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isReinscribing, setIsReinscribing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  
  const ITEMS_PER_PAGE = 10
  
  // Récupérer les années académiques précédentes
  const [academicYears, setAcademicYears] = useState<{id: string, year: string}[]>([])
  
  const fetchAcademicYears = async () => {
    try {
      const authData = localStorage.getItem('pocketbase_auth')
      if (!authData) return []
      
      const { token } = JSON.parse(authData)
      
      const response = await fetch(
        getApiUrl(`collections/edumali_academic_years/records?perPage=50`),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (!response.ok) return []
      
      const result = await response.json()
      const years = result.items.map((item: any) => ({
        id: item.id,
        year: item.year
      }))
      
      setAcademicYears(years)
      return years
    } catch (error) {
      console.error('Erreur lors de la récupération des années académiques:', error)
      return []
    }
  }
  
  const previousAcademicYears = academicYears
    .filter(year => year.year !== `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`)
    .map(year => year.year)
  
  // Récupérer les élèves des années précédentes pour réinscription
  const fetchPreviousStudents = async () => {
    setIsLoading(true)
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')
      
      // Récupérer tous les élèves des années précédentes
      const response = await fetch(
        getApiUrl(`collections/edumali_students/records?expand=class_id&perPage=1000`),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des élèves')
      
      const result = await response.json()
      const currentAcademicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
      
      // Récupérer les années académiques pour avoir les noms
      const years = await fetchAcademicYears()
      const yearMap = new Map(years.map((y: any) => [y.id, y.year]))

      // Filtrer pour ne garder que les élèves des années précédentes
      const transformedStudents: PreviousStudent[] = result.items
        .filter((item: any) => item.academic_year !== currentAcademicYear)
        .map((item: any) => ({
          id: item.id,
          firstName: item.first_name,
          lastName: item.last_name,
          dateOfBirth: item.date_of_birth,
          gender: item.gender,
          class: item.expand?.class_id?.name || 'Inconnu',
          classId: item.class_id,
          parentName: item.parent_name,
          parentPhone: item.parent_phone,
          address: item.address,
          nationality: item.nationality || '',
          previousAcademicYearId: item.academic_year,
          previousAcademicYearName: yearMap.get(item.academic_year) || item.academic_year,
          previousStatus: item.status,
          photo: item.photo
        }))
      
      setPreviousStudents(transformedStudents)
      setFilteredStudents(transformedStudents)
      
    } catch (error) {
      console.error('Erreur lors de la récupération des élèves:', error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les élèves pour la réinscription",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    fetchStudents()
    fetchClasses()
    fetchAcademicYears()
    fetchPreviousStudents()
  }, [fetchStudents, fetchClasses])
  
  // Appliquer les filtres
  useEffect(() => {
    let filtered = previousStudents
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(student => 
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query) ||
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(query)
      )
    }
    
    if (filters.selectedClass && filters.selectedClass !== "all") {
      filtered = filtered.filter(student => student.class === filters.selectedClass)
    }
    
    if (filters.selectedStatus && filters.selectedStatus !== "all") {
      filtered = filtered.filter(student => student.previousStatus === filters.selectedStatus)
    }
    
    if (filters.selectedGender && filters.selectedGender !== "all") {
      filtered = filtered.filter(student => student.gender === filters.selectedGender)
    }
    
    if (filters.previousAcademicYearFilter && filters.previousAcademicYearFilter !== "all") {
      filtered = filtered.filter(student => student.previousAcademicYearName === filters.previousAcademicYearFilter)
    }
    
    setFilteredStudents(filtered)
    setCurrentPage(1)
  }, [filters, previousStudents])
  
  // Gestion de la réinscription
  const handleReinscribe = async (student: PreviousStudent, selectedClassId: string) => {
    setIsReinscribing(true)
    try {
      // Récupérer le nom de la classe sélectionnée
      const selectedClass = allClasses.find(c => c.id === selectedClassId)
      
      await createStudent({
        firstName: student.firstName,
        lastName: student.lastName,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        class: selectedClass?.name || student.class,
        classId: selectedClassId,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        address: student.address,
        nationality: student.nationality,
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: "Actif"
      })
      
      toast({
        title: "Succès",
        description: `${student.firstName} ${student.lastName} a été réinscrit avec succès dans ${selectedClass?.name || 'la classe sélectionnée'}!`
      })
      
      // Retirer l'élève de la liste des précédents étudiants
      setPreviousStudents(prev => prev.filter(s => s.id !== student.id))
      setIsConfirmModalOpen(false)
      setStudentToReinscribe(null)
      
    } catch (error) {
      console.error('Erreur lors de la réinscription:', error)
      toast({
        title: "Erreur",
        description: "La réinscription a échoué",
        variant: "destructive"
      })
    } finally {
      setIsReinscribing(false)
    }
  }
  
  const handleReinscribeClick = (student: PreviousStudent) => {
    setStudentToReinscribe(student)
    setIsConfirmModalOpen(true)
  }
  
  const handleViewDetails = (student: PreviousStudent) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }
  
  const handleFilterChange = (field: keyof ReinscriptionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }
  
  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      selectedClass: "all",
      selectedStatus: "all",
      selectedGender: "all",
      previousAcademicYearFilter: "all"
    })
  }
  
  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentStudents = filteredStudents.slice(startIndex, endIndex)
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }
  
  const getAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader
            title="Réinscription des élèves"
            description="Recherchez et réinscrivez les élèves des années précédentes pour l'année académique en cours."
            className=""
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Année en cours: {new Date().getFullYear()}-{new Date().getFullYear() + 1}
                </Badge>
                <Badge variant="secondary">
                  {filteredStudents.length} élève(s) trouvé(s)
                </Badge>
              </div>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="bg-transparent"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Effacer les filtres
              </Button>
            </div>
          </PageHeader>

          {/* Section des filtres */}
          <Card>
            <CardHeader>
              <CardTitle>Filtres de recherche</CardTitle>
              <CardDescription>Utilisez les filtres ci-dessous pour affiner votre recherche</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Recherche par nom */}
                <div className="space-y-2">
                  <Label htmlFor="searchQuery">Recherche par nom</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="searchQuery"
                      placeholder="Nom ou prénom"
                      value={filters.searchQuery}
                      onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filtre par classe */}
                <div className="space-y-2">
                  <Label>Classe précédente</Label>
                  <Select 
                    value={filters.selectedClass} 
                    onValueChange={(value) => handleFilterChange("selectedClass", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les classes</SelectItem>
                      {Array.from(new Set(previousStudents.map(s => s.class))).map((className) => (
                        <SelectItem key={className} value={className}>
                          {className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtre par statut */}
                <div className="space-y-2">
                  <Label>Statut précédent</Label>
                  <Select 
                    value={filters.selectedStatus} 
                    onValueChange={(value) => handleFilterChange("selectedStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                      <SelectItem value="transferred">Transféré</SelectItem>
                      <SelectItem value="graduated">Diplômé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtre par genre */}
                <div className="space-y-2">
                  <Label>Genre</Label>
                  <Select 
                    value={filters.selectedGender} 
                    onValueChange={(value) => handleFilterChange("selectedGender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les genres" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les genres</SelectItem>
                      <SelectItem value="Masculin">Masculin</SelectItem>
                      <SelectItem value="Féminin">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtre par année académique */}
                <div className="space-y-2">
                  <Label>Année académique</Label>
                  <Select 
                    value={filters.previousAcademicYearFilter} 
                    onValueChange={(value) => handleFilterChange("previousAcademicYearFilter", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les années" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les années</SelectItem>
                      {previousAcademicYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des résultats */}
          <Card>
            <CardHeader>
              <CardTitle>Élèves disponibles pour réinscription ({filteredStudents.length})</CardTitle>
              <CardDescription>
                Liste des élèves des années précédentes qui peuvent être réinscrits pour l'année {new Date().getFullYear()}-{new Date().getFullYear() + 1}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading || classesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun élève trouvé</h3>
                  <p className="text-muted-foreground mb-4">
                    Aucun élève ne correspond aux critères de recherche spécifiés.
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Effacer les filtres
                  </Button>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Élève</TableHead>
                          <TableHead>Âge</TableHead>
                          <TableHead>Classe précédente</TableHead>
                          <TableHead>Année précédente</TableHead>
                          <TableHead>Statut précédent</TableHead>
                          <TableHead>Nationalité</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentStudents.map((student) => (
                          <TableRow key={`${student.id}-${student.previousAcademicYearName}`}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={student.photo || (student.gender === "Masculin" ? "/homme.png" : "/femme.png")}
                                    alt={`${student.firstName} ${student.lastName}`}
                                  />
                                  <AvatarFallback>{getInitials(student.firstName, student.lastName)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {student.firstName} {student.lastName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">{student.gender}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getAge(student.dateOfBirth)} ans</TableCell>
                            <TableCell>
                              <Badge variant="outline">{student.class}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{student.previousAcademicYearName}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                student.previousStatus === "active" ? "default" :
                                student.previousStatus === "graduated" ? "default" :
                                student.previousStatus === "transferred" ? "secondary" : "secondary"
                              }>
                                {student.previousStatus === "active" ? "Actif" :
                                 student.previousStatus === "graduated" ? "Diplômé" :
                                 student.previousStatus === "transferred" ? "Transféré" : "Inactif"}
                              </Badge>
                            </TableCell>
                            <TableCell>{student.nationality || '-'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  title="Voir les détails"
                                  onClick={() => handleViewDetails(student)} 
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  title="Réinscrire l'élève"
                                  onClick={() => handleReinscribeClick(student)}
                                  disabled={isReinscribing}
                                  className="h-8 px-3"
                                >
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Réinscrire
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between space-x-2 py-4">
                      <div className="text-sm text-muted-foreground">
                        Affichage de {startIndex + 1} à {Math.min(endIndex, filteredStudents.length)} sur {filteredStudents.length} élèves
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="bg-transparent"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Précédent
                        </Button>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className={currentPage === page ? "" : "bg-transparent"}
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="bg-transparent"
                        >
                          Suivant
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal des détails */}
      {selectedStudent && (
        <StudentDetailsModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false)
            setSelectedStudent(null)
          }} 
          student={{
            ...selectedStudent,
            enrollmentDate: new Date().toISOString().split('T')[0],
            status: "Actif"
          }}
          onReinscribe={() => handleReinscribeClick(selectedStudent)}
          isReinscribing={isReinscribing}
        />
      )}
      
      {/* Modal de confirmation de réinscription */}
      {studentToReinscribe && (
        <ReinscriptionConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false)
            setStudentToReinscribe(null)
          }}
          student={studentToReinscribe}
          availableClasses={allClasses}
          onConfirm={(selectedClassId) => handleReinscribe(studentToReinscribe, selectedClassId)}
          isReinscribing={isReinscribing}
        />
      )}
    </div>
  );
}
