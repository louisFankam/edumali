import { describe, it, expect } from "vitest"
import { buildReceiptHTML, formatReceiptDate, formatReceiptAmount, receiptStyles } from "@/components/invoice/receipt-content"

describe("formatReceiptDate", () => {
  it("convertit yyyy-MM-dd en dd/mm/yyyy", () => {
    expect(formatReceiptDate("2026-06-13")).toBe("13/06/2026")
  })

  it("retourne vide pour une chaîne vide", () => {
    expect(formatReceiptDate("")).toBe("")
  })

  it("retourne vide pour null", () => {
    expect(formatReceiptDate(null as unknown as string)).toBe("")
  })
})

describe("formatReceiptAmount", () => {
  it("formate avec séparateur milliers et FCFA", () => {
    expect(formatReceiptAmount(40000)).toMatch(/40[ \u202f]000 FCFA/)
  })

  it("gère les petits montants", () => {
    expect(formatReceiptAmount(500)).toBe("500 FCFA")
  })

  it("gère zéro", () => {
    expect(formatReceiptAmount(0)).toBe("0 FCFA")
  })
})

describe("buildReceiptHTML", () => {
  const baseProps = {
    payment: { id: 1, amount: 40000, method: "espèces", date: "2026-06-13", feeTypeName: "Scolarité" },
    student: { firstName: "Amadou", lastName: "Diallo", parentName: "Moussa Diallo", parentPhone: "70123456", className: "6e A" },
    schoolInfo: { name: "École Test", address: "Bamako", phone: "20202020", email: "test@ecole.ml", director: "M. le Directeur" },
    receiptNumber: "FACT-001-130626",
  }

  it("génère le HTML avec le numéro de reçu", () => {
    const html = buildReceiptHTML(baseProps)
    expect(html).toContain("FACT-001-130626")
  })

  it("contient le nom de l'école", () => {
    const html = buildReceiptHTML(baseProps)
    expect(html).toContain("École Test")
  })

  it("contient le nom de l'élève", () => {
    const html = buildReceiptHTML(baseProps)
    expect(html).toContain("Diallo")
    expect(html).toContain("Amadou")
  })

  it("contient le montant formaté", () => {
    const html = buildReceiptHTML(baseProps)
    expect(html).toMatch(/40[ \u202f]000 FCFA/)
  })

  it("contient la date formatée en français", () => {
    const html = buildReceiptHTML(baseProps)
    expect(html).toContain("13/06/2026")
  })

  it("contient le mode de paiement", () => {
    const html = buildReceiptHTML(baseProps)
    expect(html).toContain("Espèces")
  })

  it("contient le type de frais", () => {
    const html = buildReceiptHTML(baseProps)
    expect(html).toContain("Scolarité")
  })

  it("contient le nom du parent", () => {
    const html = buildReceiptHTML(baseProps)
    expect(html).toContain("Moussa Diallo")
  })

  it("contient la classe", () => {
    const html = buildReceiptHTML(baseProps)
    expect(html).toContain("6e A")
  })

  it("contient le directeur", () => {
    const html = buildReceiptHTML(baseProps)
    expect(html).toContain("M. le Directeur")
  })

  it("inclut les styles CSS", () => {
    const html = buildReceiptHTML(baseProps)
    expect(html).toContain("receipt-container")
    expect(html).toContain("receipt-title")
  })

  it("fonctionne sans type de frais", () => {
    const props = {
      ...baseProps,
      payment: { ...baseProps.payment, feeTypeName: null },
    }
    const html = buildReceiptHTML(props)
    expect(html).not.toContain("null")
  })

  it("fonctionne sans parent", () => {
    const props = {
      ...baseProps,
      student: { ...baseProps.student, parentName: undefined, parentPhone: undefined },
    }
    const html = buildReceiptHTML(props)
    expect(html).toContain("FACT-001-130626")
  })

  it("fonctionne sans directeur", () => {
    const props = {
      ...baseProps,
      schoolInfo: { ...baseProps.schoolInfo, director: "" },
    }
    const html = buildReceiptHTML(props)
    expect(html).not.toContain("undefined")
  })

  it("fonctionne avec mode mobile_money", () => {
    const props = {
      ...baseProps,
      payment: { ...baseProps.payment, method: "mobile_money" },
    }
    const html = buildReceiptHTML(props)
    expect(html).toContain("Mobile Money")
  })

  it("inclut la clause légale", () => {
    const html = buildReceiptHTML(baseProps)
    expect(html).toContain("preuve de paiement")
  })

  it("génère un document HTML complet", () => {
    const html = buildReceiptHTML(baseProps)
    expect(html).toContain("<!DOCTYPE html>")
    expect(html).toContain("</html>")
  })
})
