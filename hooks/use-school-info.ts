"use client"

import { useState, useEffect } from 'react'
import { getApiUrl, getAuthToken } from '@/lib/pocketbase'

export interface SchoolInfo {
  id: string
  name: string
  address: string
  phone: string
  email: string
  director: string
  founded_year: number
  logo: string
  website: string
  created: string
  updated: string
}

export function useSchoolInfo() {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSchoolInfo()
  }, [])

  const loadSchoolInfo = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 1. D'abord vérifier le localStorage
      const cachedSchoolInfo = localStorage.getItem('school_info')
      if (cachedSchoolInfo) {
        setSchoolInfo(JSON.parse(cachedSchoolInfo))
        setIsLoading(false)
        return
      }

      // 2. Si pas dans le cache, récupérer depuis l'API
      const authData = localStorage.getItem('pocketbase_auth')
      if (!authData) {
        throw new Error('Non authentifié')
      }

      const { token } = JSON.parse(authData)

      const response = await fetch(
        getApiUrl('collections/edumali_school_info/records?perPage=1'),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des informations de l\'école')
      }

      const result = await response.json()
      
      if (result.items && result.items.length > 0) {
        const schoolData = result.items[0]
        setSchoolInfo(schoolData)
        localStorage.setItem('school_info', JSON.stringify(schoolData))
      } else {
        setError('Aucune information d\'école trouvée')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur school info:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSchoolInfo = async () => {
    // Force le rechargement depuis l'API
    localStorage.removeItem('school_info')
    await loadSchoolInfo()
  }

  return {
    schoolInfo,
    isLoading,
    error,
    refresh: refreshSchoolInfo
  }
}