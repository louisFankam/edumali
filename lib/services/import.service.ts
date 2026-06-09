import * as XLSX from "xlsx"
import { db } from "@/lib/db"
import { students, enrollments } from "@/lib/models/schema"
import { findAllClasses } from "@/lib/repositories/class.repository"
import { findCurrentAcademicYear } from "@/lib/repositories/academic-year.repository"
import { logAudit } from "@/lib/services/audit.service"

const COLUMN_MAP: Record<string, string> = {
  nom: "lastName",
  "nom de famille": "lastName",
  last_name: "lastName",
  lastname: "lastName",
  prénom: "firstName",
  "prénom(s)": "firstName",
  prenom: "firstName",
  first_name: "firstName",
  firstname: "firstName",
  "date de naissance": "birthDate",
  "date naissance": "birthDate",
  date_naissance: "birthDate",
  "date de naiss": "birthDate",
  dateofbirth: "birthDate",
  "date of birth": "birthDate",
  naissance: "birthDate",
  sexe: "gender",
  genre: "gender",
  classe: "classId",
  "classe actuelle": "classId",
  "nom parent": "parentName",
  "parent nom": "parentName",
  parent_name: "parentName",
  parentname: "parentName",
  parent: "parentName",
  "père/mère": "parentName",
  tuteur: "parentName",
  telephone: "parentPhone",
  téléphone: "parentPhone",
  tel: "parentPhone",
  phone: "parentPhone",
  "telephone parent": "parentPhone",
  "téléphone parent": "parentPhone",
  "tel parent": "parentPhone",
  parent_phone: "parentPhone",
  parentphone: "parentPhone",
  "contact parent": "parentPhone",
  adresse: "address",
  domicile: "address",
  résidence: "address",
  residence: "address",
  "réduction type": "discountType",
  "type réduction": "discountType",
  reduction_type: "discountType",
  discount_type: "discountType",
  "réduction valeur": "discountValue",
  "valeur réduction": "discountValue",
  reduction_value: "discountValue",
  discount_value: "discountValue",
  "réduction raison": "discountReason",
  raison: "discountReason",
  motif: "discountReason",
  reduction_reason: "discountReason",
  discount_reason: "discountReason",
}

function findColumn(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}
  for (const header of headers) {
    const key = header.toLowerCase().trim().replace(/[_-]/g, " ")
    const field = COLUMN_MAP[key]
    if (field) mapping[field] = header
  }
  return mapping
}

export interface ImportRow {
  line: number
  firstName: string
  lastName: string
  gender: string
  birthDate: string
  nationality?: string
  parentName: string
  parentPhone: string
  address?: string
  className: string
  discountType?: string | null
  discountValue?: number | null
  discountReason?: string | null
  errors: string[]
}

export interface ImportResult {
  total: number
  imported: number
  errors: { line: number; message: string }[]
}

