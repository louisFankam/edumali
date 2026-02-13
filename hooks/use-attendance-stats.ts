import { useState, useEffect } from 'react'
import { getApiUrl, getAuthToken } from '@/lib/pocketbase'

interface AttendanceStats {
  overall: number
  trend: number
  byClass: Array<{
    class: string
    rate: number
    trend: number
  }>
}

export function useAttendanceStats() {
  const [data, setData] = useState<AttendanceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAttendanceStats()
  }, [])

  const fetchAttendanceStats = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      // 1. COMPTER LE NOMBRE TOTAL D'ENREGISTREMENTS DE PRÉSENCE
      const countResponse = await fetch(
        getApiUrl('collections/edumali_attendance/records?perPage=1&fields=id'),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!countResponse.ok) throw new Error('Erreur lors du comptage des présences')

      const countData = await countResponse.json()
      const totalRecords = countData.totalItems

      // 2. RÉCUPÉRER LES DONNÉES AVEC STRATÉGIE ADAPTATIVE
      let allAttendanceRecords: any[] = []

      if (totalRecords <= 1000) {
        // Si moins de 1000 enregistrements, on récupère tout
        const response = await fetch(
          getApiUrl(`collections/edumali_attendance/records?perPage=${totalRecords}&expand=student_id.class_id`),
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (!response.ok) throw new Error('Erreur lors de la récupération des présences')

        const result = await response.json()
        allAttendanceRecords = result.items
      } else {
        // Si plus de 1000 enregistrements, on récupère les 30 derniers jours
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const formattedDate = thirtyDaysAgo.toISOString().split('T')[0]

        const response = await fetch(
          getApiUrl(`collections/edumali_attendance/records?filter=date >= '${formattedDate}'&expand=student_id.class_id`),
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (!response.ok) throw new Error('Erreur lors de la récupération des présences récentes')

        const result = await response.json()
        allAttendanceRecords = result.items
      }

      // 3. CALCULER LES STATISTIQUES
      const stats = calculateAttendanceStats(allAttendanceRecords)
      setData(stats)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      // Données mock en cas d'erreur
      setData(getMockData())
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour calculer les statistiques de présence
  const calculateAttendanceStats = (attendanceRecords: any[]): AttendanceStats => {
    if (attendanceRecords.length === 0) {
      return {
        overall: 0,
        trend: 0,
        byClass: []
      }
    }

    // Calcul du taux global de présence
    const presentRecords = attendanceRecords.filter(record => 
      record.status === 'present' || record.status === 'late'
    )
    const overallRate = Math.round((presentRecords.length / attendanceRecords.length) * 100)

    // Calcul par classe
    const classStats: Record<string, { present: number; total: number; previousRate?: number }> = {}
    const now = new Date()
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    attendanceRecords.forEach(record => {
      try {
        const className = record.expand?.student_id?.expand?.class_id?.name || 'Inconnu'
        
        if (!classStats[className]) {
          classStats[className] = { present: 0, total: 0 }
        }

        classStats[className].total++

        if (record.status === 'present' || record.status === 'late') {
          classStats[className].present++
        }

        // Calcul pour la tendance (comparaison sur 2 semaines)
        const recordDate = new Date(record.date)
        if (recordDate < twoWeeksAgo) {
          if (!classStats[className].previousRate) {
            classStats[className].previousRate = classStats[className].present / classStats[className].total
          }
        }
      } catch (error) {
        console.warn('Erreur lors du traitement d\'un enregistrement de présence:', error)
      }
    })

    // Formatage des données par classe
    const byClass = Object.entries(classStats).map(([className, stats]) => {
      const currentRate = Math.round((stats.present / stats.total) * 100)
      
      let trend = 0
      if (stats.previousRate) {
        const previousRatePercent = Math.round(stats.previousRate * 100)
        trend = currentRate - previousRatePercent
      }

      return {
        class: className,
        rate: currentRate,
        trend: trend
      }
    })

    // Calcul de la tendance globale
    const trend = calculateOverallTrend(attendanceRecords)

    return {
      overall: overallRate,
      trend: trend,
      byClass: byClass
    }
  }

  // Calcul de la tendance globale
  const calculateOverallTrend = (attendanceRecords: any[]): number => {
    const now = new Date()
    const currentWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const previousWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    const previousWeekEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    let currentWeekPresent = 0
    let currentWeekTotal = 0
    let previousWeekPresent = 0
    let previousWeekTotal = 0

    attendanceRecords.forEach(record => {
      try {
        const recordDate = new Date(record.date)
        
        if (recordDate >= currentWeekStart) {
          currentWeekTotal++
          if (record.status === 'present' || record.status === 'late') {
            currentWeekPresent++
          }
        } else if (recordDate >= previousWeekStart && recordDate < previousWeekEnd) {
          previousWeekTotal++
          if (record.status === 'present' || record.status === 'late') {
            previousWeekPresent++
          }
        }
      } catch (error) {
        console.warn('Erreur lors du calcul de tendance:', error)
      }
    })

    if (previousWeekTotal === 0 || currentWeekTotal === 0) return 0

    const currentRate = (currentWeekPresent / currentWeekTotal) * 100
    const previousRate = (previousWeekPresent / previousWeekTotal) * 100

    return Math.round((currentRate - previousRate) * 10) / 10 // 1 décimale
  }

  // Données mock en cas d'erreur
  const getMockData = (): AttendanceStats => ({
    overall: 94,
    trend: 2.1,
    byClass: [
      { class: "CP", rate: 96, trend: 1.2 },
      { class: "CE1", rate: 93, trend: -0.5 },
      { class: "CE2", rate: 95, trend: 2.3 },
      { class: "CM1", rate: 92, trend: -1.1 },
      { class: "CM2", rate: 97, trend: 3.2 },
      { class: "6ème", rate: 91, trend: 0.8 }
    ]
  })

  return { data, isLoading, error, refetch: fetchAttendanceStats }
}