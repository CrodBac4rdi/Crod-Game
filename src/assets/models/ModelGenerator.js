// Performance-optimized 3D Model Generator
window.ModelGenerator = class ModelGenerator {
    constructor(textureManager) {
        this.textureManager = textureManager;
        this.models = new Map();
        this.instancedMeshes = new Map();
        this.materialCache = new Map();
        
        // Performance settings
        this.maxInstances = 1000;
        this.lowPolyMode = true;
        this.lodLevels = 3;
    }
    
    // Create optimized solar panel model
    createSolarPanel(level = 0) {
        const cacheKey = `solar-panel-${level}`;
        if (this.models.has(cacheKey)) {
            return this.models.get(cacheKey).clone();
        }
        
        const group = new THREE.Group();
        
        // Base platform
        const baseGeometry = new THREE.BoxGeometry(2, 0.2, 2);
        const baseMaterial = this.getOrCreateMaterial('solar-base', {
            color: 0x444444,
            metalness: 0.8,
            roughness: 0.2
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        group.add(base);
        
        // Solar panels
        const panelCount = Math.min(4 + level, 12);
        for (let i = 0; i < panelCount; i++) {
            const panelGeometry = new THREE.PlaneGeometry(0.8, 0.8);
            const panelMaterial = this.getOrCreateMaterial('solar-panel', {
                color: 0x001133,
                metalness: 0.9,
                roughness: 0.1,
                emissive: 0x000011
            });
            
            const panel = new THREE.Mesh(panelGeometry, panelMaterial);
            const angle = (i / panelCount) * Math.PI * 2;
            const radius = 0.7 + level * 0.1;
            
            panel.position.set(
                Math.cos(angle) * radius,
                0.2 + Math.sin(angle) * 0.1,
                Math.sin(angle) * radius
            );
            panel.rotation.x = -Math.PI / 2 + Math.sin(angle) * 0.3;
            panel.rotation.z = angle;
            
            group.add(panel);
        }
        
        // Energy effect
        if (level > 0) {
            const effectGeometry = new THREE.SphereGeometry(0.3, 8, 8);
            const effectMaterial = this.getOrCreateMaterial('energy-effect', {
                color: 0x00ff88,
                transparent: true,
                opacity: 0.6,
                emissive: 0x002211
            });
            
            const effect = new THREE.Mesh(effectGeometry, effectMaterial);
            effect.position.y = 0.5;
            group.add(effect);
        }
        
        this.models.set(cacheKey, group);
        return group.clone();
    }
    
    // Create optimized fusion reactor model
    createFusionReactor(level = 0) {
        const cacheKey = `fusion-reactor-${level}`;
        if (this.models.has(cacheKey)) {
            return this.models.get(cacheKey).clone();
        }
        
        const group = new THREE.Group();
        
        // Main reactor core
        const coreGeometry = new THREE.SphereGeometry(1 + level * 0.1, 16, 16);
        const coreMaterial = this.getOrCreateMaterial('fusion-core', {
            color: 0xff4400,
            metalness: 0.1,
            roughness: 0.9,
            emissive: 0x441100,
            transparent: true,
            opacity: 0.8
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        group.add(core);
        
        // Containment rings
        const ringCount = 3 + Math.floor(level / 2);
        for (let i = 0; i < ringCount; i++) {
            const ringGeometry = new THREE.TorusGeometry(1.5 + i * 0.3, 0.1, 8, 16);
            const ringMaterial = this.getOrCreateMaterial('fusion-ring', {
                color: 0x0088ff,
                metalness: 0.9,
                roughness: 0.1,
                emissive: 0x001144
            });
            
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            ring.rotation.z = (i * Math.PI) / ringCount;
            group.add(ring);
        }
        
        // Support structure
        const supportGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3, 8);
        const supportMaterial = this.getOrCreateMaterial('fusion-support', {
            color: 0x666666,
            metalness: 0.8,
            roughness: 0.3
        });
        
        for (let i = 0; i < 4; i++) {
            const support = new THREE.Mesh(supportGeometry, supportMaterial);
            const angle = (i / 4) * Math.PI * 2;
            support.position.set(
                Math.cos(angle) * 2,
                -1.5,
                Math.sin(angle) * 2
            );
            group.add(support);
        }
        
        this.models.set(cacheKey, group);
        return group.clone();
    }
    
    // Create optimized quantum harvester model
    createQuantumHarvester(level = 0) {
        const cacheKey = `quantum-harvester-${level}`;
        if (this.models.has(cacheKey)) {
            return this.models.get(cacheKey).clone();
        }
        
        const group = new THREE.Group();
        
        // Central quantum crystal
        const crystalGeometry = new THREE.OctahedronGeometry(1 + level * 0.1, 0);
        const crystalMaterial = this.getOrCreateMaterial('quantum-crystal', {
            color: 0x8800ff,
            metalness: 0.2,
            roughness: 0.1,
            emissive: 0x220044,
            transparent: true,
            opacity: 0.9
        });
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        group.add(crystal);
        
        // Quantum field generators
        const generatorCount = 6 + level;
        for (let i = 0; i < generatorCount; i++) {
            const genGeometry = new THREE.TetrahedronGeometry(0.3, 0);
            const genMaterial = this.getOrCreateMaterial('quantum-generator', {
                color: 0x00ffff,
                metalness: 0.8,
                roughness: 0.2,
                emissive: 0x004444
            });
            
            const generator = new THREE.Mesh(genGeometry, genMaterial);
            const angle = (i / generatorCount) * Math.PI * 2;
            const radius = 2 + level * 0.1;
            
            generator.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle * 2) * 0.5,
                Math.sin(angle) * radius
            );
            generator.rotation.set(angle, angle * 2, angle * 3);
            
            group.add(generator);
        }
        
        this.models.set(cacheKey, group);
        return group.clone();
    }
    
    // Create optimized stellar engine model
    createStellarEngine(level = 0) {
        const cacheKey = `stellar-engine-${level}`;
        if (this.models.has(cacheKey)) {
            return this.models.get(cacheKey).clone();
        }
        
        const group = new THREE.Group();
        
        // Central star simulation
        const starGeometry = new THREE.IcosahedronGeometry(1.5 + level * 0.1, 1);
        const starMaterial = this.getOrCreateMaterial('stellar-core', {
            color: 0xffff00,
            metalness: 0.0,
            roughness: 0.8,
            emissive: 0x444400,
            transparent: true,
            opacity: 0.9
        });
        const star = new THREE.Mesh(starGeometry, starMaterial);
        group.add(star);
        
        // Dyson sphere segments
        const segmentCount = 12 + level * 2;
        for (let i = 0; i < segmentCount; i++) {
            const segmentGeometry = new THREE.RingGeometry(2.5, 3, 6, 1);
            const segmentMaterial = this.getOrCreateMaterial('dyson-segment', {
                color: 0x333333,
                metalness: 0.9,
                roughness: 0.1,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });
            
            const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
            segment.position.set(
                Math.random() * 2 - 1,
                Math.random() * 2 - 1,
                Math.random() * 2 - 1
            );
            segment.lookAt(0, 0, 0);
            
            group.add(segment);
        }
        
        this.models.set(cacheKey, group);
        return group.clone();
    }
    
    // Create optimized cosmic forge model
    createCosmicForge(level = 0) {
        const cacheKey = `cosmic-forge-${level}`;
        if (this.models.has(cacheKey)) {
            return this.models.get(cacheKey).clone();
        }
        
        const group = new THREE.Group();
        
        // Forge chamber
        const chamberGeometry = new THREE.CylinderGeometry(2, 2, 3, 12);
        const chamberMaterial = this.getOrCreateMaterial('forge-chamber', {
            color: 0x660033,
            metalness: 0.8,
            roughness: 0.4,
            emissive: 0x110011
        });
        const chamber = new THREE.Mesh(chamberGeometry, chamberMaterial);
        group.add(chamber);
        
        // Cosmic energy conduits
        const conduitCount = 8 + level;
        for (let i = 0; i < conduitCount; i++) {
            const conduitGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 6);
            const conduitMaterial = this.getOrCreateMaterial('cosmic-conduit', {
                color: 0x9900ff,
                metalness: 0.9,
                roughness: 0.1,
                emissive: 0x330044
            });
            
            const conduit = new THREE.Mesh(conduitGeometry, conduitMaterial);
            const angle = (i / conduitCount) * Math.PI * 2;
            
            conduit.position.set(
                Math.cos(angle) * 2.5,
                0,
                Math.sin(angle) * 2.5
            );
            conduit.rotation.z = angle + Math.PI / 2;
            
            group.add(conduit);
        }
        
        // Reality distortion field
        const fieldGeometry = new THREE.SphereGeometry(3 + level * 0.1, 16, 16);
        const fieldMaterial = this.getOrCreateMaterial('reality-field', {
            color: 0x00ff00,
            metalness: 0.0,
            roughness: 1.0,
            emissive: 0x002200,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        group.add(field);
        
        this.models.set(cacheKey, group);
        return group.clone();
    }
    
    // Create particle effect models
    createParticleModel(type = 'energy') {
        const cacheKey = `particle-${type}`;
        if (this.models.has(cacheKey)) {
            return this.models.get(cacheKey).clone();
        }
        
        let geometry, material;
        
        switch (type) {
            case 'energy':
                geometry = new THREE.SphereGeometry(0.1, 6, 6);
                material = this.getOrCreateMaterial('energy-particle', {
                    color: 0x00ff88,
                    emissive: 0x004422,
                    transparent: true,
                    opacity: 0.8
                });
                break;
                
            case 'crystal':
                geometry = new THREE.OctahedronGeometry(0.1, 0);
                material = this.getOrCreateMaterial('crystal-particle', {
                    color: 0x8800ff,
                    emissive: 0x220044,
                    transparent: true,
                    opacity: 0.9
                });
                break;
                
            case 'star':
                geometry = new THREE.SphereGeometry(0.05, 4, 4);
                material = this.getOrCreateMaterial('star-particle', {
                    color: 0xffff00,
                    emissive: 0x444400,
                    transparent: true,
                    opacity: 0.9
                });
                break;
                
            default:
                geometry = new THREE.SphereGeometry(0.1, 6, 6);
                material = this.getOrCreateMaterial('default-particle', {
                    color: 0xffffff,
                    emissive: 0x333333,
                    transparent: true,
                    opacity: 0.8
                });
        }
        
        const particle = new THREE.Mesh(geometry, material);
        this.models.set(cacheKey, particle);
        return particle.clone();
    }
    
    // Material caching system for performance
    getOrCreateMaterial(name, options) {
        if (this.materialCache.has(name)) {
            return this.materialCache.get(name);
        }
        
        const material = new THREE.MeshStandardMaterial(options);
        this.materialCache.set(name, material);
        return material;
    }
    
    // Create LOD versions of models
    createLODModel(modelName, level = 0) {
        const lod = new THREE.LOD();
        
        // High detail (close)
        const highDetail = this.createModel(modelName, level);
        lod.addLevel(highDetail, 0);
        
        // Medium detail (mid distance)
        const mediumDetail = this.createModel(modelName, level, 0.5);
        lod.addLevel(mediumDetail, 50);
        
        // Low detail (far distance)
        const lowDetail = this.createModel(modelName, level, 0.25);
        lod.addLevel(lowDetail, 100);
        
        return lod;
    }
    
    // Create model with detail level
    createModel(modelName, level = 0, detailLevel = 1.0) {
        switch (modelName) {
            case 'solar_panel':
                return this.createSolarPanel(level);
            case 'fusion_reactor':
                return this.createFusionReactor(level);
            case 'quantum_harvester':
                return this.createQuantumHarvester(level);
            case 'stellar_engine':
                return this.createStellarEngine(level);
            case 'cosmic_forge':
                return this.createCosmicForge(level);
            default:
                return this.createSolarPanel(level);
        }
    }
    
    // Preload all models
    preloadModels() {
        const generators = ['solar_panel', 'fusion_reactor', 'quantum_harvester', 'stellar_engine', 'cosmic_forge'];
        const particles = ['energy', 'crystal', 'star'];
        
        console.log('Preloading 3D models...');
        
        // Preload generators at different levels
        generators.forEach(generator => {
            for (let level = 0; level <= 10; level++) {
                this.createModel(generator, level);
            }
        });
        
        // Preload particles
        particles.forEach(particle => {
            this.createParticleModel(particle);
        });
        
        console.log(`Model preloading complete. Loaded ${this.models.size} models.`);
    }
    
    // Dispose all models
    dispose() {
        this.models.forEach(model => {
            model.traverse(child => {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        });
        
        this.materialCache.forEach(material => {
            material.dispose();
        });
        
        this.models.clear();
        this.materialCache.clear();
    }
};