import { getFormationDetails, getStatsForMaster } from "./RESTManagement.js";
import { saveStatsToCache, loadStatsFromCache } from "./cacheManagement.js";
import { initGrapheSalaire, updateGrapheSalaire } from "./grapheSalaire.js";
import { initGrapheEmploi, updateGrapheEmploi } from "./grapheEmploi.js"; 
import { initGrapheAdmission, updateGrapheAdmission } from "./grapheAdmission.js"; 


let maCarte = null;
let monMarqueur = null;

const parametresUrl = new URLSearchParams(window.location.search);
let CODE_IFC = parametresUrl.get('ifc');

if (CODE_IFC === null) {
    console.warn("Pas d'IFC dans l'url, utilisation d'un code par défaut.");
    CODE_IFC = '1302436S61PT';
}

function mettreAJourTextes(details, stats, sourceDonnees) {
    if (!details) return; 

    //Titre du Master 
    const titreElement = document.getElementById('disci_master');
    if (titreElement) {
        if (details.mention) {
            titreElement.textContent = "Master " + details.mention;
        } else {
            titreElement.textContent = "Master inconnu";
        }
    }

    //Parcours 
    const parcoursElement = document.getElementById('parcours');
    if (parcoursElement) {
        parcoursElement.textContent = details.parcours || "Parcours général";
    }

    //Nom de l'établissement
    const etabElement = document.getElementById('nomEtab');
    if (etabElement) {
        let nom = details.etablissementLibelle;
        if (!nom) {
            nom = details.etablissement;
        }
        if (!nom) {
            nom = "Établissement non spécifié";
        }
        etabElement.textContent = nom;
    }

    //Alternance
    const altElement = document.getElementById('alternance');
    if (altElement) {
        let texteAlternance = "Non";
        
        if (details.alternance === true) {
            texteAlternance = "Oui";
        } else if (details.modalites && details.modalites.includes('apprentissage')) {
            texteAlternance = "Oui";
        }
        
        altElement.textContent = texteAlternance;
    }

    //Capacité d'accueil
    const colElement = document.getElementById('col');
    if (colElement) {
        let capacite = "N/A";
        
        // On vérifie que les données existent avant de chercher dedans
        if (stats.candidatures && stats.candidatures.length > 0) {
            if (stats.candidatures[0].general) {
                capacite = stats.candidatures[0].general.capacite;
            }
        }
        colElement.textContent = capacite;
    }

    
    const titreStats = document.getElementById('stats-title');
    if (titreStats) {
        if (sourceDonnees === 'etablissement_global') {
            titreStats.innerHTML = "QUELQUES CHIFFRES <br><span style='font-size:0.6em;color:var(--text-secondary);'>(Moyenne de l'établissement - Données précises indisponibles)</span>";
        } else {
            titreStats.textContent = "QUELQUES CHIFFRES";
        }
    }
}

