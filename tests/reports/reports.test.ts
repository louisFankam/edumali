import { describe, it, expect } from "vitest"
import { escHtml, fmt } from "@/lib/reports/helpers"
import { buildBulletinHTML } from "@/lib/reports/bulletin"
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
