const URL_BASE_API = 'https://la-lab4ce.univ-lemans.fr/masters-stats/api/rest';

/**
 * Récupère les détails d'une formation (Page Accueil)
 */
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

/**
 * Récupère la liste des secteurs disciplinaires (Page Discipline)
 */
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

/**
 * Récupère les formations d'un secteur (Page Discipline 2)
 */
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
 * Récupère les statistiques complètes.
 * CORRECTION : On utilise l'IFC pour les candidatures, 
 * MAIS on utilise l'UAI et le Secteur pour l'insertion (car l'IFC ne marche pas pour ça).
 */
export async function getStatsForMaster(ifc, uai, secDiscId) {
    try {
        // 1. CANDIDATURES (Basé sur l'IFC)
        const reqCand = fetch(`${URL_BASE_API}/stats/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "filters": { "formationIfcs": [ifc] },
                "harvest": { "typeStats": "candidatures", "candidatureDetails": ["general"] }
            })
        }).then(r => r.ok ? r.json() : { candidatures: [] });

        // 2. INSERTION PRO (Basé sur Etablissement + Secteur)
        // On construit le filtre dynamiquement
        const filtersInsert = {
            "etablissementIds": [uai],
            "moisApresDiplome": 30
        };
        // On ajoute le secteur seulement s'il est défini, pour affiner
        if (secDiscId) {
            filtersInsert.secteurDisciplinaireIds = [parseInt(secDiscId)];
        }

        const reqInsert = fetch(`${URL_BASE_API}/stats/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "filters": filtersInsert,
                "harvest": {
                    "typeStats": "insertionsPro",
                    "insertionProDetails": ["general", "salaire", "emplois"]
                }
            })
        }).then(r => r.ok ? r.json() : { insertionsPro: [] });

        const [cand, insert] = await Promise.all([reqCand, reqInsert]);

        return {
            candidatures: cand.candidatures || [],
            insertionsPro: insert.insertionsPro || []
        };
    } catch (e) {
        console.error("Erreur stats :", e);
        return { candidatures: [], insertionsPro: [] };
    }
}