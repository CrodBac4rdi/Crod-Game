// Modulare Game Shell - Jedes System ist ein einzelnes Objekt
window.GameShell = class GameShell {
    constructor() {
        this.systems = {};
        this.initialized = false;
        this.step = 0;
        this.maxSteps = 10;
        
        console.log('🎮 GameShell created');
    }
    
    // Schritt-für-Schritt Initialisierung
    async init() {
        try {
            this.updateProgress(0, 'Starting GameShell...');
            
            // Schritt 1: THREE.js Check
            this.step = 1;
            await this.initStep1_ThreeJS();
            
            // Schritt 2: Config System
            this.step = 2;
            await this.initStep2_Config();
            
            // Schritt 3: Event System
            this.step = 3;
            await this.initStep3_Events();
            
            // Schritt 4: Game State
            this.step = 4;
            await this.initStep4_GameState();
            
            // Schritt 5: Scene System
            this.step = 5;
            await this.initStep5_Scene();
            
            // Schritt 6: UI System
            this.step = 6;
            await this.initStep6_UI();
            
            // Schritt 7: Game Logic
            this.step = 7;
            await this.initStep7_GameLogic();
            
            // Schritt 8: Input System
            this.step = 8;
            await this.initStep8_Input();
            
            // Schritt 9: Start Game Loop
            this.step = 9;
            await this.initStep9_GameLoop();
            
            // Schritt 10: Finalize
            this.step = 10;
            await this.initStep10_Finalize();
            
            this.initialized = true;
            console.log('✅ GameShell fully initialized');
            
        } catch (error) {
            console.error(`❌ GameShell failed at step ${this.step}:`, error);
            this.showError(error);
            throw error;
        }
    }
    
    // Schritt 1: THREE.js Check
    async initStep1_ThreeJS() {
        this.updateProgress(10, 'Checking 3D engine...');
        
        if (typeof THREE === 'undefined') {
            throw new Error('THREE.js not loaded');
        }
        
        this.systems.three = THREE;
        console.log('✅ Step 1: THREE.js ready');
        await this.delay(100);
    }
    
    // Schritt 2: Config System
    async initStep2_Config() {
        this.updateProgress(20, 'Loading configuration...');
        
        if (typeof GameConfig === 'undefined') {
            throw new Error('GameConfig not loaded');
        }
        
        this.systems.config = GameConfig;
        console.log('✅ Step 2: Config ready');
        await this.delay(100);
    }
    
    // Schritt 3: Event System
    async initStep3_Events() {
        this.updateProgress(30, 'Starting event system...');
        
        if (typeof EventSystem === 'undefined') {
            throw new Error('EventSystem not loaded');
        }
        
        this.systems.events = new EventSystem();
        console.log('✅ Step 3: Events ready');
        await this.delay(100);
    }
    
    // Schritt 4: Game State
    async initStep4_GameState() {
        this.updateProgress(40, 'Creating game state...');
        
        if (typeof GameState === 'undefined') {
            throw new Error('GameState not loaded');
        }
        
        this.systems.gameState = new GameState(this.systems.events);
        console.log('✅ Step 4: GameState ready');
        await this.delay(100);
    }
    
    // Schritt 5: Scene System
    async initStep5_Scene() {
        this.updateProgress(50, 'Creating 3D scene...');
        
        if (typeof SceneManager === 'undefined') {
            throw new Error('SceneManager not loaded');
        }
        
        const canvas = document.getElementById('game-canvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }
        
        this.systems.scene = new SceneManager(this.systems.events);
        this.systems.scene.init(canvas);
        console.log('✅ Step 5: Scene ready');
        await this.delay(200);
    }
    
    // Schritt 6: UI System
    async initStep6_UI() {
        this.updateProgress(60, 'Building interface...');
        
        // Notifications
        if (typeof NotificationManager === 'undefined') {
            throw new Error('NotificationManager not loaded');
        }
        this.systems.notifications = new NotificationManager(this.systems.events);
        
        // Floating Text
        if (typeof FloatingTextManager === 'undefined') {
            throw new Error('FloatingTextManager not loaded');
        }
        this.systems.floatingText = new FloatingTextManager(this.systems.events);
        
        // Main UI
        if (typeof UIManager === 'undefined') {
            throw new Error('UIManager not loaded');
        }
        
        // Create upgrade manager first
        if (typeof UpgradeManager === 'undefined') {
            throw new Error('UpgradeManager not loaded');
        }
        this.systems.upgrades = new UpgradeManager(this.systems.gameState, this.systems.events);
        
        // Create achievement manager
        if (typeof AchievementManager === 'undefined') {
            throw new Error('AchievementManager not loaded');
        }
        this.systems.achievements = new AchievementManager(this.systems.gameState, this.systems.events);
        
        // Now create UI manager
        this.systems.ui = new UIManager(
            this.systems.gameState,
            this.systems.events,
            this.systems.upgrades,
            this.systems.achievements
        );
        
        console.log('✅ Step 6: UI ready');
        await this.delay(200);
    }
    
    // Schritt 7: Game Logic
    async initStep7_GameLogic() {
        this.updateProgress(70, 'Setting up game logic...');
        
        // Click Manager
        if (typeof ClickManager === 'undefined') {
            throw new Error('ClickManager not loaded');
        }
        this.systems.clicks = new ClickManager(this.systems.gameState, this.systems.events);
        
        // Save Manager
        if (typeof SaveManager === 'undefined') {
            throw new Error('SaveManager not loaded');
        }
        this.systems.saves = new SaveManager(this.systems.events);
        
        // Load save data
        const saveData = this.systems.saves.load();
        if (saveData) {
            this.systems.gameState.loadSave(saveData);
        }
        
        console.log('✅ Step 7: Game Logic ready');
        await this.delay(100);
    }
    
    // Schritt 8: Input System
    async initStep8_Input() {
        this.updateProgress(80, 'Setting up input...');
        
        // Canvas click events
        const canvas = document.getElementById('game-canvas');
        canvas.addEventListener('click', (event) => {
            if (this.systems.scene.checkOrbHit && this.systems.scene.checkOrbHit(event.clientX, event.clientY)) {
                this.systems.clicks.handleClick(event.clientX, event.clientY);
            }
        });
        
        // Keyboard shortcuts
        window.addEventListener('keydown', (event) => {
            if (event.key === 's' && event.ctrlKey) {
                event.preventDefault();
                this.systems.saves.save(this.systems.gameState);
            }
        });
        
        // Window unload save
        window.addEventListener('beforeunload', () => {
            if (this.systems.saves && this.systems.gameState) {
                this.systems.saves.save(this.systems.gameState);
            }
        });
        
        console.log('✅ Step 8: Input ready');
        await this.delay(100);
    }
    
    // Schritt 9: Game Loop
    async initStep9_GameLoop() {
        this.updateProgress(90, 'Starting game loop...');
        
        this.lastUpdateTime = Date.now();
        this.isRunning = false;
        
        console.log('✅ Step 9: Game Loop ready');
        await this.delay(100);
    }
    
    // Schritt 10: Finalize
    async initStep10_Finalize() {
        this.updateProgress(95, 'Finalizing...');
        
        // Enable auto-save
        if (this.systems.gameState.autoSave) {
            this.systems.saves.enableAutoSave(this.systems.gameState);
        }
        
        // Make globally accessible
        window.game = this;
        
        this.updateProgress(100, 'READY TO LAUNCH!');
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('game-container').style.display = 'block';
            this.start();
            
            // Welcome message
            this.systems.events.emit('NOTIFICATION', {
                text: 'Welcome to Cosmic Clicker 3D!',
                type: 'info'
            });
        }, 500);
        
        console.log('✅ Step 10: Finalized');
        await this.delay(100);
    }
    
    // Game Loop
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
        const deltaTime = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;
        
        // Update game state
        if (this.systems.gameState) {
            this.systems.gameState.update(deltaTime);
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // Debug-Funktionen
    getSystem(name) {
        return this.systems[name];
    }
    
    listSystems() {
        return Object.keys(this.systems);
    }
    
    getSystemsStatus() {
        const status = {};
        for (const [name, system] of Object.entries(this.systems)) {
            status[name] = system ? '✅ Ready' : '❌ Failed';
        }
        return status;
    }
    
    // Utility Functions
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    updateProgress(percent, message) {
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');
        
        if (progressBar) {
            progressBar.style.width = percent + '%';
        }
        
        if (loadingText) {
            loadingText.textContent = message;
        }
        
        console.log(`Progress: ${percent}% - ${message}`);
    }
    
    showError(error) {
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.innerHTML = `
                <div style="color: #ff3366; font-size: 14px; line-height: 1.4;">
                    <strong>Error at Step ${this.step}:</strong><br>
                    ${error.message}<br><br>
                    <div style="font-size: 12px; opacity: 0.8;">
                        Systems loaded: ${Object.keys(this.systems).join(', ')}<br>
                        Debug: <code>window.gameShell.getSystemsStatus()</code>
                    </div><br>
                    <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #00d4ff; color: #000; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                        🔄 Reload
                    </button>
                </div>
            `;
        }
    }
};