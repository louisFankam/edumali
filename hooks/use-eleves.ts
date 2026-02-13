// hooks/use-eleves.ts
import { useState, useCallback } from "react"
import { getApiUrl, getAuthToken } from '@/lib/pocketbase'
import { Eleve } from "@/components/eleve-modal"

interface EleveData {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  place_of_birth: string
  gender: string
  nationality: string
  class_id: string
  parent_name: string
  parent_phone: string
  parent_email?: string
  address: string
  enrollment_date: string
  status: string
  photo?: string
  academic_year: string
  blood_type?: string
  emergency_contact?: string
  emergency_phone?: string
  observations?: string
  expand?: {
    class_id?: {
      id: string
      name: string
      level: string
      teacher_id?: string
      expand?: {
        teacher_id?: {
          first_name: string
          last_name: string
        }
      }
    }
  }
}

export const useEleves = () => {
  const [eleves, setEleves] = useState<Eleve[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEleves = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')
      
      const response = await fetch(
        getApiUrl('collections/edumali_students/records?expand=class_id,class_id.teacher_id&perPage=500'),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la récupération des élèves')

      const result = await response.json()
      
      const transformedEleves: Eleve[] = result.items.map((item: EleveData) => ({
        id: item.id,
        numeroEleve: `EL${item.enrollment_date.split('-')[0]}${item.id.slice(0, 4)}`,
        nom: item.last_name,
        prenom: item.first_name,
        dateNaissance: item.date_of_birth,
        lieuNaissance: item.place_of_birth,
        sexe: item.gender === 'Masculin' ? 'M' : 'F',
        nationalite: item.nationality,
        etablissement: "École Primaire de Bamako",
        classe: item.expand?.class_id?.name || 'Inconnu',
        niveau: item.expand?.class_id?.level || 'Inconnu',
        anneeScolaire: item.academic_year,
        statut: item.status === 'active' ? 'Actif' : 'Inactif',
        dateInscription: item.enrollment_date,
        adresse: item.address,
        ville: "Bamako",
        region: "Bamako",
        telephone: item.parent_phone,
        email: item.parent_email,
        nomPere: item.parent_name,
        professionPere: "Non spécifié",
        telephonePere: item.parent_phone,
        nomMere: item.parent_name,
        professionMere: "Non spécifié",
        telephoneMere: item.parent_phone,
        groupeSanguin: item.blood_type || 'Non spécifié',
        contactUrgence: item.emergency_contact || item.parent_name,
        telephoneUrgence: item.emergency_phone || item.parent_phone,
        moyenneGenerale: 0,
        classement: 0,
        observations: item.observations,
        photo: item.photo
      }))

      setEleves(transformedEleves)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur élèves:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createEleve = useCallback(async (eleveData: Omit<Eleve, "id">) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const pocketbaseData = {
        first_name: eleveData.prenom,
        last_name: eleveData.nom,
        date_of_birth: eleveData.dateNaissance,
        place_of_birth: eleveData.lieuNaissance,
        gender: eleveData.sexe === 'M' ? 'Masculin' : 'Féminin',
        nationality: eleveData.nationalite,
        parent_name: eleveData.nomPere,
        parent_phone: eleveData.telephonePere,
        parent_email: eleveData.email,
        address: eleveData.adresse,
        enrollment_date: eleveData.dateInscription,
        status: eleveData.statut === 'Actif' ? 'active' : 'inactive',
        academic_year: eleveData.anneeScolaire,
        blood_type: eleveData.groupeSanguin,
        emergency_contact: eleveData.contactUrgence,
        emergency_phone: eleveData.telephoneUrgence,
        observations: eleveData.observations
      }

      const response = await fetch(
        getApiUrl('collections/edumali_students/records'),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(pocketbaseData)
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la création')

      await fetchEleves()
      
    } catch (err) {
      console.error('Erreur création:', err)
      throw err
    }
  }, [fetchEleves])

  const updateEleve = useCallback(async (id: string, eleveData: Omit<Eleve, "id">) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const pocketbaseData = {
        first_name: eleveData.prenom,
        last_name: eleveData.nom,
        date_of_birth: eleveData.dateNaissance,
        place_of_birth: eleveData.lieuNaissance,
        gender: eleveData.sexe === 'M' ? 'Masculin' : 'Féminin',
        nationality: eleveData.nationalite,
        parent_name: eleveData.nomPere,
        parent_phone: eleveData.telephonePere,
        parent_email: eleveData.email,
        address: eleveData.adresse,
        enrollment_date: eleveData.dateInscription,
        status: eleveData.statut === 'Actif' ? 'active' : 'inactive',
        academic_year: eleveData.anneeScolaire,
        blood_type: eleveData.groupeSanguin,
        emergency_contact: eleveData.contactUrgence,
        emergency_phone: eleveData.telephoneUrgence,
        observations: eleveData.observations
      }

      const response = await fetch(
        `getApiUrl('collections/edumali_students/records/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(pocketbaseData)
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la modification')

      await fetchEleves()
      
    } catch (err) {
      console.error('Erreur modification:', err)
      throw err
    }
  }, [fetchEleves])

  const deleteEleve = useCallback(async (id: string) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const response = await fetch(
        `getApiUrl('collections/edumali_students/records/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la suppression')

      setEleves((prev) => prev.filter((e) => e.id !== id))
      
    } catch (err) {
      console.error('Erreur suppression:', err)
      throw err
    }
  }, [])

  return {
    eleves,
    isLoading,
    error,
    fetchEleves,
    createEleve,
    updateEleve,
    deleteEleve
  }
}