# Handoff SYNORA

## Ãƒâ€°tat actuel

- Structure projet crÃƒÂ©ÃƒÂ©e
- Git initialisÃƒÂ©
- Repository GitHub poussÃƒÂ©
- Workspace Node.js monorepo initialisÃƒÂ©
- Frontend Next.js initialisÃƒÂ©
- Backend API Express initialisÃƒÂ©
- Smart contract ERC-20 SYNORA crÃƒÂ©ÃƒÂ©
- OpenZeppelin intÃƒÂ©grÃƒÂ©
- Hardhat configurÃƒÂ©
- Tests Solidity validÃƒÂ©s
- DÃƒÂ©ploiement local Hardhat Ignition validÃƒÂ©
- Contrat SYNORA dÃƒÂ©ployÃƒÂ© sur Base Sepolia
- API Render dÃƒÂ©ployÃƒÂ©e
- Frontend Vercel dÃƒÂ©ployÃƒÂ©
- Connexion MetaMask fonctionnelle
- Authentification wallet par signature fonctionnelle
- Lecture balance SYN fonctionnelle
- Moteur de rÃƒÂ©putation MVP fonctionnel
- Dashboard utilisateur connectÃƒÂ© ÃƒÂ  la rÃƒÂ©putation

## URLs publiques

- Frontend Vercel: https://synora-web.vercel.app
- API Render: https://synora-api.onrender.com
- Healthcheck API: https://synora-api.onrender.com/health

## Contrat SYNORA

- Network: Base Sepolia
- Chain ID: 84532
- Address: 0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916
- Explorer: https://sepolia.basescan.org/address/0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916

## Variables configurÃƒÂ©es

### Render

- WEB_ORIGIN=https://synora-web.vercel.app
- JWT_SECRET configure dans Render

### Vercel

- NEXT_PUBLIC_API_URL=https://synora-api.onrender.com
- NEXT_PUBLIC_CHAIN_ID=84532
- NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
- NEXT_PUBLIC_SYN_TOKEN_ADDRESS=0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916

## Limites actuelles

- Les nonces sont stockÃƒÂ©s en mÃƒÂ©moire API.
- Les ÃƒÂ©vÃƒÂ©nements de rÃƒÂ©putation sont stockÃƒÂ©s en mÃƒÂ©moire API.
- Le score utilisateur est perdu au redÃƒÂ©marrage Render.
- Pas encore de base de donnÃƒÂ©es.
- Pas encore de vÃƒÂ©rification automatisÃƒÂ©e du contrat sur BaseScan.
- Pas encore de CI GitHub Actions.
- Pas encore de persistance session cÃƒÂ´tÃƒÂ© frontend.
- Pas encore de gouvernance on-chain.

## Prochaine ÃƒÂ©tape recommandÃƒÂ©e

Ajouter la persistance backend :
- Base PostgreSQL Render
- Table users
- Table auth_nonces
- Table reputation_events
- Migration SQL
- Remplacement des Maps mÃƒÂ©moire par une couche repository
## Dernière mise à jour

- Sécurité API renforcée avec Helmet, CORS strict, body limit et rate limiting
- PostgreSQL Render connecté
- CI GitHub Actions validée
- Contrat SYNORA vérifié via Hardhat Verify / Blockscout
- Audit MVP sécurité créé dans docs/security/security-notes.md

## Prochaine priorité

Ajouter les migrations PostgreSQL versionnées et les tests API HTTP automatisés.