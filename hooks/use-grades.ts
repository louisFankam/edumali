// hooks/use-grades.ts
import { useState, useCallback } from "react"
import { getCurrentUserId } from "@/lib/pocketbase"

interface Grade {
  id: string
  student_id: string
  exam_id: string
  grade: number  // Gardé pour l'interface, mais mappé à 'score' pour PocketBase
  score?: number // Le vrai champ dans PocketBase
  remarks?: string
  recorded_by?: string
  created?: string
  updated?: string
  expand?: {
    student_id?: {
      id: string
      first_name: string
      last_name: string
    }
    exam_id?: {
      id: string
      name: string
      expand?: {
        class_id?: {
          name: string
        }
        subject_id?: {
          name: string
        }
      }
    }
  }
}

export const useGrades = () => {
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGrades = useCallback(async (filters?: {
    examId?: string
    studentId?: string
    classId?: string
  }) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')
      
      let url = getApiUrl('collections/edumali_grades/records?expand=student_id,exam_id,exam_id.class_id,exam_id.subject_id&perPage=1000')
      
      const filterParts = []
      if (filters?.examId) {
        filterParts.push(`exam_id="${filters.examId}"`)
      }
      if (filters?.studentId) {
        filterParts.push(`student_id="${filters.studentId}"`)
      }
      if (filters?.classId) {
        filterParts.push(`exam_id.class_id="${filters.classId}"`)
      }
      
      if (filterParts.length > 0) {
        url += `&filter=(${filterParts.join(' && ')})`
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Erreur lors de la récupération des notes')

      const result = await response.json()
      
      // Transformer les données pour mapper 'score' à 'grade'
      const transformedGrades: Grade[] = result.items.map((item: any) => ({
        ...item,
        grade: item.score || 0, // Mapper score à grade pour l'interface
        score: item.score // Garder le champ original
      }))
      
      setGrades(transformedGrades)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur notes:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createGrade = useCallback(async (gradeData: Omit<Grade, "id" | "created" | "updated">) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const pocketbaseData = {
        student_id: gradeData.student_id,
        exam_id: gradeData.exam_id,
        score: gradeData.grade,
        remarks: gradeData.remarks || "",
        recorded_by: getCurrentUserId() || 'system'
      }

      const response = await fetch(
        getApiUrl('collections/edumali_grades/records'),
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

      await fetchGrades()
      
    } catch (err) {
      console.error('Erreur création note:', err)
      throw err
    }
  }, [fetchGrades])

  const updateGrade = useCallback(async (id: string, gradeData: Partial<Grade>) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const pocketbaseData = {
        student_id: gradeData.student_id,
        exam_id: gradeData.exam_id,
        score: gradeData.grade,
        remarks: gradeData.remarks || "",
        recorded_by: getCurrentUserId() || 'system'
      }

      const response = await fetch(
        getApiUrl(`collections/edumali_grades/records/${id}`),
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

      await fetchGrades()
      
    } catch (err) {
      console.error('Erreur modification note:', err)
      throw err
    }
  }, [fetchGrades])

  const deleteGrade = useCallback(async (id: string) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const response = await fetch(
        getApiUrl(`collections/edumali_grades/records/${id}`),
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la suppression')

      setGrades((prev) => prev.filter((g) => g.id !== id))
      
    } catch (err) {
      console.error('Erreur suppression note:', err)
      throw err
    }
  }, [])

  const getExamGrades = useCallback(async (examId: string) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')
      
      const response = await fetch(
        `getApiUrl('collections/edumali_grades/records?expand=student_id&filter=(exam_id="${examId}")&perPage=1000`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la récupération des notes')

      const result = await response.json()
      return result.items || []
      
    } catch (err) {
      console.error('Erreur récupération notes examen:', err)
      throw err
    }
  }, [])

  return {
    grades,
    isLoading,
    error,
    fetchGrades,
    createGrade,
    updateGrade,
    deleteGrade,
    getExamGrades
  }
}