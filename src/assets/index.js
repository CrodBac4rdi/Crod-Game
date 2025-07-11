// Asset System Index - Main Entry Point
// High-Performance Asset Management for Cosmic Clicker 3D

// Core asset systems
import './sounds/AudioSystem.js';
import './textures/TextureManager.js';
import './models/ModelGenerator.js';
import './AssetLoader.js';
import './PerformanceOptimizer.js';
import './AssetIntegration.js';

// Create global asset integration instance
window.AssetIntegration = new AssetIntegration();

// Main initialization function
window.initializeAssets = async function(progressCallback) {
    console.log('🎮 Initializing Cosmic Clicker 3D Asset System...');
    
    try {
        // Initialize the integrated asset system
        await window.AssetIntegration.initialize(progressCallback);
        
        console.log('✅ All asset systems initialized successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Asset system initialization failed:', error);
        throw error;
    }
};

// Asset system status
window.getAssetSystemStatus = function() {
    return {
        isReady: window.AssetIntegration.isReady(),
        loadingMetrics: window.AssetIntegration.getLoadingMetrics(),
        performanceMetrics: window.performanceOptimizer ? window.performanceOptimizer.getPerformanceReport() : null,
        globalSettings: window.AssetIntegration.getGlobalSettings()
    };
};

// Convenience functions for asset access
window.AssetAPI = {
    // Audio functions
    playSound: (name, options) => {
        return window.audioSystem ? window.audioSystem.playSound(name, options) : null;
    },
    
    playClickSound: (intensity) => {
        return window.audioSystem ? window.audioSystem.playClickSound(intensity) : null;
    },
    
    setMasterVolume: (volume) => {
        if (window.audioSystem) {
            window.audioSystem.setMasterVolume(volume);
        }
    },
    
    setSoundEnabled: (enabled) => {
        if (window.audioSystem) {
            window.audioSystem.setSoundEnabled(enabled);
        }
    },
    
    // Texture functions
    getTexture: (name) => {
        return window.textureManager ? window.textureManager.getTexture(name) : null;
    },
    
    createProceduralTexture: (name, width, height, generator) => {
        return window.textureManager ? window.textureManager.createProceduralTexture(name, width, height, generator) : null;
    },
    
    // Model functions
    getModel: (name, level = 0) => {
        return window.modelGenerator ? window.modelGenerator.createModel(name, level) : null;
    },
    
    getLODModel: (name, level = 0) => {
        return window.modelGenerator ? window.modelGenerator.createLODModel(name, level) : null;
    },
    
    getParticleModel: (type) => {
        return window.modelGenerator ? window.modelGenerator.createParticleModel(type) : null;
    },
    
    // Pool functions
    getParticleFromPool: (type) => {
        return window.AssetIntegration ? window.AssetIntegration.getParticleFromPool(type) : null;
    },
    
    returnParticleToPool: (particle) => {
        if (window.AssetIntegration) {
            window.AssetIntegration.returnParticleToPool(particle);
        }
    },
    
    getModelFromPool: (modelName, level) => {
        return window.AssetIntegration ? window.AssetIntegration.getModelFromPool(modelName, level) : null;
    },
    
    returnModelToPool: (model, modelName) => {
        if (window.AssetIntegration) {
            window.AssetIntegration.returnModelToPool(model, modelName);
        }
    },
    
    // Performance functions
    getPerformanceMetrics: () => {
        return window.performanceOptimizer ? window.performanceOptimizer.getPerformanceReport() : null;
    },
    
    setOptimizationLevel: (level) => {
        if (window.performanceOptimizer) {
            window.performanceOptimizer.setOptimizationLevel(level);
        }
    },
    
    enableAutoOptimization: (enabled) => {
        if (window.performanceOptimizer) {
            window.performanceOptimizer.enableAutoOptimization(enabled);
        }
    },
    
    resetOptimizations: () => {
        if (window.performanceOptimizer) {
            window.performanceOptimizer.resetOptimizations();
        }
    },
    
    // System functions
    isReady: () => {
        return window.AssetIntegration ? window.AssetIntegration.isReady() : false;
    },
    
    getSystemStatus: () => {
        return window.getAssetSystemStatus();
    },
    
    cleanup: () => {
        if (window.AssetIntegration) {
            window.AssetIntegration.dispose();
        }
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeAssets: window.initializeAssets,
        getAssetSystemStatus: window.getAssetSystemStatus,
        AssetAPI: window.AssetAPI
    };
}

// Log successful loading
console.log('📦 Asset system modules loaded successfully');
console.log('🎯 Ready to initialize with initializeAssets()');
console.log('🔧 Use AssetAPI for convenient asset access');
console.log('📊 Use getAssetSystemStatus() for system information');