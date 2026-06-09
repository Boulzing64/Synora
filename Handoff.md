# Handoff SYNORA

## Ãƒâ€°tat MVP validÃƒÂ©

SYNORA dispose maintenant d'un MVP Web3 fonctionnel de bout en bout.

## DÃƒÂ©pÃƒÂ´t

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
- VÃƒÂ©rification: Hardhat Verify / Blockscout validÃƒÂ©e
- Supply initiale: 100,000,000 SYN
- Decimals: 18

## Frontend

- Next.js
- App Router
- TypeScript
- Tailwind
- DÃƒÂ©ployÃƒÂ© sur Vercel
- Connexion MetaMask
- Switch automatique vers Base Sepolia
- Lecture balance SYN
- Signature wallet hors-chain
- Session persistante via localStorage
- Dashboard utilisateur
- Historique rÃƒÂ©putation
- Claim rÃƒÂ©compense MVP off-chain
- Page statut MVP

## Backend API

- Express
- TypeScript
- Render
- PostgreSQL Render
- Authentification wallet par signature
- JWT
- Nonces persistÃƒÂ©s
- RÃƒÂ©putation persistÃƒÂ©e
- Events rÃƒÂ©putation
- Healthcheck
- Helmet
- CORS strict
- Rate limiting
- Logs structurÃƒÂ©s JSON
- Tests API HTTP automatisÃƒÂ©s

## Base de donnÃƒÂ©es

- PostgreSQL Render
- DATABASE_URL configurÃƒÂ© dans Render
- Migrations versionnÃƒÂ©es via schema_migrations
- Tables:
  - users
  - auth_nonces
  - reputation_events
  - schema_migrations

## RÃƒÂ©putation MVP

Ãƒâ€°vÃƒÂ©nements actuellement supportÃƒÂ©s:

- PROFILE_CREATED
- WALLET_AUTHENTICATED
- DASHBOARD_VISITED
- SYN_BALANCE_CONNECTED
- REWARD_CLAIMED

Fonctions validÃƒÂ©es:

- Calcul score
- Niveau utilisateur
- Historique ÃƒÂ©vÃƒÂ©nements
- RÃƒÂ©compenses rÃƒÂ©clamÃƒÂ©es
- Persistance PostgreSQL

## RÃƒÂ©compenses MVP

- Claim off-chain validÃƒÂ©
- Condition frontend: score >= 60 et JWT actif
- Ãƒâ€°vÃƒÂ©nement crÃƒÂ©ÃƒÂ©: REWARD_CLAIMED
- Pas encore de transfert SYN automatique
- Pas encore de contrat rewards

## Variables Render

- WEB_ORIGIN=https://synora-web.vercel.app
- WEB_ORIGINS=https://synora-web.vercel.app
- JWT_SECRET configurÃƒÂ© dans Render
- DATABASE_URL configurÃƒÂ© dans Render

## Variables Vercel

- NEXT_PUBLIC_API_URL=https://synora-api.onrender.com
- NEXT_PUBLIC_CHAIN_ID=84532
- NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
- NEXT_PUBLIC_SYN_TOKEN_ADDRESS=0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916

## Commandes utiles PowerShell

Installer:

npm install

VÃƒÂ©rifier le MVP:

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

- Claim rÃƒÂ©compense uniquement off-chain
- Pas encore de contrat RewardsDistributor
- Pas encore de SIWE ou EIP-712
- Pas encore de logs frontend
- Pas encore de monitoring externe
- Pas encore de dashboard admin
- Pas encore de gouvernance
- Pas encore d'IA comportementale
- RPC public Base Sepolia utilisÃƒÂ©
- Render Free peut dormir aprÃƒÂ¨s inactivitÃƒÂ©

## Prochaine prioritÃƒÂ© recommandÃƒÂ©e

CrÃƒÂ©er le systÃƒÂ¨me rewards beta:

1. Table reward_claims
2. RÃƒÂ¨gles anti-abus cÃƒÂ´tÃƒÂ© API
3. Plafond de claim par wallet et pÃƒÂ©riode
4. Endpoint /rewards/claim
5. Dashboard rÃƒÂ©compenses enrichi
6. SpÃƒÂ©cification RewardsDistributor on-chain
## Rewards Beta prÃ©parÃ©

- Endpoint off-chain actif: POST /rewards/claim
- Endpoint autorisation on-chain prÃ©parÃ©: POST /rewards/authorize
- Signature EIP-712 backend prÃ©parÃ©e
- Contrat RewardsDistributor prÃ©parÃ© avec claimWithSignature
- Module Ignition RewardsDistributor prÃ©parÃ©
- Reward claim anti-abus: 1 claim MVP par wallet par 24h
- Table PostgreSQL prÃ©vue: reward_claims
- Migration rewards: 005_create_reward_claims
- Documentation rewards mise Ã  jour

## Prochaine Ã©tape recommandÃ©e

DÃ©ployer RewardsDistributor sur Base Sepolia uniquement aprÃ¨s validation:

1. CrÃ©er un wallet rewards signer dÃ©diÃ©
2. Ajouter REWARDS_SIGNER_PRIVATE_KEY dans Render
3. DÃ©ployer RewardsDistributor
4. Financer RewardsDistributor en SYN
5. Configurer REWARDS_DISTRIBUTOR_ADDRESS dans Render
6. Tester /rewards/authorize
7. Ajouter claimWithSignature cÃ´tÃ© frontend
## RewardsDistributor Base Sepolia déployé

- Network: Base Sepolia
- Chain ID: 84532
- SYNORA Token: 0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916
- RewardsDistributor: 0xADbAA2ABF6b40a3705FAA54A41bF3010768A8443
- Rewards Signer: 0xE125C389ad7D323bAdeFE7aFc059dfFE8bF769eD
- Explorer RewardsDistributor: https://sepolia.basescan.org/address/0xADbAA2ABF6b40a3705FAA54A41bF3010768A8443

## État Rewards On-chain

- Contrat RewardsDistributor déployé
- claimWithSignature disponible
- Signature EIP-712 backend préparée
- Endpoint API préparé: POST /rewards/authorize
- Frontend claim on-chain non encore activé
- Contrat pas encore financé en SYN

## Prochaine étape

Financer RewardsDistributor en SYN puis configurer Render:

- REWARDS_DISTRIBUTOR_ADDRESS=0xADbAA2ABF6b40a3705FAA54A41bF3010768A8443
- REWARDS_CHAIN_ID=84532
- REWARDS_SIGNER_PRIVATE_KEY=clé privée dédiée du wallet rewards signer