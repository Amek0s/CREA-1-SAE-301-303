const URL_BASE_API = 'https://la-lab4ce.univ-lemans.fr/masters-stats/api/rest';

/**
 * Récupère les infos principales d'une formation via son code IFC
 */
export async function getFormationDetails(ifc) {
    try {
        const url = `${URL_BASE_API}/formations/${ifc}?full-details=1`;
        const reponse = await fetch(url);

        if (!reponse.ok) {
            throw new Error(`Erreur HTTP : ${reponse.status}`);
        }

        return await reponse.json();

    } catch (erreur) {
        console.error("Problème récupération détails :", erreur);
        return null;
    }
}

/**
 * Liste des domaines (Droit, Sciences, etc.) pour la page d'accueil
 */
export async function getSecteursDisciplinaires() {
    try {
        const reponse = await fetch(`${URL_BASE_API}/secteurs-disciplinaires`);
        if (!reponse.ok) return [];

        return await reponse.json();

    } catch (erreur) {
        console.error("Erreur chargement secteurs :", erreur);
        return [];
    }
}

/**
 * Trouve tous les masters liés à un secteur
 */
export async function getFormationsBySecteur(sdid) {
    try {
        const reponse = await fetch(`${URL_BASE_API}/formations?sdid=${sdid}&full-details=1`);
        if (!reponse.ok) return [];

        const donnees = await reponse.json();

        if (Array.isArray(donnees)) {
            return donnees;
        } else if (donnees.formations) {
            return donnees.formations;
        } else {
            return [];
        }

    } catch (erreur) {
        console.error("Erreur liste formations :", erreur);
        return [];
    }
}

/**
 * Cherche les stats (insertion, salaire) pour un master donné.
 * Si pas de stats précises, on cherche la moyenne de l'établissement.
 */
export async function getStatsForMaster(ifc, uai, secDiscId) {
    try {
        let resultatsCandidatures = { candidatures: [] };
        
        const repCand = await fetch(`${URL_BASE_API}/stats/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "filters": { 
                    "formationIfcs": [ifc],
                    "anneeMin": 2021
                },
                "harvest": { "typeStats": "candidatures", "candidatureDetails": ["general"] }
            })
        });

        if (repCand.ok) {
            resultatsCandidatures = await repCand.json();
        }

        //écupérer l'insertion pro spécifique à ce master
        let resultatsInsertion = { insertionsPro: [] };
        let source = 'precis'; 
        
        const filtres = {
            "etablissementIds": [uai],
            "moisApresDiplome": 30, 
            "anneeMin": 2019
        };

        if (secDiscId) {
            filtres.secteurDisciplinaireIds = [parseInt(secDiscId)];
        }

        const repInsert = await fetch(`${URL_BASE_API}/stats/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "filters": filtres,
                "harvest": {
                    "typeStats": "insertionsPro",
                    "insertionProDetails": ["general", "salaire", "emplois"]
                }
            })
        });

        if (repInsert.ok) {
            resultatsInsertion = await repInsert.json();
        }

        // Si on n'a rien trouvé, on élargit la recherche à tout l'établissement (moyenne), sécurité pcq des fois ça faisait rien
        const pasDeDonnees = !resultatsInsertion.insertionsPro || resultatsInsertion.insertionsPro.length === 0;

        if (pasDeDonnees) {
            
            const repGlobal = await fetch(`${URL_BASE_API}/stats/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "filters": { 
                        "etablissementIds": [uai],
                        "moisApresDiplome": 30,
                        "anneeMin": 2019
                    },
                    "harvest": {
                        "typeStats": "insertionsPro",
                        "insertionProDetails": ["general", "salaire", "emplois"]
                    }
                })
            });

            if (repGlobal.ok) {
                const dataGlobal = await repGlobal.json();
                if (dataGlobal.insertionsPro && dataGlobal.insertionsPro.length > 0) {
                    resultatsInsertion = dataGlobal;
                    source = 'etablissement_global';
                }
            }
        }

        // Retour propre des données pour l'affichage
        return {
            candidatures: resultatsCandidatures.candidatures || [],
            insertionsPro: resultatsInsertion.insertionsPro || [],
            sourceInsertion: source
        };

    } catch (e) {
        console.error("Erreur technique stats :", e);
        return { candidatures: [], insertionsPro: [], sourceInsertion: 'erreur' };
    }
}