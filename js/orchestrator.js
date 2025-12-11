// orchestrator.js - Le fichier qui coordonne tout

// 1. On importe les fonctions qui font les appels API
import { getFormationDetails, getStatsForMaster } from "./RESTManagement.js";
import { saveStatsToCache, loadStatsFromCache } from "./cacheManagement.js";

// 2. On importe les fonctions qui dessinent les graphiques (on suppose que ces fichiers sont là)
import { initGrapheSalaire, updateGrapheSalaire } from "./grapheSalaire.js";
import { initGrapheEmploi, updateGrapheEmploi } from "./grapheEmploi.js"; 
import { initGrapheAdmission, updateGrapheAdmission } from "./grapheAdmission.js"; 

// --- PARTIE 1 : Mise à Jour de l'Interface TEXTUELLE (Nom, Alternance, Capacité) ---

function mettreAJourInfosClees(detailsFormation, statsAPI) {
    
    // a. Extraction des données contextuelles (Infos simples)
    const nomDuMaster = detailsFormation?.mention || "Intitulé inconnu";
    const parcours = detailsFormation?.parcours || "Parcours non spécifié";
    const nomEtablissement = detailsFormation?.etablissement || "Établissement inconnu";
    // L'alternance est un booléen (true/false) que l'on transforme en texte
    const alternancePossible = detailsFormation?.alternance ? "Oui" : "Non"; 

    // b. Extraction de la Capacité (vient des statistiques)
    // On cherche l'objet 'general' du premier élément du tableau 'candidatures'
    const capaciteDAccueil = statsAPI?.candidatures?.[0]?.general?.capacite || "N/A";

    // c. Mise à jour des éléments HTML
    document.getElementById('disci_master').textContent = "Master " + nomDuMaster;
    document.getElementById('parcours').textContent = parcours;
    document.getElementById('nomEtab').textContent = nomEtablissement;
    document.getElementById('alternance').textContent = alternancePossible;
    document.getElementById('col').textContent = capaciteDAccueil;
}

// --- PARTIE 2 : Préparation des Données pour les Graphiques ---

function preparerDonneesGraphiques(apiStats) {
    const statsCandidatures = apiStats?.candidatures?.[0]?.general || {};
    const statsInsertion = apiStats?.insertionsPro?.[0] || {};
    const statsInsertionGeneral = statsInsertion.general || {};
    const salaire = statsInsertion.salaire || {}; 

    // Calcul du Taux d'admission : (Acceptés / Candidats Totaux) * 100
    const nbAccept = statsCandidatures.accept || 0;
    const nbCandidats = statsCandidatures.nb || 0;
    const tauxAdmission = nbCandidats > 0 ? (nbAccept / nbCandidats) * 100 : 0;
    
    // --- Correction Salaire : Conversion Mensuel -> Annuel (Multiplication par 12) ---
    // La donnée API pour la médiane (netMedianTempsPlein) est considérée comme mensuelle
    const netMedianMensuel = salaire.netMedianTempsPlein || 0;
    
    // CALCUL : On annualise les données mensuelles pour l'échelle du graphique
    const salaireMedianAnnuel = netMedianMensuel * 12;
    const salaireNetAnnuel = netMedianMensuel * 12;
    // -----------------------------------------------------------------------------------

    // L'objet final envoyé aux fonctions de graphiques doit avoir ces clés
    return {
        // Taux pour grapheAdmission.js
        pct_accept_master: tauxAdmission.toFixed(1), 
        taux_insert_18m: statsInsertionGeneral.tauxInsertion || 0, 
        taux_emploi_18m: statsInsertionGeneral.tauxEmploi || 0, 

        // Salaires pour grapheSalaire.js (UTILISATION DES VALEURS ANNUELLES CALCULÉES)
        salaire_brut: salaire.brutAnnuelEstime || 0, // Déjà annuel
        salaire_median: salaireMedianAnnuel,         // <-- CORRECTION APPLIQUÉE ICI
        salaire_net: salaireNetAnnuel,               // <-- CORRECTION APPLIQUÉE ICI

        // Emplois pour grapheEmploi.js
        nb_cadres: statsInsertion.emplois?.cadre || 0,
        nb_stable: statsInsertion.emplois?.stable || 0,
        nb_temps_plein: statsInsertion.emplois?.tempsPlein || 0
    };
}

// --- PARTIE 3 : Initialisation et Lancement ---

function initAllCharts() {
    initGrapheSalaire();
    initGrapheEmploi();
    initGrapheAdmission();
}

function updateAllCharts(data) {
    updateGrapheSalaire(data);
    updateGrapheEmploi(data);
    updateGrapheAdmission(data);
}

async function main() {
    
    const ifcActuel = '1402116P7TV1'; 

    initAllCharts();
    
    // Tente de charger depuis le cache avant de faire l'appel API
    let donneesEnCache = loadStatsFromCache();

    if (donneesEnCache && donneesEnCache.ifc === ifcActuel) {
        console.log("Données chargées depuis le cache.");
        mettreAJourInfosClees(donneesEnCache.formation, donneesEnCache.statsRaw);
        updateAllCharts(donneesEnCache.statsProcessed);
        return; 
    }
    
    // Si pas de cache : Lancement des deux appels API en même temps (promesses)
    console.log("Appel API en cours...");
    const [details, stats] = await Promise.all([
        getFormationDetails(ifcActuel),
        getStatsForMaster(ifcActuel)
    ]);
    
    if (details && stats) {
        // Traitement des données
        const statsPrepares = preparerDonneesGraphiques(stats);
        
        // Mise à jour de l'affichage
        mettreAJourInfosClees(details, stats);
        updateAllCharts(statsPrepares);
        
        // Sauvegarde des nouvelles données
        saveStatsToCache({
            ifc: ifcActuel, 
            formation: details, 
            statsRaw: stats, 
            statsProcessed: statsPrepares
        });
    } else {
        console.error("Impossible de récupérer une ou plusieurs sources de données API. Vérifiez l'IFC ou la connexion.");
    }
}

document.addEventListener('DOMContentLoaded', main);