//fonction de la carte corrigee par gemini
async function chercherPosition(recherche) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(recherche)}&limit=1`;
        const reponse = await fetch(url);
        const resultats = await reponse.json();
        
        if (resultats.length > 0) {
            return resultats[0]; // On retourne le premier résultat trouvé
        } else {
            return null; // Rien trouvé
        }
    } catch (erreur) {
        console.error("Erreur de recherche GPS :", erreur);
        return null;
    }
}

async function mettreAJourCarte(details) {
    if (!details) return;

    // Si la carte n'existe pas encore, on la crée
    if (maCarte === null) {
        maCarte = L.map('osm-map').setView([46.603354, 1.888334], 5); // Vue France
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(maCarte);
    }

    // Préparation des informations de recherche
    let nom = details.etablissementLibelle || details.etablissement || "";
    let ville = details.ville || "";
    let cp = details.codePostal || "";

    //Recherche précise (Nom + Ville + Code Postal)
    let requete = `${nom} ${ville} ${cp}`.trim();
    let position = await chercherPosition(requete);

    //Si on a rien trouvén cherche juste la ville
    if (position === null && ville !== "") {
        console.log("Adresse précise non trouvée, recherche de la ville uniquement...");
        position = await chercherPosition(ville);
    }

    // Si on a trouvé une position on place le marqueur
    if (position !== null) {
        const lat = position.lat;
        const lon = position.lon;

        // On centre la carte
        maCarte.setView([lat, lon], 14);

        // Si un marqueur existe déjà, on l'enlève pour mettre le nouveau
        if (monMarqueur) {
            maCarte.removeLayer(monMarqueur);
        }

        monMarqueur = L.marker([lat, lon]).addTo(maCarte)
            .bindPopup(`<b>${nom}</b><br>${ville}`)
            .openPopup();
    }
}

// 4. Préparation des données pour les graphiques
function formaterDonneesPourGraphiques(stats) {
    // je met toutes les valeurs par defaut à 0
    let resultat = {
        pct_accept_master: 0,
        taux_insert_18m: 0,
        taux_emploi_18m: 0,
        salaire_brut: 0,
        salaire_median: 0, 
        salaire_net: 0,
        nb_cadres: 0,
        nb_stable: 0,
        nb_temps_plein: 0
    };

    if (stats.candidatures && stats.candidatures.length > 0) {
        const info = stats.candidatures[0].general;
        if (info && info.nb > 0) {
            // Calcul du pourcentage : (Admis / Total) * 100
            resultat.pct_accept_master = Math.round((info.accept / info.nb) * 100);
        }
    }
    
    // Récupération Insertion Professionnelle
    if (stats.insertionsPro && stats.insertionsPro.length > 0) {
        const insertion = stats.insertionsPro[0];
        
        // Partie Générale
        if (insertion.general) {
            resultat.taux_insert_18m = insertion.general.tauxInsertion || 0;
            resultat.taux_emploi_18m = insertion.general.tauxEmploi || 0;
        }

        // Partie Salaire
        if (insertion.salaire) {
            const salaireMensuel = insertion.salaire.netMedianTempsPlein || 0;
            resultat.salaire_brut = insertion.salaire.brutAnnuelEstime || 0;
            resultat.salaire_median = salaireMensuel * 12; // Annuel
            resultat.salaire_net = salaireMensuel * 12;    // Annuel
        }

        // Partie Emplois (Cadre, Stable...)
        if (insertion.emplois) {
            resultat.nb_cadres = insertion.emplois.cadre || 0;
            resultat.nb_stable = insertion.emplois.stable || 0;
            resultat.nb_temps_plein = insertion.emplois.tempsPlein || 0;
        }
    }

    return resultat;
}

async function main() {
    initGrapheSalaire(); 
    initGrapheEmploi(); 
    initGrapheAdmission();

    console.log(`Démarrage avec le code IFC : ${CODE_IFC}`);

    let mesDonnees = loadStatsFromCache();

    // Si on a des données en cache mais que ce n'est pas le bon Master (IFC différent), on oublie le cache
    if (mesDonnees) {
        if (mesDonnees.ifc !== CODE_IFC) {
            mesDonnees = null;
        }
    }

    // Si pas de données, on va les chercher sur l'API
    if (mesDonnees === null) {
        const details = await getFormationDetails(CODE_IFC);
        
        if (details) {
            let uai = details.etabUai || details.uai;
            
            // On récupère l'identifiant du secteur disciplinaire et on s'assure que c'est un nombre
            let secteurId = details.secDiscId || details.sectDiscId || details.secteurDisciplinaireId;
            if (secteurId) {
                secteurId = parseInt(secteurId);
            }
            const lesStats = await getStatsForMaster(CODE_IFC, uai, secteurId);
            
            mesDonnees = {
                ifc: CODE_IFC,
                details: details,
                statsRaw: lesStats,
                formatted: formaterDonneesPourGraphiques(lesStats)
            };
            
            saveStatsToCache(mesDonnees);
        } else {
            console.error("Impossible de récupérer les détails de la formation");
        }
    }

    if (mesDonnees && mesDonnees.details) {
        mettreAJourTextes(mesDonnees.details, mesDonnees.statsRaw, mesDonnees.statsRaw.sourceInsertion);
        mettreAJourCarte(mesDonnees.details);
        
        updateGrapheSalaire(mesDonnees.formatted);
        updateGrapheEmploi(mesDonnees.formatted);
        updateGrapheAdmission(mesDonnees.formatted);
    } else {
        const titre = document.getElementById('disci_master');
        if(titre) titre.textContent = "Données indisponibles (Erreur technique)";
    }
}

document.addEventListener('DOMContentLoaded', main);