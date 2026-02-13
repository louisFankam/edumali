// components/school-year-selector.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, ChevronDown, Loader2 } from "lucide-react"
import { getApiUrl, getAuthToken } from "@/lib/pocketbase"

interface AcademicYear {
  id: string
  year: string
  status: string
  start_date: string
  end_date: string
}

export function SchoolYearSelector() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAcademicYears()
  }, [])

  const fetchAcademicYears = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      // Récupérer toutes les années académiques triées par année (du plus récent au plus ancien)
      const response = await fetch(
        getApiUrl('collections/edumali_academic_years/records?sort=-year'),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la récupération des années académiques')

      const result = await response.json()
      const years: AcademicYear[] = result.items

      setAcademicYears(years)
      
      // Sélectionner l'année active par défaut, ou la plus récente si aucune n'est active
      const activeYear = years.find(year => year.status === 'active') || years[0] || null
      setSelectedYear(activeYear)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur années académiques:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleYearChange = async (year: AcademicYear) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      // Désactiver toutes les années académiques d'abord
      const updatePromises = academicYears.map(async (academicYear) => {
        if (academicYear.id !== year.id && academicYear.status === 'active') {
          const response = await fetch(
            getApiUrl(`collections/edumali_academic_years/records/${academicYear.id}`),
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: 'inactive' })
            }
          )
          return response.ok
        }
        return true
      })

      await Promise.all(updatePromises)

      // Activer l'année sélectionnée
      const activateResponse = await fetch(
        getApiUrl(`collections/edumali_academic_years/records/${year.id}`),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'active' })
        }
      )

      if (!activateResponse.ok) throw new Error('Erreur lors de l\'activation de l\'année académique')

      setSelectedYear(year)
      
      // Recharger la page pour actualiser les données avec la nouvelle année
      window.location.reload()
      
    } catch (err) {
      console.error('Erreur changement année:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors du changement d\'année')
    }
  }

  if (isLoading) {
    return (
      <Button variant="outline" className="bg-transparent" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Chargement...
      </Button>
    )
  }

  if (error) {
    return (
      <Button variant="outline" className="bg-transparent text-red-500" onClick={fetchAcademicYears}>
        <Calendar className="h-4 w-4 mr-2" />
        Erreur
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
          {selectedYear ? `Année ${selectedYear.year}` : 'Sélectionner'}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto">
        {academicYears.map((year) => (
          <DropdownMenuItem
            key={year.id}
            onClick={() => handleYearChange(year)}
            className={year.status === 'active' ? "bg-accent/10 font-medium" : ""}
          >
            Année {year.year}
            {year.status === 'active' && <span className="ml-2 text-xs text-accent">(Active)</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}