type PocketBaseListResult<T = Record<string, unknown>> = {
  items: T[]
}

type PocketBaseCollection = {
  getList: <T = Record<string, unknown>>(
    page?: number,
    perPage?: number,
    options?: Record<string, unknown>
  ) => Promise<PocketBaseListResult<T>>
}

export const COLLECTIONS = {
  ATTENDANCE: "attendance",
  STUDENTS: "students",
} as const

export const pb = {
  collection: (_name: string): PocketBaseCollection => ({
    async getList() {
      return { items: [] }
    },
  }),
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null

  const authData = window.localStorage.getItem("pocketbase_auth")
  if (!authData) return null

  try {
    const parsedAuthData = JSON.parse(authData) as { token?: string }
    return parsedAuthData.token || null
  } catch {
    return null
  }
}

export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null

  const authData = window.localStorage.getItem("pocketbase_auth")
  if (!authData) return null

  try {
    const parsedAuthData = JSON.parse(authData) as { record?: { id?: string } }
    return parsedAuthData.record?.id || null
  } catch {
    return null
  }
}

export function getApiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || ""
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path

  return baseUrl ? `${baseUrl}/api/${normalizedPath}` : `/api/${normalizedPath}`
}
