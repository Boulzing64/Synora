# Récompenses MVP SYNORA

## Objectif

Ajouter un premier parcours de récompense utilisateur sans transaction on-chain.

## Fonctionnement MVP

Le dashboard permet un claim de récompense MVP si:

- le wallet est connecté
- la signature wallet est validée
- un JWT SYNORA est actif
- le score réputation est supérieur ou égal à 60

Le claim crée un événement:

REWARD_CLAIMED

Cet événement augmente:

- rewardsClaimed
- eventsCount
- score de réputation selon le moteur MVP

## Limites

- Le claim est off-chain.
- Aucun token SYN n'est transféré automatiquement.
- Pas encore de contrat rewards.
- Pas encore de limite temporelle par période.
- Pas encore de preuve on-chain du claim.

## Prochaine évolution

Créer un système rewards plus robuste:

- table reward_claims
- règles anti-abus
- plafonds par wallet et période
- contrat RewardsDistributor
- signature backend pour autoriser un claim on-chain
- dashboard historique des récompenses