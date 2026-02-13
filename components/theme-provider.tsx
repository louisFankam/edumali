"use client"

import { useEffect } from "react"
import { useUserPreferences } from "@/hooks/use-user-preferences"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { preferences, loadPreferences } = useUserPreferences()

  // Charger les préférences au démarrage
  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  // Appliquer les préférences quand elles changent
  useEffect(() => {
    if (preferences) {
      applyPreferences(preferences)
    }
  }, [preferences])

  const applyPreferences = (prefs: any) => {
    const root = document.documentElement

    // Appliquer le thème
    if (prefs.theme === 'dark') {
      root.classList.add('dark')
    } else if (prefs.theme === 'light') {
      root.classList.remove('dark')
    } else {
      // Mode auto: détecter la préférence système
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    // Appliquer les couleurs
    root.style.setProperty('--primary', prefs.primary_color)
    root.style.setProperty('--secondary', prefs.secondary_color)
    root.style.setProperty('--accent', prefs.accent_color)
    root.style.setProperty('--sidebar', prefs.sidebar_color)
    root.style.setProperty('--sidebar-foreground', prefs.sidebar_text_color)

    // Appliquer le rayon de bordure
    let radiusValue = '0.375rem'
    switch (prefs.border_radius) {
      case 'none':
        radiusValue = '0px'
        break
      case 'small':
        radiusValue = '0.25rem'
        break
      case 'medium':
        radiusValue = '0.375rem'
        break
      case 'large':
        radiusValue = '0.5rem'
        break
    }
    root.style.setProperty('--radius', radiusValue)

    // Appliquer la taille de police
    let fontSizeValue = '16px'
    switch (prefs.font_size) {
      case 'small':
        fontSizeValue = '14px'
        break
      case 'medium':
        fontSizeValue = '16px'
        break
      case 'large':
        fontSizeValue = '18px'
        break
    }
    root.style.setProperty('--font-size', fontSizeValue)

    // Appliquer la police
    root.style.setProperty('--font-family', prefs.font_family)

    // Appliquer les modes d'interface
    if (prefs.dense_mode) {
      root.setAttribute('data-dense-mode', 'true')
    } else {
      root.removeAttribute('data-dense-mode')
    }

    if (prefs.compact_sidebar) {
      root.setAttribute('data-compact-sidebar', 'true')
    } else {
      root.removeAttribute('data-compact-sidebar')
    }

    if (prefs.animations) {
      root.removeAttribute('data-no-animations')
    } else {
      root.setAttribute('data-no-animations', 'true')
    }

    if (prefs.high_contrast) {
      root.setAttribute('data-high-contrast', 'true')
    } else {
      root.removeAttribute('data-high-contrast')
    }
  }

  return <>{children}</>
}
