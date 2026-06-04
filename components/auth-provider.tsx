  "use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

interface User {
  id: number
  email: string
  fullName: string
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" })
        if (!response.ok) {
          if (!cancelled) { setIsAuthenticated(false); setUser(null) }
          return
        }
        const data = await response.json()
        if (!cancelled) { setUser(data.user); setIsAuthenticated(true) }
      } catch {
        if (!cancelled) { setIsAuthenticated(false); setUser(null) }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchSession()
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (username: string, password: string, rememberMe = false) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, rememberMe }),
    })
    const data = await response.json()
    if (!response.ok || !data.ok) {
      throw new Error(data?.message ?? "Email ou mot de passe incorrect")
    }
    setUser(data.user)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setIsAuthenticated(false)
    setUser(null)
    window.location.href = "/login"
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
