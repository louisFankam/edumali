"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { EleveModal, type Eleve } from "@/components/eleve-modal"
import { EleveDetailsModal } from "@/components/eleve-details-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, GraduationCap, Users, MapPin, Edit, Trash2, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

// Mock data for demonstration
const mockEtablissements = [
  { id: "1", nom: "École Primaire de Bamako Centre" },
  { id: "2", nom: "Lycée Technique de Sikasso" },
  { id: "3", nom: "Collège de Ségou" },
  { id: "4", nom: "École Primaire de Kayes" },
]

const mockEleves: Eleve[] = [
  {
    id: "1",
    numeroEleve: "EL2024001",
    nom: "TRAORÉ",
    prenom: "Aminata",
    dateNaissance: "2010-03-15",
    lieuNaissance: "Bamako",
    sexe: "F",
    nationalite: "Malienne",
    etablissement: "École Primaire de Bamako Centre",
    classe: "A",
    niveau: "CM2",
    anneeScolaire: "2024-2025",
    statut: "Actif",
    dateInscription: "2024-09-01",
    adresse: "Quartier Hippodrome, Rue 245",
    ville: "Bamako",
    region: "Bamako",
    telephone: "+223 76 12 34 56",
    email: "aminata.traore@email.com",
    nomPere: "Mamadou TRAORÉ",
    professionPere: "Commerçant",
    telephonePere: "+223 66 11 22 33",
    nomMere: "Fatoumata KEITA",
    professionMere: "Enseignante",
    telephoneMere: "+223 77 44 55 66",
    groupeSanguin: "O+",
    contactUrgence: "Fatoumata KEITA",
    telephoneUrgence: "+223 77 44 55 66",
    moyenneGenerale: 16.5,
    classement: 2,
    observations: "Élève très studieuse et participative",
  },
  {
    id: "2",
    numeroEleve: "EL2024002",
    nom: "SANGARÉ",
    prenom: "Ibrahim",
    dateNaissance: "2008-07-22",
    lieuNaissance: "Sikasso",
    sexe: "M",
    nationalite: "Malienne",
    etablissement: "Lycée Technique de Sikasso",
    classe: "B",
    niveau: "2nde",
    anneeScolaire: "2024-2025",
    statut: "Actif",
    dateInscription: "2024-09-01",
    adresse: "Quartier Lafiabougou",
    ville: "Sikasso",
    region: "Sikasso",
    nomPere: "Seydou SANGARÉ",
    professionPere: "Agriculteur",
    telephonePere: "+223 65 78 90 12",
    nomMere: "Mariam COULIBALY",
    professionMere: "Ménagère",
    telephoneMere: "+223 76 54 32 10",
    groupeSanguin: "A+",
    contactUrgence: "Seydou SANGARÉ",
    telephoneUrgence: "+223 65 78 90 12",
    moyenneGenerale: 14.2,
    classement: 8,
  },
  {
    id: "3",
    numeroEleve: "EL2024003",
    nom: "KEITA",
    prenom: "Aïssata",
    dateNaissance: "2009-11-08",
    lieuNaissance: "Ségou",
    sexe: "F",
    nationalite: "Malienne",
    etablissement: "Collège de Ségou",
    classe: "C",
    niveau: "3ème",
    anneeScolaire: "2024-2025",
    statut: "Actif",
    dateInscription: "2024-09-01",
    adresse: "Route de Markala",
    ville: "Ségou",
    region: "Ségou",
    nomPere: "Boubacar KEITA",
    professionPere: "Fonctionnaire",
    telephonePere: "+223 74 85 96 30",
    nomMere: "Hawa DIARRA",
    professionMere: "Commerçante",
    telephoneMere: "+223 75 96 85 74",
    groupeSanguin: "B+",
    contactUrgence: "Hawa DIARRA",
    telephoneUrgence: "+223 75 96 85 74",
    moyenneGenerale: 18.1,
    classement: 1,
    observations: "Excellente élève, très motivée",
  },
  {
    id: "4",
    numeroEleve: "EL2024004",
    nom: "COULIBALY",
    prenom: "Moussa",
    dateNaissance: "2011-01-30",
    lieuNaissance: "Kayes",
    sexe: "M",
    nationalite: "Malienne",
    etablissement: "École Primaire de Kayes",
    classe: "A",
    niveau: "CE2",
    anneeScolaire: "2024-2025",
    statut: "Inactif",
    dateInscription: "2024-09-01",
    adresse: "Quartier Liberté",
    ville: "Kayes",
    region: "Kayes",
    nomPere: "Amadou COULIBALY",
    professionPere: "Mécanicien",
    telephonePere: "+223 63 25 14 78",
    nomMere: "Rokia DIALLO",
    professionMere: "Couturière",
    telephoneMere: "+223 72 14 25 36",
    groupeSanguin: "AB+",
    contactUrgence: "Rokia DIALLO",
    telephoneUrgence: "+223 72 14 25 36",
    moyenneGenerale: 12.8,
    classement: 15,
  },
]

