// hooks/use-user-preferences.ts
import { useState, useEffect, useCallback } from 'react'
import { pb, COLLECTIONS, getAuthToken, getCurrentUser, getApiUrl } from '@/lib/pocketbase'

export interface UserPreferences {
  id?: string
  user_id: string
  theme: 'light' | 'dark' | 'auto'
  primary_color: string
  secondary_color: string
  accent_color: string
  sidebar_color: string
  sidebar_text_color: string
  border_radius: 'none' | 'small' | 'medium' | 'large'
  font_size: 'small' | 'medium' | 'large'
  font_family: string
  dense_mode: boolean
  compact_sidebar: boolean
  animations: boolean
  high_contrast: boolean
  created?: string
  updated?: string
}

const defaultPreferences: Omit<UserPreferences, 'user_id'> = {
  theme: 'light',
  primary_color: '#dc2626',
  secondary_color: '#3b82f6',
  accent_color: '#10b981',
  sidebar_color: '#374151',
  sidebar_text_color: '#ffffff',
  border_radius: 'medium',
  font_size: 'medium',
  font_family: 'Inter, sans-serif',
  dense_mode: false,
  compact_sidebar: false,
  animations: true,
  high_contrast: false
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les préférences depuis PocketBase
  const loadPreferences = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const authToken = getAuthToken()
      const currentUser = getCurrentUser()

      if (!authToken || !currentUser) {
        // Si pas authentifié, utiliser les préférences par défaut
        setPreferences({
          user_id: '',
          ...defaultPreferences
        })
        return
      }

      const userId = currentUser.id

      // Récupérer les préférences de l'utilisateur
      const response = await fetch(
        getApiUrl(`collections/${COLLECTIONS.USER_PREFERENCES}/records?filter=(user_id='${userId}')`),
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      )

      if (response.ok) {
        const result = await response.json()

        if (result.items && result.items.length > 0) {
          // Utiliser les préférences existantes
          const existingPrefs = result.items[0]
          setPreferences({
            ...existingPrefs,
            user_id: userId
          })
        } else {
          // Créer des préférences par défaut pour cet utilisateur
          const newPreferences = {
            user_id: userId,
            ...defaultPreferences
          }
          // Ne pas attendre la sauvegarde pour éviter le blocage
          savePreferences(newPreferences).catch(console.error)
          setPreferences(newPreferences)
        }
      } else {
        // La collection n'existe peut-être pas, utiliser les préférences par défaut
        console.warn('Collection user_preferences non trouvée, utilisation des préférences par défaut')
        setPreferences({
          user_id: userId,
          ...defaultPreferences
        })
      }
    } catch (err) {
      console.error('Erreur lors du chargement des préférences:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      // Fallback sur les préférences par défaut
      setPreferences({
        user_id: '',
        ...defaultPreferences
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Sauvegarder les préférences dans PocketBase
  const savePreferences = useCallback(async (prefs: UserPreferences) => {
    try {
      const authToken = getAuthToken()
      if (!authToken) return false

      if (prefs.id) {
        // Mettre à jour les préférences existantes
        const response = await fetch(
          getApiUrl(`collections/${COLLECTIONS.USER_PREFERENCES}/records/${prefs.id}`),
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(prefs)
          }
        )

        if (response.ok) {
          const result = await response.json()
          setPreferences(result)
          return true
        }
      } else {
        // Créer de nouvelles préférences
        const response = await fetch(
          getApiUrl(`collections/${COLLECTIONS.USER_PREFERENCES}/records`),
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(prefs)
          }
        )

        if (response.ok) {
          const result = await response.json()
          setPreferences(result)
          return true
        }
      }

      return false
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des préférences:', err)
      return false
    }
  }, [])

  // Mettre à jour une préférence spécifique
  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    if (!preferences) return

    const updatedPreferences = { ...preferences, [key]: value }
    setPreferences(updatedPreferences)
    return savePreferences(updatedPreferences)
  }, [preferences, savePreferences])

  // Réinitialiser aux préférences par défaut
  const resetPreferences = useCallback(async () => {
    if (!preferences) return

    const resetPrefs = {
      ...preferences,
      ...defaultPreferences
    }

    setPreferences(resetPrefs)
    return savePreferences(resetPrefs)
  }, [preferences, savePreferences])

  // Appliquer les préférences au document
  const applyPreferences = useCallback((prefs: UserPreferences) => {
    if (typeof document === 'undefined') return

    const root = document.documentElement

    // Theme (light/dark/auto)
    if (prefs.theme === 'dark') {
      root.classList.add('dark')
    } else if (prefs.theme === 'light') {
      root.classList.remove('dark')
    } else {
      // Auto - basé sur les préférences système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    // Couleurs
    root.style.setProperty('--primary', prefs.primary_color)
    root.style.setProperty('--secondary', prefs.secondary_color)
    root.style.setProperty('--accent', prefs.accent_color)
    root.style.setProperty('--sidebar', prefs.sidebar_color)

    // Mettre à jour les couleurs dérivées du sidebar
    const isDark = root.classList.contains('dark')
    root.style.setProperty('--sidebar-foreground', prefs.sidebar_text_color)
    root.style.setProperty('--sidebar-primary', prefs.primary_color)
    root.style.setProperty('--sidebar-primary-foreground', '#ffffff')
    root.style.setProperty('--sidebar-accent', prefs.accent_color)
    root.style.setProperty('--sidebar-accent-foreground', isDark ? '#1a1a1a' : '#374151')
    root.style.setProperty('--sidebar-border', isDark ? '#404040' : '#e5e7eb')

    // Border radius
    const radiusMap = {
      none: '0px',
      small: '4px',
      medium: '8px',
      large: '12px'
    }
    root.style.setProperty('--radius', radiusMap[prefs.border_radius])

    // Font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    }
    root.style.setProperty('--font-size', fontSizeMap[prefs.font_size])

    // Font family
    root.style.setProperty('--font-family', prefs.font_family)

    // Modes spéciaux
    if (prefs.dense_mode) {
      root.setAttribute('data-dense', 'true')
    } else {
      root.removeAttribute('data-dense')
    }

    if (prefs.compact_sidebar) {
      root.setAttribute('data-compact-sidebar', 'true')
    } else {
      root.removeAttribute('data-compact-sidebar')
    }

    if (prefs.high_contrast) {
      root.setAttribute('data-high-contrast', 'true')
    } else {
      root.removeAttribute('data-high-contrast')
    }

    if (!prefs.animations) {
      root.setAttribute('data-no-animations', 'true')
    } else {
      root.removeAttribute('data-no-animations')
    }
  }, [])

  // Écouter les changements de thème système pour le mode auto
  useEffect(() => {
    if (preferences?.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      const handleChange = (e: MediaQueryListEvent) => {
        if (typeof document !== 'undefined') {
          const root = document.documentElement
          if (e.matches) {
            root.classList.add('dark')
          } else {
            root.classList.remove('dark')
          }
        }
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [preferences?.theme])

  // Charger les préférences au démarrage
  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  // Appliquer les préférences quand elles changent
  useEffect(() => {
    if (preferences) {
      applyPreferences(preferences)
    }
  }, [preferences, applyPreferences])

  return {
    preferences,
    isLoading,
    error,
    savePreferences,
    updatePreference,
    resetPreferences,
    loadPreferences
  }
}
