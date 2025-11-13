const HEATMAP_SETTINGS_MAP = 'HEATMAPSETTINGSKEY';

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
initCacheManagement();