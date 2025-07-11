// Asset Integration System - Performance Optimized Entry Point
window.AssetIntegration = class AssetIntegration {
    constructor() {
        this.assetLoader = null;
        this.performanceOptimizer = null;
        this.isInitialized = false;
        this.loadingPromise = null;
        
        // Performance tracking
        this.initStartTime = 0;
        this.loadStartTime = 0;
        this.totalLoadTime = 0;
        
        // Asset system references
        this.audioSystem = null;
        this.textureManager = null;
        this.modelGenerator = null;
        
        // Global performance settings
        this.globalSettings = {
            enableAssetOptimization: true,
            enablePerformanceMonitoring: true,
            enableAutoOptimization: true,
            targetFPS: 60,
            memoryBudget: 200 * 1024 * 1024 // 200MB
        };
    }
    
    // Initialize the entire asset system
    async initialize(progressCallback) {
        if (this.isInitialized) {
            console.warn('Asset system already initialized');
            return this.loadingPromise;
        }
        
        if (this.loadingPromise) {
            return this.loadingPromise;
        }
        
        this.initStartTime = performance.now();
        console.log('🚀 Initializing high-performance asset system...');
        
        this.loadingPromise = this.initializeInternal(progressCallback);
        return this.loadingPromise;
    }
    
    async initializeInternal(progressCallback) {
        try {
            // Step 1: Initialize performance optimizer
            this.updateProgress(5, 'Initializing performance optimizer...', progressCallback);
            this.performanceOptimizer = new PerformanceOptimizer();
            
            // Step 2: Initialize asset loader
            this.updateProgress(10, 'Initializing asset loader...', progressCallback);
            this.assetLoader = new AssetLoader();
            
            // Step 3: Get system references
            this.updateProgress(15, 'Setting up asset systems...', progressCallback);
            this.audioSystem = this.assetLoader.getAudioSystem();
            this.textureManager = this.assetLoader.getTextureManager();
            this.modelGenerator = this.assetLoader.getModelGenerator();
            
            // Step 4: Apply initial optimizations
            this.updateProgress(20, 'Applying performance optimizations...', progressCallback);
            await this.applyInitialOptimizations();
            
            // Step 5: Load assets with progress tracking
            this.updateProgress(25, 'Loading game assets...', progressCallback);
            this.loadStartTime = performance.now();
            
            await this.assetLoader.loadGameAssets((percent, message) => {
                // Map asset loading progress to our overall progress (25-95%)
                const overallProgress = 25 + (percent * 0.7);
                this.updateProgress(overallProgress, message, progressCallback);
            });
            
            // Step 6: Final optimizations
            this.updateProgress(95, 'Applying final optimizations...', progressCallback);
            await this.applyFinalOptimizations();
            
            // Step 7: Setup global asset access
            this.updateProgress(98, 'Setting up global access...', progressCallback);
            this.setupGlobalAccess();
            
            // Step 8: Complete
            this.updateProgress(100, 'Asset system ready!', progressCallback);
            
            this.totalLoadTime = performance.now() - this.initStartTime;
            this.isInitialized = true;
            
            console.log(`✅ Asset system initialized in ${this.totalLoadTime.toFixed(2)}ms`);
            this.logPerformanceMetrics();
            
            return true;
            
        } catch (error) {
            console.error('❌ Asset system initialization failed:', error);
            this.updateProgress(0, 'Error: ' + error.message, progressCallback);
            throw error;
        }
    }
    
    // Apply initial performance optimizations
    async applyInitialOptimizations() {
        if (!this.globalSettings.enableAssetOptimization) return;
        
        // Optimize based on hardware capabilities
        const capabilities = this.performanceOptimizer.optimizationLevel;
        
        switch (capabilities) {
            case 'aggressive':
                // Mobile/low-end optimizations
                this.textureManager.maxTextureSize = 512;
                this.textureManager.compressionSupported = true;
                this.audioSystem.maxConcurrentSounds = 4;
                this.modelGenerator.lowPolyMode = true;
                break;
                
            case 'medium':
                // Standard optimizations
                this.textureManager.maxTextureSize = 1024;
                this.audioSystem.maxConcurrentSounds = 6;
                this.modelGenerator.lowPolyMode = false;
                break;
                
            case 'conservative':
                // High-end, minimal optimizations
                this.textureManager.maxTextureSize = 2048;
                this.audioSystem.maxConcurrentSounds = 8;
                this.modelGenerator.lowPolyMode = false;
                break;
        }
        
        console.log(`Applied ${capabilities} optimization preset`);
    }
    
    // Apply final optimizations after asset loading
    async applyFinalOptimizations() {
        if (!this.globalSettings.enableAssetOptimization) return;
        
        // Optimize loaded assets
        await this.optimizeLoadedAssets();
        
        // Setup asset pooling
        this.setupAssetPooling();
        
        // Enable performance monitoring
        if (this.globalSettings.enablePerformanceMonitoring) {
            this.performanceOptimizer.enableAutoOptimization(this.globalSettings.enableAutoOptimization);
        }
    }
    
    // Optimize already loaded assets
    async optimizeLoadedAssets() {
        console.log('🔧 Optimizing loaded assets...');
        
        // Optimize textures
        this.textureManager.textures.forEach((texture, name) => {
            this.performanceOptimizer.optimizeTexture(texture, {
                maxSize: this.textureManager.maxTextureSize,
                generateMipmaps: true
            });
        });
        
        // Optimize models
        this.modelGenerator.models.forEach((model, name) => {
            const level = this.extractLevelFromName(name);
            this.performanceOptimizer.optimizeModel(model, level);
        });
        
        // Optimize audio
        this.audioSystem.buffers.forEach((buffer, name) => {
            this.performanceOptimizer.optimizeAudio(buffer);
        });
        
        console.log('✅ Asset optimization complete');
    }
    
    // Setup asset pooling for performance
    setupAssetPooling() {
        // Create object pools for frequently used assets
        this.particlePool = [];
        this.modelPool = new Map();
        this.materialPool = new Map();
        
        // Pre-populate pools
        this.populateAssetPools();
    }
    
    populateAssetPools() {
        // Pre-create particle objects
        for (let i = 0; i < 100; i++) {
            const particle = this.modelGenerator.createParticleModel('energy');
            particle.inUse = false;
            this.particlePool.push(particle);
        }
        
        // Pre-create common models
        const commonModels = ['solar_panel', 'fusion_reactor'];
        commonModels.forEach(modelName => {
            const pool = [];
            for (let i = 0; i < 10; i++) {
                const model = this.modelGenerator.createModel(modelName, 0);
                model.inUse = false;
                pool.push(model);
            }
            this.modelPool.set(modelName, pool);
        });
    }
    
    // Setup global asset access
    setupGlobalAccess() {
        // Make asset systems globally accessible
        window.assetLoader = this.assetLoader;
        window.performanceOptimizer = this.performanceOptimizer;
        window.audioSystem = this.audioSystem;
        window.textureManager = this.textureManager;
        window.modelGenerator = this.modelGenerator;
        
        // Add convenience methods to window
        window.playSound = (name, options) => {
            return this.audioSystem.playSound(name, options);
        };
        
        window.getTexture = (name) => {
            return this.textureManager.getTexture(name);
        };
        
        window.getModel = (name, level) => {
            return this.modelGenerator.createModel(name, level);
        };
        
        window.getParticle = (type) => {
            return this.getParticleFromPool(type);
        };
        
        window.getPerformanceMetrics = () => {
            return this.performanceOptimizer.getPerformanceReport();
        };
    }
    
    // Pooled particle system
    getParticleFromPool(type = 'energy') {
        for (let i = 0; i < this.particlePool.length; i++) {
            const particle = this.particlePool[i];
            if (!particle.inUse) {
                particle.inUse = true;
                return particle;
            }
        }
        
        // Pool exhausted, create new one
        const particle = this.modelGenerator.createParticleModel(type);
        particle.inUse = true;
        this.particlePool.push(particle);
        return particle;
    }
    
    returnParticleToPool(particle) {
        particle.inUse = false;
        particle.visible = false;
        if (particle.material) {
            particle.material.opacity = 0;
        }
    }
    
    // Pooled model system
    getModelFromPool(modelName, level = 0) {
        const pool = this.modelPool.get(modelName);
        if (!pool) {
            return this.modelGenerator.createModel(modelName, level);
        }
        
        for (let i = 0; i < pool.length; i++) {
            const model = pool[i];
            if (!model.inUse) {
                model.inUse = true;
                return model;
            }
        }
        
        // Pool exhausted, create new one
        const model = this.modelGenerator.createModel(modelName, level);
        model.inUse = true;
        pool.push(model);
        return model;
    }
    
    returnModelToPool(model, modelName) {
        model.inUse = false;
        model.visible = false;
        if (model.parent) {
            model.parent.remove(model);
        }
    }
    
    // Utility methods
    extractLevelFromName(name) {
        const match = name.match(/-(\d+)$/);
        return match ? parseInt(match[1]) : 0;
    }
    
    updateProgress(percent, message, callback) {
        if (callback) {
            callback(percent, message);
        }
        
        // Update DOM if elements exist
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');
        
        if (progressBar) {
            progressBar.style.width = percent + '%';
        }
        
        if (loadingText) {
            loadingText.textContent = message;
        }
    }
    
    logPerformanceMetrics() {
        const metrics = {
            totalLoadTime: this.totalLoadTime,
            assetLoadTime: performance.now() - this.loadStartTime,
            texturesLoaded: this.textureManager.textures.size,
            modelsLoaded: this.modelGenerator.models.size,
            soundsLoaded: this.audioSystem.buffers.size,
            memoryUsage: this.performanceOptimizer.metrics.memoryUsage,
            optimizationLevel: this.performanceOptimizer.optimizationLevel
        };
        
        console.log('📊 Asset System Performance Metrics:');
        console.table(metrics);
        
        // Report to performance monitoring if available
        if (window.game && window.game.eventSystem) {
            window.game.eventSystem.emit('ASSET_METRICS', metrics);
        }
    }
    
    // Configuration methods
    setGlobalSettings(settings) {
        this.globalSettings = { ...this.globalSettings, ...settings };
        
        if (this.performanceOptimizer) {
            this.performanceOptimizer.enableAutoOptimization(this.globalSettings.enableAutoOptimization);
        }
    }
    
    getGlobalSettings() {
        return { ...this.globalSettings };
    }
    
    // Public API
    isReady() {
        return this.isInitialized && this.assetLoader && this.performanceOptimizer;
    }
    
    getAssetLoader() {
        return this.assetLoader;
    }
    
    getPerformanceOptimizer() {
        return this.performanceOptimizer;
    }
    
    getLoadingMetrics() {
        return {
            totalLoadTime: this.totalLoadTime,
            assetLoadTime: performance.now() - this.loadStartTime,
            isInitialized: this.isInitialized,
            assetMetrics: this.assetLoader ? this.assetLoader.getLoadingMetrics() : null
        };
    }
    
    // Cleanup
    dispose() {
        if (this.assetLoader) {
            this.assetLoader.dispose();
        }
        
        if (this.performanceOptimizer) {
            this.performanceOptimizer.dispose();
        }
        
        // Clear pools
        this.particlePool = [];
        this.modelPool.clear();
        this.materialPool.clear();
        
        // Clear global references
        delete window.assetLoader;
        delete window.performanceOptimizer;
        delete window.audioSystem;
        delete window.textureManager;
        delete window.modelGenerator;
        
        this.isInitialized = false;
        this.loadingPromise = null;
    }
};