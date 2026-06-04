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
form.addEventListener('submit', async function(event) {
    event.preventDefault(); // empecher le rechargement de la page

    // recuperer les valeurs des champs
    const titre = inputTitre.value.trim();
    const description = textareaDescription.value.trim();

    // validation des champs
    if (titre === '' || description === '') {
        alert('Veuillez remplir tous les champs');
        return;
    }

    const boutonSubmit = form.querySelector('button[type="submit"]'); // recuperer le bouton de soumission
    const ancienTexte = boutonSubmit.textContent; // sauvegarder le texte original du bouton

    try {    
        boutonSubmit.disabled = true; // desactiver le bouton pendant l'appel API
        boutonSubmit.textContent = 'Veuillez patienter, generation de la categorie en cours...'; // changer le texte du bouton pour indiquer que la génération est en cours   
        const categorieGeneree = await openRouterFetch(titre, description); // attendre la reponse de l'API avant de continuer

        // creer une nouvelle idee
        const nouvelleIdee = {
            id: genererId(),
            titre: titre,
            categorie: categorieGeneree,
            description: description
        }; 

        // ajouter la nouvelle idee au tableau  
        idees.push(nouvelleIdee);

        sauvegarderIdees();

        afficherIdees();
        
        // reinitialiser le formulaire
        form.reset();

        alert(`Categorie generee par OpenRouter: ${categorieGeneree}`);
    }
    catch (error) {
        console.error('Erreur lors de l\'appel à openRouter:', error);
        alert('Une erreur est survenue lors de la génération de la categorie. Veuillez réessayer.');
    }
    finally {
        boutonSubmit.disabled = false; // re-activer le bouton apres l'appel API
        boutonSubmit.textContent = ancienTexte; // restaurer le texte original du bouton
    }
});

    // Appel API OpenRouter 
    async function openRouterFetch(titre, description) {
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Ne jamais laisser de clé secrète en dur dans le code client.
                    // Remplacez par un proxy côté serveur ou un endpoint /api/classify.
                    'Authorization': 'Bearer OPENROUTER_API_KEY'
                },
                body: JSON.stringify({
                    model: 'poolside/laguna-m.1:free',
                    stream: false,
                    messages: [
                        {
                            role: 'user',
                            content: `Choisis UNE catégorie parmi: Pedagogie, Evenement, Vie de campus, Amelioration technique. Titre: ${titre}. Description: ${description}. Réponds uniquement par la catégorie.`
                        }
                    ]
                })
            });

            const data = await response.json();
            console.log('openrouter response', data);

            // Récupérer le texte retourné par le modèle 
            let text = '';
            if (data.choices && data.choices[0]) {
                text = (data.choices[0].message && data.choices[0].message.content) || data.choices[0].text || '';
            }

            text = text.toLowerCase();

            // Vérifier la présence de mots-clés simples
            if (text.includes('pedagog')) return 'Pedagogie';
            if (text.includes('evenement') || text.includes('événement')) return 'Evenement';
            if (text.includes('campus')) return 'Vie de campus';
            if (text.includes('amelior') || text.includes('amélior')) return 'Amelioration technique';

            // Par défaut
            return 'Pedagogie';
        }
        catch (err) {
            console.error('Erreur openRouterFetch :', err);
            return 'Nous sommes desolée de ne pas vous fournir une categorie';
        }
    }
    

        //  debut open router

    // testme
    const prompt = `Choisis UNE catégorie parmi: Pedagogie, Evenement, Vie de campus, Amelioration technique. Titre: ${titre}. Description: ${description}. Réponds uniquement par la catégorie.`
        return prompt
    // testme fin

/// test pour forcer le modele    a vercel      
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { titre, description } = req.body || {};
    if (!titre || !description) return res.status(400).json({ error: 'Missing titre or description' });

    const prompt = `Choisis UNE catégorie parmi: Pedagogie, Evenement, Vie de campus, Amelioration technique.\nTitre: ${titre}\nDescription: ${description}\nRéponds uniquement par la catégorie (ex: Pedagogie).`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({ model: process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free', stream: false, messages: [{ role: 'user', content: prompt }] })
    });

    const data = await response.json();
    return res.status(200).json({ data });
  } catch (err) {
    console.error('OpenRouter proxy error', err);
    return res.status(500).json({ error: 'openrouter_error' });
  }
}

///test model fin
// fin de mon debut ollama




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
