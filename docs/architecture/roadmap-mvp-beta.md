# Roadmap SYNORA - MVP vers Beta

## Objectif

Faire évoluer SYNORA du MVP actuel vers une beta testable publiquement, avec une architecture plus robuste, une réputation moins manipulable et une préparation à l'IA comportementale.

## État MVP actuel

- Token ERC-20 SYNORA déployé sur Base Sepolia
- Contrat vérifié via Hardhat Verify / Blockscout
- Frontend Next.js déployé sur Vercel
- API Express déployée sur Render
- PostgreSQL Render connecté
- Authentification wallet par signature
- Lecture balance SYN
- Dashboard utilisateur
- Moteur de réputation MVP
- Session frontend persistante
- CI GitHub Actions
- Page statut MVP
- Audit sécurité MVP

## Sprint 1 - Stabilisation technique

Objectifs:

- Corriger les derniers warnings TypeScript ou npm
- Ajouter tests API supplémentaires
- Ajouter logs structurés
- Ajouter gestion d'erreurs frontend plus propre
- Vérifier les redéploiements Render et Vercel

Livrables:

- Tests HTTP complets
- Logs API lisibles
- Messages erreur utilisateur améliorés

## Sprint 2 - Réputation robuste

Objectifs:

- Empêcher les événements réputation abusifs
- Ajouter règles anti-spam
- Ajouter plafonds par période
- Ajouter scoring plus explicable

Livrables:

- Règles réputation documentées
- Historique événements consultable
- Score plus stable

## Sprint 3 - Récompenses SYN

Objectifs:

- Définir les règles de récompense
- Ajouter endpoint de préparation de claim
- Étudier claim off-chain vs on-chain
- Préparer un contrat de rewards si nécessaire

Livrables:

- Spécification récompenses
- Prototype claim testnet
- Dashboard récompenses enrichi

## Sprint 4 - Déploiement beta

Objectifs:

- Passer Render en plan stable si nécessaire
- Utiliser RPC dédié
- Ajouter monitoring basique
- Ajouter domaine personnalisé
- Stabiliser PostgreSQL

Livrables:

- URL publique stable
- Healthcheck monitoring
- Dashboard utilisable par testeurs

## Sprint 5 - Gouvernance future

Objectifs:

- Concevoir staking SYN
- Concevoir délégation
- Concevoir propositions
- Concevoir vote on-chain

Livrables:

- Spécification gouvernance
- Architecture contrats gouvernance
- Plan de migration depuis MVP

## Sprint 6 - Préparation IA

Objectifs:

- Identifier signaux comportementaux utiles
- Structurer les événements réputation
- Préparer dataset exploitable
- Définir règles d'éthique et anti-biais

Livrables:

- Schéma événements IA-ready
- Feuille de route IA comportementale
- Garde-fous sécurité et confidentialité

## Priorité immédiate

La priorité recommandée est:

1. Renforcer les tests API
2. Ajouter logs structurés
3. Améliorer les règles réputation
4. Créer un historique utilisateur
5. Préparer les récompenses SYN