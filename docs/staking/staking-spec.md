# Spécification staking SYNORA

## Objectif

Créer un système de staking SYN permettant aux utilisateurs de verrouiller des tokens SYN pour préparer:

- bonus réputation
- poids de gouvernance
- futurs rewards staking
- fidélisation long terme

## Version V1 testnet

Le staking V1 sera simple et sécurisé:

- staking du token SYN
- unstaking possible par l'utilisateur
- suivi du montant staké
- suivi du staking total
- pas encore de rendement automatique
- pas encore de lock obligatoire
- pas encore de slashing

## Contrat prévu

Nom:

SYNStaking

Fonctions principales:

stake(uint256 amount)

unstake(uint256 amount)

stakedBalanceOf(address wallet)

totalStaked()

## Règles

- amount doit être supérieur à 0
- l'utilisateur doit approuver le contrat avant stake
- le contrat transfère les SYN de l'utilisateur vers le staking contract
- unstake rend les SYN à l'utilisateur
- le staking contract ne mint pas de tokens
- le staking contract conserve les SYN déposés

## Événements

Staked(address indexed wallet, uint256 amount)

Unstaked(address indexed wallet, uint256 amount)

## Sécurité

- utiliser SafeERC20
- protéger les montants nuls
- éviter toute logique complexe en V1
- garder le contrat auditable
- pas de rewards automatiques avant validation
- pas de gouvernance active avant tests

## Intégration API future

Endpoints possibles:

GET /staking/:walletAddress

Retourne:

- walletAddress
- stakedBalance
- stakingScoreBoost
- governanceWeight

## Intégration frontend future

Page:

/staking

Actions:

- lire balance SYN
- lire montant staké
- approve SYN
- stake
- unstake
- afficher poids gouvernance futur

## Roadmap staking

Phase 1:

- contrat SYNStaking
- tests Solidity
- déploiement Base Sepolia

Phase 2:

- frontend staking
- API read-only
- dashboard staking

Phase 3:

- bonus réputation
- poids gouvernance

Phase 4:

- DAO SYNORA
