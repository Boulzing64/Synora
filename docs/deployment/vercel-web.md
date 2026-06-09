# Déploiement Vercel - SYNORA Web

## Projet

- App: apps/web
- Framework: Next.js
- Build Command: npm run build
- Output Directory: .next

## Variables d'environnement Vercel

NEXT_PUBLIC_API_URL=https://URL_API_RENDER
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_SYN_TOKEN_ADDRESS=ADRESSE_CONTRAT_SYNORA

## Notes

- NEXT_PUBLIC_SYN_TOKEN_ADDRESS doit correspondre au contrat SYNORA déployé sur Base Sepolia.
- NEXT_PUBLIC_API_URL doit correspondre à l'URL publique Render.
- Les variables NEXT_PUBLIC_* sont visibles côté navigateur.
- Ne jamais ajouter de clé privée dans Vercel.