import { describe, it, expect } from "vitest"
import { buildIdCardHTML, idCardStyles, DEFAULT_PHOTO_DATA_URL, formatDate, formatMatricule, type IdCardStudentData } from "@/lib/id-card/template"

describe("formatDate", () => {
  it("formate une date ISO en JJ/MM/AAAA", () => {
    expect(formatDate("2012-04-15")).toBe("15/04/2012")
  })

  it("retourne - pour une chaîne vide", () => {
    expect(formatDate("")).toBe("-")
  })

  it("retourne - pour null/undefined traité en string", () => {
    expect(formatDate(null as unknown as string)).toBe("-")
    expect(formatDate(undefined as unknown as string)).toBe("-")
  })
})

describe("formatMatricule", () => {
  it("génère le matricule EDM-année-id", () => {
    expect(formatMatricule("42", "2025-2026")).toBe("EDM-2025-0042")
  })

  it("pad le id à 4 chiffres", () => {
    expect(formatMatricule("1", "2025-2026")).toBe("EDM-2025-0001")
    expect(formatMatricule("180", "2025-2026")).toBe("EDM-2025-0180")
  })

  it("gère une année vide", () => {
    expect(formatMatricule("42", "")).toBe("EDM--0042")
  })
})

describe("buildIdCardHTML", () => {
  const baseStudent: IdCardStudentData = {
    id: "42",
    firstName: "Amadou",
    lastName: "Diallo",
    gender: "Masculin",
    birthDate: "2012-04-15",
    parentName: "Moussa Diallo",
    parentPhone: "70123456",
    address: "Bamako, Mali",
  }

  const baseSchoolInfo = {
    name: "École de Démonstration EduMali",
    director: "M. le Directeur",
    logoUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0i",
  }

  it("contient le nom et le prénom de l'élève", () => {
    const html = buildIdCardHTML(baseStudent, baseSchoolInfo, "", "5ème Année", "2025-2026", "")
    expect(html).toContain("Diallo")
    expect(html).toContain("Amadou")
  })

  it("contient la date de naissance formatée", () => {
    const html = buildIdCardHTML(baseStudent, baseSchoolInfo, "", "5ème Année", "2025-2026", "")
    expect(html).toContain("15/04/2012")
    expect(html).toContain("Né(e) le")
  })

  it("contient le numéro matricule", () => {
    const html = buildIdCardHTML(baseStudent, baseSchoolInfo, "", "5ème Année", "2025-2026", "")
    expect(html).toContain("EDM-2025-0042")
    expect(html).toContain("N°")
  })

  it("contient la classe", () => {
    const html = buildIdCardHTML(baseStudent, baseSchoolInfo, "", "5ème Année", "2025-2026", "")
    expect(html).toContain("5ème Année")
    expect(html).toContain("Classe")
  })

  it("contient le domicile", () => {
    const html = buildIdCardHTML(baseStudent, baseSchoolInfo, "", "5ème Année", "2025-2026", "")
    expect(html).toContain("Bamako, Mali")
    expect(html).toContain("Domicile")
  })

  it("affiche — quand il n'y a pas de domicile", () => {
    const student = { ...baseStudent, address: undefined }
    const html = buildIdCardHTML(student, baseSchoolInfo, "", "5ème Année", "2025-2026", "")
    expect(html).toContain("—")
  })

  it("contient l'année scolaire dans le titre", () => {
    const html = buildIdCardHTML(baseStudent, baseSchoolInfo, "", "5ème Année", "2025-2026", "")
    expect(html).toContain("2025-2026")
    expect(html).toContain("CARTE D'IDENTITÉ SCOLAIRE")
  })

  it("contient le nom du directeur", () => {
    const html = buildIdCardHTML(baseStudent, baseSchoolInfo, "", "5ème Année", "2025-2026", "")
    expect(html).toContain("M. le Directeur")
    expect(html).toContain("Le Directeur")
  })

  it("affiche Le Directeur même sans nom de directeur", () => {
    const html = buildIdCardHTML(baseStudent, null, "", "5ème Année", "2025-2026", "")
    expect(html).toContain("Le Directeur")
  })

  it("affiche le nom de l'école dans l'en-tête", () => {
    const html = buildIdCardHTML(baseStudent, baseSchoolInfo, "", "5ème Année", "2025-2026", "")
    expect(html).toContain("École de Démonstration EduMali")
  })

  it("affiche le nom de l'école même avec capName (classes d'examens)", () => {
    const html = buildIdCardHTML(baseStudent, baseSchoolInfo, "", "9ème Année", "2025-2026", "C.A.P de Sogoniko")
    expect(html).toContain("École de Démonstration EduMali")
    expect(html).toContain("C.A.P de Sogoniko")
  })

  it("utilise 'Établissement' comme fallback sans schoolInfo", () => {
    const html = buildIdCardHTML(baseStudent, null, "", "5ème Année", "2025-2026", "")
    expect(html).toContain("Établissement")
  })

  it("contient le logo de l'école quand logoUrl est fourni", () => {
    const html = buildIdCardHTML(baseStudent, baseSchoolInfo, "", "5ème Année", "2025-2026", "")
    expect(html).toContain("id-card-logo")
    expect(html).toContain("base64")
    expect(html).not.toContain("id-card-logo-fallback")
  })

  it("utilise le fallback quand il n'y a pas de logo", () => {
    const school = { name: "École Test", director: "M. Koné" }
    const html = buildIdCardHTML(baseStudent, school, "", "5ème Année", "2025-2026", "")
    expect(html).toContain("id-card-logo-fallback")
  })

  it("utilise la photo par défaut quand aucune photo n'est fournie", () => {
    const html = buildIdCardHTML(baseStudent, baseSchoolInfo, "", "5ème Année", "2025-2026", "")
    expect(html).toContain("data:image/svg+xml")
  })

  it("utilise la photo fournie quand elle existe", () => {
    const photo = "data:image/jpeg;base64,/9j/4AAQSkZJRg=="
    const html = buildIdCardHTML(baseStudent, baseSchoolInfo, photo, "5ème Année", "2025-2026", "")
    expect(html).toContain('/9j/4AAQSkZJRg==')
    expect(html).toContain('id-card-photo')
  })

  it("affiche les mentions RÉPUBLIQUE DU MALI et devise dans l'en-tête", () => {
    const html = buildIdCardHTML(baseStudent, baseSchoolInfo, "", "5ème Année", "2025-2026", "")
    expect(html).toContain("RÉPUBLIQUE DU MALI")
    expect(html).toContain("Un Peuple")
    expect(html).toContain("id-card-republic")
    expect(html).toContain("id-card-devise")
  })

  it("inclut les styles CSS partagés", () => {
    expect(idCardStyles).toContain(".id-card")
    expect(idCardStyles).toContain(".id-card-header")
    expect(idCardStyles).toContain(".id-card-flag")
    expect(idCardStyles).toContain(".id-card-title-line")
    expect(idCardStyles).toContain(".id-card-title")
    expect(idCardStyles).toContain(".id-card-photo")
    expect(idCardStyles).toContain(".id-card-director")
  })

  it("le titre utilise la couleur bleue", () => {
    expect(idCardStyles).toContain(".id-card-title")
    expect(idCardStyles).toContain("#1e40af")
    expect(idCardStyles).toContain("text-transform: uppercase")
  })

  it("les tailles de police sont légèrement augmentées", () => {
    expect(idCardStyles).toContain("font-size: 11pt")
    expect(idCardStyles).toContain("font-size: 7pt")
    expect(idCardStyles).toContain("font-size: 6.5pt")
    expect(idCardStyles).toContain("font-size: 8.5pt")
    expect(idCardStyles).toContain("font-size: 8pt")
  })

  it("contient le drapeau normal du Mali en haut à droite", () => {
    const html = buildIdCardHTML(baseStudent, baseSchoolInfo, "", "5ème Année", "2025-2026", "")
    expect(html).toContain("id-card-flag")
    expect(html).toContain("#14b53a")
    expect(html).toContain("#fcd116")
    expect(html).toContain("#ce1126")
  })

  it("DEFAULT_PHOTO_DATA_URL est un SVG valide", () => {
    expect(DEFAULT_PHOTO_DATA_URL).toMatch(/^data:image\/svg\+xml,/)
    expect(DEFAULT_PHOTO_DATA_URL).toContain("%3Csvg")
    expect(DEFAULT_PHOTO_DATA_URL).toContain("%3C/svg%3E")
  })
})
