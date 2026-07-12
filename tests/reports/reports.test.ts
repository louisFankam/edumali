import { describe, it, expect } from "vitest"
import { escHtml, fmt } from "@/lib/reports/helpers"
import { buildBulletinHTML, buildBulletinDocument, bulletinStyles, previewStyles, buildAnnualBulletinHTML, annualBulletinStyles, annualPreviewStyles } from "@/lib/reports/bulletin"
import { buildClassReportHTML } from "@/lib/reports/class-report"
import { buildAttendanceHTML } from "@/lib/reports/attendance"
import { buildCertificateHTML } from "@/lib/reports/certificate"

describe("helpers", () => {
  describe("escHtml", () => {
    it("échappe & < > \" '", () => {
      expect(escHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#039;")
    })
    it("retourne une chaîne vide pour une entrée vide", () => {
      expect(escHtml("")).toBe("")
    })
    it("ne modifie pas le texte sans caractères spéciaux", () => {
      expect(escHtml("Bonjour le monde 123")).toBe("Bonjour le monde 123")
    })
    it("convertit null/undefined en string", () => {
      expect(escHtml(null as unknown as string)).toBe("")
      expect(escHtml(undefined as unknown as string)).toBe("")
    })
  })

  describe("fmt", () => {
    it("formate un nombre avec deux décimales en locale fr", () => {
      expect(fmt(15.5)).toBe("15,50")
    })
    it("retourne — pour null", () => {
      expect(fmt(null)).toBe("—")
    })
    it("retourne — pour undefined", () => {
      expect(fmt(undefined as unknown as number | null)).toBe("—")
    })
    it("arrondit correctement", () => {
      expect(fmt(10.1234)).toBe("10,12")
    })
  })
})

describe("bulletins", () => {
  const baseStudent = {
    lastName: "Diallo",
    firstName: "Amadou",
    subjects: [
      {
        subjectName: "Mathématiques",
        coefficient: 4,
        devoirAverage: 14,
        trimestrielleScore: 15,
        finalAverage: 14.5,
        absent: false,
        appreciation: "Bon travail",
      },
      {
        subjectName: "Français",
        coefficient: 3,
        devoirAverage: 12,
        trimestrielleScore: 13,
        finalAverage: 12.5,
        absent: false,
        appreciation: "Peut mieux faire",
      },
    ],
    generalAverage: 13.64,
    rank: 2,
    totalStudents: 25,
    mention: "Assez bien",
    totalActiveCoeffs: 7,
  }

  it("génère le HTML du bulletin avec les infos de l'élève", () => {
    const html = buildBulletinHTML(baseStudent, "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 1, "")
    expect(html).toContain("DIALLO")
    expect(html).toContain("Amadou")
    expect(html).toContain("6e A")
    expect(html).toContain("2/25")
    expect(html).toContain("14,50")
    expect(html).toContain("Assez bien")
  })

  it("affiche — pour les élèves absents", () => {
    const student = {
      ...baseStudent,
      subjects: baseStudent.subjects.map(s => ({ ...s, finalAverage: null, absent: true })),
      generalAverage: null,
      rank: null,
      mention: "",
    }
    const html = buildBulletinHTML(student, "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 1, "")
    expect(html).toContain("—")
    expect(html).not.toContain("DIALLO —")
  })

  it("inclut les matières et notes", () => {
    const html = buildBulletinHTML(baseStudent, "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 1, "")
    expect(html).toContain("Mathématiques")
    expect(html).toContain("Français")
    expect(html).toContain("Coeff")
  })

  it("gère le rang sans totalStudents (0 traité comme absent)", () => {
    const student = { ...baseStudent, rank: 1, totalStudents: 0 }
    const html = buildBulletinHTML(student, "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 1, "")
    expect(html).toContain("—")
  })

  it("gère le rang null", () => {
    const student = { ...baseStudent, rank: null, totalStudents: 0 }
    const html = buildBulletinHTML(student, "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 1, "")
    expect(html).toContain("—")
  })

  it("inclut l'en-tête REPUBLIQUE DU MALI", () => {
    const html = buildBulletinHTML(baseStudent, "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 1, "")
    expect(html).toContain("REPUBLIQUE DU MALI")
    expect(html).toContain("Un Peuple")
    expect(html).toContain("BULLETIN DE NOTES DE LA 1ÈME PERIODE")
  })

  it("inclut les infos école", () => {
    const html = buildBulletinHTML(baseStudent, "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 1, "")
    expect(html).toContain("École Test")
    expect(html).toContain("Bamako")
    expect(html).toContain("70123456")
  })

  it("inclut les signatures parent et directeur", () => {
    const html = buildBulletinHTML(baseStudent, "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 1, "")
    expect(html).toContain("PARENTS")
    expect(html).toContain("DIRECTEUR")
    expect(html).toContain("M. le Directeur")
  })

  it("inclut le logo dans le HTML si logoUrl est fourni", () => {
    const html = buildBulletinHTML(baseStudent, "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 1, "https://example.com/logo.png")
    expect(html).toContain("<img")
    expect(html).toContain("logo.png")
  })

  it("affiche trimester correctement", () => {
    const html = buildBulletinHTML(baseStudent, "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 2, "")
    expect(html).toContain("Trimestre 2")
  })

  it("n'utilise pas de couleurs ni styles modernes", () => {
    const html = buildBulletinHTML(baseStudent, "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 1, "")
    expect(html).not.toContain("#1e40af")
    expect(html).not.toContain("Helvetica")
    expect(html).not.toContain("sans-serif")
  })

  it("gère des matières vides", () => {
    const student = { ...baseStudent, subjects: [] }
    const html = buildBulletinHTML(student, "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 1, "")
    expect(html).toContain("Total")
  })
})

describe("buildBulletinDocument", () => {
  const baseStudent = {
    lastName: "Diallo",
    firstName: "Amadou",
    subjects: [
      { subjectName: "Math", coefficient: 4, devoirAverage: 14, trimestrielleScore: 15, finalAverage: 14.5, absent: false, appreciation: "Bien" },
    ],
    generalAverage: 14.5,
    rank: 1,
    totalStudents: 2,
    mention: "Bien",
    totalActiveCoeffs: 4,
  }

  const secondStudent = {
    lastName: "Traoré",
    firstName: "Fatoumata",
    subjects: [
      { subjectName: "Math", coefficient: 4, devoirAverage: 12, trimestrielleScore: 11, finalAverage: 11.5, absent: false, appreciation: "Passable" },
    ],
    generalAverage: 11.5,
    rank: 2,
    totalStudents: 2,
    mention: "Passable",
    totalActiveCoeffs: 4,
  }

  it("génère un document HTML complet", () => {
    const html = buildBulletinDocument([baseStudent, secondStudent], "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 1, "")
    expect(html).toContain("<!DOCTYPE html>")
    expect(html).toContain("<html")
    expect(html).toContain("</html>")
  })

  it("inclut les deux bulletins dans le document", () => {
    const html = buildBulletinDocument([baseStudent, secondStudent], "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 1, "")
    expect(html).toContain("DIALLO")
    expect(html).toContain("TRAORÉ")
    expect(html).toContain("Amadou")
    expect(html).toContain("Fatoumata")
  })

  it("affiche les bulletins en page paysage A4", () => {
    const html = buildBulletinDocument([baseStudent], "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 1, "")
    expect(html).toContain("page")
    expect(html).toContain("bulletin")
  })

  it("affiche deux bulletins par page", () => {
    const html = buildBulletinDocument([baseStudent, secondStudent], "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 1, "")
    const bulletinCount = (html.match(/class="bulletin"/g) || []).length
    expect(bulletinCount).toBe(2)
  })

  it("inclut le style bulletin dans le head", () => {
    const html = buildBulletinDocument([baseStudent], "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 1, "")
    expect(html).toContain("<style>")
    expect(html).toContain("Times New Roman")
  })

  it("crée plusieurs pages pour plus de 2 élèves", () => {
    const students = Array.from({ length: 5 }, (_, i) => ({
      ...baseStudent,
      lastName: `Élève${i + 1}`,
      firstName: "Test",
      rank: i + 1,
      totalStudents: 5,
    }))
    const html = buildBulletinDocument(students, "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 1, "")
    const pageCount = (html.match(/class="page"/g) || []).length
    expect(pageCount).toBe(3)
  })

  it("fonctionne avec des données réelles (logoUrl fourni)", () => {
    const html = buildBulletinDocument([baseStudent], "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 1, "https://example.com/logo.png")
    expect(html).toContain("https://example.com/logo.png")
    expect(html).toContain("REPUBLIQUE DU MALI")
  })

  it("affiche le rang avec totalStudents", () => {
    const html = buildBulletinDocument([baseStudent], "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", 1, "")
    expect(html).toContain("1/2")
  })
})

describe("bulletins annuels", () => {
  const baseStudent = {
    lastName: "Diallo",
    firstName: "Amadou",
    subjects: [
      {
        subjectName: "Mathématiques",
        coefficient: 4,
        trimesterAverages: { 1: 14.5, 2: 13, 3: 15 },
        annualAverage: 14.17,
        points: 56.68,
      },
      {
        subjectName: "Français",
        coefficient: 3,
        trimesterAverages: { 1: 12, 2: 11.5, 3: 13 },
        annualAverage: 12.17,
        points: 36.51,
      },
    ],
    annualGeneralAverage: 13.29,
    annualRank: 5,
    totalStudents: 30,
    totalPoints: 93.19,
    totalCoeffs: 7,
    admis: true,
  }

  it("génère le HTML du bulletin annuel avec le tableau récapitulatif", () => {
    const html = buildAnnualBulletinHTML(baseStudent, "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", [1, 2, 3], "")
    expect(html).toContain("BULLETIN ANNUEL")
    expect(html).toContain("RÉCAPITULATIF")
    expect(html).toContain("13,29")
    expect(html).toContain("93,19")
    expect(html).toContain("5/30")
    expect(html).toContain("ADMIS")
  })

  it("affiche le tableau récapitulatif après le tableau des notes", () => {
    const html = buildAnnualBulletinHTML(baseStudent, "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", [1, 2, 3], "")
    const notesIndex = html.indexOf('class="notes"')
    const recapIndex = html.indexOf('class="recap"')
    expect(recapIndex).toBeGreaterThan(notesIndex)
  })

  it("affiche ÉCHOUÉ en rouge si non admis", () => {
    const student = { ...baseStudent, admis: false, annualGeneralAverage: 9.5 }
    const html = buildAnnualBulletinHTML(student, "École Test", "Bamako", "70123456", "M. le Directeur", "2024-2025", "6e A", [1, 2, 3], "")
    expect(html).toContain("ÉCHOUÉ")
    expect(html).toContain("#dc2626")
  })

  it("inclut le style recap dans annualBulletinStyles", () => {
    expect(annualBulletinStyles).toContain("table.recap")
  })

  it("inclut le style recap dans annualPreviewStyles", () => {
    expect(annualPreviewStyles).toContain("table.recap")
  })
})
describe("bulletinStyles et previewStyles", () => {
  it("bulletinStyles définit Times New Roman et bordures noires", () => {
    expect(bulletinStyles).toContain("Times New Roman")
    expect(bulletinStyles).toContain("border: 1px solid #000")
    expect(bulletinStyles).toContain("A4 landscape")
  })

  it("previewStyles utilise la classe .bulletin comme bulletinStyles", () => {
    expect(previewStyles).toContain(".bulletin")
    expect(previewStyles).toContain("Times New Roman")
    expect(previewStyles).toContain("border: 1px solid #000")
  })

  it("les deux styles utilisent @page et font-family serif", () => {
    expect(bulletinStyles).toContain("font-family")
    expect(previewStyles).toContain("font-family")
    expect(bulletinStyles).toContain("serif")
    expect(previewStyles).toContain("serif")
  })

  it("n'ont pas de styles modernes (bleu, Helvetica)", () => {
    expect(bulletinStyles).not.toContain("#1e40af")
    expect(bulletinStyles).not.toContain("Helvetica")
    expect(previewStyles).not.toContain("#1e40af")
    expect(previewStyles).not.toContain("Helvetica")
  })
})

describe("class-report", () => {
  const baseParams = {
    className: "6e A",
    academicYearName: "2024-2025",
    trimester: 1,
    totalStudents: 25,
    studentsFollowed: 23,
    averageGrade: "13,50/20",
    numericAverage: 13.5,
    passRate: 68,
    distribution: { excellent: 3, bien: 5, assezBien: 7, passable: 5, insuffisant: 3 },
    topSubjects: [{ name: "Mathématiques", average: 14.5 }],
    weakSubjects: [{ name: "Anglais", average: 8.2 }],
    trimesterAverages: [13.5, 12.8, 14.1],
    attendance: {
      total: 500,
      présent: 420,
      absent: 40,
      retard: 25,
      congé: 15,
      rate: 84,
    },
    schoolName: "École Test",
    schoolAddress: "Bamako",
    schoolPhone: "70123456",
    directorName: "M. le Directeur",
  }

  it("génère le HTML du rapport de classe", () => {
    const html = buildClassReportHTML(baseParams)
    expect(html).toContain("6e A")
    expect(html).toContain("13,50/20")
    expect(html).toContain("68%")
    expect(html).toContain("Mathématiques")
    expect(html).toContain("Anglais")
  })

  it("inclut les stats de présence si fournies", () => {
    const html = buildClassReportHTML(baseParams)
    expect(html).toContain("420")
    expect(html).toContain("84%")
  })

  it("fonctionne sans présence", () => {
    const params = { ...baseParams, attendance: undefined }
    const html = buildClassReportHTML(params)
    expect(html).not.toContain("Taux de présence")
  })

  it("fonctionne avec une distribution vide", () => {
    const params = { ...baseParams, distribution: { excellent: 0, bien: 0, assezBien: 0, passable: 0, insuffisant: 0 } }
    const html = buildClassReportHTML(params)
    expect(html).toContain("Aucune donnée")
  })

  it("colore le taux de réussite selon le seuil", () => {
    const pass70 = buildClassReportHTML({ ...baseParams, passRate: 70 })
    expect(pass70).toContain("text-green")
    const pass50 = buildClassReportHTML({ ...baseParams, passRate: 50 })
    expect(pass50).toContain("text-orange")
    const pass30 = buildClassReportHTML({ ...baseParams, passRate: 30 })
    expect(pass30).toContain("text-red")
  })
})

describe("attendance", () => {
  const baseParams = {
    className: "6e A",
    trimester: 2,
    academicYearName: "2024-2025",
    schoolName: "École Test",
    schoolAddress: "Bamako",
    schoolPhone: "70123456",
    directorName: "M. le Directeur",
    total: 500,
    présent: 420,
    absent: 40,
    retard: 25,
    congé: 15,
    rate: 84,
  }

  it("génère le HTML du relevé de présences", () => {
    const html = buildAttendanceHTML(baseParams)
    expect(html).toContain("6e A")
    expect(html).toContain("Trimestre 2")
    expect(html).toContain("420")
    expect(html).toContain("84%")
  })

  it("colore le taux selon les seuils", () => {
    const high = buildAttendanceHTML({ ...baseParams, rate: 85 })
    expect(high).toContain("text-green")
    const mid = buildAttendanceHTML({ ...baseParams, rate: 70 })
    expect(mid).toContain("text-orange")
    const low = buildAttendanceHTML({ ...baseParams, rate: 40 })
    expect(low).toContain("text-red")
  })

  it("gère total=0 sans erreur", () => {
    const html = buildAttendanceHTML({ ...baseParams, total: 0, présent: 0, absent: 0, retard: 0, congé: 0, rate: 0 })
    expect(html).toContain("0%")
  })
})

describe("certificate", () => {
  const baseParams = {
    studentName: "Amadou Diallo",
    studentId: "2024-001",
    className: "6e A",
    schoolName: "École Test",
    schoolAddress: "Bamako",
    schoolPhone: "70123456",
    directorName: "M. le Directeur",
    academicYearName: "2024-2025",
  }

  it("génère le HTML du certificat", () => {
    const html = buildCertificateHTML(baseParams)
    expect(html).toContain("Amadou Diallo")
    expect(html).toContain("6e A")
    expect(html).toContain("2024-2025")
    expect(html).toContain("2024-001")
    expect(html).toContain("CERTIFICAT DE SCOLARITÉ")
  })

  it("inclut la date et lieu de naissance si fournis", () => {
    const html = buildCertificateHTML({ ...baseParams, birthDate: "15/03/2012", birthPlace: "Bamako" })
    expect(html).toContain("15/03/2012")
    expect(html).toContain("Bamako")
  })

  it("inclut l'email si fourni", () => {
    const html = buildCertificateHTML({ ...baseParams, schoolEmail: "contact@ecole.test" })
    expect(html).toContain("contact@ecole.test")
  })

  it("signe par le directeur", () => {
    const html = buildCertificateHTML(baseParams)
    expect(html).toContain("M. le Directeur")
    expect(html).toContain("Le Directeur")
  })
})
