import { getFormationsBySecteur } from "./RESTManagement.js";

async function init() {
    const container = document.querySelector('.boiteNomMaster');
    const title = document.querySelector('#subtitle-secteur');
    
    // On récupère les infos dans l'URL (ex: ?sdid=12&nom=Droit)
    const params = new URLSearchParams(window.location.search);
    const sdid = params.get('sdid');
    const nomSecteur = params.get('nom');

    // Gestion d'erreur si pas d'ID
    if (!sdid) {
        if (title) title.textContent = "Erreur : Aucun secteur sélectionné";
        if (container) container.innerHTML = '<div class="btn-retour-container"><a href="discipline.html" class="button">Retour aux disciplines</a></div>';
        return;
    }

    // Mise à jour du titre
    if (title) {
        title.textContent = nomSecteur ? "Masters en " + nomSecteur : "Liste des Masters";
    }

    if (container) container.innerHTML = "<p class='message-info'>Chargement des formations...</p>";

    // Appel API pour récupérer les masters
    const formations = await getFormationsBySecteur(sdid);

    // --- FILTRAGE (Pour ne pas avoir de doublons) ---
    const nomsDejaVus = []; 
    let tousLesMasters = [];

    for (let i = 0; i < formations.length; i++) {
        const formation = formations[i];
        // On vérifie si on a déjà traité ce nom de master
        if (!nomsDejaVus.includes(formation.mention)) {
            nomsDejaVus.push(formation.mention);
            tousLesMasters.push(formation);
        }
    }

    // Tri alphabétique de A à Z
    tousLesMasters.sort((a, b) => a.mention.localeCompare(b.mention));

    // On lance l'affichage
    afficherMasters(tousLesMasters);
}

function afficherMasters(liste) {
    const container = document.querySelector('.boiteNomMaster');
    if (!container) return;

    container.innerHTML = '';
    
    // Si la liste est vide
    if (liste.length === 0) {
        container.innerHTML = "<p class='message-info'>Aucun master ne correspond à ces critères.</p>";
        return;
    }

    // BOUCLE : Création des cartes
    liste.forEach(m => {
        const a = document.createElement('a');
        
        // Lien vers la page de détail
        a.href = "index.html?ifc=" + m.ifc;
        a.className = 'nomMaster'; // Classe CSS pour le style global de la carte
        a.role = 'button';
        
        let nomEtablissement = m.etablissementLibelle || m.etablissement || "Établissement non spécifié";
        
        // --- GESTION DU LOGO ---
        let uai = m.etabUai || m.uai; // On récupère l'identifiant UAI
        let htmlImage = '';

        if (uai) {
            // On construit l'URL dynamique vers l'API du gouvernement
            const urlLogo = "https://monmaster.gouv.fr/api/logo/" + uai;
            // On ajoute l'image avec une sécurité (onerror) : si l'image plante, on met l'icône par défaut
            htmlImage = `<img src="${urlLogo}" alt="Logo" class="logo-ecole-liste" onerror="this.src='./images/icone_maison.svg'">`;
        } else {
            // Pas d'UAI = Image par défaut direct
            htmlImage = `<img src="./images/icone_maison.svg" alt="Logo" class="logo-ecole-liste">`;
        }

        // --- GESTION DU BADGE ALTERNANCE ---
        let badgeHTML = "";
        // On regarde si c'est de l'alternance ou de l'apprentissage
        const estAlternance = m.alternance === true || (m.modalites && m.modalites.includes('apprentissage'));
        
        if (estAlternance) {
            badgeHTML = `<span class="badge-alternance">Alternance</span>`;
        }

        // --- CONSTRUCTION DU HTML DE LA CARTE ---
        a.innerHTML = `
            <div class="master-card-inner">
                <div class="logo-container">
                    ${htmlImage}
                </div>
                
                <div class="infos-container">
                    <div class="master-header">
                        Master ${m.mention} ${badgeHTML}
                    </div>
                    <span class="master-etablissement">
                        ${nomEtablissement}
                    </span>
                </div>
            </div>
        `;
        container.appendChild(a);
    });
}

document.addEventListener('DOMContentLoaded', init);