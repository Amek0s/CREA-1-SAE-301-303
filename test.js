/* const URL_BASE_API = 'https://la-lab4ce.univ-lemans.fr/masters-stats/api/rest/'

const ETAB_CARD_TEMPLATE ='ICI METTRE LE CODE HTML DU TEMPLATE DE LA CARTE ETABLISSEMENT'

async function getEtablissements() {
    let response = await fetch('${URL_BASE_API}/etablissements');
    if (!response.ok) {
        throw new Error(`Erreur de récupération serveur`);
    }
    let data = await response.json();
    return data;
}

function createEtablissementCard(etablissement) {
    const col = document.createElement('div');
    col.classList.add('col');
    col.innerHTML = ETAB_CARD_TEMPLATE;
    col.querySelector('h5').innerText = etablissement.nom;
}

async function main() {
    try {
        const etablissements = await getEtablissements();
        console.log('Etablissements récupérés :', etablissements);
    } catch (error) {
        console.error('Erreur lors de la récupération des établissements :', error);
    }
}


