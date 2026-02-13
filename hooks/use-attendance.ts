import { useState, useCallback } from 'react'
import { pb, COLLECTIONS } from '@/lib/pocketbase'

interface AttendanceRecord {
  id: string
  student_id: string
  date: string
  status: 'present' | 'absent' | 'late'
  notes?: string
  created_by: string
}

interface AttendanceData {
  studentId: string
  status: 'present' | 'absent' | 'late'
  notes?: string
}

export function useAttendance() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveAttendance = useCallback(async (
    date: string,
    classId: string,
    attendanceData: AttendanceData[]
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      // 1. D'abord, supprimer les enregistrements existants pour cette date et ces étudiants
      try {
        // Utiliser le format de date complet
        const fullDate = `${date} 00:00:00.000Z`
        let totalDeleted = 0
        
        // Supprimer les enregistrements pour chaque étudiant individuellement
        for (const studentData of attendanceData) {
          const existingRecords = await pb.collection(COLLECTIONS.ATTENDANCE).getList(1, 50, {
            filter: `date = "${fullDate}" && student_id = "${studentData.studentId}"`
          })
          
          for (const record of existingRecords.items) {
            await pb.collection(COLLECTIONS.ATTENDANCE).delete(record.id)
            totalDeleted++
          }
        }
        
        console.log(`Suppression de ${totalDeleted} enregistrements existants pour le ${date}`)
      } catch (deleteError) {
        console.warn('Aucun enregistrement existant à supprimer:', deleteError)
      }

      // 2. Créer les nouveaux enregistrements
      const fullDate = `${date} 00:00:00.000Z`
      const attendanceRecords = attendanceData.map(data => ({
        student_id: data.studentId,
        date: fullDate,
        status: data.status,
        remarks: data.notes || null,
        recorded_by: pb.authStore.record?.id || 'system'
      }))

      // 3. Sauvegarder tous les enregistrements
      const createdRecords = []
      for (const record of attendanceRecords) {
        const created = await pb.collection(COLLECTIONS.ATTENDANCE).create(record)
        createdRecords.push(created)
      }

      console.log(`${createdRecords.length} présences sauvegardées pour le ${date}`)
      return createdRecords

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde des présences'
      setError(errorMessage)
      console.error('Erreur sauvegarde présences:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getAttendanceByDate = useCallback(async (date: string, classId?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Vérifier si l'utilisateur est authentifié
      console.log("Authentification PocketBase:", pb.authStore.isValid)
      console.log("Token PocketBase:", pb.authStore.token ? "PRÉSENT" : "ABSENT")
      console.log("Utilisateur PocketBase:", pb.authStore.record)

      // La collection n'a pas de class_id, on filtre juste par date
      // Utiliser le format de date complet comme dans la base
      const fullDate = `${date} 00:00:00.000Z`
      const filter = `date = "${fullDate}"`
      console.log(`Recherche des présences avec filtre: ${filter}`)
      
      const result = await pb.collection(COLLECTIONS.ATTENDANCE).getList(1, 500, {
        filter
      })

      console.log(`Présences trouvées pour le ${date}:`, result.items)
      return result.items

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des présences'
      setError(errorMessage)
      console.error('Erreur récupération présences:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getStudentAttendanceHistory = useCallback(async (studentId: string, limit = 30) => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await pb.collection(COLLECTIONS.ATTENDANCE).getList(1, limit, {
        filter: `student_id = "${studentId}"`,
        sort: '-date',
        expand: 'class_id'
      })

      return result.items

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération de l\'historique'
      setError(errorMessage)
      console.error('Erreur récupération historique:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getAttendanceStats = useCallback(async (classId?: string, startDate?: string, endDate?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      let filter = ''
      if (classId) {
        filter = `class_id = "${classId}"`
      }
      if (startDate && endDate) {
        filter += filter ? ` && date >= "${startDate}" && date <= "${endDate}"` : `date >= "${startDate}" && date <= "${endDate}"`
      }

      const result = await pb.collection(COLLECTIONS.ATTENDANCE).getList(1, 1000, {
        filter: filter || undefined
      })

      const records = result.items
      
      // Calculer les statistiques
      const total = records.length
      const present = records.filter(r => r.status === 'present').length
      const absent = records.filter(r => r.status === 'absent').length
      const late = records.filter(r => r.status === 'late').length
      
      return {
        total,
        present,
        absent,
        late,
        attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
        records
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du calcul des statistiques'
      setError(errorMessage)
      console.error('Erreur statistiques:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    saveAttendance,
    getAttendanceByDate,
    getStudentAttendanceHistory,
    getAttendanceStats
  }
}