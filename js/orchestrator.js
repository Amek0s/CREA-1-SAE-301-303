// --- CONFIGURATION ---
const IFC_ACTUEL = '0900816N1CXR'; 

// --- IMPORTS ---
import { getFormationDetails, getStatsForMaster } from "./RESTManagement.js";
import { saveStatsToCache, loadStatsFromCache } from "./cacheManagement.js";
import { initGrapheSalaire, updateGrapheSalaire } from "./grapheSalaire.js";
import { initGrapheEmploi, updateGrapheEmploi } from "./grapheEmploi.js"; 
import { initGrapheAdmission, updateGrapheAdmission } from "./grapheAdmission.js"; 

// --- VARIABLES GLOBALES POUR LA MAP ---
let map = null;
let marker = null;

// --- FONCTIONS ---

function updateTextElements(details, stats) {
    if (!details) return;
    
    const cand = (stats && stats.candidatures && stats.candidatures.length > 0) 
                 ? stats.candidatures[0].general 
                 : {};

    const mention = details.mention || "Information non disponible";
    const parcours = details.parcours || "";
    const etablissement = details.etablissement || "Établissement inconnu";

    document.getElementById('disci_master').textContent = "Master " + mention;
    document.getElementById('parcours').textContent = parcours;
    document.getElementById('nomEtab').textContent = etablissement;
    
    const isAlternance = details.alternance || (details.modalites && details.modalites.includes('apprentissage'));
    document.getElementById('alternance').textContent = isAlternance ? "Oui" : "Non";
    
    document.getElementById('col').textContent = cand.capacite || "N/A";
}

/**
 * Initialise ou met à jour la carte OpenStreetMap (Leaflet).
 * Utilise l'API Nominatim pour convertir l'adresse en coordonnées GPS.
 */
async function updateMapOpenSource(details) {
    if (!details) return;

    // 1. Initialisation de la carte si elle n'existe pas encore
    if (!map) {
        // Coordonnées par défaut (France) avant chargement
        map = L.map('osm-map').setView([46.603354, 1.888334], 6);

        // Ajout des tuiles (le design de la carte) - Ici OpenStreetMap classique
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);
    }

    // 2. Construction de la requête de géocodage
    const etablissement = details.etablissement || "";
    const ville = details.ville || "";
    const cp = details.codePostal || "";
    
    // On construit une requête précise (ex: "Université de Rennes 1 Rennes 35000")
    const query = `${etablissement} ${ville} ${cp}`.trim();
    
    if (query.length === 0) return;

    console.log(`🌍 Recherche GPS pour : ${query}`);

    try {
        // 3. Appel à l'API de géocodage Nominatim (OpenStreetMap)
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
        const response = await fetch(url);
        const results = await response.json();

        if (results && results.length > 0) {
            const lat = results[0].lat;
            const lon = results[0].lon;
            
            console.log(`📍 Coordonnées trouvées : ${lat}, ${lon}`);

            // 4. Mise à jour de la vue et du marqueur
            map.setView([lat, lon], 15); // Zoom 15 (niveau rue)

            // Gestion du marqueur (on supprime l'ancien s'il existe)
            if (marker) {
                map.removeLayer(marker);
            }

            marker = L.marker([lat, lon]).addTo(map)
                .bindPopup(`<b>${etablissement}</b><br>${ville}`)
                .openPopup();
        } else {
            console.warn("Aucun résultat GPS trouvé pour cette adresse.");
        }
    } catch (error) {
        console.error("Erreur lors du géocodage :", error);
    }
}

function formatDataForCharts(stats, secDiscIdVise) {
    const cand = (stats.candidatures && stats.candidatures.length > 0) 
                 ? stats.candidatures[0].general 
                 : { nb: 0, accept: 0 };

    let insert = {};
    
    if (stats.insertionsPro && stats.insertionsPro.length > 0) {
        const statTrouvee = stats.insertionsPro.find(s => 
            s.relations && s.relations.secDiscIds && s.relations.secDiscIds.includes(secDiscIdVise)
        );
        insert = statTrouvee || stats.insertionsPro[0];
    }

    const gen = insert.general || {};
    const sal = insert.salaire || {};
    const emp = insert.emplois || {};

    const tauxAdm = cand.nb > 0 ? (cand.accept / cand.nb * 100) : 0;
    const salaireMensuel = sal.netMedianTempsPlein || 0;

    return {
        pct_accept_master: Math.round(tauxAdm),
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
    initGrapheSalaire(); 
    initGrapheEmploi(); 
    initGrapheAdmission();

    console.log(`🚀 Démarrage MasterMind pour IFC : ${IFC_ACTUEL}`);

    let data = loadStatsFromCache();
    
    if (data && data.ifc !== IFC_ACTUEL) {
        console.log("🔄 Nouvel IFC détecté, rechargement des données...");
        data = null; 
    }

    if (!data) {
        console.log("📡 Appel API en cours...");
        
        const details = await getFormationDetails(IFC_ACTUEL);

        if (details) {
            const uai = details.etabUai || details.uai; 
            const secDiscId = details.secDiscId || details.secteurDisciplinaireId;

            if (!uai) {
                console.error("❌ Impossible de trouver l'UAI !");
                return;
            }

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
        console.log("✅ Données chargées depuis le cache.");
    }

    if (data && data.formatted) {
        updateTextElements(data.details, data.statsRaw);
        
        // --- NOUVEL APPEL POUR LA CARTE OPEN SOURCE ---
        updateMapOpenSource(data.details);
        
        updateGrapheSalaire(data.formatted);
        updateGrapheEmploi(data.formatted);
        updateGrapheAdmission(data.formatted);
    }
}

document.addEventListener('DOMContentLoaded', main);