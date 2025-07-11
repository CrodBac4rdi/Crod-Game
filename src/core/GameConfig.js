// High-Performance Dynamic Game Configuration Manager
window.GameConfigManager = class GameConfigManager {
    constructor() {
        // Performance optimizations
        this.configCache = new Map();
        this.lazyLoadedConfigs = new Map();
        this.configVersion = '1.0.0';
        this.isDirty = false;
        
        // Initialize configuration
        this.initializeConfigs();
    }
    
    initializeConfigs() {
        // Pre-cache frequently accessed configs
        this.configCache.set('core', this.getCoreConfig());
        this.configCache.set('graphics', this.getGraphicsPresets());
        
        // Lazy load heavy configs
        this.lazyLoadedConfigs.set('generators', () => this.getGenerators());
        this.lazyLoadedConfigs.set('clickUpgrades', () => this.getClickUpgrades());
        this.lazyLoadedConfigs.set('achievements', () => this.getAchievements());
    }
    
    getCoreConfig() {
        return {
            // Resources
            INITIAL_ENERGY: 0,
            INITIAL_CRYSTALS: 0,
            
            // Click values
            BASE_CLICK_VALUE: 1,
            
            // Progression
            INITIAL_LEVEL: 1,
            BASE_XP_REQUIREMENT: 100,
            XP_GROWTH_RATE: 1.15,
            
            // Prestige
            PRESTIGE_UNLOCK_LEVEL: 10,
            PRESTIGE_BONUS_MULTIPLIER: 0.1,
            
            // Timing
            SAVE_INTERVAL: 30000, // 30 seconds
            BOOST_DURATION: 30000, // 30 seconds
            BOOST_MULTIPLIER: 2
        };
    }
    
    getGraphicsPresets() {
        return {
            low: {
                particleCount: 20,
                shadowQuality: 0,
                antialias: false,
                postProcessing: false,
                starCount: 500,
                targetFPS: 30
            },
            medium: {
                particleCount: 50,
                shadowQuality: 1,
                antialias: true,
                postProcessing: false,
                starCount: 1000,
                targetFPS: 60
            },
            high: {
                particleCount: 100,
                shadowQuality: 2,
                antialias: true,
                postProcessing: true,
                starCount: 2000,
                targetFPS: 60
            },
            ultra: {
                particleCount: 200,
                shadowQuality: 3,
                antialias: true,
                postProcessing: true,
                starCount: 5000,
                targetFPS: 120
            }
        };
    }
    
    getGenerators() {
        return [
            {
                id: 'solar_panel',
                name: 'Solar Panel',
                icon: '☀️',
                baseCost: 10,
                costMultiplier: 1.15,
                baseProduction: 0.1,
                maxLevel: 100
            },
            {
                id: 'fusion_reactor',
                name: 'Fusion Reactor',
                icon: '⚛️',
                baseCost: 100,
                costMultiplier: 1.2,
                baseProduction: 1,
                maxLevel: 100
            },
            {
                id: 'quantum_harvester',
                name: 'Quantum Harvester',
                icon: '🌀',
                baseCost: 1000,
                costMultiplier: 1.25,
                baseProduction: 10,
                maxLevel: 100
            },
            {
                id: 'stellar_engine',
                name: 'Stellar Engine',
                icon: '⭐',
                baseCost: 10000,
                costMultiplier: 1.3,
                baseProduction: 100,
                maxLevel: 100
            },
            {
                id: 'cosmic_forge',
                name: 'Cosmic Forge',
                icon: '🌌',
                baseCost: 100000,
                costMultiplier: 1.35,
                baseProduction: 1000,
                maxLevel: 100
            }
        ];
    }
    
    getClickUpgrades() {
        return [
            {
                id: 'enhanced_collector',
                name: 'Enhanced Collector',
                icon: '🔧',
                baseCost: 50,
                costMultiplier: 1.5,
                clickMultiplier: 2,
                maxLevel: 10
            },
            {
                id: 'quantum_gloves',
                name: 'Quantum Gloves',
                icon: '🧤',
                baseCost: 500,
                costMultiplier: 1.8,
                clickMultiplier: 5,
                maxLevel: 10
            },
            {
                id: 'cosmic_amplifier',
                name: 'Cosmic Amplifier',
                icon: '📡',
                baseCost: 5000,
                costMultiplier: 2,
                clickMultiplier: 10,
                maxLevel: 10
            }
        ];
    }
    
    getAchievements() {
        return [
            { id: 'first_click', name: 'First Steps', desc: 'Click the cosmic orb', icon: '🎯' },
            { id: 'energy_100', name: 'Energy Collector', desc: 'Reach 100 energy', icon: '⚡' },
            { id: 'energy_1000', name: 'Power Plant', desc: 'Reach 1,000 energy', icon: '🏭' },
            { id: 'energy_1m', name: 'Cosmic Dynamo', desc: 'Reach 1 million energy', icon: '🌟' },
            { id: 'level_5', name: 'Rising Star', desc: 'Reach level 5', icon: '📈' },
            { id: 'level_10', name: 'Stellar Explorer', desc: 'Reach level 10', icon: '🚀' },
            { id: 'first_prestige', name: 'Transcendence', desc: 'Prestige for the first time', icon: '🌌' },
            { id: 'generator_master', name: 'Generator Master', desc: 'Own 10 of each generator', icon: '⚙️' },
            { id: 'click_power', name: 'Click Power', desc: 'Reach 1000 click power', icon: '💪' },
            { id: 'speed_demon', name: 'Speed Demon', desc: 'Use boost 10 times', icon: '⚡' }
        ];
    }
    
    // Optimized config access
    get(key) {
        if (this.configCache.has(key)) {
            return this.configCache.get(key);
        }
        
        if (this.lazyLoadedConfigs.has(key)) {
            const config = this.lazyLoadedConfigs.get(key)();
            this.configCache.set(key, config);
            return config;
        }
        
        const coreConfig = this.configCache.get('core');
        return coreConfig[key];
    }
    
    // Set configuration value
    set(key, value) {
        const coreConfig = this.configCache.get('core');
        coreConfig[key] = value;
        this.isDirty = true;
        this.configCache.set('core', coreConfig);
    }
    
    // Get configuration by path (e.g., 'graphics.medium.particleCount')
    getByPath(path) {
        const parts = path.split('.');
        let current = this.get(parts[0]);
        
        for (let i = 1; i < parts.length; i++) {
            if (current && typeof current === 'object') {
                current = current[parts[i]];
            } else {
                return undefined;
            }
        }
        
        return current;
    }
    
    // Performance optimized batch get
    getBatch(keys) {
        const results = {};
        for (const key of keys) {
            results[key] = this.get(key);
        }
        return results;
    }
    
    // Clear cache
    clearCache() {
        this.configCache.clear();
        this.initializeConfigs();
    }
    
    // Get cache statistics
    getCacheStats() {
        return {
            cacheSize: this.configCache.size,
            lazyConfigCount: this.lazyLoadedConfigs.size,
            isDirty: this.isDirty,
            version: this.configVersion
        };
    }
    
    // Auto-detect optimal graphics settings based on performance
    getOptimalGraphicsSettings() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            return this.get('graphics').low;
        }
        
        const renderer = gl.getParameter(gl.RENDERER);
        const vendor = gl.getParameter(gl.VENDOR);
        
        // Simple heuristic based on GPU info
        if (renderer.includes('Mobile') || renderer.includes('PowerVR')) {
            return this.get('graphics').low;
        } else if (renderer.includes('GeForce GTX 1060') || renderer.includes('Radeon RX 580')) {
            return this.get('graphics').high;
        } else if (renderer.includes('GeForce RTX') || renderer.includes('Radeon RX 6')) {
            return this.get('graphics').ultra;
        }
        
        return this.get('graphics').medium;
    }
    
    // Performance monitoring
    getPerformanceProfile() {
        const fps = window.game?.currentFPS || 60;
        const graphics = this.get('graphics');
        
        if (fps < 30) {
            return graphics.low;
        } else if (fps < 45) {
            return graphics.medium;
        } else if (fps < 55) {
            return graphics.high;
        } else {
            return graphics.ultra;
        }
    }
};

