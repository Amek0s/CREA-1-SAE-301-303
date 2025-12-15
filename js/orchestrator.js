import { getFormationDetails, getStatsForMaster } from "./RESTManagement.js";
import { saveStatsToCache, loadStatsFromCache } from "./cacheManagement.js";
import { initGrapheSalaire, updateGrapheSalaire } from "./grapheSalaire.js";
import { initGrapheEmploi, updateGrapheEmploi } from "./grapheEmploi.js"; 
import { initGrapheAdmission, updateGrapheAdmission } from "./grapheAdmission.js"; 

let map = null;
let marker = null;

const urlParams = new URLSearchParams(window.location.search);
const IFC_ACTUEL = urlParams.get('ifc') || '0900816N1CXR'; 

function updateTextElements(details, stats, sourceInsertion) {
    if (!details) return;
    
    // Sécurisation : on prend la première candidature dispo ou vide
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

    // Gestion du message d'avertissement si les données sont globales
    const elStatsTitle = document.getElementById('stats-title');
    if (elStatsTitle) {
        if (sourceInsertion === 'etablissement_global') {
            elStatsTitle.innerHTML = "QUELQUES CHIFFRES <br><span style='font-size:0.6em; text-transform:none; color:var(--text-secondary);'>(Données estimées : Moyenne établissement)</span>";
        } else {
            elStatsTitle.textContent = "QUELQUES CHIFFRES";
        }
    }
}

async function updateMapOpenSource(details) {
    if (!details) return;
    const divMap = document.getElementById('osm-map');
    if (!divMap) return;

    if (!map) {
        map = L.map('osm-map').setView([46.603354, 1.888334], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
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
            marker = L.marker([lat, lon]).addTo(map).bindPopup(`<b>${nom}</b><br>${ville}`).openPopup();
        }
    } catch (e) { console.error(e); }
}

function formatDataForCharts(stats) {
    const cand = stats.candidatures?.[0]?.general || { nb: 0, accept: 0 };
    
    // Insertion pro peut être vide, ou remplie par le fallback
    let insert = {};
    if (stats.insertionsPro && stats.insertionsPro.length > 0) {
        // On prend le premier élément (le plus pertinent retourné par l'API)
        insert = stats.insertionsPro[0];
    }

    const gen = insert.general || {};
    const sal = insert.salaire || {};
    const emp = insert.emplois || {};

    // Calcul du taux d'admission
    const tauxAdm = cand.nb > 0 ? (cand.accept / cand.nb * 100) : 0;
    const salaireMensuel = sal.netMedianTempsPlein || 0;

    return {
        // Données pour grapheAdmission
        pct_accept_master: Math.round(tauxAdm),
        taux_insert_18m: gen.tauxInsertion || 0,
        taux_emploi_18m: gen.tauxEmploi || 0,

        // Données pour grapheSalaire
        salaire_brut: sal.brutAnnuelEstime || 0,
        salaire_median: salaireMensuel * 12, 
        salaire_net: salaireMensuel * 12,

        // Données pour grapheEmploi
        nb_cadres: emp.cadre || 0,
        nb_stable: emp.stable || 0,
        nb_temps_plein: emp.tempsPlein || 0
    };
}

async function main() {
    // Initialisation des 3 graphes de base
    initGrapheSalaire(); 
    initGrapheEmploi(); 
    initGrapheAdmission();

    console.log(`IFC : ${IFC_ACTUEL}`);

    let data = loadStatsFromCache();
    if (data && data.ifc !== IFC_ACTUEL) data = null;

    if (!data) {
        const details = await getFormationDetails(IFC_ACTUEL);
        if (details) {
            const uai = details.etabUai || details.uai;
            const secDiscId = details.secDiscId || details.sectDiscId || details.secteurDisciplinaireId;

            // Appel API avec la logique Fallback
            const statsBundle = await getStatsForMaster(IFC_ACTUEL, uai, secDiscId);
            
            data = {
                ifc: IFC_ACTUEL,
                details: details,
                statsRaw: statsBundle,
                formatted: formatDataForCharts(statsBundle)
            };
            saveStatsToCache(data);
        }
    }

    if (data && data.formatted) {
        updateTextElements(data.details, data.statsRaw, data.statsRaw.sourceInsertion);
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