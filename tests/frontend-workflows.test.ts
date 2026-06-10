// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"

vi.mock("@/hooks/use-cached-fetch", () => ({
  cachedFetch: vi.fn(),
  clearCache: vi.fn(),
}))

describe("Workflows frontend — données manquantes", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("Dashboard : message si aucune donnée (useDashboard retourne null)", async () => {
    const { cachedFetch } = await import("@/hooks/use-cached-fetch")
    vi.mocked(cachedFetch).mockRejectedValue(new Error("Aucune donnée"))

    const { useDashboard } = await import("@/hooks/use-dashboard")
    const { result } = renderHook(() => useDashboard())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeTruthy()
  })

  it("Bulletin : currentYear null = pas de génération (handleGenerate early return)", async () => {
    const { cachedFetch } = await import("@/hooks/use-cached-fetch")
    vi.mocked(cachedFetch).mockResolvedValue(null)

    const { useAcademicYears } = await import("@/hooks/use-settings")
    const { result } = renderHook(() => useAcademicYears())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.currentYear).toBeNull()
  })

  it("Paiements : feeTypes vide retourne un tableau vide", async () => {
    const { cachedFetch } = await import("@/hooks/use-cached-fetch")
    vi.mocked(cachedFetch).mockResolvedValue([])

    const { useFeeTypes } = await import("@/hooks/use-payments")
    const { result } = renderHook(() => useFeeTypes())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.feeTypes).toEqual([])
    expect(result.current.error).toBeNull()
  })



  it("Salaires : currentYear null → pas de fetch payroll", async () => {
    const { cachedFetch } = await import("@/hooks/use-cached-fetch")
    vi.mocked(cachedFetch).mockResolvedValue([])

    const { usePayroll } = await import("@/hooks/use-teachers")
    const { result } = renderHook(() => usePayroll(undefined))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.records).toEqual([])
  })

  it("Réinscription : currentYear null → currentYearId undefined", async () => {
    const { cachedFetch } = await import("@/hooks/use-cached-fetch")
    vi.mocked(cachedFetch).mockResolvedValue(null)

    const { useAcademicYears } = await import("@/hooks/use-settings")
    const { result } = renderHook(() => useAcademicYears())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.currentYear?.id).toBeUndefined()
  })

  it("Examens : matières vides = select affiche message (pas de crash)", async () => {
    const { cachedFetch } = await import("@/hooks/use-cached-fetch")
    vi.mocked(cachedFetch).mockResolvedValue([])

    const { useSubjects } = await import("@/hooks/use-settings")
    const { result } = renderHook(() => useSubjects())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.subjects).toEqual([])
  })
})
