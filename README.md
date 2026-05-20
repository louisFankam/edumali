# EduMali

Application de gestion scolaire avec Next.js (App Router), TypeScript, Drizzle ORM et SQLite.

## État actuel du backend (audit rapide)

### Ce qui est déjà bien
- Base SQLite branchée via Drizzle dans `lib/db.ts`.
- Schéma Drizzle centralisé dans `lib/models/schema.ts`.
- `drizzle.config.ts` présent et correctement orienté vers SQLite.
- TypeScript strict activé.

### Statut après implémentation
- Auth implémentée côté serveur (`app/api/auth/*`) avec validation Zod.
- Session par cookie `httpOnly` signé (HMAC SHA-256).
- Séparation en couches active: `controller -> service -> repository -> models`.
- Migration versionnée créée dans `drizzle/` et appliquée sur SQLite.
- Seed automatique de l’utilisateur unique au démarrage si la table `users` est vide.

## Architecture backend recommandée (en gardant `models` et `controller`)

Tu veux garder les noms `models` et `controller`: très bien. On structure autour de ça.

### Arborescence cible

```txt
app/
  (auth)/
  api/
  ...
lib/
  db.ts
  models/
    schema.ts
    user.model.ts
    ...
  controller/
    auth.controller.ts
    student.controller.ts
    ...
  services/
    auth.service.ts
    student.service.ts
    ...
  repositories/
    user.repository.ts
    student.repository.ts
    ...
  validations/
    auth.schema.ts
    student.schema.ts
    ...
  guards/
    auth.guard.ts
    role.guard.ts
  auth/
    session.ts
    password.ts
drizzle/
  0000_init.sql
  meta/
```

### Rôles des couches
- `models/`: définition des tables Drizzle + types inférés.
- `repositories/`: accès DB pur (requêtes Drizzle).
- `services/`: logique métier, orchestration, transactions.
- `controller/`: point d’entrée backend (Server Actions / Route Handlers), validation + authz + appel service.
- `validations/`: schémas Zod pour toutes les entrées externes.
- `guards/`: contrôle d’accès (session + rôles).

### Flux recommandé
`Client Component` -> `Server Action` (ou `app/api/.../route.ts`) -> `controller` -> `service` -> `repository` -> `models` -> SQLite

## Sécurité backend à appliquer maintenant

- Validation Zod systématique dans chaque `controller`.
- Contrôle de session/role avant chaque mutation.
- Hash de mot de passe (`argon2` recommandé) + comparaison côté serveur uniquement.
- Cookies `httpOnly`, `secure`, `sameSite=lax|strict`.
- Zéro secret côté client (`NEXT_PUBLIC_*` uniquement pour valeurs publiques).
- Requêtes Drizzle paramétrées uniquement (éviter SQL brut concaténé).

## Migration SQLite avec Drizzle (quand tu modifies un model)

## 1) Modifier le schéma
- Éditer `lib/models/schema.ts` (ajout/suppression/rename de colonne/table).

## 2) Générer une migration SQL versionnée

```bash
pnpm drizzle-kit generate
```

Effet:
- Crée des fichiers dans `drizzle/` (SQL + metadata).
- Ces fichiers doivent être commités dans Git.

## 3) Appliquer la migration à SQLite

```bash
pnpm drizzle-kit migrate
```

Effet:
- Exécute les migrations SQL sur `edumali_db/data.db`.
- Met à jour la structure réelle de la base.

## 4) Vérifier

```bash
pnpm drizzle-kit studio
```

Tu vérifies les tables/colonnes et les données après migration.

## Important: `generate + migrate` vs `push`

- `generate + migrate` (recommandé): historique versionné, reproductible, propre pour équipe/prod.
- `push` (à éviter en prod): applique directement les changements sans historique SQL propre.

## Cas concret: modification d’un model

Exemple: tu ajoutes `role` dans `users`.

1. Modifier `lib/models/schema.ts`.
2. `pnpm drizzle-kit generate` -> nouveau fichier SQL créé.
3. `pnpm drizzle-kit migrate` -> SQLite est alignée.
4. Adapter `validations/`, `controller/`, `services/` pour utiliser le nouveau champ.

## Conseils pratiques pour éviter les erreurs de migration

- Toujours faire un backup de `edumali_db/data.db` avant une migration sensible.
- Ne jamais éditer manuellement une migration déjà appliquée.
- Créer une nouvelle migration corrective si nécessaire.
- En CI/CD: exécuter `drizzle-kit migrate` au déploiement backend.

## Commandes utiles à ajouter dans `package.json`

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

## Conclusion architecture

Ta base est bonne pour démarrer, mais le backend n’est pas encore “production-ready”.  
Priorité immédiate:
1. Implémenter auth réelle côté serveur (remplacer le mock de `use-auth`).
2. Mettre en place `validations` Zod effectives.
3. Introduire `services` + `repositories` tout en gardant `models` et `controller`.
4. Démarrer le versioning des migrations Drizzle (`drizzle/`).
