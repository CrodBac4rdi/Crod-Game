// Scene System - 3D Scene Management Only
class SceneSystem {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cosmicOrb = null;
        this.buildingContainer = null;
        this.isAnimating = false;
        
        this.configSystem = null;
        this.eventSystem = null;
    }
    
    async init() {
        // Get dependencies
        this.configSystem = window.gameShell.getSystem('config');
        this.eventSystem = window.gameShell.getSystem('events');
        
        if (!this.configSystem || !this.eventSystem) {
            throw new Error('SceneSystem dependencies not found');
        }
        
        try {
            console.log('[SceneSystem] Initializing 3D scene...');
            
            // Get canvas
            const canvas = document.getElementById('game-canvas');
            if (!canvas) {
                throw new Error('Game canvas not found');
            }
            
            // Create scene
            this.scene = new THREE.Scene();
            this.scene.fog = new THREE.Fog(0x0a0a0f, 50, 200);
            
            // Create camera
            this.camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            this.camera.position.z = 30;
            
            // Create renderer
            const graphicsPreset = this.configSystem.getGraphicsPreset('medium');
            this.renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: graphicsPreset.antialias,
                alpha: true
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            
            // Create cosmic orb
            this.createCosmicOrb();
            
            this.buildingContainer = new THREE.Group();
            this.scene.add(this.buildingContainer);

            // Create starfield
            this.createStarfield();

            // Create basic lighting
            this.createLights();
            
            // Setup resize handler
            window.addEventListener('resize', () => this.handleResize());
            
            this.eventSystem.on('building-purchased', (building) => {
                this.addBuilding(building);
            });

            console.log('[SceneSystem] Scene initialized successfully');
            
        } catch (error) {
            console.error('[SceneSystem] Failed to initialize scene:', error);
            throw error;
        }
    }
    
    createCosmicOrb() {
        // Simple cosmic orb
        const geometry = new THREE.SphereGeometry(5, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00d4ff,
            emissive: 0x001122,
            transparent: true,
            opacity: 0.9
        });
        
        this.cosmicOrb = new THREE.Mesh(geometry, material);
        this.scene.add(this.cosmicOrb);
        
        // Make orb clickable
        this.cosmicOrb.userData = { clickable: true };
    }
    
    createStarfield() {
        const starVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = THREE.MathUtils.randFloatSpread(2000);
            const y = THREE.MathUtils.randFloatSpread(2000);
            const z = THREE.MathUtils.randFloatSpread(2000);
            starVertices.push(x, y, z);
        }

        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.7
        });

        this.starfield = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.starfield);
    }

    createLights() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambient);
        
        // Main light
        const directional = new THREE.DirectionalLight(0xffffff, 0.8);
        directional.position.set(10, 10, 5);
        this.scene.add(directional);
    }
    
    handleResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    startAnimation() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.animate();
    }
    
    animate() {
        if (!this.isAnimating) return;
        
        // Simple orb rotation
        if (this.cosmicOrb) {
            this.cosmicOrb.rotation.y += 0.01;
            this.cosmicOrb.position.y = Math.sin(Date.now() * 0.001) * 0.5;
        }

        if (this.starfield) {
            this.starfield.rotation.y += 0.0001;
        }

        if (this.buildingContainer) {
            this.buildingContainer.rotation.y += 0.0005;
        }
        
        // Render
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    stopAnimation() {
        this.isAnimating = false;
    }
    
    addBuilding(building) {
        let geometry;
        switch (building.id) {
            case 'gen1':
                geometry = new THREE.BoxGeometry(1, 1, 1);
                break;
            case 'gen2':
                geometry = new THREE.ConeGeometry(1, 2, 8);
                break;
            case 'gen3':
                geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
                break;
            default:
                geometry = new THREE.BoxGeometry(1, 1, 1);
        }

        const material = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
        const mesh = new THREE.Mesh(geometry, material);

        const angle = Math.random() * Math.PI * 2;
        const radius = 10 + Math.random() * 5;
        mesh.position.x = Math.cos(angle) * radius;
        mesh.position.z = Math.sin(angle) * radius;

        this.buildingContainer.add(mesh);
    }

    // Check if click hits the orb
    checkOrbClick(x, y) {
        if (!this.camera || !this.cosmicOrb) return false;
        
        const mouse = new THREE.Vector2(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1
        );
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        const intersects = raycaster.intersectObject(this.cosmicOrb);
        return intersects.length > 0;
    }
    
    dispose() {
        this.stopAnimation();
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.scene) {
            // Dispose scene objects
            this.scene.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cosmicOrb = null;
    }
}

window.SceneSystem = SceneSystem;