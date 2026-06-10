# Handoff SYNORA

## Etat actuel

SYNORA est un MVP Web3 fonctionnel déployé sur Base Sepolia avec authentification wallet, réputation persistante, rewards off-chain et on-chain, dashboard utilisateur, internationalisation FR/EN et leaderboard.

---

## Infrastructure

### Frontend

- Next.js
- Vercel
- Sidebar de navigation
- Dashboard utilisateur
- Internationalisation FR / EN
- Help Widget moderne
- Responsive desktop/mobile

### Backend

- Express
- PostgreSQL Render
- JWT
- Authentification wallet par signature
- Rate limiting
- Helmet
- CORS
- Logs structurés
- Tests automatisés

### Blockchain

- Réseau : Base Sepolia
- Chain ID : 84532

### Contrats

SYN Token

- 0xC7F6E084D3F8e8E1D4B7A56B46548eb351B81916

RewardsDistributor

- 0xADbAA2ABF6b40a3705FAA54A41bF3010768A8443

Etat :

- Déployé
- Vérifié
- Financé avec 1000 SYN

---

## Fonctionnalités terminées

### Authentification

- Connexion MetaMask
- Signature wallet
- JWT persistant
- Restauration de session

### Réputation

- Profil utilisateur
- Historique réputation
- Score réputation
- Niveaux réputation
- Evénements persistants PostgreSQL

### Rewards

Off-chain :

- Claim MVP
- Historique rewards

On-chain :

- Endpoint /rewards/authorize
- Signatures EIP-712
- RewardsDistributor.claimWithSignature
- Claim on-chain depuis dashboard
- Réception SYN validée

### Dashboard

- Balance SYN
- Wallet connecté
- Statut session
- Réputation
- Historique
- Rewards

### Internationalisation

Pages traduites :

- Home
- Dashboard
- Rewards
- Reputation
- Status
- Help Widget

### Leaderboard

Backend :

- GET /leaderboard

Frontend :

- Page /leaderboard
- Classement score
- Classement rewards
- Classement activité

### Badges

Backend :

- Moteur badges
- Endpoint /badges/:walletAddress

Badges disponibles :

- Wallet Verified
- Early Adopter
- SYN Connected
- Reward Claimer
- On-chain Pioneer
- Top Reputation

Frontend :

- En cours d'intégration

---

## Tests validés

### API

- Auth wallet
- JWT
- Réputation
- Rewards
- Leaderboard
- Badges

### Frontend

- Build Next.js
- Navigation sidebar
- Dashboard
- Internationalisation

### Blockchain

- SYN Token
- RewardsDistributor
- Claim on-chain validé
- Financement RewardsDistributor validé

---

## Fonctionnalités en cours

### Badges Frontend

Etat :

- API terminée
- UI à terminer

Objectif :

- Affichage badges utilisateur
- Etat verrouillé / débloqué
- Intégration dashboard

---

## Fonctionnalités prioritaires restantes

### Priorité 1

Badges utilisateur complets

- Page badges
- Intégration dashboard
- Progression utilisateur

### Priorité 2

Assistant IA SYNORA

- Remplacer Help Widget statique
- API OpenAI
- Réponses contextualisées
- Support utilisateur

### Priorité 3

Staking SYN

- Lock tokens
- Récompenses staking
- Préparation gouvernance

### Priorité 4

DAO SYNORA

- Propositions
- Vote
- Délégation
- Gouvernance on-chain

### Priorité 5

Analytics

- Statistiques plateforme
- Nombre wallets
- Rewards distribués
- Evolution réputation

---

## Vision post-MVP

Phase Beta

- Badges
- Assistant IA
- Analytics

Phase V1

- Staking
- Gouvernance
- DAO

Phase V2

- IA comportementale
- Réputation avancée
- Recommandations intelligentes

---

## Etat global

SYNORA dispose aujourd'hui :

- Auth wallet
- Réputation persistante
- Dashboard
- Rewards off-chain
- Rewards on-chain
- Leaderboard
- Internationalisation
- Infrastructure cloud
- Contrats déployés

Le MVP Beta est opérationnel.

## Assistant IA SYNORA

### Etat

Terminé et opérationnel.

### Backend

Endpoint :

POST /assistant/chat

Fonctionnalités :

- Intégration OpenAI
- Réponses contextualisées SYNORA
- Protection clé API côté serveur
- Fallback automatique si OPENAI_API_KEY absente

Variables Render :

OPENAI_API_KEY
OPENAI_MODEL

Modèle actuel :

gpt-4.1-mini

### Frontend

Composant :

apps/web/src/components/HelpWidget.tsx

Fonctionnalités :

- Widget flottant moderne
- Disponible sur toutes les pages
- Support FR / EN
- Questions prédéfinies
- Questions libres
- Envoi par bouton
- Envoi par touche Entrée
- Réponses dynamiques via API

### Cas d'usage

L'assistant peut aider sur :

- Connexion wallet
- Authentification
- Réputation
- Rewards
- Claim on-chain
- Base Sepolia
- Navigation dashboard

### Sécurité

L'assistant ne doit jamais :

- Demander une clé privée
- Demander une seed phrase
- Demander des informations sensibles

### Evolutions futures

Phase Beta :

- Historique conversation
- Suggestions contextuelles
- FAQ dynamique

Phase V1 :

- Mémoire utilisateur
- Analyse réputation
- Recommandations personnalisées

Phase V2 :

- Assistant comportemental SYNORA
- Coaching utilisateur
- IA de réputation avancée

### Etat global projet

SYNORA Beta comprend désormais :

- Auth wallet
- Réputation persistante
- Dashboard
- Rewards off-chain
- Rewards on-chain
- Leaderboard
- Badges
- Internationalisation FR/EN
- Assistant IA
- Infrastructure cloud complète

Le MVP Beta est considéré comme fonctionnel et démontrable.

