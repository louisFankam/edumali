# 📚 EduMali - Système de Gestion Scolaire
<img width="715" height="355" alt="image" src="https://github.com/user-attachments/assets/18e775bd-5da0-485d-bdd6-71216cb1a351" />

## 🎯 Vue d'ensemble

**EduMali** est une application web moderne de gestion scolaire développée avec Next.js et React, conçue pour simplifier l'administration d'un établissement scolaire.

## ✨ Fonctionnalités principales

### 🏠 Tableau de bord
- Statistiques en temps réel
- Accès rapide aux sections principales
- Activité récente
- Notifications importantes

### 👥 Gestion des élèves
- Inscription et profils complets
- Informations détaillées (personnelles, familiales, académiques)
- Photos de profil
- Statut d'inscription (actif/inactif)

### 👨‍🏫 Gestion des professeurs
- Profils enseignants détaillés
- Matières enseignées
- Tarifs et disponibilités
- Statut d'emploi

### 📊 Système de notes
- Gestion des examens personnalisables
- Saisie des notes (échelle 0-20)
- Coefficients par matière
- Calcul automatique des moyennes
- Export Excel

### 📋 Bulletins scolaires
- Génération automatique depuis les notes
- Templates personnalisables
- Appréciations des professeurs
- Mentions automatiques
- Export PDF

### 📅 Gestion des présences
- Suivi quotidien des présences/absences
- Calendrier interactif
- Statistiques automatiques
- Justificatifs
- Notifications d'absences

### ⏰ Planning et emploi du temps
- Emploi du temps par classe
- Interface drag & drop
- Créneaux personnalisables
- Gestion des conflits
- Planning d'examens
- Export Excel

### 💰 Gestion financière
- Suivi des paiements
- Échéances
- Rapports financiers
- Alertes de retard
- Export des données

### 🔔 Système de notifications
- Notifications en temps réel
- Catégorisation (absences, paiements, examens)
- Système de priorité
- Pagination
- Actions rapides

### ⚙️ Paramètres et configuration
- Gestion des classes
- Gestion des matières
- Attribution des matières aux classes
- Informations de l'école
- Gestion du compte utilisateur

### 🎨 Personnalisation
- Thèmes (clair/sombre/auto)
- Couleurs personnalisables
- Paramètres d'affichage
- Préférences utilisateur

## 🛠️ Technologies utilisées

- **Next.js 14** : Framework React avec App Router
- **React 18** : Bibliothèque UI avec hooks modernes
- **TypeScript** : Typage statique
- **Tailwind CSS** : Framework CSS utilitaire
- **shadcn/ui** : Composants UI modernes
- **Lucide React** : Icônes
- **date-fns** : Manipulation des dates

## 🚀 Installation

```bash
# Cloner le repository
git clone [url-du-repo]
cd school-management-mali

# Installer les dépendances
npm install

# Démarrer le serveur
npm run dev
```

## 📖 Guide d'utilisation

### Connexion
- URL : http://localhost:3000
- Identifiants : admin / admin123

### Gestion des élèves
1. Ajouter un élève : Bouton "Nouvel élève"
2. Modifier : Icône d'édition
3. Présences : Section "Présences"

### Système de notes
1. Créer un examen : "Notes > Examen"
2. Saisir les notes : Interface 0-20
3. Bulletins : "Notes > Bulletin"

### Planning
1. Emploi du temps : Drag & drop
2. Examens : Gestion des salles
3. Export : Format Excel

## 📱 Responsive Design

L'application s'adapte à tous les écrans :
- Desktop : Interface complète
- Tablet : Adaptation des grilles
- Mobile : Interface optimisée

## 🔒 Sécurité

- Authentification sécurisée
- Validation des données
- Protection des routes

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
npm i -g vercel
vercel
```

## 📄 Licence

Licence MIT

---

**EduMali** - Simplifiez la gestion de votre établissement scolaire ! 🎓
