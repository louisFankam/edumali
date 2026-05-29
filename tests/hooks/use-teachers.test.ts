// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"

describe("usePayroll", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal("fetch", vi.fn())
  })

  const fakePayrollRecords = [
    {
      id: "1",
      teacher_id: "1",
      first_name: "Jean",
      last_name: "Dupont",
      month: 5,
      year: 2026,
      amount: 150000,
      bonus: 0,
      deductions: 0,
      paid_at: "2026-05-29T12:00:00.000Z",
      notes: "",
    },
    {
      id: "2",
      teacher_id: "1",
      first_name: "Jean",
      last_name: "Dupont",
      month: 4,
      year: 2026,
      amount: 150000,
      bonus: 0,
      deductions: 0,
      paid_at: "2026-04-25T12:00:00.000Z",
      notes: "",
    },
  ]

  it("devrait charger les salaires avec les filtres teacherId + from/to", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, data: fakePayrollRecords }),
    } as Response)

    const { usePayroll } = await import("@/hooks/use-teachers")
    const { result } = renderHook(() =>
      usePayroll({ teacherId: "1", from: "2026-01-01", to: "2026-12-31" })
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.records).toEqual(fakePayrollRecords)
    expect(result.current.error).toBeNull()

    // Vérifie que l'URL appelée contient les bons paramètres
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("teacherId=1"),
      expect.any(Object)
    )
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("from=2026-01-01"),
      expect.any(Object)
    )
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("to=2026-12-31"),
      expect.any(Object)
    )
  })

  it("devrait envoyer month/year corrects via addPayroll (pas d'inversion)", async () => {
    vi.mocked(fetch)
      // Premier appel = POST (addPayroll)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            id: "3",
            teacher_id: "1",
            month: 5,
            year: 2026,
            amount: 150000,
            bonus: 0,
            deductions: 0,
            paid_at: "2026-05-29T12:00:00.000Z",
            notes: "",
          },
        }),
      } as Response)
      // Deuxième appel = GET (refetch après add)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, data: fakePayrollRecords }),
      } as Response)

    const { usePayroll } = await import("@/hooks/use-teachers")
    const { result } = renderHook(() =>
      usePayroll({ teacherId: "1", from: "2026-01-01", to: "2026-12-31" })
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Simule un paiement avec month=5, year=2026
    await act(async () => {
      await result.current.addPayroll({
        teacher_id: "1",
        month: 5,
        year: 2026,
        amount: 150000,
        bonus: 0,
        deductions: 0,
        paid_at: "2026-05-29T12:00:00.000Z",
        notes: "",
      })
    })

    // Vérifie que le POST a envoyé month=5, year=2026 (pas inversé)
    const postCall = vi.mocked(fetch).mock.calls.find(
      ([url, opts]) => opts && typeof opts === "object" && (opts as RequestInit).method === "POST"
    )
    expect(postCall).toBeDefined()
    const body = JSON.parse((postCall![1] as RequestInit).body as string)
    expect(body.month).toBe(5)
    expect(body.year).toBe(2026)
    // Vérifie que ce n'est PAS inversé
    expect(body.month).not.toBe(2026)
    expect(body.year).not.toBe(5)
  })

  it("devrait retourner un tableau vide si pas de filtres", async () => {
    const { usePayroll } = await import("@/hooks/use-teachers")
    const { result } = renderHook(() => usePayroll())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.records).toEqual([])
  })

  it("devrait gérer les erreurs de l'API", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: false, message: "Erreur de base de données" }),
    } as Response)

    const { usePayroll } = await import("@/hooks/use-teachers")
    const { result } = renderHook(() =>
      usePayroll({ teacherId: "1" })
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBeTruthy()
    expect(result.current.records).toEqual([])
  })

  it("devrait transmettre les bons paramètres d'URL (teacherId, from, to)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, data: [] }),
    } as Response)

    const { usePayroll } = await import("@/hooks/use-teachers")
    renderHook(() =>
      usePayroll({ teacherId: "2", from: "2026-05-30", to: "2026-06-28" })
    )

    await waitFor(() => expect(fetch).toHaveBeenCalled())

    const url = vi.mocked(fetch).mock.calls[0][0] as string
    expect(url).toContain("teacherId=2")
    expect(url).toContain("from=2026-05-30")
    expect(url).toContain("to=2026-06-28")
  })
})
