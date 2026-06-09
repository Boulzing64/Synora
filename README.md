# SYNORA

SYNORA est un MVP Web3 combinant token ERC-20, authentification wallet, dashboard utilisateur, réputation persistée et récompenses MVP off-chain.

## URLs

- Frontend: https://synora-web.vercel.app
- Status: https://synora-web.vercel.app/status
- API: https://synora-api.onrender.com
- Healthcheck: https://synora-api.onrender.com/health

## Smart contract

- Network: Base Sepolia
- Chain ID: 84532
- Token: SYNORA
- Symbol: SYN
- Address: 0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916
- Explorer: https://sepolia.basescan.org/address/0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916

## Stack

- Frontend: Next.js, TypeScript, Tailwind, Vercel
- API: Express, TypeScript, Render
- Database: PostgreSQL Render
- Blockchain: Solidity, Hardhat, OpenZeppelin, Base Sepolia
- Wallet: MetaMask
- CI: GitHub Actions

## Fonctionnalités MVP

- Connexion MetaMask
- Switch réseau Base Sepolia
- Lecture balance SYN
- Authentification par signature wallet
- JWT
- Session persistante
- Score de réputation
- Historique réputation
- Claim récompense MVP off-chain
- API sécurisée avec Helmet, CORS strict et rate limiting
- Logs structurés JSON
- Tests API automatisés
- Tests contrats

## Commandes PowerShell

Installer:

npm install

Vérifier tout le MVP:

npm run verify:mvp

API locale:

npm run start -w .\apps\api

Frontend local:

npm run dev:web

Contrats:

npm run compile -w .\contracts
npm run test -w .\contracts

## Structure

- apps/web: frontend Next.js
- apps/api: backend API
- contracts: smart contracts Hardhat
- packages/shared: types partagés
- packages/config: configuration partagée
- docs: documentation
- infra: configuration Render et Vercel

## Notes sécurité

Ne jamais commiter:

- clés privées
- JWT_SECRET
- DATABASE_URL
- fichiers .env.local

## Prochaine étape

Préparer le système rewards beta avec persistance dédiée, règles anti-abus et futur contrat RewardsDistributor.