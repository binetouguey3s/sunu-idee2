// url et cle depuis supabase
const supabaseUrl = "https://azeigwyrplqnnkrfxvuw.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6ZWlnd3lycGxxbm5rcmZ4dnV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MjkyNzQsImV4cCI6MjA5NjEwNTI3NH0.zjmj8XT2oNJegWzfv20qidpVhgMhp35Zp3FHlsekLN0"

const client = supabase.createClient(supabaseUrl, supabaseAnonKey)
console.log(client)

// Recuperons les elements du DOM
const mur = document.getElementById('mur');

// tableau pour stocker les idees
let idees = [];

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

//nettoyer la fonction categorie
function nettoyerCategorieRaw(texte) {
    if (!texte || typeof texte !== 'string') return null;
    const clean = texte.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase();

    if (/pedagogie|pedago|enseignement|education/.test(clean)) return 'Pedagogie';
    if (/evenement|evenement|event|even|celebration/.test(clean)) return 'Evenement';
    if (/vie de campus|campus|universite|etudiant|etudiante/.test(clean)) return 'Vie de campus';
    if (/amelioration technique|amelioration|technique|ameliorer|ameliore/.test(clean)) return 'Amelioration technique';

    return null;
}

function normaliserCategorieRetournee(categorie) {
    return nettoyerCategorieRaw(categorie);
}

// chercher l'idee 
async function fetchIdees() {
    const { data, error } = await client.from('idees').select('*').order('id', { ascending: false });
    if (error) {
        console.error('Erreur Supabase fetch:', error);
        mur.innerHTML = '<p class="erreur">Impossible de charger les idées depuis Supabase.</p>';
        return;
    }

    idees = data || [];
    afficherIdees();
}

//  creer idee depuis supabase
async function creerIdeeSupabase(idee) {
    const { data, error } = await client.from('idees').insert([idee]).select().single();
    if (error) {
        console.error('Erreur Supabase insert:', error);
        throw error;
    }
    return data;
}

// mettre a jour l'idee 
async function updateIdeeSupabase(id, updates) {
    const { data, error } = await client.from('idees').update(updates).eq('id', id).select().single();
    if (error) {
        console.error('Erreur Supabase update:', error);
        throw error;
    }
    return data;
}

async function supprimerIdeeSupabase(id) {
    const { error } = await client.from('idees').delete().eq('id', id);
    if (error) {
        console.error('Erreur Supabase delete:', error);
        throw error;
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

// affichage initial des idees depuis Supabase
fetchIdees();

//recuperons les champs du formulaire
const form = document.getElementById('idee-form');
const inputTitre = document.getElementById('idea-title');
const selectCategorie = document.getElementById('categorie');
const textareaDescription = document.getElementById('description');

// gestion de la soumission du formulaire
form.addEventListener('submit', async function(event) {
    event.preventDefault(); // empecher le rechargement de la page

    // recuperer les valeurs des champs
    const titre = inputTitre.value.trim();
    const description = textareaDescription.value.trim();
    const categorieSelectionnee = selectCategorie.value;

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

        const categorieGenereeBrute = await openRouterFetch(titre, description);
        const categorieGeneree = normaliserCategorieRetournee(categorieGenereeBrute);
        const categorieFinale = categorieGeneree || categorieSelectionnee || 'Pedagogie';

        // creer une nouvelle idee dans Supabase
        const nouvelleIdee = {
            titre: titre,
            categorie: categorieFinale,
            description: description
        };

        const ideeEnregistree = await creerIdeeSupabase(nouvelleIdee);
        idees.unshift(ideeEnregistree);
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

// fin d'importation


    // Appel API OpenRouter 
    async function openRouterFetch(titre, description) {
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ titre, description })
            });

            const result = await response.json();
            if (!response.ok) {
                console.error('Proxy OpenRouter error', response.status, result);
                return null;
            }
            if (result.error) {
                console.error('Proxy OpenRouter returned error', result.error);
                return null;
            }

            const data = result.data;
            console.log('openrouter response', data);

            let text = '';
            if (data && data.choices && data.choices[0]) {
                text = (data.choices[0].message && data.choices[0].message.content) || data.choices[0].text || '';
            }

            return text.trim();
        }
        catch (err) {
            console.error('Erreur openRouterFetch :', err);
            return null;
        }
    }
        //  debut open router
//test model fin
// fin de mon debut ollama


// gestion des clics sur les boutons supprimer
mur.addEventListener('click', async function(event) {

    // recuperer l'element cible du clic
    const cible = event.target;
    // recuperer la carte parente
    const carte = cible.closest('.carte');
    if (!carte) return; // si le clic n'est pas sur une carte, ne rien faire
    
    const id = parseInt(carte.getAttribute('data-id'));

    if (cible.classList.contains('btn-supprimer')) {

        const confirmSuppression = confirm('Voulez-vous vraiment supprimer cette idée ?');
        if (confirmSuppression) {
            try {
                await supprimerIdeeSupabase(id);
                idees = idees.filter(idee => idee.id !== id);
                afficherIdees();
            } catch (error) {
                alert('Erreur lors de la suppression. Veuillez réessayer.');
            }
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
        carte.querySelector('.btn-sauvegarder').addEventListener('click', async function() {
            const nouveauTitre = carte.querySelector('.edit-titre').value.trim();
            const nouvelleDescription = carte.querySelector('.edit-description').value.trim();

            if (nouveauTitre === '' || nouvelleDescription === '') {
                alert('Veuillez remplir tous les champs');
                return;
            }

            try {
                await updateIdeeSupabase(id, {
                    titre: nouveauTitre,
                    description: nouvelleDescription
                });
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
                afficherIdees();
            } catch (error) {
                alert('Erreur lors de la mise à jour. Veuillez réessayer.');
            }
        });
        
        // gestion du clic sur le bouton annuler
        carte.querySelector('.btn-annuler').addEventListener('click', function() {
            // afficher les idees sans modification
            afficherIdees();
        });
    }
});
