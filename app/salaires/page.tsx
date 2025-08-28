"use client"

import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { DollarSign } from "lucide-react"

export default function SalairesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader title="Salaires" description="Gestion des salaires du personnel">
            <Button>
              <DollarSign className="h-4 w-4 mr-2" />
              Traiter salaires
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
