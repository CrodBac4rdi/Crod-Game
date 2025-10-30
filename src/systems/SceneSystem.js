// Scene System - 3D Scene Management Only
class SceneSystem {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cosmicOrb = null;
        this.buildingInstances = {};
        this.buildingGeometries = {};
        this.starfields = [];
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
            
            // Pre-generate building geometries
            this.createBuildingGeometries();

            // Create starfield
            this.createStarfield();

            // Create basic lighting
            this.createLights();
            
            // Setup resize handler
            window.addEventListener('resize', () => this.handleResize());
            
            // Setup zoom handler
            window.addEventListener('wheel', (event) => this.handleZoom(event));

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
        const starLayers = [
            { count: 5000, color: 0xffffff, size: 0.5, speed: 0.0001 },
            { count: 3000, color: 0xaaaaff, size: 0.7, speed: 0.0002 },
            { count: 2000, color: 0xffaaff, size: 1.0, speed: 0.0003 },
        ];

        starLayers.forEach(layer => {
            const starVertices = [];
            for (let i = 0; i < layer.count; i++) {
                const x = THREE.MathUtils.randFloatSpread(2000);
                const y = THREE.MathUtils.randFloatSpread(2000);
                const z = THREE.MathUtils.randFloatSpread(2000);
                starVertices.push(x, y, z);
            }

            const starGeometry = new THREE.BufferGeometry();
            starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

            const starMaterial = new THREE.PointsMaterial({
                color: layer.color,
                size: layer.size
            });

            const starfield = new THREE.Points(starGeometry, starMaterial);
            starfield.userData.speed = layer.speed;
            this.starfields.push(starfield);
            this.scene.add(starfield);
        });
    }

    createLights() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambient);
        
        // Main light
        const directional = new THREE.DirectionalLight(0xffffff, 0.8);
        directional.position.set(10, 10, 5);
        this.scene.add(directional);

        const pointLight = new THREE.PointLight(0x00d4ff, 1, 100);
        pointLight.position.set(0, 0, 0);
        this.cosmicOrb.add(pointLight);
    }
    
    handleResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    handleZoom(event) {
        if (!this.camera) return;

        const zoomSpeed = 0.1;
        this.camera.position.z += event.deltaY * zoomSpeed;

        // Clamp the zoom level
        this.camera.position.z = Math.max(15, Math.min(this.camera.position.z, 60));
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

        this.starfields.forEach(starfield => {
            starfield.rotation.y += starfield.userData.speed;
        });

        const rotationSpeed = 0.005;
        Object.keys(this.buildingInstances).forEach((key, index) => {
            const instance = this.buildingInstances[key];
            instance.mesh.rotation.y += rotationSpeed * (index + 1);
        });


        // Render
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    stopAnimation() {
        this.isAnimating = false;
    }

    createBuildingGeometries() {
        this.buildingGeometries['gen1'] = new THREE.IcosahedronGeometry(0.8, 0);
        this.buildingGeometries['gen2'] = new THREE.SphereGeometry(0.7, 16, 16); // Simplified geometry
        this.buildingGeometries['gen3'] = new THREE.TorusKnotGeometry(0.7, 0.1, 100, 16);
        this.buildingGeometries['gen4'] = new THREE.TorusGeometry(0.7, 0.1, 16, 100);
        this.buildingGeometries['gen5'] = new THREE.CylinderGeometry(0.2, 0.5, 1, 32);
        this.buildingGeometries['gen6'] = new THREE.OctahedronGeometry(0.7, 0);
        this.buildingGeometries['gen7'] = new THREE.ConeGeometry(0.5, 1, 32);
    }

    addBuilding(building) {
        const MAX_INSTANCES = 1000;
        if (!this.buildingInstances[building.id]) {
            const geometry = this.buildingGeometries[building.id];
            const material = new THREE.MeshPhongMaterial({
                color: 0x00d4ff,
                emissive: 0x001122,
            });
            const mesh = new THREE.InstancedMesh(geometry, material, MAX_INSTANCES);
            this.scene.add(mesh);
            this.buildingInstances[building.id] = {
                mesh,
                count: 0,
                positions: []
            };
        }

        const instance = this.buildingInstances[building.id];
        if (instance.count >= MAX_INSTANCES) return;

        const radius = 10 + Object.keys(this.buildingInstances).indexOf(building.id) * 5;
        const angle = instance.count * (Math.PI / 4);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        instance.positions.push({ x, y: 0, z });

        const matrix = new THREE.Matrix4();
        matrix.setPosition(x, 0, z);
        instance.mesh.setMatrixAt(instance.count, matrix);
        instance.mesh.instanceMatrix.needsUpdate = true;
        instance.count++;
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