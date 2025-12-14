// RESTManagement.js - Version Double Requête (Candidature + Insertion)

const URL_BASE_API = 'https://la-lab4ce.univ-lemans.fr/masters-stats/api/rest';

export async function getFormationDetails(ifc) {
    try {
        const url = `${URL_BASE_API}/formations/${ifc}?full-details=1`;
        const reponse = await fetch(url);
        if (!reponse.ok) throw new Error(`Erreur API Formations: ${reponse.status}`);
        return await reponse.json();
    } catch (erreur) {
        console.error("Erreur détails formation :", erreur);
        return null;
    }
}

export async function getStatsForMaster(ifc, uai) {
    try {
        // --- REQUÊTE 1 : CANDIDATURES (Filtrée par IFC précis) ---
        const promiseCandidatures = fetch(`${URL_BASE_API}/stats/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "filters": { 
                    "formationIfcs": [ifc],
                    "annees": [2022, 2023] // On cible les années récentes
                },
                "harvest": {
                    "typeStats": "candidatures",
                    "candidatureDetails": ["general"]
                }
            })
        }).then(res => res.ok ? res.json() : { candidatures: [] });

        // --- REQUÊTE 2 : INSERTION PRO (Filtrée par Etablissement uniquement) ---
        // On ne met PAS "formationIfcs" ici, sinon ça renvoie 0 résultat
        const promiseInsertion = fetch(`${URL_BASE_API}/stats/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "filters": { 
                    "etablissementIds": [uai],
                    "moisApresDiplome": 30 
                },
                "harvest": {
                    "typeStats": "insertionsPro",
                    "insertionProDetails": ["general", "salaire", "emplois"]
                }
            })
        }).then(res => res.ok ? res.json() : { insertionsPro: [] });

        // On attend que les deux finissent
        const [resultatCand, resultatInsert] = await Promise.all([promiseCandidatures, promiseInsertion]);

        console.log("📦 Candidatures reçues :", resultatCand.candidatures?.length);
        console.log("📦 Insertion reçue (lignes) :", resultatInsert.insertionsPro?.length);

        // On fusionne les deux résultats en un seul objet pour l'orchestrator
        return {
            candidatures: resultatCand.candidatures || [],
            insertionsPro: resultatInsert.insertionsPro || []
        };

    } catch (erreur) {
        console.error("Erreur récupération stats :", erreur);
        return { candidatures: [], insertionsPro: [] };
    }
}