// SINGLE UNIFIED GAME OBJECT - NO MORE CHAOS
window.GAME = {
    // State
    loaded: false,
    running: false,
    error: null,
    
    // Core systems
    scene: null,
    renderer: null,
    camera: null,
    
    // Game data
    energy: 0,
    clicks: 0,
    level: 1,
    
    // Initialize everything step by step
    async init() {
        try {
            this.log('🚀 Starting UNIFIED game initialization...');
            
            // Step 1: Check THREE.js
            if (typeof THREE === 'undefined') {
                throw new Error('THREE.js not loaded');
            }
            this.log('✅ THREE.js available');
            
            // Step 2: Get canvas
            const canvas = document.getElementById('game-canvas');
            if (!canvas) {
                throw new Error('Canvas not found');
            }
            this.log('✅ Canvas found');
            
            // Step 3: Create renderer
            this.renderer = new THREE.WebGLRenderer({ canvas });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setClearColor(0x000011);
            this.log('✅ Renderer created');
            
            // Step 4: Create camera
            this.camera = new THREE.PerspectiveCamera(
                75, 
                window.innerWidth / window.innerHeight, 
                0.1, 
                1000
            );
            this.camera.position.z = 30;
            this.log('✅ Camera created');
            
            // Step 5: Create scene
            this.scene = new THREE.Scene();
            this.scene.fog = new THREE.Fog(0x000011, 50, 200);
            this.log('✅ Scene created');
            
            // Step 6: Create cosmic orb
            this.createOrb();
            this.log('✅ Orb created');
            
            // Step 7: Create stars
            this.createStars();
            this.log('✅ Stars created');
            
            // Step 8: Setup events
            this.setupEvents();
            this.log('✅ Events setup');
            
            // Step 9: Setup UI
            this.setupUI();
            this.log('✅ UI setup');
            
            // Step 10: Start game loop
            this.startGameLoop();
            this.log('✅ Game loop started');
            
            // Step 11: Hide loading screen
            this.hideLoadingScreen();
            this.log('✅ Loading screen hidden');
            
            this.loaded = true;
            this.running = true;
            this.log('🎉 GAME READY!');
            
        } catch (error) {
            this.error = error;
            this.showError(error);
            console.error('Game initialization failed:', error);
        }
    },
    
    createOrb() {
        const geometry = new THREE.SphereGeometry(5, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });
        
        this.orb = new THREE.Mesh(geometry, material);
        this.scene.add(this.orb);
        
        // Add glow
        const glowGeometry = new THREE.SphereGeometry(6, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.orb.add(glow);
    },
    
    createStars() {
        const starsGeometry = new THREE.BufferGeometry();
        const starPositions = [];
        
        for (let i = 0; i < 1000; i++) {
            starPositions.push(
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200
            );
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5
        });
        
        this.stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.stars);
    },
    
    setupEvents() {
        // Canvas click
        const canvas = document.getElementById('game-canvas');
        canvas.addEventListener('click', (event) => {
            this.handleClick(event);
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    },
    
    setupUI() {
        // Update energy display
        this.updateUI();
    },
    
    handleClick(event) {
        if (!this.running) return;
        
        // Simple click detection - if clicked anywhere on canvas
        this.energy += 1;
        this.clicks += 1;
        
        // Orb animation
        if (this.orb) {
            this.orb.scale.setScalar(1.2);
            setTimeout(() => {
                this.orb.scale.setScalar(1.0);
            }, 100);
        }
        
        this.updateUI();
        this.log(`Click! Energy: ${this.energy}`);
    },
    
    updateUI() {
        const energyElement = document.getElementById('energy-value');
        if (energyElement) {
            energyElement.textContent = this.energy;
        }
        
        const levelElement = document.getElementById('level-value');
        if (levelElement) {
            levelElement.textContent = this.level;
        }
    },
    
    startGameLoop() {
        const animate = () => {
            if (!this.running) return;
            
            requestAnimationFrame(animate);
            
            // Animate orb
            if (this.orb) {
                this.orb.rotation.y += 0.01;
                this.orb.position.y = Math.sin(Date.now() * 0.001) * 0.5;
            }
            
            // Animate stars
            if (this.stars) {
                this.stars.rotation.y += 0.0005;
            }
            
            // Render
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
    },
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const gameContainer = document.getElementById('game-container');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        if (gameContainer) {
            gameContainer.style.display = 'block';
        }
    },
    
    showError(error) {
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.innerHTML = `
                <div style="color: #ff3366; font-size: 16px; line-height: 1.4; text-align: center;">
                    <strong>❌ Game Error</strong><br><br>
                    ${error.message}<br><br>
                    <button onclick="location.reload()" style="padding: 10px 20px; background: #00ffff; color: #000; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                        🔄 Reload Game
                    </button>
                </div>
            `;
        }
    },
    
    log(message) {
        console.log(`[GAME] ${message}`);
        
        // Also update loading text if still visible
        const loadingText = document.getElementById('loading-text');
        if (loadingText && !this.loaded) {
            loadingText.textContent = message;
        }
    },
    
    // Public API
    addEnergy(amount) {
        this.energy += amount;
        this.updateUI();
    },
    
    getStats() {
        return {
            energy: this.energy,
            clicks: this.clicks,
            level: this.level,
            running: this.running,
            loaded: this.loaded
        };
    }
};