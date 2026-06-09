# Déploiement Render - SYNORA API

## Service

- Type: Web Service
- Name: synora-api
- Runtime: Node
- Root: repository root

## Build Command

npm install && npm run build:api

## Start Command

npm run start -w apps/api

## Variables d'environnement Render

NODE_ENV=production
WEB_ORIGIN=https://synora-web.vercel.app
WEB_ORIGINS=https://synora-web.vercel.app
JWT_SECRET=SECRET_LONG_MINIMUM_32_CARACTERES
DATABASE_URL=Internal Database URL Render PostgreSQL

## Sécurité API

- Helmet activé pour les headers HTTP.
- CORS limité aux origines configurées.
- JSON body limité à 64kb.
- Rate limiting actif sur:
  - POST /auth/nonce
  - POST /auth/verify
  - POST /reputation/event

## Notes sécurité

- JWT_SECRET ne doit jamais être commité.
- DATABASE_URL ne doit jamais être commité.
- WEB_ORIGIN doit rester l'URL frontend Vercel principale.
- WEB_ORIGINS peut contenir plusieurs origines séparées par des virgules.