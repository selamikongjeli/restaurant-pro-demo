# Restaurant Pro v2.16 — Options, sécurité, KDS et employés

- Options/suppléments et notes cuisine par produit.
- Les articles ne se regroupent que si leurs options sont identiques.
- Annulation de commande et remboursement avec PIN responsable/admin.
- Écran KDS : Nouveau → En préparation → Prêt → Servi, par Cuisine/Bar/Dessert.
- Gestion employés : serveur, responsable, administrateur, PIN, actif/inactif.
- Les remboursements sont exclus du chiffre d'affaires de la démo.

Cette version reste une démonstration GitHub Pages non certifiée SCE / Peppol.

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
