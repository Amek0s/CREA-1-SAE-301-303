import { getFormationDetails, getStatsForMaster } from "./RESTManagement.js";
import { saveStatsToCache, loadStatsFromCache } from "./cacheManagement.js";
import { initGrapheSalaire, updateGrapheSalaire } from "./grapheSalaire.js";
import { initGrapheEmploi, updateGrapheEmploi } from "./grapheEmploi.js"; 
import { initGrapheAdmission, updateGrapheAdmission } from "./grapheAdmission.js"; 

let map = null;
let marker = null;

// Lecture de l'URL
const urlParams = new URLSearchParams(window.location.search);
let IFC_ACTUEL = urlParams.get('ifc');

// Valeur par défaut pour tester si pas d'IFC
if (IFC_ACTUEL === null) {
    IFC_ACTUEL = '1302436S61PT';
}

function updateTextElements(details, stats, sourceInsertion) {
    if (!details) return;
    
    // 1. Candidatures
    let infoCandidature = {};
    if (stats.candidatures && stats.candidatures.length > 0) {
        infoCandidature = stats.candidatures[0].general;
    }

    // 2. Textes par défaut
    let mention = "Information non disponible";
    if (details.mention) {
        mention = details.mention;
    }

    let parcours = "";
    if (details.parcours) {
        parcours = details.parcours;
    }

    let etablissement = "Établissement inconnu";
    if (details.etablissement) {
        etablissement = details.etablissement;
    } else if (details.etablissementLibelle) {
        etablissement = details.etablissementLibelle;
    }

    // 3. Mise à jour HTML
    const elTitre = document.getElementById('disci_master');
    const elParcours = document.getElementById('parcours');
    const elEtab = document.getElementById('nomEtab');
    const elAlt = document.getElementById('alternance');
    const elCol = document.getElementById('col');

    if (elTitre) elTitre.textContent = "Master " + mention;
    if (elParcours) elParcours.textContent = parcours;
    if (elEtab) elEtab.textContent = etablissement;
    
    // Alternance
    let isAlternance = false;
    if (details.alternance === true) {
        isAlternance = true;
    } else if (details.modalites && details.modalites.includes('apprentissage')) {
        isAlternance = true;
    }

    if (elAlt) {
        if (isAlternance === true) {
            elAlt.textContent = "Oui";
        } else {
            elAlt.textContent = "Non";
        }
    }
    
    // Capacité
    if (elCol) {
        if (infoCandidature.capacite) {
            elCol.textContent = infoCandidature.capacite;
        } else {
            elCol.textContent = "N/A";
        }
    }

    // Avertissement si données estimées
    const elStatsTitle = document.getElementById('stats-title');
    if (elStatsTitle) {
        if (sourceInsertion === 'etablissement_global') {
            elStatsTitle.innerHTML = "QUELQUES CHIFFRES <br><span style='font-size:0.6em;color:var(--text-secondary);'>(Données estimées : Moyenne établissement)</span>";
        } else {
            elStatsTitle.textContent = "QUELQUES CHIFFRES";
        }
    }
}

async function updateMapOpenSource(details) {
    if (!details) return;
    
    const divMap = document.getElementById('osm-map');
    if (!divMap) return;

    if (map === null) {
        map = L.map('osm-map').setView([46.603354, 1.888334], 6); 
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    }

    let nom = "";
    if (details.etablissement) nom = details.etablissement;
    else if (details.etablissementLibelle) nom = details.etablissementLibelle;

    let ville = "";
    if (details.ville) ville = details.ville;

    let cp = "";
    if (details.codePostal) cp = details.codePostal;
    
    const query = `${nom} ${ville} ${cp}`.trim();
    
    if (query.length === 0) return;

    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
        const reponse = await fetch(url);
        const resultats = await reponse.json();

        if (resultats && resultats.length > 0) {
            const premierResultat = resultats[0];
            const lat = premierResultat.lat;
            const lon = premierResultat.lon;

            map.setView([lat, lon], 15);

            if (marker) map.removeLayer(marker);
            marker = L.marker([lat, lon]).addTo(map).bindPopup(`<b>${nom}</b><br>${ville}`).openPopup();
        }
    } catch (e) { console.error(e); }
}

