// Clean Game Shell - Modular Architecture
class GameShell {
    constructor() {
        this.systems = new Map();
        this.loadingSteps = [];
        this.currentStep = 0;
        this.isInitialized = false;
        this.debug = true;
        
        this.log('GameShell created');
    }
    
    log(message, type = 'info') {
        const timestamp = new Date().toISOString().substr(11, 12);
        console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
        
        if (this.debug) {
            this.updateLoadingText(`[${type.toUpperCase()}] ${message}`);
        }
    }
    
    error(message, error) {
        this.log(`ERROR: ${message}`, 'error');
        if (error) {
            console.error(error);
        }
        this.showError(message, error);
    }
    
    updateLoadingText(text) {
        const element = document.getElementById('loading-text');
        if (element) {
            element.textContent = text;
        }
    }
    
    updateProgress(percent) {
        const element = document.getElementById('loading-progress');
        if (element) {
            element.style.width = percent + '%';
        }
    }
    
    showError(message, error) {
        const element = document.getElementById('loading-text');
        if (element) {
            element.innerHTML = `
                <div style="color: #ff3366; font-size: 14px;">
                    <strong>Error:</strong> ${message}<br>
                    ${error ? `<strong>Details:</strong> ${error.message}<br>` : ''}
                    <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 10px; background: #00d4ff; color: #000; border: none; border-radius: 3px; cursor: pointer;">
                        Reload
                    </button>
                </div>
            `;
        }
    }
    
    // Add a system to the shell
    addSystem(name, systemClass, dependencies = []) {
        this.systems.set(name, {
            class: systemClass,
            instance: null,
            dependencies: dependencies,
            initialized: false
        });
        this.log(`System registered: ${name}`);
    }
    
    // Get a system instance
    getSystem(name) {
        const system = this.systems.get(name);
        return system ? system.instance : null;
    }
    
    // Initialize a single system
    async initializeSystem(name) {
        const system = this.systems.get(name);
        if (!system) {
            throw new Error(`System not found: ${name}`);
        }
        
        if (system.initialized) {
            this.log(`System already initialized: ${name}`);
            return system.instance;
        }
        
        // Check dependencies
        for (const dep of system.dependencies) {
            const depSystem = this.systems.get(dep);
            if (!depSystem || !depSystem.initialized) {
                throw new Error(`Dependency not initialized: ${dep} for ${name}`);
            }
        }
        
        this.log(`Initializing system: ${name}`);
        
        try {
            // Create instance
            system.instance = new system.class();
            
            // Initialize if it has an init method
            if (typeof system.instance.init === 'function') {
                await system.instance.init();
            }
            
            system.initialized = true;
            this.log(`System initialized: ${name}`, 'success');
            
            return system.instance;
            
        } catch (error) {
            this.error(`Failed to initialize system: ${name}`, error);
            throw error;
        }
    }
    
    // Initialize all systems in dependency order
    async initializeAllSystems() {
        const initOrder = this.getInitializationOrder();
        
        for (let i = 0; i < initOrder.length; i++) {
            const systemName = initOrder[i];
            const progress = Math.round((i / initOrder.length) * 80) + 10; // 10-90%
            
            this.updateProgress(progress);
            await this.initializeSystem(systemName);
            
            // Small delay for UI responsiveness
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
    
    // Calculate initialization order based on dependencies
    getInitializationOrder() {
        const order = [];
        const visited = new Set();
        const visiting = new Set();
        
        const visit = (name) => {
            if (visiting.has(name)) {
                throw new Error(`Circular dependency detected: ${name}`);
            }
            if (visited.has(name)) {
                return;
            }
            
            visiting.add(name);
            const system = this.systems.get(name);
            
            for (const dep of system.dependencies) {
                visit(dep);
            }
            
            visiting.delete(name);
            visited.add(name);
            order.push(name);
        };
        
        for (const name of this.systems.keys()) {
            visit(name);
        }
        
        return order;
    }
    
    // Main initialization
    async initialize() {
        if (this.isInitialized) {
            this.log('Shell already initialized');
            return;
        }
        
        try {
            this.log('Starting shell initialization...');
            this.updateProgress(5);
            
            // Step 1: Check Three.js
            this.log('Checking Three.js...');
            if (typeof THREE === 'undefined') {
                throw new Error('Three.js not loaded');
            }
            this.updateProgress(10);
            
            // Step 2: Initialize all systems
            this.log('Initializing systems...');
            await this.initializeAllSystems();
            this.updateProgress(90);
            
            // Step 3: Start the game
            this.log('Starting game...');
            await this.startGame();
            this.updateProgress(95);
            
            // Step 4: Show game
            this.log('Showing game...');
            this.showGame();
            this.updateProgress(100);
            
            this.isInitialized = true;
            this.log('Shell initialization complete!', 'success');
            
        } catch (error) {
            this.error('Shell initialization failed', error);
            throw error;
        }
    }
    
    async startGame() {
        const gameSystem = this.getSystem('game');
        if (gameSystem && typeof gameSystem.start === 'function') {
            await gameSystem.start();
        }
    }
    
    showGame() {
        const loadingScreen = document.getElementById('loading-screen');
        const gameContainer = document.getElementById('game-container');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        if (gameContainer) {
            gameContainer.style.display = 'block';
        }
    }
    
    // Dispose all systems
    dispose() {
        for (const [name, system] of this.systems) {
            if (system.instance && typeof system.instance.dispose === 'function') {
                system.instance.dispose();
            }
        }
        this.systems.clear();
        this.isInitialized = false;
    }
}

// Export globally
window.GameShell = GameShell;