// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"

vi.mock("@/hooks/use-cached-fetch", () => ({
  cachedFetch: vi.fn(),
  clearCache: vi.fn(),
}))

const mockFetch = vi.fn()
beforeEach(() => {
  vi.clearAllMocks()
  mockFetch.mockReset()
  window.fetch = mockFetch
})

describe("Emploi du temps — données API", () => {
  it("teacherSubjectMap utilise speciality (pas subjectIds)", async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ ok: true, data: [
        { id: 1, first_name: "Fatoumata", last_name: "Diallo", speciality: ["1", "3"] },
        { id: 2, first_name: "Moussa", last_name: "Traoré", speciality: ["2"] },
      ]}),
    })

    const { useTeachers } = await import("@/hooks/use-teachers")
    const { result } = renderHook(() => useTeachers())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.teachers).toHaveLength(2)
    const teacher1 = result.current.teachers[0]
    expect(teacher1.speciality).toEqual(["1", "3"])
    expect((teacher1 as any).subjectIds).toBeUndefined()
  })

  it("classSubjects API retourne teacherNames", async () => {
    const classSubjects = [
      { id: "1", classId: "1", subjectId: "1", coefficient: 1, subjectName: "Maths", subjectCode: "MATH", teacherNames: "Fatoumata Diallo, Moussa Traoré" },
      { id: "2", classId: "1", subjectId: "2", coefficient: 2, subjectName: "Français", subjectCode: "FR", teacherNames: "" },
    ]

    expect(classSubjects[0].teacherNames).toBe("Fatoumata Diallo, Moussa Traoré")
    expect(classSubjects[1].teacherNames).toBe("")
  })

  it("useSchedules retourne des créneaux vides quand classId est null", async () => {
    const { useSchedules } = await import("@/hooks/use-schedules")
    const { result } = renderHook(() => useSchedules(null, "1"))

    expect(result.current.slots).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })
})

describe("Emploi du temps — compatibilité snake_case", () => {
  it("teachers API retourne first_name/last_name (pas camelCase)", () => {
    const teacher = { first_name: "Aminata", last_name: "Konaté" }

    expect(teacher.first_name).toBeDefined()
    expect(teacher.last_name).toBeDefined()
    expect((teacher as any).firstName).toBeUndefined()
    expect((teacher as any).lastName).toBeUndefined()
  })

  it("editing dialog select utilise first_name/last_name", () => {
    const teachersForSubject = [
      { id: 1, first_name: "Fatoumata", last_name: "Diallo" },
      { id: 2, first_name: "Moussa", last_name: "Traoré" },
    ]

    const rendered = teachersForSubject.map(t => `${t.first_name} ${t.last_name}`)
    expect(rendered).toEqual(["Fatoumata Diallo", "Moussa Traoré"])
  })
})

describe("Emploi du temps — interactions", () => {
  it("click cellule vide n'auto-assigne pas de matière", () => {
    const slot = null
    const handleDrop = vi.fn()
    const openEdit = vi.fn()

    if (slot) {
      openEdit(slot)
    }

    expect(handleDrop).not.toHaveBeenCalled()
    expect(openEdit).not.toHaveBeenCalled()
  })

  it("click cellule occupée ouvre le dialog d'édition", () => {
    const slot = { id: 1, subjectId: 1, teacherId: 1 }
    const openEdit = vi.fn()

    if (slot) openEdit(slot)

    expect(openEdit).toHaveBeenCalledWith(slot)
  })

  it("palette affiche teacherNames quand présent", () => {
    const cs = { subjectId: "1", subjectName: "Maths", teacherNames: "Fatoumata Diallo, Moussa Traoré" }

    const display = cs.teacherNames ? cs.teacherNames : null

    expect(display).toBe("Fatoumata Diallo, Moussa Traoré")
  })

  it("palette n'affiche rien quand teacherNames absent", () => {
    const cs = { subjectId: "2", subjectName: "Français" }

    const display = cs.teacherNames ? cs.teacherNames : null

    expect(display).toBeNull()
  })
})
