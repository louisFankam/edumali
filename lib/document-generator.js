import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { documentStorage } from './document-storage'

// Configuration par défaut du design
const defaultDesignConfig = {
  // Couleurs
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  accentColor: '#f59e0b',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  
  // Typographie
  titleFont: 'Arial',
  bodyFont: 'Helvetica',
  titleSize: 24,
  subtitleSize: 18,
  bodySize: 12,
  smallSize: 10,
  
  // Layout
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  spacing: 10,
  
  // Éléments visuels
  showLogo: true,
  showWatermark: false,
  borderStyle: 'solid',
  borderColor: '#e5e7eb',
  borderWidth: 1,
  
  // Templates
  template: 'modern', // modern, classic, colorful
}

// Templates de design
const designTemplates = {
  modern: {
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    accentColor: '#f59e0b',
    titleFont: 'Arial',
    style: 'minimal'
  },
  classic: {
    primaryColor: '#1f2937',
    secondaryColor: '#6b7280',
    accentColor: '#d97706',
    titleFont: 'Times New Roman',
    style: 'formal'
  },
  colorful: {
    primaryColor: '#ef4444',
    secondaryColor: '#f59e0b',
    accentColor: '#10b981',
    titleFont: 'Arial',
    style: 'playful'
  }
}

export class DocumentGenerator {
  constructor() {
    // Plus besoin de charger les documents ici, ils sont gérés par documentStorage
  }

