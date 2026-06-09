# Déploiement futur RewardsDistributor - SYNORA

## État

Le contrat RewardsDistributor est préparé mais pas encore déployé.

## Token de récompense

- Token: SYNORA
- Network: Base Sepolia
- Address: 0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916

## Module Ignition

contracts/ignition/modules/RewardsDistributor.ts

## Paramètres

contracts/ignition/parameters/base-sepolia-rewards.json

## Commande de déploiement future

npm run deploy:rewards:base-sepolia -w .\contracts

## Après déploiement

À faire:

1. Récupérer l'adresse RewardsDistributor
2. Transférer des SYN vers RewardsDistributor
3. Ajouter l'adresse dans Render
4. Ajouter l'adresse dans Vercel si affichage frontend nécessaire
5. Préparer la vérification explorer
6. Ajouter un endpoint API de préparation claim on-chain

## Important

Ne pas déployer tant que le modèle de sécurité on-chain n'est pas validé.
La version actuelle est owner-controlled.