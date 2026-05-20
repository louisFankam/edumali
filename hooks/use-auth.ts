"use client"

import { useState, useEffect } from "react"

interface User {
  id: number
  email: string
  fullName: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" })
        if (!response.ok) {
          setIsAuthenticated(false)
          setUser(null)
          return
        }

        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
      } catch {
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [])

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setIsAuthenticated(false)
    setUser(null)
    window.location.href = "/login"
  }

  const login = async (email: string, password: string, rememberMe = false) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, rememberMe }),
    })

    const data = await response.json()
    if (!response.ok || !data.ok) {
      throw new Error(data?.message ?? "Email ou mot de passe incorrect")
    }

    setUser(data.user)
    setIsAuthenticated(true)
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    isLoading
  }
}
