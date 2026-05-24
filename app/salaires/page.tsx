"use client"

import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { DollarSign } from "lucide-react"

export default function SalairesPage() {
  return (
    <AppLayout>
          <PageHeader title="Salaires" description="Gestion des salaires du personnel">
            <Button>
              <DollarSign className="h-4 w-4 mr-2" />
              Traiter salaires
            </Button>
          </PageHeader>

          <div className="text-center py-12">
            <p className="text-muted-foreground">Section en cours de développement...</p>
          </div>
        </AppLayout>
  )
}
