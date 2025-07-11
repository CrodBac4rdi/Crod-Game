// Config System - Isolated and Testable
class ConfigSystem {
    constructor() {
        this.config = null;
        this.isLoaded = false;
    }
    
    async init() {
        try {
            this.config = {
                // Game settings
                INITIAL_ENERGY: 0,
                INITIAL_CRYSTALS: 0,
                BASE_CLICK_VALUE: 1,
                
                // Progression
                INITIAL_LEVEL: 1,
                BASE_XP_REQUIREMENT: 100,
                XP_GROWTH_RATE: 1.15,
                
                // Graphics
                GRAPHICS_PRESETS: {
                    low: {
                        particleCount: 20,
                        shadowQuality: 0,
                        antialias: false,
                        postProcessing: false,
                        targetFPS: 30
                    },
                    medium: {
                        particleCount: 50,
                        shadowQuality: 1,
                        antialias: true,
                        postProcessing: false,
                        targetFPS: 60
                    },
                    high: {
                        particleCount: 100,
                        shadowQuality: 2,
                        antialias: true,
                        postProcessing: true,
                        targetFPS: 60
                    }
                },
                
                // Generators
                GENERATORS: [
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
                    }
                ],
                
                // Timing
                SAVE_INTERVAL: 30000,
                BOOST_DURATION: 30000,
                BOOST_MULTIPLIER: 2
            };
            
            this.isLoaded = true;
            console.log('[ConfigSystem] Config loaded successfully');
            
        } catch (error) {
            console.error('[ConfigSystem] Failed to load config:', error);
            throw error;
        }
    }
    
    get(key) {
        if (!this.isLoaded) {
            throw new Error('Config not loaded');
        }
        return this.config[key];
    }
    
    getGraphicsPreset(quality = 'medium') {
        return this.get('GRAPHICS_PRESETS')[quality] || this.get('GRAPHICS_PRESETS').medium;
    }
    
    dispose() {
        this.config = null;
        this.isLoaded = false;
    }
}

window.ConfigSystem = ConfigSystem;