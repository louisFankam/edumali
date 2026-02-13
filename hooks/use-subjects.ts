// hooks/use-subjects.ts
import { useState, useCallback } from "react"

interface Subject {
  id: string
  name: string
  code: string
  teacher_number: number
  teacher_name?: string
  hours_per_week: number
  coefficient: number
  color: string
  description: string
  status: string
}

interface PocketBaseSubject {
  id: string
  name: string
  code: string
  teacher_number: number
  hours_per_week: number
  coefficient: number
  color: string
  description: string
  is_active: boolean
}

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateSubjectTeacherCount = useCallback(async (subjectId: string) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')
      
      // Récupérer tous les professeurs qui ont cette matière dans leur spécialité
      const teachersResponse = await fetch(
        `getApiUrl('collections/edumali_teachers/records?filter=speciality ~ "${subjectId}"`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!teachersResponse.ok) throw new Error('Erreur lors du comptage des professeurs')

      const teachersResult = await teachersResponse.json()
      const teacherCount = teachersResult.items.length

      // Mettre à jour le teacher_number de la matière
      const updateResponse = await fetch(
        getApiUrl(`collections/edumali_subjects/records/${subjectId}`),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ teacher_number: teacherCount })
        }
      )

      if (!updateResponse.ok) throw new Error('Erreur lors de la mise à jour du nombre de professeurs')

      return teacherCount
      
    } catch (err) {
      console.error('Erreur mise à jour teacher_number:', err)
      throw err
    }
  }, [])

  const fetchSubjects = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')
      
      const response = await fetch(
        getApiUrl('collections/edumali_subjects/records?perPage=200'),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la récupération des matières')

      const result = await response.json()
      
      const transformedSubjects: Subject[] = result.items.map((item: PocketBaseSubject) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        teacher_number: item.teacher_number,
        teacher_name: `${item.teacher_number} professeur(s)`,
        hours_per_week: item.hours_per_week,
        coefficient: item.coefficient,
        color: item.color,
        description: item.description,
        status: item.is_active ? 'active' : 'inactive'
      }))

      setSubjects(transformedSubjects)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur matières:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createSubject = useCallback(async (subjectData: Omit<Subject, "id">) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const pocketbaseData = {
        name: subjectData.name,
        code: subjectData.code,
        teacher_number: 0, // Sera mis à jour automatiquement
        hours_per_week: subjectData.hours_per_week,
        coefficient: subjectData.coefficient,
        color: subjectData.color,
        description: subjectData.description,
        is_active: subjectData.status !== undefined ? (subjectData.status === 'active' ? true : false) : true
      }

      const response = await fetch(
        getApiUrl('collections/edumali_subjects/records'),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(pocketbaseData)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de la création')
      }

      await fetchSubjects()
      
    } catch (err) {
      console.error('Erreur création matière:', err)
      throw err
    }
  }, [fetchSubjects])

  const updateSubject = useCallback(async (id: string, subjectData: Partial<Subject>) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const pocketbaseData = {
        name: subjectData.name,
        code: subjectData.code,
        teacher_number: subjectData.teacher_number || 0, // Conserver la valeur existante si non fournie
        hours_per_week: subjectData.hours_per_week,
        coefficient: subjectData.coefficient,
        color: subjectData.color,
        description: subjectData.description,
        is_active: subjectData.status === 'active' ? true : false
      }

      const response = await fetch(
        getApiUrl(`collections/edumali_subjects/records/${id}`),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(pocketbaseData)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de la modification')
      }

      await fetchSubjects()
      
    } catch (err) {
      console.error('Erreur modification matière:', err)
      throw err
    }
  }, [fetchSubjects])

  const deleteSubject = useCallback(async (id: string) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const response = await fetch(
        getApiUrl(`collections/edumali_subjects/records/${id}`),
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la suppression')

      setSubjects((prev) => prev.filter((s) => s.id !== id))
      
    } catch (err) {
      console.error('Erreur suppression matière:', err)
      throw err
    }
  }, [])

  return {
    subjects,
    isLoading,
    error,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    updateSubjectTeacherCount
  }
}