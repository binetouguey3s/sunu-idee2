# Sunu-Idees

Sunu-Idees est une petite application web de mur d'idees collaboratif pour la promo P9. Elle permet de proposer, afficher, modifier et supprimer des idees directement dans le navigateur.

## Fonctionnalites realisees

- Creation d'une page HTML avec un en-tete, un formulaire d'ajout et une zone d'affichage des idees.
- Ajout d'une idee avec un titre, une categorie et une description.
- Validation du formulaire pour empecher l'ajout d'une idee incomplete.
- Affichage dynamique des idees sous forme de cartes.
- Attribution d'une couleur differente selon la categorie :
  - Pedagogie
  - Evenement
  - Vie de campus
  - Amelioration technique
- Sauvegarde des idees dans le `localStorage` du navigateur.
- Recuperation automatique des idees sauvegardees au chargement de la page.
- Suppression d'une idee avec confirmation.
- Modification d'une idee directement depuis sa carte.
- Annulation possible pendant la modification.
- Mise en page responsive pour une meilleure lecture sur mobile.

## Structure des fichiers

- `index.html` : structure de la page, formulaire et conteneur du mur d'idees.
- `style.css` : styles de l'application, couleurs, cartes, boutons et responsive.
- `app.js` : logique JavaScript pour ajouter, afficher, modifier, supprimer et sauvegarder les idees.
- `README.md` : documentation du projet.

## Utilisation

1. Ouvrir le fichier `index.html` dans un navigateur.
2. Remplir le formulaire avec le titre, la categorie et la description de l'idee.
3. Cliquer sur `Poster l'idee`.
4. Utiliser les boutons `Modifier` ou `Supprimer` sur chaque carte si necessaire.

Les idees restent disponibles apres rechargement de la page grace au stockage local du navigateur.