export async function parseFile(
  file: ArrayBuffer,
): Promise<{ rows: ImportRow[]; rawData: Record<string, string>[] }> {
  const bytes = new Uint8Array(file)
  const fullText = new TextDecoder().decode(bytes)

  const headerBytes = bytes.slice(0, Math.min(bytes.length, 512))
  const headerText = new TextDecoder().decode(headerBytes)

  const isCsv = !headerText.includes("\u0000") && (
    headerText.includes(",") || headerText.includes(";") || headerText.includes("\t")
  )

  let workbook: XLSX.WorkBook

  if (isCsv) {
    let text = fullText
    if (headerText.includes(";")) {
      text = text.replace(/;/g, ",")
    }
    workbook = XLSX.read(text, { type: "string", cellDates: true })
  } else {
    workbook = XLSX.read(bytes, { type: "array", cellDates: true })
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rawRaw = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "", raw: true, cellDates: true })
  const rawData: Record<string, string>[] = rawRaw.map(row => {
    const obj: Record<string, string> = {}
    for (const [k, v] of Object.entries(row)) {
      if (v instanceof Date) {
        obj[k] = v.toISOString().split("T")[0]
      } else {
        obj[k] = typeof v === "string" ? v : v == null ? "" : String(v)
      }
    }
    return obj
  })


  const classes = await findAllClasses()
  const classMap = new Map<string, number>()
  for (const c of classes) classMap.set(c.name.toLowerCase().trim(), c.id)

  const headers = rawData.length > 0 ? Object.keys(rawData[0]) : []
  const colMap = findColumn(headers)

  const rows: ImportRow[] = []
  const seen = new Set<string>()

  for (let i = 0; i < rawData.length; i++) {
    const raw = rawData[i]
    const line = i + 2
    const errors: string[] = []

    const firstName = (raw[colMap.firstName] || "").trim()
    const lastName = (raw[colMap.lastName] || "").trim()
    const gender = (raw[colMap.gender] || "").trim()
    const birthDate = (raw[colMap.birthDate] || "").trim()
    const parentName = (raw[colMap.parentName] || "").trim()
    const parentPhone = (raw[colMap.parentPhone] || "").trim()
    const address = (raw[colMap.address] || "").trim()
    const className = (raw[colMap.classId] || "").trim()
    const discountType = (raw[colMap.discountType] || "").trim().toLowerCase()
    const discountValueRaw = (raw[colMap.discountValue] || "").trim()
    const discountReason = (raw[colMap.discountReason] || "").trim()

    if (!firstName) errors.push("Prénom manquant")
    if (!lastName) errors.push("Nom manquant")
    if (!gender) errors.push("Sexe manquant")
    else if (!["masculin", "féminin", "m", "f"].includes(gender.toLowerCase()))
      errors.push(`Sexe invalide: "${gender}" (attendu: Masculin/Féminin)`)

    if (!birthDate) errors.push("Date de naissance manquante")
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate))
      errors.push(`Format date invalide: "${birthDate}" (attendu: AAAA-MM-JJ)`)

    if (!parentName) errors.push("Nom du parent manquant")
    if (!parentPhone) errors.push("Téléphone du parent manquant")

    if (!className) errors.push("Classe manquante")
    else if (!classMap.has(className.toLowerCase())) {
      const available = [...classMap.keys()].join(", ")
      errors.push(`Classe "${className}" introuvable. Classes disponibles: ${available}`)
    }

    let discountTypeFinal: string | null = null
    let discountValueFinal: number | null = null
    if (discountType) {
      if (["pourcentage", "%", "percentage"].includes(discountType)) {
        discountTypeFinal = "percentage"
      } else if (["fixe", "fixed", "montant"].includes(discountType)) {
        discountTypeFinal = "fixed"
      } else {
        errors.push(`Type de réduction invalide: "${discountType}" (attendu: pourcentage/fixe)`)
      }
    }
    if (discountValueRaw) {
      const parsed = Number(discountValueRaw.replace(/[^0-9.,]/g, ""))
      if (isNaN(parsed) || parsed <= 0) {
        errors.push(`Valeur de réduction invalide: "${discountValueRaw}"`)
      } else {
        discountValueFinal = parsed
      }
    }

    if (errors.length > 0) {
      rows.push({
        line, firstName, lastName, gender, birthDate, parentName, parentPhone,
        address, className, discountType: discountTypeFinal, discountValue: discountValueFinal,
        discountReason, errors,
      })
      continue
    }

    const genderFinal = gender.toLowerCase() === "m" || gender.toLowerCase() === "masculin" ? "Masculin" : "Féminin"
    const classId = classMap.get(className.toLowerCase())!

    const dupKey = `${firstName}|${lastName}|${classId}`
    if (seen.has(dupKey)) {
      errors.push("Doublon détecté dans le fichier (même prénom + nom + classe)")
      rows.push({
        line, firstName, lastName, gender: genderFinal, birthDate, parentName, parentPhone,
        address, className: String(classId), discountType: discountTypeFinal,
        discountValue: discountValueFinal, discountReason, errors,
      })
      continue
    }
    seen.add(dupKey)

    rows.push({
      line, firstName, lastName, gender: genderFinal, birthDate, parentName, parentPhone,
      address, className: String(classId), discountType: discountTypeFinal,
      discountValue: discountValueFinal, discountReason, errors: [],
    })
  }

  return { rows, rawData }
}

export async function importStudents(rows: ImportRow[], userId?: number): Promise<ImportResult> {
  const validRows = rows.filter(r => r.errors.length === 0 && r.className)
  const errorRows = rows.filter(r => r.errors.length > 0)

  const currentYear = await findCurrentAcademicYear()
  if (!currentYear) {
    return { total: rows.length, imported: 0, errors: [{ line: 0, message: "Aucune année scolaire active trouvée" }] }
  }

  let imported = 0
  const importErrors: { line: number; message: string }[] = [...errorRows.map(r => ({ line: r.line, message: r.errors.join("; ") }))]

  for (const row of validRows) {
    try {
      const classId = Number(row.className)
      const registrationDate = new Date().toISOString().split("T")[0]

      const [student] = await db.insert(students).values({
        firstName: row.firstName,
        lastName: row.lastName,
        gender: row.gender as "Masculin" | "Féminin",
        birthDate: row.birthDate,
        nationality: row.nationality || null,
        parentName: row.parentName,
        parentPhone: row.parentPhone,
        address: row.address || null,
        classId,
        registrationDate,
        status: "Actif",
        discountType: row.discountType as "percentage" | "fixed" | null ?? null,
        discountValue: row.discountValue ?? null,
        discountReason: row.discountReason ?? null,
      }).returning()

      await db.insert(enrollments).values({
        studentId: student.id,
        classId,
        academicYearId: currentYear.id,
        enrollmentDate: registrationDate,
        status: "inscrit",
      })

      imported++
    } catch (err: any) {
      importErrors.push({ line: row.line, message: err.message || "Erreur inconnue" })
    }
  }

  logAudit({ tableName: "students", recordId: 0, action: "create", userId, newValues: { batch: true, count: imported, total: rows.length, import: true } });
  return { total: rows.length, imported, errors: importErrors }
}