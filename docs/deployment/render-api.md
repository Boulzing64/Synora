# DÃ©ploiement Render - SYNORA API

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

## SÃ©curitÃ© API

- Helmet activÃ© pour les headers HTTP.
- CORS limitÃ© aux origines configurÃ©es.
- JSON body limitÃ© Ã  64kb.
- Rate limiting actif sur:
  - POST /auth/nonce
  - POST /auth/verify
  - POST /reputation/event

## Notes sÃ©curitÃ©

- JWT_SECRET ne doit jamais Ãªtre commitÃ©.
- DATABASE_URL ne doit jamais Ãªtre commitÃ©.
- WEB_ORIGIN doit rester l'URL frontend Vercel principale.
- WEB_ORIGINS peut contenir plusieurs origines sÃ©parÃ©es par des virgules.
## RewardsDistributor Base Sepolia

REWARDS_DISTRIBUTOR_ADDRESS=0xADbAA2ABF6b40a3705FAA54A41bF3010768A8443
REWARDS_CHAIN_ID=84532

REWARDS_SIGNER_PRIVATE_KEY doit être la clé privée du wallet rewards signer dédié.

Ne pas utiliser:

- la clé API Etherscan/BaseScan
- la clé privée du wallet principal
- la clé privée du deployer