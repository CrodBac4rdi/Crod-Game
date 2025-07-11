// Advanced Performance Optimization System for Assets
window.PerformanceOptimizer = class PerformanceOptimizer {
    constructor() {
        this.metrics = {
            fps: 60,
            memoryUsage: 0,
            loadTime: 0,
            renderTime: 0,
            gpuMemory: 0,
            cpuUsage: 0
        };
        
        this.thresholds = {
            lowFPS: 30,
            mediumFPS: 45,
            highFPS: 55,
            maxMemory: 200 * 1024 * 1024, // 200MB
            maxRenderTime: 16.67 // 60fps target
        };
        
        this.optimizationLevel = 'medium';
        this.autoOptimize = true;
        this.performanceHistory = [];
        this.optimizationActions = [];
        
        // Asset optimization settings
        this.assetOptimizations = {
            textureCompression: true,
            modelLOD: true,
            audioCompression: true,
            particlePooling: true,
            instancedRendering: true,
            cullingEnabled: true,
            materialBatching: true
        };
        
        // Performance monitoring
        this.monitoringEnabled = true;
        this.monitoringInterval = 1000; // 1 second
        this.lastMonitorTime = 0;
        
        this.initializeOptimizer();
    }
    
    initializeOptimizer() {
        // Start performance monitoring
        if (this.monitoringEnabled) {
            this.startMonitoring();
        }
        
        // Detect hardware capabilities
        this.detectHardwareCapabilities();
        
        // Initialize asset optimizations
        this.initializeAssetOptimizations();
    }
    
    // Hardware capability detection
    detectHardwareCapabilities() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            this.optimizationLevel = 'low';
            console.warn('WebGL not supported, using low optimization level');
            return;
        }
        
        // Get GPU info
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';
        const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown';
        
        // Check for mobile devices
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Check memory info (if available)
        const memoryInfo = (performance as any).memory;
        const totalMemory = memoryInfo ? memoryInfo.totalJSHeapSize : 0;
        
        // Determine optimization level based on hardware
        if (isMobile || renderer.includes('PowerVR') || renderer.includes('Adreno')) {
            this.optimizationLevel = 'aggressive';
        } else if (renderer.includes('GeForce GTX 1060') || renderer.includes('Radeon RX 580')) {
            this.optimizationLevel = 'medium';
        } else if (renderer.includes('GeForce RTX') || renderer.includes('Radeon RX 6')) {
            this.optimizationLevel = 'conservative';
        } else {
            this.optimizationLevel = 'medium';
        }
        
        console.log(`Hardware detected: ${vendor} ${renderer}`);
        console.log(`Optimization level: ${this.optimizationLevel}`);
    }
    
    // Initialize asset optimizations
    initializeAssetOptimizations() {
        switch (this.optimizationLevel) {
            case 'aggressive':
                this.assetOptimizations = {
                    textureCompression: true,
                    modelLOD: true,
                    audioCompression: true,
                    particlePooling: true,
                    instancedRendering: true,
                    cullingEnabled: true,
                    materialBatching: true,
                    textureAtlasing: true,
                    geometryMerging: true,
                    shaderOptimization: true
                };
                break;
                
            case 'medium':
                this.assetOptimizations = {
                    textureCompression: true,
                    modelLOD: true,
                    audioCompression: true,
                    particlePooling: true,
                    instancedRendering: true,
                    cullingEnabled: true,
                    materialBatching: false,
                    textureAtlasing: false,
                    geometryMerging: false,
                    shaderOptimization: true
                };
                break;
                
            case 'conservative':
                this.assetOptimizations = {
                    textureCompression: false,
                    modelLOD: false,
                    audioCompression: false,
                    particlePooling: true,
                    instancedRendering: false,
                    cullingEnabled: true,
                    materialBatching: false,
                    textureAtlasing: false,
                    geometryMerging: false,
                    shaderOptimization: false
                };
                break;
        }
    }
    
    // Performance monitoring
    startMonitoring() {
        const monitor = () => {
            const now = performance.now();
            
            if (now - this.lastMonitorTime >= this.monitoringInterval) {
                this.updateMetrics();
                this.checkPerformanceThresholds();
                this.lastMonitorTime = now;
            }
            
            requestAnimationFrame(monitor);
        };
        
        monitor();
    }
    
    updateMetrics() {
        // Get FPS from game instance
        if (window.game) {
            this.metrics.fps = window.game.currentFPS || 60;
        }
        
        // Get memory usage
        const memoryInfo = (performance as any).memory;
        if (memoryInfo) {
            this.metrics.memoryUsage = memoryInfo.usedJSHeapSize;
            this.metrics.gpuMemory = memoryInfo.totalJSHeapSize;
        }
        
        // Calculate render time
        const frameTime = 1000 / this.metrics.fps;
        this.metrics.renderTime = frameTime;
        
        // Store in history
        this.performanceHistory.push({
            timestamp: Date.now(),
            fps: this.metrics.fps,
            memory: this.metrics.memoryUsage,
            renderTime: this.metrics.renderTime
        });
        
        // Keep only last 60 seconds of history
        const cutoff = Date.now() - 60000;
        this.performanceHistory = this.performanceHistory.filter(entry => entry.timestamp > cutoff);
    }
    
    checkPerformanceThresholds() {
        if (!this.autoOptimize) return;
        
        const actions = [];
        
        // Check FPS
        if (this.metrics.fps < this.thresholds.lowFPS) {
            actions.push('reducePa`rticles');
            actions.push('lowerTextureQuality');
            actions.push('enableAggresiveCulling');
        } else if (this.metrics.fps < this.thresholds.mediumFPS) {
            actions.push('enableLOD');
            actions.push('reduceShadowQuality');
        }
        
        // Check memory usage
        if (this.metrics.memoryUsage > this.thresholds.maxMemory) {
            actions.push('cleanupAssets');
            actions.push('compressTextures');
            actions.push('unloadUnusedModels');
        }
        
        // Check render time
        if (this.metrics.renderTime > this.thresholds.maxRenderTime) {
            actions.push('optimizeDrawCalls');
            actions.push('batchMaterials');
        }
        
        // Execute optimization actions
        this.executeOptimizations(actions);
    }
    
    executeOptimizations(actions) {
        for (const action of actions) {
            if (this.optimizationActions.includes(action)) {
                continue; // Already applied
            }
            
            switch (action) {
                case 'reduceParticles':
                    this.reduceParticleCount();
                    break;
                case 'lowerTextureQuality':
                    this.lowerTextureQuality();
                    break;
                case 'enableAggresiveCulling':
                    this.enableAggressiveCulling();
                    break;
                case 'enableLOD':
                    this.enableLOD();
                    break;
                case 'reduceShadowQuality':
                    this.reduceShadowQuality();
                    break;
                case 'cleanupAssets':
                    this.cleanupAssets();
                    break;
                case 'compressTextures':
                    this.compressTextures();
                    break;
                case 'unloadUnusedModels':
                    this.unloadUnusedModels();
                    break;
                case 'optimizeDrawCalls':
                    this.optimizeDrawCalls();
                    break;
                case 'batchMaterials':
                    this.batchMaterials();
                    break;
            }
            
            this.optimizationActions.push(action);
            console.log(`Applied optimization: ${action}`);
        }
    }
    
    // Optimization methods
    reduceParticleCount() {
        if (window.game && window.game.sceneManager) {
            const currentCount = window.game.sceneManager.maxParticles;
            window.game.sceneManager.maxParticles = Math.max(10, currentCount * 0.5);
        }
    }
    
    lowerTextureQuality() {
        if (window.assetLoader && window.assetLoader.textureManager) {
            const texManager = window.assetLoader.textureManager;
            texManager.maxTextureSize = Math.max(512, texManager.maxTextureSize * 0.5);
        }
    }
    
    enableAggressiveCulling() {
        if (window.game && window.game.sceneManager) {
            const sceneManager = window.game.sceneManager;
            if (sceneManager.renderer) {
                sceneManager.renderer.setPixelRatio(Math.min(1, window.devicePixelRatio * 0.75));
            }
        }
    }
    
    enableLOD() {
        if (window.assetLoader && window.assetLoader.modelGenerator) {
            this.assetOptimizations.modelLOD = true;
        }
    }
    
    reduceShadowQuality() {
        if (window.game && window.game.sceneManager) {
            const sceneManager = window.game.sceneManager;
            if (sceneManager.renderer) {
                sceneManager.renderer.shadowMap.enabled = false;
            }
        }
    }
    
    cleanupAssets() {
        if (window.assetLoader) {
            window.assetLoader.cleanupAssets();
        }
    }
    
    compressTextures() {
        if (window.assetLoader && window.assetLoader.textureManager) {
            window.assetLoader.textureManager.cleanupOldTextures();
        }
    }
    
    unloadUnusedModels() {
        if (window.assetLoader && window.assetLoader.modelGenerator) {
            // Implementation depends on usage tracking
            console.log('Unloading unused models...');
        }
    }
    
    optimizeDrawCalls() {
        // Enable instanced rendering where possible
        this.assetOptimizations.instancedRendering = true;
    }
    
    batchMaterials() {
        // Enable material batching
        this.assetOptimizations.materialBatching = true;
    }
    
    // Asset optimization helpers
    optimizeTexture(texture, options = {}) {
        if (!this.assetOptimizations.textureCompression) {
            return texture;
        }
        
        // Apply texture optimizations
        if (options.maxSize) {
            texture.maxSize = Math.min(texture.maxSize || 2048, options.maxSize);
        }
        
        if (options.format) {
            texture.format = options.format;
        }
        
        if (options.generateMipmaps !== undefined) {
            texture.generateMipmaps = options.generateMipmaps;
        }
        
        return texture;
    }
    
    optimizeModel(model, level = 0) {
        if (!this.assetOptimizations.modelLOD) {
            return model;
        }
        
        // Apply model optimizations based on level
        if (level > 10 && this.optimizationLevel === 'aggressive') {
            // Reduce geometry complexity for high-level models
            model.traverse(child => {
                if (child.geometry) {
                    // Reduce geometry detail
                    const originalVertexCount = child.geometry.attributes.position.count;
                    if (originalVertexCount > 1000) {
                        console.log(`Reducing geometry complexity for level ${level} model`);
                    }
                }
            });
        }
        
        return model;
    }
    
    optimizeAudio(audioBuffer) {
        if (!this.assetOptimizations.audioCompression) {
            return audioBuffer;
        }
        
        // Apply audio optimizations
        // This would involve actual audio compression algorithms
        return audioBuffer;
    }
    
    // Performance reporting
    getPerformanceReport() {
        const avgFPS = this.performanceHistory.length > 0 
            ? this.performanceHistory.reduce((sum, entry) => sum + entry.fps, 0) / this.performanceHistory.length
            : 0;
        
        const avgMemory = this.performanceHistory.length > 0
            ? this.performanceHistory.reduce((sum, entry) => sum + entry.memory, 0) / this.performanceHistory.length
            : 0;
        
        return {
            current: this.metrics,
            averages: {
                fps: avgFPS,
                memory: avgMemory
            },
            optimizationLevel: this.optimizationLevel,
            optimizationsApplied: this.optimizationActions.length,
            assetOptimizations: this.assetOptimizations,
            recommendations: this.getRecommendations()
        };
    }
    
    getRecommendations() {
        const recommendations = [];
        
        if (this.metrics.fps < 30) {
            recommendations.push('Consider lowering graphics quality');
        }
        
        if (this.metrics.memoryUsage > this.thresholds.maxMemory * 0.8) {
            recommendations.push('Memory usage is high, consider restarting the game');
        }
        
        if (this.optimizationActions.length > 10) {
            recommendations.push('Many optimizations applied, performance may be degraded');
        }
        
        return recommendations;
    }
    
    // Manual optimization controls
    setOptimizationLevel(level) {
        this.optimizationLevel = level;
        this.initializeAssetOptimizations();
        this.optimizationActions = []; // Reset applied optimizations
    }
    
    enableAutoOptimization(enabled) {
        this.autoOptimize = enabled;
    }
    
    resetOptimizations() {
        this.optimizationActions = [];
        this.initializeAssetOptimizations();
    }
    
    // Dispose
    dispose() {
        this.monitoringEnabled = false;
        this.performanceHistory = [];
        this.optimizationActions = [];
    }
};