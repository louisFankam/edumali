// hooks/use-salary-export.ts
import { useState, useCallback, useEffect } from 'react'
import { pb, COLLECTIONS, getAuthToken, getApiUrl } from '@/lib/pocketbase'

interface SalaryHistoryRecord {
  id: string
  date: string
  file: string
  created: string
  updated: string
}

export function useSalaryExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [lastExportDate, setLastExportDate] = useState<string | null>(null)
  const [salaryHistory, setSalaryHistory] = useState<SalaryHistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Vérifier si on est le 28 du mois ou plus
  const isExportDay = useCallback(() => {
    const currentDate = new Date()
    const currentDay = currentDate.getDate()
    return currentDay >= 28 // Exporter le 28 du mois ou après
  }, [])

  // Vérifier si on a changé de mois et si c'est le jour d'export
  const checkMonthChange = useCallback(async () => {
    try {
      const token = getAuthToken()
      if (!token) return false

      // Vérifier d'abord si on est le 28 du mois ou plus
      if (!isExportDay()) {
        return false
      }

      // Récupérer la dernière date d'export
      const response = await fetch(
        getApiUrl(`collections/${COLLECTIONS.SALARY_HISTORY}/records?sort=-created&perPage=1`),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const result = await response.json()
        if (result.items.length > 0) {
          const lastExport = result.items[0]
          setLastExportDate(lastExport.date)
          
          // Vérifier si on a changé de mois
          const currentDate = new Date()
          const currentMonth = currentDate.toISOString().slice(0, 7)
          const lastExportMonth = lastExport.date.slice(0, 7)
          
          console.log('Mois actuel:', currentMonth, 'Dernier export:', lastExportMonth)
          
          if (currentMonth !== lastExportMonth) {
            return true // Le mois a changé et on est le 28+
          }
        } else {
          // Si c'est la première exportation, vérifier si on est le 28+
          return isExportDay()
        }
      }
      return false
    } catch (error) {
      console.error('Erreur lors de la vérification du mois:', error)
      return false
    }
  }, [isExportDay])

  // Exporter en PDF et sauvegarder dans l'historique
  const exportAndReset = useCallback(async (htmlContent: string, month: string) => {
    try {
      setIsExporting(true)
      
      // Générer le PDF
      const pdfBlob = await generatePDF(htmlContent, month)
      
      // Uploader le fichier vers PocketBase
      const formData = new FormData()
      formData.append('file', pdfBlob, `salaires_${month}.pdf`)
      formData.append('date', `${month}-01`) // Format: '2025-09-01'
      
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')
      
      console.log('Tentative d\'upload avec:', { month, fileName: `salaires_${month}.pdf` })
      
      const uploadResponse = await fetch(
        getApiUrl(`collections/${COLLECTIONS.SALARY_HISTORY}/records`),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      )
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        console.error('Erreur d\'upload:', errorData)
        throw new Error(`Erreur lors de l'upload du PDF: ${JSON.stringify(errorData)}`)
      }
      
      // Réinitialiser les heures et majorations
      await resetHoursAndMajoration()
      
      setLastExportDate(month)
      return true
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
      throw error
    } finally {
      setIsExporting(false)
    }
  }, [])

  // Réinitialiser hours_worked et majoration à 0
  const resetHoursAndMajoration = useCallback(async () => {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('Non authentifié')
      
      // Réinitialiser pour les professeurs titulaires
      const teachersResponse = await fetch(
        `getApiUrl('collections/${COLLECTIONS.TEACHERS}/records?filter=status=')active'&perPage=200`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (teachersResponse.ok) {
        const teachersResult = await teachersResponse.json()
        for (const teacher of teachersResult.items) {
          await fetch(
            getApiUrl(`collections/${COLLECTIONS.TEACHERS}/records/${teacher.id}`),
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                hours_worked: 0,
                majoration: 0
              })
            }
          )
        }
      }
      
      // Réinitialiser pour les remplaçants
      const substitutesResponse = await fetch(
        `getApiUrl('collections/${COLLECTIONS.TEACHERS_SUBSTITUTE}/records?filter=status=')busy'&perPage=200`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (substitutesResponse.ok) {
        const substitutesResult = await substitutesResponse.json()
        for (const substitute of substitutesResult.items) {
          await fetch(
            getApiUrl(`collections/${COLLECTIONS.TEACHERS_SUBSTITUTE}/records/${substitute.id}`),
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                hours_worked: 0,
                majoration: 0
              })
            }
          )
        }
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error)
      throw error
    }
  }, [])

  // Récupérer l'historique des exports
  const fetchSalaryHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      const token = getAuthToken()
      if (!token) return
      
      const response = await fetch(
        getApiUrl(`collections/${COLLECTIONS.SALARY_HISTORY}/records?sort=-created&perPage=50`),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (response.ok) {
        const result = await response.json()
        setSalaryHistory(result.items)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fonction pour exécuter l'export automatique
  const performAutoExport = useCallback(async (htmlContentGenerator?: () => string) => {
    try {
      const shouldExport = await checkMonthChange()
      if (shouldExport && htmlContentGenerator) {
        const currentMonth = new Date().toISOString().slice(0, 7)
        console.log('Export automatique déclenché pour:', currentMonth)
        
        const htmlContent = htmlContentGenerator()
        await exportAndReset(htmlContent, currentMonth)
        console.log('Export automatique réussi pour:', currentMonth)
        
        // Déclencher le téléchargement du PDF
        const pdfBlob = await generatePDF(htmlContent, currentMonth)
        const url = URL.createObjectURL(pdfBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `salaires_${currentMonth}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        return true
      }
    } catch (error) {
      console.error('Erreur lors de l\'export automatique:', error)
    }
    return false
  }, [checkMonthChange, exportAndReset])

  // Vérification automatique périodique
  useEffect(() => {
    const interval = setInterval(() => {
      // Vérifier si on est le 28 du mois ou plus
      if (isExportDay()) {
        console.log('Vérification automatique: c\'est le jour d\'export')
        // L'export sera déclenché par le composant qui fournit le contenu HTML
      }
    }, 60000) // Vérifier toutes les minutes
    
    return () => clearInterval(interval)
  }, [isExportDay])

  return {
    isExporting,
    lastExportDate,
    salaryHistory,
    isLoading,
    checkMonthChange,
    exportAndReset,
    fetchSalaryHistory,
    performAutoExport,
    isExportDay
  }
}

// Fonction pour générer le PDF en capturant l'écran
async function generatePDF(htmlContent: string, month: string): Promise<Blob> {
  try {
    // Import dynamique pour éviter les problèmes côté serveur
    const jsPDF = (await import('jspdf')).default
    const html2canvas = (await import('html2canvas')).default
    
    // Créer un élément temporaire pour le contenu HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    tempDiv.style.width = '800px'
    tempDiv.style.backgroundColor = 'white'
    tempDiv.style.fontFamily = 'Arial, sans-serif'
    document.body.appendChild(tempDiv)
    
    try {
      // Capturer le contenu HTML comme image avec une résolution plus basse pour réduire la taille
      const canvas = await html2canvas(tempDiv, {
        scale: 1.2, // Réduit de 2 à 1.2 pour diminuer la taille du fichier
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempDiv.scrollHeight,
        logging: false
      })
      
      // Créer le PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/jpeg', 0.8) // Utiliser JPEG avec compression
      
      // Calculer les dimensions pour adapter au format A4
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      let heightLeft = pdfHeight
      let position = 0
      
      // Ajouter l'image au PDF
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight)
      heightLeft -= pdf.internal.pageSize.getHeight()
      
      // Si le contenu dépasse une page, ajouter des pages supplémentaires
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight)
        heightLeft -= pdf.internal.pageSize.getHeight()
      }
      
      return new Blob([pdf.output('blob')], { type: 'application/pdf' })
    } finally {
      // Nettoyer l'élément temporaire
      document.body.removeChild(tempDiv)
    }
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    throw new Error('Impossible de générer le PDF')
  }
}

function formatMonthForPDF(monthString: string) {
  const [year, month] = monthString.split('-')
  const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
  return `${monthNames[parseInt(month) - 1]} ${year}`
}