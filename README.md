# Restaurant Pro v2.35 — Préparation SCE 2.0 Belgique

> ⚠️ **STATUT : PRÉ-CERTIFICATION / DÉMO — NON CERTIFIÉ SPF FINANCES.** Cette version ne doit pas être utilisée comme caisse fiscale SCE en production. Le mode actuel fonctionne sur GitHub Pages/localStorage et ne communique pas encore avec un FDM certifié.

## Objectif v2.35

Cette version prépare l'application à la certification belge **SCE 2.0** sans prétendre qu'elle est déjà certifiée. Elle ajoute une page **🛡️ SCE 2.0** par établissement avec configuration TVA/établissement/POS/terminal/device/FDM, contrôle de préparation et journal JSON simulé.

Fonctions préparées dans le démo :
- identification utilisateur avec champ NISS 11 chiffres (le NISS n'est pas imprimé sur le ticket) ;
- codes TVA internes A=21 %, B=12 %, C=6 %, D=0 %, X=hors champ ;
- events simulés **P** (commande/table), **N** (vente finale), **F** (mouvements/comptage caisse) et **R** (rapports X/Z) ;
- compteurs d'events et numéro fiscal POS simulés ;
- `bookingPeriodId`, `bookingDate`, `posId`, `terminalId`, `deviceId`, `employeeId` et autres champs préparatoires ;
- arrondi espèces au multiple de 0,05 € avec ligne ROUNDING séparée ; les chèques-repas ne sont pas arrondis ;
- export du journal fiscal simulé en JSON ;
- Ticket X et Ticket Z intégrés au journal SCE simulé ;
- ticket client de la démo explicitement marqué **NON FISCAL** tant qu'aucun FDM ne signe la vente.

## Ce qui reste obligatoire avant de commercialiser Restaurant Pro comme SCE certifié

1. Remplacer le stockage `localStorage` par un stockage serveur sécurisé et documenté, avec conservation des données originales POS + réponses FDM.
2. Intégrer réellement un **FDM SCE 2.0 certifié** via le protocole/API GraphQL officiel.
3. Bloquer techniquement toute finalisation d'une vente lorsque le FDM n'est pas connecté et opérationnel, et attendre sa signature avant le ticket TVA.
4. Imprimer/produire le ticket TVA avec les données de contrôle et le QR reçus/produits à partir de la réponse FDM.
5. Finaliser les events S (présence du personnel), C (copies), I (factures) et les scénarios de correction/remboursement conformément aux Use Cases officiels.
6. Préparer le dossier technique, la description de la base de données et les mécanismes de sécurité, puis passer la **certification officielle SPF Finances**.
7. Pour les factures B2B/B2G concernées, intégrer la facturation électronique structurée/Peppol.

Documentation officielle à suivre pendant le développement :
- https://www.systemedecaisseenregistreuse.be/fr/sce-20-0
- https://www.systemedecaisseenregistreuse.be/fr/systemes-certifies/sce-2-0
- contact technique SPF SCE : secr.gksce@minfin.fed.be

---

## Nouveautés v2.34

- Le rôle **Serveur** peut maintenant ouvrir **💶 Recette du jour · Ticket X** depuis la caisse.
- Le Ticket X reste **strictement en lecture seule** : il ne ferme rien et ne remet aucun compteur à zéro.
- Le serveur voit le total en cours, les moyens de paiement, la TVA estimée et le détail par serveur / encaisseur.
- Le **Ticket Z**, la fermeture de caisse et la clôture restent réservés au Responsable / Administrateur / Super Admin.
- Après un Ticket Z, le Ticket X repart toujours à zéro pour le nouveau cycle.

# Restaurant Pro v2.33 — Tickets X / Z

## Nouveautés v2.33

- Nouveau **Ticket X** : affiche à tout moment le résultat courant sans fermer ni remettre les compteurs à zéro.
- Le Ticket X montre le **CA, nombre de tickets, carte, espèces, chèques-repas, TVA et le détail de chaque serveur / encaisseur**.
- Le **Ticket Z** devient la vraie clôture de la période : il enregistre le total, ferme la caisse et démarre un nouveau cycle de compteurs.
- Après un Ticket Z, le Ticket X repart à **zéro pour tous les serveurs**, tout en gardant les anciennes ventes dans l’historique et la comptabilité.
- Le Ticket Z reçoit un **numéro séquentiel** (Z #0001, Z #0002, etc.) et garde la période de début/fin.
- Après la clôture Z, **aucune vente ne peut être envoyée ou encaissée tant qu’une nouvelle caisse n’a pas été ouverte**.
- L’ouverture de caisse reste possible pour le rôle Serveur ; les Tickets X/Z restent réservés au Responsable / Administrateur / Super Admin.
- Les dépenses espèces du cycle sont rattachées à la clôture Z afin d’éviter qu’elles soient recomptées dans le cycle suivant.

> Démo de gestion interne : le Ticket Z de cette version ne remplace pas une clôture fiscale certifiée SCE.

---

# Restaurant Pro v2.32 — Clôture par serveur / encaisseur

## Nouveautés v2.32

- La clôture de journée affiche maintenant **chaque serveur qui a encaissé** pendant la journée.
- Pour chaque serveur : **nombre de tickets, carte, espèces, chèques-repas et total encaissé**.
- Le serveur retenu est la personne connectée au moment du paiement, même si un autre serveur avait créé la commande.
- Le détail est enregistré dans la clôture et reste visible dans **Comptabilité → Clôtures journalières → Voir détail**.
- Les anciennes clôtures tentent de reconstruire le détail à partir des tickets encore présents dans la démo.
- L’export CSV comptable contient aussi la colonne **Serveur / Encaisseur**.

---

# Restaurant Pro v2.31 — Ouverture caisse par serveur

## Nouveautés v2.31

- Le rôle **Serveur** peut maintenant **ouvrir la caisse** au début du service.
- Le fond de caisse peut être saisi lors de l’ouverture et l’ouverture est tracée avec le nom du serveur connecté.
- Le serveur **ne peut pas fermer la caisse**.
- Le serveur **ne peut pas clôturer la journée**.
- **Fermer caisse** et **Clôturer journée** restent réservés au Responsable / Administrateur / Super Admin.
- Des contrôles supplémentaires bloquent aussi une tentative de fermeture/clôture depuis l’interface si le rôle n’est pas autorisé.
- Le serveur conserve uniquement **Caisse + Réservations** dans la navigation.

---

# Restaurant Pro v2.30 — Accès établissement + PIN / NFC

## Nouveautés v2.30

- Chaque établissement possède maintenant un **lien de caisse dédié** de type `?est=ID` pour tester l’accès du personnel.
- Depuis **Super Admin**, boutons **🧪 Tester accès** et **🔗 Lien caisse** sur chaque établissement.
- Sur un lien établissement, un serveur ne peut se connecter que s’il est autorisé sur cet établissement.
- Le serveur conserve uniquement **Caisse + Réservations** selon les droits déjà en place.
- Connexion du personnel par **PIN** ou par **badge NFC**.
- Ajout d’un identifiant de badge NFC sur chaque fiche personnel, avec génération d’un code de démonstration.
- Bouton **💳 Tester un badge NFC** sur l’écran de connexion pour simuler le passage d’une carte sans matériel.
- Si le navigateur prend en charge Web NFC, bouton **📡 Lire une carte NFC** et possibilité d’associer la carte depuis la fiche personnel.
- Le mode lien établissement verrouille le sélecteur d’établissement pour les comptes non Super Admin.

> Démo : les liens dédiés fonctionnent avec les données stockées dans le même navigateur/origine GitHub Pages. Pour les partager réellement entre appareils et restaurants, il faudra la future version serveur Render + PostgreSQL. Web NFC dépend aussi du navigateur/appareil ; le simulateur reste disponible partout.

---

# Restaurant Pro v2.29 — Compte administrateur par établissement

## Nouveautés v2.29

- Chaque nouvel établissement reçoit désormais son **propre compte administrateur principal**.
- À la création d’un établissement, le Super Admin doit saisir : **e-mail administrateur + PIN initial**.
- Connexion du restaurant avec **e-mail + PIN**.
- Le compte administrateur principal est automatiquement affecté à l’établissement.
- Pour un établissement déjà existant, **Modifier** permet d’associer/configurer l’administrateur et de définir un nouveau PIN.
- Le PIN doit contenir **4 à 8 chiffres**.
- Le PIN n’est plus affiché après l’enregistrement ; le Super Admin peut le réinitialiser en modifiant l’établissement.
- Les autres administrateurs, responsables et serveurs peuvent toujours être autorisés séparément.

> La récupération automatique par e-mail nécessitera toujours la future version serveur (Render + PostgreSQL).

---

# Restaurant Pro v2.28 — Accès établissements, e-mail et changement de PIN

## Nouveautés v2.28

- Lorsqu’un établissement est créé, les **administrateurs actifs du même client reçoivent automatiquement l’accès**.
- Le Super Admin peut choisir immédiatement quels **administrateurs, responsables et serveurs** auront accès à chaque établissement.
- La modification d’un établissement permet aussi de modifier les accès du personnel.
- Chaque établissement possède désormais un **e-mail obligatoire de contact / récupération PIN** lors de sa création ou modification.
- Chaque utilisateur peut avoir sa propre **adresse e-mail** et peut aussi se connecter avec celle-ci.
- Nouveau bouton **🔐 Mon PIN** : chaque utilisateur peut changer son PIN après avoir confirmé son PIN actuel.
- Nouveau bouton **PIN oublié ?** sur la connexion : dans la démo GitHub Pages, il prépare une demande e-mail vers l’établissement afin que l’administrateur réinitialise le PIN.
- Les anciens administrateurs sont migrés afin qu’ils voient automatiquement les établissements actifs de leur client, ce qui corrige le problème des établissements créés mais invisibles.

> Sécurité : GitHub Pages ne peut pas envoyer un vrai code de réinitialisation par e-mail. Pour une récupération automatique avec code unique envoyé par e-mail, il faudra la version serveur (Node.js/PostgreSQL). La démo évite volontairement de permettre un changement de PIN uniquement avec une adresse e-mail.

---

# Restaurant Pro v2.27 — Clôture de journée

## Nouveautés v2.27

- Nouveau bouton **Clôturer journée** accessible au responsable et à l’administrateur depuis la caisse.
- Blocage de la clôture s’il reste des commandes/tables ouvertes.
- Récapitulatif avant clôture : nombre de tickets, CA TVAC, carte, espèces, chèques-repas et TVA estimée.
- Contrôle espèces : fond de caisse + ventes espèces - sorties espèces = **espèces attendues**.
- Saisie du montant réellement compté et calcul automatique de l’**écart de caisse**.
- La clôture ferme automatiquement la caisse si elle est encore ouverte.
- Historique **Clôtures journalières** dans Comptabilité avec responsable, heure, CA, paiements et écart.
- Détail d’une clôture avec ventilation TVA 6 / 12 / 21 % et bouton d’impression.
- Une seule clôture finale par date et par établissement.

> Il s’agit d’une clôture de gestion interne. Cette démo GitHub Pages n’est pas un SCE fiscal certifié.

---

# Restaurant Pro v2.26 — Comptabilité améliorée

## Nouveautés v2.26

- Tableau de bord comptable avec **CA TVAC, CA HT, dépenses TVAC/HT, résultat HT estimé et montant à payer**.
- Filtres par période : aujourd’hui, mois, année, **dates personnalisées**, catégorie et statut des dépenses.
- Détail des **moyens de paiement** : carte, espèces et chèques-repas.
- Tableau TVA par taux **6 %, 12 % et 21 %** : base ventes HT, TVA ventes, TVA achats et solde estimé.
- Dépenses enrichies : échéance, statut payée/à payer, numéro de facture/référence, fournisseur et aperçu HT/TVA/TVAC.
- Détection visuelle des dépenses **à payer / en retard**.
- Journal de caisse : fond d’ouverture, ventes espèces, sorties espèces, montant attendu, montant compté et **écart de caisse**.
- Export CSV comptable enrichi avec HT, TVA, TVAC, référence, statut et moyen de paiement.
- Toutes les données restent séparées par établissement comme en v2.25.

> Les calculs comptables et TVA restent indicatifs dans cette démo GitHub Pages. Ils ne remplacent pas une comptabilité officielle ni une déclaration TVA.

---

# Restaurant Pro v2.25 — Multi-clients, multi-établissements et licences

## Nouveautés v2.25

- Nouveau rôle **Super Admin Restaurant Pro**, séparé des administrateurs des restaurants.
- Console **🏢 Super Admin** pour créer et modifier des **clients**.
- Chaque client peut posséder **un ou plusieurs établissements**.
- Sélecteur d’établissement dans la barre supérieure.
- Chaque établissement conserve séparément ses **salles/tables, produits, stock, réservations, commandes, ventes, rapports, comptabilité, factures et paramètres**.
- Affectation du personnel à un ou plusieurs établissements du même client.
- Un administrateur client ne voit pas les comptes des autres clients.
- Gestion commerciale par établissement : formule **Basic / Pro / Multi-sites**, licence **active / suspendue / expirée** et date de fin.
- Une licence suspendue ou expirée bloque la connexion des utilisateurs du restaurant concerné.
- Le Super Admin peut ouvrir n’importe quel établissement depuis sa console.
- Les versions v2.24 existantes sont migrées automatiquement vers un premier client et un premier établissement.

### Comptes de démonstration

- `superadmin / 9999` — Super Admin Restaurant Pro
- `admin / 3333` — Administrateur du client démo
- `manager / 2222` — Responsable
- `serveur / 1111` — Serveur

## Important avant commercialisation

Cette v2.25 reste une **démo GitHub Pages** : les données, comptes et licences sont stockés dans `localStorage` du navigateur. La séparation multi-clients est fonctionnelle pour la démonstration, mais **ce n’est pas une sécurité SaaS de production**.

Pour vendre Restaurant Pro à de vrais clients, l’étape suivante est de déplacer les comptes, sessions, licences et données vers une **API sécurisée + PostgreSQL**, avec contrôle des droits côté serveur, sauvegardes et isolation des clients.

---

# Restaurant Pro v2.24 — Personnel, PIN, rôles et traçabilité

## Nouveautés v2.24

- Comptes du personnel configurables : **nom, identifiant, PIN et rôle**.
- Rôle **Serveur** : uniquement **Caisse + Réservations**.
- Rôle **Responsable** : Caisse, Réservations, Produits, Options cuisine, Stock et Rapports.
- Rôle **Administrateur** : accès complet, y compris Comptabilité, Facturation, Paramètres et gestion du personnel.
- Bouton **Changer d’utilisateur** dans la barre supérieure.
- Verrouillage automatique configurable après inactivité (désactivé, 1, 5, 10, 15 ou 30 minutes).
- Déverrouillage par PIN du compte connecté.
- Le nom du serveur apparaît sur les commandes ouvertes, les tickets Cuisine / Bar / Dessert et le ticket client.
- Chaque vente enregistre le membre du personnel qui l’a encaissée.
- Les Rapports affichent les **ventes par serveur** et les **20 dernières ventes** avec l’utilisateur.
- Protection contre la désactivation du compte actuellement connecté et contre la suppression du dernier administrateur actif.

### Comptes de démonstration au premier démarrage

- `admin / 3333` — Administrateur
- `manager / 2222` — Responsable
- `serveur / 1111` — Serveur

> GitHub Pages reste une application locale côté navigateur : ces contrôles protègent l’utilisation normale de la démo, mais une vraie caisse en production doit vérifier les rôles et les sessions sur un serveur/API sécurisé.

# Restaurant Pro v2.23 — Accès serveur limité

## Nouveauté v2.23 — droits du serveur

- Le profil **Serveur** voit uniquement **Caisse** et **Réservations**.
- Les menus Produits, Options cuisine, Stock, Rapports, Comptabilité, Facturation et Paramètres sont masqués.
- Une protection JavaScript empêche aussi un serveur d’ouvrir directement une page de gestion.
- Le bouton Paramètres des réservations et l’ouverture/fermeture de caisse restent réservés au Responsable / Administrateur.
- Les profils **Responsable** et **Administrateur** gardent l’accès complet.

> Cette version GitHub Pages reste une démo locale côté navigateur. Pour une vraie sécurité en production, les permissions devront aussi être contrôlées côté serveur/API.


## Nouveauté v2.22 — dimensions, forme et rotation des tables

- Largeur réglable de 56 à 220 px.
- Hauteur réglable de 42 à 160 px.
- Rotation 0°, 90°, 180° ou 270°.
- Bouton rapide **↻ Tourner 90°** dans la liste des tables.
- Forme **rectangle**, **coins arrondis** ou **ronde / ovale**.
- Le glisser-déposer tient compte de la taille réelle de la table pour mieux rester dans le plan.

- Sélection rapide d’une table par numéro avec pavé numérique.
- Bouton **🗺️ Plan de salle** : choix de la salle puis de la table.
- Plusieurs salles configurables : salle principale, terrasse, étage, salon, etc.
- Création, renommage et suppression des salles dans **Paramètres**.
- Création, modification et suppression des tables avec numéro unique et nombre de places.
- Déplacement visuel des tables sur le plan par glisser-déposer (souris ou tactile).
- États visuels : **vert = libre**, **orange = occupée**, **bleu = réservée**.
- Une table occupée recharge sa commande ouverte existante.

# Restaurant Pro v2.20 — Ticket regroupé par produit

Le ticket regroupe maintenant le nom du produit une seule fois, puis affiche les variantes en dessous.

Exemple :

**3 × Entrecôte**
- 2 × Saignant · Sauce poivre · Frites
- 1 × À point · Béarnaise · Salade

Pour les produits sans options : Coca + Bière + Coca devient **2 × Coca** et **1 × Bière**.

Les séparations manuelles restent prioritaires.

# Restaurant Pro v2.19 — Fenêtre automatique des options

Quand un article possède une cuisson, une sauce ou une famille d’accompagnements, toucher le produit ouvre immédiatement une grande fenêtre.

Exemple Entrecôte :
1. toucher Entrecôte ;
2. choisir cuisson ;
3. choisir sauce ;
4. choisir accompagnement ;
5. éventuellement choisir un message rapide ou écrire un message libre ;
6. toucher **Ajouter à la commande**.

Le produit n’entre dans la commande qu’après validation.

Les articles sans choix obligatoire (par exemple Coca-Cola) restent en pointage direct.

# Restaurant Pro v2.18 — Accompagnements et messages cuisine

- Création article : cuisson oui/non, sauce oui/non, famille d’accompagnements, messages cuisine oui/non.
- Nouvelle page Options cuisine.
- Familles d’accompagnements personnalisables.
- Messages rapides personnalisables.
- Message libre par article.
- Ticket cuisine affiche cuisson, sauce, accompagnement et message.
- Regroupement uniquement si toutes les options sont identiques.

# Restaurant Pro v2.17 — correction cuisson, sauce et regroupement ticket

## Test cuisson / sauce
Sélectionner **Entrecôte**.

Dans la commande doivent apparaître :
- 🔥 Choisir cuisson
- 🥣 Choisir sauce

Exemple :
- Cuisson : Saignant
- Sauce : Poivre

Le ticket Cuisine doit afficher :
- 1 × Entrecôte
- 🔥 Cuisson : Saignant
- 🥣 Sauce : Poivre

## Test regroupement
Pointer :
1. Coca-Cola
2. Jupiler
3. Coca-Cola

Avant envoi ET sur le ticket Bar :
- **2 × Coca-Cola**
- **1 × Jupiler**

## Produits avec options différentes
Les articles ne sont regroupés que si cuisson et sauce sont identiques :
- 2 Entrecôtes / Saignant / Poivre → 2 × Entrecôte
- 1 Saignant / Poivre + 1 Bien cuit / Béarnaise → deux lignes.

Les séparations manuelles restent respectées.

# Restaurant Pro v2.16 — Version de test

Test : Coca → Bière → Coca doit donner 2 × Coca + 1 × Bière avant envoi et sur le ticket.

# Restaurant Pro v2.15 — Regroupement automatique des articles

Cette version remplace l'idée de « familles de produits » de la v2.14.

Le comportement demandé est maintenant :

- pointer Coca ;
- pointer Bière ;
- pointer Coca ;

avant l'envoi, la caisse regroupe automatiquement la commande en :

- **2 × Coca**
- **1 × Bière**

Le regroupement fonctionne même si les articles identiques n'ont pas été pointés l'un à la suite de l'autre.

Les **séparations manuelles** restent prioritaires : Restaurant Pro ne regroupe pas un article à travers une ligne de séparation manuelle, afin de conserver l'ordre voulu par le serveur.

# Restaurant Pro v2.13 — Comptabilité + Facturation

Nouveaux modules : pré-comptabilité, dépenses, fournisseurs, TVA estimée, résultat estimé, export CSV, factures clients et aperçu facture.

Mention visible : **Démo de gestion — non certifiée SCE / Peppol**.

Ces fonctions sont de démonstration et de gestion interne. Elles ne remplacent pas une certification SCE, un flux Peppol officiel ou un logiciel comptable réglementaire.

# Restaurant Pro v2.12 — GitHub Pages

## Changements v2.12
- bouton **📅 Réservations** bleu et toujours visible dans la caisse ;
- raccourci flottant Réservations sur tablette/téléphone ;
- navigation plus grande et tactile ;
- tables et produits agrandis ;
- panneau commande plus lisible ;
- boutons d'envoi et paiement agrandis ;
- correction du cache/service worker : les anciennes versions GitHub Pages sont supprimées automatiquement.

# Restaurant Pro v2.11 — Démo GitHub Pages gratuite

Cette version fonctionne sans Node.js, sans PowerShell, sans Render et sans PostgreSQL.

## Inclus
- connexion démo admin / manager / serveur ;
- caisse et ouverture/fermeture ;
- plan de salle ;
- emporter / livraison ;
- produits, catégories, TVA 6/12/21 ;
- stock ;
- commande ouverte par table ;
- séparateur manuel ;
- envoi Cuisine / Bar / Dessert ;
- transfert de table ;
- séparation de note simulée ;
- paiement et ticket client ;
- rapports simples ;
- grande page Réservations ;
- limites de réservations/couverts ;
- délai minimum avant arrivée ;
- jours maximum à l'avance ;
- horaires midi/soir ;
- conflits de table ;
- données conservées dans `localStorage`.

## Important
Ceci est une **démo**. Les données restent dans le navigateur utilisé.
Ce n'est pas une caisse fiscale certifiée et ce n'est pas une base partagée entre plusieurs appareils.

## GitHub Pages
Copiez le contenu de ce dossier à la racine du dépôt GitHub Pages puis :
- `git add .`
- `git commit -m "Restaurant Pro v2.11 demo GitHub"`
- `git push`

Le site sera ensuite accessible via l'URL GitHub Pages du dépôt.