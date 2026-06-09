# Handoff SYNORA

## Ã‰tat actuel

- Structure projet crÃ©Ã©e
- Git initialisÃ©
- Repository GitHub poussÃ©
- Workspace Node.js monorepo initialisÃ©
- Frontend Next.js initialisÃ©
- Backend API Express initialisÃ©
- Smart contract ERC-20 SYNORA crÃ©Ã©
- OpenZeppelin intÃ©grÃ©
- Hardhat configurÃ©
- Tests Solidity validÃ©s
- DÃ©ploiement local Hardhat Ignition validÃ©
- Contrat SYNORA dÃ©ployÃ© sur Base Sepolia
- API Render dÃ©ployÃ©e
- Frontend Vercel dÃ©ployÃ©
- Connexion MetaMask fonctionnelle
- Authentification wallet par signature fonctionnelle
- Lecture balance SYN fonctionnelle
- Moteur de rÃ©putation MVP fonctionnel
- Dashboard utilisateur connectÃ© Ã  la rÃ©putation

## URLs publiques

- Frontend Vercel: https://synora-web.vercel.app
- API Render: https://synora-api.onrender.com
- Healthcheck API: https://synora-api.onrender.com/health

## Contrat SYNORA

- Network: Base Sepolia
- Chain ID: 84532
- Address: 0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916
- Explorer: https://sepolia.basescan.org/address/0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916

## Variables configurÃ©es

### Render

- WEB_ORIGIN=https://synora-web.vercel.app
- JWT_SECRET configure dans Render

### Vercel

- NEXT_PUBLIC_API_URL=https://synora-api.onrender.com
- NEXT_PUBLIC_CHAIN_ID=84532
- NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
- NEXT_PUBLIC_SYN_TOKEN_ADDRESS=0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916

## Limites actuelles

- Les nonces sont stockÃ©s en mÃ©moire API.
- Les Ã©vÃ©nements de rÃ©putation sont stockÃ©s en mÃ©moire API.
- Le score utilisateur est perdu au redÃ©marrage Render.
- Pas encore de base de donnÃ©es.
- Pas encore de vÃ©rification automatisÃ©e du contrat sur BaseScan.
- Pas encore de CI GitHub Actions.
- Pas encore de persistance session cÃ´tÃ© frontend.
- Pas encore de gouvernance on-chain.

## Prochaine Ã©tape recommandÃ©e

Ajouter la persistance backend :
- Base PostgreSQL Render
- Table users
- Table auth_nonces
- Table reputation_events
- Migration SQL
- Remplacement des Maps mÃ©moire par une couche repository