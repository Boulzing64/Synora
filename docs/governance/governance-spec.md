# Gouvernance SYNORA V1

## Objectif

Préparer une gouvernance SYNORA simple, transparente et évolutive.

## Principes

- Les SYN stakés donnent du poids de gouvernance.
- Le wallet conserve la propriété de ses tokens.
- La gouvernance V1 reste testnet.
- Les décisions critiques restent contrôlées en phase Beta.

## Concepts

### Voting Power

Voting power V1:

- governanceWeight = SYN stakés
- 1 SYN staké = 1 unité de poids

### Propositions

Une proposition contient:

- id
- titre
- description
- wallet créateur
- date création
- statut
- votes pour
- votes contre

### Vote

Un wallet peut voter:

- FOR
- AGAINST

Règles V1:

- un vote par wallet par proposition
- le poids du vote dépend du staking
- pas encore d’exécution on-chain automatique

## API prévue

GET /governance/proposals

POST /governance/proposals

POST /governance/proposals/:proposalId/vote

## Frontend prévu

Page:

/governance

Fonctionnalités:

- liste propositions
- créer proposition
- voter
- afficher poids gouvernance

## Roadmap

Phase 1:

- spécification
- API off-chain
- page frontend

Phase 2:

- stockage PostgreSQL
- historique votes

Phase 3:

- contrat gouvernance on-chain

Phase 4:

- exécution on-chain
- délégation
- DAO
