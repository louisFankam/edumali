"use client"

import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"

export default function ParametresPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64">
        <div className="p-6 space-y-6">
          <PageHeader title="Paramètres" description="Configuration du système" />

          <div className="text-center py-12">
            <p className="text-muted-foreground">Section en cours de développement...</p>
          </div>
        </div>
      </main>
    </div>
  )
}
