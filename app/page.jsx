"use client"

import { useEffect } from "react"
import { getApiUrl, getAuthToken } from '@/lib/pocketbase'
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Vérifier l'authentification et rediriger
    const authData = localStorage.getItem('pocketbase_auth')
    if (authData) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection vers le tableau de bord...</p>
      </div>
    </div>
  )
}


