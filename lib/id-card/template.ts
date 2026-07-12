export interface IdCardStudentData {
  id: string
  firstName: string
  lastName: string
  gender: string
  birthDate: string
  parentName: string
  parentPhone: string
  address?: string
}

export const DEFAULT_PHOTO_DATA_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='130' viewBox='0 0 100 130'%3E%3Crect width='100' height='130' fill='%23f0f0f0' rx='2'/%3E%3Ccircle cx='50' cy='38' r='20' fill='%23c0c0c0'/%3E%3Cellipse cx='50' cy='100' rx='35' ry='38' fill='%23c0c0c0'/%3E%3C/svg%3E"

export function formatDate(dateStr: string): string {
  if (!dateStr) return "-"
  const d = new Date(dateStr)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export function formatMatricule(id: string, yearName: string): string {
  const prefix = yearName ? yearName.split("-")[0] || "" : ""
  return `EDM-${prefix}-${String(id).padStart(4, "0")}`
}

export const idCardStyles = `
  .id-card {
    position: relative;
    border: 0.5mm solid #d0d0d0;
    border-radius: 3mm;
    background: white;
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .id-card-header {
    display: flex; align-items: center;
    padding: 2.5mm 3mm 1.5mm; gap: 2mm;
  }
  .id-card-logo {
    width: 12mm; height: 12mm;
    border-radius: 50%;
    object-fit: cover;
    border: 0.3mm solid #e0e0e0;
    flex-shrink: 0;
  }
  .id-card-logo-fallback {
    width: 12mm; height: 12mm;
    border-radius: 50%;
    background: #e0e0e0;
    flex-shrink: 0;
  }
  .id-card-header-text { flex: 1; padding-right: 14mm; }
  .id-card-flag {
    position: absolute;
    top: 1mm;
    right: 1.5mm;
    width: 12mm;
    height: 8mm;
    display: flex;
    pointer-events: none;
    z-index: 0;
    border-radius: 0.5mm;
    overflow: hidden;
    border: 0.3mm solid #e0e0e0;
  }
  .id-card-flag div { flex: 1; }
  .id-card-school-name { font-size: 11pt; font-weight: 700; color: #111; line-height: 1.3; }
  .id-card-republic { font-size: 7pt; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
  .id-card-devise { font-size: 6.5pt; color: #aaa; font-style: italic; }
  .id-card-title-line {
    text-align: center; padding: 1.5mm 2mm;
    border-top: 0.3mm solid #e0e0e0;
    border-bottom: 0.3mm solid #e0e0e0;
  }
  .id-card-title { font-size: 11pt; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; }
  .id-card-year { font-size: 8pt; font-weight: 600; color: #666; }
  .id-card-body { display: flex; flex: 1; padding: 2mm; gap: 2mm; }
  .id-card-photo-wrapper { flex-shrink: 0; display: flex; align-items: flex-start; }
  .id-card-photo { width: 22mm; height: 30mm; object-fit: cover; border-radius: 1mm; border: 0.3mm solid #ddd; background: #f5f5f5; }
  .id-card-info { flex: 1; display: flex; flex-direction: column; gap: 0.5mm; justify-content: center; }
  .id-card-row { display: flex; font-size: 8.5pt; line-height: 1.3; }
  .id-card-label { font-weight: 700; color: #666; white-space: nowrap; min-width: 20mm; }
  .id-card-value { color: #000; font-weight: 500; word-break: break-word; }
  .id-card-director { margin-top: 0.5mm; padding-bottom: 1mm; font-size: 8pt; font-weight: 600; color: #444; border-top: 0.3mm solid #eee; padding-top: 0.5mm; }
`

export function buildIdCardHTML(
  student: IdCardStudentData,
  schoolInfo: { name: string; director: string; logoUrl?: string } | null,
  photo: string,
  selectedClassName: string,
  currentYearName: string,
  capName: string,
): string {
  const photoSrc = photo || DEFAULT_PHOTO_DATA_URL
  const schoolName = schoolInfo?.name || "Établissement"
  const matricule = formatMatricule(student.id, currentYearName)

  const logoHtml = schoolInfo?.logoUrl
    ? `<img src="${schoolInfo.logoUrl}" alt="" class="id-card-logo" />`
    : `<div class="id-card-logo-fallback"></div>`

  return `
    <div class="id-card">
      <div class="id-card-header">
        ${logoHtml}
        <div class="id-card-header-text">
          <div class="id-card-school-name">${schoolName}${capName ? ` — ${capName}` : ""}</div>
          <div class="id-card-republic">RÉPUBLIQUE DU MALI</div>
          <div class="id-card-devise">Un Peuple – Un But – Une Foi</div>
        </div>
        <div class="id-card-flag">
          <div style="background:#14b53a"></div>
          <div style="background:#fcd116"></div>
          <div style="background:#ce1126"></div>
        </div>
      </div>
      <div class="id-card-title-line">
        <span class="id-card-title">CARTE D'IDENTITÉ SCOLAIRE</span>
        <span class="id-card-year">&nbsp;${currentYearName || ""}</span>
      </div>
      <div class="id-card-body">
        <div class="id-card-photo-wrapper">
          <img src="${photoSrc}" alt="${student.firstName} ${student.lastName}" class="id-card-photo" />
        </div>
        <div class="id-card-info">
          <div class="id-card-row">
            <span class="id-card-label">Nom :</span>
            <span class="id-card-value">${student.lastName}</span>
          </div>
          <div class="id-card-row">
            <span class="id-card-label">Prénoms :</span>
            <span class="id-card-value">${student.firstName}</span>
          </div>
          <div class="id-card-row">
            <span class="id-card-label">Né(e) le :</span>
            <span class="id-card-value">${formatDate(student.birthDate)}</span>
          </div>
          <div class="id-card-row">
            <span class="id-card-label">N° :</span>
            <span class="id-card-value">${matricule}</span>
          </div>
          <div class="id-card-row">
            <span class="id-card-label">Classe :</span>
            <span class="id-card-value">${selectedClassName}</span>
          </div>
          <div class="id-card-row">
            <span class="id-card-label">Domicile :</span>
            <span class="id-card-value">${student.address || "—"}</span>
          </div>
          <div class="id-card-director">Le Directeur<br/>${schoolInfo?.director || ""}</div>
        </div>
      </div>
    </div>
  `
}
