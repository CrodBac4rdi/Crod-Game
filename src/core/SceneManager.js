// 3D Scene Manager
window.SceneManager = class SceneManager {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.raycaster = null;
        this.mouse = null; // Will be initialized when THREE is available
        
        // Objects
        this.cosmicOrb = null;
        this.particles = [];
        this.backgroundStars = [];
        
        // Performance optimizations
        this.particlePool = [];
        this.maxParticles = 100;
        this.frameCount = 0;
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS;
        this.lastFrameTime = 0;
        this.updatePerformanceSettings();
        
        // Animation
        this.clock = new THREE.Clock();
        this.orbRotation = 0;
        
        // Graphics settings
        this.graphicsQuality = 'medium';
    }
    
    init(canvas) {
        // Initialize mouse vector now that THREE is available
        this.mouse = new THREE.Vector2();
        
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
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.8;
        
        // Raycaster for click detection
        this.raycaster = new THREE.Raycaster();
        
        // Create cosmic orb
        this.createCosmicOrb();
        
        // Create background
        this.createBackground();
        
        // Add lights
        this.createLights();
        
        // Setup events
        this.setupEvents();
        
        // Initialize particle pool
        this.initParticlePool();
        
        // Start render loop
        this.animate();
    }
    
    createCosmicOrb() {
        // Create main orb
        const geometry = new THREE.SphereGeometry(5, 64, 64);
        
        // Create shader material for cosmic effect
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Color(0x00d4ff) },
                color2: { value: new THREE.Color(0xff00ff) }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vec3 viewDirection = normalize(cameraPosition - vPosition);
                    float fresnel = 1.0 - max(dot(vNormal, viewDirection), 0.0);
                    fresnel = pow(fresnel, 2.0);
                    
                    float pulse = sin(time * 2.0) * 0.5 + 0.5;
                    vec3 color = mix(color1, color2, fresnel + pulse * 0.2);
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `
        });
        
        this.cosmicOrb = new THREE.Mesh(geometry, material);
        this.scene.add(this.cosmicOrb);
        
        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(6, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00d4ff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.cosmicOrb.add(glow);
        
        // Add inner core
        const coreGeometry = new THREE.SphereGeometry(4.5, 32, 32);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        this.cosmicOrb.add(core);
    }
    
    createBackground() {
        // Create optimized starfield
        const starsGeometry = new THREE.BufferGeometry();
        const starPositions = [];
        const starColors = [];
        const starSizes = [];
        
        // Create dynamic star count based on graphics settings
        const starCount = GameConfig.GRAPHICS_PRESETS[this.graphicsQuality].starCount;
        for (let i = 0; i < starCount; i++) {
            const x = (Math.random() - 0.5) * 300;
            const y = (Math.random() - 0.5) * 300;
            const z = -Math.random() * 200 - 50;
            
            starPositions.push(x, y, z);
            
            // Random star colors
            const colorChoice = Math.random();
            if (colorChoice < 0.3) {
                starColors.push(1.0, 0.8, 0.6); // Warm white
            } else if (colorChoice < 0.6) {
                starColors.push(0.6, 0.8, 1.0); // Cool blue
            } else {
                starColors.push(1.0, 1.0, 1.0); // Pure white
            }
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
        starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
        this.backgroundStars.push(stars);
    }
    
    createLights() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambient);
        
        // Main directional light
        const directional = new THREE.DirectionalLight(0xffffff, 0.8);
        directional.position.set(10, 10, 5);
        this.scene.add(directional);
        
        // Point lights for color
        const pointLight1 = new THREE.PointLight(0x00d4ff, 0.5, 50);
        pointLight1.position.set(20, 0, 0);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xff00ff, 0.5, 50);
        pointLight2.position.set(-20, 0, 0);
        this.scene.add(pointLight2);
    }
    
    initParticlePool() {
        // Pre-create particles for better performance
        for (let i = 0; i < this.maxParticles; i++) {
            const geometry = new THREE.SphereGeometry(0.2, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0x00ff88,
                transparent: true,
                opacity: 0
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.visible = false;
            particle.inUse = false;
            this.scene.add(particle);
            this.particlePool.push(particle);
        }
    }
    
    getParticleFromPool() {
        for (let i = 0; i < this.particlePool.length; i++) {
            if (!this.particlePool[i].inUse) {
                return this.particlePool[i];
            }
        }
        return null;
    }
    
    returnParticleToPool(particle) {
        particle.inUse = false;
        particle.visible = false;
        particle.material.opacity = 0;
    }
    
    setupEvents() {
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Mouse move
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        
        // Click event
        this.eventSystem.on(GameEvents.CLICK_3D, (data) => {
            this.handleOrbClick(data);
        });
        
        // Particle spawn event
        this.eventSystem.on(GameEvents.PARTICLE_SPAWN, (data) => {
            this.spawnParticles(data);
        });
    }
    
    handleOrbClick(data) {
        // Orb pulse animation
        const scale = this.cosmicOrb.scale;
        const targetScale = 1.2;
        
        // Use tween-like animation
        let progress = 0;
        const animate = () => {
            progress += 0.1;
            if (progress >= 1) return;
            
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentScale = 1 + (targetScale - 1) * (1 - eased);
            scale.set(currentScale, currentScale, currentScale);
            
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    spawnParticles(data) {
        const particleCount = Math.min(data.count || 10, 20); // Reduced max particles
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticleFromPool();
            if (!particle) break; // Pool exhausted
            
            // Activate particle
            particle.inUse = true;
            particle.visible = true;
            particle.material.color.setHex(data.color || 0x00ff88);
            particle.material.opacity = 1;
            
            // Random position around orb
            const angle = Math.random() * Math.PI * 2;
            const radius = 5 + Math.random() * 2;
            particle.position.x = Math.cos(angle) * radius;
            particle.position.y = Math.sin(angle) * radius;
            particle.position.z = (Math.random() - 0.5) * 2;
            
            // Random velocity
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                Math.random() * 0.5 + 0.2,
                (Math.random() - 0.5) * 0.5
            );
            
            particle.lifetime = 1;
            this.particles.push(particle);
        }
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            if (!particle.inUse) continue;
            
            // Update position
            particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
            
            // Update lifetime
            particle.lifetime -= deltaTime;
            particle.material.opacity = particle.lifetime;
            
            // Return to pool when dead
            if (particle.lifetime <= 0) {
                this.returnParticleToPool(particle);
                this.particles.splice(i, 1);
            }
        }
    }
    
    updatePerformanceSettings() {
        const preset = GameConfig.GRAPHICS_PRESETS[this.graphicsQuality];
        
        // Update FPS settings
        this.targetFPS = preset.targetFPS;
        this.frameTime = 1000 / this.targetFPS;
        
        // Update particle settings
        this.maxParticles = preset.particleCount;
    }
    
    updateGraphicsQuality(quality) {
        this.graphicsQuality = quality;
        const preset = GameConfig.GRAPHICS_PRESETS[quality];
        
        // Update performance settings
        this.updatePerformanceSettings();
        
        // Update renderer settings
        if (this.renderer) {
            this.renderer.setPixelRatio(preset.antialias ? window.devicePixelRatio : 1);
            
            // Update shadows
            this.renderer.shadowMap.enabled = preset.shadowQuality > 0;
        }
        
        // Would update post-processing here if implemented
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const now = performance.now();
        
        // FPS limiting for better performance
        if (now - this.lastFrameTime < this.frameTime) {
            return;
        }
        
        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();
        
        // Update orb rotation
        this.orbRotation += deltaTime * 0.5;
        this.cosmicOrb.rotation.y = this.orbRotation;
        
        // Update orb shader
        if (this.cosmicOrb.material.uniforms) {
            this.cosmicOrb.material.uniforms.time.value = elapsedTime;
        }
        
        // Floating animation
        this.cosmicOrb.position.y = Math.sin(elapsedTime * 0.5) * 0.5;
        
        // Update particles (only if there are any)
        if (this.particles.length > 0) {
            this.updateParticles(deltaTime);
        }
        
        // Rotate star background slowly (throttled)
        this.frameCount++;
        if (this.frameCount % 3 === 0) { // Update every 3rd frame
            this.backgroundStars.forEach(stars => {
                stars.rotation.y += deltaTime * 0.01;
            });
        }
        
        // Camera follow mouse slightly (throttled)
        if (this.frameCount % 2 === 0) { // Update every 2nd frame
            this.camera.position.x += (this.mouse.x * 5 - this.camera.position.x) * 0.05;
            this.camera.position.y += (this.mouse.y * 5 - this.camera.position.y) * 0.05;
            this.camera.lookAt(this.scene.position);
        }
        
        // Render
        this.renderer.render(this.scene, this.camera);
        
        // Emit update event (throttled)
        if (this.frameCount % 5 === 0) { // Update every 5th frame
            this.eventSystem.emit(GameEvents.SCENE_UPDATE, { deltaTime, elapsedTime });
        }
        
        this.lastFrameTime = now;
    }
    
    // Check if click hits the orb
    checkOrbHit(x, y) {
        // Convert to normalized device coordinates
        const mouse = new THREE.Vector2(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1
        );
        
        this.raycaster.setFromCamera(mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.cosmicOrb, true);
        
        return intersects.length > 0;
    }
};