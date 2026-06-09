# Handoff SYNORA

## ÃƒÆ’Ã¢â‚¬Â°tat actuel

- Structure projet crÃƒÆ’Ã‚Â©ÃƒÆ’Ã‚Â©e
- Git initialisÃƒÆ’Ã‚Â©
- Repository GitHub poussÃƒÆ’Ã‚Â©
- Workspace Node.js monorepo initialisÃƒÆ’Ã‚Â©
- Frontend Next.js initialisÃƒÆ’Ã‚Â©
- Backend API Express initialisÃƒÆ’Ã‚Â©
- Smart contract ERC-20 SYNORA crÃƒÆ’Ã‚Â©ÃƒÆ’Ã‚Â©
- OpenZeppelin intÃƒÆ’Ã‚Â©grÃƒÆ’Ã‚Â©
- Hardhat configurÃƒÆ’Ã‚Â©
- Tests Solidity validÃƒÆ’Ã‚Â©s
- DÃƒÆ’Ã‚Â©ploiement local Hardhat Ignition validÃƒÆ’Ã‚Â©
- Contrat SYNORA dÃƒÆ’Ã‚Â©ployÃƒÆ’Ã‚Â© sur Base Sepolia
- API Render dÃƒÆ’Ã‚Â©ployÃƒÆ’Ã‚Â©e
- Frontend Vercel dÃƒÆ’Ã‚Â©ployÃƒÆ’Ã‚Â©
- Connexion MetaMask fonctionnelle
- Authentification wallet par signature fonctionnelle
- Lecture balance SYN fonctionnelle
- Moteur de rÃƒÆ’Ã‚Â©putation MVP fonctionnel
- Dashboard utilisateur connectÃƒÆ’Ã‚Â© ÃƒÆ’Ã‚Â  la rÃƒÆ’Ã‚Â©putation

## URLs publiques

- Frontend Vercel: https://synora-web.vercel.app
- API Render: https://synora-api.onrender.com
- Healthcheck API: https://synora-api.onrender.com/health

## Contrat SYNORA

- Network: Base Sepolia
- Chain ID: 84532
- Address: 0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916
- Explorer: https://sepolia.basescan.org/address/0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916

## Variables configurÃƒÆ’Ã‚Â©es

### Render

- WEB_ORIGIN=https://synora-web.vercel.app
- JWT_SECRET configure dans Render

### Vercel

- NEXT_PUBLIC_API_URL=https://synora-api.onrender.com
- NEXT_PUBLIC_CHAIN_ID=84532
- NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
- NEXT_PUBLIC_SYN_TOKEN_ADDRESS=0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916

## Limites actuelles

- Les nonces sont stockÃƒÆ’Ã‚Â©s en mÃƒÆ’Ã‚Â©moire API.
- Les ÃƒÆ’Ã‚Â©vÃƒÆ’Ã‚Â©nements de rÃƒÆ’Ã‚Â©putation sont stockÃƒÆ’Ã‚Â©s en mÃƒÆ’Ã‚Â©moire API.
- Le score utilisateur est perdu au redÃƒÆ’Ã‚Â©marrage Render.
- Pas encore de base de donnÃƒÆ’Ã‚Â©es.
- Pas encore de vÃƒÆ’Ã‚Â©rification automatisÃƒÆ’Ã‚Â©e du contrat sur BaseScan.
- Pas encore de CI GitHub Actions.
- Pas encore de persistance session cÃƒÆ’Ã‚Â´tÃƒÆ’Ã‚Â© frontend.
- Pas encore de gouvernance on-chain.

## Prochaine ÃƒÆ’Ã‚Â©tape recommandÃƒÆ’Ã‚Â©e

Ajouter la persistance backend :
- Base PostgreSQL Render
- Table users
- Table auth_nonces
- Table reputation_events
- Migration SQL
- Remplacement des Maps mÃƒÆ’Ã‚Â©moire par une couche repository
## DerniÃ¨re mise Ã  jour

- SÃ©curitÃ© API renforcÃ©e avec Helmet, CORS strict, body limit et rate limiting
- PostgreSQL Render connectÃ©
- CI GitHub Actions validÃ©e
- Contrat SYNORA vÃ©rifiÃ© via Hardhat Verify / Blockscout
- Audit MVP sÃ©curitÃ© crÃ©Ã© dans docs/security/security-notes.md

## Prochaine prioritÃ©

Ajouter les migrations PostgreSQL versionnÃ©es et les tests API HTTP automatisÃ©s.
## Roadmap

- Roadmap MVP vers Beta créée dans docs/architecture/roadmap-mvp-beta.md
- Priorité suivante recommandée: logs structurés API et historique utilisateur.