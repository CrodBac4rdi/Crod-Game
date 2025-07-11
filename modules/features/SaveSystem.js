// Save System Module
window.SaveSystem = (() => {
    const SAVE_KEY = 'devlearn_save';
    
    const save = () => {
        try {
            const state = StateManager.getState();
            const saveData = {
                version: CONSTANTS.GAME.VERSION,
                timestamp: Date.now(),
                state
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            return false;
        }
    };
    
    const load = () => {
        try {
            const saveData = localStorage.getItem(SAVE_KEY);
            if (!saveData) return false;
            
            const parsed = JSON.parse(saveData);
            // Version check could go here
            
            return parsed.state;
        } catch (e) {
            console.error('Load failed:', e);
            return false;
        }
    };
    
    const deleteSave = () => {
        localStorage.removeItem(SAVE_KEY);
    };
    
    const exportSave = () => {
        const saveData = localStorage.getItem(SAVE_KEY);
        if (!saveData) return null;
        
        return btoa(saveData);
    };
    
    const importSave = (data) => {
        try {
            const decoded = atob(data);
            const parsed = JSON.parse(decoded);
            localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    };
    
    return { save, load, deleteSave, exportSave, importSave };
})();