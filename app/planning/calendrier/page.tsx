"use client"

import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { CalendarView } from "@/components/calendar/calendar-view"
import { CalendarDays } from "lucide-react"

export default function CalendarPage() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Calendrier scolaire"
          description="Gérez les événements, vacances, réunions et examens de l'année scolaire."
          icon={<CalendarDays className="h-6 w-6" />}
        />
        <CalendarView />
      </div>
    </AppLayout>
  )
}
