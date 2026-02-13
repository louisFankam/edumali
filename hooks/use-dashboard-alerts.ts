import { useState, useEffect } from 'react'
import { pb, COLLECTIONS } from '@/lib/pocketbase'

export interface DashboardAlert {
  id: string
  type: 'payment' | 'attendance' | 'exam' | 'general'
  title: string
  description: string
  count?: number
  amount?: number
  urgency: 'high' | 'medium' | 'low'
  link: string
}

export function useDashboardAlerts() {
  const [alerts, setAlerts] = useState<DashboardAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Récupérer les données pour les alertes
      const [paymentsData, attendanceData, examsData] = await Promise.all([
        fetchPaymentAlerts(),
        fetchAttendanceAlerts(),
        fetchExamAlerts()
      ])

      const allAlerts: DashboardAlert[] = [
        ...paymentsData,
        ...attendanceData,
        ...examsData
      ].filter(alert => (alert.count ?? 0) > 0 || (alert.amount ?? 0) > 0)

      setAlerts(allAlerts)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      // Ne plus utiliser de données mock, simplement afficher l'erreur
      setAlerts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Alertes pour les paiements en retard
  const fetchPaymentAlerts = async (): Promise<DashboardAlert[]> => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const result = await pb.collection(COLLECTIONS.PAYMENTS).getList(1, 100, {
        filter: `(status = 'overdue' || status = 'partial') && due_date <= '${today}'`
      })

      const overduePayments = result.items || []

      const totalAmount = overduePayments.reduce((sum: number, payment: any) => 
        sum + (payment.amount - (payment.paid_amount || 0)), 0)

      if (overduePayments.length === 0) return []

      return [{
        id: 'payment-alert',
        type: 'payment',
        title: 'Paiements en retard',
        description: `${overduePayments.length} paiement(s) en retard`,
        count: overduePayments.length,
        amount: totalAmount,
        urgency: overduePayments.length > 5 ? 'high' : 'medium',
        link: '/finances?filter=overdue'
      }]

    } catch (error) {
      console.error('Erreur alertes paiements:', error)
      return []
    }
  }

  // Alertes pour les absences
  const fetchAttendanceAlerts = async (): Promise<DashboardAlert[]> => {
    try {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      const formattedDate = threeDaysAgo.toISOString().split('T')[0]

      const result = await pb.collection(COLLECTIONS.ATTENDANCE).getList(1, 200, {
        filter: `date >= '${formattedDate}' && status = 'absent'`,
        expand: 'student_id'
      })

      const absences = result.items || []

      // Compter les élèves absents depuis 3+ jours
      const longTermAbsences = absences.filter((absence: any) => {
        const absenceDate = new Date(absence.date)
        const daysDiff = Math.floor((new Date().getTime() - absenceDate.getTime()) / (1000 * 3600 * 24))
        return daysDiff >= 3
      })

      // Grouper par étudiant
      const studentsWithLongAbsence = new Set(
        longTermAbsences.map((absence: any) => absence.student_id)
      )

      if (studentsWithLongAbsence.size === 0) return []

      return [{
        id: 'attendance-alert',
        type: 'attendance',
        title: 'Absences non justifiées',
        description: `${studentsWithLongAbsence.size} élève(s) absent(s) depuis 3+ jours`,
        count: studentsWithLongAbsence.size,
        urgency: studentsWithLongAbsence.size > 3 ? 'high' : 'medium',
        link: '/attendance?filter=long_absence'
      }]

    } catch (error) {
      console.error('Erreur alertes absences:', error)
      return []
    }
  }

  // Alertes pour les examens à venir
  const fetchExamAlerts = async (): Promise<DashboardAlert[]> => {
    try {
      const today = new Date()
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)

      const result = await pb.collection(COLLECTIONS.EXAMS).getList(1, 50, {
        filter: `exam_date >= '${today.toISOString().split('T')[0]}' && exam_date <= '${nextWeek.toISOString().split('T')[0]}'`
      })

      const upcomingExams = result.items || []

      if (upcomingExams.length === 0) return []

      return [{
        id: 'exam-alert',
        type: 'exam',
        title: 'Examens à venir',
        description: `${upcomingExams.length} examen(s) cette semaine`,
        count: upcomingExams.length,
        urgency: 'medium',
        link: '/exams?filter=upcoming'
      }]

    } catch (error) {
      console.error('Erreur alertes examens:', error)
      return []
    }
  }

  
  return {
    alerts,
    isLoading,
    error,
    refetch: fetchAlerts
  }
}