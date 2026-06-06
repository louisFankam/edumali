# Ekima — Système de Gestion Scolaire

Application de gestion scolaire pour les établissements primaires et secondaires en Afrique de l'Ouest.

Stack : Next.js 15, Tailwind CSS v4, shadcn/ui, Drizzle ORM + SQLite.

## Démarrage rapide

### Prérequis

- Node.js 18+ (recommandé : 22 LTS)
- pnpm 8+

### Installation

```bash
git clone https://github.com/louisFankam/edumali.git
cd edumali
pnpm install
pnpm build && pnpm start
```

L'application est accessible sur http://localhost:3000

**Aucune commande supplémentaire n'est nécessaire.**  
La base de données SQLite (`ekima_db/data.db`) est créée automatiquement au premier démarrage, avec toutes les tables et un compte administrateur.

### Identifiants par défaut

- Utilisateur : `admin`
- Mot de passe : `admin`

Modifiables via les variables d'environnement (voir `Configuration`).

### Développement

```bash
pnpm dev
```

## Configuration

Créez un fichier `.env` à la racine :

```
SESSION_SECRET=<64 caractères hexadécimaux>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
```

`SESSION_SECRET` est obligatoire. Un `.env` par défaut est fourni avec le projet.

## Scripts

| Commande | Usage |
|---|---|
| `pnpm dev` | Serveur de développement (Turbo) |
| `pnpm build` | Build production |
| `pnpm start` | Lancement production |
| `pnpm test` | Tests (vitest) |
| `pnpm db:generate` | Générer une migration Drizzle |
| `pnpm db:migrate` | Appliquer les migrations |
| `pnpm db:studio` | Interface Drizzle Studio |

### Quand utiliser `db:generate` / `db:migrate` ?

**Jamais pour lancer l'application.** L'app crée et gère son schéma toute seule au premier démarrage.

Ces commandes servent uniquement quand tu **modifies le schéma** (`lib/models/schema.ts`) :

```
1. Modifier schema.ts
2. Mettre à jour aussi lib/bootstrap.ts (CREATE TABLE / ALTER TABLE)
3. pnpm db:generate   → crée le fichier de migration dans drizzle/
4. pnpm db:migrate    → applique la migration à ta base de dev
5. Committer le tout
```

## Structure du projet

```
app/                   Pages Next.js (App Router)
  api/                 Route handlers (backend)
components/            Composants React partagés
hooks/                 Hooks custom (auth, préférences, etc.)
lib/
  bootstrap.ts         Initialisation : création des tables + admin
  db.ts                Connexion SQLite (better-sqlite3 + Drizzle)
  models/schema.ts     Schéma Drizzle (26 tables)
  services/            Logique métier
  repositories/        Accès DB
  auth/                Session, hash, etc.
  guards/              Contrôle d'accès
drizzle/               Migrations versionnées (développement uniquement)
tests/                 Tests d'intégration (vitest)
```

## Licence

Projet privé — Tous droits réservés.
