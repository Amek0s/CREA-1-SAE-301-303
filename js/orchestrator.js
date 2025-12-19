import { getFormationDetails, getStatsForMaster } from "./RESTManagement.js";
import { saveStatsToCache, loadStatsFromCache } from "./cacheManagement.js";
import { initGrapheSalaire, updateGrapheSalaire } from "./grapheSalaire.js";
import { initGrapheEmploi, updateGrapheEmploi } from "./grapheEmploi.js";
import { initGrapheAdmission, updateGrapheAdmission } from "./grapheAdmission.js";
import { initGrapheOrigine, updateGrapheOrigine } from "./grapheOrigine.js";
import { initGrapheInsertion, updateGrapheInsertion } from "./grapheInsertion.js";

let maCarte = null;
let monMarqueur = null;

const parametresUrl = new URLSearchParams(window.location.search);
let CODE_IFC = parametresUrl.get('ifc');

if (CODE_IFC === null) {
    CODE_IFC = '1501654H17EC';
}

function mettreAJourTextes(details, stats, sourceDonnees) {
    if (!details) return;

    const titreElement = document.getElementById('disci_master');
    if (titreElement) {
        titreElement.textContent = details.mention ? "Master " + details.mention : "Master inconnu";
    }

    const parcoursElement = document.getElementById('parcours');
    if (parcoursElement) {
        parcoursElement.textContent = details.parcours || "Parcours général";
    }

    const etabElement = document.getElementById('nomEtab');
    if (etabElement) {
        let nom = details.etablissementLibelle || details.etablissement || "Établissement non spécifié";
        etabElement.textContent = nom;
    }

    const btnSite = document.getElementById('btn-website');
    if (btnSite) {
        if (details.urlWeb) {
            btnSite.href = details.urlWeb;
        } else {
            const nomEtab = details.etablissementLibelle || "";
            const ville = details.ville || "";
            const mention = details.mention || "";
            
            const recherche = "Université " + nomEtab + " " + ville + " Master " + mention;
            btnSite.href = "https://www.google.com/search?q=" + encodeURIComponent(recherche);
        }
    }

    const logUniv = document.getElementById("logo-univ");
    if (logUniv) {
        const uai = details.etabUai || details.uai;
        if (uai) {
            logUniv.src = "https://monmaster.gouv.fr/api/logo/" + uai;
            logUniv.onerror = function() {
                this.src = './images/icone_maison.svg';
            };
        } else {
            logUniv.src = './images/icone_maison.svg';
        }
    }

    const altElement = document.getElementById('alternance');
    if (altElement) {
        let estAlternance = details.alternance === true;
        
        if (details.modalites && details.modalites.includes('apprentissage')) {
            estAlternance = true;
        }
        
        altElement.textContent = estAlternance ? "Oui" : "Non";
    }

    let capacite = 0;
    let nbCandidats = 0;

    if (stats.candidatures && stats.candidatures.length > 0) {
        const recent = stats.candidatures[0];
        if (recent.general) {
            capacite = recent.general.capacite || 0;
            nbCandidats = recent.general.nb || 0;
        }
    }

    const colElement = document.getElementById('col');
    if (colElement) {
        colElement.textContent = capacite > 0 ? capacite : "N/A";
    }

    const selElement = document.getElementById('selectivite');
    const selDetailElement = document.getElementById('selectivite-detail');

    if (selElement && selDetailElement) {
        if (capacite > 0 && nbCandidats > 0) {
            const ratio = Math.round(nbCandidats / capacite);
            
            if (ratio < 2) {
                selElement.textContent = "Faible";
                selDetailElement.textContent = "Moins de 2 candidats par place";
            } else {
                selElement.textContent = "1 place pour " + ratio + " personnes !";
                selDetailElement.textContent = nbCandidats + " candidats pour " + capacite + " places";
            }
        } else {
            selElement.textContent = "--";
            selDetailElement.textContent = "Données insuffisantes";
        }
    }

    const titreStats = document.getElementById('stats-title');
    if (titreStats && sourceDonnees === 'etablissement_global') {
        titreStats.innerHTML = "QUELQUES CHIFFRES <br><span style='font-size:0.6em;color:var(--text-secondary);'>(Moyenne de l'établissement - Données précises indisponibles)</span>";
    }
}

