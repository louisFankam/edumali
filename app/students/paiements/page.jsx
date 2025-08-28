"use client"

import { useState, useMemo } from "react"
import {
  UserCheck,
  Search,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Users,
  DollarSign,
  ArrowLeft,
  FileDown,
  PlusCircle,
  X,
  LayoutDashboard,
  GraduationCap,
  BarChart2,
  Settings
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

// Import de votre composant de barre latérale
import { Sidebar } from "@/components/sidebar"

// --- Composants réutilisables ---

// Composant pour l'en-tête de la page
function PageHeader({ title, description, children }) {
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

// Sélecteur d'année scolaire (simplifié)
function SchoolYearSelector() {
  return (
    <Select defaultValue="2024-2025">
      <SelectTrigger className="w-full md:w-[180px]">
        <SelectValue placeholder="Année scolaire" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="2024-2025">2024-2025</SelectItem>
        <SelectItem value="2023-2024">2023-2024</SelectItem>
      </SelectContent>
    </Select>
  );
}

// --- Données simulées ---

const mockStudents = [
  // CM2
  { id: "cm2-1", firstName: "Aminata", lastName: "Traoré", class: "CM2", photo: "/diverse-student-girl.png", totalFee: 50000 },
  { id: "cm2-2", firstName: "Ibrahim", lastName: "Keita", class: "CM2", photo: "/diverse-student-boy.png", totalFee: 50000 },
  { id: "cm2-3", firstName: "Mariam", lastName: "Coulibaly", class: "CM2", photo: "/diverse-student-girl.png", totalFee: 50000 },
  { id: "cm2-4", firstName: "Ousmane", lastName: "Diarra", class: "CM2", photo: "/diverse-student-boy.png", totalFee: 50000 },
  { id: "cm2-5", firstName: "Kadiatou", lastName: "Sangaré", class: "CM2", photo: "/diverse-student-girl.png", totalFee: 50000 },
  { id: "cm2-6", firstName: "Moussa", lastName: "Koné", class: "CM2", photo: "/diverse-student-boy.png", totalFee: 50000 },
  { id: "cm2-7", firstName: "Fatoumata", lastName: "Diallo", class: "CM2", photo: "/diverse-student-girl.png", totalFee: 50000 },
  { id: "cm2-8", firstName: "Cheick", lastName: "Sidibé", class: "CM2", photo: "/diverse-student-boy.png", totalFee: 50000 },
  { id: "cm2-9", firstName: "Aïcha", lastName: "Camara", class: "CM2", photo: "/diverse-student-girl.png", totalFee: 50000 },
  { id: "cm2-10", firstName: "Issa", lastName: "Touré", class: "CM2", photo: "/diverse-student-boy.png", totalFee: 50000 },
  { id: "cm2-11", firstName: "Assa", lastName: "Diallo", class: "CM2", photo: "/diverse-student-girl.png", totalFee: 50000 },
  { id: "cm2-12", firstName: "Adama", lastName: "Cissé", class: "CM2", photo: "/diverse-student-boy.png", totalFee: 50000 },
  { id: "cm2-13", firstName: "Nafissatou", lastName: "Konaré", class: "CM2", photo: "/diverse-student-girl.png", totalFee: 50000 },
  // 6ème
  { id: "6eme-1", firstName: "Ahmadou", lastName: "Traoré", class: "6ème", photo: "/diverse-student-boy.png", totalFee: 75000 },
  { id: "6eme-2", firstName: "Fanta", lastName: "Sidibé", class: "6ème", photo: "/diverse-student-girl.png", totalFee: 75000 },
  { id: "6eme-3", firstName: "Modibo", lastName: "Keita", class: "6ème", photo: "/diverse-student-boy.png", totalFee: 75000 },
  { id: "6eme-4", firstName: "Kadidiatou", lastName: "Doumbia", class: "6ème", photo: "/diverse-student-girl.png", totalFee: 75000 },
  // 5ème
  { id: "5eme-1", firstName: "Sékou", lastName: "Koné", class: "5ème", photo: "/diverse-student-boy.png", totalFee: 90000 },
  { id: "5eme-2", firstName: "Aïssata", lastName: "Touré", class: "5ème", photo: "/diverse-student-girl.png", totalFee: 90000 },
];

// Données de paiement simulées pour tous les élèves
const mockPayments = [
  // Paiements pour Aminata Traoré (complètement payé)
  { id: "pay-1", studentId: "cm2-1", date: "2024-09-01", amount: 25000, description: "1ère tranche de scolarité", paymentType: "Scolarité", paymentMethod: "Espèces", payerName: "Maman" },
  { id: "pay-2", studentId: "cm2-1", date: "2024-10-15", amount: 25000, description: "2ème tranche de scolarité", paymentType: "Scolarité", paymentMethod: "Chèque", payerName: "Papa" },
  // Paiements pour Ibrahim Keita (paiement partiel)
  { id: "pay-3", studentId: "cm2-2", date: "2024-09-20", amount: 30000, description: "Frais d'inscription + 1ère tranche", paymentType: "Inscription", paymentMethod: "Virement", payerName: "Papa" },
  // Paiements pour Fanta Sidibé (paiement partiel)
  { id: "pay-4", studentId: "6eme-2", date: "2024-10-05", amount: 40000, description: "Acompte", paymentType: "Scolarité", paymentMethod: "Espèces", payerName: "Maman" },
  // Paiements pour Aïssata Touré (complètement payé)
  { id: "pay-5", studentId: "5eme-2", date: "2024-09-10", amount: 90000, description: "Totalité des frais", paymentType: "Scolarité", paymentMethod: "Espèces", payerName: "Tuteur" },
  // Paiements pour Sékou Koné (impayé) - Aucun paiement simulé pour lui.
];

// --- Fonctions utilitaires ---
const getStudentPaymentStatus = (studentId) => {
  const student = mockStudents.find(s => s.id === studentId);
  const studentPayments = mockPayments.filter(p => p.studentId === studentId);
  const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
  
  if (totalPaid >= student.totalFee) {
    return "Payé";
  } else if (totalPaid > 0 && totalPaid < student.totalFee) {
    return "Partiel";
  } else {
    return "Impayé";
  }
};

const getPaymentStatusStyle = (status) => {
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

// --- Composant pour la page des paiements ---
function PaymentsPage({ onSelectStudent }) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  // Liste des classes disponibles
  const classOptions = useMemo(() => {
    const classes = Array.from(new Set(mockStudents.map(s => s.class)));
    return ["all", ...classes];
  }, []);

  const handleExport = () => {
    alert("Fonctionnalité d'exportation en cours de développement !");
  };

  const filteredStudents = useMemo(() => {
    let list = mockStudents.map(student => ({
      ...student,
      status: getStudentPaymentStatus(student.id)
    }));

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
        student.lastName.toLowerCase().includes(normalizedQuery)
      );
    }

    return list;
  }, [activeTab, searchQuery, selectedClass]);

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
        <Select id="classFilter" value={selectedClass} onValueChange={setSelectedClass}>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.length === 0 ? (
                  <div className="col-span-full text-center text-muted-foreground p-6">
                    Aucun élève trouvé pour cette catégorie ou ne correspond à la recherche.
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center space-x-4 border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50"
                      onClick={() => onSelectStudent(student.id)}
                    >
                      <img
                        src={student.photo}
                        alt={`${student.firstName} ${student.lastName}`}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{student.firstName} {student.lastName}</h4>
                        <p className="text-sm text-gray-500">{student.class}</p>
                      </div>
                      <span className={cn(
                        "text-xs font-semibold px-2 py-1 rounded-full",
                        getPaymentStatusStyle(student.status)
                      )}>
                        {student.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}

// --- Composant pour la page détaillée d'un élève (paiements) ---
function StudentFinanceDetail({ student, onBack }) {
  const [payments, setPayments] = useState(() => mockPayments.filter(p => p.studentId === student.id));
  const [newPayment, setNewPayment] = useState({
    amount: "",
    paymentType: "Scolarité",
    paymentMethod: "Espèces",
    payerName: "",
    description: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalPaid = useMemo(() => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const remainingBalance = useMemo(() => {
    return student.totalFee - totalPaid;
  }, [student.totalFee, totalPaid]);

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!newPayment.amount || !newPayment.payerName) {
      alert("Le montant et le nom du payeur sont obligatoires.");
      return;
    }
    const newId = `pay-${Math.random().toString(16).slice(2)}`;
    const newEntry = {
      id: newId,
      studentId: student.id,
      date: new Date().toISOString().split('T')[0],
      amount: parseFloat(newPayment.amount),
      description: newPayment.description,
      paymentType: newPayment.paymentType,
      paymentMethod: newPayment.paymentMethod,
      payerName: newPayment.payerName,
    };
    
    setPayments([...payments, newEntry]);
    setNewPayment({
      amount: "",
      paymentType: "Scolarité",
      paymentMethod: "Espèces",
      payerName: "",
      description: "",
    });
    setIsDialogOpen(false);
  };
  
  const handleExport = () => {
    // Créez le contenu CSV
    const headers = ["Date", "Montant", "Type", "Mode de paiement", "Nom du payeur", "Description"];
    const rows = payments.map(p => [
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
    alert("Le rapport a été exporté avec succès !");
  };

  return (
    <main className="flex-1 p-6 space-y-6 md:ml-64">
      <div className="flex items-center space-x-4 mb-4">
        <Button onClick={onBack} variant="ghost" size="icon" className="h-8 w-8">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title={`Paiements de ${student.firstName} ${student.lastName}`}
          description={`Classe: ${student.class}`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frais Totaux</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.totalFee.toLocaleString('fr-FR')} FCFA</div>
            <p className="text-xs text-muted-foreground">Année scolaire en cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Payé</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPaid.toLocaleString('fr-FR')} FCFA</div>
            <p className="text-xs text-muted-foreground">Total des paiements reçus</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde Restant</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remainingBalance.toLocaleString('fr-FR')} FCFA</div>
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
              getPaymentStatusStyle(getStudentPaymentStatus(student.id))
            )}>
              {getStudentPaymentStatus(student.id)}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {getStudentPaymentStatus(student.id) === 'Payé' ? 'Solde à zéro' : 'Solde restant'}
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      Aucun paiement enregistré pour cet élève.
                    </td>
                  </tr>
                ) : (
                  payments.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {format(new Date(record.date), "dd MMMM yyyy", { locale: fr })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.amount.toLocaleString('fr-FR')} FCFA</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.paymentType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.paymentMethod}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.payerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.description}</td>
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
  const [currentPage, setCurrentPage] = useState("students");
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const selectedStudent = mockStudents.find(s => s.id === selectedStudentId);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Import de votre composant de barre latérale */}
      <Sidebar />

      {/* Contenu principal en fonction de la page sélectionnée */}
      {selectedStudentId && selectedStudent ? (
        <StudentFinanceDetail student={selectedStudent} onBack={() => setSelectedStudentId(null)} />
      ) : (
        <PaymentsPage onSelectStudent={setSelectedStudentId} />
      )}
    </div>
  );
}
