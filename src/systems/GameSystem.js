// Game System - Core Game Logic Only
class GameSystem {
    constructor() {
        this.gameState = {
            energy: 0,
            crystals: 0,
            level: 1,
            xp: 0,
            xpRequired: 100,
            clickPower: 1,
            energyPerSecond: 0,
            totalClicks: 0,
            playtime: 0
        };
        
        this.isRunning = false;
        this.lastUpdateTime = 0;
        
        this.configSystem = null;
        this.eventSystem = null;
        this.uiSystem = null;
        this.sceneSystem = null;
    }
    
    async init() {
        // Get dependencies
        this.configSystem = window.gameShell.getSystem('config');
        this.eventSystem = window.gameShell.getSystem('events');
        this.uiSystem = window.gameShell.getSystem('ui');
        this.sceneSystem = window.gameShell.getSystem('scene');
        
        if (!this.configSystem || !this.eventSystem || !this.uiSystem || !this.sceneSystem) {
            throw new Error('GameSystem dependencies not found');
        }
        
        try {
            console.log('[GameSystem] Initializing game logic...');
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize game state
            this.initializeGameState();
            
            console.log('[GameSystem] Game logic initialized successfully');
            
        } catch (error) {
            console.error('[GameSystem] Failed to initialize game logic:', error);
            throw error;
        }
    }
    
    setupEventListeners() {
        // Listen for canvas clicks
        this.eventSystem.on('canvas-click', (data) => {
            this.handleClick(data.x, data.y);
        });
    }
    
    initializeGameState() {
        // Load from config
        this.gameState.energy = this.configSystem.get('INITIAL_ENERGY');
        this.gameState.crystals = this.configSystem.get('INITIAL_CRYSTALS');
        this.gameState.level = this.configSystem.get('INITIAL_LEVEL');
        this.gameState.xpRequired = this.configSystem.get('BASE_XP_REQUIREMENT');
        this.gameState.clickPower = this.configSystem.get('BASE_CLICK_VALUE');
        
        // Update UI
        this.updateUI();
    }
    
    handleClick(x, y) {
        // Check if click hits the orb
        if (this.sceneSystem.checkOrbClick(x, y)) {
            this.performClick(x, y);
        }
    }
    
    performClick(x, y) {
        // Add energy
        this.gameState.energy += this.gameState.clickPower;
        this.gameState.totalClicks++;
        
        // Add XP
        this.addXP(1);
        
        // Show floating text
        this.uiSystem.showFloatingText(`+${this.gameState.clickPower}`, x, y, '#00ff88');
        
        // Update UI
        this.updateUI();
        
        // Emit click event
        this.eventSystem.emit('energy-gained', {
            amount: this.gameState.clickPower,
            total: this.gameState.energy
        });
        
        console.log(`[GameSystem] Click! Energy: ${this.gameState.energy}`);
    }
    
    addXP(amount) {
        this.gameState.xp += amount;
        
        // Check for level up
        while (this.gameState.xp >= this.gameState.xpRequired) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.gameState.xp -= this.gameState.xpRequired;
        this.gameState.level++;
        
        // Increase XP requirement
        const growthRate = this.configSystem.get('XP_GROWTH_RATE');
        this.gameState.xpRequired = Math.floor(this.gameState.xpRequired * growthRate);
        
        // Increase click power
        this.gameState.clickPower++;
        
        // Show notification
        this.uiSystem.showNotification(`Level Up! You are now level ${this.gameState.level}`, 'success');
        
        console.log(`[GameSystem] Level up! Level: ${this.gameState.level}`);
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastUpdateTime = Date.now();
        this.gameLoop();
        
        // Start scene animation
        this.sceneSystem.startAnimation();
        
        console.log('[GameSystem] Game started');
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const now = Date.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000; // Convert to seconds
        this.lastUpdateTime = now;
        
        // Update playtime
        this.gameState.playtime += deltaTime;
        
        // Passive energy generation (if any)
        if (this.gameState.energyPerSecond > 0) {
            this.gameState.energy += this.gameState.energyPerSecond * deltaTime;
            this.updateUI();
        }
        
        // Schedule next frame
        requestAnimationFrame(() => this.gameLoop());
    }
    
    updateUI() {
        this.uiSystem.updateEnergy(this.gameState.energy, this.gameState.energyPerSecond);
        this.uiSystem.updateCrystals(this.gameState.crystals);
        this.uiSystem.updateLevel(this.gameState.level);
        this.uiSystem.updateXP(this.gameState.xp, this.gameState.xpRequired);
    }
    
    stop() {
        this.isRunning = false;
        this.sceneSystem.stopAnimation();
    }
    
    // Public API for debugging
    addEnergy(amount) {
        this.gameState.energy += amount;
        this.updateUI();
    }
    
    addCrystals(amount) {
        this.gameState.crystals += amount;
        this.updateUI();
    }
    
    forceLevel(level) {
        this.gameState.level = level;
        this.updateUI();
    }
    
    getState() {
        return { ...this.gameState };
    }
    
    dispose() {
        this.stop();
        this.gameState = null;
    }
}

window.GameSystem = GameSystem;