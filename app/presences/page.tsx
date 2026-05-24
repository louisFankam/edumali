"use client"

import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { UserCheck } from "lucide-react"

export default function PresencesPage() {
  return (
    <AppLayout>
          <PageHeader title="Présences" className={''} description="Suivi des présences et absences">
            <Button>
              <UserCheck className="h-4 w-4 mr-2" />
              Marquer présences
            </Button>
          </PageHeader>

          <div className="text-center py-12">
            <p className="text-muted-foreground">Section en cours de développement...</p>
          </div>
        </AppLayout>
  )
}
