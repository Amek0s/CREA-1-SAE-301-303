import { getSecteursDisciplinaires } from "./RESTManagement.js";

// Mapping des images par mots-clés
const IMAGES = {
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
    "Art": "lettre sciences du langage arts.svg",
    "Défaut": "mascotte-chill.svg"
};

async function init() {
    const grid = document.querySelector('.disciplines-grid');
    if (!grid) return;

    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center">Chargement des disciplines...</p>';

    // Appel API optimisé : on ne récupère que la liste des secteurs
    const secteurs = await getSecteursDisciplinaires();

    if (!secteurs || secteurs.length === 0) {
        grid.innerHTML = '<p style="text-align:center">Impossible de charger les données.</p>';
        return;
    }

    // Tri alphabétique
    secteurs.sort((a, b) => a.nom.localeCompare(b.nom));

    grid.innerHTML = '';

    secteurs.forEach(secteur => {
        // Choix de l'image
        let img = IMAGES["Défaut"];
        for (const [key, val] of Object.entries(IMAGES)) {
            if (secteur.nom.includes(key)) {
                img = val;
                break;
            }
        }

        const link = document.createElement('a');
        // On passe l'ID (sdid) et le NOM dans l'url
        link.href = `discipline2.html?sdid=${secteur.id}&nom=${encodeURIComponent(secteur.nom)}`;
        link.className = 'discipline-link';
        link.innerHTML = `
            <figure class="discipline-card">
                <img src="./images/${img}" class="discipline-visual" alt="">
                <figcaption class="discipline-content">
                    <h2>${secteur.nom}</h2>
                    <p>Découvrir les masters</p>
                </figcaption>
            </figure>
        `;
        grid.appendChild(link);
    });
}

document.addEventListener('DOMContentLoaded', init);