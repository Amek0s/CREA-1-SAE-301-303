// RESTManagement.js - Gestion des appels à l'API MasterMind

const URL_BASE_API = 'https://la-lab4ce.univ-lemans.fr/masters-stats/api/rest';

// ------------------------------------------------------------------
// 1. Appel pour les informations TEXTUELLES (Nom, Alternance, Parcours)
// ------------------------------------------------------------------

/**
 * Récupère les infos texte pour un IFC donné.
 * @param {string} ifc - L'identifiant de la formation (ex: '0900816N1CXR').
 * @returns {Promise<Object|null>} Les détails de la formation.
 */
export async function getFormationDetails(ifc) {
    try {
        // Construction de l'URL
        const url = `${URL_BASE_API}/formations/${ifc}?full-details=1`;

        const reponse = await fetch(url);
        
        // Vérifie si la réponse HTTP est OK (statut 200)
        if (!reponse.ok) {
            throw new Error(`Erreur de l'API: Statut ${reponse.status}`);
        }
        
        return await reponse.json();

    } catch (erreur) {
        console.error("Problème lors de la récupération des détails de la formation :", erreur);
        return null;
    }
}

// ------------------------------------------------------------------
// 2. Appel pour les informations STATISTIQUES (Capacité, Taux, Salaires)
// ------------------------------------------------------------------

/**
 * @param {string} ifc - L'identifiant de la formation.
 * @returns {Promise<Object|null>} Les statistiques de candidatures et d'insertion.
 */
export async function getStatsForMaster(ifc) {
    try {
        // Définition des données que nous demandons à l'API
        const corpsDeRequete = {
            "filters": {
                // On filtre sur l'identifiant de la formation pour avoir des données précises
                "formationIfcs": [ifc],
                // On demande les stats d'insertion à 18 mois après le diplôme
                "moisApresDiplome": 18 
            },
            "harvest": {
                "typeStats": "all", // Demande toutes les stats (candidatures + insertions pro)
                "candidatureDetails": ["general"], // Pour Capacite et Nombres (nb, accept)
                "insertionProDetails": ["general", "salaire", "emplois"] // Pour Salaires et Types d'emplois
            }
        };

        const url = `${URL_BASE_API}/stats/search`;

        const reponse = await fetch(url, {
            method: 'POST',
            // On précise qu'on envoie du JSON
            headers: { 'Content-Type': 'application/json' },
            // On convertit notre objet JavaScript en chaîne de caractères JSON
            body: JSON.stringify(corpsDeRequete) 
        });

        if (!reponse.ok) {
            throw new Error(`Erreur de l'API POST: Statut ${reponse.status}`);
        }

        return await reponse.json();

    } catch (erreur) {
        console.error("Problème lors de la récupération des statistiques :", erreur);
        return null;
    }
}