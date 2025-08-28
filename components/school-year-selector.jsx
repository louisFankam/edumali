"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, ChevronDown } from "lucide-react"

const schoolYears = [
  { id: "2024-2025", label: "2024-2025", current: true },
  { id: "2023-2024", label: "2023-2024", current: false },
  { id: "2022-2023", label: "2022-2023", current: false },
]

export function SchoolYearSelector() {
  const [selectedYear, setSelectedYear] = useState(schoolYears.find((year) => year.current))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-transparent">
          <Calendar className="h-4 w-4 mr-2" />
          Année {selectedYear?.label}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {schoolYears.map((year) => (
          <DropdownMenuItem
            key={year.id}
            onClick={() => setSelectedYear(year)}
            className={year.current ? "bg-accent/10" : ""}
          >
            Année {year.label}
            {year.current && <span className="ml-2 text-xs text-accent">(Actuelle)</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
