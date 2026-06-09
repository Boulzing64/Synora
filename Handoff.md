# Handoff SYNORA

## État MVP validé

SYNORA dispose maintenant d'un MVP Web3 fonctionnel de bout en bout.

## Dépôt

- GitHub: https://github.com/Boulzing64/Synora
- Branche principale: main
- CI: GitHub Actions active

## URLs publiques

- Frontend Vercel: https://synora-web.vercel.app
- Page statut: https://synora-web.vercel.app/status
- API Render: https://synora-api.onrender.com
- Healthcheck API: https://synora-api.onrender.com/health

## Smart contract SYNORA

- Network: Base Sepolia
- Chain ID: 84532
- Token: SYNORA
- Symbol: SYN
- Address: 0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916
- Explorer: https://sepolia.basescan.org/address/0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916
- Vérification: Hardhat Verify / Blockscout validée
- Supply initiale: 100,000,000 SYN
- Decimals: 18

## Frontend

- Next.js
- App Router
- TypeScript
- Tailwind
- Déployé sur Vercel
- Connexion MetaMask
- Switch automatique vers Base Sepolia
- Lecture balance SYN
- Signature wallet hors-chain
- Session persistante via localStorage
- Dashboard utilisateur
- Historique réputation
- Claim récompense MVP off-chain
- Page statut MVP

## Backend API

- Express
- TypeScript
- Render
- PostgreSQL Render
- Authentification wallet par signature
- JWT
- Nonces persistés
- Réputation persistée
- Events réputation
- Healthcheck
- Helmet
- CORS strict
- Rate limiting
- Logs structurés JSON
- Tests API HTTP automatisés

## Base de données

- PostgreSQL Render
- DATABASE_URL configuré dans Render
- Migrations versionnées via schema_migrations
- Tables:
  - users
  - auth_nonces
  - reputation_events
  - schema_migrations

## Réputation MVP

Événements actuellement supportés:

- PROFILE_CREATED
- WALLET_AUTHENTICATED
- DASHBOARD_VISITED
- SYN_BALANCE_CONNECTED
- REWARD_CLAIMED

Fonctions validées:

- Calcul score
- Niveau utilisateur
- Historique événements
- Récompenses réclamées
- Persistance PostgreSQL

## Récompenses MVP

- Claim off-chain validé
- Condition frontend: score >= 60 et JWT actif
- Événement créé: REWARD_CLAIMED
- Pas encore de transfert SYN automatique
- Pas encore de contrat rewards

## Variables Render

- WEB_ORIGIN=https://synora-web.vercel.app
- WEB_ORIGINS=https://synora-web.vercel.app
- JWT_SECRET configuré dans Render
- DATABASE_URL configuré dans Render

## Variables Vercel

- NEXT_PUBLIC_API_URL=https://synora-api.onrender.com
- NEXT_PUBLIC_CHAIN_ID=84532
- NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
- NEXT_PUBLIC_SYN_TOKEN_ADDRESS=0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916

## Commandes utiles PowerShell

Installer:

npm install

Vérifier le MVP:

npm run verify:mvp

API locale:

npm run start -w .\apps\api

Frontend local:

npm run dev:web

Contrats:

npm run compile -w .\contracts
npm run test -w .\contracts

Tests API:

npm run test:api
npm run test:reputation

## Limites actuelles

- Claim récompense uniquement off-chain
- Pas encore de contrat RewardsDistributor
- Pas encore de SIWE ou EIP-712
- Pas encore de logs frontend
- Pas encore de monitoring externe
- Pas encore de dashboard admin
- Pas encore de gouvernance
- Pas encore d'IA comportementale
- RPC public Base Sepolia utilisé
- Render Free peut dormir après inactivité

## Prochaine priorité recommandée

Créer le système rewards beta:

1. Table reward_claims
2. Règles anti-abus côté API
3. Plafond de claim par wallet et période
4. Endpoint /rewards/claim
5. Dashboard récompenses enrichi
6. Spécification RewardsDistributor on-chain