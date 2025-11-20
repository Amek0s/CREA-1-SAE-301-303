/* import { create, update } from "./heatmapViz.js";
import getLastAttempts from "./RESTManagement.js";


function setupAutomaticUpdate(initialAttempts) {
    // Tableau contenant TOUTES les tentatives
    let allAttempts = initialAttempts;
    // Date de la dernière tentative
    let lastAttemptDate = new Date (attempts[attempts.length - 1][0]);




    setInterval(() => {
        // Récup des tentatives nouvelles depuis lastAttemptDate
    getLastAttempts(lastAttemptDate).then((newAttempts) => {
        // Rajout des tentatives au tableau
        allAttempts = allAttempts.concat(newAttempts);
        console.log("All attempts: " + allAttempts.length);
        // Mise à jour date de la dernière tentative
        lastAttemptDate = new Date(allAttempts[allAttempts.length - 1][0]);
        // Mise à jour du graph
        update(attempts);
    });
    }, 2000);
}


function main() {
    create();


    getLastAttempts(new Date()).then((attempts) => {
        console.log(attempts.length + " tentatives...")
        update(attempts);
        setupAutomaticUpdate(attempts);
    });
}


main();
*/

import {getFormationByIfc} from "./RESTManagement.js";
import { saveStatsToCache, loadStatsFromCache } from "./cacheManagement.js";

// Import des gestionnaires de graphiques
import { initGrapheSalaire, updateGrapheSalaire } from "./grapheSalaire.js";
import { initGrapheEmploi, updateGrapheEmploi } from "./grapheEmploi.js"; // À créer selon le modèle ci-dessus
import { initGrapheAdmission, updateGrapheAdmission } from "./grapheAdmission.js"; // À créer selon le modèle ci-dessus

export async function getMasterInformations(ifc) {
    try {
        const data =await getFormationByIfc(ifc);
        if (!data) {
            console.warn("Aucune donnée trouvée pour l'IFC :", ifc);
            return;
        }

        console.log("Données récupérées pour l'IFC", ifc, data);

        // Afficher le nom de l'établissement
        const nomEtab = data?.eta_nom || "Établissement inconnu";
        const tagEtab = document.getElementById('nomEtab');
        tagEtab.textContent = nomEtab;
        // Afficher le nom du parcours  
        const nomMaster = data?.disci_master || "Master inconnu";
        const tagMaster = document.getElementById('disci_master');
        tagMaster.textContent = "Master " + nomMaster;
        // Afficher la capacité d'accueil
        const capacite = data?.col || "Capacité inconnue";
        const tagCapacite = document.getElementById('col');
        tagCapacite.textContent = capacite;
        // Afficher l'alternance
        const alternance = data?.alternance ? "Oui" : "Non";
        const tagAlternance = document.getElementById('alternance');
        tagAlternance.textContent = alternance;
    } catch (error) {
    }
}

function initAllCharts() {
    initGrapheSalaire();
    initGrapheEmploi();
    initGrapheAdmission();
}

function updateAllCharts(data) {
    console.log("Mise à jour des graphiques avec :", data);
    updateGrapheSalaire(data);
    updateGrapheEmploi(data);
    updateGrapheAdmission(data);
}

async function main() {
    const ifc = '1800799UZ1SW';
    getMasterInformations(ifc);

    // 1. Initialiser les graphiques (vides)
    initAllCharts();

    // 2. Tenter de charger depuis le cache
    let data = loadStatsFromCache();

    if (data) {
        console.log("Données chargées depuis le cache");
        updateAllCharts(data);
    } else {
        console.log("Pas de cache, appel API...");
        // 3. Si pas de cache, on fetch
        data = await getMasterStats();
        
        if (data) {
            // 4. On sauvegarde et on met à jour
            saveStatsToCache(data);
            updateAllCharts(data);
        } else {
            console.error("Impossible de récupérer les données.");
        }
    }
}

// Lancement
document.addEventListener('DOMContentLoaded', main);
