"use client"

const cache = new Map<string, { data: unknown; timestamp: number }>()
const inflight = new Map<string, Promise<unknown>>()
const TTL = 30_000

export async function cachedFetch<T>(url: string): Promise<T> {
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < TTL) {
    return cached.data as T
  }

  const existing = inflight.get(url)
  if (existing) return existing as Promise<T>

  const promise = window.fetch(url, { cache: "no-store" })
    .then(r => r.json())
    .then(json => {
      cache.set(url, { data: json, timestamp: Date.now() })
      inflight.delete(url)
      return json as T
    })
    .catch(err => {
      inflight.delete(url)
      throw err
    })

  inflight.set(url, promise)
  return promise
}

export function clearCache() {
  cache.clear()
  inflight.clear()
}
