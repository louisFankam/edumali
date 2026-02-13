"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { pb, getAuthToken, getCurrentUser , getApiUrl, getAuthToken} from '@/lib/pocketbase'

interface User {
  id: string
  email: string
  username: string
  role: string
  full_name: string
}

interface SchoolInfo {
  id: string
  name: string
  address: string
  phone: string
  email: string
  director: string
  founded_year: number
  logo: string
  website: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    try {
      const authData = localStorage.getItem('pocketbase_auth')
      const schoolData = localStorage.getItem('school_info')
      
      if (authData) {
        const { record } = JSON.parse(authData)
        setUser(record)
      }
      
      if (schoolData) {
        setSchoolInfo(JSON.parse(schoolData))
      }
      
    } catch (error) {
      console.error('Erreur auth:', error)
      localStorage.removeItem('pocketbase_auth')
      localStorage.removeItem('school_info')
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      // 1. Authentification de l'utilisateur avec PocketBase
      await pb.collection('users').authWithPassword(email, password)
      
      // 2. Récupération des informations de l'école
      let schoolData = null
      try {
        const schoolRecords = await pb.collection('edumali_school_info').getList(1, 1)
        if (schoolRecords.items.length > 0) {
          schoolData = schoolRecords.items[0]
        }
      } catch (schoolError) {
        console.warn('Erreur lors de la récupération des infos école:', schoolError)
        // On continue même si l'école échoue
      }

      // 3. Stockage dans le localStorage
      localStorage.setItem('pocketbase_auth', JSON.stringify({
        token: pb.authStore.token,
        record: pb.authStore.record
      }))
      if (schoolData) {
        localStorage.setItem('school_info', JSON.stringify(schoolData))
      }

      // 4. Mise à jour du state
      setUser(pb.authStore.record as unknown as User)
      if (schoolData) {
        setSchoolInfo(schoolData)
      }
      
      router.push('/dashboard')
      return true
      
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    // Déconnexion de PocketBase
    pb.authStore.clear()
    localStorage.removeItem('pocketbase_auth')
    localStorage.removeItem('school_info')
    setUser(null)
    setSchoolInfo(null)
    router.push('/login')
  }

  return {
    user,
    schoolInfo,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  }
}