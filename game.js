// Unified Cosmic Clicker Game
const GAME = {
    // Core state
    energy: 0,
    clicks: 0,
    level: 1,
    running: false,
    
    // 3D objects
    scene: null,
    camera: null,
    renderer: null,
    orb: null,
    
    // Debug system
    debug: (msg) => {
        console.log(`[GAME] ${msg}`);
    },
    
    // Initialize game
    async init() {
        try {
            this.debug('🚀 Starting unified game initialization...');
            
            // Update loading text
            const loadingText = document.getElementById('loading-text');
            if (loadingText) loadingText.textContent = 'Setting up 3D scene...';
            
            // Initialize 3D scene
            await this.initScene();
            
            if (loadingText) loadingText.textContent = 'Setting up game logic...';
            
            // Setup game logic
            this.setupGameLogic();
            
            if (loadingText) loadingText.textContent = 'Ready to play\!';
            
            // Show game, hide loading
            setTimeout(() => {
                document.getElementById('loading-screen').style.display = 'none';
                document.getElementById('game-container').style.display = 'block';
                this.running = true;
                this.debug('✅ Game is now running\!');
            }, 500);
            
        } catch (error) {
            this.debug('❌ Initialization failed: ' + error.message);
            throw error;
        }
    },
    
    // Initialize 3D scene
    async initScene() {
        this.debug('Creating 3D scene...');
        
        const canvas = document.getElementById('game-canvas');
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f);
        this.scene.fog = new THREE.Fog(0x0a0a0f, 50, 200);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.z = 30;
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Create cosmic orb
        this.createCosmicOrb();
        
        // Lights
        this.setupLights();
        
        // Start animation loop
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        this.debug('✅ 3D scene created successfully');
    },
    
    // Create the cosmic orb
    createCosmicOrb() {
        const geometry = new THREE.SphereGeometry(5, 64, 64);
        
        // Glowing material
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            emissive: 0x004444,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });
        
        this.orb = new THREE.Mesh(geometry, material);
        this.scene.add(this.orb);
        
        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(6, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.orb.add(glow);
        
        this.debug('✅ Cosmic orb created');
    },
    
    // Setup lighting
    setupLights() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambient);
        
        // Directional light
        const directional = new THREE.DirectionalLight(0xffffff, 1);
        directional.position.set(10, 10, 5);
        this.scene.add(directional);
        
        // Point lights for color
        const pointLight1 = new THREE.PointLight(0x00ffff, 1, 50);
        pointLight1.position.set(20, 0, 0);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xff00ff, 1, 50);
        pointLight2.position.set(-20, 0, 0);
        this.scene.add(pointLight2);
        
        this.debug('✅ Lighting setup complete');
    },
    
    // Setup game logic
    setupGameLogic() {
        // Click handler
        const canvas = document.getElementById('game-canvas');
        canvas.addEventListener('click', (event) => {
            this.handleClick();
        });
        
        // Update UI
        this.updateUI();
        
        this.debug('✅ Game logic setup complete');
    },
    
    // Handle click/tap
    handleClick() {
        if (\!this.running) return;
        
        this.clicks++;
        this.energy++;
        
        // Orb animation
        if (this.orb) {
            this.orb.scale.setScalar(1.3);
            setTimeout(() => {
                this.orb.scale.setScalar(1);
            }, 150);
        }
        
        // Update UI
        this.updateUI();
        
        // Level up logic
        if (this.energy >= this.level * 100) {
            this.levelUp();
        }
    },
    
    // Level up
    levelUp() {
        this.level++;
        this.debug(`🎉 Level up\! Now level ${this.level}`);
        this.updateUI();
    },
    
    // Update UI
    updateUI() {
        const energyElement = document.getElementById('energy-value');
        const clicksElement = document.getElementById('clicks-value');
        const levelElement = document.getElementById('level-value');
        
        if (energyElement) energyElement.textContent = this.energy;
        if (clicksElement) clicksElement.textContent = this.clicks;
        if (levelElement) levelElement.textContent = this.level;
    },
    
    // Animation loop
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.orb) {
            // Rotate the orb
            this.orb.rotation.y += 0.01;
            this.orb.rotation.x += 0.005;
            
            // Floating animation
            this.orb.position.y = Math.sin(Date.now() * 0.001) * 0.5;
        }
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    },
    
    // Get game stats for debugging
    getStats() {
        return {
            energy: this.energy,
            clicks: this.clicks,
            level: this.level,
            running: this.running,
            hasOrb: \!\!this.orb,
            hasScene: \!\!this.scene
        };
    }
};

// Make GAME globally accessible
window.GAME = GAME;
EOF < /dev/null