// Create singleton instance
window.GameConfigManager = new GameConfigManager();

// Backward compatibility - Static access
window.GameConfig = {
    // Resources
    get INITIAL_ENERGY() { return GameConfigManager.get('INITIAL_ENERGY'); },
    get INITIAL_CRYSTALS() { return GameConfigManager.get('INITIAL_CRYSTALS'); },
    
    // Click values
    get BASE_CLICK_VALUE() { return GameConfigManager.get('BASE_CLICK_VALUE'); },
    
    // Progression
    get INITIAL_LEVEL() { return GameConfigManager.get('INITIAL_LEVEL'); },
    get BASE_XP_REQUIREMENT() { return GameConfigManager.get('BASE_XP_REQUIREMENT'); },
    get XP_GROWTH_RATE() { return GameConfigManager.get('XP_GROWTH_RATE'); },
    
    // Prestige
    get PRESTIGE_UNLOCK_LEVEL() { return GameConfigManager.get('PRESTIGE_UNLOCK_LEVEL'); },
    get PRESTIGE_BONUS_MULTIPLIER() { return GameConfigManager.get('PRESTIGE_BONUS_MULTIPLIER'); },
    
    // Timing
    get SAVE_INTERVAL() { return GameConfigManager.get('SAVE_INTERVAL'); },
    get BOOST_DURATION() { return GameConfigManager.get('BOOST_DURATION'); },
    get BOOST_MULTIPLIER() { return GameConfigManager.get('BOOST_MULTIPLIER'); },
    
    // Arrays - cached for performance
    get GENERATORS() { return GameConfigManager.get('generators'); },
    get CLICK_UPGRADES() { return GameConfigManager.get('clickUpgrades'); },
    get ACHIEVEMENTS() { return GameConfigManager.get('achievements'); },
    get GRAPHICS_PRESETS() { return GameConfigManager.get('graphics'); }
};