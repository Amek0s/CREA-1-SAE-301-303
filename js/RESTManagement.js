const URL_BASE_API = 'https://la-lab4ce.univ-lemans.fr/masters-stats/api/rest';

/**
 * Récupère les détails d'une formation (Titre, Etablissement, Ville...)
 */
export async function getFormationDetails(ifc) {
    try {
        const url = `${URL_BASE_API}/formations/${ifc}?full-details=1`;
        const reponse = await fetch(url);

        if (reponse.ok === false) {
            throw new Error(`Erreur HTTP : ${reponse.status}`);
        }

        const donnees = await reponse.json();
        return donnees;

    } catch (erreur) {
        console.error("Erreur détails formation :", erreur);
        return null;
    }
}

/**
 * Récupère la liste des grands domaines (Droit, Sciences, etc.)
 */
export async function getSecteursDisciplinaires() {
    try {
        const url = `${URL_BASE_API}/secteurs-disciplinaires`;
        const reponse = await fetch(url);

        if (reponse.ok === false) {
            return [];
        }

        const donnees = await reponse.json();
        return donnees;

    } catch (erreur) {
        console.error("Erreur récupération secteurs :", erreur);
        return [];
    }
}

/**
 * Récupère les masters d'un secteur précis
 */
export async function getFormationsBySecteur(sdid) {
    try {
        const url = `${URL_BASE_API}/formations?sdid=${sdid}&full-details=1`;
        const reponse = await fetch(url);

        if (reponse.ok === false) {
            return [];
        }

        const donnees = await reponse.json();

        // Vérification si c'est un tableau ou un objet
        if (Array.isArray(donnees) === true) {
            return donnees;
        } else {
            // Si c'est un objet qui contient une liste "formations"
            if (donnees.formations) {
                return donnees.formations;
            } else {
                return [];
            }
        }

    } catch (erreur) {
        console.error("Erreur récupération formations du secteur :", erreur);
        return [];
    }
}

/**
 * Récupère les chiffres (Stats) pour un master.
 * Essaie d'abord le précis, sinon cherche une moyenne globale (fallback).
 */
export async function getStatsForMaster(ifc, uai, secDiscId) {
    try {
        // --- 1. Candidatures ---
        let donneesCandidatures = { candidatures: [] };
        
        const reponseCand = await fetch(`${URL_BASE_API}/stats/search`, {
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

        if (reponseCand.ok === true) {
            donneesCandidatures = await reponseCand.json();
        }

        // --- 2. Insertion Pro (Tentative précise) ---
        let donneesInsertion = { insertionsPro: [] };
        
        const filtresPrecis = {
            "etablissementIds": [uai],
            "moisApresDiplome": 30,
            "anneeMin": 2019
        };

        if (secDiscId) {
            filtresPrecis.secteurDisciplinaireIds = [parseInt(secDiscId)];
        }

        const reponseInsertPrecise = await fetch(`${URL_BASE_API}/stats/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "filters": filtresPrecis,
                "harvest": {
                    "typeStats": "insertionsPro",
                    "insertionProDetails": ["general", "salaire", "emplois"]
                }
            })
        });

        if (reponseInsertPrecise.ok === true) {
            donneesInsertion = await reponseInsertPrecise.json();
        }

        let sourceInsertion = 'precis'; 

        // --- 3. Mécanisme de secours (Fallback) ---
        // Si on n'a rien trouvé de précis
        let insertionVide = false;
        if (!donneesInsertion.insertionsPro) {
            insertionVide = true;
        } else if (donneesInsertion.insertionsPro.length === 0) {
            insertionVide = true;
        }

        if (insertionVide === true) {
            console.warn("⚠️ Données précises manquantes, passage en moyenne établissement.");
            
            const reponseInsertGlobal = await fetch(`${URL_BASE_API}/stats/search`, {
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

            if (reponseInsertGlobal.ok === true) {
                const donneesFallback = await reponseInsertGlobal.json();
                
                // Si on a trouvé des données globales, on les utilise
                if (donneesFallback.insertionsPro && donneesFallback.insertionsPro.length > 0) {
                    donneesInsertion = donneesFallback;
                    sourceInsertion = 'etablissement_global';
                }
            }
        }

        // Préparation des résultats finaux
        let resultCandidatures = [];
        if (donneesCandidatures.candidatures) {
            resultCandidatures = donneesCandidatures.candidatures;
        }

        let resultInsertions = [];
        if (donneesInsertion.insertionsPro) {
            resultInsertions = donneesInsertion.insertionsPro;
        }

        return {
            candidatures: resultCandidatures,
            insertionsPro: resultInsertions,
            sourceInsertion: sourceInsertion
        };

    } catch (e) {
        console.error("Erreur stats :", e);
        return { candidatures: [], insertionsPro: [], sourceInsertion: 'erreur' };
    }
}