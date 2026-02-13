// hooks/use-salaries.ts
import { useState, useCallback } from 'react'
import { pb, COLLECTIONS , getApiUrl, getAuthToken} from '@/lib/pocketbase'

interface TeacherSalary {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  gender: string
  photo: string
  contrat: 'horaire' | 'mensuel'
  salary: number
  hours_worked: number
  majoration: number
  speciality: string[]
  speciality_names: string[]
  status: string
  created: string
  updated: string
  type: 'titulaire' | 'remplaçant'
}

interface SubstituteSalary {
  id: string
  first_name: string
  last_name: string
  subject_id: string[]
  subject_names: string[]
  phone: string
  email: string
  address: string
  hourly_rate: number
  hours_worked: number
  majoration: number
  status: string
  created: string
  updated: string
  type: 'titulaire' | 'remplaçant'
}

export function useSalaries() {
  const [salaries, setSalaries] = useState<(TeacherSalary | SubstituteSalary)[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSalaries = useCallback(async (month?: string, statusFilter: 'all' | 'titulaire' | 'remplaçant' = 'all') => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('pocketbase_auth')
      if (!token) {
        throw new Error('Non authentifié')
      }
      
      const { token: authToken } = JSON.parse(token)
      
      // Récupérer les professeurs actifs avec leurs matières
      const teachersResponse = await fetch(
        `getApiUrl('collections/${COLLECTIONS.TEACHERS}/records?filter=status=')active'&expand=speciality&perPage=200`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      )
      
      // Récupérer les remplaçants busy avec leurs matières
      const substitutesResponse = await fetch(
        `getApiUrl('collections/${COLLECTIONS.TEACHERS_SUBSTITUTE}/records?filter=status=')busy'&expand=subject_id&perPage=200`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      )
      
      if (!teachersResponse.ok || !substitutesResponse.ok) {
        throw new Error('Erreur lors de la récupération des données')
      }
      
      const teachersResult = await teachersResponse.json()
      const substitutesResult = await substitutesResponse.json()
      
      // Transformer les données des professeurs
      const teacherSalaries: TeacherSalary[] = teachersResult.items.map((teacher: any) => ({
        id: teacher.id,
        first_name: teacher.first_name,
        last_name: teacher.last_name,
        email: teacher.email,
        phone: teacher.phone,
        address: teacher.address,
        gender: teacher.gender,
        photo: teacher.photo,
        contrat: teacher.contrat,
        salary: teacher.salary || 0,
        hours_worked: teacher.hours_worked || 0,
        majoration: teacher.majoration || 0,
        speciality: teacher.speciality || [],
        speciality_names: teacher.expand?.speciality?.map((subject: any) => subject.name) || [],
        status: teacher.status,
        created: teacher.created,
        updated: teacher.updated,
        type: 'titulaire'
      }))
      
      // Transformer les données des remplaçants
      const substituteSalaries: SubstituteSalary[] = substitutesResult.items.map((substitute: any) => ({
        id: substitute.id,
        first_name: substitute.first_name,
        last_name: substitute.last_name,
        subject_id: substitute.subject_id || [],
        subject_names: substitute.expand?.subject_id?.map((subject: any) => subject.name) || [],
        phone: substitute.phone,
        email: substitute.email,
        address: substitute.address,
        hourly_rate: substitute.hourly_rate,
        hours_worked: substitute.hours_worked || 0,
        majoration: substitute.majoration || 0,
        status: substitute.status,
        created: substitute.created,
        updated: substitute.updated,
        type: 'remplaçant'
      }))
      
      // Combiner et filtrer selon le statut
      const allSalaries = [...teacherSalaries, ...substituteSalaries]
      const filteredSalaries = statusFilter === 'all' 
        ? allSalaries 
        : allSalaries.filter(salary => salary.type === statusFilter)
      
      setSalaries(filteredSalaries)
      return filteredSalaries
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des salaires'
      setError(errorMessage)
      console.error('Erreur salaires:', err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateSalaryData = useCallback(async (id: string, data: any, type: 'titulaire' | 'remplaçant') => {
    try {
      const token = localStorage.getItem('pocketbase_auth')
      if (!token) throw new Error('Non authentifié')

      const { token: authToken } = JSON.parse(token)
      const collection = type === 'titulaire' ? COLLECTIONS.TEACHERS : COLLECTIONS.TEACHERS_SUBSTITUTE

      const response = await fetch(
        getApiUrl(`collections/${collection}/records/${id}`),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de la modification')
      }

      await fetchSalaries()
      return true
      
    } catch (err) {
      console.error('Erreur modification:', err)
      throw err
    }
  }, [fetchSalaries])

  const calculateSalary = useCallback((salary: TeacherSalary | SubstituteSalary) => {
    if (salary.type === 'titulaire') {
      const teacher = salary as TeacherSalary
      if (teacher.contrat === 'horaire') {
        const regularPay = (teacher.hours_worked || 0) * teacher.salary
        const majorationAmount = teacher.majoration || 0
        const total = regularPay + majorationAmount
        
        return {
          regularPay,
          majoration: majorationAmount,
          total,
          type: 'horaire'
        }
      } else {
        // Contrat mensuel - salaire de base + majoration (prime)
        const majorationAmount = teacher.majoration || 0
        const total = teacher.salary + majorationAmount
        
        return {
          baseSalary: teacher.salary,
          majoration: majorationAmount,
          total,
          type: 'mensuel'
        }
      }
    } else {
      // Remplaçant - toujours horaire
      const substitute = salary as SubstituteSalary
      const regularPay = (substitute.hours_worked || 0) * substitute.hourly_rate
      const majorationAmount = substitute.majoration || 0
      const total = regularPay + majorationAmount
      
      return {
        regularPay,
        majoration: majorationAmount,
        total,
        type: 'horaire'
      }
    }
  }, [])

  return {
    salaries,
    isLoading,
    error,
    fetchSalaries,
    calculateSalary,
    updateSalaryData
  }
}