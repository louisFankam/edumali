// Service de stockage de documents côté client
export class DocumentStorage {
  constructor() {
    this.basePath = '/documents'
    this.metadataPath = '/documents/metadata'
  }

  // Sauvegarder un document avec ses métadonnées
  async saveDocument(documentData, fileBlob, fileName) {
    try {
      // Créer l'objet de métadonnées
      const metadata = {
        id: documentData.id,
        name: documentData.name,
        type: documentData.type,
        file_path: `${this.basePath}/${this.getTypeFolder(documentData.type)}/${fileName}`,
        file_name: fileName,
        file_size: fileBlob.size,
        mime_type: fileBlob.type,
        generated_for: documentData.generated_for,
        generated_by: documentData.generated_by,
        design_config: documentData.design_config,
        created_at: documentData.created_at,
        updated_at: new Date().toISOString()
      }

      // Sauvegarder le fichier
      await this.saveFile(fileBlob, fileName, documentData.type)
      
      // Sauvegarder les métadonnées
      await this.saveMetadata(metadata)
      
      return metadata
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du document:', error)
      throw error
    }
  }

  // Sauvegarder un fichier dans le dossier approprié
  async saveFile(fileBlob, fileName, documentType) {
    try {
      // Créer un lien de téléchargement temporaire
      const url = URL.createObjectURL(fileBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      
      // Simuler le téléchargement (le fichier sera dans le dossier de téléchargements)
      link.click()
      
      // Nettoyer
      URL.revokeObjectURL(url)
      
      console.log(`Fichier ${fileName} sauvegardé dans le dossier de téléchargements`)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du fichier:', error)
      throw error
    }
  }

  // Sauvegarder les métadonnées
  async saveMetadata(metadata) {
    try {
      // Récupérer les métadonnées existantes
      const existingMetadata = await this.loadAllMetadata()
      
      // Ajouter ou mettre à jour
      const index = existingMetadata.findIndex(m => m.id === metadata.id)
      if (index >= 0) {
        existingMetadata[index] = metadata
      } else {
        existingMetadata.push(metadata)
      }
      
      // Sauvegarder dans sessionStorage (temporaire pour la session)
      sessionStorage.setItem('edumali_documents_metadata', JSON.stringify(existingMetadata))
      
      console.log('Métadonnées sauvegardées')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des métadonnées:', error)
      throw error
    }
  }

  // Charger toutes les métadonnées
  async loadAllMetadata() {
    try {
      if (typeof window !== 'undefined') {
        const saved = sessionStorage.getItem('edumali_documents_metadata')
        return saved ? JSON.parse(saved) : []
      }
      return []
    } catch (error) {
      console.error('Erreur lors du chargement des métadonnées:', error)
      return []
    }
  }

  // Récupérer les métadonnées par type
  async getMetadataByType(type) {
    const allMetadata = await this.loadAllMetadata()
    return allMetadata.filter(metadata => metadata.type === type)
  }

  // Récupérer les métadonnées d'un document spécifique
  async getDocumentMetadata(documentId) {
    const allMetadata = await this.loadAllMetadata()
    return allMetadata.find(metadata => metadata.id === documentId)
  }

  // Supprimer un document
  async deleteDocument(documentId) {
    try {
      const allMetadata = await this.loadAllMetadata()
      const filteredMetadata = allMetadata.filter(metadata => metadata.id !== documentId)
      
      // Sauvegarder les métadonnées mises à jour
      sessionStorage.setItem('edumali_documents_metadata', JSON.stringify(filteredMetadata))
      
      console.log(`Document ${documentId} supprimé`)
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error)
      throw error
    }
  }

  // Obtenir le dossier selon le type de document
  getTypeFolder(documentType) {
    const folders = {
      bulletin: 'bulletins',
      emploi_temps: 'emplois-du-temps',
      rapport: 'rapports',
      certificat: 'certificats'
    }
    return folders[documentType] || 'autres'
  }

  // Générer un nom de fichier unique
  generateFileName(prefix, extension) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    return `${prefix}_${timestamp}.${extension}`
  }

  // Vérifier si un fichier existe
  async fileExists(filePath) {
    try {
      const response = await fetch(filePath, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      return false
    }
  }

  // Obtenir les statistiques des documents
  async getDocumentStats() {
    const allMetadata = await this.loadAllMetadata()
    
    const stats = {
      total: allMetadata.length,
      bulletins: allMetadata.filter(m => m.type === 'bulletin').length,
      emplois_temps: allMetadata.filter(m => m.type === 'emploi_temps').length,
      rapports: allMetadata.filter(m => m.type === 'rapport').length,
      certificats: allMetadata.filter(m => m.type === 'certificat').length,
      totalSize: allMetadata.reduce((sum, m) => sum + (m.file_size || 0), 0)
    }
    
    return stats
  }

  // Rechercher des documents
  async searchDocuments(query, type = null) {
    const allMetadata = await this.loadAllMetadata()
    
    return allMetadata.filter(metadata => {
      const matchesQuery = metadata.name.toLowerCase().includes(query.toLowerCase()) ||
                          metadata.generated_for.toLowerCase().includes(query.toLowerCase())
      const matchesType = !type || metadata.type === type
      
      return matchesQuery && matchesType
    })
  }

  // Exporter les métadonnées en JSON
  async exportMetadata() {
    const allMetadata = await this.loadAllMetadata()
    const dataStr = JSON.stringify(allMetadata, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `documents_metadata_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  // Importer des métadonnées depuis un fichier JSON
  async importMetadata(file) {
    try {
      const text = await file.text()
      const metadata = JSON.parse(text)
      
      if (Array.isArray(metadata)) {
        sessionStorage.setItem('edumali_documents_metadata', JSON.stringify(metadata))
        console.log(`${metadata.length} documents importés`)
        return metadata.length
      } else {
        throw new Error('Format de fichier invalide')
      }
    } catch (error) {
      console.error('Erreur lors de l\'import des métadonnées:', error)
      throw error
    }
  }

  // Nettoyer les métadonnées orphelines
  async cleanupOrphanedMetadata() {
    const allMetadata = await this.loadAllMetadata()
    const validMetadata = []
    
    for (const metadata of allMetadata) {
      const exists = await this.fileExists(metadata.file_path)
      if (exists) {
        validMetadata.push(metadata)
      } else {
        console.log(`Métadonnées orphelines supprimées: ${metadata.file_name}`)
      }
    }
    
    sessionStorage.setItem('edumali_documents_metadata', JSON.stringify(validMetadata))
    return allMetadata.length - validMetadata.length
  }
}

// Instance singleton
export const documentStorage = new DocumentStorage()

