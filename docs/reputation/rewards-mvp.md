# Rewards Beta SYNORA

## Objectif

Remplacer le claim MVP simple par un module rewards dédié, persistant et contrôlé côté API.

## Endpoint

POST /rewards/claim

## Conditions

- JWT valide
- Wallet authentifié
- Score réputation >= 60
- Pas de claim MVP dans les dernières 24 heures

## Réponse

- rewardClaim
- reputation
- user

## Table PostgreSQL

reward_claims

Colonnes:

- id
- wallet_address
- reward_type
- amount
- status
- created_at

## Migration

- 005_create_reward_claims

## Récompense actuelle

- rewardType: MVP_REWARD
- amount: 10
- status: CLAIMED

## Limites

- Le claim reste off-chain.
- Aucun transfert SYN automatique.
- Pas encore de contrat RewardsDistributor.
- Pas encore de signature backend pour claim on-chain.

## Prochaine évolution

- Créer un contrat RewardsDistributor
- Ajouter signature backend EIP-712
- Ajouter période de claim configurable
- Ajouter dashboard historique rewards dédié
- Ajouter règles anti-abus plus fines