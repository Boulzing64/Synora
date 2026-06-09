# PostgreSQL Render - SYNORA

## Base

- Provider: Render PostgreSQL
- Database: synora
- User: synora
- Variable API: DATABASE_URL

## Tables créées automatiquement au démarrage API

- users
- auth_nonces
- reputation_events

## Stockage

Quand DATABASE_URL est présent, l'API utilise PostgreSQL.

Quand DATABASE_URL est absent, l'API utilise un stockage mémoire local uniquement pour le développement.

## Variables Render nécessaires

WEB_ORIGIN=https://synora-web.vercel.app
JWT_SECRET=secret configure dans Render
DATABASE_URL=Internal Database URL Render PostgreSQL

## Notes

- Ne jamais commiter DATABASE_URL.
- Utiliser Internal Database URL entre Render API et Render PostgreSQL.
- Les nonces expirent après 5 minutes.
- Les événements de réputation sont persistés dans reputation_events.