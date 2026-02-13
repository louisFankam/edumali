# Guide d'installation de PocketBase pour EduMali

## Qu'est-ce que PocketBase ?

PocketBase est le backend utilisé par EduMali. Il fournit :
- Base de données SQLite
- Authentification des utilisateurs
- API REST automatique
- Interface d'administration pour gérer les données
- Stockage de fichiers (photos élèves, professeurs, etc.)

## Installation

### 1. Télécharger PocketBase

Allez sur : https://pocketbase.io/docs/

Téléchargez la version correspondant à votre système :
- **Windows** : pocketbase_windows_amd64.zip
- **macOS** : pocketbase_darwin_amd64.zip
- **Linux** : pocketbase_linux_amd64.zip

### 2. Démarrer PocketBase

**Méthode simple (recommandée) :**

1. Décompressez le fichier zip téléchargé
2. Double-cliquez sur l'exécutable `pocketbase`
3. PocketBase va démarrer et ouvrir l'interface dans votre navigateur
   - L'URL par défaut est : http://127.0.0.1:8090

**Vous devriez voir :** L'interface d'administration PocketBase sur http://127.0.0.1:8090/_/

### 3. Importer les collections EduMali

L'équipe backend doit vous fournir un fichier d'export des collections PocketBase, sinon il faudra les créer manuellement.

**Pour importer :**
1. Allez dans l'interface PocketBase : http://127.0.0.1:8090/_/
2. Cliquez sur le bouton **Importer** (ou "Import")
3. Sélectionnez le fichier `.pb` ou `json` fourni
4. Confirmez l'importation

### 4. Vérifier la configuration

Une fois PocketBase démarré, l'application EduMali (frontend) pourra se connecter à :

http://127.0.0.1:8090

Cette URL est déjà configurée dans le projet via la variable d'environnement :
```bash
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
```

## Utilisation quotidienne

### Démarrage automatique (recommandé)

Pour ne pas avoir à lancer PocketBase manuellement à chaque fois :

**Windows :**
1. Créez un raccourci vers `pocketbase.exe`
2. Placez-le dans le dossier `Démarrage` (Startup)

**macOS / Linux :**
1. Créez un script de démarrage ou utilisez launchd/autostart

## Vérifier que PocketBase fonctionne

Ouvrez votre navigateur sur : http://127.0.0.1:8090/_/

Vous devriez voir l'interface d'administration avec :
- Liste des collections (tables de données)
- Les utilisateurs créés
- Les paramètres de l'API

## Collaboration Frontend ↔ Backend

Votre ami (frontend) n'a besoin que de :
1. **Avoir PocketBase démarré** sur sa machine
2. **Lancer le frontend** : `npm run dev`
3. Les deux communiquent automatiquement sur le port 8090

## Résolution des problèmes

### Le frontend ne se connecte pas à PocketBase

**Vérifiez :**
1. Que PocketBase est bien démarré (http://127.0.0.1:8090 accessible)
2. Que le port 8090 n'est pas utilisé par un autre service
3. Que le firewall/antivirus ne bloque pas le port 8090

### "Collection not found"

Les collections doivent exister dans PocketBase. Voir la documentation :
`docs/pocketbase_collections_setup.md`

### Erreur CORS

Normalement pas de problème avec PocketBase local, mais si besoin :
- Ajoutez l'origine du frontend dans les paramètres CORS de PocketBase

## Besoin d'aide ?

Documentation PocketBase : https://pocketbase.io/docs/
Discord PocketBase : https://pocketbase.io/docs/#command-line-utilities
Issues EduMali : https://github.com/louisFankam/edumali/issues
