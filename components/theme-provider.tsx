"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react"
import type { UserPreferences } from "@/hooks/use-user-preferences"

const defaultPreferences: UserPreferences = {
  user_id: "0",
  theme: "light",
  primary_color: "#dc2626",
  secondary_color: "#3b82f6",
  accent_color: "#10b981",
  sidebar_color: "#374151",
  sidebar_text_color: "#ffffff",
  border_radius: "medium",
  font_size: "medium",
  font_family: "Inter, sans-serif",
  dense_mode: false,
  compact_sidebar: false,
  animations: true,
  high_contrast: false,
}

interface PreferencesContextValue {
  preferences: UserPreferences | null
  isLoading: boolean
  error: string | null
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void
  savePreferences: (prefs: UserPreferences) => Promise<boolean>
  resetPreferences: () => Promise<boolean>
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

function toApiPayload(prefs: UserPreferences) {
  return {
    theme: prefs.theme,
    primaryColor: prefs.primary_color,
    secondaryColor: prefs.secondary_color,
    accentColor: prefs.accent_color,
    sidebarColor: prefs.sidebar_color,
    sidebarTextColor: prefs.sidebar_text_color,
    borderRadius: prefs.border_radius,
    fontSize: prefs.font_size,
    fontFamily: prefs.font_family,
    denseMode: prefs.dense_mode,
    compactSidebar: prefs.compact_sidebar,
    animations: prefs.animations,
    highContrast: prefs.high_contrast,
  }
}

function fromApiResponse(data: any): UserPreferences {
  return {
    user_id: String(data.userId ?? "0"),
    theme: data.theme ?? "light",
    primary_color: data.primaryColor ?? "#dc2626",
    secondary_color: data.secondaryColor ?? "#3b82f6",
    accent_color: data.accentColor ?? "#10b981",
    sidebar_color: data.sidebarColor ?? "#374151",
    sidebar_text_color: data.sidebarTextColor ?? "#ffffff",
    border_radius: data.borderRadius ?? "medium",
    font_size: data.fontSize ?? "medium",
    font_family: data.fontFamily ?? "Inter, sans-serif",
    dense_mode: Boolean(data.denseMode),
    compact_sidebar: Boolean(data.compactSidebar),
    animations: Boolean(data.animations),
    high_contrast: Boolean(data.highContrast),
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const fetchPreferences = useCallback(async () => {
    const id = ++requestId.current
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/user-preferences", { cache: "no-store" })
      if (id !== requestId.current) return
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message ?? "Erreur de chargement")
      }
      const json = await res.json()
      if (id !== requestId.current) return
      setPreferences(fromApiResponse(json.data))
    } catch (err: any) {
      if (id !== requestId.current) return
      setError(err.message ?? "Erreur de chargement")
      setPreferences(defaultPreferences)
    } finally {
      if (id === requestId.current) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  const savePreferences = useCallback(async (prefs: UserPreferences) => {
    const id = ++requestId.current
    setError(null)
    try {
      const res = await fetch("/api/user-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toApiPayload(prefs)),
      })
      if (id !== requestId.current) return false
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message ?? "Erreur de sauvegarde")
      }
      return true
    } catch (err: any) {
      if (id !== requestId.current) return false
      setError(err.message ?? "Erreur de sauvegarde")
      return false
    }
  }, [])

  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => (prev ? { ...prev, [key]: value } : prev))
  }, [])

  const resetPreferences = useCallback(async () => {
    const id = ++requestId.current
    setError(null)
    try {
      const res = await fetch("/api/user-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toApiPayload(defaultPreferences)),
      })
      if (id !== requestId.current) return false
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message ?? "Erreur de réinitialisation")
      }
      setPreferences(defaultPreferences)
      return true
    } catch (err: any) {
      if (id !== requestId.current) return false
      setError(err.message ?? "Erreur de réinitialisation")
      return false
    }
  }, [])

  const applyPreferences = (prefs: UserPreferences) => {
    const root = document.documentElement

    if (prefs.theme === "dark") {
      root.classList.add("dark")
    } else if (prefs.theme === "light") {
      root.classList.remove("dark")
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.toggle("dark", isDark)
    }

    root.style.setProperty("--primary", prefs.primary_color)
    root.style.setProperty("--secondary", prefs.secondary_color)
    root.style.setProperty("--accent", prefs.accent_color)
    root.style.setProperty("--sidebar", prefs.sidebar_color)
    root.style.setProperty("--sidebar-foreground", prefs.sidebar_text_color)

    let radiusValue = "0.375rem"
    switch (prefs.border_radius) {
      case "none": radiusValue = "0px"; break
      case "small": radiusValue = "0.25rem"; break
      case "medium": radiusValue = "0.375rem"; break
      case "large": radiusValue = "0.5rem"; break
    }
    root.style.setProperty("--radius", radiusValue)

    let fontSizeValue = "16px"
    switch (prefs.font_size) {
      case "small": fontSizeValue = "14px"; break
      case "medium": fontSizeValue = "16px"; break
      case "large": fontSizeValue = "18px"; break
    }
    root.style.setProperty("--font-size", fontSizeValue)
    root.style.setProperty("--font-family", prefs.font_family)

    root.toggleAttribute("data-dense-mode", prefs.dense_mode)
    root.toggleAttribute("data-compact-sidebar", prefs.compact_sidebar)
    root.toggleAttribute("data-no-animations", !prefs.animations)
    root.toggleAttribute("data-high-contrast", prefs.high_contrast)
  }

  useEffect(() => {
    if (preferences) applyPreferences(preferences)
  }, [preferences])

  return (
    <PreferencesContext.Provider value={{ preferences, isLoading, error, updatePreference, savePreferences, resetPreferences }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferencesContext(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error("usePreferencesContext must be used within ThemeProvider")
  return ctx
}
