# Déploiement Render - SYNORA API

## Service

- Type: Web Service
- Name: synora-api
- Runtime: Node
- Root: repository root

## Build Command

npm install && npm run build -w apps/api

## Start Command

npm run start -w apps/api

## Variables d'environnement Render

NODE_ENV=production
API_PORT=4000
WEB_ORIGIN=https://URL_FRONTEND_VERCEL
JWT_SECRET=SECRET_LONG_MINIMUM_32_CARACTERES

## Notes sécurité

- JWT_SECRET ne doit jamais être commité.
- WEB_ORIGIN doit être remplacé par l'URL Vercel finale.
- L'API utilise actuellement une mémoire locale pour les nonces et événements de réputation.
- Une base de données sera nécessaire avant production réelle.