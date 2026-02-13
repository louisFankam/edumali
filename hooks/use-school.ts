// hooks/use-school.ts
import { useState, useCallback } from "react"
import { getApiUrl, getAuthToken } from '@/lib/pocketbase'

interface SchoolInfo {
  id: string
  name: string
  address: string
  phone: string
  email: string
  director: string
  founded_year: number
  logo: string
  website: string
}

export const useSchool = () => {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSchoolInfo = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Vérifier d'abord dans le localStorage
      const cachedSchoolInfo = localStorage.getItem('school_info')
      if (cachedSchoolInfo) {
        const parsedInfo = JSON.parse(cachedSchoolInfo)
        setSchoolInfo(parsedInfo)
        setIsLoading(false)
        return
      }

      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')
      
      // CORRECTION: Utiliser edumali_school_info au lieu de edumali_school
      const response = await fetch(
        getApiUrl('collections/edumali_school_info/records?perPage=1'),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la récupération des informations de l\'école')

      const result = await response.json()
      
      if (result.items.length > 0) {
        const schoolData = result.items[0]
        setSchoolInfo(schoolData)
        localStorage.setItem('school_info', JSON.stringify(schoolData))
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur école:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateSchoolInfo = useCallback(async (schoolData: Partial<SchoolInfo>) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      // CORRECTION: Utiliser edumali_school_info au lieu de edumali_school
      const response = await fetch(
        getApiUrl(`collections/edumali_school_info/records/${schoolInfo?.id}`),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(schoolData)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de la modification')
      }

      const updatedSchool = await response.json()
      setSchoolInfo(updatedSchool)
      localStorage.setItem('school_info', JSON.stringify(updatedSchool))
      
    } catch (err) {
      console.error('Erreur modification école:', err)
      throw err
    }
  }, [schoolInfo?.id])

  return {
    schoolInfo,
    isLoading,
    error,
    fetchSchoolInfo,
    updateSchoolInfo
  }
}