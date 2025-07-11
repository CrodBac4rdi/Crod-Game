// High-Performance Save Manager for game persistence
window.SaveManager = class SaveManager {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.saveKey = 'cosmicClicker3D_save';
        this.backupKey = 'cosmicClicker3D_backup';
        this.autoSaveInterval = null;
        
        // Performance optimizations
        this.lastSaveData = null;
        this.saveInProgress = false;
        this.compression = true;
        this.maxBackups = 5;
        
        // Save validation
        this.requiredFields = ['version', 'timestamp', 'state'];
        this.maxSaveSize = 10 * 1024 * 1024; // 10MB limit
    }
    
    // High-performance save with compression and backups
    async save(gameState) {
        if (this.saveInProgress) {
            console.warn('Save already in progress, skipping');
            return false;
        }
        
        this.saveInProgress = true;
        const startTime = performance.now();
        
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
            
            // Check if data has changed
            const dataString = JSON.stringify(saveData);
            if (this.lastSaveData === dataString) {
                console.log('No changes detected, skipping save');
                this.saveInProgress = false;
                return true;
            }
            
            // Validate save data
            if (!this.validateSaveData(saveData)) {
                throw new Error('Invalid save data');
            }
            
            // Create backup of current save
            await this.createBackup();
            
            // Compress data if enabled
            const finalData = this.compression ? this.compressData(dataString) : dataString;
            
            // Check size limit
            if (finalData.length > this.maxSaveSize) {
                throw new Error('Save data too large');
            }
            
            // Save to localStorage
            localStorage.setItem(this.saveKey, finalData);
            this.lastSaveData = dataString;
            
            const saveTime = performance.now() - startTime;
            console.log(`Save completed in ${saveTime.toFixed(2)}ms`);
            
            this.eventSystem.emit(GameEvents.GAME_SAVED, { saveTime });
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
        } finally {
            this.saveInProgress = false;
        }
    }
    
    // High-performance load with decompression and fallback
    async load() {
        const startTime = performance.now();
        
        try {
            let saveDataStr = localStorage.getItem(this.saveKey);
            if (!saveDataStr) return null;
            
            // Try to decompress if compressed
            if (this.compression && this.isCompressed(saveDataStr)) {
                saveDataStr = this.decompressData(saveDataStr);
            }
            
            const saveData = JSON.parse(saveDataStr);
            
            // Validate save data
            if (!this.validateSaveData(saveData)) {
                console.warn('Invalid save data, trying backup');
                return await this.loadBackup();
            }
            
            // Version check
            if (saveData.version !== '1.0.0') {
                console.warn('Save version mismatch, may need migration');
            }
            
            this.lastSaveData = JSON.stringify(saveData);
            
            const loadTime = performance.now() - startTime;
            console.log(`Load completed in ${loadTime.toFixed(2)}ms`);
            
            this.eventSystem.emit(GameEvents.GAME_LOADED, { loadTime });
            return saveData;
            
        } catch (error) {
            console.error('Failed to load game:', error);
            
            // Try to load from backup
            const backupData = await this.loadBackup();
            if (backupData) {
                this.eventSystem.emit(GameEvents.NOTIFICATION, {
                    text: 'Loaded from backup!',
                    type: 'warning'
                });
                return backupData;
            }
            
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
            
            // Validate imported data
            if (!this.validateSaveData(parsed)) {
                throw new Error('Invalid save data format');
            }
            
            localStorage.setItem(this.saveKey, saveData);
            return true;
        } catch (error) {
            console.error('Failed to import save:', error);
            return false;
        }
    }
    
    // Validation methods
    validateSaveData(saveData) {
        if (!saveData || typeof saveData !== 'object') {
            return false;
        }
        
        // Check required fields
        for (const field of this.requiredFields) {
            if (!(field in saveData)) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }
        
        // Validate state object
        if (!saveData.state || typeof saveData.state !== 'object') {
            console.error('Invalid state object');
            return false;
        }
        
        // Check for reasonable values
        if (saveData.state.energy < 0 || saveData.state.level < 1) {
            console.error('Invalid game state values');
            return false;
        }
        
        return true;
    }
    
    // Compression methods (simple LZ-like compression)
    compressData(data) {
        try {
            // Simple compression using btoa and deflate-like algorithm
            const compressed = this.simpleCompress(data);
            return 'COMPRESSED:' + btoa(compressed);
        } catch (error) {
            console.warn('Compression failed, using uncompressed data');
            return data;
        }
    }
    
    decompressData(data) {
        try {
            if (!this.isCompressed(data)) {
                return data;
            }
            
            const compressed = atob(data.substring(11)); // Remove 'COMPRESSED:' prefix
            return this.simpleDecompress(compressed);
        } catch (error) {
            console.error('Decompression failed:', error);
            throw error;
        }
    }
    
    isCompressed(data) {
        return typeof data === 'string' && data.startsWith('COMPRESSED:');
    }
    
    // Simple compression algorithm
    simpleCompress(data) {
        const dictionary = new Map();
        let dictSize = 256;
        let result = [];
        let w = '';
        
        for (let i = 0; i < dictSize; i++) {
            dictionary.set(String.fromCharCode(i), i);
        }
        
        for (let i = 0; i < data.length; i++) {
            const c = data[i];
            const wc = w + c;
            
            if (dictionary.has(wc)) {
                w = wc;
            } else {
                result.push(dictionary.get(w));
                dictionary.set(wc, dictSize++);
                w = c;
            }
        }
        
        if (w) {
            result.push(dictionary.get(w));
        }
        
        return result.join(',');
    }
    
    // Simple decompression algorithm
    simpleDecompress(data) {
        const dictionary = [];
        let dictSize = 256;
        let result = '';
        let w = '';
        
        for (let i = 0; i < dictSize; i++) {
            dictionary[i] = String.fromCharCode(i);
        }
        
        const codes = data.split(',').map(Number);
        
        for (let i = 0; i < codes.length; i++) {
            const k = codes[i];
            let entry = '';
            
            if (dictionary[k]) {
                entry = dictionary[k];
            } else if (k === dictSize) {
                entry = w + w[0];
            }
            
            result += entry;
            
            if (w) {
                dictionary[dictSize++] = w + entry[0];
            }
            
            w = entry;
        }
        
        return result;
    }
    
    // Backup methods
    async createBackup() {
        try {
            const currentSave = localStorage.getItem(this.saveKey);
            if (!currentSave) return;
            
            // Get existing backups
            const backups = this.getBackups();
            
            // Add current save to backups
            backups.unshift({
                timestamp: Date.now(),
                data: currentSave
            });
            
            // Keep only max backups
            if (backups.length > this.maxBackups) {
                backups.splice(this.maxBackups);
            }
            
            // Save backups
            localStorage.setItem(this.backupKey, JSON.stringify(backups));
            
        } catch (error) {
            console.error('Failed to create backup:', error);
        }
    }
    
    async loadBackup() {
        try {
            const backups = this.getBackups();
            if (backups.length === 0) return null;
            
            // Try each backup until we find a valid one
            for (const backup of backups) {
                try {
                    let saveDataStr = backup.data;
                    
                    // Try to decompress if compressed
                    if (this.compression && this.isCompressed(saveDataStr)) {
                        saveDataStr = this.decompressData(saveDataStr);
                    }
                    
                    const saveData = JSON.parse(saveDataStr);
                    
                    if (this.validateSaveData(saveData)) {
                        console.log(`Loaded backup from ${new Date(backup.timestamp).toLocaleString()}`);
                        return saveData;
                    }
                } catch (error) {
                    console.warn('Invalid backup, trying next one');
                }
            }
            
            return null;
        } catch (error) {
            console.error('Failed to load backup:', error);
            return null;
        }
    }
    
    getBackups() {
        try {
            const backupsStr = localStorage.getItem(this.backupKey);
            return backupsStr ? JSON.parse(backupsStr) : [];
        } catch (error) {
            console.error('Failed to get backups:', error);
            return [];
        }
    }
    
    // Performance methods
    getStorageUsage() {
        const saveData = localStorage.getItem(this.saveKey);
        const backupData = localStorage.getItem(this.backupKey);
        
        return {
            saveSize: saveData ? saveData.length : 0,
            backupSize: backupData ? backupData.length : 0,
            totalSize: (saveData?.length || 0) + (backupData?.length || 0),
            compressionRatio: this.lastSaveData ? 
                (this.lastSaveData.length / (saveData?.length || 1)) : 1
        };
    }
    
    // Debug methods
    debugSaveData() {
        const usage = this.getStorageUsage();
        const backups = this.getBackups();
        
        console.log('Save Manager Debug Info:');
        console.log('Storage Usage:', usage);
        console.log('Backups:', backups.length);
        console.log('Compression Enabled:', this.compression);
        console.log('Save in Progress:', this.saveInProgress);
    }
};