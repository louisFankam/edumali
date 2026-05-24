"use client"

import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function AnneesScolairesPage() {
  return (
    <AppLayout>
          <PageHeader title="Années scolaires" className={''} description="Gestion des périodes scolaires">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle année
            </Button>
          </PageHeader>

          <div className="text-center py-12">
            <p className="text-muted-foreground">Section en cours de développement...</p>
          </div>
        </AppLayout>
  )
}