  // Générer un bulletin scolaire
  async generateBulletin(studentData, gradesData, designConfig = {}) {
    const config = { ...defaultDesignConfig, ...designConfig }
    
    // Créer l'élément HTML pour le bulletin
    const bulletinElement = this.createBulletinHTML(studentData, gradesData, config)
    document.body.appendChild(bulletinElement)

    try {
      // Convertir en canvas puis en PDF
      const canvas = await html2canvas(bulletinElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Générer le nom de fichier
      const fileName = documentStorage.generateFileName(
        `bulletin_${studentData.lastName}_${studentData.firstName}`,
        'pdf'
      )
      
      // Créer le blob du PDF
      const pdfBlob = pdf.output('blob')
      
      // Sauvegarder le document
      const documentRecord = {
        id: Date.now(),
        name: `Bulletin - ${studentData.firstName} ${studentData.lastName}`,
        type: 'bulletin',
        file_path: `/documents/bulletins/${fileName}`,
        file_name: fileName,
        file_size: pdfBlob.size,
        mime_type: 'application/pdf',
        generated_for: `${studentData.firstName} ${studentData.lastName}`,
        generated_by: 1, // ID de l'utilisateur connecté
        design_config: config,
        created_at: new Date().toISOString()
      }

      // Sauvegarder le document et ses métadonnées
      await documentStorage.saveDocument(documentRecord, pdfBlob, fileName)

      // Télécharger le PDF
      pdf.save(fileName)
      
      // Nettoyer
      document.body.removeChild(bulletinElement)
      
      return documentRecord
    } catch (error) {
      console.error('Erreur lors de la génération du bulletin:', error)
      document.body.removeChild(bulletinElement)
      throw error
    }
  }

  // Créer l'HTML du bulletin
  createBulletinHTML(studentData, gradesData, config) {
    const element = document.createElement('div')
    element.style.cssText = `
      position: absolute;
      left: -9999px;
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      background: white;
      font-family: ${config.bodyFont}, sans-serif;
      color: ${config.textColor};
      box-sizing: border-box;
    `

    const template = designTemplates[config.template] || designTemplates.modern
    
    element.innerHTML = `
      <div style="
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid ${template.primaryColor};
      ">
        <h1 style="
          color: ${template.primaryColor};
          font-family: ${template.titleFont}, serif;
          font-size: 28px;
          margin: 0 0 10px 0;
          font-weight: bold;
        ">BULLETIN SCOLAIRE</h1>
        <p style="
          color: ${template.secondaryColor};
          font-size: 16px;
          margin: 0;
        ">École Primaire de Bamako</p>
        <p style="
          color: ${template.secondaryColor};
          font-size: 14px;
          margin: 5px 0 0 0;
        ">Année scolaire 2024-2025</p>
      </div>

      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 30px;
        padding: 20px;
        background: #f8fafc;
        border-radius: 8px;
        border-left: 4px solid ${template.primaryColor};
      ">
        <div>
          <h3 style="
            color: ${template.primaryColor};
            font-size: 16px;
            margin: 0 0 10px 0;
          ">Informations de l'élève</h3>
          <p><strong>Nom:</strong> ${studentData.lastName}</p>
          <p><strong>Prénom:</strong> ${studentData.firstName}</p>
          <p><strong>Classe:</strong> ${studentData.class}</p>
          <p><strong>Date de naissance:</strong> ${new Date(studentData.dateOfBirth).toLocaleDateString('fr-FR')}</p>
        </div>
        <div>
          <h3 style="
            color: ${template.primaryColor};
            font-size: 16px;
            margin: 0 0 10px 0;
          ">Période</h3>
          <p><strong>Trimestre:</strong> ${gradesData.trimester}</p>
          <p><strong>Date de génération:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="
          color: ${template.primaryColor};
          font-size: 18px;
          margin: 0 0 15px 0;
          text-align: center;
        ">Résultats par matière</h3>
        <table style="
          width: 100%;
          border-collapse: collapse;
          border: 1px solid ${template.borderColor};
        ">
          <thead>
            <tr style="background: ${template.primaryColor}; color: white;">
              <th style="padding: 12px; text-align: left; border: 1px solid ${template.borderColor};">Matière</th>
              <th style="padding: 12px; text-align: center; border: 1px solid ${template.borderColor};">Coefficient</th>
              <th style="padding: 12px; text-align: center; border: 1px solid ${template.borderColor};">Moyenne</th>
              <th style="padding: 12px; text-align: center; border: 1px solid ${template.borderColor};">Appréciation</th>
            </tr>
          </thead>
          <tbody>
            ${gradesData.subjects.map(subject => `
              <tr>
                <td style="padding: 12px; border: 1px solid ${template.borderColor}; font-weight: bold;">${subject.name}</td>
                <td style="padding: 12px; text-align: center; border: 1px solid ${template.borderColor};">${subject.coefficient}</td>
                <td style="padding: 12px; text-align: center; border: 1px solid ${template.borderColor}; font-weight: bold; color: ${subject.average >= 10 ? '#10b981' : '#ef4444'};">${subject.average}/20</td>
                <td style="padding: 12px; border: 1px solid ${template.borderColor};">${subject.remarks || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 30px;
      ">
        <div style="
          padding: 20px;
          background: ${template.primaryColor};
          color: white;
          border-radius: 8px;
          text-align: center;
        ">
          <h4 style="margin: 0 0 10px 0; font-size: 16px;">Moyenne générale</h4>
          <p style="margin: 0; font-size: 24px; font-weight: bold;">${gradesData.generalAverage}/20</p>
        </div>
        <div style="
          padding: 20px;
          background: ${template.accentColor};
          color: white;
          border-radius: 8px;
          text-align: center;
        ">
          <h4 style="margin: 0 0 10px 0; font-size: 16px;">Mention</h4>
          <p style="margin: 0; font-size: 18px; font-weight: bold;">${gradesData.generalMention}</p>
        </div>
      </div>

      <div style="
        padding: 20px;
        background: #f8fafc;
        border-radius: 8px;
        border-left: 4px solid ${template.accentColor};
      ">
        <h4 style="
          color: ${template.primaryColor};
          margin: 0 0 10px 0;
        ">Appréciation générale</h4>
        <p style="margin: 0; line-height: 1.6;">${gradesData.generalRemarks}</p>
      </div>

      <div style="
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid ${template.borderColor};
        text-align: center;
        font-size: 12px;
        color: ${template.secondaryColor};
      ">
        <p>Bulletin généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        <p>École Primaire de Bamako - Système de Gestion Scolaire EduMali</p>
      </div>
    `

    return element
  }

  // Générer un emploi du temps
  async generateSchedule(scheduleData, designConfig = {}) {
    const config = { ...defaultDesignConfig, ...designConfig }
    
    // Créer le workbook Excel
    const workbook = XLSX.utils.book_new()
    
    // Préparer les données
    const data = [
      [`Emploi du temps - ${scheduleData.class}`],
      [],
      ['Heure', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
    ]

    scheduleData.timeSlots.forEach(timeSlot => {
      const row = [timeSlot.time]
      scheduleData.days.forEach(day => {
        const slot = scheduleData.schedule.find(s => 
          s.day === day && s.startTime === timeSlot.startTime
        )
        
        if (slot && slot.subject) {
          row.push(`${slot.subject.name} - ${slot.teacher}`)
        } else if (timeSlot.type === 'break') {
          row.push('Récréation')
        } else if (timeSlot.type === 'lunch') {
          row.push('Pause déjeuner')
        } else {
          row.push('')
        }
      })
      data.push(row)
    })

    // Créer la worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data)
    
    // Appliquer le style
    worksheet['!cols'] = [
      { width: 15 },
      { width: 25 },
      { width: 25 },
      { width: 25 },
      { width: 25 },
      { width: 25 }
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Emploi du temps')

    // Générer le nom de fichier
    const fileName = documentStorage.generateFileName(
      `emploi_du_temps_${scheduleData.class}`,
      'xlsx'
    )
    
    // Créer le blob du fichier Excel
    const excelBlob = XLSX.write(workbook, { bookType: 'xlsx', type: 'blob' })
    
    // Sauvegarder le document
    const documentRecord = {
      id: Date.now(),
      name: `Emploi du temps - ${scheduleData.class}`,
      type: 'emploi_temps',
      file_path: `/documents/emplois-du-temps/${fileName}`,
      file_name: fileName,
      file_size: excelBlob.size,
      mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      generated_for: scheduleData.class,
      generated_by: 1,
      design_config: config,
      created_at: new Date().toISOString()
    }

    // Sauvegarder le document et ses métadonnées
    await documentStorage.saveDocument(documentRecord, excelBlob, fileName)

    // Télécharger le fichier
    XLSX.writeFile(workbook, fileName)
    
    return documentRecord
  }

  // Récupérer tous les documents
  async getAllDocuments() {
    return await documentStorage.loadAllMetadata()
  }

  // Récupérer les documents par type
  async getDocumentsByType(type) {
    return await documentStorage.getMetadataByType(type)
  }

  // Supprimer un document
  async deleteDocument(documentId) {
    return await documentStorage.deleteDocument(documentId)
  }

  // Télécharger un document existant
  async downloadDocument(documentId) {
    const document = await documentStorage.getDocumentMetadata(documentId)
    if (document) {
      // Créer un lien de téléchargement
      const link = document.createElement('a')
      link.href = document.file_path
      link.download = document.file_name
      link.click()
    }
  }

  // Obtenir les statistiques des documents
  async getDocumentStats() {
    return await documentStorage.getDocumentStats()
  }

  // Rechercher des documents
  async searchDocuments(query, type = null) {
    return await documentStorage.searchDocuments(query, type)
  }
}

// Instance singleton
export const documentGenerator = new DocumentGenerator()
