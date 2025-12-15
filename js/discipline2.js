import { getFormationsBySecteur } from "./RESTManagement.js";

async function init() {
    const container = document.querySelector('.boiteNomMaster');
    const title = document.querySelector('#subtitle-secteur');
    
    const params = new URLSearchParams(window.location.search);
    const sdid = params.get('sdid');
    const nomSecteur = params.get('nom');

    if (!sdid) {
        if (title) title.textContent = "Erreur : Aucun secteur sélectionné";
        if (container) container.innerHTML = '<div style="text-align:center"><a href="discipline.html" class="button">Retour aux disciplines</a></div>';
        return;
    }

    if (title) {
        if (nomSecteur) {
            title.textContent = `Masters en ${nomSecteur}`;
        } else {
            title.textContent = "Liste des Masters";
        }
    }

    if (container) container.innerHTML = "<p style='text-align:center;width:100%'>Chargement des formations...</p>";

    const formations = await getFormationsBySecteur(sdid);

    // Suppression des doublons
    const mastersUniques = [];
    const nomsDejaVus = []; 

    for (let i = 0; i < formations.length; i++) {
        const formation = formations[i];
        
        if (nomsDejaVus.includes(formation.mention) === false) {
            nomsDejaVus.push(formation.mention);
            mastersUniques.push(formation);
        }
    }

    mastersUniques.sort(function(a, b) {
        return a.mention.localeCompare(b.mention);
    });

    if (container) {
        container.innerHTML = '';
        
        if (mastersUniques.length === 0) {
            container.innerHTML = "<p style='text-align:center;width:100%'>Aucun master trouvé pour ce secteur.</p>";
            return;
        }

        mastersUniques.forEach(m => {
            const a = document.createElement('a');
            
            a.href = `index.html?ifc=${m.ifc}`;
            a.className = 'nomMaster';
            a.role = 'button';
            
            let nomEtablissement = "Établissement non spécifié";
            if (m.etablissementLibelle) {
                nomEtablissement = m.etablissementLibelle;
            } else if (m.etablissement) {
                nomEtablissement = m.etablissement;
            }

            a.innerHTML = `
                <div style="width:100%">
                    Master ${m.mention}
                    <br>
                    <span style="font-size:0.85em; font-weight:normal; color: var(--text-secondary); display:block; margin-top:4px;">
                        ${nomEtablissement}
                    </span>
                </div>
            `;
            container.appendChild(a);
        });
    }
}

document.addEventListener('DOMContentLoaded', init);