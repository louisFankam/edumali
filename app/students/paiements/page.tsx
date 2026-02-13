"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Search,
  CheckCircle,
  Clock,
  DollarSign,
  ArrowLeft,
  FileDown,
  PlusCircle,
  X
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/sidebar"

// Import des hooks personnalisés
import { usePayments } from "@/hooks/use-payments"
import { useAcademicYears } from "@/hooks/use-academic-years"
import { useClasses } from "@/hooks/use-classes"
import { SchoolYearSelector } from "@/components/school-year-selector"

// --- Types pour les composants ---

interface PageHeaderProps {
  title: string
  description: string
  children?: React.ReactNode
}



interface PaymentsPageProps {
  onSelectStudent: (student: any) => void
}

interface StudentFinanceDetailProps {
  student: any
  onBack: () => void
}

// --- Composants réutilisables ---

// Composant pour l'en-tête de la page
function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 pb-4 md:pb-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}


// --- Fonctions utilitaires ---

const getPaymentStatusStyle = (status: string) => {
  switch (status) {
    case "Payé":
      return "bg-green-100 text-green-700";
    case "Partiel":
      return "bg-yellow-100 text-yellow-700";
    case "Impayé":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`;
};

// --- Composant pour la page des paiements ---

function PaymentsPage({ onSelectStudent }: PaymentsPageProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string | null>(null);
    
  const { toast } = useToast()
  const { studentsWithPayments, isLoading, error, fetchStudentsWithPayments } = usePayments()
  const { academicYears, fetchAcademicYears, getCurrentAcademicYear } = useAcademicYears()
  const { fetchClasses } = useClasses()
  const { fetchStudentPayments, createPayment, deletePayment } = usePayments()

  // Initialisation des données
  useEffect(() => {
    fetchAcademicYears()
    fetchClasses()
  }, [fetchAcademicYears, fetchClasses])

  // Définir l'année académique sélectionnée
  useEffect(() => {
    console.log('Années académiques chargées:', academicYears.length)
    console.log('selectedAcademicYear actuel:', selectedAcademicYear)
    if (academicYears.length > 0 && !selectedAcademicYear) {
      const currentYear = getCurrentAcademicYear()
      console.log('Année courante trouvée:', currentYear)
      if (currentYear) {
        // Si le year est undefined, utiliser l'ID ou générer un nom
        const yearName = currentYear.year || currentYear.id || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
        console.log('Année sélectionnée:', yearName)
        setSelectedAcademicYear(yearName)
      } else {
        // Si aucune année courante, utiliser la première année disponible
        const firstYear = academicYears[0]
        const yearName = firstYear.year || firstYear.id || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
        console.log('Première année utilisée:', yearName)
        setSelectedAcademicYear(yearName)
      }
    }
  }, [academicYears, selectedAcademicYear, getCurrentAcademicYear])

  // Récupérer les données quand l'année change
  useEffect(() => {
    console.log('useEffect déclenché avec selectedAcademicYear:', selectedAcademicYear)
    if (selectedAcademicYear) {
      const currentYear = getCurrentAcademicYear()
      const yearName = currentYear?.year || currentYear?.id || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
      console.log('Chargement des étudiants pour l\'année:', yearName)
      fetchStudentsWithPayments(yearName)
    }
  }, [selectedAcademicYear, fetchStudentsWithPayments, getCurrentAcademicYear])

  // Liste des classes disponibles
  const classOptions = useMemo(() => {
    const availableClasses = Array.from(new Set(studentsWithPayments.map(s => s.class)));
    console.log('Classes disponibles:', availableClasses)
    return ["all", ...availableClasses];
  }, [studentsWithPayments]);

  const handleExport = () => {
    const headers = ["Nom", "Prénom", "Classe", "Statut", "Frais totaux", "Montant payé", "Solde restant"];
    const rows = filteredStudents.map(student => [
      student.lastName,
      student.firstName,
      student.class,
      student.status,
      student.totalFee,
      student.totalPaid,
      student.remainingBalance
    ]);
    
    let csvContent = headers.join(";") + "\n" + rows.map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `paiements_${selectedAcademicYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export réussi",
      description: "Le rapport de paiements a été exporté avec succès."
    })
  };

  const filteredStudents = useMemo(() => {
    let list = studentsWithPayments;
    console.log('Filtrage des étudiants:', studentsWithPayments.length, 'étudiants au total');

    // Filtrage par statut
    if (activeTab !== "all") {
      list = list.filter(student => student.status === activeTab);
    }

    // Filtrage par classe
    if (selectedClass !== "all") {
      list = list.filter(student => student.class === selectedClass);
    }

    // Filtrage par recherche
    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase();
      list = list.filter(student =>
        student.firstName.toLowerCase().includes(normalizedQuery) ||
        student.lastName.toLowerCase().includes(normalizedQuery) ||
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(normalizedQuery)
      );
    }

    return list;
  }, [studentsWithPayments, activeTab, searchQuery, selectedClass]);

  if (error) {
    return (
      <main className="flex-1 p-6 space-y-6 md:ml-64">
        <div className="text-center text-red-600">
          <p>Erreur: {error}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 p-6 space-y-6 md:ml-64">
      <PageHeader title="Gestion des Paiements" description="Suivi des frais de scolarité des élèves">
        <div className="flex items-center space-x-2">
          <Button onClick={handleExport} variant="outline" className="bg-transparent">
            <FileDown className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <SchoolYearSelector />
        </div>
      </PageHeader>

      {/* Filtre par salle de classe */}
      <div className="flex items-center space-x-2 mb-2">
        <Label htmlFor="classFilter" className="text-sm">Salle de classe :</Label>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Toutes les classes" />
          </SelectTrigger>
          <SelectContent>
            {classOptions.map(cl => (
              <SelectItem key={cl} value={cl}>
                {cl === "all" ? "Toutes les classes" : cl}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tous les élèves</TabsTrigger>
          <TabsTrigger value="Payé">Payé</TabsTrigger>
          <TabsTrigger value="Partiel">Partiel</TabsTrigger>
          <TabsTrigger value="Impayé">Impayé</TabsTrigger>
        </TabsList>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Rechercher un élève..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-4">
              {error ? (
                <div className="col-span-full text-center text-red-600 p-6">
                  <p className="font-semibold">Erreur de chargement</p>
                  <p className="text-sm">{error}</p>
                </div>
              ) : isLoading ? (
                <div className="text-center text-muted-foreground p-6">
                  Chargement des données...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground p-6">
                  Aucun élève trouvé pour cette catégorie ou ne correspond à la recherche.
                  <p className="text-xs mt-2">Essayez de changer de filtre ou d'année académique</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center space-x-4 border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50"
                      onClick={() => {
                        console.log('Carte cliquée pour étudiant:', student.firstName, student.id);
                        console.log('Avant appel onSelectStudent');
                        onSelectStudent(student);
                        console.log('Après appel onSelectStudent');
                      }}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={student.photo || (student.gender === "Masculin" ? "/homme.png" : "/femme.png")} 
                          alt={`${student.firstName} ${student.lastName}`} 
                        />
                        <AvatarFallback>
                          {getInitials(student.firstName, student.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">{student.firstName} {student.lastName}</h4>
                        <p className="text-sm text-gray-500">{student.class}</p>
                        <div className="text-xs text-gray-400 mt-1">
                          {Number(student.totalPaid).toLocaleString('fr-FR')} / {Number(student.totalFee).toLocaleString('fr-FR')} FCFA
                        </div>
                      </div>
                      <span className={cn(
                        "text-xs font-semibold px-2 py-1 rounded-full",
                        getPaymentStatusStyle(student.status)
                      )}>
                        {student.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}

// --- Composant pour la page détaillée d'un élève (paiements) ---

function StudentFinanceDetail({ student, onBack }: StudentFinanceDetailProps) {
  const [payments, setPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newPayment, setNewPayment] = useState({
    amount: "",
    paymentType: "Scolarité",
    paymentMethod: "Espèces",
    payerName: "",
    description: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { toast } = useToast()
  const { fetchStudentPayments, createPayment, deletePayment } = usePayments()
  const { academicYears, fetchAcademicYears } = useAcademicYears()
  
  // S'assurer que les années académiques sont chargées
  useEffect(() => {
    if (academicYears.length === 0) {
      fetchAcademicYears()
    }
  }, [academicYears, fetchAcademicYears])
  
  // Trouver le nom de l'année académique
  const academicYearName = academicYears.find(year => year.id === student.academicYear)?.year || student.academicYear
  
  // Debug
  console.log('Années académiques disponibles:', academicYears)
  console.log('ID de l\'année de l\'étudiant:', student.academicYear)
  console.log('Nom trouvé:', academicYearName)

  // Charger les paiements de l'étudiant
  useEffect(() => {
    const loadPayments = async () => {
      setIsLoading(true)
      try {
        const studentPayments = await fetchStudentPayments(student.id)
        setPayments(studentPayments)
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les paiements de l'élève",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (student.id) {
      loadPayments()
    }
  }, [student.id, fetchStudentPayments, toast])

  const totalPaid = useMemo(() => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const remainingBalance = useMemo(() => {
    return student.totalFee - totalPaid;
  }, [student.totalFee, totalPaid]);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.amount || !newPayment.payerName) {
      toast({
        title: "Erreur",
        description: "Le montant et le nom du payeur sont obligatoires.",
        variant: "destructive"
      })
      return;
    }

    try {
      await createPayment({
        studentId: student.id,
        date: new Date().toISOString().split('T')[0],
        amount: parseFloat(newPayment.amount),
        description: newPayment.description,
        paymentType: newPayment.paymentType,
        paymentMethod: newPayment.paymentMethod,
        payerName: newPayment.payerName,
        academicYear: student.academicYearId // Utiliser l'ID pour la relation
      });
      
      // Rafraîchir la liste des paiements
      const updatedPayments = await fetchStudentPayments(student.id)
      setPayments(updatedPayments)
      
      setNewPayment({
        amount: "",
        paymentType: "Scolarité",
        paymentMethod: "Espèces",
        payerName: "",
        description: "",
      });
      setIsDialogOpen(false);
      
      toast({
        title: "Succès",
        description: "Le paiement a été enregistré avec succès."
      })
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement",
        variant: "destructive"
      })
    }
  };
  
  const handleDeletePayment = async (paymentId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce paiement ?")) {
      try {
        await deletePayment(paymentId)
        const updatedPayments = await fetchStudentPayments(student.id)
        setPayments(updatedPayments)
        
        toast({
          title: "Succès",
          description: "Le paiement a été supprimé avec succès."
        })
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le paiement",
          variant: "destructive"
        })
      }
    }
  };

  const handleExport = () => {
    const headers = ["Date", "Montant", "Type", "Mode de paiement", "Nom du payeur", "Description"];
    const rows = payments.map((p: any) => [
      format(new Date(p.date), "dd/MM/yyyy"),
      p.amount,
      p.paymentType,
      p.paymentMethod,
      p.payerName,
      p.description,
    ]);
    
    let csvContent = headers.join(";") + "\n" + rows.map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `paiements_${student.firstName}_${student.lastName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export réussi",
      description: "Le rapport de paiements a été exporté avec succès."
    })
  };

  const getPaymentStatus = () => {
    if (totalPaid >= student.totalFee) return "Payé";
    if (totalPaid > 0) return "Partiel";
    return "Impayé";
  };

  return (
    <main className="flex-1 p-6 space-y-6 md:ml-64">
      <div className="flex items-center space-x-4 mb-4">
        <Button onClick={onBack} variant="ghost" size="icon" className="h-8 w-8">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title={`Paiements de ${student.firstName} ${student.lastName}`}
          description={`Classe: ${student.class} • Année: ${academicYearName}`}
        >
          <div></div>
        </PageHeader>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frais Totaux</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(student.totalFee).toLocaleString('fr-FR')} FCFA</div>
            <p className="text-xs text-muted-foreground">Année scolaire en cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Payé</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(totalPaid).toLocaleString('fr-FR')} FCFA</div>
            <p className="text-xs text-muted-foreground">Total des paiements reçus</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde Restant</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(remainingBalance).toLocaleString('fr-FR')} FCFA</div>
            <p className="text-xs text-muted-foreground">Montant à collecter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statut</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              getPaymentStatusStyle(getPaymentStatus())
            )}>
              {getPaymentStatus()}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {getPaymentStatus() === 'Payé' ? 'Solde à zéro' : 'Solde restant'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historique des paiements</CardTitle>
            <div className="flex space-x-2">
              <Button onClick={handleExport} variant="outline" className="bg-transparent">
                <FileDown className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button><PlusCircle className="h-4 w-4 mr-2" /> Ajouter un paiement</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau paiement</DialogTitle>
                    <DialogDescription>
                      Enregistrer un paiement pour {student.firstName} {student.lastName}.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddPayment} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">Montant</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">Type de frais</Label>
                      <Select value={newPayment.paymentType} onValueChange={(value) => setNewPayment({ ...newPayment, paymentType: value })}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Scolarité">Scolarité</SelectItem>
                          <SelectItem value="Inscription">Inscription</SelectItem>
                          <SelectItem value="Fournitures">Fournitures</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="method" className="text-right">Mode de paiement</Label>
                      <Select value={newPayment.paymentMethod} onValueChange={(value) => setNewPayment({ ...newPayment, paymentMethod: value })}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Sélectionner le mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Espèces">Espèces</SelectItem>
                          <SelectItem value="Chèque">Chèque</SelectItem>
                          <SelectItem value="Virement">Virement</SelectItem>
                          <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="payerName" className="text-right">Nom du payeur</Label>
                      <Input
                        id="payerName"
                        value={newPayment.payerName}
                        onChange={(e) => setNewPayment({ ...newPayment, payerName: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">Description</Label>
                      <Input
                        id="description"
                        value={newPayment.description}
                        onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <DialogClose asChild>
                        <Button type="button" variant="outline" className="bg-transparent">Annuler</Button>
                      </DialogClose>
                      <Button type="submit">Enregistrer le paiement</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type de frais
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mode de paiement
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom du payeur
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Chargement des paiements...
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Aucun paiement enregistré pour cet élève.
                    </td>
                  </tr>
                ) : (
                  payments.map((record: any) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {format(new Date(record.date), "dd MMMM yyyy", { locale: fr })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.amount.toLocaleString('fr-FR')} FCFA</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.paymentType === 'tuition' ? 'Scolarité' : 
                         record.paymentType === 'lunch' ? 'Cantine' :
                         record.paymentType === 'transport' ? 'Transport' :
                         record.paymentType === 'other' ? 'Autre' : record.paymentType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.paymentMethod === 'cash' ? 'Espèces' : 
                         record.paymentMethod === 'check' ? 'Chèque' :
                         record.paymentMethod === 'transfer' ? 'Virement' :
                         record.paymentMethod === 'card' ? 'Carte' : record.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.payerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          onClick={() => handleDeletePayment(record.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

// Composant principal de l'application
export default function App() {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const { studentsWithPayments } = usePayments()
  const { academicYears, getCurrentAcademicYear } = useAcademicYears()

  console.log('selectedStudent mis à jour:', selectedStudent?.firstName);

  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      {selectedStudent ? (
        <StudentFinanceDetail student={selectedStudent} onBack={() => setSelectedStudent(null)} />
      ) : (
        <PaymentsPage onSelectStudent={setSelectedStudent} />
      )}
    </div>
  );
}