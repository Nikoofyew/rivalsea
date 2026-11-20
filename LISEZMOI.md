# RivalSea, version multijoueur

## Comment ça marche, en deux minutes

Dans la maquette, tout le jeu tournait dans **votre** navigateur : les autres bateaux étaient des bots inventés par votre ordinateur.

Pour jouer à plusieurs, il faut un **arbitre commun** que tout le monde consulte : c'est le **serveur**. C'est un programme qui tourne en permanence sur un ordinateur allumé jour et nuit (chez un hébergeur).

```
 Joueur A (navigateur) ──┐
 Joueur B (navigateur) ──┼──►  SERVEUR  : calcule la partie 20 fois par seconde
 Joueur C (navigateur) ──┘     (positions, tirs, dégâts, XP, bots, kraken…)
```

1. Chaque joueur ouvre l'adresse du jeu. Le serveur lui envoie la page.
2. Le navigateur ouvre ensuite une **ligne directe** avec le serveur (une « WebSocket ») qui reste ouverte pendant toute la partie.
3. Sur cette ligne, le navigateur envoie seulement **où le joueur veut aller** (direction de la souris), la compétence spéciale et ses choix de bonus.
4. Le serveur calcule tout et renvoie 20 fois par seconde **ce que ce joueur a le droit de voir** : les navires cachés dans le brouillard ne sont même pas envoyés, impossible de tricher en fouillant la page.
5. Le navigateur se contente de dessiner.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `server.js` | Le serveur : envoie les pages et gère les connexions en direct. |
| `game.js` | Les règles du jeu : déplacements, combats, XP, bots, événements. |
| `index.html` | Ce que voit le joueur : menu, dessin du jeu, commandes. |
| `shared.js` | Les données communes : navires, armes, butin, bonus. **C'est ici qu'on règle l'équilibrage.** |
| `i18n.js` | Les traductions (français, anglais, espagnol). Pour corriger ou ajouter un texte, c'est ici. |
| `package.json` | La carte d'identité du projet pour les hébergeurs. |
| `tests.js` | Les tests automatiques : `npm test` vérifie que rien n'est cassé et que l'équilibrage tient. À lancer avant chaque mise en ligne. |

Aucune bibliothèque à installer : il faut seulement **Node.js** (version 18 ou plus récente).

## Étape 1 : jouer sur votre ordinateur

1. Installez Node.js depuis https://nodejs.org (version « LTS »), puis redémarrez l'ordinateur si on vous le demande.
2. Décompressez le dossier `rivalsea-serveur`.
3. Ouvrez un terminal **dans ce dossier** :
   - Windows : ouvrez le dossier, cliquez dans la barre d'adresse, tapez `cmd` puis Entrée.
   - Mac : clic droit sur le dossier → Services → « Nouveau terminal au dossier ».
4. Tapez `node server.js` puis Entrée. Le message « RivalSea est en ligne sur http://localhost:3000 » s'affiche.
5. Ouvrez http://localhost:3000 dans votre navigateur. Ouvrez un deuxième onglet : vous verrez deux joueurs dans la même partie.

Pour arrêter le serveur : `Ctrl + C` dans le terminal.

**Jouer avec quelqu'un sur le même Wi-Fi :** trouvez l'adresse de votre ordinateur sur le réseau (Windows : tapez `ipconfig` dans le terminal, ligne « Adresse IPv4 » ; Mac : Réglages → Wi-Fi → Détails). L'autre personne ouvre alors `http://ADRESSE:3000`, par exemple `http://192.168.1.20:3000`. Si Windows demande d'autoriser Node.js dans le pare-feu, acceptez pour les réseaux privés.

## Étape 2 : mettre le jeu en ligne pour tout le monde

Il faut un hébergeur qui accepte Node.js et les WebSockets. Exemple avec **Render** (offre gratuite) :

1. Créez un compte gratuit sur https://github.com, puis un nouveau dépôt (« New repository »), par exemple `rivalsea`.
2. Dans ce dépôt : « Add file » → « Upload files », glissez tous les fichiers du dossier `rivalsea-serveur`, puis « Commit changes ».
3. Créez un compte sur https://render.com en vous connectant avec GitHub.
4. « New » → « Web Service » → choisissez votre dépôt `rivalsea`.
5. Réglages :
   - Language / Runtime : **Node**
   - Build Command : `npm install` (il n'y a rien à installer, mais le champ est obligatoire)
   - Start Command : `node server.js`
   - Instance Type : **Free**
6. « Deploy ». Après une ou deux minutes, Render vous donne une adresse du type `https://rivalsea-xxxx.onrender.com`. C'est l'adresse à partager.

Bon à savoir sur l'offre gratuite : le serveur **s'endort après 15 minutes sans visite**. Le premier joueur qui revient attend alors jusqu'à une minute (le menu affiche « Connexion au serveur… »). L'offre payante la plus simple supprime cette mise en veille.

Pour mettre à jour le jeu en ligne : remplacez les fichiers dans GitHub. Render redéploie automatiquement.

## Réglages sans toucher au code

Dans Render : onglet « Environment » → « Add Environment Variable ». En local, sous Windows : `set MODE=team` puis `node server.js` ; sur Mac : `MODE=team node server.js`.

| Variable | Valeurs | Effet |
|---|---|---|
| `MODE` | `ffa` (défaut) ou `team` | Chacun pour soi, ou 4 équipages de couleur sans tir entre alliés. |
| `BOTS` | nombre, défaut `12` | Nombre de navires visé sur la carte. Les bots comblent les places vides et laissent la place quand des joueurs arrivent. |
| `MAX_PLAYERS` | nombre, défaut `40` | Nombre maximum de joueurs humains en même temps. |

L'adresse `/sante` (par exemple http://localhost:3000/sante) indique si le serveur tourne et combien de joueurs sont connectés.

## Modifier l'équilibrage

Tout est dans `shared.js` : vitesse (`spd`), points de vie (`hp`), dégâts (`dmg`), portée (`rng`), cadence (`rate`) de chaque navire, XP du butin, bonus, compétences, et la formule d'XP par niveau (`need`). Après une modification, relancez le serveur.

## Différences avec la maquette solo

- La partie **ne se met pas en pause** quand vous montez de niveau : les choix de bonus et d'évolution apparaissent en bas de l'écran pendant que vous naviguez (touches 1, 2, 3 ou clic).
- Après un naufrage, « Reprendre la mer » vous remet en chaloupe dans la même partie.
- Quand personne n'est connecté, le monde se met en pause pour économiser le serveur.

## Limites actuelles

- Pas de comptes ni de sauvegarde : un redémarrage du serveur remet le monde à zéro.
- Une seule partie (un seul monde) par serveur.
- Les mouvements sont lissés mais pas « prédits » : avec une mauvaise connexion, votre navire réagit avec un léger retard.
