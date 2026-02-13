// hooks/use-exams.ts
import { useState, useCallback } from "react"
import { getCurrentUserId } from "@/lib/pocketbase"

interface Exam {
  id: string
  name: string
  type: "composition" | "trimestre" | "semestre" | "annuel"
  exam_date: string
  class_id: string
  subject_id: string
  coefficient: number
  max_score?: number
  duration?: number
  instructions?: string
  is_active: boolean
  academic_year: string
  created?: string
  updated?: string
  expand?: {
    class_id?: {
      id: string
      name: string
    }
    subject_id?: {
      id: string
      name: string
      coefficient: number
    }
  }
}

export const useExams = () => {
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchExams = useCallback(async (filters?: {
    classId?: string
    subjectId?: string
    academicYear?: string
    search?: string
  }) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')
      
      let url = getApiUrl('collections/edumali_exams/records?expand=class_id,subject_id&perPage=500')
      
      // Construire les filtres
      const filterParts = []
      if (filters?.classId && filters.classId !== "all") {
        filterParts.push(`class_id="${filters.classId}"`)
      }
      if (filters?.subjectId && filters.subjectId !== "all") {
        filterParts.push(`subject_id="${filters.subjectId}"`)
      }
      if (filters?.academicYear) {
        filterParts.push(`academic_year="${filters.academicYear}"`)
      }
      if (filters?.search) {
        filterParts.push(`name~"${filters.search}"`)
      }
      
      if (filterParts.length > 0) {
        url += `&filter=(${filterParts.join(' && ')})`
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Erreur lors de la récupération des examens')

      const result = await response.json()
      setExams(result.items || [])
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur examens:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createExam = useCallback(async (examData: Omit<Exam, "id" | "created" | "updated">) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const pocketbaseData = {
        name: examData.name,
        type: examData.type,
        exam_date: examData.exam_date,
        class_id: examData.class_id,
        subject_id: examData.subject_id,
        coefficient: examData.coefficient,
        max_score: examData.max_score || 20,
        duration: examData.duration || 0,
        instructions: examData.instructions || "",
        is_active: examData.is_active,
        academic_year: examData.academic_year,
        created_by: getCurrentUserId() || 'system'
      }

      const response = await fetch(
        getApiUrl('collections/edumali_exams/records'),
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

      await fetchExams()
      
    } catch (err) {
      console.error('Erreur création examen:', err)
      throw err
    }
  }, [fetchExams])

  const updateExam = useCallback(async (id: string, examData: Partial<Exam>) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const pocketbaseData: any = {}

      // Ne mettre à jour que les champs fournis
      if (examData.name !== undefined) pocketbaseData.name = examData.name
      if (examData.type !== undefined) pocketbaseData.type = examData.type
      if (examData.exam_date !== undefined) pocketbaseData.exam_date = examData.exam_date
      if (examData.class_id !== undefined) pocketbaseData.class_id = examData.class_id
      if (examData.subject_id !== undefined) pocketbaseData.subject_id = examData.subject_id
      if (examData.coefficient !== undefined) pocketbaseData.coefficient = examData.coefficient
      if (examData.max_score !== undefined) pocketbaseData.max_score = examData.max_score
      if (examData.duration !== undefined) pocketbaseData.duration = examData.duration
      if (examData.instructions !== undefined) pocketbaseData.instructions = examData.instructions
      if (examData.is_active !== undefined) pocketbaseData.is_active = examData.is_active
      if (examData.academic_year !== undefined) pocketbaseData.academic_year = examData.academic_year

      const response = await fetch(
        getApiUrl(`collections/edumali_exams/records/${id}`),
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

      await fetchExams()
      
    } catch (err) {
      console.error('Erreur modification examen:', err)
      throw err
    }
  }, [fetchExams])

  const deleteExam = useCallback(async (id: string) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const response = await fetch(
        getApiUrl(`collections/edumali_exams/records/${id}`),
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la suppression')

      setExams((prev) => prev.filter((e) => e.id !== id))
      
    } catch (err) {
      console.error('Erreur suppression examen:', err)
      throw err
    }
  }, [])

  return {
    exams,
    isLoading,
    error,
    fetchExams,
    createExam,
    updateExam,
    deleteExam
  }
}