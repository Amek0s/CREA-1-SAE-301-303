import { getFormationByIfc } from "./RESTManagement.js";
import { saveStatsToCache, loadStatsFromCache } from "./cacheManagement.js";

// Import des gestionnaires de graphiques
import { initGrapheSalaire, updateGrapheSalaire } from "./grapheSalaire.js";
import { initGrapheEmploi, updateGrapheEmploi } from "./grapheEmploi.js"; 
import { initGrapheAdmission, updateGrapheAdmission } from "./grapheAdmission.js"; 

// Fonction pour mettre à jour les informations clés
function updateKeyInformations(data) {
    // Afficher le nom de l'établissement
    const tagEtab = document.getElementById('nomEtab');
    tagEtab.textContent = data?.eta_nom || "Établissement inconnu";
    // Afficher le nom du parcours  
    const tagMaster = document.getElementById('disci_master');
    tagMaster.textContent = "Master " + (data?.disci_master || "Inconnu");
    // Afficher la capacité d'accueil
    const tagCapacite = document.getElementById('col');
    tagCapacite.textContent = data?.col || "Capacité inconnue";
    // Afficher l'alternance
    const tagAlternance = document.getElementById('alternance');
    tagAlternance.textContent = data?.alternance ? "Oui" : "Non";

    const tagParcours = document.getElementById('parcours');
    tagParcours.textContent = data?.parcours || "";
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

// NOTE: L'ancienne fonction getMasterInformations est redondante/corrigée dans la nouvelle fonction main ci-dessous.

async function main() {
    const ifc = '1800799UZ1SW';

    // 1. Initialiser les graphiques (vides)
    initAllCharts();

    // 2. Tenter de charger depuis le cache
    let data = loadStatsFromCache();

    if (data && data.ifc === ifc) {
        
        console.log("Données chargées depuis le cache");
        updateKeyInformations(data); 
        updateAllCharts(data);

    } else {
        console.log("Pas de cache, appel API...");
        
        // 3. Si pas de cache, on fetch l'objet Master complet
        try {
            // L'appel direct à getFormationByIfc renvoie l'objet data complet
            data = await getFormationByIfc(ifc);
        } catch (error) {
            console.error("Erreur lors de la récupération des données Master:", error);
            return;
        }
        
        if (data) {
            // 4. On sauvegarde et on met à jour
            saveStatsToCache(data);
            updateKeyInformations(data);
            updateAllCharts(data);
        } else {
            console.error("Impossible de récupérer les données.");
        }
    }
}

// Lancement
document.addEventListener('DOMContentLoaded', main);