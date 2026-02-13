// hooks/use-teachers.ts
import { useState, useCallback } from "react"
import { getApiUrl, getAuthToken } from '@/lib/pocketbase'
import { useSubjects } from "@/hooks/use-subjects"

interface Teacher {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  address: string
  hire_date: string
  salary: number
  status: "active" | "inactive" | "on_leave"
  photo: string
  user_id: string
  gender: "Masculin" | "Feminin"
  contrat: "horaire" | "mensuel"
  speciality: string[]
  speciality_names: string[]
  created: string
  updated: string
}

interface PocketBaseTeacher {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  hire_date: string
  salary: number
  status: string
  photo: string
  user_id: string
  gender: string
  contrat: string
  speciality: string[]
  expand?: {
    speciality?: Array<{
      id: string
      name: string
      code: string
    }>
  }
  created: string
  updated: string
}

export const useTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { updateSubjectTeacherCount } = useSubjects()

  const fetchTeachers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')
      
      const response = await fetch(
        getApiUrl('collections/edumali_teachers/records?expand=speciality&perPage=200'),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la récupération des professeurs')

      const result = await response.json()
      
      const transformedTeachers: Teacher[] = result.items.map((item: PocketBaseTeacher) => ({
        id: item.id,
        first_name: item.first_name,
        last_name: item.last_name,
        full_name: `${item.first_name} ${item.last_name}`,
        email: item.email,
        phone: item.phone,
        address: item.address,
        hire_date: item.hire_date,
        salary: item.salary,
        status: item.status as "active" | "inactive" | "on_leave",
        photo: item.photo,
        user_id: item.user_id,
        gender: (item.gender as "Masculin" | "Feminin") || "Masculin",
        contrat: (item.contrat as "horaire" | "mensuel") || "mensuel",
        speciality: item.speciality || [],
        speciality_names: item.expand?.speciality?.map(subj => subj.name) || [],
        created: item.created,
        updated: item.updated
      }))

      setTeachers(transformedTeachers)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur professeurs:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createTeacher = useCallback(async (teacherData: Omit<Teacher, "id" | "created" | "updated" | "full_name" | "speciality_names">) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const pocketbaseData = {
        first_name: teacherData.first_name,
        last_name: teacherData.last_name,
        email: teacherData.email,
        phone: teacherData.phone,
        address: teacherData.address,
        hire_date: teacherData.hire_date,
        salary: teacherData.salary,
        status: teacherData.status,
        photo: teacherData.photo,
        user_id: teacherData.user_id,
        gender: teacherData.gender,
        contrat: teacherData.contrat,
        speciality: teacherData.speciality || []
      }

      const response = await fetch(
        getApiUrl('collections/edumali_teachers/records'),
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

      await fetchTeachers()
      
      // Mettre à jour le nombre de professeurs pour chaque matière liée
      if (teacherData.speciality && teacherData.speciality.length > 0) {
        for (const subjectId of teacherData.speciality) {
          await updateSubjectTeacherCount(subjectId)
        }
      }
      
    } catch (err) {
      console.error('Erreur création professeur:', err)
      throw err
    }
  }, [fetchTeachers, updateSubjectTeacherCount])

  const updateTeacher = useCallback(async (id: string, teacherData: Partial<Teacher>) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const pocketbaseData = {
        first_name: teacherData.first_name,
        last_name: teacherData.last_name,
        email: teacherData.email,
        phone: teacherData.phone,
        address: teacherData.address,
        hire_date: teacherData.hire_date,
        salary: teacherData.salary,
        status: teacherData.status,
        photo: teacherData.photo,
        user_id: teacherData.user_id,
        gender: teacherData.gender,
        contrat: teacherData.contrat,
        speciality: teacherData.speciality || []
      }

      const response = await fetch(
        getApiUrl(`collections/edumali_teachers/records/${id}`),
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

      await fetchTeachers()
      
      // Mettre à jour le nombre de professeurs pour les matières affectées
      // Récupérer les anciennes spécialités pour comparer
      const oldTeacher = teachers.find(t => t.id === id)
      if (oldTeacher) {
        const allSubjectIds = new Set([
          ...(oldTeacher.speciality || []),
          ...(teacherData.speciality || [])
        ])
        
        for (const subjectId of allSubjectIds) {
          await updateSubjectTeacherCount(subjectId)
        }
      }
      
    } catch (err) {
      console.error('Erreur modification professeur:', err)
      throw err
    }
  }, [fetchTeachers, updateSubjectTeacherCount, teachers])

  const deleteTeacher = useCallback(async (id: string) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const response = await fetch(
        getApiUrl(`collections/edumali_teachers/records/${id}`),
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la suppression')

      // Récupérer les spécialités du professeur avant suppression pour mettre à jour les matières
      const teacherToDelete = teachers.find(t => t.id === id)
      setTeachers((prev) => prev.filter((t) => t.id !== id))
      
      // Mettre à jour le nombre de professeurs pour chaque matière liée
      if (teacherToDelete && teacherToDelete.speciality && teacherToDelete.speciality.length > 0) {
        for (const subjectId of teacherToDelete.speciality) {
          await updateSubjectTeacherCount(subjectId)
        }
      }
      
    } catch (err) {
      console.error('Erreur suppression professeur:', err)
      throw err
    }
  }, [updateSubjectTeacherCount, teachers])

  return {
    teachers,
    isLoading,
    error,
    fetchTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher
  }
}