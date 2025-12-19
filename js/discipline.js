import { getSecteursDisciplinaires } from "./RESTManagement.js";

const LISTE_IMAGES = {
    "Sciences": "mascotte-pluridisciplinaire-sciences.svg",
    "Droit": "mascotte-pluridisciplinaire-droit-science-economique.svg",
    "Economie": "mascotte-sciences-economique-gestion.svg",
    "Gestion": "mascotte-sciences-economique-gestion.svg",
    "Lettres": "mascotte-pluridisciplinaire-lettres-langues-sciences-humaines.svg",
    "Langues": "mascotte-pluridisciplinaire-lettres-langues-sciences-humaines.svg",
    "STAPS": "mascotte-staps.svg",
    "Santé": "mascotte-svt.svg",
    "Théologie": "mascotte-theologie.svg",
    "Informatique": "mascotte-science-fondamentales-application.svg",
    "Art": "lettre sciences du langage arts.svg"
};

const IMAGE_PAR_DEFAUT = "mascotte-chill.svg";

async function init() {
    const grille = document.querySelector('.disciplines-grid');
    if (!grille) return;

    grille.innerHTML = '<p style="grid-column:1/-1;text-align:center">Chargement des disciplines...</p>';

    const secteurs = await getSecteursDisciplinaires();

    if (!secteurs || secteurs.length === 0) {
        grille.innerHTML = '<p style="text-align:center">Aucun secteur trouvé.</p>';
        return;
    }

    // Tri par ordre alphabétique
    secteurs.sort(function(a, b) {
        return a.nom.localeCompare(b.nom);
    });

    grille.innerHTML = '';

    secteurs.forEach(secteur => {
        let nomImage = IMAGE_PAR_DEFAUT;
        
        // On cherche si un mot clé est présent dans le nom du secteur
        for (let motCle in LISTE_IMAGES) {
            if (secteur.nom.includes(motCle)) {
                nomImage = LISTE_IMAGES[motCle];
                break; 
            }
        }

        const lien = document.createElement('a');
        lien.href = "discipline2.html?sdid=" + secteur.id + "&nom=" + encodeURIComponent(secteur.nom);
        lien.className = 'discipline-link';
        
        lien.innerHTML = `
            <figure class="discipline-card">
                <img src="./images/${nomImage}" class="discipline-visual" alt="">
                <figcaption class="discipline-content">
                    <h2>${secteur.nom}</h2>
                    <p>Découvrir les masters</p>
                </figcaption>
            </figure>
        `;
        
        grille.appendChild(lien);
    });
}

document.addEventListener('DOMContentLoaded', init);