// Performance-optimized Asset Loading System
window.AssetLoader = class AssetLoader {
    constructor() {
        this.audioSystem = null;
        this.textureManager = null;
        this.modelGenerator = null;
        
        // Loading state
        this.isLoading = false;
        this.loadingProgress = 0;
        this.loadingStage = 'idle';
        this.loadingCallback = null;
        
        // Performance metrics
        this.loadStartTime = 0;
        this.loadEndTime = 0;
        this.assetsLoaded = 0;
        this.totalAssets = 0;
        
        // Asset priority levels
        this.priorityLevels = {
            CRITICAL: 0,    // Essential for game start
            HIGH: 1,        // Important for gameplay
            MEDIUM: 2,      // Nice to have
            LOW: 3          // Optional/decorative
        };
        
        // Asset loading queues
        this.loadingQueues = {
            [this.priorityLevels.CRITICAL]: [],
            [this.priorityLevels.HIGH]: [],
            [this.priorityLevels.MEDIUM]: [],
            [this.priorityLevels.LOW]: []
        };
        
        // Performance settings
        this.maxConcurrentLoads = 4;
        this.currentLoads = 0;
        this.useWebWorkers = this.checkWebWorkerSupport();
        
        // Memory management
        this.memoryBudget = 200 * 1024 * 1024; // 200MB
        this.currentMemoryUsage = 0;
        
        this.initializeAssetSystems();
    }
    
    checkWebWorkerSupport() {
        return typeof Worker !== 'undefined';
    }
    
    initializeAssetSystems() {
        // Initialize audio system
        this.audioSystem = new AudioSystem();
        
        // Initialize texture manager
        this.textureManager = new TextureManager();
        
        // Initialize model generator
        this.modelGenerator = new ModelGenerator(this.textureManager);
    }
    
    // Main asset loading function
    async loadGameAssets(progressCallback) {
        if (this.isLoading) {
            console.warn('Asset loading already in progress');
            return;
        }
        
        this.isLoading = true;
        this.loadingCallback = progressCallback;
        this.loadStartTime = performance.now();
        
        console.log('🚀 Starting high-performance asset loading...');
        
        try {
            // Stage 1: Critical assets (required for game start)
            await this.loadCriticalAssets();
            
            // Stage 2: High priority assets (core gameplay)
            await this.loadHighPriorityAssets();
            
            // Stage 3: Medium priority assets (enhancement)
            await this.loadMediumPriorityAssets();
            
            // Stage 4: Low priority assets (background loading)
            this.loadLowPriorityAssets(); // Non-blocking
            
            this.loadEndTime = performance.now();
            const loadTime = this.loadEndTime - this.loadStartTime;
            
            console.log(`✅ Asset loading completed in ${loadTime.toFixed(2)}ms`);
            console.log(`📊 Loaded ${this.assetsLoaded} assets, Memory usage: ${(this.currentMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
            
            this.isLoading = false;
            return true;
            
        } catch (error) {
            console.error('❌ Asset loading failed:', error);
            this.isLoading = false;
            throw error;
        }
    }
    
    // Stage 1: Critical assets (blocking)
    async loadCriticalAssets() {
        this.loadingStage = 'critical';
        this.updateProgress(5, 'Loading critical assets...');
        
        const criticalAssets = [
            // Basic audio initialization
            () => this.audioSystem.preloadSounds(),
            
            // Essential textures
            () => this.textureManager.createCosmicOrbTexture(),
            () => this.textureManager.createParticleTexture(),
            
            // Basic models
            () => this.modelGenerator.createModel('solar_panel', 0),
            () => this.modelGenerator.createParticleModel('energy')
        ];
        
        await this.loadAssetsWithProgress(criticalAssets, 5, 25);
        this.updateProgress(25, 'Critical assets loaded');
    }
    
    // Stage 2: High priority assets (blocking)
    async loadHighPriorityAssets() {
        this.loadingStage = 'high';
        this.updateProgress(25, 'Loading high priority assets...');
        
        const highPriorityAssets = [
            // All generator models (level 0)
            () => this.modelGenerator.createModel('fusion_reactor', 0),
            () => this.modelGenerator.createModel('quantum_harvester', 0),
            () => this.modelGenerator.createModel('stellar_engine', 0),
            () => this.modelGenerator.createModel('cosmic_forge', 0),
            
            // Essential textures
            () => this.textureManager.createStarTexture(),
            () => this.textureManager.createEnergyTexture(),
            
            // Core particle models
            () => this.modelGenerator.createParticleModel('crystal'),
            () => this.modelGenerator.createParticleModel('star')
        ];
        
        await this.loadAssetsWithProgress(highPriorityAssets, 25, 60);
        this.updateProgress(60, 'High priority assets loaded');
    }
    
    // Stage 3: Medium priority assets (blocking)
    async loadMediumPriorityAssets() {
        this.loadingStage = 'medium';
        this.updateProgress(60, 'Loading medium priority assets...');
        
        const mediumAssets = [
            // Generator models (levels 1-5)
            () => this.preloadGeneratorLevels(1, 5),
            
            // UI textures
            () => this.textureManager.createUIBackgroundTexture(),
            
            // Additional effects
            () => this.preloadEffectModels()
        ];
        
        await this.loadAssetsWithProgress(mediumAssets, 60, 85);
        this.updateProgress(85, 'Medium priority assets loaded');
    }
    
    // Stage 4: Low priority assets (non-blocking)
    async loadLowPriorityAssets() {
        this.loadingStage = 'low';
        this.updateProgress(85, 'Loading low priority assets...');
        
        // Load in background without blocking game start
        setTimeout(async () => {
            try {
                // High-level generator models
                await this.preloadGeneratorLevels(6, 20);
                
                // Advanced effect models
                await this.preloadAdvancedEffects();
                
                // Optional audio
                await this.loadOptionalAudio();
                
                this.updateProgress(100, 'All assets loaded');
                console.log('🎉 Background asset loading completed');
                
            } catch (error) {
                console.warn('⚠️ Background asset loading failed:', error);
            }
        }, 1000);
    }
    
    // Load assets with progress tracking
    async loadAssetsWithProgress(assets, startProgress, endProgress) {
        const progressRange = endProgress - startProgress;
        const progressPerAsset = progressRange / assets.length;
        
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            
            try {
                await this.loadAssetWithRateLimit(asset);
                this.assetsLoaded++;
                
                const currentProgress = startProgress + (i + 1) * progressPerAsset;
                this.updateProgress(currentProgress, `Loading ${this.loadingStage} assets... (${i + 1}/${assets.length})`);
                
            } catch (error) {
                console.warn(`Failed to load asset ${i}:`, error);
                // Continue loading other assets
            }
        }
    }
    
    // Rate-limited asset loading
    async loadAssetWithRateLimit(assetLoader) {
        // Wait if we're at the concurrent load limit
        while (this.currentLoads >= this.maxConcurrentLoads) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        this.currentLoads++;
        
        try {
            const result = await assetLoader();
            
            // Artificial delay to prevent overwhelming the system
            await new Promise(resolve => setTimeout(resolve, 5));
            
            return result;
        } finally {
            this.currentLoads--;
        }
    }
    
    // Preload generator models at different levels
    async preloadGeneratorLevels(startLevel, endLevel) {
        const generators = ['solar_panel', 'fusion_reactor', 'quantum_harvester', 'stellar_engine', 'cosmic_forge'];
        
        for (let level = startLevel; level <= endLevel; level++) {
            for (const generator of generators) {
                await this.loadAssetWithRateLimit(() => 
                    this.modelGenerator.createModel(generator, level)
                );
            }
        }
    }
    
    // Preload effect models
    async preloadEffectModels() {
        const effects = ['energy', 'crystal', 'star'];
        
        for (const effect of effects) {
            await this.loadAssetWithRateLimit(() => 
                this.modelGenerator.createParticleModel(effect)
            );
        }
    }
    
    // Preload advanced effects
    async preloadAdvancedEffects() {
        // Create LOD models for performance
        const generators = ['solar_panel', 'fusion_reactor', 'quantum_harvester', 'stellar_engine', 'cosmic_forge'];
        
        for (const generator of generators) {
            await this.loadAssetWithRateLimit(() => 
                this.modelGenerator.createLODModel(generator, 10)
            );
        }
    }
    
    // Load optional audio
    async loadOptionalAudio() {
        // Extended audio effects can be loaded here
        // For now, just ensure all sounds are properly cached
        return Promise.resolve();
    }
    
    // Update loading progress
    updateProgress(percent, message) {
        this.loadingProgress = percent;
        
        if (this.loadingCallback) {
            this.loadingCallback(percent, message);
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
    
    // Get asset system references
    getAudioSystem() {
        return this.audioSystem;
    }
    
    getTextureManager() {
        return this.textureManager;
    }
    
    getModelGenerator() {
        return this.modelGenerator;
    }
    
    // Check if critical assets are loaded
    isCriticalAssetsLoaded() {
        return this.loadingStage !== 'idle' && this.loadingStage !== 'critical';
    }
    
    // Get loading metrics
    getLoadingMetrics() {
        return {
            progress: this.loadingProgress,
            stage: this.loadingStage,
            assetsLoaded: this.assetsLoaded,
            totalAssets: this.totalAssets,
            memoryUsage: this.currentMemoryUsage,
            loadTime: this.loadEndTime - this.loadStartTime,
            isLoading: this.isLoading
        };
    }
    
    // Memory management
    checkMemoryUsage() {
        // Basic memory estimation
        const textureMemory = this.textureManager.totalSize || 0;
        const modelMemory = this.modelGenerator.models.size * 1024 * 10; // Rough estimate
        const audioMemory = this.audioSystem.buffers.size * 1024 * 50; // Rough estimate
        
        this.currentMemoryUsage = textureMemory + modelMemory + audioMemory;
        
        if (this.currentMemoryUsage > this.memoryBudget) {
            console.warn('🚨 Memory budget exceeded, cleaning up assets...');
            this.cleanupAssets();
        }
    }
    
    // Clean up assets to free memory
    cleanupAssets() {
        this.textureManager.cleanupOldTextures();
        
        // Remove high-level generator models if memory is tight
        const generators = ['solar_panel', 'fusion_reactor', 'quantum_harvester', 'stellar_engine', 'cosmic_forge'];
        
        for (const generator of generators) {
            for (let level = 15; level <= 20; level++) {
                const cacheKey = `${generator}-${level}`;
                if (this.modelGenerator.models.has(cacheKey)) {
                    const model = this.modelGenerator.models.get(cacheKey);
                    model.traverse(child => {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) child.material.dispose();
                    });
                    this.modelGenerator.models.delete(cacheKey);
                }
            }
        }
    }
    
    // Dispose all assets
    dispose() {
        if (this.audioSystem) {
            this.audioSystem.cleanup();
        }
        
        if (this.textureManager) {
            this.textureManager.dispose();
        }
        
        if (this.modelGenerator) {
            this.modelGenerator.dispose();
        }
        
        this.isLoading = false;
        this.loadingCallback = null;
    }
};