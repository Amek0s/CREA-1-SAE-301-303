// Changez le nom de la clé (par exemple V2) pour invalider l'ancien cache automatiquement
const MASTER_STATS_KEY = 'MASTER_STATS_DATA_V2'; 

const CACHE_DURATION = 1000 * 60 * 60; 
const TIMESTAMP_KEY = 'MASTER_STATS_TIME_V2'; 

let monStockage = window.localStorage;

export function saveStatsToCache(data) {
    if (!monStockage) return;
    monStockage.setItem(MASTER_STATS_KEY, JSON.stringify(data));
    monStockage.setItem(TIMESTAMP_KEY, Date.now().toString());
}

export function loadStatsFromCache() {
    if (!monStockage) return null;

    const rawData = monStockage.getItem(MASTER_STATS_KEY);
    const timestamp = monStockage.getItem(TIMESTAMP_KEY);

    if (!rawData || !timestamp) return null;

    // Vérification de la durée de vie du cache
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > CACHE_DURATION) {
        console.log("Cache expiré");
        return null; 
    }

    try {
        return JSON.parse(rawData);
    } catch (error) {
        console.warn('Données de cache corrompues');
        return null;
    }
}