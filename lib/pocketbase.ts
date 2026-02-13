import PocketBase from 'pocketbase'

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090'

const pb = new PocketBase(POCKETBASE_URL)

// Désactiver l'auto-cancellation pour éviter les erreurs
pb.autoCancellation(false)

// Restaurer l'authentification depuis le localStorage au démarrage
if (typeof window !== 'undefined') {
  const authData = localStorage.getItem('pocketbase_auth')
  if (authData) {
    try {
      const { token, record } = JSON.parse(authData)
      pb.authStore.save(token, record)
    } catch (error) {
      console.error('Erreur lors de la restauration de l\'authentification:', error)
      localStorage.removeItem('pocketbase_auth')
    }
  }
}

// Exporter l'instance PocketBase
export { pb }

// Exporter l'URL de base (read-only)
export const POCKETBASE_API_URL = POCKETBASE_URL

// Fonction utilitaire pour construire les URLs de l'API
export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${POCKETBASE_URL}/api/${cleanPath}`
}

// Fonction utilitaire pour construire les URLs de fichiers
export const getFileUrl = (collection: string, id: string, filename: string, token?: string): string => {
  let url = `${POCKETBASE_URL}/api/files/${collection}/${id}/${filename}`
  if (token) {
    url += `?token=${token}`
  }
  return url
}

// Fonction utilitaire pour récupérer l'ID de l'utilisateur actuel
export const getCurrentUserId = (): string => {
  if (typeof window === 'undefined') return ''
  const authData = localStorage.getItem('pocketbase_auth')
  if (!authData) return ''
  try {
    const record = JSON.parse(authData).record
    return record?.id || ''
  } catch {
    return ''
  }
}

// Fonctions utilitaires pour l'authentification
export const getAuthToken = () => {
  const authData = localStorage.getItem('pocketbase_auth')
  return authData ? JSON.parse(authData).token : null
}

export const isAuthenticated = () => {
  return !!localStorage.getItem('pocketbase_auth')
}

export const getCurrentUser = () => {
  const authData = localStorage.getItem('pocketbase_auth')
  return authData ? JSON.parse(authData).record : null
}

// Fonction générique pour les requêtes authentifiées
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  }

  const response = await fetch(url, {
    ...options,
    headers
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Collections PocketBase
export const COLLECTIONS = {
  USERS: 'users',
  STUDENTS: 'edumali_students',
  TEACHERS: 'edumali_teachers',
  CLASSES: 'edumali_classes',
  SUBJECTS: 'edumali_subjects',
  ATTENDANCE: 'edumali_attendance',
  TEACHERS_SUBSTITUTE: 'edumali_teachers_substitute',
  TEACHERS_ATTENDANCE: 'edumali_teachers_attendance',
  EXAMS: 'edumali_exams',
  GRADES: 'edumali_grades',
  PAYMENTS: 'edumali_payments',
  SCHOOL_INFO: 'edumali_school_info',
  NOTIFICATIONS: 'edumali_notifications',
  ACADEMIC_YEARS: 'edumali_academic_years',
  SALARY_HISTORY: 'edumali_salary_history',
  USER_PREFERENCES: 'edumali_user_preferences'
} as const