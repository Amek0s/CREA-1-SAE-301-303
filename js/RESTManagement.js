
/**
 * effectue requete HTTP de recup des tentatives
 * retourne une promesse tjr resolue contenant le tableau des tentatives
 * @param {*} start instant le + ancien des traces à récupérer
 * @returns la promesse des tentatives
 */
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