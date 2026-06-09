# Handoff SYNORA

## Ã‰tat MVP validÃ©

SYNORA dispose maintenant d'un MVP Web3 fonctionnel de bout en bout.

## DÃ©pÃ´t

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
- VÃ©rification: Hardhat Verify / Blockscout validÃ©e
- Supply initiale: 100,000,000 SYN
- Decimals: 18

## Frontend

- Next.js
- App Router
- TypeScript
- Tailwind
- DÃ©ployÃ© sur Vercel
- Connexion MetaMask
- Switch automatique vers Base Sepolia
- Lecture balance SYN
- Signature wallet hors-chain
- Session persistante via localStorage
- Dashboard utilisateur
- Historique rÃ©putation
- Claim rÃ©compense MVP off-chain
- Page statut MVP

## Backend API

- Express
- TypeScript
- Render
- PostgreSQL Render
- Authentification wallet par signature
- JWT
- Nonces persistÃ©s
- RÃ©putation persistÃ©e
- Events rÃ©putation
- Healthcheck
- Helmet
- CORS strict
- Rate limiting
- Logs structurÃ©s JSON
- Tests API HTTP automatisÃ©s

## Base de donnÃ©es

- PostgreSQL Render
- DATABASE_URL configurÃ© dans Render
- Migrations versionnÃ©es via schema_migrations
- Tables:
  - users
  - auth_nonces
  - reputation_events
  - schema_migrations

## RÃ©putation MVP

Ã‰vÃ©nements actuellement supportÃ©s:

- PROFILE_CREATED
- WALLET_AUTHENTICATED
- DASHBOARD_VISITED
- SYN_BALANCE_CONNECTED
- REWARD_CLAIMED

Fonctions validÃ©es:

- Calcul score
- Niveau utilisateur
- Historique Ã©vÃ©nements
- RÃ©compenses rÃ©clamÃ©es
- Persistance PostgreSQL

## RÃ©compenses MVP

- Claim off-chain validÃ©
- Condition frontend: score >= 60 et JWT actif
- Ã‰vÃ©nement crÃ©Ã©: REWARD_CLAIMED
- Pas encore de transfert SYN automatique
- Pas encore de contrat rewards

## Variables Render

- WEB_ORIGIN=https://synora-web.vercel.app
- WEB_ORIGINS=https://synora-web.vercel.app
- JWT_SECRET configurÃ© dans Render
- DATABASE_URL configurÃ© dans Render

## Variables Vercel

- NEXT_PUBLIC_API_URL=https://synora-api.onrender.com
- NEXT_PUBLIC_CHAIN_ID=84532
- NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
- NEXT_PUBLIC_SYN_TOKEN_ADDRESS=0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916

## Commandes utiles PowerShell

Installer:

npm install

VÃ©rifier le MVP:

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

- Claim rÃ©compense uniquement off-chain
- Pas encore de contrat RewardsDistributor
- Pas encore de SIWE ou EIP-712
- Pas encore de logs frontend
- Pas encore de monitoring externe
- Pas encore de dashboard admin
- Pas encore de gouvernance
- Pas encore d'IA comportementale
- RPC public Base Sepolia utilisÃ©
- Render Free peut dormir aprÃ¨s inactivitÃ©

## Prochaine prioritÃ© recommandÃ©e

CrÃ©er le systÃ¨me rewards beta:

1. Table reward_claims
2. RÃ¨gles anti-abus cÃ´tÃ© API
3. Plafond de claim par wallet et pÃ©riode
4. Endpoint /rewards/claim
5. Dashboard rÃ©compenses enrichi
6. SpÃ©cification RewardsDistributor on-chain
## Rewards Beta préparé

- Endpoint off-chain actif: POST /rewards/claim
- Endpoint autorisation on-chain préparé: POST /rewards/authorize
- Signature EIP-712 backend préparée
- Contrat RewardsDistributor préparé avec claimWithSignature
- Module Ignition RewardsDistributor préparé
- Reward claim anti-abus: 1 claim MVP par wallet par 24h
- Table PostgreSQL prévue: reward_claims
- Migration rewards: 005_create_reward_claims
- Documentation rewards mise à jour

## Prochaine étape recommandée

Déployer RewardsDistributor sur Base Sepolia uniquement après validation:

1. Créer un wallet rewards signer dédié
2. Ajouter REWARDS_SIGNER_PRIVATE_KEY dans Render
3. Déployer RewardsDistributor
4. Financer RewardsDistributor en SYN
5. Configurer REWARDS_DISTRIBUTOR_ADDRESS dans Render
6. Tester /rewards/authorize
7. Ajouter claimWithSignature côté frontend