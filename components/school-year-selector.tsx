"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, ChevronDown, Loader2 } from "lucide-react"

interface AcademicYear {
  id: string
  year: string
  status: string
  start_date: string
  end_date: string
}

const LOCAL_YEARS: AcademicYear[] = [
  {
    id: "2025-2026",
    year: "2025-2026",
    status: "active",
    start_date: "2025-09-01",
    end_date: "2026-06-30",
  },
]

export function SchoolYearSelector() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setAcademicYears(LOCAL_YEARS)
    setSelectedYear(LOCAL_YEARS[0] ?? null)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <Button variant="outline" className="bg-transparent" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Chargement...
      </Button>
    )
  }

  if (academicYears.length === 0) {
    return (
      <Button variant="outline" className="bg-transparent" disabled>
        <Calendar className="h-4 w-4 mr-2" />
        Aucune année
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-transparent">
          <Calendar className="h-4 w-4 mr-2" />
          {selectedYear ? `Année ${selectedYear.year}` : "Sélectionner"}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto">
        {academicYears.map((year) => (
          <DropdownMenuItem key={year.id} onClick={() => setSelectedYear(year)}>
            Année {year.year}
            {year.status === "active" && <span className="ml-2 text-xs text-accent">(Active)</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
