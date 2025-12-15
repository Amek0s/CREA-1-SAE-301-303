// Changement de version pour invalider le cache buggé précédent
const MASTER_STATS_KEY = 'MASTER_STATS_DATA_V4'; 

const CACHE_DURATION = 1000 * 60 * 60; 
const TIMESTAMP_KEY = 'MASTER_STATS_TIME_V4'; 

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

    const age = Date.now() - parseInt(timestamp, 10);
    if (age > CACHE_DURATION) {
        return null; 
    }

    try {
        return JSON.parse(rawData);
    } catch (error) {
        return null;
    }
}