import { useState, useEffect } from 'react'

interface ExamStats {
  averageScore: number
  passRate: number
  topSubjects: Array<{
    subject: string
    average: number
    students: number
    successRate: number
  }>
  recentExams: Array<{
    id: string
    name: string
    subject: string
    class: string
    average: number
    date: string
  }>
}

export function useExamStats() {
  const [data, setData] = useState<ExamStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExamStats()
  }, [])

  const fetchExamStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')
      
      // 1. COMPTER LE NOMBRE TOTAL DE NOTES
      const countResponse = await fetch(
        getApiUrl('collections/edumali_grades/records?perPage=1&fields=id'),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!countResponse.ok) throw new Error('Erreur lors du comptage des notes')

      const countData = await countResponse.json()
      const totalRecords = countData.totalItems

      // 2. STRATÉGIE ADAPTATIVE POUR LA RÉCUPÉRATION DES DONNÉES
      let allGrades: any[] = []
      
      if (totalRecords <= 2000) {
        // Si moins de 2000 notes, on récupère tout avec les expansions
        const response = await fetch(
          getApiUrl(`collections/edumali_grades/records?perPage=${totalRecords}&expand=exam_id,student_id,exam_id.subject_id,exam_id.class_id`),
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
        
        if (!response.ok) throw new Error('Erreur lors de la récupération des notes')
        
        const result = await response.json()
        allGrades = result.items
      } else {
        // Si plus de 2000 notes, on récupère l'année scolaire en cours
        const currentYear = new Date().getFullYear()
        const academicYearStart = `${currentYear}-09-01` // 1er septembre
        const academicYearEnd = `${currentYear + 1}-07-31` // 31 juillet
        
        const response = await fetch(
          `getApiUrl('collections/edumali_grades/records?filter=(exam_id.exam_date >= ')${academicYearStart}' && exam_id.exam_date <= '${academicYearEnd}')&expand=exam_id,student_id,exam_id.subject_id,exam_id.class_id&perPage=2000`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
        
        if (!response.ok) throw new Error('Erreur lors de la récupération des notes récentes')
        
        const result = await response.json()
        allGrades = result.items
      }

      // 3. CALCULER LES STATISTIQUES DES EXAMENS
      const stats = calculateExamStats(allGrades)
      setData(stats)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      // Données mock en cas d'erreur
      setData(getMockData())
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour calculer les statistiques des examens
  const calculateExamStats = (grades: any[]): ExamStats => {
    if (grades.length === 0) {
      return {
        averageScore: 0,
        passRate: 0,
        topSubjects: [],
        recentExams: []
      }
    }

    // Calcul de la moyenne générale
    const totalScore = grades.reduce((sum, grade) => sum + (grade.score || 0), 0)
    const averageScore = Math.round((totalScore / grades.length) * 10) / 10 // 1 décimale

    // Calcul du taux de réussite (note >= 10/20)
    const passingGrades = grades.filter(grade => (grade.score || 0) >= 10)
    const passRate = Math.round((passingGrades.length / grades.length) * 100)

    // Calcul par matière
    const subjectStats: Record<string, { totalScore: number; count: number; students: Set<string> }> = {}
    
    grades.forEach(grade => {
      try {
        const subjectName = grade.expand?.exam_id?.expand?.subject_id?.name || 'Matière inconnue'
        const studentId = grade.student_id
        
        if (!subjectStats[subjectName]) {
          subjectStats[subjectName] = { totalScore: 0, count: 0, students: new Set() }
        }

        subjectStats[subjectName].totalScore += grade.score || 0
        subjectStats[subjectName].count++
        subjectStats[subjectName].students.add(studentId)
      } catch (error) {
        console.warn('Erreur lors du traitement d\'une note:', error)
      }
    })

    // Formatage des données par matière
    const topSubjects = Object.entries(subjectStats)
      .map(([subjectName, stats]) => {
        const average = Math.round((stats.totalScore / stats.count) * 10) / 10
        const studentsCount = stats.students.size
        const subjectGrades = grades.filter(g => 
          g.expand?.exam_id?.expand?.subject_id?.name === subjectName
        )
        const passingSubjectGrades = subjectGrades.filter(g => (g.score || 0) >= 10)
        const successRate = Math.round((passingSubjectGrades.length / subjectGrades.length) * 100)

        return {
          subject: subjectName,
          average: average,
          students: studentsCount,
          successRate: successRate
        }
      })
      .sort((a, b) => b.average - a.average)
      .slice(0, 10) // Top 10 des matières

    // Récupération des examens récents
    const recentExams = getRecentExams(grades)

    return {
      averageScore: averageScore,
      passRate: passRate,
      topSubjects: topSubjects,
      recentExams: recentExams
    }
  }

  // Fonction pour récupérer les examens récents
  const getRecentExams = (grades: any[]): any[] => {
    const examMap: Record<string, any> = {}
    
    grades.forEach(grade => {
      try {
        const exam = grade.expand?.exam_id
        if (exam && exam.id && !examMap[exam.id]) {
          // Calculer la moyenne de cet examen
          const examGrades = grades.filter(g => g.exam_id === exam.id)
          const examTotal = examGrades.reduce((sum, g) => sum + (g.score || 0), 0)
          const examAverage = Math.round((examTotal / examGrades.length) * 10) / 10

          examMap[exam.id] = {
            id: exam.id,
            name: exam.name,
            subject: exam.expand?.subject_id?.name || 'Matière inconnue',
            class: exam.expand?.class_id?.name || 'Classe inconnue',
            average: examAverage,
            date: exam.exam_date
          }
        }
      } catch (error) {
        console.warn('Erreur lors du traitement d\'un examen:', error)
      }
    })

    return Object.values(examMap)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5) // 5 examens les plus récents
  }

  // Données mock en cas d'erreur
  const getMockData = (): ExamStats => ({
    averageScore: 14.2,
    passRate: 78,
    topSubjects: [
      { 
        subject: "Mathématiques", 
        average: 15.8, 
        students: 156,
        successRate: 85
      },
      { 
        subject: "Français", 
        average: 14.5, 
        students: 156,
        successRate: 78
      },
      { 
        subject: "Sciences", 
        average: 13.9, 
        students: 156,
        successRate: 72
      },
      { 
        subject: "Histoire-Géo", 
        average: 13.2, 
        students: 156,
        successRate: 68
      }
    ],
    recentExams: [
      {
        id: "1",
        name: "Composition Trimestre 1",
        subject: "Mathématiques",
        class: "6ème A",
        average: 14.5,
        date: "2024-10-15"
      },
      {
        id: "2",
        name: "Test de Français",
        subject: "Français", 
        class: "5ème B",
        average: 13.2,
        date: "2024-10-10"
      }
    ]
  })

  return { data, isLoading, error, refetch: fetchExamStats }
}