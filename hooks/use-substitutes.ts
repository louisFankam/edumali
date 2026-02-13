import { useState, useCallback } from 'react'
import { pb, COLLECTIONS } from '@/lib/pocketbase'

interface Substitute {
  id: string
  first_name: string
  last_name: string
  subject_id: string[]
  subject_names: string[]
  phone: string
  email: string
  address: string
  hourly_rate: number
  status: 'available' | 'busy'
  created: string
  updated: string
}

interface SubstituteFormData {
  first_name: string
  last_name: string
  subject_id: string[]
  phone: string
  email: string
  address: string
  hourly_rate: number
  status: 'available' | 'busy'
}

export function useSubstitutes() {
  const [substitutes, setSubstitutes] = useState<Substitute[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSubstitutes = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await pb.collection(COLLECTIONS.TEACHERS_SUBSTITUTE).getList(1, 100, {
        expand: 'subject_id',
        sort: '-created'
      })

      const substitutesWithDetails: Substitute[] = result.items.map((item: any) => ({
        id: item.id,
        first_name: item.first_name,
        last_name: item.last_name,
        subject_id: item.subject_id || [],
        subject_names: item.expand?.subject_id?.map((subject: any) => subject.name) || [],
        phone: item.phone,
        email: item.email,
        address: item.address,
        hourly_rate: item.hourly_rate,
        status: item.status,
        created: item.created,
        updated: item.updated
      }))

      setSubstitutes(substitutesWithDetails)
      return substitutesWithDetails
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des remplaçants'
      setError(errorMessage)
      console.error('Erreur récupération remplaçants:', err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createSubstitute = useCallback(async (data: SubstituteFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      const substituteData = {
        first_name: data.first_name,
        last_name: data.last_name,
        subject_id: data.subject_id,
        phone: data.phone,
        email: data.email,
        address: data.address,
        hourly_rate: data.hourly_rate,
        status: data.status
      }

      const created = await pb.collection(COLLECTIONS.TEACHERS_SUBSTITUTE).create(substituteData)
      
      // Recharger la liste pour avoir les données complètes avec les relations
      await fetchSubstitutes()
      
      return created
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du remplaçant'
      setError(errorMessage)
      console.error('Erreur création remplaçant:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [fetchSubstitutes])

  const updateSubstitute = useCallback(async (id: string, data: Partial<SubstituteFormData>) => {
    try {
      setIsLoading(true)
      setError(null)

      const updated = await pb.collection(COLLECTIONS.TEACHERS_SUBSTITUTE).update(id, data)
      
      // Recharger la liste pour avoir les données complètes
      await fetchSubstitutes()
      
      return updated
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du remplaçant'
      setError(errorMessage)
      console.error('Erreur mise à jour remplaçant:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [fetchSubstitutes])

  const deleteSubstitute = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)

      await pb.collection(COLLECTIONS.TEACHERS_SUBSTITUTE).delete(id)
      
      // Retirer de la liste locale
      setSubstitutes(prev => prev.filter(sub => sub.id !== id))
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du remplaçant'
      setError(errorMessage)
      console.error('Erreur suppression remplaçant:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getStatusDisplay = useCallback((status: 'available' | 'busy') => {
    return status === 'available' ? 'Disponible' : 'En remplacement'
  }, [])

  return {
    substitutes,
    isLoading,
    error,
    fetchSubstitutes,
    createSubstitute,
    updateSubstitute,
    deleteSubstitute,
    getStatusDisplay
  }
}