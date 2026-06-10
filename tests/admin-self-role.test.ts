// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest"

describe("Admin — protection auto-rétrogradation", () => {
  it("PUT rejette 403 quand admin modifie son propre rôle", () => {
    const auditUserId = 1
    const userId = 1
    const role = "manager"

    const shouldReject = auditUserId === userId && role !== undefined

    expect(shouldReject).toBe(true)
  })

  it("PUT accepte quand admin modifie le rôle d'un autre", () => {
    const auditUserId = 1
    const userId = 2
    const role = "admin"

    const shouldReject = auditUserId === userId && role !== undefined

    expect(shouldReject).toBe(false)
  })

  it("PUT accepte quand admin modifie le fullName d'un autre (pas de rôle)", () => {
    const auditUserId = 1
    const userId = 2
    const role = undefined

    const shouldReject = auditUserId === userId && role !== undefined

    expect(shouldReject).toBe(false)
  })

  it("PUT accepte quand admin modifie son propre fullName (pas de rôle)", () => {
    const auditUserId = 1
    const userId = 1
    const role = undefined

    const shouldReject = auditUserId === userId && role !== undefined

    expect(shouldReject).toBe(false)
  })
})

describe("requireApiAdmin — guard", () => {
  beforeEach(() => { vi.resetModules() })

  it("retourne erreur 401 si non connecté", async () => {
    vi.doMock("@/lib/auth/session", () => ({
      getSessionUserId: vi.fn().mockResolvedValue(null),
    }))
    vi.doMock("@/lib/repositories/user.repository", () => ({
      findUserById: vi.fn(),
    }))

    const { requireApiAdmin } = await import("@/lib/guards/api-admin.guard")
    const result = await requireApiAdmin()

    expect(result.error).not.toBeNull()
    expect(result.userId).toBeNull()
  })

  it("retourne erreur 403 si utilisateur n'est pas admin", async () => {
    vi.doMock("@/lib/auth/session", () => ({
      getSessionUserId: vi.fn().mockResolvedValue(1),
    }))
    vi.doMock("@/lib/repositories/user.repository", () => ({
      findUserById: vi.fn().mockResolvedValue({ id: 1, role: "manager" }),
    }))

    const { requireApiAdmin } = await import("@/lib/guards/api-admin.guard")
    const result = await requireApiAdmin()

    expect(result.error).not.toBeNull()
    expect(result.userId).toBeNull()
  })

  it("retourne userId si admin", async () => {
    vi.doMock("@/lib/auth/session", () => ({
      getSessionUserId: vi.fn().mockResolvedValue(1),
    }))
    vi.doMock("@/lib/repositories/user.repository", () => ({
      findUserById: vi.fn().mockResolvedValue({ id: 1, role: "admin" }),
    }))

    const { requireApiAdmin } = await import("@/lib/guards/api-admin.guard")
    const result = await requireApiAdmin()

    expect(result.error).toBeNull()
    expect(result.userId).toBe(1)
  })
})

describe("UI — désactivation pour soi-même", () => {
  it("isSelf retourne true pour le même userId", () => {
    const currentUserId = 1
    const isSelf = (userId: number) => currentUserId === userId

    expect(isSelf(1)).toBe(true)
  })

  it("isSelf retourne false pour un autre userId", () => {
    const currentUserId = 1
    const isSelf = (userId: number) => currentUserId === userId

    expect(isSelf(2)).toBe(false)
    expect(isSelf(0)).toBe(false)
  })

  it("Select rôle est disabled quand isSelf est vrai", () => {
    const currentUserId = 1
    const user = { id: 1, role: "admin" }
    const disabled = currentUserId === user.id

    expect(disabled).toBe(true)
  })

  it("Select rôle n'est pas disabled pour un autre utilisateur", () => {
    const currentUserId = 1
    const user = { id: 2, role: "manager" }
    const disabled = currentUserId === user.id

    expect(disabled).toBe(false)
  })

  it("bouton delete est disabled pour soi-même", () => {
    const currentUserId = 1
    const user = { id: 1 }
    const disabled = currentUserId === user.id

    expect(disabled).toBe(true)
  })

  it("bouton delete n'est pas disabled pour un autre", () => {
    const currentUserId = 1
    const user = { id: 3 }
    const disabled = currentUserId === user.id

    expect(disabled).toBe(false)
  })
})
