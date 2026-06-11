# Programme Founding Beta Tester

## Objectif

Attribuer 100 SYN de test sur Base Sepolia une seule fois par wallet authentifie, dans la limite
de 100 wallets.

## Parcours

1. L'utilisateur authentifie son wallet depuis le dashboard.
2. La page `/obtenir-syn` demande une autorisation EIP-712 unique.
3. L'utilisateur confirme le claim dans MetaMask.
4. L'API verifie l'evenement `RewardClaimed` sur Base Sepolia.
5. PostgreSQL enregistre la transaction et active le badge `Founding Beta Tester`.

## Migration

La migration `008_create_beta_distributions` est appliquee automatiquement au demarrage de l'API.

## Variables requises sur Render

- `DATABASE_URL`
- `BASE_SEPOLIA_RPC_URL`
- `REWARDS_SIGNER_PRIVATE_KEY`
- `REWARDS_DISTRIBUTOR_ADDRESS`
- `REWARDS_CHAIN_ID=84532`
- `BETA_MAX_TESTERS=100`

## Variables requises sur Vercel

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_CHAIN_ID=84532`
- `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL`
- `NEXT_PUBLIC_REWARDS_DISTRIBUTOR_ADDRESS`

## Financement du contrat

Le contrat `RewardsDistributor` doit contenir au minimum 100 SYN par beta-testeur prevu,
en conservant une reserve pour les rewards MVP de 10 SYN.

## Protections

- JWT lie au wallet authentifie
- une ligne PostgreSQL unique par wallet
- fermeture atomique apres 100 inscriptions
- un `rewardId` deterministe unique par wallet
- anti-double claim du contrat
- verification du receipt et de l'evenement on-chain
- transaction unique en base

## Limite connue

La V1 limite une attribution par wallet, mais ne bloque pas une meme personne utilisant plusieurs
wallets. Pour une beta testnet, cette limite est acceptable avec une petite cohorte invitee. Une
future V2 pourra ajouter invitations, allowlist ou verification communautaire.
