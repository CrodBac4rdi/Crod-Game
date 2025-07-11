// Modular Game Shell - Main Container
window.GameShell = {
    modules: {},
    status: {},
    
    // Initialize the shell
    async init() {
        console.log('🚀 GameShell initializing...');
        this.updateStatus('shell', 'loading', 'Starting shell...');
        
        try {
            // Check Three.js
            if (typeof THREE === 'undefined') {
                throw new Error('Three.js not loaded');
            }
            this.updateStatus('three', 'success', 'Three.js ready');
            
            // Load modules one by one
            await this.loadModule('renderer', () => this.createRenderer());
            await this.loadModule('scene', () => this.createScene());
            await this.loadModule('orb', () => this.createOrb());
            await this.loadModule('ui', () => this.createUI());
            
            // Start the game loop
            this.startLoop();
            
            this.updateStatus('shell', 'success', 'Shell ready');
            this.showGame();
            
            console.log('✅ GameShell ready!');
            return true;
            
        } catch (error) {
            console.error('❌ Shell failed:', error);
            this.updateStatus('shell', 'error', error.message);
            this.showError(error);
            return false;
        }
    },
    
    // Load a single module
    async loadModule(name, factory) {
        try {
            this.updateStatus(name, 'loading', `Loading ${name}...`);
            const module = await factory();
            this.modules[name] = module;
            this.updateStatus(name, 'success', `${name} ready`);
            return module;
        } catch (error) {
            this.updateStatus(name, 'error', `${name} failed: ${error.message}`);
            throw error;
        }
    },
    
    // Create renderer module
    createRenderer() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) throw new Error('Canvas not found');
        
        const renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true 
        });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000011);
        
        // Handle resize
        window.addEventListener('resize', () => {
            const camera = this.modules.scene?.camera;
            if (camera) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
            }
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        return { renderer };
    },
    
    // Create scene module
    createScene() {
        const scene = new THREE.Scene();
        
        const camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        camera.position.z = 5;
        
        // Add some basic lighting
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 1, 1);
        scene.add(light);
        
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);
        
        return { scene, camera };
    },
    
    // Create orb module
    createOrb() {
        const sceneModule = this.modules.scene;
        if (!sceneModule) throw new Error('Scene module required');
        
        // Create orb
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x00d4ff,
            shininess: 100
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        sceneModule.scene.add(mesh);
        
        // Orb state
        let energy = 0;
        let rotation = 0;
        
        // Click detection
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        const canvas = document.getElementById('game-canvas');
        canvas.addEventListener('click', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, sceneModule.camera);
            const intersects = raycaster.intersectObject(mesh);
            
            if (intersects.length > 0) {
                energy++;
                
                // Visual feedback
                mesh.scale.setScalar(1.2);
                setTimeout(() => mesh.scale.setScalar(1.0), 100);
                
                // Update UI
                this.updateUI('energy', energy);
                
                console.log('🎯 Orb clicked! Energy:', energy);
            }
        });
        
        return {
            mesh,
            getEnergy: () => energy,
            update(deltaTime) {
                rotation += deltaTime;
                mesh.rotation.y = rotation;
                mesh.position.y = Math.sin(rotation * 2) * 0.2;
            }
        };
    },
    
    // Create UI module
    createUI() {
        // Create energy display
        const energyElement = document.getElementById('energy-value');
        if (!energyElement) {
            console.warn('Energy display element not found');
        }
        
        return {
            updateEnergy(value) {
                if (energyElement) {
                    energyElement.textContent = value;
                }
            }
        };
    },
    
    // Update UI elements
    updateUI(type, value) {
        const uiModule = this.modules.ui;
        if (!uiModule) return;
        
        switch (type) {
            case 'energy':
                uiModule.updateEnergy(value);
                break;
        }
    },
    
    // Start the game loop
    startLoop() {
        const clock = new THREE.Clock();
        
        const animate = () => {
            const deltaTime = clock.getDelta();
            
            // Update modules
            if (this.modules.orb) {
                this.modules.orb.update(deltaTime);
            }
            
            // Render
            const renderer = this.modules.renderer?.renderer;
            const scene = this.modules.scene?.scene;
            const camera = this.modules.scene?.camera;
            
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    },
    
    // Show the game
    showGame() {
        const loading = document.getElementById('loading-screen');
        const game = document.getElementById('game-container');
        
        if (loading) loading.style.display = 'none';
        if (game) game.style.display = 'block';
    },
    
    // Show error
    showError(error) {
        const loading = document.getElementById('loading-screen');
        const text = document.getElementById('loading-text');
        
        if (text) {
            text.innerHTML = `
                <div style="color: #ff3366; text-align: center;">
                    <strong>Error:</strong><br>
                    ${error.message}<br><br>
                    <button onclick="location.reload()" 
                            style="padding: 10px 20px; background: #00d4ff; color: #000; border: none; border-radius: 5px; cursor: pointer;">
                        🔄 Reload
                    </button>
                </div>
            `;
        }
    },
    
    // Update status display
    updateStatus(module, status, message) {
        this.status[module] = { status, message };
        
        // Update debug panel
        const statusList = document.getElementById('status-list');
        if (statusList) {
            const existing = document.getElementById(`status-${module}`);
            if (existing) existing.remove();
            
            const div = document.createElement('div');
            div.id = `status-${module}`;
            div.className = `status ${status}`;
            div.textContent = `${module}: ${message}`;
            statusList.appendChild(div);
        }
        
        // Update loading text
        const loadingText = document.getElementById('loading-text');
        if (loadingText && status === 'loading') {
            loadingText.textContent = message;
        }
    },
    
    // Get module
    getModule(name) {
        return this.modules[name];
    },
    
    // Restart
    restart() {
        location.reload();
    }
};