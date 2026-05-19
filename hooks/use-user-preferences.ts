"use client"

import { useState, useCallback } from 'react'

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
}

const defaultPreferences: UserPreferences = {
  user_id: 'user_1',
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
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)

  const loadPreferences = useCallback(async () => {
    // Mock loading
    console.log("Loading preferences mocked")
  }, [])

  const savePreferences = useCallback(async (prefs: UserPreferences) => {
    console.log("Saving preferences mocked", prefs)
    setPreferences(prefs)
    return true
  }, [])

  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetPreferences = useCallback(async () => {
    setPreferences(defaultPreferences)
  }, [])

  return {
    preferences,
    isLoading: false,
    error: null,
    savePreferences,
    updatePreference,
    resetPreferences,
    loadPreferences
  }
}
