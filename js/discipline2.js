import { getFormationsBySecteur } from "./RESTManagement.js";

async function init() {
    const container = document.querySelector('.boiteNomMaster');
    const title = document.querySelector('#subtitle-secteur');
    
    // Récupération des paramètres URL
    const params = new URLSearchParams(window.location.search);
    const sdid = params.get('sdid');
    const nomSecteur = params.get('nom');

    if (!sdid) {
        if(title) title.textContent = "Erreur : Aucun secteur sélectionné";
        if(container) container.innerHTML = '<div style="text-align:center"><a href="discipline.html" class="button">Retour aux disciplines</a></div>';
        return;
    }

    if(title) title.textContent = nomSecteur ? `Masters en ${nomSecteur}` : "Liste des Masters";
    if(container) container.innerHTML = "<p style='text-align:center;width:100%'>Chargement des formations...</p>";

    // Appel API filtré par secteur (beaucoup plus rapide)
    const formations = await getFormationsBySecteur(sdid);

    // On dédoublonne les masters par "Mention" pour l'affichage liste
    const mentionsVues = new Set();
    const mastersUniques = [];
    
    formations.forEach(f => {
        if (!mentionsVues.has(f.mention)) {
            mentionsVues.add(f.mention);
            mastersUniques.push(f);
        }
    });

    mastersUniques.sort((a,b) => a.mention.localeCompare(b.mention));

    if (container) {
        container.innerHTML = '';
        
        if(mastersUniques.length === 0) {
            container.innerHTML = "<p style='text-align:center;width:100%'>Aucun master trouvé pour ce secteur.</p>";
            return;
        }

        mastersUniques.forEach(m => {
            const a = document.createElement('a');
            // Lien vers la page détail avec l'IFC
            a.href = `index.html?ifc=${m.ifc}`;
            a.className = 'nomMaster';
            a.role = 'button';
            a.innerHTML = `
                <div style="width:100%">
                    Master ${m.mention}
                    <br>
                    <span style="font-size:0.85em; font-weight:normal; color: var(--text-secondary); display:block; margin-top:4px;">
                        ${m.etablissementLibelle || m.etablissement || "Établissement non spécifié"}
                    </span>
                </div>
            `;
            container.appendChild(a);
        });
    }
}

document.addEventListener('DOMContentLoaded', init);