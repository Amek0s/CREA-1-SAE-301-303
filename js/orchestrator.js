// --- IMPORTS ---
import { getFormationDetails, getStatsForMaster } from "./RESTManagement.js";
import { saveStatsToCache, loadStatsFromCache } from "./cacheManagement.js";
import { initGrapheSalaire, updateGrapheSalaire } from "./grapheSalaire.js";
import { initGrapheEmploi, updateGrapheEmploi } from "./grapheEmploi.js"; 
import { initGrapheAdmission, updateGrapheAdmission } from "./grapheAdmission.js"; 

// --- VARIABLES ---
let map = null;
let marker = null;

const urlParams = new URLSearchParams(window.location.search);
const IFC_ACTUEL = urlParams.get('ifc') || '0900816N1CXR'; 

// --- FONCTIONS ---

function updateTextElements(details, stats) {
    if (!details) return;
    
    const cand = (stats && stats.candidatures && stats.candidatures.length > 0) 
                 ? stats.candidatures[0].general 
                 : {};

    const mention = details.mention || "Information non disponible";
    const parcours = details.parcours || "";
    const etablissement = details.etablissement || details.etablissementLibelle || "Établissement inconnu";

    const elTitre = document.getElementById('disci_master');
    const elParcours = document.getElementById('parcours');
    const elEtab = document.getElementById('nomEtab');
    const elAlt = document.getElementById('alternance');
    const elCol = document.getElementById('col');

    if(elTitre) elTitre.textContent = "Master " + mention;
    if(elParcours) elParcours.textContent = parcours;
    if(elEtab) elEtab.textContent = etablissement;
    
    const isAlternance = details.alternance || (details.modalites && details.modalites.includes('apprentissage'));
    if(elAlt) elAlt.textContent = isAlternance ? "Oui" : "Non";
    
    if(elCol) elCol.textContent = cand.capacite || "N/A";
}

async function updateMapOpenSource(details) {
    if (!details) return;
    const divMap = document.getElementById('osm-map');
    if (!divMap) return;

    if (!map) {
        map = L.map('osm-map').setView([46.603354, 1.888334], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);
    }

    const nom = details.etablissement || details.etablissementLibelle || "";
    const ville = details.ville || "";
    const cp = details.codePostal || "";
    const query = `${nom} ${ville} ${cp}`.trim();
    
    if (query.length === 0) return;

    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
        const r = await fetch(url);
        const results = await r.json();

        if (results && results.length > 0) {
            const { lat, lon } = results[0];
            map.setView([lat, lon], 15);
            if (marker) map.removeLayer(marker);
            marker = L.marker([lat, lon]).addTo(map)
                .bindPopup(`<b>${nom}</b><br>${ville}`)
                .openPopup();
        }
    } catch (e) { console.error(e); }
}

function formatDataForCharts(stats) {
    const cand = stats.candidatures?.[0]?.general || { nb: 0, accept: 0 };
    // Insertion pro peut être vide si pas de stats pour cet établissement/secteur
    const insert = stats.insertionsPro?.[0] || {}; 

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

    console.log(`🚀 Chargement pour IFC : ${IFC_ACTUEL}`);

    let data = loadStatsFromCache();
    if (data && data.ifc !== IFC_ACTUEL) data = null;

    if (!data) {
        const details = await getFormationDetails(IFC_ACTUEL);
        if (details) {
            // CORRECTION : On récupère l'UAI et le secteur pour cibler les stats d'insertion
            const uai = details.etabUai || details.uai;
            // L'API utilise parfois secDiscId, sectDiscId ou secteurDisciplinaireId
            const secDiscId = details.secDiscId || details.sectDiscId || details.secteurDisciplinaireId;

            // Appel avec les 3 paramètres
            const stats = await getStatsForMaster(IFC_ACTUEL, uai, secDiscId);
            
            data = {
                ifc: IFC_ACTUEL,
                details: details,
                statsRaw: stats,
                formatted: formatDataForCharts(stats)
            };
            saveStatsToCache(data);
        }
    }

    if (data && data.formatted) {
        updateTextElements(data.details, data.statsRaw);
        updateMapOpenSource(data.details);
        updateGrapheSalaire(data.formatted);
        updateGrapheEmploi(data.formatted);
        updateGrapheAdmission(data.formatted);
    } else {
        const title = document.getElementById('disci_master');
        if(title) title.textContent = "Données indisponibles";
    }
}

document.addEventListener('DOMContentLoaded', main);