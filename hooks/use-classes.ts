// hooks/use-classes.ts
import { useState, useCallback } from "react"

export interface Class {
  id: string
  name: string
  level: string
  capacity: number
  current_students: number
  total_fee: number
  teacher_id: string
  teacher_name?: string
  color: string
  academic_year: string
  status: string
  subjects?: string[]
}

interface PocketBaseClass {
  id: string
  name: string
  level: string
  capacity: number
  current_students: number
  total_fee: number
  teacher_id: string
  color: string
  academic_year: string
  status: string
  expand?: {
    teacher_id?: {
      full_name: string
    }
  }
}

export const useClasses = () => {
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchClasses = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')
      
      const response = await fetch(
        getApiUrl('collections/edumali_classes/records?expand=teacher_id&perPage=200'),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la récupération des classes')

      const result = await response.json()
      
      console.log('Classes brutes:', result.items)
      
      const transformedClasses: Class[] = result.items.map((item: PocketBaseClass) => {
        console.log(`Classe ${item.name}:`, {
          teacher_id: item.teacher_id,
          expand_data: item.expand?.teacher_id
        })
        
        // Si c'est une relation expandée, construire le nom complet à partir de first_name et last_name
        // Sinon, vérifier si c'est un email et utiliser l'email comme nom
        let teacherName = 'Non assigné'
        if (item.expand?.teacher_id?.first_name && item.expand?.teacher_id?.last_name) {
          teacherName = `${item.expand.teacher_id.first_name} ${item.expand.teacher_id.last_name}`
        } else if (item.expand?.teacher_id?.first_name) {
          teacherName = item.expand.teacher_id.first_name
        } else if (item.teacher_id && item.teacher_id.includes('@')) {
          teacherName = item.teacher_id
        }
        
        return {
          id: item.id,
          name: item.name,
          level: item.level,
          capacity: item.capacity,
          current_students: item.current_students,
          total_fee: item.total_fee,
          teacher_id: item.teacher_id,
          teacher_name: teacherName,
          color: item.color,
          academic_year: item.academic_year,
          status: item.status || 'active'
        }
      })

      setClasses(transformedClasses)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur classes:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createClass = useCallback(async (classData: Omit<Class, "id">) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const pocketbaseData = {
        name: classData.name,
        level: classData.level,
        capacity: classData.capacity,
        current_students: classData.current_students || 0,
        total_fee: classData.total_fee,
        teacher_id: classData.teacher_id,
        color: classData.color,
        academic_year: classData.academic_year,
        status: classData.status !== undefined ? (classData.status === 'active' ? true : false) : true
      }

      const response = await fetch(
        getApiUrl('collections/edumali_classes/records'),
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

      await fetchClasses()
      
    } catch (err) {
      console.error('Erreur création classe:', err)
      throw err
    }
  }, [fetchClasses])

  const updateClass = useCallback(async (id: string, classData: Partial<Class>) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const pocketbaseData = {
        name: classData.name,
        level: classData.level,
        capacity: classData.capacity,
        current_students: classData.current_students,
        total_fee: classData.total_fee,
        teacher_id: classData.teacher_id,
        color: classData.color,
        academic_year: classData.academic_year,
        status: classData.status === 'active' ? 'active' : 'inactive'
      }

      const response = await fetch(
        getApiUrl(`collections/edumali_classes/records/${id}`),
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

      await fetchClasses()
      
    } catch (err) {
      console.error('Erreur modification classe:', err)
      throw err
    }
  }, [fetchClasses])

  const deleteClass = useCallback(async (id: string) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const response = await fetch(
        getApiUrl(`collections/edumali_classes/records/${id}`),
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la suppression')

      setClasses((prev) => prev.filter((c) => c.id !== id))
      
    } catch (err) {
      console.error('Erreur suppression classe:', err)
      throw err
    }
  }, [])

  const incrementClassStudents = useCallback(async (classId: string) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      // Récupérer la classe actuelle pour connaître le nombre actuel d'élèves
      const response = await fetch(
        getApiUrl(`collections/edumali_classes/records/${classId}`),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la récupération de la classe')

      const currentClass = await response.json()
      const currentStudents = currentClass.current_students || 0

      // Mettre à jour le compteur
      const updateResponse = await fetch(
        getApiUrl(`collections/edumali_classes/records/${classId}`),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            current_students: currentStudents + 1
          })
        }
      )

      if (!updateResponse.ok) {
        throw new Error('Erreur lors de la mise à jour du compteur')
      }

      // Mettre à jour le state local
      setClasses(prev => prev.map(c => 
        c.id === classId 
          ? { ...c, current_students: currentStudents + 1 }
          : c
      ))

    } catch (err) {
      console.error('Erreur incrémentation élèves:', err)
      throw err
    }
  }, [])

  const decrementClassStudents = useCallback(async (classId: string) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      // Récupérer la classe actuelle
      const response = await fetch(
        getApiUrl(`collections/edumali_classes/records/${classId}`),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la récupération de la classe')

      const currentClass = await response.json()
      const currentStudents = currentClass.current_students || 0

      // Décrémenter sans aller en dessous de 0
      const newCount = Math.max(0, currentStudents - 1)

      const updateResponse = await fetch(
        getApiUrl(`collections/edumali_classes/records/${classId}`),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            current_students: newCount
          })
        }
      )

      if (!updateResponse.ok) {
        throw new Error('Erreur lors de la mise à jour du compteur')
      }

      // Mettre à jour le state local
      setClasses(prev => prev.map(c => 
        c.id === classId 
          ? { ...c, current_students: newCount }
          : c
      ))

    } catch (err) {
      console.error('Erreur décrémentation élèves:', err)
      throw err
    }
  }, [])

  const syncClassCounters = useCallback(async () => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')
      
      // Récupérer toutes les classes
      const classesResponse = await fetch(
        getApiUrl('collections/edumali_classes/records?perPage=200'),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!classesResponse.ok) throw new Error('Erreur lors de la récupération des classes')
      const classesData = await classesResponse.json()

      // Pour chaque classe, compter les étudiants réels
      for (const classItem of classesData.items) {
        const studentsResponse = await fetch(
          `getApiUrl('collections/edumali_students/records?filter=class_id="${classItem.id}"&perPage=1000`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json()
          const actualCount = studentsData.totalItems || 0
          
          // Mettre à jour le compteur si nécessaire
          if (actualCount !== classItem.current_students) {
            const updateResponse = await fetch(
              getApiUrl(`collections/edumali_classes/records/${classItem.id}`),
              {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  current_students: actualCount
                })
              }
            )

            if (updateResponse.ok) {
              console.log(`Compteur synchronisé pour ${classItem.name}: ${classItem.current_students} → ${actualCount}`)
            }
          }
        }
      }

      // Rafraîchir les données locales
      await fetchClasses()
      
    } catch (err) {
      console.error('Erreur synchronisation compteurs:', err)
      throw err
    }
  }, [fetchClasses])

  return {
    classes,
    isLoading,
    error,
    fetchClasses,
    createClass,
    updateClass,
    deleteClass,
    incrementClassStudents,
    decrementClassStudents,
    syncClassCounters
  }
}