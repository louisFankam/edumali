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
import { CalendarIcon, Save } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

// Définition du type de données pour le formulaire
export type NewEleveData = {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date ;
  gender: string;
  class: string;
  parentName: string;
  parentPhone: string;
  address: string;
  photo: string;
  school: string; // Garde la propriété de l'école dans le type
};

// Information sur l'école unique - Remplacez par le nom de votre école
const mySchool = "École Primaire de Bamako Centre";

export default function InscriptionPage() {
  const [formData, setFormData] = useState<NewEleveData>({
    firstName: "",
    lastName: "",
    dateOfBirth: undefined,
    gender: "",
    class: "",
    parentName: "",
    parentPhone: "",
    address: "",
    photo: "/diverse-students-studying.png", // Photo par défaut
    school: mySchool, // Initialise l'école directement
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName && formData.dateOfBirth) {
      // Logic to save the new student data.
      // In a real application, you would send this data to a backend API.
      console.log("Données de l'élève à enregistrer :", {
        ...formData,
        dateOfBirth: format(formData.dateOfBirth, "yyyy-MM-dd"),
      });

      // Simple alert for demonstration
      alert("Nouvel élève enregistré avec succès !");

      // Reset form fields after submission
      setFormData({
        firstName: "",
        lastName: "",
        dateOfBirth: undefined,
        gender: "",
        class: "",
        parentName: "",
        parentPhone: "",
        address: "",
        photo: "/diverse-students-studying.png",
        school: mySchool,
      });
    } else {
      alert("Veuillez remplir tous les champs obligatoires (nom, prénom, date de naissance).");
    }
  };

  const handleInputChange = (field: keyof NewEleveData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Intégration de la sidebar */}
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          {/* En-tête de la page */}
          <PageHeader
            title="Inscription d'un nouvel élève"
            className={''}
            description="Utilisez ce formulaire pour enregistrer un nouvel élève."
          >
            <Button type="submit" form="new-eleve-form">
              <Save className="h-4 w-4 mr-2" />
              Enregistrer l'élève
            </Button>
          </PageHeader>

          <Card>
            <CardHeader>
              <CardTitle>Formulaire d'inscription</CardTitle>
              <CardDescription>Remplissez tous les champs requis pour procéder à l'inscription.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Formulaire complet */}
              <form id="new-eleve-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Section Informations personnelles */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informations personnelles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="Prénom de l'élève"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom de famille *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Nom de famille"
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
                              !formData.dateOfBirth && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.dateOfBirth ? (
                              format(formData.dateOfBirth, "dd MMMM yyyy", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.dateOfBirth}
                            onSelect={(date) => handleInputChange("dateOfBirth", date)}
                            initialFocus
                            locale={fr}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Genre</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
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
                      <Select value={formData.class} onValueChange={(value) => handleInputChange("class", value)}>
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
                        value={formData.parentName}
                        onChange={(e) => handleInputChange("parentName", e.target.value)}
                        placeholder="Nom complet du parent"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentPhone">Téléphone</Label>
                      <Input
                        id="parentPhone"
                        value={formData.parentPhone}
                        onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                        placeholder="+223 XX XX XX XX"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Adresse complète de résidence"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Le bouton est maintenant dans le PageHeader */}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
