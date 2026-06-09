# Déploiement SYNORA - Environnements publics

## API Render

- Service: synora-api
- URL: https://synora-api.onrender.com
- Healthcheck: https://synora-api.onrender.com/health
- Runtime: Node.js
- Build Command: npm install && npm run build:api
- Start Command: npm run start -w apps/api

## Frontend Vercel

- Project: synora-web
- URL principale: https://synora-web.vercel.app
- Framework: Next.js
- Root Directory: apps/web

## Variables Render

WEB_ORIGIN=https://synora-web.vercel.app
JWT_SECRET=secret configure dans Render

## Variables Vercel

NEXT_PUBLIC_API_URL=https://synora-api.onrender.com
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_SYN_TOKEN_ADDRESS=adresse du contrat SYNORA sur Base Sepolia

## État

- API déployée sur Render
- Frontend déployé sur Vercel
- CORS configuré avec WEB_ORIGIN
- Healthcheck API validé
- Dashboard wallet testé
- Lecture balance SYN testée
- Authentification par signature testée
- Réputation MVP connectée au dashboard