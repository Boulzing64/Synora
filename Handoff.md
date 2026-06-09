# Handoff SYNORA

## État actuel

- Structure projet créée
- Git initialisé
- Repository GitHub poussé
- Workspace Node.js monorepo initialisé
- Frontend Next.js initialisé
- Backend API Express initialisé
- Smart contract ERC-20 SYNORA créé
- OpenZeppelin intégré
- Hardhat configuré
- Tests Solidity validés
- Déploiement local Hardhat Ignition validé
- Contrat SYNORA déployé sur Base Sepolia
- API Render déployée
- Frontend Vercel déployé
- Connexion MetaMask fonctionnelle
- Authentification wallet par signature fonctionnelle
- Lecture balance SYN fonctionnelle
- Moteur de réputation MVP fonctionnel
- Dashboard utilisateur connecté à la réputation

## URLs publiques

- Frontend Vercel: https://synora-web.vercel.app
- API Render: https://synora-api.onrender.com
- Healthcheck API: https://synora-api.onrender.com/health

## Contrat SYNORA

- Network: Base Sepolia
- Chain ID: 84532
- Address: 0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916
- Explorer: https://sepolia.basescan.org/address/0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916

## Variables configurées

### Render

- WEB_ORIGIN=https://synora-web.vercel.app
- JWT_SECRET configure dans Render

### Vercel

- NEXT_PUBLIC_API_URL=https://synora-api.onrender.com
- NEXT_PUBLIC_CHAIN_ID=84532
- NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
- NEXT_PUBLIC_SYN_TOKEN_ADDRESS=0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916

## Limites actuelles

- Les nonces sont stockés en mémoire API.
- Les événements de réputation sont stockés en mémoire API.
- Le score utilisateur est perdu au redémarrage Render.
- Pas encore de base de données.
- Pas encore de vérification automatisée du contrat sur BaseScan.
- Pas encore de CI GitHub Actions.
- Pas encore de persistance session côté frontend.
- Pas encore de gouvernance on-chain.

## Prochaine étape recommandée

Ajouter la persistance backend :
- Base PostgreSQL Render
- Table users
- Table auth_nonces
- Table reputation_events
- Migration SQL
- Remplacement des Maps mémoire par une couche repository