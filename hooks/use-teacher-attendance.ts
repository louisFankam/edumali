// hooks/use-teacher-attendance.ts
import { useState, useCallback } from "react"

interface TeacherAttendanceRecord {
  id: string
  teacher_id: string
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  remarks?: string
  recorded_by: string
  created: string
  updated: string
}

interface TeacherAttendanceData {
  teacherId: string
  status: 'present' | 'absent' | 'late' | 'excused'
  remarks?: string
}

interface TeacherAttendanceWithDetails extends TeacherAttendanceRecord {
  teacher_first_name: string
  teacher_last_name: string
  teacher_full_name: string
  teacher_photo?: string
  teacher_speciality_names: string[]
}

export const useTeacherAttendance = () => {
  const [attendance, setAttendance] = useState<TeacherAttendanceWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAttendanceByDate = useCallback(async (date: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')
      
      // Utiliser le format de date complet comme dans la base
      const fullDate = `${date} 00:00:00.000Z`

      const response = await fetch(
        `getApiUrl('collections/edumali_teachers_attendance/records?filter=date = "${fullDate}"`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des présences')
      }

      const result = await response.json()
      console.log("Présences professeurs chargées:", result.items.length, "enregistrements")
      
      const attendanceWithDetails: TeacherAttendanceWithDetails[] = result.items.map((record: any) => ({
        id: record.id,
        teacher_id: record.teacher_id,
        date: record.date,
        status: record.status,
        remarks: record.remarks,
        recorded_by: record.recorded_by,
        created: record.created,
        updated: record.updated,
        teacher_first_name: record.expand?.teacher_id?.first_name || "Inconnu",
        teacher_last_name: record.expand?.teacher_id?.last_name || "Inconnu",
        teacher_full_name: record.expand?.teacher_id ? 
          `${record.expand.teacher_id.first_name} ${record.expand.teacher_id.last_name}` : 
          "Inconnu",
        teacher_photo: record.expand?.teacher_id?.photo,
        teacher_speciality_names: record.expand?.teacher_id?.expand?.speciality?.map((s: any) => s.name) || []
      }))

      setAttendance(attendanceWithDetails)
      return attendanceWithDetails
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur présence professeurs:', err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveTeacherAttendance = useCallback(async (
    date: string,
    attendanceData: TeacherAttendanceData[]
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      // 1. D'abord, supprimer les enregistrements existants pour cette date
      try {
        const fullDate = `${date} 00:00:00.000Z`
        let totalDeleted = 0
        
        for (const teacherData of attendanceData) {
          const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

          const existingRecords = await fetch(
            `getApiUrl('collections/edumali_teachers_attendance/records?filter=date = "${fullDate}" && teacher_id = "${teacherData.teacherId}"`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          )

          if (!existingRecords.ok) throw new Error('Erreur lors de la recherche des enregistrements existants')

          const result = await existingRecords.json()
          
          for (const record of result.items) {
            const deleteResponse = await fetch(
              `getApiUrl('collections/edumali_teachers_attendance/records/${record.id}`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            )
            
            if (!deleteResponse.ok) throw new Error('Erreur lors de la suppression')
            totalDeleted++
          }
        }
        
        console.log(`Suppression de ${totalDeleted} enregistrements existants pour le ${date}`)
      } catch (deleteError) {
        console.warn('Aucun enregistrement existant à supprimer:', deleteError)
      }

      // 2. Créer les nouveaux enregistrements
      const authData = localStorage.getItem('pocketbase_auth')
      if (!authData) throw new Error('Non authentifié')
      const { record } = JSON.parse(authData)
      const token = getAuthToken()
      const fullDate = `${date} 00:00:00.000Z`
      
      const attendanceRecords = attendanceData.map(data => ({
        teacher_id: data.teacherId,
        date: fullDate,
        status: data.status,
        remarks: data.remarks || null,
        recorded_by: record?.id || 'system'
      }))

      // 3. Sauvegarder tous les enregistrements
      const createdRecords = []
      for (const record of attendanceRecords) {
        const response = await fetch(
          getApiUrl('collections/edumali_teachers_attendance/records'),
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(record)
          }
        )

        if (!response.ok) throw new Error('Erreur lors de la création')
        
        const created = await response.json()
        createdRecords.push(created)
      }

      console.log(`${createdRecords.length} présences de professeurs sauvegardées pour le ${date}`)
      return createdRecords

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde des présences'
      setError(errorMessage)
      console.error('Erreur sauvegarde présences professeurs:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getTeacherAttendanceHistory = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      let filter = ""
      if (startDate && endDate) {
        filter = `date >= "${startDate} 00:00:00.000Z" && date <= "${endDate} 23:59:59.999Z"`
      }

      const response = await fetch(
        `getApiUrl('collections/edumali_teachers_attendance/records${filter ? ')?filter=' + encodeURIComponent(filter) + '&perPage=200' : '?perPage=200'}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'historique')
      }

      const result = await response.json()
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

  const getAttendanceStats = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      let filter = ""
      if (startDate && endDate) {
        filter = `date >= "${startDate} 00:00:00.000Z" && date <= "${endDate} 23:59:59.999Z"`
      }

      const response = await fetch(
        `getApiUrl('collections/edumali_teachers_attendance/records${filter ? ')?filter=' + encodeURIComponent(filter) + '&perPage=500' : '?perPage=500'}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques')
      }

      const result = await response.json()
      const records = result.items

      const total = records.length
      const present = records.filter((r: any) => r.status === 'present').length
      const absent = records.filter((r: any) => r.status === 'absent').length
      const late = records.filter((r: any) => r.status === 'late').length
      const excused = records.filter((r: any) => r.status === 'excused').length

      return {
        total,
        present,
        absent,
        late,
        excused,
        attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur statistiques présence professeurs:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    attendance,
    isLoading,
    error,
    fetchAttendanceByDate,
    saveTeacherAttendance,
    getTeacherAttendanceHistory,
    getAttendanceStats
  }
}