"use client"

import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function AnneesScolairesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader title="Années scolaires" className={''} description="Gestion des périodes scolaires">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle année
            </Button>
          </PageHeader>

          <div className="text-center py-12">
            <p className="text-muted-foreground">Section en cours de développement...</p>
          </div>
        </div>
      </main>
    </div>
  )
}