export default function ElevesPage() {
  const [eleves, setEleves] = useState<Eleve[]>(mockEleves)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedEleve, setSelectedEleve] = useState<Eleve | undefined>()
  const [selectedEleveForDetails, setSelectedEleveForDetails] = useState<Eleve | null>(null)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")

  const handleCreateEleve = () => {
    setSelectedEleve(undefined)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const handleEditEleve = (eleve: Eleve) => {
    setSelectedEleve(eleve)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const handleViewEleve = (eleve: Eleve) => {
    setSelectedEleveForDetails(eleve)
    setIsDetailsModalOpen(true)
  }

  const handleDeleteEleve = (id: string) => {
    setEleves((prev) => prev.filter((e) => e.id !== id))
  }

  const handleSaveEleve = (eleveData: Omit<Eleve, "id">) => {
    if (modalMode === "create") {
      const newEleve: Eleve = {
        ...eleveData,
        id: Date.now().toString(),
      }
      setEleves((prev) => [...prev, newEleve])
    } else if (selectedEleve) {
      setEleves((prev) => prev.map((e) => (e.id === selectedEleve.id ? { ...eleveData, id: selectedEleve.id } : e)))
    }
  }

  const getInitials = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  }

  const getAge = (dateNaissance: string) => {
    const today = new Date()
    const birthDate = new Date(dateNaissance)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const columns = [
    {
      key: "eleve" as keyof Eleve,
      label: "Élève",
      render: (item: Eleve) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={item.photo || "/placeholder.svg"} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(item.nom, item.prenom)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {item.prenom} {item.nom}
            </div>
            <div className="text-sm text-muted-foreground">N° {item.numeroEleve}</div>
          </div>
        </div>
      ),
    },
    {
      key: "classe" as keyof Eleve,
      label: "Classe",
      render: ( item: Eleve) => (
        <div>
          <div className="font-medium">
            {item.niveau} {item.classe}
          </div>
          <div className="text-sm text-muted-foreground">{item.etablissement}</div>
        </div>
      ),
    },
    {
      key: "age" as keyof Eleve,
      label: "Âge",
      render: ( item: Eleve) => (
        <div>
          <div className="font-medium">{getAge(item.dateNaissance)} ans</div>
          <div className="text-sm text-muted-foreground">{item.sexe === "M" ? "Masculin" : "Féminin"}</div>
        </div>
      ),
    },
    {
      key: "ville" as keyof Eleve,
      label: "Localisation",
      render: ( item: Eleve) => (
        <div className="flex items-center space-x-1">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>
            {item.ville}, {item.region}
          </span>
        </div>
      ),
    },
    {
      key: "moyenneGenerale" as keyof Eleve,
      label: "Moyenne",
      render: ( item: Eleve) =>
        item.moyenneGenerale && item.moyenneGenerale > 0 ? (
          <Badge variant={item.moyenneGenerale >= 10 ? "default" : "destructive"}>
            {item.moyenneGenerale.toFixed(1)}/20
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        ),
    },
    {
      key: "statut" as keyof Eleve,
      label: "Statut",
      render: (value: string) => <Badge variant={value === "Actif" ? "default" : "secondary"}>{value}</Badge>,
    },
    {
      key: "actions" as keyof Eleve,
      label: "Actions",
      render: ( item: Eleve) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewEleve(item)}>
              <Eye className="h-4 w-4 mr-2" />
              Voir détails
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditEleve(item)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteEleve(item.id)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const statsCards = [
    {
      title: "Total Élèves",
      value: eleves.length,
      description: "Tous établissements",
      icon: GraduationCap,
    },
    {
      title: "Élèves Actifs",
      value: eleves.filter((e) => e.statut === "Actif").length,
      description: "Actuellement inscrits",
      icon: Users,
    },
    {
      title: "Moyenne Générale",
      value: (
        eleves
          .filter((e) => e.moyenneGenerale && e.moyenneGenerale > 0)
          .reduce((sum, e) => sum + (e.moyenneGenerale || 0), 0) /
        eleves.filter((e) => e.moyenneGenerale && e.moyenneGenerale > 0).length
      ).toFixed(1),
      description: "Sur 20 points",
      icon: GraduationCap,
    },
    {
      title: "Régions",
      value: new Set(eleves.map((e) => e.region)).size,
      description: "Zones représentées",
      icon: MapPin,
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader title="Élèves" className={''} description="Gestion des élèves et étudiants">
            <Button onClick={handleCreateEleve}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel élève 
            </Button>
          </PageHeader>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground font-space-grotesk">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des élèves</CardTitle>
              <CardDescription>Gérez tous vos élèves depuis cette interface</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={eleves}
                columns={columns}
                searchKey="nom"
                searchPlaceholder="Rechercher un élève..."
                itemsPerPage={10}
                onRowClick={handleViewEleve}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      <EleveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEleve}
        eleve={selectedEleve}
        mode={modalMode}
        etablissements={mockEtablissements}
      />

      <EleveDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        eleve={selectedEleveForDetails}
      />
    </div>
  )
}
