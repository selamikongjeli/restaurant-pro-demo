# Restaurant Pro v2.22 — Plan de salle personnalisable

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
