# 📄 Système de Génération de Documents - Ekima

## 🎯 Vue d'ensemble

Le système de génération de documents d'Ekima permet de créer, personnaliser et gérer tous les documents scolaires directement depuis l'interface frontend. Les documents sont stockés dans des dossiers locaux avec leurs métadonnées.

## 🏗️ Architecture

### **Structure des dossiers**
```
public/
├── documents/           # Dossier racine des documents
│   ├── bulletins/      # Bulletins scolaires PDF
│   ├── emplois-du-temps/ # Emplois du temps Excel
│   ├── rapports/       # Rapports divers
│   ├── certificats/    # Certificats de scolarité
│   ├── templates/      # Templates personnalisés
│   └── metadata/       # Métadonnées des documents

lib/
├── document-generator.js # Service principal de génération
├── document-storage.js   # Service de stockage de fichiers

components/
├── documents/
│   └── design-configurator.jsx # Interface de personnalisation

app/
├── documents/
│   └── page.jsx        # Page de gestion des documents
```

## 🛠️ Technologies utilisées

### **Dépendances installées**
```bash
npm install jspdf html2canvas xlsx file-saver --legacy-peer-deps
```

- **jsPDF** : Génération de PDF
- **html2canvas** : Conversion HTML vers image
- **xlsx** : Génération de fichiers Excel
- **file-saver** : Téléchargement de fichiers

## 📋 Fonctionnalités

### **1. Génération de bulletins scolaires**
- ✅ **Design personnalisable** avec templates
- ✅ **Calcul automatique** des moyennes et mentions
- ✅ **Export PDF** haute qualité
- ✅ **Stockage dans dossiers** avec métadonnées

### **2. Génération d'emplois du temps**
- ✅ **Export Excel** structuré
- ✅ **Formatage automatique** des colonnes
- ✅ **Données organisées** par classe

### **3. Personnalisation du design**
- ✅ **Templates prédéfinis** (Moderne, Classique, Coloré)
- ✅ **Couleurs personnalisables** (primaire, secondaire, accent)
- ✅ **Typographie** (polices, tailles)
- ✅ **Layout** (bordures, espacements)

### **4. Gestion des documents**
- ✅ **Interface de gestion** complète
- ✅ **Recherche et filtres** par type
- ✅ **Prévisualisation** des documents
- ✅ **Téléchargement** et suppression
- ✅ **Import/Export** des métadonnées
- ✅ **Nettoyage** des métadonnées orphelines

## 💾 Système de stockage

### **Stockage des fichiers**
Les documents sont stockés dans des dossiers organisés par type :
- **PDF** : `public/documents/bulletins/`
- **Excel** : `public/documents/emplois-du-temps/`
- **Rapports** : `public/documents/rapports/`
- **Certificats** : `public/documents/certificats/`

### **Métadonnées**
Les informations sur les documents sont stockées dans `sessionStorage` :
```javascript
{
  id: 1234567890,
  name: "Bulletin - Aminata Traoré",
  type: "bulletin",
  file_path: "/documents/bulletins/bulletin_Traoré_Aminata_2024-12-26T18-30-45-123Z.pdf",
  file_name: "bulletin_Traoré_Aminata_2024-12-26T18-30-45-123Z.pdf",
  file_size: 245760,
  mime_type: "application/pdf",
  generated_for: "Aminata Traoré",
  generated_by: 1,
  design_config: { /* configuration du design */ },
  created_at: "2024-12-26T18:30:45.123Z",
  updated_at: "2024-12-26T18:30:45.123Z"
}
```

### **Fonctionnalités de gestion**
- **Export des métadonnées** : Sauvegarde en JSON
- **Import des métadonnées** : Restauration depuis un fichier JSON
- **Nettoyage** : Suppression des métadonnées orphelines
- **Recherche** : Par nom, élève, type de document

## 🎨 Personnalisation du design

### **Templates disponibles**

#### **Moderne**
```javascript
{
  primaryColor: '#3b82f6',
  secondaryColor: '#64748b',
  accentColor: '#f59e0b',
  titleFont: 'Arial',
  style: 'minimal'
}
```

#### **Classique**
```javascript
{
  primaryColor: '#1f2937',
  secondaryColor: '#6b7280',
  accentColor: '#d97706',
  titleFont: 'Times New Roman',
  style: 'formal'
}
```

#### **Coloré**
```javascript
{
  primaryColor: '#ef4444',
  secondaryColor: '#f59e0b',
  accentColor: '#10b981',
  titleFont: 'Arial',
  style: 'playful'
}
```

### **Configuration personnalisée**
```javascript
const designConfig = {
  // Couleurs
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  accentColor: '#f59e0b',
  borderColor: '#e5e7eb',
  
  // Typographie
  titleFont: 'Arial',
  bodyFont: 'Helvetica',
  titleSize: 24,
  bodySize: 12,
  
  // Layout
  showLogo: true,
  showWatermark: false,
  borderStyle: 'solid',
  
  // Template
  template: 'modern'
}
```