async function mettreAJourCarte(details) {
    if (!details) return;

    if (maCarte === null) {
        maCarte = L.map('osm-map').setView([46.603354, 1.888334], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(maCarte);
    }

    let nom = details.etablissementLibelle || details.etablissement || "";
    let ville = details.ville || "";
    let cp = details.codePostal || "";

    const recherche = nom + " " + ville + " " + cp;
    const url = "https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(recherche) + "&limit=1";

    try {
        const reponse = await fetch(url);
        const resultats = await reponse.json();

        if (resultats.length > 0) {
            const lat = resultats[0].lat;
            const lon = resultats[0].lon;

            maCarte.setView([lat, lon], 14);

            if (monMarqueur) maCarte.removeLayer(monMarqueur);
            monMarqueur = L.marker([lat, lon]).addTo(maCarte)
                .bindPopup("<b>" + nom + "</b><br>" + ville)
                .openPopup();
        }
    } catch (erreur) {
        console.error("Erreur carte :", erreur);
    }
}

function formaterDonneesPourGraphiques(stats) {
    let resultat = {
        pct_accept_master: 0, taux_boursiers: 0, taux_insert_18m: 0, taux_emploi_18m: 0,
        salaire_brut: 0, salaire_net: 0,
        nb_cadres: 0, nb_stable: 0, nb_temps_plein: 0,
        origine_lg3: 0, origine_lp3: 0, origine_master: 0, origine_autre: 0, origine_non_inscrit: 0
    };

    if (stats.candidatures && stats.candidatures.length > 0) {
        const cand = stats.candidatures[0];

        if (cand.experience) {
            if (cand.experience.lg3) resultat.origine_lg3 = cand.experience.lg3.accept;
            if (cand.experience.lp3) resultat.origine_lp3 = cand.experience.lp3.accept;
            if (cand.experience.master) resultat.origine_master = cand.experience.master.accept;
            if (cand.experience.autre) resultat.origine_autre = cand.experience.autre.accept;
            if (cand.experience.noninscrit) resultat.origine_non_inscrit = cand.experience.noninscrit.accept;
        }

        if (cand.general && cand.general.nb > 0) {
            resultat.pct_accept_master = Math.round((cand.general.accept / cand.general.nb) * 100);
        }
    }

    if (stats.insertionsPro && stats.insertionsPro.length > 0) {
        const insertion = stats.insertionsPro[0];

        if (insertion.general) {
            resultat.taux_insert_18m = insertion.general.tauxInsertion || 0;
            resultat.taux_emploi_18m = insertion.general.tauxEmploi || 0;
        }

        if (insertion.emplois) {
            resultat.nb_cadres = insertion.emplois.cadre || 0;
            resultat.nb_stable = insertion.emplois.stable || 0;
            resultat.nb_temps_plein = insertion.emplois.tempsPlein || 0;

            if (insertion.emplois.boursier !== undefined) {
                resultat.taux_boursiers = Math.round(insertion.emplois.boursier);
            }
        }

        if (insertion.salaire) {
            const salaireMensuel = insertion.salaire.netMedianTempsPlein || 0;
            resultat.salaire_brut = insertion.salaire.brutAnnuelEstime || 0;
            resultat.salaire_net = salaireMensuel * 12;
        }
    }

    return resultat;
}

async function main() {
    initGrapheSalaire();
    initGrapheEmploi();
    initGrapheAdmission();
    initGrapheOrigine();
    initGrapheInsertion();

    // Vérification du cache
    const dataCache = loadStatsFromCache();
    if (dataCache && dataCache.ifc === CODE_IFC) {
        const { details, stats, formatted } = dataCache;

        mettreAJourTextes(details, stats, stats.sourceInsertion);
        mettreAJourCarte(details);

        updateGrapheSalaire(formatted);
        updateGrapheEmploi(formatted);
        updateGrapheAdmission(formatted);
        updateGrapheOrigine(formatted);
        updateGrapheInsertion(formatted.pct_accept_master);
        return;
    }

    // Chargement API si pas de cache
    const details = await getFormationDetails(CODE_IFC);

    if (details) {
        const uai = details.etabUai || details.uai;
        const secteurId = details.secDiscId || details.secteurDisciplinaireId;

        const lesStats = await getStatsForMaster(CODE_IFC, uai, secteurId);
        const donneesPropres = formaterDonneesPourGraphiques(lesStats);

        saveStatsToCache({
            ifc: CODE_IFC,
            details: details,
            stats: lesStats,
            formatted: donneesPropres
        });

        mettreAJourTextes(details, lesStats, lesStats.sourceInsertion);
        mettreAJourCarte(details);

        updateGrapheSalaire(donneesPropres);
        updateGrapheEmploi(donneesPropres);
        updateGrapheAdmission(donneesPropres);
        updateGrapheOrigine(donneesPropres);
        updateGrapheInsertion(donneesPropres.pct_accept_master);

    } else {
        const titre = document.getElementById('disci_master');
        if (titre) titre.textContent = "Erreur : Données indisponibles";
    }
}

document.addEventListener('DOMContentLoaded', main);