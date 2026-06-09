# Rewards EIP-712 - SYNORA

## Objectif

Préparer une autorisation backend signée pour un futur claim rewards on-chain.

## Variables futures Render

REWARDS_SIGNER_PRIVATE_KEY=clé privée signer rewards dédiée
REWARDS_DISTRIBUTOR_ADDRESS=adresse du contrat RewardsDistributor
REWARDS_CHAIN_ID=84532

## Important

- REWARDS_SIGNER_PRIVATE_KEY doit être une clé dédiée, différente du wallet principal.
- Ne jamais commiter cette clé.
- Le contrat RewardsDistributor devra vérifier la signature EIP-712 avant transfert.
- Le MVP actuel n'utilise pas encore cette signature en production.

## Domaine EIP-712

name: SYNORA Rewards
version: 1
chainId: 84532
verifyingContract: RewardsDistributor

## Type

RewardClaim(
  bytes32 rewardId,
  address wallet,
  uint256 amount
)

## Prochaine étape smart contract

Ajouter:

claimWithSignature(
  bytes32 rewardId,
  address wallet,
  uint256 amount,
  bytes signature
)