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
        try {
            // Show detailed loading progress
            console.log('Starting initialization...');
            this.updateLoadingProgress(5, 'Checking systems...');
            await new Promise(r => setTimeout(r, 100));
            
            this.updateLoadingProgress(10, 'Initializing core systems...');
            await new Promise(r => setTimeout(r, 100));
            
            // Load save data
            this.updateLoadingProgress(20, 'Loading save data...');
            const saveData = this.saveManager.load();
            if (saveData) {
                this.gameState.loadSave(saveData);
            }
            await new Promise(r => setTimeout(r, 100));
            
            // Initialize 3D scene
            this.updateLoadingProgress(30, 'Generating cosmic orb...');
            const canvas = document.getElementById('game-canvas');
            await new Promise(r => setTimeout(r, 100));
            
            this.updateLoadingProgress(40, 'Creating universe...');
            this.sceneManager.init(canvas);
            await new Promise(r => setTimeout(r, 200));
            
            this.updateLoadingProgress(50, 'Spawning stars...');
            await new Promise(r => setTimeout(r, 100));
            
            // Initialize UI managers
            this.updateLoadingProgress(60, 'Building interface...');
            this.notificationManager = new NotificationManager(this.eventSystem);
            await new Promise(r => setTimeout(r, 100));
            
            this.updateLoadingProgress(70, 'Loading effects system...');
            this.floatingTextManager = new FloatingTextManager(this.eventSystem);
            await new Promise(r => setTimeout(r, 100));
            
            this.updateLoadingProgress(75, 'Initializing UI...');
            this.uiManager = new UIManager(
                this.gameState,
                this.eventSystem,
                this.upgradeManager,
                this.achievementManager
            );
            await new Promise(r => setTimeout(r, 100));
            
            // Setup game events
            this.updateLoadingProgress(85, 'Connecting systems...');
            this.setupEvents();
            await new Promise(r => setTimeout(r, 100));
            
            // Enable auto-save if needed
            this.updateLoadingProgress(90, 'Configuring save system...');
            if (this.gameState.autoSave) {
                this.saveManager.enableAutoSave(this.gameState);
            }
            await new Promise(r => setTimeout(r, 100));
            
            // Start game loop
            this.updateLoadingProgress(95, 'Finalizing...');
            await new Promise(r => setTimeout(r, 100));
            
            this.updateLoadingProgress(100, 'READY TO LAUNCH!');
            
            // Hide loading screen
            setTimeout(() => {
                document.getElementById('loading-screen').style.display = 'none';
                document.getElementById('game-container').style.display = 'block';
                this.start();
                
                // Show welcome notification
                if (!saveData) {
                    this.eventSystem.emit(GameEvents.NOTIFICATION, {
                        text: 'Welcome to Cosmic Clicker 3D!',
                        type: 'info'
                    });
                } else {
                    this.eventSystem.emit(GameEvents.NOTIFICATION, {
                        text: 'Welcome back!',
                        type: 'success'
                    });
                }
            }, 500);
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.updateLoadingProgress(0, 'Error: ' + error.message);
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
        
        const now = Date.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000; // Convert to seconds
        this.lastUpdateTime = now;
        
        // Update game state
        this.gameState.update(deltaTime);
        
        // Schedule next frame
        requestAnimationFrame(() => this.gameLoop());
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