function formatDataForCharts(stats) {
    let infoCand = { nb: 0, accept: 0 };
    if (stats.candidatures && stats.candidatures[0] && stats.candidatures[0].general) {
        infoCand = stats.candidatures[0].general;
    }
    
    let infoInsert = {};
    if (stats.insertionsPro && stats.insertionsPro.length > 0) {
        infoInsert = stats.insertionsPro[0];
    }

    // Récupération sécurisée des sous-objets
    let general = {};
    if (infoInsert.general) general = infoInsert.general;

    let salaire = {};
    if (infoInsert.salaire) salaire = infoInsert.salaire;

    let emplois = {};
    if (infoInsert.emplois) emplois = infoInsert.emplois;

    let tauxAdm = 0;
    if (infoCand.nb > 0) {
        tauxAdm = (infoCand.accept / infoCand.nb) * 100;
    }
    
    let salaireMensuel = 0;
    if (salaire.netMedianTempsPlein) {
        salaireMensuel = salaire.netMedianTempsPlein;
    }

    let tauxInsertion = 0;
    if (general.tauxInsertion) tauxInsertion = general.tauxInsertion;

    let tauxEmploi = 0;
    if (general.tauxEmploi) tauxEmploi = general.tauxEmploi;

    let salaireBrut = 0;
    if (salaire.brutAnnuelEstime) salaireBrut = salaire.brutAnnuelEstime;

    let nbCadres = 0;
    if (emplois.cadre) nbCadres = emplois.cadre;

    let nbStable = 0;
    if (emplois.stable) nbStable = emplois.stable;

    let nbTempsPlein = 0;
    if (emplois.tempsPlein) nbTempsPlein = emplois.tempsPlein;

    return {
        pct_accept_master: Math.round(tauxAdm),
        taux_insert_18m: tauxInsertion,
        taux_emploi_18m: tauxEmploi,

        salaire_brut: salaireBrut,
        salaire_median: salaireMensuel * 12, 
        salaire_net: salaireMensuel * 12,

        nb_cadres: nbCadres,
        nb_stable: nbStable,
        nb_temps_plein: nbTempsPlein
    };
}

async function main() {
    initGrapheSalaire(); 
    initGrapheEmploi(); 
    initGrapheAdmission();

    console.log(`Code IFC actuel : ${IFC_ACTUEL}`);

    let donneesGlobales = loadStatsFromCache();

    if (donneesGlobales) {
        if (donneesGlobales.ifc !== IFC_ACTUEL) {
            donneesGlobales = null;
        }
    }

    if (donneesGlobales === null) {
        const details = await getFormationDetails(IFC_ACTUEL);
        
        if (details) {
            let uai = details.etabUai;
            if (!uai) uai = details.uai;

            let secDiscId = details.secDiscId;
            if (!secDiscId) secDiscId = details.sectDiscId;
            if (!secDiscId) secDiscId = details.secteurDisciplinaireId;

            const statsBundle = await getStatsForMaster(IFC_ACTUEL, uai, secDiscId);
            
            donneesGlobales = {
                ifc: IFC_ACTUEL,
                details: details,
                statsRaw: statsBundle,
                formatted: formatDataForCharts(statsBundle)
            };

            saveStatsToCache(donneesGlobales);
        }
    }

    if (donneesGlobales && donneesGlobales.formatted) {
        updateTextElements(donneesGlobales.details, donneesGlobales.statsRaw, donneesGlobales.statsRaw.sourceInsertion);
        updateMapOpenSource(donneesGlobales.details);
        
        updateGrapheSalaire(donneesGlobales.formatted);
        updateGrapheEmploi(donneesGlobales.formatted);
        updateGrapheAdmission(donneesGlobales.formatted);
    } else {
        const title = document.getElementById('disci_master');
        if(title) title.textContent = "Données indisponibles";
    }
}

document.addEventListener('DOMContentLoaded', main);