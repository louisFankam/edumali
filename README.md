# Ekima — Système de Gestion Scolaire

Application de gestion scolaire pour les établissements primaires et secondaires en Afrique de l'Ouest.

Stack : Next.js 15, Tailwind CSS v4, shadcn/ui, Drizzle ORM + SQLite.

## Démarrage rapide

### Prérequis

- Node.js **18.x, 20.x ou 22.x LTS** (Node 24 **non supporté** — dépendances natives incompatibles)
- pnpm **8.15+** (installé via `corepack enable && corepack prepare pnpm@latest --activate`)

### Installation

```bash
git clone https://github.com/louisFankam/edumali.git
cd edumali
pnpm install
cp .env.example .env   # puis éditer SESSION_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
npx next build && pnpm start
```

L'application est accessible sur http://localhost:3000

**Aucune commande supplémentaire n'est nécessaire.**  
La base de données SQLite (`ekima_db/data.db`) est créée automatiquement au premier démarrage, avec toutes les tables et un compte administrateur.

### Identifiants par défaut

- Utilisateur : `admin`
- Mot de passe : `admin`

**⚠️ À changer impérativement en production** via les variables d'environnement (voir `Configuration`).

### Sécurité

- **Rate limiting** : 5 tentatives par minute sur `/api/auth/login` (protection brute-force)
- **Headers HTTP** : `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` appliqués sur toutes les pages
- **Cookie session** : `httpOnly`, `sameSite: "lax"`, `secure` uniquement si `COOKIE_SECURE=true`

### Développement

```bash
pnpm dev
```

## Configuration

Créez un fichier `.env` à la racine :

```env
SESSION_SECRET=<64 caractères hexadécimaux>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
COOKIE_SECURE=false
```

`SESSION_SECRET` est obligatoire (min 32 caractères). Un `.env` par défaut est fourni avec le projet.

`COOKIE_SECURE` : mettre à `true` uniquement si le site est servi en HTTPS. En local (HTTP), laisser `false`.

## Scripts

| Commande | Usage |
|---|---|
| `pnpm dev` | Serveur de développement (Turbo) |
| `pnpm build` | **Ne pas utiliser** (pnpm store corrompu) |
| `npx next build` | Build production (alternative recommandée) |
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
  models/schema.ts     Schéma Drizzle (27 tables)
  services/            Logique métier
  repositories/        Accès DB
  rate-limit.ts        Rate limiter in-memory (login)
  auth/                Session, hash, etc.
  guards/              Contrôle d'accès
drizzle/               Migrations versionnées (développement uniquement)
tests/                 Tests d'intégration (vitest)
```

## Licence

Projet privé — Tous droits réservés.
