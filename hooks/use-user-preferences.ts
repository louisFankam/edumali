"use client"

import { usePreferencesContext } from "@/components/theme-provider"

export interface UserPreferences {
  id?: string
  user_id: string
  theme: "light" | "dark" | "auto"
  primary_color: string
  secondary_color: string
  accent_color: string
  sidebar_color: string
  sidebar_text_color: string
  border_radius: "none" | "small" | "medium" | "large"
  font_size: "small" | "medium" | "large"
  font_family: string
  dense_mode: boolean
  compact_sidebar: boolean
  animations: boolean
  high_contrast: boolean
}

export function useUserPreferences() {
  return usePreferencesContext()
}
