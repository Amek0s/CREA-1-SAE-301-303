const CLE_STOCKAGE = 'MASTER_STATS_DATA'; 
const DUREE_CACHE = 1000 * 60 * 60; // 1 heure
const CLE_TEMPS = 'MASTER_STATS_TIME'; 

let monStockage = window.localStorage;

export function saveStatsToCache(data) {
    if (!monStockage) return;
    monStockage.setItem(CLE_STOCKAGE, JSON.stringify(data));
    monStockage.setItem(CLE_TEMPS, Date.now().toString());
}

export function loadStatsFromCache() {
    if (!monStockage) return null;

    const texteDonnees = monStockage.getItem(CLE_STOCKAGE);
    const texteTemps = monStockage.getItem(CLE_TEMPS);

    if (!texteDonnees || !texteTemps) return null;

    const age = Date.now() - parseInt(texteTemps, 10);
    
    if (age > DUREE_CACHE) {
        // Si les données sont trop vieilles on ignore
        return null; 
    }

    try {
        return JSON.parse(texteDonnees);
    } catch (error) {
        return null;
    }
}