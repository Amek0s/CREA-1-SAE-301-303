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

import getMasterStats from "./RESTManagement.js";
import { saveStatsToCache, loadStatsFromCache } from "./cacheManagement.js";

// Import des gestionnaires de graphiques
import { initGrapheSalaire, updateGrapheSalaire } from "./grapheSalaire.js";
import { initGrapheEmploi, updateGrapheEmploi } from "./grapheEmploi.js"; // À créer selon le modèle ci-dessus
import { initGrapheAdmission, updateGrapheAdmission } from "./grapheAdmission.js"; // À créer selon le modèle ci-dessus

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
