# RewardsDistributor - SYNORA

## Objectif

Préparer le passage du claim rewards off-chain vers un claim utilisateur on-chain autorisé par signature EIP-712.

## Contrat

contracts/contracts/RewardsDistributor.sol

## Fonctions

claimReward(bytes32 rewardId, address wallet, uint256 amount)

- Appel owner-only
- Permet au propriétaire de déclencher une récompense

claimWithSignature(bytes32 rewardId, address wallet, uint256 amount, bytes signature)

- Appel utilisateur
- msg.sender doit être égal au wallet
- La signature EIP-712 doit être valide
- Le signer récupéré doit être rewardsSigner
- rewardId ne doit pas déjà être utilisé
- amount doit être supérieur à 0
- wallet ne doit pas être l'adresse zéro

## Domaine EIP-712

- name: SYNORA Rewards
- version: 1
- chainId: réseau courant
- verifyingContract: RewardsDistributor

## Typehash

RewardClaim(bytes32 rewardId,address wallet,uint256 amount)

## Sécurité

- rewardId empêche le double claim
- rewardsSigner peut être changé par owner
- withdraw est owner-only
- rewardToken est immutable
- claimWithSignature empêche un autre wallet de réclamer la récompense d'un utilisateur

## Limites

- Contrat non déployé actuellement
- Nécessite un signer rewards dédié
- Nécessite financement du contrat en SYN
- Nécessite endpoint API produisant rewardId, amount et signature

## Prochaine étape

Déployer sur Base Sepolia uniquement après validation du modèle de sécurité.