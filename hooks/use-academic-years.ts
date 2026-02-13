// hooks/use-academic-years.ts
import { useState, useEffect, useCallback } from 'react'
import { pb, COLLECTIONS, getAuthToken, getCurrentUser } from '@/lib/pocketbase'

export interface AcademicYear {
  id?: string
  year: string
  start_date: string
  end_date: string
  status: 'active' | 'upcoming' | 'archived'
  periods?: Array<{
    name: string
    startDate: string
    endDate: string
  }>
  holidays?: Array<{
    name: string
    startDate: string
    endDate: string
  }>
  total_students?: number
  total_teachers?: number
  created?: string
  updated?: string
}

export function useAcademicYears() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les années scolaires depuis PocketBase
  const loadAcademicYears = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const authToken = getAuthToken()
      if (!authToken) {
        throw new Error('Non authentifié')
      }

      const response = await fetch(
        `${pb.baseUrl}/api/collections/${COLLECTIONS.ACADEMIC_YEARS}/records?sort=-created`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      )

      if (response.ok) {
        const result = await response.json()
        
        // Récupérer aussi le nombre d'élèves et de professeurs pour chaque année
        const studentsResponse = await fetch(
          `${pb.baseUrl}/api/collections/${COLLECTIONS.STUDENTS}/records`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        )
        
        const teachersResponse = await fetch(
          `${pb.baseUrl}/api/collections/${COLLECTIONS.TEACHERS}/records`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        )

        const studentsData = studentsResponse.ok ? await studentsResponse.json() : { items: [] }
        const teachersData = teachersResponse.ok ? await teachersResponse.json() : { items: [] }

        const transformedData = result.items.map(item => {
          // Gérer les périodes (peut être une chaîne JSON ou déjà un tableau)
          let periods = []
          if (item.periods) {
            if (typeof item.periods === 'string') {
              periods = item.periods.trim() !== '' ? JSON.parse(item.periods) : []
            } else if (Array.isArray(item.periods)) {
              periods = item.periods
            }
          }

          // Gérer les vacances (peut être une chaîne JSON ou déjà un tableau)
          let holidays = []
          if (item.holidays) {
            if (typeof item.holidays === 'string') {
              holidays = item.holidays.trim() !== '' ? JSON.parse(item.holidays) : []
            } else if (Array.isArray(item.holidays)) {
              holidays = item.holidays
            }
          }

          return {
            id: item.id,
            year: item.year,
            start_date: item.start_date,
            end_date: item.end_date,
            status: item.status || 'upcoming',
            periods,
            holidays,
            created: item.created,
            updated: item.updated
          }
        })
        
        setAcademicYears(transformedData)
      } else {
        throw new Error('Erreur lors du chargement des années scolaires')
      }
    } catch (err) {
      console.error('Erreur lors du chargement des années scolaires:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Créer une nouvelle année scolaire
  const createAcademicYear = useCallback(async (academicYear: Omit<AcademicYear, 'id' | 'created' | 'updated'>) => {
    try {
      const authToken = getAuthToken()
      if (!authToken) return false

      // Convertir les objets en chaînes JSON pour PocketBase
      const requestBody = { ...academicYear }
      if (requestBody.periods) {
        requestBody.periods = JSON.stringify(requestBody.periods)
      }
      if (requestBody.holidays) {
        requestBody.holidays = JSON.stringify(requestBody.holidays)
      }

      const response = await fetch(
        `${pb.baseUrl}/api/collections/${COLLECTIONS.ACADEMIC_YEARS}/records`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      )

      if (response.ok) {
        await loadAcademicYears() // Recharger les données
        return true
      }
      throw new Error('Erreur lors de la création de l\'année scolaire')
    } catch (err) {
      console.error('Erreur lors de la création de l\'année scolaire:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return false
    }
  }, [loadAcademicYears])

  // Mettre à jour une année scolaire
  const updateAcademicYear = useCallback(async (id: string, updates: Partial<AcademicYear>) => {
    console.log("updateAcademicYear called with:", { id, updates })
    try {
      const authToken = getAuthToken()
      if (!authToken) {
        console.log("No auth token found")
        return false
      }

      const url = `${pb.baseUrl}/api/collections/${COLLECTIONS.ACADEMIC_YEARS}/records/${id}`
      console.log("Making PATCH request to:", url)
      // Convertir les objets en chaînes JSON pour PocketBase
        const requestBody = { ...updates }
        if (requestBody.periods) {
          requestBody.periods = JSON.stringify(requestBody.periods)
        }
        if (requestBody.holidays) {
          requestBody.holidays = JSON.stringify(requestBody.holidays)
        }
        console.log("Request body:", JSON.stringify(requestBody, null, 2))

      const response = await fetch(
        url,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      )

      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)

      if (response.ok) {
        const result = await response.json()
        console.log("Update successful:", result)
        await loadAcademicYears() // Recharger les données
        return true
      } else {
        const errorText = await response.text()
        console.log("Update failed:", errorText)
        throw new Error('Erreur lors de la mise à jour de l\'année scolaire')
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'année scolaire:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return false
    }
  }, [loadAcademicYears])

  // Supprimer une année scolaire
  const deleteAcademicYear = useCallback(async (id: string) => {
    try {
      const authToken = getAuthToken()
      if (!authToken) return false

      const response = await fetch(
        `${pb.baseUrl}/api/collections/${COLLECTIONS.ACADEMIC_YEARS}/records/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      )

      if (response.ok) {
        await loadAcademicYears() // Recharger les données
        return true
      }
      throw new Error('Erreur lors de la suppression de l\'année scolaire')
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'année scolaire:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return false
    }
  }, [loadAcademicYears])

  // Activer une année scolaire (désactive les autres)
  const activateAcademicYear = useCallback(async (id: string) => {
    try {
      const authToken = getAuthToken()
      if (!authToken) return false

      // D'abord, désactiver toutes les années actives
      const currentActive = academicYears.find(year => year.status === 'active')
      if (currentActive) {
        await updateAcademicYear(currentActive.id, { status: 'archived' })
      }

      // Activer l'année sélectionnée
      await updateAcademicYear(id, { status: 'active' })
      return true
    } catch (err) {
      console.error('Erreur lors de l\'activation de l\'année scolaire:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return false
    }
  }, [academicYears, updateAcademicYear])

  // Archiver une année scolaire
  const archiveAcademicYear = useCallback(async (id: string) => {
    return await updateAcademicYear(id, { status: 'archived' })
  }, [updateAcademicYear])

  // Obtenir l'année scolaire active
  const getActiveAcademicYear = useCallback(() => {
    return academicYears.find(year => year.status === 'active')
  }, [academicYears])

  // Calculer les totaux pour une année scolaire
  const calculateTotals = useCallback(async (schoolYearId: string) => {
    try {
      const authToken = getAuthToken()
      if (!authToken) return { students: 0, teachers: 0 }

      const studentsResponse = await fetch(
        `${pb.baseUrl}/api/collections/${COLLECTIONS.STUDENTS}/records`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      )
      
      const teachersResponse = await fetch(
        `${pb.baseUrl}/api/collections/${COLLECTIONS.TEACHERS}/records`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      )

      const studentsData = studentsResponse.ok ? await studentsResponse.json() : { items: [] }
      const teachersData = teachersResponse.ok ? await teachersResponse.json() : { items: [] }

      const studentsInYear = studentsData.items.filter(student => 
        student.academic_year === schoolYearId || student.year === academicYears.find(y => y.id === schoolYearId)?.year
      ).length

      const teachersInYear = teachersData.items.filter(teacher => 
        teacher.status === "active"
      ).length

      return { students: studentsInYear, teachers: teachersInYear }
    } catch (err) {
      console.error('Erreur lors du calcul des totaux:', err)
      return { students: 0, teachers: 0 }
    }
  }, [academicYears])

  // Calculer les statistiques
  const getStats = useCallback(() => {
    return {
      totalYears: academicYears.length,
      activeYear: getActiveAcademicYear()?.year || "Aucune",
      archivedYears: academicYears.filter(year => year.status === 'archived').length,
      upcomingYears: academicYears.filter(year => year.status === 'upcoming').length,
    }
  }, [academicYears, getActiveAcademicYear])

  // Charger les données au démarrage
  useEffect(() => {
    loadAcademicYears()
  }, [loadAcademicYears])

  return {
    academicYears,
    isLoading,
    error,
    loadAcademicYears,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    activateAcademicYear,
    archiveAcademicYear,
    getActiveAcademicYear,
    calculateTotals,
    getStats,
  }
}