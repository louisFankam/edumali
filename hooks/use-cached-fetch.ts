"use client"

const cache = new Map<string, { data: any; expiry: number }>()
const DEFAULT_TTL = 60_000

export async function cachedFetch<T = any>(url: string, ttl = DEFAULT_TTL): Promise<T> {
  const cached = cache.get(url)
  if (cached && cached.expiry > Date.now()) return cached.data as T
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  const json = await res.json()
  if (!json.ok) throw new Error(json.message || "API error")
  cache.set(url, { data: json.data, expiry: Date.now() + ttl })
  return json.data as T
}

export function clearCache(pattern?: string) {
  if (!pattern) { cache.clear(); return }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key)
  }
}
