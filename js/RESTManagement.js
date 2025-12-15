const URL_BASE_API = 'https://la-lab4ce.univ-lemans.fr/masters-stats/api/rest';

export async function getFormationDetails(ifc) {
    try {
        const url = `${URL_BASE_API}/formations/${ifc}?full-details=1`;
        const reponse = await fetch(url);
        if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
        return await reponse.json();
    } catch (erreur) {
        console.error("Erreur détails formation :", erreur);
        return null;
    }
}

export async function getSecteursDisciplinaires() {
    try {
        const url = `${URL_BASE_API}/secteurs-disciplinaires`;
        const reponse = await fetch(url);
        if (!reponse.ok) return [];
        return await reponse.json();
    } catch (erreur) {
        console.error("Erreur récupération secteurs :", erreur);
        return [];
    }
}

export async function getFormationsBySecteur(sdid) {
    try {
        const url = `${URL_BASE_API}/formations?sdid=${sdid}&full-details=1`;
        const reponse = await fetch(url);
        if (!reponse.ok) return [];
        const data = await reponse.json();
        return Array.isArray(data) ? data : (data.formations || []);
    } catch (erreur) {
        console.error("Erreur récupération formations du secteur :", erreur);
        return [];
    }
}

/**
 * Récupère les stats avec Fallback (Sécurité).
 * Si les stats d'insertion du master sont vides, on prend celles de l'établissement.
 */
export async function getStatsForMaster(ifc, uai, secDiscId) {
    try {
        // 1. CANDIDATURES (Toujours fiable via IFC)
        const reqCand = fetch(`${URL_BASE_API}/stats/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "filters": { 
                    "formationIfcs": [ifc],
                    "anneeMin": 2021
                },
                "harvest": { "typeStats": "candidatures", "candidatureDetails": ["general"] }
            })
        }).then(r => r.ok ? r.json() : { candidatures: [] });

        // 2. INSERTION - TENTATIVE 1 (Précise : UAI + Secteur)
        const filtersPrecise = {
            "etablissementIds": [uai],
            "moisApresDiplome": 30,
            "anneeMin": 2019
        };
        // On filtre par secteur si disponible
        if (secDiscId) {
            filtersPrecise.secteurDisciplinaireIds = [parseInt(secDiscId)];
        }

        const reqInsertPrecise = fetch(`${URL_BASE_API}/stats/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "filters": filtersPrecise,
                "harvest": {
                    "typeStats": "insertionsPro",
                    "insertionProDetails": ["general", "salaire", "emplois"]
                }
            })
        }).then(r => r.ok ? r.json() : { insertionsPro: [] });

        let [candData, insertData] = await Promise.all([reqCand, reqInsertPrecise]);
        let sourceInsertion = 'precis';

        // 3. INSERTION - TENTATIVE 2 (Fallback : Etablissement seul)
        // Si la tentative précise est vide, on prend la moyenne de l'établissement
        if (!insertData.insertionsPro || insertData.insertionsPro.length === 0) {
            console.warn("⚠️ Données précises manquantes, passage en moyenne établissement.");
            const reqInsertGlobal = await fetch(`${URL_BASE_API}/stats/search`, {
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
            
            if (reqInsertGlobal.ok) {
                const fallbackData = await reqInsertGlobal.json();
                if (fallbackData.insertionsPro && fallbackData.insertionsPro.length > 0) {
                    insertData = fallbackData;
                    sourceInsertion = 'etablissement_global';
                }
            }
        }

        return {
            candidatures: candData.candidatures || [],
            insertionsPro: insertData.insertionsPro || [],
            sourceInsertion: sourceInsertion
        };

    } catch (e) {
        console.error("Erreur stats :", e);
        return { candidatures: [], insertionsPro: [], sourceInsertion: 'erreur' };
    }
}