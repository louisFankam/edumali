// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"

vi.mock("@/hooks/use-cached-fetch", () => ({
  cachedFetch: vi.fn(),
  clearCache: vi.fn(),
}))

describe("useFeeTypes", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("devrait charger les types de frais depuis le cache", async () => {
    const fakeFees = [
      { id: "1", name: "Scolarité", amount: 50000, period: "annuel" },
      { id: "2", name: "Assurance", amount: 5000, period: "annuel" },
    ]
    const { cachedFetch } = await import("@/hooks/use-cached-fetch")
    vi.mocked(cachedFetch).mockResolvedValue(fakeFees)

    const { useFeeTypes } = await import("@/hooks/use-payments")
    const { result } = renderHook(() => useFeeTypes())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.feeTypes).toEqual(fakeFees)
    expect(result.current.error).toBeNull()
  })

  it("devrait gérer les erreurs de chargement", async () => {
    const { cachedFetch } = await import("@/hooks/use-cached-fetch")
    vi.mocked(cachedFetch).mockRejectedValueOnce(new Error("Erreur réseau"))

    const { useFeeTypes } = await import("@/hooks/use-payments")
    const { result } = renderHook(() => useFeeTypes())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.feeTypes).toEqual([])
    expect(result.current.error).toBeTruthy()
  })
})

describe("usePayments", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("devrait charger les paiements depuis le cache", async () => {
    const fakePayments = [
      { id: "1", studentId: "1", amount: 25000, method: "espèces", date: "2025-10-01", status: "payé" },
      { id: "2", studentId: "1", amount: 25000, method: "espèces", date: "2025-11-01", status: "payé" },
    ]
    const { cachedFetch } = await import("@/hooks/use-cached-fetch")
    vi.mocked(cachedFetch).mockResolvedValue(fakePayments)

    const { usePayments } = await import("@/hooks/use-payments")
    const { result } = renderHook(() => usePayments({ studentId: "1" }))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.payments).toEqual(fakePayments)
    expect(result.current.total).toBe(2)
    expect(result.current.error).toBeNull()
  })

  it("devrait retourner un tableau vide quand aucun paiement", async () => {
    const { cachedFetch } = await import("@/hooks/use-cached-fetch")
    vi.mocked(cachedFetch).mockResolvedValue([])

    const { usePayments } = await import("@/hooks/use-payments")
    const { result } = renderHook(() => usePayments({ studentId: "999" }))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.payments).toEqual([])
    expect(result.current.total).toBe(0)
  })

  it("ne devrait pas charger sans filters", async () => {
    const { usePayments } = await import("@/hooks/use-payments")
    const { result } = renderHook(() => usePayments())

    // Sans filters, isLoading est immédiatement false
    expect(result.current.isLoading).toBe(false)
    expect(result.current.payments).toEqual([])
    expect(result.current.total).toBe(0)
  })
})

describe("usePaymentStats", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("devrait charger les statistiques depuis le cache", async () => {
    const fakeStats = { totalRevenue: 150000, totalPayments: 6 }
    const { cachedFetch } = await import("@/hooks/use-cached-fetch")
    vi.mocked(cachedFetch).mockResolvedValue(fakeStats)

    const { usePaymentStats } = await import("@/hooks/use-payments")
    const { result } = renderHook(() => usePaymentStats())

    await act(async () => { await result.current.load() })

    expect(result.current.stats).toEqual(fakeStats)
    expect(result.current.error).toBeNull()
  })

  it("devrait charger les stats avec filtre de dates", async () => {
    const fakeStats = { totalRevenue: 50000, totalPayments: 2 }
    const { cachedFetch } = await import("@/hooks/use-cached-fetch")
    vi.mocked(cachedFetch).mockResolvedValue(fakeStats)

    const { usePaymentStats } = await import("@/hooks/use-payments")
    const { result } = renderHook(() => usePaymentStats())

    await act(async () => { await result.current.load("2025-01-01", "2025-12-31") })

    expect(result.current.stats).toEqual(fakeStats)
  })
})