## 📊 Utilisation

### **1. Génération d'un bulletin**
```javascript
import { documentGenerator } from '@/lib/document-generator'

const studentData = {
  firstName: "Aminata",
  lastName: "Traoré",
  class: "CM2",
  dateOfBirth: "2010-03-15"
}

const gradesData = {
  trimester: 1,
  subjects: [
    { name: "Mathématiques", coefficient: 3, average: 15.5, remarks: "Très bien" },
    { name: "Français", coefficient: 3, average: 14.2, remarks: "Bien" }
  ],
  generalAverage: 14.8,
  generalMention: "Bien",
  generalRemarks: "Élève sérieuse et appliquée."
}

const designConfig = {
  template: 'modern',
  primaryColor: '#3b82f6'
}

// Générer le bulletin
await documentGenerator.generateBulletin(studentData, gradesData, designConfig)
```

### **2. Génération d'un emploi du temps**
```javascript
const scheduleData = {
  class: "CM2",
  timeSlots: [
    { time: "08:00-09:00", startTime: "08:00", endTime: "09:00" }
  ],
  days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
  schedule: [
    { day: "Lundi", startTime: "08:00", subject: { name: "Mathématiques" }, teacher: "Fatoumata Diarra" }
  ]
}

documentGenerator.generateSchedule(scheduleData, designConfig)
```

### **3. Gestion des documents**
```javascript
import { documentStorage } from '@/lib/document-storage'

// Récupérer tous les documents
const documents = await documentStorage.loadAllMetadata()

// Rechercher des documents
const results = await documentStorage.searchDocuments("Aminata", "bulletin")

// Exporter les métadonnées
await documentStorage.exportMetadata()

// Importer des métadonnées
await documentStorage.importMetadata(file)

// Nettoyer les métadonnées orphelines
const count = await documentStorage.cleanupOrphanedMetadata()
```

## 🔧 Configuration

### **Variables d'environnement**
```env
# Configuration des dossiers de documents
NEXT_PUBLIC_DOCUMENTS_PATH=/documents
NEXT_PUBLIC_MAX_FILE_SIZE=10485760 # 10MB
```

### **Configuration Next.js**
```javascript
// next.config.mjs
const nextConfig = {
  // Autoriser les fichiers statiques dans public/documents
  async headers() {
    return [
      {
        source: '/documents/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

## 🚀 Déploiement

### **1. Préparation**
```bash
# Installer les dépendances
npm install

# Créer les dossiers de documents
mkdir -p public/documents/{bulletins,emplois-du-temps,rapports,certificats,templates,metadata}
```

### **2. Build et déploiement**
```bash
# Build de production
npm run build

# Démarrage
npm start
```

### **3. Vérification**
- ✅ Page `/documents` accessible
- ✅ Génération de bulletins fonctionnelle
- ✅ Export d'emplois du temps fonctionnel
- ✅ Personnalisation du design opérationnelle
- ✅ Import/Export des métadonnées fonctionnel

## 🔍 Dépannage

### **Problèmes courants**

#### **Erreur de génération PDF**
```javascript
// Vérifier que html2canvas fonctionne
const canvas = await html2canvas(element, {
  scale: 2,
  useCORS: true,
  allowTaint: true
})
```

#### **Problème de stockage**
```javascript
// Vérifier les permissions du navigateur
try {
  sessionStorage.setItem('test', 'test')
  sessionStorage.removeItem('test')
} catch (e) {
  console.error('sessionStorage non disponible')
}
```

#### **Problème d'import/export**
```javascript
// Vérifier le format du fichier JSON
const metadata = JSON.parse(fileContent)
if (!Array.isArray(metadata)) {
  throw new Error('Format de fichier invalide')
}
```

## 📈 Améliorations futures

### **Phase 2 - Fonctionnalités avancées**
- [ ] **Stockage permanent** des métadonnées (IndexedDB)
- [ ] **Synchronisation** entre sessions
- [ ] **Templates HTML** personnalisables
- [ ] **Signatures numériques** sur les documents
- [ ] **Watermarks** personnalisés
- [ ] **Export en lot** de documents
- [ ] **Prévisualisation en temps réel**

### **Phase 3 - Intégration backend**
- [ ] **Stockage serveur** des documents
- [ ] **API REST** pour la génération
- [ ] **Gestion des permissions** avancées
- [ ] **Historique des modifications**
- [ ] **Sauvegarde automatique**
- [ ] **Partage de documents**

## 📞 Support

Pour toute question ou problème :
1. Vérifier la console du navigateur
2. Consulter les logs de génération
3. Tester avec des données simples
4. Vérifier les permissions du navigateur
5. Utiliser la fonction de nettoyage des métadonnées

---

**Ekima - Système de Gestion Scolaire**  
*Génération de documents professionnels avec stockage local*
