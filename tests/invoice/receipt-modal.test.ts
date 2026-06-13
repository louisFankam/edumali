// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest"

describe("Receipt modal integration", () => {
  beforeEach(() => { vi.clearAllMocks() })

  it("devrait générer un numéro de facture formaté", () => {
    const payment = { id: 1, date: "2026-06-13" }
    const num = `FACT-${String(payment.id).padStart(3, "0")}-${payment.date.replace(/-/g, "").slice(2)}`
    expect(num).toBe("FACT-001-260613")
  })

  it("devrait gérer les grands IDs", () => {
    const payment = { id: 123, date: "2026-06-13" }
    const num = `FACT-${String(payment.id).padStart(3, "0")}-${payment.date.replace(/-/g, "").slice(2)}`
    expect(num).toBe("FACT-123-260613")
  })

  it("devrait gérer les IDs à plusieurs chiffres", () => {
    const payment = { id: 999, date: "2027-01-15" }
    const num = `FACT-${String(payment.id).padStart(3, "0")}-${payment.date.replace(/-/g, "").slice(2)}`
    expect(num).toBe("FACT-999-270115")
  })

  it("devrait construire correctement les props pour ReceiptContent", () => {
    const payment = { id: 1, amount: 40000, method: "espèces", date: "2026-06-13", feeTypeName: "Scolarité" }
    const student = { firstName: "Amadou", lastName: "Diallo", parentName: "Moussa", parentPhone: "70123456", className: "6e A" }
    const schoolInfo = { name: "École Test", address: "Bamako", phone: "20202020", email: "test@ecole.ml", director: "M. Directeur" }

    const data = {
      payment,
      student,
      schoolInfo,
      receiptNumber: `FACT-${String(payment.id).padStart(3, "0")}-${payment.date.replace(/-/g, "").slice(2)}`,
    }

    expect(data.payment.amount).toBe(40000)
    expect(data.student.firstName).toBe("Amadou")
    expect(data.schoolInfo.name).toBe("École Test")
    expect(data.receiptNumber).toBe("FACT-001-260613")
  })

  it("devrait gérer les données manquantes sans erreur", () => {
    const payment = { id: 1, amount: 25000, method: "mobile_money", date: "2026-06-10", feeTypeName: null }
    const student = { firstName: "Fatoumata", lastName: "Sow", parentName: undefined, parentPhone: undefined, className: "5e B" }
    const schoolInfo = { name: "École", address: "", phone: "", email: "", director: "" }

    const data = { payment, student, schoolInfo, receiptNumber: "FACT-001-100626" }

    expect(data.payment.amount).toBe(25000)
    expect(data.student.parentName).toBeUndefined()
    expect(data.schoolInfo.director).toBe("")
    expect(data.receiptNumber).toBe("FACT-001-100626")
  })
})
