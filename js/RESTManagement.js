
/**
 * effectue requete HTTP de recup des tentatives
 * retourne une promesse tjr resolue contenant le tableau des tentatives
 * @param {*} start instant le + ancien des traces à récupérer
 * @returns la promesse des tentatives

export default function getLastAttemps(start=null) {
    let url = 'http://127.0.0.1:5005/api/attempts';
    if (start !== null){
        url += '?start=' + start.toISOString(); //"2024-03..."
    }
    return fetch(url)
    .then((reponse) => {
        if(!reponse.ok){
            throw new Error('Erreur de requête : ' + reponse.status);
        }
        return reponse.json();
    })
    .catch((error) => {
        console.warn('Erreur de requête de recuperation des tentatives', error);
        return []; //on retourne le tableau de tentative vide
    })
}
     */


// URL de l'API (à adapter selon si tu la lances en local ou si elle est en ligne)
// Exemple local souvent utilisé : http://localhost:3000/api/stats
const API_URL = 'https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-mon_master/records';


/**
 * Récupère les statistiques du Master
 * @returns {Promise} Promesse contenant les données JSON
 * @param {string} ifc Identifiant de formation 
 */
export async function getFormationByIfc(ifc) {
    try {
        // Utilisation de encodeURIComponent pour sécuriser l'injection de la variable
        const encodedIfc = encodeURIComponent(`"${ifc}"`);
        const url = `${API_URL}?where=ifc=${encodedIfc}&limit=1`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            return null;
        }

        return data.results[0];

    } catch (error) {
        console.error("Erreur dans getFormationByIfc:", error);
        throw error;
    }
}