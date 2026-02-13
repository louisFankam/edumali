// hooks/use-payments.ts
import { useState, useCallback } from "react"
import { getApiUrl, getAuthToken } from "@/lib/pocketbase"

interface Payment {
  id: string
  studentId: string
  date: string
  amount: number
  description: string
  paymentType: string
  paymentMethod: string
  payerName: string
  academicYear: string
  created: string
  updated: string
}

interface StudentWithPayment {
  id: string
  firstName: string
  lastName: string
  class: string
  classId: string
  photo?: string
  gender?: string
  totalFee: number
  academicYear: string
  academicYearId: string
  status: 'Payé' | 'Partiel' | 'Impayé'
  totalPaid: number
  remainingBalance: number
}

interface PocketBasePayment {
  id: string
  student_id: string
  date: string
  amount: number
  description: string
  payment_type: string
  payment_method: string
  payer_name: string
  academic_year: string
  created: string
  updated: string
  expand?: {
    student_id?: {
      id: string
      first_name: string
      last_name: string
      class_id: string
      photo?: string
      total_fee: number
      academic_year: string
      expand?: {
        class_id?: {
          id: string
          name: string
        }
      }
    }
  }
}

export const usePayments = () => {
  const [studentsWithPayments, setStudentsWithPayments] = useState<StudentWithPayment[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStudentsWithPayments = useCallback(async (academicYear?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const token = getAuthToken()
      console.log('Token trouvé:', token ? 'oui' : 'non')
      if (!token) throw new Error('Non authentifié')

      // Récupérer les étudiants actifs pour l'année académique spécifiée ou en cours
      const currentYear = academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`

      // Charger tous les étudiants sans filtre de statut
      const studentsResponse = await fetch(
        getApiUrl('collections/edumali_students/records?expand=class_id&perPage=500'),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!studentsResponse.ok) throw new Error('Erreur lors de la récupération des étudiants')

      const studentsData = await studentsResponse.json()
      const students = studentsData.items

      console.log('Réponse API étudiants:', studentsData)
      console.log('Étudiants trouvés:', students.length)
      console.log('Premier étudiant:', students[0])

      // Essayer de récupérer les paiements, mais continuer même si la collection n'existe pas
      let allPayments: any[] = []
      try {
        const paymentsResponse = await fetch(
          getApiUrl('collections/edumali_payments/records?perPage=1000'),
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json()
          allPayments = paymentsData.items
          console.log('Paiements trouvés:', allPayments.length)
        }
      } catch (paymentError) {
        console.log('Collection des paiements non trouvée ou inaccessible, utilisation de données simulées')
      }

      // Transformer les données et calculer les statistiques de paiement
      const transformedStudents: StudentWithPayment[] = students.map((student: any) => {
        const studentPayments = allPayments.filter((payment: any) => 
          payment.student_id === student.id
        )
        
        const totalPaid = studentPayments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)
        const totalFee = student.expand?.class_id?.total_fee || 50000 // Utiliser le total_fee de la classe, valeur par défaut si non défini
        const remainingBalance = totalFee - totalPaid
        
        let status: 'Payé' | 'Partiel' | 'Impayé' = 'Impayé'
        if (totalPaid >= totalFee) {
          status = 'Payé'
        } else if (totalPaid > 0) {
          status = 'Partiel'
        }

        return {
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          class: student.expand?.class_id?.name || 'Inconnu',
          classId: student.class_id,
          photo: student.photo,
          gender: student.gender,
          totalFee,
          academicYear: currentYear,
          academicYearId: student.academic_year, // ID pour les relations
          status,
          totalPaid,
          remainingBalance
        }
      })

      console.log('Étudiants transformés:', transformedStudents.length)
      setStudentsWithPayments(transformedStudents)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur paiements:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchStudentPayments = useCallback(async (studentId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const response = await fetch(
        getApiUrl(`collections/edumali_payments/records?filter=student_id="${studentId}"&sort=-created&perPage=500`),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la récupération des paiements')

      const result = await response.json()
      
      const transformedPayments: Payment[] = result.items.map((item: any) => ({
        id: item.id,
        studentId: item.student_id,
        date: item.payment_date || item.date,
        amount: item.amount,
        description: item.remarks || "",
        paymentType: item.payment_type,
        paymentMethod: item.payment_method,
        payerName: "", // Champ plus utilisé
        academicYear: "", // Champ plus utilisé
        created: item.created,
        updated: item.updated
      }))

      setPayments(transformedPayments)
      return transformedPayments
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur paiements étudiant:', err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createPayment = useCallback(async (paymentData: Omit<Payment, "id" | "created" | "updated">) => {
    try {
      const token = getAuthToken()
      const userId = JSON.parse(localStorage.getItem('pocketbase_auth') || '{}')?.record?.id
      if (!token) throw new Error('Non authentifié')

      // Mapper les types de paiement
    const paymentTypeMap: Record<string, string> = {
      "Scolarité": "tuition",
      "Cantine": "lunch",
      "Transport": "transport",
      "Autre": "other"
    }

    // Mapper les méthodes de paiement
    const paymentMethodMap: Record<string, string> = {
      "Espèces": "cash",
      "Chèque": "check",
      "Virement": "transfer",
      "Carte": "card"
    }

    const pocketbaseData = {
        student_id: paymentData.studentId,
        payment_type: paymentTypeMap[paymentData.paymentType] || "tuition",
        amount: paymentData.amount,
        paid_amount: paymentData.amount,
        due_date: paymentData.date,
        payment_date: paymentData.date,
        payment_method: paymentMethodMap[paymentData.paymentMethod] || "cash",
        status: "paid", // Par défaut, le paiement est complet
        reference: "", // Champ optionnel
        remarks: paymentData.description || "", // Utiliser description comme remarks
        academic_year: paymentData.academicYear, // Relation avec edumali_academic_years
        recorded_by: userId || 'system' // Utiliser l'ID de l'utilisateur connecté
      }

      const response = await fetch(
        getApiUrl('collections/edumali_payments/records'),
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
        console.error('Erreur détaillée création paiement:', errorData)
        throw new Error(errorData.message || errorData.error || `Erreur ${response.status}: ${response.statusText}`)
      }

      const newPayment = await response.json()
      
      // Mettre à jour le state local
      setPayments(prev => [{
        id: newPayment.id,
        studentId: newPayment.student_id,
        date: newPayment.date,
        amount: newPayment.amount,
        description: newPayment.description,
        paymentType: newPayment.payment_type,
        paymentMethod: newPayment.payment_method,
        payerName: newPayment.payer_name,
        academicYear: newPayment.academic_year,
        created: newPayment.created,
        updated: newPayment.updated
      }, ...prev])

      return newPayment
      
    } catch (err) {
      console.error('Erreur création paiement:', err)
      throw err
    }
  }, [])

  const deletePayment = useCallback(async (paymentId: string) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const response = await fetch(
        getApiUrl(`collections/edumali_payments/records/${paymentId}`),
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la suppression du paiement')

      setPayments(prev => prev.filter(p => p.id !== paymentId))
      
    } catch (err) {
      console.error('Erreur suppression paiement:', err)
      throw err
    }
  }, [])

  return {
    studentsWithPayments,
    payments,
    isLoading,
    error,
    fetchStudentsWithPayments,
    fetchStudentPayments,
    createPayment,
    deletePayment
  }
}