# PostgreSQL Render - SYNORA

## Base

- Provider: Render PostgreSQL
- Database: synora
- User: synora
- Variable API: DATABASE_URL

## Migrations versionnées

Les migrations sont exécutées automatiquement au démarrage API via:

- initializeDatabase()
- schema_migrations

Commande manuelle locale:

npm run db:migrate -w apps/api

## Versions actuelles

- 001_create_users
- 002_create_auth_nonces
- 003_create_reputation_events
- 004_create_reputation_indexes

## Tables

- schema_migrations
- users
- auth_nonces
- reputation_events

## Stockage

Quand DATABASE_URL est présent, l'API utilise PostgreSQL.

Quand DATABASE_URL est absent, l'API utilise un stockage mémoire local uniquement pour le développement.

## Variables Render nécessaires

WEB_ORIGIN=https://synora-web.vercel.app
WEB_ORIGINS=https://synora-web.vercel.app
JWT_SECRET=secret configure dans Render
DATABASE_URL=Internal Database URL Render PostgreSQL

## Notes

- Ne jamais commiter DATABASE_URL.
- Utiliser Internal Database URL entre Render API et Render PostgreSQL.
- Les nonces expirent après 5 minutes.
- Les événements de réputation sont persistés dans reputation_events.
- Toute évolution de schéma doit ajouter une nouvelle entrée dans MIGRATIONS.