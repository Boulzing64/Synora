# Audit MVP SYNORA

## État général

Le MVP SYNORA est fonctionnel avec :

- Smart contract ERC-20 SYNORA déployé sur Base Sepolia
- Contrat vérifié via Hardhat Verify / Blockscout
- Frontend Next.js déployé sur Vercel
- API Express déployée sur Render
- PostgreSQL Render connecté
- Authentification wallet par signature
- Lecture balance SYN
- Moteur de réputation MVP
- Dashboard utilisateur
- CI GitHub Actions
- Sécurité API renforcée

## Risques techniques

### 1. Persistance et migrations

Les tables PostgreSQL sont créées automatiquement au démarrage API.

Risque :
- Pas de système de migration versionné
- Évolution du schéma difficile à contrôler

Recommandation :
- Ajouter un outil de migrations SQL
- Créer un dossier apps/api/src/db/migrations
- Versionner chaque changement de schéma

### 2. Réputation manipulable

Le moteur de réputation accepte encore certains événements déclarés côté API.

Risque :
- Score manipulable si les règles ne sont pas strictement liées à des preuves vérifiables

Recommandation :
- Vérifier les événements sensibles côté backend
- Lier les points à des preuves on-chain ou actions validées
- Ajouter des règles anti-spam par wallet et IP

### 3. Stockage JWT côté frontend

Le MVP garde la session en mémoire React.

Risque :
- Session perdue au refresh
- Pas encore de stratégie de refresh token

Recommandation :
- Ajouter une stratégie de session propre
- Utiliser des cookies httpOnly si backend et frontend sont alignés
- Ajouter expiration et renouvellement contrôlé

### 4. CORS et previews Vercel

L’API autorise actuellement l’origine principale Vercel.

Risque :
- Les URLs preview Vercel peuvent échouer si elles ne sont pas dans WEB_ORIGINS

Recommandation :
- Ajouter les URLs preview nécessaires dans WEB_ORIGINS
- Garder une liste stricte des origines autorisées

### 5. Dépendances npm

Des vulnérabilités npm sont signalées.

Risque :
- Certaines vulnérabilités peuvent venir de dépendances de développement
- Un audit précis est nécessaire avant production

Recommandation :
- Exécuter npm audit
- Éviter npm audit fix --force sans analyse
- Mettre à jour progressivement les dépendances critiques

## Risques sécurité

### 1. Clés privées

La clé privée de déploiement reste manipulée localement.

Recommandation :
- Utiliser uniquement un wallet de test
- Ne jamais stocker la clé dans GitHub, Render ou Vercel
- Créer un wallet deployer dédié pour testnet

### 2. Signature wallet

Le message signé est simple et fonctionnel pour MVP.

Recommandation :
- Migrer vers SIWE ou EIP-712
- Ajouter domain dynamique selon environnement
- Ajouter chainId dans le message signé

### 3. Rate limiting

Rate limiting ajouté sur les endpoints sensibles.

Recommandation :
- Surveiller les logs Render
- Ajuster les limites après tests utilisateurs
- Ajouter protection anti-bot si nécessaire

## Risques scalabilité

### 1. Render Free

Le service Render Free peut dormir après inactivité.

Impact :
- Premier appel lent
- Mauvaise expérience utilisateur

Recommandation :
- Passer en plan payant si démonstration publique importante

### 2. RPC public Base Sepolia

Le RPC public est limité.

Impact :
- Lecture balance SYN parfois lente ou refusée

Recommandation :
- Utiliser un RPC dédié Alchemy, Infura ou QuickNode pour les tests avancés

### 3. PostgreSQL Free

La base Render Free a des limites.

Recommandation :
- Surveiller stockage, connexions et performances
- Prévoir upgrade avant bêta publique

## Dette technique

- Pas encore de couche repository typée complète
- Pas encore de migrations SQL
- Pas encore de tests API HTTP automatisés
- Pas encore de tests frontend
- Pas encore de gestion avancée des erreurs frontend
- Pas encore de logs structurés
- Pas encore de monitoring

## Priorités recommandées

1. Ajouter migrations PostgreSQL versionnées
2. Ajouter tests API automatisés
3. Ajouter SIWE ou EIP-712
4. Ajouter logs structurés
5. Ajouter page dashboard plus complète
6. Ajouter système de récompenses réel
7. Préparer architecture IA réputation
8. Préparer gouvernance future