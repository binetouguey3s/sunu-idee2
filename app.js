// Recuperons les elements du DOM
const mur = document.getElementById('mur');

// tableau pour stocker les idees
let idees = [];

// recuperer les idees depuis le localStorage au demarrrage
const ideesStockees = localStorage.getItem('idees');

if (ideesStockees !== null) {
    // convertir la chaine JSON en tableau d'idees
    idees = JSON.parse(ideesStockees);
}
else {
    // si aucune idee n'est stockee, tableau d'idees vide
    idees = [];
}

// fonction: trouver la classe css selon la categorie 

function getCategorieClass(categorie) {
    switch (categorie) {
        case 'Evenement':
            return 'cat-evenement';
        case 'Pedagogie':
            return 'cat-pedagogie';
        case 'Vie de campus':
            return 'cat-campus'
        case 'Amelioration technique':
            return 'cat-amelioration';
        default:
            return 'cat-pedagogie';
    }
}

// fonction: creer une carte HTML pour une idee

function creerCarte(idee) {
    // creation d'un element div 
    const carte = document.createElement('div');
    // ajout de la classe CSS
    carte.classList.add('carte', getCategorieClass(idee.categorie));
    // identifiant unique 
    carte.setAttribute('data-id', idee.id);
    // remplissage du contenu HTML
    carte.innerHTML = `
        <span class="categorie">${idee.categorie}</span>
        <h3>${idee.titre}</h3>
        <p>${idee.description}</p>
        <div class="carte-action">
            <button class="btn-modifier">Modifier</button>
            <button class="btn-supprimer">Supprimer</button>
        </div>
    `;
    return carte;
}

//fonction: afficher les idees sur le mur

function afficherIdees() {
    // vider le mur avant remplissage
    mur.innerHTML = '';

    // parcourir les idees et creer une carte pour chacune
    idees.forEach(idee => {
        const carte = creerCarte(idee);
        mur.appendChild(carte);
    });
}

// affichage initial des idees
afficherIdees();

//recuperons les champs du formulaire
const form = document.getElementById('idee-form');
const inputTitre = document.getElementById('idea-title');
const selectCategorie = document.getElementById('categorie');
const textareaDescription = document.getElementById('description');

// fonction: generer un id unique
function genererId() {
    return Date.now(); 
}

// gestion de la soumission du formulaire
form.addEventListener('submit', function(event) {
    event.preventDefault(); // empecher le rechargement de la page

    // recuperer les valeurs des champs
    const titre = inputTitre.value.trim();
    const categorie = selectCategorie.value;
    const description = textareaDescription.value.trim();

    // validation des champs
    if (titre === '' || categorie === '' || description === '') {
        alert('Veuillez remplir tous les champs');
        return;
    }

    // creer une nouvelle idee
    const nouvelleIdee = {
        id: genererId(),
        titre: titre,
        categorie: categorie,
        description: description
    };

    // ajouter la nouvelle idee au tableau
    idees.push(nouvelleIdee);

    // sauvegarder les idees dans le localStorage
    sauvegarderIdees();

    // afficher les idees mises a jour
    afficherIdees();

    // reinitialiser le formulaire
    form.reset();
});

// gestion des clics sur les boutons supprimer
mur.addEventListener('click', function(event) {

    // recuperer l'element cible du clic
    const cible = event.target;
    // recuperer la carte parente
    const carte = cible.closest('.carte');
    if (!carte) return; // si le clic n'est pas sur une carte, ne rien faire
    
    const id = parseInt(carte.getAttribute('data-id'));

    if (cible.classList.contains('btn-supprimer')) {

        const confirmSuppression = confirm('Voulez-vous vraiment supprimer cette idée ?');
        if (confirmSuppression) {
            // supprimer l'idee du tableau
            idees = idees.filter(idee => idee.id !== id);

            // sauvegarder les idees mises a jour dans le localStorage
            sauvegarderIdees();

            // afficher les idees mises a jour
            afficherIdees();
        }
    }

// gestion du clic sur le bouton modifier
    if (cible.classList.contains('btn-modifier')) {
        // trouver l'idee correspondante dans le tableau
        const idee = idees.find(idee => idee.id === id);
        if (!idee) return;

        // pre-remplir le formulaire avec les données de l'idee
        carte.innerHTML = `
            <span class="categorie ">${idee.categorie}</span>
            <input type="text" class="edit-titre" value="${idee.titre}">
            <textarea class="edit-description">${idee.description}</textarea>
            <div class="carte-action">
                <button class="btn-sauvegarder">Sauvegarder</button>
                <button class="btn-annuler">Annuler</button>
            </div>
        `;

        // gestion du clic sur le bouton enregistrer
        carte.querySelector('.btn-sauvegarder').addEventListener('click', function() {
            const nouveauTitre = carte.querySelector('.edit-titre').value.trim();
            const nouvelleDescription = carte.querySelector('.edit-description').value.trim();

            if (nouveauTitre === '' || nouvelleDescription === '') {
                alert('Veuillez remplir tous les champs');
                return;
            }

            // mettre a jour l'idee dans le tableau
            idees = idees.map(idee => {
                if (idee.id === id) {
                    return {
                        ...idee, 
                        titre: nouveauTitre,
                        description: nouvelleDescription
                    };
                }
                return idee;
            });

            // sauvegarder les idees mises a jour dans le localStorage
            sauvegarderIdees();

            // Afficher les idees mises a jour
            afficherIdees();
        });
        
        // gestion du clic sur le bouton annuler
        carte.querySelector('.btn-annuler').addEventListener('click', function() {
            // afficher les idees sans modification
            afficherIdees();
        });
    }
});

// Sauvegardons les idees dans le localStorage 
function sauvegarderIdees() {
    // convertir le tableau d'idees en JSON et le stocker dans le localStorage
    localStorage.setItem('idees', JSON.stringify(idees));
}