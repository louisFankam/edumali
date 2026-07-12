"use client"

import { formatDate, formatMatricule, DEFAULT_PHOTO_DATA_URL, type IdCardStudentData } from "@/lib/id-card/template"

export function IdCard({
  student,
  schoolInfo,
  photo,
  selectedClassName,
  currentYearName,
  capName,
}: {
  student: IdCardStudentData
  schoolInfo: { name: string; director: string; logoUrl?: string } | null
  photo: string
  selectedClassName: string
  currentYearName: string
  capName: string
}) {
  const photoSrc = photo || DEFAULT_PHOTO_DATA_URL
  const schoolName = schoolInfo?.name || "Établissement"
  const matricule = formatMatricule(student.id, currentYearName)

  return (
    <div className="id-card">
      <div className="id-card-header">
        {schoolInfo?.logoUrl ? (
          <img src={schoolInfo.logoUrl} alt="" className="id-card-logo" />
        ) : (
          <div className="id-card-logo-fallback" />
        )}
        <div className="id-card-header-text">
          <div className="id-card-school-name">
            {schoolName}{capName ? ` — ${capName}` : ""}
          </div>
          <div className="id-card-republic">RÉPUBLIQUE DU MALI</div>
          <div className="id-card-devise">Un Peuple – Un But – Une Foi</div>
        </div>
        <div className="id-card-flag">
          <div style={{ background: "#14b53a" }} />
          <div style={{ background: "#fcd116" }} />
          <div style={{ background: "#ce1126" }} />
        </div>
      </div>
      <div className="id-card-title-line">
        <span className="id-card-title">CARTE D&apos;IDENTITÉ SCOLAIRE</span>
        <span className="id-card-year">&nbsp;{currentYearName || ""}</span>
      </div>
      <div className="id-card-body">
        <div className="id-card-photo-wrapper">
          <img
            src={photoSrc}
            alt={`${student.firstName} ${student.lastName}`}
            className="id-card-photo"
          />
        </div>
        <div className="id-card-info">
          <div className="id-card-row">
            <span className="id-card-label">Nom :</span>
            <span className="id-card-value">{student.lastName}</span>
          </div>
          <div className="id-card-row">
            <span className="id-card-label">Prénoms :</span>
            <span className="id-card-value">{student.firstName}</span>
          </div>
          <div className="id-card-row">
            <span className="id-card-label">Né(e) le :</span>
            <span className="id-card-value">{formatDate(student.birthDate)}</span>
          </div>
          <div className="id-card-row">
            <span className="id-card-label">N° :</span>
            <span className="id-card-value">{matricule}</span>
          </div>
          <div className="id-card-row">
            <span className="id-card-label">Classe :</span>
            <span className="id-card-value">{selectedClassName}</span>
          </div>
          <div className="id-card-row">
            <span className="id-card-label">Domicile :</span>
            <span className="id-card-value">{student.address || "—"}</span>
          </div>
          <div className="id-card-director">
            Le Directeur<br />
            {schoolInfo?.director || ""}
          </div>
        </div>
      </div>
    </div>
  )
}
