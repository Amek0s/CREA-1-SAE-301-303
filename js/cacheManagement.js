/* const HEATMAP_SETTINGS_MAP = 'HEATMAPSETTINGSKEY';

let monStockage = window.localStorage;

export function saveHeatmapSettings(settings) {
    if (!monStockage){
        return;
    }
    monStockage.setItem(HEATMAP_SETTINGS_MAP, JSON.stringify(setting));
}

export function loadHeatmapSettings() {
    if (!monStockage){
        return null;
    }
    const rawData = monStockage.getItem(HEATMAP_SETTINGS_MAP);
    if (rawData){
        try {
            return JSON.parse(rawData);
        } catch (error){
            console.warn('Données invalides dans le st');
            return null;
        }
        
        
    }else{
        return null;
    }
}

function initCacheManagement(){
    try{
        const testKey = '_STORAGE_TEST';
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        monStockage = window.localStorage;
    }catch (error){
        console.warn('LocalStorage indisponible');
        monStockage =  null;
    }
}
initCacheManagement(); */

const MASTER_STATS_KEY = 'MASTER_STATS_DATA';
const CACHE_DURATION = 1000 * 60 * 60; // 1 heure de validité (exemple)
const TIMESTAMP_KEY = 'MASTER_STATS_TIME';

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

    // Vérification optionnelle de la durée de vie du cache
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