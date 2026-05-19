"use client"

import { useState, useEffect } from "react"

interface User {
  id: string
  email: string
  full_name: string
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>({
    id: "admin_1",
    email: "admin@edumali.ml",
    full_name: "Administrateur",
    role: "admin"
  })
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  const logout = () => {
    console.log("Logout mocked")
    setIsAuthenticated(false)
    setUser(null)
  }

  const login = async (email: string, _password: string) => {
    const nextUser = {
      id: "admin_1",
      email,
      full_name: "Administrateur",
      role: "admin",
    }

    setUser(nextUser)
    setIsAuthenticated(true)
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    isLoading: false
  }
}
