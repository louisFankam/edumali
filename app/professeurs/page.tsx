"use client"

import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function ProfesseursPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader title="Professeurs" description="Gestion du personnel enseignant">
            <Button variant="default">
              <UserPlus className="h-4 w-4 mr-2" />
              Nouveau professeur
            </Button>
          </PageHeader>

          {/* Contenu de la page */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Carte Liste des professeurs */}
            <Card>
              <CardHeader>
                <CardTitle>Liste des professeurs</CardTitle>
                <CardDescription>
                  Gestion de tous les professeurs de l'établissement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mb-4" />
                  <p className="font-semibold">Liste des professeurs</p>
                  <p className="text-sm">Bientôt disponible</p>
                </div>
              </CardContent>
            </Card>

            {/* Carte Fiche professeur */}
            <Card>
              <CardHeader>
                <CardTitle>Fiche professeur</CardTitle>
                <CardDescription>
                  Création et modification des fiches professeurs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mb-4" />
                  <p className="font-semibold">Fiche professeur</p>
                  <p className="text-sm">Bientôt disponible</p>
                </div>
              </CardContent>
            </Card>

            {/* Carte Affectations */}
            <Card>
              <CardHeader>
                <CardTitle>Affectations</CardTitle>
                <CardDescription>
                  Affectation des professeurs aux classes et matières.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mb-4" />
                  <p className="font-semibold">Affectations</p>
                  <p className="text-sm">Bientôt disponible</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
