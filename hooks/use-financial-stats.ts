import { useState, useEffect } from 'react'

interface FinancialStats {
  totalRevenue: number
  monthlyAverage: number
  growth: number
  outstandingPayments: number
  paymentRate: number
  recentPayments: Array<{
    id: string
    student_name: string
    amount: number
    paid_amount: number
    status: string
    due_date: string
  }>
}

export function useFinancialStats() {
  const [data, setData] = useState<FinancialStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFinancialStats()
  }, [])

  const fetchFinancialStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')
      
      // 1. COMPTER LE NOMBRE TOTAL DE PAIEMENTS
      const countResponse = await fetch(
        getApiUrl('collections/edumali_payments/records?perPage=1&fields=id'),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!countResponse.ok) throw new Error('Erreur lors du comptage des paiements')

      const countData = await countResponse.json()
      const totalRecords = countData.totalItems

      // 2. STRATÉGIE ADAPTATIVE POUR LA RÉCUPÉRATION DES DONNÉES
      let allPayments: any[] = []
      
      if (totalRecords <= 1000) {
        // Si moins de 1000 paiements, on récupère tout avec les expansions
        const response = await fetch(
          getApiUrl(`collections/edumali_payments/records?perPage=${totalRecords}&expand=student_id`),
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
        
        if (!response.ok) throw new Error('Erreur lors de la récupération des paiements')
        
        const result = await response.json()
        allPayments = result.items
      } else {
        // Si plus de 1000 paiements, on récupère les 12 derniers mois
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
        
        const formattedDate = oneYearAgo.toISOString().split('T')[0]
        
        const response = await fetch(
          `getApiUrl('collections/edumali_payments/records?filter=payment_date >= ')${formattedDate}' OR due_date >= '${formattedDate}'&expand=student_id&perPage=1000`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
        
        if (!response.ok) throw new Error('Erreur lors de la récupération des paiements récents')
        
        const result = await response.json()
        allPayments = result.items
      }

      // 3. CALCULER LES STATISTIQUES FINANCIÈRES
      const stats = calculateFinancialStats(allPayments, totalRecords)
      setData(stats)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      // Données mock en cas d'erreur
      setData(getMockData())
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour calculer les statistiques financières
  const calculateFinancialStats = (payments: any[], totalRecords: number): FinancialStats => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    
    // Filtres pour les différentes périodes
    const currentYearPayments = payments.filter(payment => {
      if (!payment.payment_date) return false
      try {
        const paymentDate = new Date(payment.payment_date)
        return paymentDate.getFullYear() === currentYear
      } catch {
        return false
      }
    })

    const lastMonthPayments = payments.filter(payment => {
      if (!payment.payment_date) return false
      try {
        const paymentDate = new Date(payment.payment_date)
        return paymentDate.getFullYear() === currentYear && 
               paymentDate.getMonth() === currentMonth - 1
      } catch {
        return false
      }
    })

    const currentMonthPayments = payments.filter(payment => {
      if (!payment.payment_date) return false
      try {
        const paymentDate = new Date(payment.payment_date)
        return paymentDate.getFullYear() === currentYear && 
               paymentDate.getMonth() === currentMonth
      } catch {
        return false
      }
    })

    // Calcul du revenu total (seulement les paiements complétés)
    const totalRevenue = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, payment) => sum + (payment.paid_amount || 0), 0)

    // Calcul de la moyenne mensuelle sur les 12 derniers mois
    const monthlyRevenue = calculateMonthlyRevenue(payments, currentYear)
    const monthlyAverage = monthlyRevenue.length > 0 
      ? monthlyRevenue.reduce((sum, revenue) => sum + revenue, 0) / monthlyRevenue.length 
      : 0

    // Calcul de la croissance
    const growth = calculateRevenueGrowth(currentMonthPayments, lastMonthPayments)

    // Calcul des impayés
    const outstandingPayments = payments
      .filter(p => p.status === 'partial' || p.status === 'overdue')
      .reduce((sum, payment) => sum + (payment.amount - (payment.paid_amount || 0)), 0)

    // Taux de paiement
    const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const totalPaid = payments.reduce((sum, payment) => sum + (payment.paid_amount || 0), 0)
    const paymentRate = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0

    // Paiements récents pour affichage
    const recentPayments = payments
      .filter(p => p.payment_date)
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
      .slice(0, 10)
      .map(payment => ({
        id: payment.id,
        student_name: payment.expand?.student_id?.full_name || 'Élève inconnu',
        amount: payment.amount,
        paid_amount: payment.paid_amount,
        status: payment.status,
        due_date: payment.due_date
      }))

    return {
      totalRevenue: Math.round(totalRevenue),
      monthlyAverage: Math.round(monthlyAverage),
      growth: growth,
      outstandingPayments: Math.round(outstandingPayments),
      paymentRate: paymentRate,
      recentPayments: recentPayments
    }
  }

  // Calcul du revenu mensuel
  const calculateMonthlyRevenue = (payments: any[], year: number): number[] => {
    const monthlyRevenue: number[] = new Array(12).fill(0)
    
    payments
      .filter(p => p.status === 'paid' && p.payment_date)
      .forEach(payment => {
        try {
          const paymentDate = new Date(payment.payment_date)
          if (paymentDate.getFullYear() === year) {
            const month = paymentDate.getMonth()
            monthlyRevenue[month] += payment.paid_amount || 0
          }
        } catch (error) {
          console.warn('Erreur lors du calcul du revenu mensuel:', error)
        }
      })

    return monthlyRevenue.filter(amount => amount > 0)
  }

  // Calcul de la croissance des revenus
  const calculateRevenueGrowth = (currentMonthPayments: any[], lastMonthPayments: any[]): number => {
    const currentMonthRevenue = currentMonthPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, payment) => sum + (payment.paid_amount || 0), 0)

    const lastMonthRevenue = lastMonthPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, payment) => sum + (payment.paid_amount || 0), 0)

    if (lastMonthRevenue === 0) return currentMonthRevenue > 0 ? 100 : 0

    return Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 * 10) / 10 // 1 décimale
  }

  // Données mock en cas d'erreur
  const getMockData = (): FinancialStats => ({
    totalRevenue: 45000000,
    monthlyAverage: 3750000,
    growth: 8.5,
    outstandingPayments: 3200000,
    paymentRate: 87,
    recentPayments: [
      {
        id: "1",
        student_name: "Moussa Diarra",
        amount: 15000,
        paid_amount: 15000,
        status: "paid",
        due_date: "2024-01-15"
      },
      {
        id: "2", 
        student_name: "Aïcha Traoré",
        amount: 15000,
        paid_amount: 10000,
        status: "partial",
        due_date: "2024-01-10"
      }
    ]
  })

  return { data, isLoading, error, refetch: fetchFinancialStats }
}