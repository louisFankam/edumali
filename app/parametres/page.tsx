"use client"

import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"

export default function ParametresPage() {
  return (
    <AppLayout>
          <PageHeader title="Paramètres" description="Configuration du système" />

          <div className="text-center py-12">
            <p className="text-muted-foreground">Section en cours de développement...</p>
          </div>
        </AppLayout>
  )
}
