// --- CONFIGURATION ---
const IFC_ACTUEL = '0900816N1CXR'; 

// --- IMPORTS ---
import { getFormationDetails, getStatsForMaster } from "./RESTManagement.js";
import { saveStatsToCache, loadStatsFromCache } from "./cacheManagement.js";
import { initGrapheSalaire, updateGrapheSalaire } from "./grapheSalaire.js";
import { initGrapheEmploi, updateGrapheEmploi } from "./grapheEmploi.js"; 
import { initGrapheAdmission, updateGrapheAdmission } from "./grapheAdmission.js"; 

// --- FONCTIONS ---

function updateTextElements(details, stats) {
    if (!details) return;
    
    // On prend la première candidature (car filtré par IFC, il n'y en a qu'une ou deux)
    const cand = (stats && stats.candidatures && stats.candidatures.length > 0) 
                 ? stats.candidatures[0].general 
                 : {};

    document.getElementById('disci_master').textContent = "Master " + (details.mention || "Inconnu");
    document.getElementById('parcours').textContent = details.parcours || "";
    document.getElementById('nomEtab').textContent = details.etablissement || "";
    document.getElementById('alternance').textContent = details.alternance ? "Oui" : "Non";
    document.getElementById('col').textContent = cand.capacite || "N/A";
}

function formatDataForCharts(stats, secDiscIdVise) {
    // 1. ADMISSION
    const cand = (stats.candidatures && stats.candidatures.length > 0) 
                 ? stats.candidatures[0].general 
                 : { nb: 0, accept: 0 };

    // 2. INSERTION PRO
    let insert = {};
    
    if (stats.insertionsPro && stats.insertionsPro.length > 0) {
        // A. On cherche la correspondance exacte avec le secteur disciplinaire
        const statTrouvee = stats.insertionsPro.find(s => 
            s.relations && s.relations.secDiscIds && s.relations.secDiscIds.includes(secDiscIdVise)
        );

        if (statTrouvee) {
            console.log("Données précises trouvées (Secteur Disc.)");
            insert = statTrouvee;
        } else {
            console.warn("Pas de correspondance exacte, utilisation de la moyenne établissement.");
            insert = stats.insertionsPro[0];
        }
    }

    const gen = insert.general || {};
    const sal = insert.salaire || {};
    const emp = insert.emplois || {};

    const tauxAdm = cand.nb > 0 ? (cand.accept / cand.nb * 100) : 0;
    const salaireMensuel = sal.netMedianTempsPlein || 0;

    return {
        pct_accept_master: tauxAdm,
        taux_insert_18m: gen.tauxInsertion || 0,
        taux_emploi_18m: gen.tauxEmploi || 0,
        salaire_brut: sal.brutAnnuelEstime || 0,
        salaire_median: salaireMensuel * 12, 
        salaire_net: salaireMensuel * 12,
        nb_cadres: emp.cadre || 0,
        nb_stable: emp.stable || 0,
        nb_temps_plein: emp.tempsPlein || 0
    };
}

// --- MAIN ---

async function main() {
    initGrapheSalaire(); initGrapheEmploi(); initGrapheAdmission();

    console.log(`Démarrage pour IFC : ${IFC_ACTUEL}`);

    let data = loadStatsFromCache();
    
    // Invalidation si changement d'IFC
    if (data && data.ifc !== IFC_ACTUEL) {
        console.log("Nouvel IFC détecté, nettoyage du cache...");
        data = null; 
    }

    if (!data) {
        console.log("Appel API en cours...");
        
        const details = await getFormationDetails(IFC_ACTUEL);

        if (details) {
            // Récupération sécurisée de l'UAI
            const uai = details.etabUai || details.uai; 
            const secDiscId = details.secDiscId || details.secteurDisciplinaireId;

            if (!uai) {
                console.error("Impossible de trouver l'UAI de cet établissement !");
                return;
            }

            // Appel avec les identifiants
            const stats = await getStatsForMaster(IFC_ACTUEL, uai);

            if (stats) {
                data = {
                    ifc: IFC_ACTUEL,
                    details: details,
                    statsRaw: stats,
                    formatted: formatDataForCharts(stats, secDiscId)
                };
                saveStatsToCache(data);
            }
        }
    } else {
        console.log("Données chargées du cache.");
    }

    if (data && data.formatted) {
        updateTextElements(data.details, data.statsRaw);
        updateGrapheSalaire(data.formatted);
        updateGrapheEmploi(data.formatted);
        updateGrapheAdmission(data.formatted);
    }
}

document.addEventListener('DOMContentLoaded', main);