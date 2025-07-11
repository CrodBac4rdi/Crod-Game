// Main Game Class
window.CosmicClicker = class CosmicClicker {
    constructor() {
        this.eventSystem = new EventSystem();
        this.gameState = new GameState(this.eventSystem);
        this.saveManager = new SaveManager(this.eventSystem);
        this.sceneManager = new SceneManager(this.eventSystem);
        this.upgradeManager = new UpgradeManager(this.gameState, this.eventSystem);
        this.achievementManager = new AchievementManager(this.gameState, this.eventSystem);
        this.clickManager = new ClickManager(this.gameState, this.eventSystem);
        this.notificationManager = null;
        this.floatingTextManager = null;
        this.uiManager = null;
        
        this.lastUpdateTime = Date.now();
        this.isRunning = false;
        
        // Make game globally accessible for settings
        window.game = this;
    }
    
    async init() {
        const startTime = performance.now();
        
        try {
            // Enable performance monitoring
            this.eventSystem.enablePerformanceMonitoring(true);
            
            console.log('Starting high-performance initialization...');
            this.updateLoadingProgress(5, 'Checking systems...');
            
            // Load save data first (critical path)
            this.updateLoadingProgress(15, 'Loading save data...');
            const saveData = this.saveManager.load();
            if (saveData) {
                this.gameState.loadSave(saveData);
            }
            
            // Initialize 3D scene (heavy operation)
            this.updateLoadingProgress(25, 'Generating cosmic orb...');
            const canvas = document.getElementById('game-canvas');
            
            // Parallel initialization of UI managers
            this.updateLoadingProgress(40, 'Creating universe...');
            const sceneInitPromise = this.initializeScene(canvas);
            
            this.updateLoadingProgress(50, 'Building interface...');
            const uiInitPromise = this.initializeUIManagers();
            
            // Wait for both heavy operations to complete
            await Promise.all([sceneInitPromise, uiInitPromise]);
            
            // Setup game events (fast)
            this.updateLoadingProgress(85, 'Connecting systems...');
            this.setupEvents();
            
            // Enable auto-save if needed
            this.updateLoadingProgress(90, 'Configuring save system...');
            if (this.gameState.autoSave) {
                this.saveManager.enableAutoSave(this.gameState);
            }
            
            this.updateLoadingProgress(95, 'Finalizing...');
            
            // Performance metrics
            const initTime = performance.now() - startTime;
            console.log(`Game initialization completed in ${initTime.toFixed(2)}ms`);
            
            this.updateLoadingProgress(100, 'READY TO LAUNCH!');
            
            // Hide loading screen with optimized transition
            requestAnimationFrame(() => {
                document.getElementById('loading-screen').style.display = 'none';
                document.getElementById('game-container').style.display = 'block';
                this.start();
                
                // Show welcome notification
                this.eventSystem.emit(GameEvents.NOTIFICATION, {
                    text: !saveData ? 'Welcome to Cosmic Clicker 3D!' : 'Welcome back!',
                    type: !saveData ? 'info' : 'success'
                });
            });
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.updateLoadingProgress(0, 'Error: ' + error.message);
            
            // Emit error event for error handling
            this.eventSystem.emit(GameEvents.GAME_ERROR, {
                error: error.message,
                stack: error.stack,
                phase: 'initialization'
            });
        }
    }
    
    async initializeScene(canvas) {
        try {
            this.sceneManager.init(canvas);
            return true;
        } catch (error) {
            console.error('Scene initialization failed:', error);
            throw error;
        }
    }
    
    async initializeUIManagers() {
        try {
            // Initialize UI managers in parallel
            const managers = await Promise.all([
                Promise.resolve(new NotificationManager(this.eventSystem)),
                Promise.resolve(new FloatingTextManager(this.eventSystem)),
                Promise.resolve(new UIManager(
                    this.gameState,
                    this.eventSystem,
                    this.upgradeManager,
                    this.achievementManager
                ))
            ]);
            
            [this.notificationManager, this.floatingTextManager, this.uiManager] = managers;
            return true;
        } catch (error) {
            console.error('UI initialization failed:', error);
            throw error;
        }
    }
    
    setupEvents() {
        // Canvas click event
        const canvas = document.getElementById('game-canvas');
        canvas.addEventListener('click', (event) => {
            // Check if we clicked on the orb
            if (this.sceneManager.checkOrbHit(event.clientX, event.clientY)) {
                this.clickManager.handleClick(event.clientX, event.clientY);
            }
        });
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveManager.save(this.gameState);
        });
        
        // Keyboard shortcuts
        window.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 's':
                case 'S':
                    if (event.ctrlKey) {
                        event.preventDefault();
                        this.saveManager.save(this.gameState);
                    }
                    break;
                case 'Escape':
                    // Close modals
                    document.getElementById('settings-modal').style.display = 'none';
                    break;
            }
        });
    }
    
    start() {
        this.isRunning = true;
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const now = performance.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000; // Convert to seconds
        this.lastUpdateTime = now;
        
        // Frame rate limiting for better performance
        if (deltaTime < 1/120) { // Cap at 120 FPS
            // Update game state
            this.updateGameSystems(deltaTime);
            
            // Performance monitoring
            this.updatePerformanceMetrics(deltaTime);
        }
        
        // Schedule next frame
        requestAnimationFrame(() => this.gameLoop());
    }
    
    updateGameSystems(deltaTime) {
        try {
            // Update game state
            this.gameState.update(deltaTime);
            
            // Update managers if they exist
            if (this.upgradeManager) {
                this.upgradeManager.update(deltaTime);
            }
            
            if (this.achievementManager) {
                this.achievementManager.update(deltaTime);
            }
            
            // Emit frame update event for other systems
            this.eventSystem.emitThrottled(GameEvents.FRAME_UPDATE, { deltaTime }, 16);
            
        } catch (error) {
            console.error('Error in game loop:', error);
            this.eventSystem.emit(GameEvents.GAME_ERROR, {
                error: error.message,
                stack: error.stack,
                phase: 'game_loop'
            });
        }
    }
    
    updatePerformanceMetrics(deltaTime) {
        // Track FPS
        this.frameCount = (this.frameCount || 0) + 1;
        this.frameTimeAccum = (this.frameTimeAccum || 0) + deltaTime;
        
        // Update FPS every second
        if (this.frameTimeAccum >= 1.0) {
            this.currentFPS = this.frameCount / this.frameTimeAccum;
            this.frameCount = 0;
            this.frameTimeAccum = 0;
            
            // Emit performance metrics
            this.eventSystem.emitThrottled(GameEvents.PERFORMANCE_UPDATE, {
                fps: this.currentFPS,
                eventMetrics: this.eventSystem.getAllMetrics()
            }, 1000);
        }
    }
    
    updateLoadingProgress(percent, text) {
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');
        
        if (progressBar) {
            progressBar.style.width = percent + '%';
        }
        
        if (loadingText) {
            loadingText.textContent = text;
        }
    }
    
    // Public API for debugging
    addEnergy(amount) {
        this.gameState.addEnergy(amount);
    }
    
    addCrystals(amount) {
        this.gameState.addCrystals(amount);
    }
    
    levelUp() {
        this.gameState.levelUp();
    }
    
    unlockAllAchievements() {
        GameConfig.ACHIEVEMENTS.forEach(achievement => {
            if (!this.gameState.achievements[achievement.id]) {
                this.gameState.unlockAchievement(achievement.id);
            }
        });
    }
};