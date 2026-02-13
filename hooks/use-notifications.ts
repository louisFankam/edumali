import { useState, useEffect } from 'react'
import { getApiUrl, getAuthToken } from '@/lib/pocketbase'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  category: 'absence' | 'payment' | 'exam' | 'general'
  priority?: 'low' | 'medium' | 'high' // ← AJOUTÉ ICI
  is_read: boolean
  created: string
  expand?: {
    target_user_id?: {
      id: string
      username: string
      email: string
    }
    target_class_id?: {
      id: string
      name: string
    }
    target_student_id?: {
      id: string
      first_name: string
      last_name: string
    }
  }
}

interface NotificationsStats {
  unreadCount: number
  notifications: Notification[]
  isLoading: boolean
  error: string | null
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refresh: () => Promise<void>
}

export function useNotifications(): NotificationsStats {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const authData = localStorage.getItem('pocketbase_auth')
      if (!authData) throw new Error('Non authentifié')

      const { record } = JSON.parse(authData)
      const userId = record.id
      const token = getAuthToken()

      // Récupérer les notifications de l'utilisateur
      const response = await fetch(
        getApiUrl(`collections/edumali_notifications/records?filter=(target_user_id = '${userId}' || target_user_id = null)&sort=-created&expand=target_user_id,target_class_id,target_student_id&perPage=50`),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la récupération des notifications')

      const result = await response.json()
      
      // Assurer que chaque notification a une priorité (avec valeur par défaut)
      const notificationsWithPriority = (result.items || []).map((item: any) => ({
        ...item,
        priority: item.priority || 'medium' // Valeur par défaut
      }))
      
      setNotifications(notificationsWithPriority)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur notifications:', err)
      // En cas d'erreur, on utilise des données mock pour l'UI
      setNotifications(getMockNotifications())
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')

      const response = await fetch(
        getApiUrl(`collections/edumali_notifications/records/${notificationId}`),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            is_read: true,
            read_at: new Date().toISOString()
          })
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la mise à jour')

      // Mettre à jour localement
      setNotifications(prev => prev.map(notif =>
        notif.id === notificationId 
          ? { ...notif, is_read: true, read_at: new Date().toISOString() }
          : notif
      ))

    } catch (err) {
      console.error('Erreur markAsRead:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const authData = localStorage.getItem('pocketbase_auth')
      if (!authData) throw new Error('Non authentifié')

      const { record } = JSON.parse(authData)
      const userId = record.id
      const token = getAuthToken()

      // Récupérer les IDs des notifications non lues
      const unreadNotifications = notifications.filter(n => !n.is_read)
      const unreadIds = unreadNotifications.map(n => n.id)

      if (unreadIds.length === 0) return

      // Mettre à jour toutes les notifications en une seule requête
      const response = await fetch(
        getApiUrl(`collections/edumali_notifications/records?filter=id ~ '${unreadIds.join('|')}'`),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            is_read: true,
            read_at: new Date().toISOString()
          })
        }
      )

      if (!response.ok) throw new Error('Erreur lors de la mise à jour groupée')

      // Mettre à jour localement
      setNotifications(prev => prev.map(notif =>
        unreadIds.includes(notif.id)
          ? { ...notif, is_read: true, read_at: new Date().toISOString() }
          : notif
      ))

    } catch (err) {
      console.error('Erreur markAllAsRead:', err)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return {
    unreadCount,
    notifications,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  }
}

// Données mock en cas d'erreur
const getMockNotifications = (): Notification[] => [
  {
    id: "1",
    title: "Paiement en retard",
    message: "3 élèves ont des paiements en retard",
    type: "warning",
    category: "payment",
    priority: "high",
    is_read: false,
    created: new Date().toISOString()
  },
  {
    id: "2",
    title: "Absence non justifiée",
    message: "Moussa Diarra absent depuis 3 jours",
    type: "error",
    category: "absence",
    priority: "high",
    is_read: false,
    created: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "3",
    title: "Examen à venir",
    message: "Composition de Mathématiques demain",
    type: "info",
    category: "exam",
    priority: "medium",
    is_read: true,
    created: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "4",
    title: "Nouveau bulletin",
    message: "Les bulletins du trimestre 1 sont disponibles",
    type: "success",
    category: "general",
    priority: "low",
    is_read: true,
    created: new Date(Date.now() - 172800000).toISOString()
  }
]