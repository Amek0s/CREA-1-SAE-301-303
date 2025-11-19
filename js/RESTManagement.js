
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
const API_URL = 'https://la-lab4ce.univ-lemans.fr/masters-stats/'; // ATTENTION: Ceci est le lien du repo, tu dois mettre le lien du serveur API lancé (ex: http://localhost:8080)


/**
 * Récupère les statistiques du Master
 * @returns {Promise} Promesse contenant les données JSON
 * @param {*} start
 */
export default function getMasterStats() {
    return fetch(API_URL)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erreur HTTP : ' + response.status);
            }
            return response.json();
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération des stats:', error);
            return null; // Retourne null en cas d'erreur pour gérer ça dans l'orchestrateur
        });
}