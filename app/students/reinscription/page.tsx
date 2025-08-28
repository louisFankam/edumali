"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Search, Save, XCircle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

// Définition du type de données pour le formulaire
export type StudentData = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  gender: string;
  class: string;
  school: string;
  parentName: string;
  parentPhone: string;
  address: string;
  photo: string;
};

// Mock de la base de données des élèves existants pour la recherche
const mockStudents = [
  {
    id: "EPB-2024-001",
    firstName: "Aminata",
    lastName: "Traoré",
    dateOfBirth: new Date("2010-03-15"),
    gender: "Féminin",
    class: "CM2",
    school: "École Primaire de Bamako Centre",
    parentName: "Mamadou Traoré",
    parentPhone: "+223 76 12 34 56",
    address: "Rue 245, Porte 156, Quartier Hippodrome, Bamako",
    photo: "/diverse-student-girl.png",
  },
  {
    id: "EPB-2024-002",
    firstName: "Moussa",
    lastName: "Diallo",
    dateOfBirth: new Date("2011-08-20"),
    gender: "Masculin",
    class: "CM1",
    school: "École Primaire de Bamako Centre",
    parentName: "Abdoulaye Diallo",
    parentPhone: "+223 66 77 88 99",
    address: "Avenue du Fleuve, Hamdallaye, Bamako",
    photo: "/diverse-student-boy.png",
  },
];

const findStudent = (query: string): StudentData | null => {
  const normalizedQuery = query.trim().toLowerCase();
  // Recherche par ID ou par nom complet
  const foundStudent = mockStudents.find(
    (student) =>
      student.id.toLowerCase() === normalizedQuery ||
      `${student.firstName.toLowerCase()} ${student.lastName.toLowerCase()}` === normalizedQuery
  );
  return foundStudent || null;
};

export default function ReinscriptionPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) {
      setSearchError("Veuillez entrer un nom ou un ID d'élève.");
      return;
    }
    setLoading(true);
    setSearchError("");

    // Simulation d'une requête API avec un délai
    setTimeout(() => {
      const foundStudent = findStudent(searchQuery);
      if (foundStudent) {
        setStudent(foundStudent);
      } else {
        setSearchError(`Aucun élève trouvé pour la recherche "${searchQuery}".`);
        setStudent(null);
      }
      setLoading(false);
    }, 1000); // Délai de 1 seconde
  };

  const handleReinscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    // Logique pour la mise à jour de l'élève.
    // Dans une vraie application, cela enverrait les données mises à jour à une API.
    console.log("Données de l'élève mises à jour pour la réinscription :", {
      ...student,
      dateOfBirth: student.dateOfBirth ? format(student.dateOfBirth, "yyyy-MM-dd") : null,
    });

    alert(`L'élève ${student.firstName} ${student.lastName} a été réinscrit avec succès !`);

    // Réinitialiser la page
    setSearchQuery("");
    setStudent(null);
  };

  // -------------------------------------------------------------------
  // CORRECTION : Mise à jour de la fonction pour un meilleur typage
  // -------------------------------------------------------------------
  const handleInputChange = (field: keyof StudentData, value: any) => {
    if (!student) return; // On s'assure que l'élève existe

    // Création d'un nouvel objet avec la propriété mise à jour
    // et passage direct à setStudent. C'est plus simple et évite l'erreur de typage.
    setStudent({ ...student, [field]: value });
  };
  // -------------------------------------------------------------------

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader
            title="Réinscription d'un élève"
            className={''}
            description="Recherchez un élève existant pour mettre à jour ses informations."
          >
            {student && (
              <Button type="submit" form="reinscription-form">
                <Save className="h-4 w-4 mr-2" />
                Réinscrire l'élève
              </Button>
            )}
          </PageHeader>

          {/* Section de recherche */}
          {!student && (
            <Card className="w-full max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Rechercher un élève</CardTitle>
                <CardDescription>
                  Entrez l'identifiant de l'élève ou son nom complet pour commencer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Ex: Aminata Traoré ou EPB-2024-001"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? "Recherche..." : <Search className="h-4 w-4" />}
                  </Button>
                </form>
                {searchError && (
                  <div className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                    <XCircle className="h-4 w-4" />
                    <span>{searchError}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Formulaire de réinscription (affiché si un élève est trouvé) */}
          {student && (
            <Card>
              <CardHeader>
                <CardTitle>Informations de {student.firstName} {student.lastName}</CardTitle>
                <CardDescription>Mettez à jour les informations et réinscrivez l'élève.</CardDescription>
              </CardHeader>
              <CardContent>
                <form id="reinscription-form" onSubmit={handleReinscribe} className="space-y-6">
                  {/* Section Informations personnelles */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Informations personnelles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom *</Label>
                        <Input
                          id="firstName"
                          value={student.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom de famille *</Label>
                        <Input
                          id="lastName"
                          value={student.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date de naissance *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal bg-transparent",
                                !student.dateOfBirth && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {student.dateOfBirth ? (
                                format(student.dateOfBirth, "dd MMMM yyyy", { locale: fr })
                              ) : (
                                <span>Sélectionner une date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={student.dateOfBirth as Date | undefined}
                              onSelect={(date) => handleInputChange("dateOfBirth", date)}
                              initialFocus
                              locale={fr}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Genre</Label>
                        <Select value={student.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le genre" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Masculin">Masculin</SelectItem>
                            <SelectItem value="Féminin">Féminin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Section Informations scolaires */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Informations scolaires</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Classe</Label>
                        <Select value={student.class} onValueChange={(value) => handleInputChange("class", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner la classe" />
                          </SelectTrigger>
                          <SelectContent>
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
                      </div>
                    </div>
                  </div>

                  {/* Section Informations du parent/tuteur */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Informations du parent/tuteur</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="parentName">Nom du parent/tuteur</Label>
                        <Input
                          id="parentName"
                          value={student.parentName}
                          onChange={(e) => handleInputChange("parentName", e.target.value)}
                          placeholder="Nom complet du parent"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parentPhone">Téléphone</Label>
                        <Input
                          id="parentPhone"
                          value={student.parentPhone}
                          onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                          placeholder="+223 XX XX XX XX"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Textarea
                        id="address"
                        value={student.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Adresse complète de résidence"
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  {/* Bouton de réinitialisation */}
                  <div className="flex justify-end pt-4">
                    <Button type="button" variant="outline" onClick={() => setStudent(null)} className="flex items-center space-x-1">
                      <XCircle className="h-4 w-4" />
                      <span>Annuler et rechercher un autre</span>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
