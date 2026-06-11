# Revue de securite du 11 juin 2026

## Corrections appliquees

- Le keystore Android de release et `keystore.properties` ont ete retires du suivi Git.
- Les secrets de signature Android sont maintenant ignores par `.gitignore`.
- Un fichier `keystore.properties.example` sans secret documente la configuration locale.
- Les identifiants de rewards MVP sont deterministes par wallet et par jour.
- Plusieurs demandes d'autorisation dans la meme journee ne permettent plus plusieurs claims on-chain.
- L'API refuse les evenements `REWARD_CLAIMED` declares par le frontend.
- L'API refuse le champ `value` fourni par le frontend pour gonfler un score.

## Action manuelle obligatoire

Le keystore Android et ses mots de passe ont deja existe dans l'historique Git. Ils doivent etre
consideres comme compromis. Creer un nouveau keystore avant toute release Android publique et ne
jamais reutiliser les anciens mots de passe.

## Limite actuelle

Le programme de distribution des 100 SYN beta n'est pas encore implemente. Il devra utiliser une
autorisation unique par wallet, une confirmation on-chain et un historique persistant.
