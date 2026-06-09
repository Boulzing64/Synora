# CI GitHub Actions - SYNORA

## Workflow

Fichier:

.github/workflows/ci.yml

## Déclencheurs

- Push sur main
- Pull request vers main

## Vérifications

- Installation npm
- Compilation smart contracts Hardhat
- Tests smart contracts
- Build API
- Tests moteur de réputation
- Build frontend Next.js

## Secrets

Aucun secret n'est requis pour la CI actuelle.

La CI ne déploie pas et ne lit pas de clé privée.

## Objectif

Empêcher qu'un changement cassant soit poussé sur main sans détecter:

- erreur Solidity
- erreur TypeScript API
- erreur moteur réputation
- erreur build frontend