// Save Manager for game persistence
window.SaveManager = class SaveManager {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.saveKey = 'cosmicClicker3D_save';
        this.autoSaveInterval = null;
    }
    
    // Save game state
    save(gameState) {
        try {
            const saveData = {
                version: '1.0.0',
                timestamp: Date.now(),
                state: {
                    energy: gameState.energy,
                    crystals: gameState.crystals,
                    level: gameState.level,
                    xp: gameState.xp,
                    xpRequired: gameState.xpRequired,
                    clickPower: gameState.clickPower,
                    totalClicks: gameState.totalClicks,
                    totalEnergyEarned: gameState.totalEnergyEarned,
                    prestigeCount: gameState.prestigeCount,
                    prestigeBonus: gameState.prestigeBonus,
                    generators: gameState.generators,
                    clickUpgrades: gameState.clickUpgrades,
                    achievements: gameState.achievements,
                    stats: gameState.stats,
                    lastSaveTime: gameState.lastSaveTime,
                    playTime: gameState.playTime
                },
                settings: {
                    soundEnabled: gameState.soundEnabled,
                    particlesEnabled: gameState.particlesEnabled,
                    graphicsQuality: gameState.graphicsQuality,
                    autoSave: gameState.autoSave
                }
            };
            
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            this.eventSystem.emit(GameEvents.GAME_SAVED);
            this.eventSystem.emit(GameEvents.NOTIFICATION, {
                text: 'Game Saved!',
                type: 'success'
            });
            
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            this.eventSystem.emit(GameEvents.NOTIFICATION, {
                text: 'Failed to save game!',
                type: 'error'
            });
            return false;
        }
    }
    
    // Load game state
    load() {
        try {
            const saveDataStr = localStorage.getItem(this.saveKey);
            if (!saveDataStr) return null;
            
            const saveData = JSON.parse(saveDataStr);
            
            // Version check
            if (saveData.version !== '1.0.0') {
                console.warn('Save version mismatch, may need migration');
            }
            
            this.eventSystem.emit(GameEvents.GAME_LOADED);
            return saveData;
        } catch (error) {
            console.error('Failed to load game:', error);
            this.eventSystem.emit(GameEvents.NOTIFICATION, {
                text: 'Failed to load save data!',
                type: 'error'
            });
            return null;
        }
    }
    
    // Delete save data
    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            this.eventSystem.emit(GameEvents.NOTIFICATION, {
                text: 'Save data deleted!',
                type: 'info'
            });
            return true;
        } catch (error) {
            console.error('Failed to delete save:', error);
            return false;
        }
    }
    
    // Check if save exists
    hasSave() {
        return localStorage.getItem(this.saveKey) !== null;
    }
    
    // Enable auto-save
    enableAutoSave(gameState, interval = GameConfig.SAVE_INTERVAL) {
        this.disableAutoSave();
        this.autoSaveInterval = setInterval(() => {
            this.save(gameState);
        }, interval);
    }
    
    // Disable auto-save
    disableAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
    
    // Export save as string
    exportSave() {
        const saveData = localStorage.getItem(this.saveKey);
        if (!saveData) return null;
        
        return btoa(saveData);
    }
    
    // Import save from string
    importSave(encodedData) {
        try {
            const saveData = atob(encodedData);
            const parsed = JSON.parse(saveData); // Validate JSON
            localStorage.setItem(this.saveKey, saveData);
            return true;
        } catch (error) {
            console.error('Failed to import save:', error);
            return false;
        }
    }
};