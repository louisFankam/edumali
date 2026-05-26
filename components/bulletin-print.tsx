"use client"

import React from "react"

interface SubjectRow {
  subjectName: string
  coefficient: number
  devoirAverage: number | null
  trimestrielleScore: number | null
  finalAverage: number | null
  absent: boolean
}

interface PrintStudent {
  firstName: string
  lastName: string
  subjects: SubjectRow[]
  generalAverage: number | null
  rank: number | null
  mention: string
  absentCount: number
  totalActiveCoeffs: number
}

interface BulletinPrintProps {
  students: PrintStudent[]
  className: string
  trimester: number
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  directorName: string
  academicYear: string
  logoUrl?: string
}

function fmt(n: number | null): string {
  if (n === null || n === undefined) return "—"
  return n.toFixed(2).replace(".", ",")
}

function Bulletin({ student, className, trimester, schoolName, schoolAddress, schoolPhone, directorName, academicYear, logoUrl }: {
  student: PrintStudent
  className: string
  trimester: number
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  directorName: string
  academicYear: string
  logoUrl?: string
}) {
  return (
    <div className="bulletin">
      <div className="bulletin-header">
        <div className="header-row">
          <div className="header-left">
            <div className="school-name">{schoolName}</div>
            <div className="school-detail">{schoolAddress}</div>
            <div className="school-detail">{schoolPhone}</div>
          </div>
          <div className="header-center">
            <div className="bulletin-republic">REPUBLIQUE DU MALI</div>
            <div className="bulletin-devise">Un Peuple – Un But – Une Foi</div>
          </div>
          <div className="header-right">
            {logoUrl && (
              <div className="bulletin-logo">
                <img src={logoUrl} alt="Logo" />
              </div>
            )}
          </div>
        </div>
        <div className="bulletin-title">BULLETIN SCOLAIRE</div>
        <div className="bulletin-subtitle">Année scolaire {academicYear} – Trimestre {trimester}</div>
      </div>

      <div className="bulletin-info">
        <table>
          <tbody>
            <tr>
              <td className="info-label">Élève</td>
              <td className="info-value">{student.lastName.toUpperCase()} {student.firstName}</td>
              <td className="info-label">Classe</td>
              <td className="info-value">{className}</td>
              <td className="info-label">Rang</td>
              <td className="info-value">{student.rank ? `${student.rank}/${student.subjects.length > 0 ? "—" : "—"}` : "—"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <table className="bulletin-notes">
        <thead>
          <tr>
            <th className="col-matiere">Matières</th>
            <th className="col-coeff">Coeff.</th>
            <th className="col-note">N.Classe</th>
            <th className="col-note">N.Comp</th>
            <th className="col-note">Moy.Générale</th>
            <th className="col-app">Appréciation</th>
          </tr>
        </thead>
        <tbody>
          {student.subjects.map((s, i) => (
            <tr key={i} className={s.absent ? "absent-row" : ""}>
              <td className="col-matiere">{s.subjectName}</td>
              <td className="col-coeff">{s.absent ? "—" : s.coefficient}</td>
              <td className="col-note">{s.absent ? "—" : fmt(s.devoirAverage)}</td>
              <td className="col-note">{s.absent ? "—" : fmt(s.trimestrielleScore)}</td>
              <td className="col-note note-finale">{s.absent ? "—" : fmt(s.finalAverage)}</td>
              <td className="col-app">{s.absent ? "Absent" : ""}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="total-row">
            <td className="col-matiere">Total</td>
            <td className="col-coeff">{student.totalActiveCoeffs}</td>
            <td colSpan={2}></td>
            <td className="col-note note-finale">{fmt(student.generalAverage)}</td>
            <td className="col-app">{student.mention}</td>
          </tr>
        </tfoot>
      </table>

      <div className="bulletin-footer">
        <div className="footer-parent">
          <div className="signature-line">_________________________</div>
          <div>Parent</div>
        </div>
        <div className="footer-director">
          <div>Le Directeur</div>
          <div>{directorName}</div>
        </div>
      </div>
    </div>
  )
}

export default function BulletinPrint({ students, className, trimester, schoolName, schoolAddress, schoolPhone, directorName, academicYear, logoUrl }: BulletinPrintProps) {
  if (students.length === 0) return null

  const pairs: PrintStudent[][] = []
  for (let i = 0; i < students.length; i += 2) {
    pairs.push(students.slice(i, i + 2))
  }

  return (
    <div className="bulletin-print-container">
      <style>{`
        .bulletin-print-container {
          font-family: 'Times New Roman', Times, serif;
          color: #000;
          background: #fff;
        }
        .a4-page {
          width: 297mm;
          min-height: 210mm;
          display: flex;
          flex-direction: row;
          align-items: stretch;
          padding: 0;
          margin: 0 auto;
          box-sizing: border-box;
        }
        .bulletin {
          width: 50%;
          border: 1px solid #000;
          padding: 3mm;
          margin: 0;
          box-sizing: border-box;
          page-break-inside: avoid;
          break-inside: avoid;
          display: flex;
          flex-direction: column;
        }
        .bulletin:first-child {
          border-right: none;
        }
        .header-row {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          margin-bottom: 1.5mm;
        }
        .header-left {
          flex: 1;
          text-align: left;
          font-size: 7pt;
        }
        .header-left .school-name {
          font-weight: bold;
          font-size: 8pt;
          text-transform: uppercase;
        }
        .header-left .school-detail {
          font-size: 6.5pt;
          color: #333;
        }
        .header-center {
          flex: 1;
          text-align: center;
        }
        .header-right {
          flex: 0 0 auto;
          text-align: right;
        }
        .bulletin-header {
          margin-bottom: 2mm;
        }
        .bulletin-logo {
          text-align: right;
        }
        .bulletin-logo img {
          max-height: 14mm;
          width: auto;
          object-fit: contain;
        }
        .bulletin-republic {
          font-size: 9pt;
          font-weight: bold;
          letter-spacing: 1pt;
        }
        .bulletin-devise {
          font-size: 6.5pt;
          font-style: italic;
        }
        .bulletin-title {
          text-align: center;
          font-size: 10pt;
          font-weight: bold;
          text-decoration: underline;
          margin: 0.5mm 0;
        }
        .bulletin-subtitle {
          text-align: center;
          font-size: 7pt;
          margin-bottom: 1mm;
        }
        .bulletin-info table {
          width: 100%;
          border-collapse: collapse;
          font-size: 7pt;
          margin-bottom: 1mm;
        }
        .bulletin-info td {
          padding: 0.5mm 1mm;
          vertical-align: top;
        }
        .bulletin-info .info-label {
          font-weight: bold;
          white-space: nowrap;
          width: 1%;
        }
        .bulletin-info .info-value {
          padding-right: 2mm;
        }
        .bulletin-notes {
          width: 100%;
          border: 1px solid #000;
          border-collapse: collapse;
          font-size: 7pt;
          margin-bottom: 2mm;
          flex: 1;
        }
        .bulletin-notes th {
          border: 1px solid #000;
          padding: 1mm 0.5mm;
          font-weight: bold;
          text-align: center;
          background: #f0f0f0;
        }
        .bulletin-notes td {
          border: 1px solid #000;
          padding: 1mm 0.5mm;
          text-align: center;
        }
        .col-matiere { text-align: left; width: 25%; }
        .col-coeff { width: 8%; }
        .col-note { width: 14%; }
        .col-app { width: 25%; text-align: left; font-style: italic; }
        .note-finale { font-weight: bold; }
        .absent-row td { color: #888; }
        .absent-row .col-matiere { color: #000; }
        .total-row td {
          font-weight: bold;
          border-top: 2px solid #000;
        }
        .bulletin-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          font-size: 7pt;
          margin-top: 1mm;
        }
        .footer-parent {
          text-align: center;
        }
        .footer-parent .signature-line {
          font-size: 8pt;
          letter-spacing: 1pt;
        }
        .footer-director {
          text-align: center;
        }
        @media print {
          @page {
            size: A4 landscape;
            margin: 3mm;
          }
          body { margin: 0; padding: 0; }
          .a4-page {
            margin: 0;
            page-break-after: always;
          }
          .bulletin {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      {pairs.map((pair, pi) => (
        <div key={pi} className="a4-page">
          {pair.map((student, si) => (
            <Bulletin
              key={student.lastName + student.firstName + si}
              student={student}
              className={className}
              trimester={trimester}
              schoolName={schoolName}
              schoolAddress={schoolAddress}
              schoolPhone={schoolPhone}
              directorName={directorName}
              academicYear={academicYear}
              logoUrl={logoUrl}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
