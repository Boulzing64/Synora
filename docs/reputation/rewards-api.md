# Rewards API - SYNORA

## Endpoint off-chain actuel

POST /rewards/claim

Crée un claim off-chain persistant dans reward_claims.

## Endpoint futur on-chain

POST /rewards/authorize

Retourne une autorisation EIP-712:

- rewardId
- walletAddress
- amount
- signature
- verifyingContract
- chainId

## Conditions

- JWT valide
- Score réputation >= 60
- Wallet éligible selon règles anti-abus
- Variables rewards configurées côté API

## Variables Render futures

REWARDS_SIGNER_PRIVATE_KEY=clé privée dédiée au signer rewards
REWARDS_DISTRIBUTOR_ADDRESS=adresse du contrat RewardsDistributor
REWARDS_CHAIN_ID=84532

## Important

L'endpoint /rewards/authorize est préparé mais ne doit être activement utilisé en production qu'après déploiement et financement du RewardsDistributor.