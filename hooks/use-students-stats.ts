import { useState, useEffect } from 'react'
import { pb, COLLECTIONS } from '@/lib/pocketbase'

interface StudentStats {
  total: number
  newThisMonth: number
  growth: number
  byClass: Array<{
    class: string
    name: string
    count: number
    capacity: number
    percentage: number
  }>
}

export function useStudentsStats() {
  const [data, setData] = useState<StudentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudentsStats()
  }, [])

  const fetchStudentsStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 1. D'ABORD, COMPTER LE NOMBRE TOTAL (sans tout charger)
      const countData = await pb.collection(COLLECTIONS.STUDENTS).getList(1, 1)
      const totalStudents = countData.totalItems

      // 2. ENSUITE, RÉCUPÉRER UN ÉCHANTILLON POUR LES CALCULS DÉTAILLÉS
      let allStudents: any[] = []
      
      if (totalStudents <= 500) {
        // Si moins de 500 étudiants, on récupère tout
        const result = await pb.collection(COLLECTIONS.STUDENTS).getList(1, totalStudents)
        allStudents = result.items
      } else {
        // Si plus de 500 étudiants, on utilise une approche différente
        allStudents = await fetchAllStudentsWithPagination(totalStudents)
      }

      // 3. CALCULER LES STATS
      const stats = await calculateStudentsStats(allStudents, totalStudents)
      setData(stats)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      // Ne plus utiliser de données mock, simplement afficher l'erreur
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour gérer la pagination si beaucoup d'étudiants
  const fetchAllStudentsWithPagination = async (totalStudents: number): Promise<any[]> => {
    const allStudents: any[] = []
    const pageSize = 200 // Nombre d'étudiants par page
    const totalPages = Math.ceil(totalStudents / pageSize)

    for (let page = 1; page <= totalPages; page++) {
      const result = await pb.collection(COLLECTIONS.STUDENTS).getList(page, pageSize)
      allStudents.push(...result.items)
    }

    return allStudents
  }

  // Fonction pour calculer les stats
  const calculateStudentsStats = async (students: any[], total: number): Promise<StudentStats> => {
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()
    
    // Calculer les nouveaux étudiants ce mois-ci
    const newThisMonth = students.filter(student => {
      if (!student.enrollment_date) return false
      try {
        const enrolledDate = new Date(student.enrollment_date)
        return enrolledDate.getMonth() === thisMonth && 
               enrolledDate.getFullYear() === thisYear
      } catch {
        return false
      }
    }).length

    // Calculer la répartition par classe
    const classCounts: Record<string, number> = {}
    
    students.forEach(student => {
      const classId = student.class_id || 'Inconnu'
      classCounts[classId] = (classCounts[classId] || 0) + 1
    })

    // Récupérer les noms des classes depuis PocketBase
    const classNames: Record<string, string> = {}
    const classIds = Object.keys(classCounts).filter(id => id !== 'Inconnu')
    
    if (classIds.length > 0) {
      try {
        const classes = await pb.collection(COLLECTIONS.CLASSES).getList(1, 50, {
          filter: classIds.map(id => `id = "${id}"`).join(' || ')
        })
        classes.items.forEach(cls => {
          classNames[cls.id] = cls.name
        })
      } catch (error) {
        console.error('Erreur lors de la récupération des noms de classes:', error)
      }
    }

    const byClassPromises = Object.entries(classCounts).map(async ([classId, count]) => {
      const capacity = await getClassCapacity(classId)
      return {
        class: classId,
        name: classId === 'Inconnu' ? 'Inconnu' : classNames[classId] || classId,
        count: count,
        capacity: capacity,
        percentage: Math.round((count / capacity) * 100)
      }
    })

    const byClass = await Promise.all(byClassPromises)

    return {
      total,
      newThisMonth,
      growth: calculateGrowth(students), // Fonction helper pour la croissance
      byClass
    }
  }

  // Helper function pour la capacité des classes
  const getClassCapacity = async (classId: string): Promise<number> => {
    if (classId === 'Inconnu') return 30
    
    try {
      const classData = await pb.collection(COLLECTIONS.CLASSES).getFirstListItem(`id = "${classId}"`)
      return classData.capacity || 30
    } catch (error) {
      console.error('Erreur lors de la récupération de la capacité de la classe:', error)
      return 30 // Capacité par défaut
    }
  }

  // Helper function pour calculer la croissance
  const calculateGrowth = (students: any[]): number => {
    // Implémentation simplifiée - à adapter
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    
    const newThisMonth = students.filter(student => {
      if (!student.enrollment_date) return false
      const enrolledDate = new Date(student.enrollment_date)
      return enrolledDate.getMonth() === now.getMonth() && 
             enrolledDate.getFullYear() === now.getFullYear()
    }).length

    const newLastMonth = students.filter(student => {
      if (!student.enrollment_date) return false
      const enrolledDate = new Date(student.enrollment_date)
      return enrolledDate.getMonth() === lastMonth.getMonth() && 
             enrolledDate.getFullYear() === lastMonth.getFullYear()
    }).length

    if (newLastMonth === 0) return newThisMonth > 0 ? 100 : 0
    
    return Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100)
  }

  
  return { data, isLoading, error, refetch: fetchStudentsStats }
}