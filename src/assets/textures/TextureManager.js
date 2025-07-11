// Performance-optimized Texture Manager
window.TextureManager = class TextureManager {
    constructor() {
        this.textures = new Map();
        this.loadingPromises = new Map();
        this.textureCache = new Map();
        this.maxTextureSize = 1024;
        this.compressionSupported = false;
        
        // Performance tracking
        this.loadedCount = 0;
        this.totalSize = 0;
        this.maxMemory = 100 * 1024 * 1024; // 100MB limit
        
        this.checkWebGLSupport();
    }
    
    checkWebGLSupport() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl) {
            // Check for texture compression support
            const ext = gl.getExtension('WEBGL_compressed_texture_s3tc') ||
                       gl.getExtension('WEBGL_compressed_texture_etc1') ||
                       gl.getExtension('WEBGL_compressed_texture_astc');
            
            this.compressionSupported = !!ext;
            
            // Check max texture size
            this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
            this.maxTextureSize = Math.min(this.maxTextureSize, 2048); // Cap for performance
        }
    }
    
    // Load texture with performance optimization
    async loadTexture(name, url, options = {}) {
        if (this.textures.has(name)) {
            return this.textures.get(name);
        }
        
        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name);
        }
        
        const promise = this.loadTextureInternal(url, options);
        this.loadingPromises.set(name, promise);
        
        try {
            const texture = await promise;
            this.textures.set(name, texture);
            this.loadedCount++;
            this.loadingPromises.delete(name);
            return texture;
        } catch (error) {
            console.error(`Failed to load texture ${name}:`, error);
            this.loadingPromises.delete(name);
            return null;
        }
    }
    
    async loadTextureInternal(url, options = {}) {
        const loader = new THREE.TextureLoader();
        
        return new Promise((resolve, reject) => {
            loader.load(
                url,
                (texture) => {
                    this.optimizeTexture(texture, options);
                    resolve(texture);
                },
                undefined,
                reject
            );
        });
    }
    
    optimizeTexture(texture, options = {}) {
        // Set wrapping
        texture.wrapS = options.wrapS || THREE.ClampToEdgeWrapping;
        texture.wrapT = options.wrapT || THREE.ClampToEdgeWrapping;
        
        // Set filtering based on performance needs
        if (options.pixelated) {
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
        } else {
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = options.mipmap ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
        }
        
        // Generate mipmaps for better performance at distance
        if (options.mipmap !== false) {
            texture.generateMipmaps = true;
        }
        
        // Set anisotropy for better quality at angles
        const maxAnisotropy = options.anisotropy || 4;
        texture.anisotropy = Math.min(maxAnisotropy, 16);
        
        // Mark as needing update
        texture.needsUpdate = true;
        
        // Calculate texture size for memory tracking
        const size = this.calculateTextureSize(texture);
        this.totalSize += size;
        
        // Check memory limits
        if (this.totalSize > this.maxMemory) {
            console.warn('Texture memory limit exceeded:', this.totalSize / (1024 * 1024), 'MB');
            this.cleanupOldTextures();
        }
    }
    
    calculateTextureSize(texture) {
        const image = texture.image;
        if (!image) return 0;
        
        const width = image.width || image.videoWidth || 256;
        const height = image.height || image.videoHeight || 256;
        
        // Estimate size (RGBA = 4 bytes per pixel)
        return width * height * 4;
    }
    
    // Create procedural textures for better performance
    createProceduralTexture(name, width, height, generator) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Generate texture data
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const color = generator(x / width, y / height);
                
                data[index] = color.r * 255;     // Red
                data[index + 1] = color.g * 255; // Green
                data[index + 2] = color.b * 255; // Blue
                data[index + 3] = (color.a || 1) * 255; // Alpha
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Create THREE.js texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        this.textures.set(name, texture);
        return texture;
    }
    
    // Generate cosmic orb texture
    createCosmicOrbTexture() {
        return this.createProceduralTexture('cosmic-orb', 256, 256, (u, v) => {
            const centerX = 0.5;
            const centerY = 0.5;
            const distance = Math.sqrt((u - centerX) ** 2 + (v - centerY) ** 2);
            
            // Create gradient from center
            const gradient = Math.max(0, 1 - distance * 2);
            const noise = Math.sin(u * 20) * Math.sin(v * 20) * 0.1;
            
            return {
                r: 0.0 + gradient * 0.8 + noise,
                g: 0.8 + gradient * 0.2 + noise,
                b: 1.0,
                a: gradient
            };
        });
    }
    
    // Generate star texture
    createStarTexture() {
        return this.createProceduralTexture('star', 32, 32, (u, v) => {
            const centerX = 0.5;
            const centerY = 0.5;
            const distance = Math.sqrt((u - centerX) ** 2 + (v - centerY) ** 2);
            
            // Create star shape
            const intensity = Math.max(0, 1 - distance * 4);
            const sparkle = Math.pow(intensity, 3);
            
            return {
                r: 1.0,
                g: 1.0,
                b: 1.0,
                a: sparkle
            };
        });
    }
    
    // Generate particle texture
    createParticleTexture() {
        return this.createProceduralTexture('particle', 64, 64, (u, v) => {
            const centerX = 0.5;
            const centerY = 0.5;
            const distance = Math.sqrt((u - centerX) ** 2 + (v - centerY) ** 2);
            
            // Create soft circular particle
            const intensity = Math.max(0, 1 - distance * 2);
            const softness = Math.pow(intensity, 2);
            
            return {
                r: 0.0,
                g: 1.0,
                b: 0.5,
                a: softness
            };
        });
    }
    
    // Generate energy effect texture
    createEnergyTexture() {
        return this.createProceduralTexture('energy', 128, 128, (u, v) => {
            const time = Date.now() * 0.001;
            const noise1 = Math.sin(u * 10 + time) * Math.sin(v * 10 + time);
            const noise2 = Math.sin(u * 20 + time * 2) * Math.sin(v * 20 + time * 2);
            
            const energy = (noise1 + noise2) * 0.5 + 0.5;
            
            return {
                r: energy,
                g: energy * 0.5,
                b: 1.0,
                a: energy
            };
        });
    }
    
    // Generate UI background texture
    createUIBackgroundTexture() {
        return this.createProceduralTexture('ui-background', 256, 256, (u, v) => {
            const noise = Math.sin(u * 100) * Math.sin(v * 100) * 0.05;
            const gradient = Math.pow(1 - Math.abs(u - 0.5), 2) * Math.pow(1 - Math.abs(v - 0.5), 2);
            
            const intensity = 0.1 + gradient * 0.2 + noise;
            
            return {
                r: 0.05 + intensity,
                g: 0.1 + intensity,
                b: 0.2 + intensity,
                a: 0.8
            };
        });
    }
    
    // Preload all game textures
    async preloadTextures() {
        console.log('Preloading textures...');
        
        // Create procedural textures
        this.createCosmicOrbTexture();
        this.createStarTexture();
        this.createParticleTexture();
        this.createEnergyTexture();
        this.createUIBackgroundTexture();
        
        // Load external textures if any
        const externalTextures = [
            // Add external texture URLs here if needed
        ];
        
        const loadPromises = externalTextures.map(({name, url, options}) => 
            this.loadTexture(name, url, options).catch(error => {
                console.warn(`Failed to preload texture ${name}:`, error);
                return null;
            })
        );
        
        await Promise.all(loadPromises);
        console.log(`Texture preloading complete. Loaded ${this.loadedCount} textures.`);
    }
    
    // Get texture by name
    getTexture(name) {
        return this.textures.get(name);
    }
    
    // Clean up old textures to free memory
    cleanupOldTextures() {
        const texturesToRemove = [];
        
        this.textures.forEach((texture, name) => {
            // Remove procedural textures that can be regenerated
            if (name.startsWith('temp-') || name.startsWith('dynamic-')) {
                texturesToRemove.push(name);
            }
        });
        
        texturesToRemove.forEach(name => {
            const texture = this.textures.get(name);
            if (texture) {
                texture.dispose();
                this.textures.delete(name);
            }
        });
    }
    
    // Dispose all textures
    dispose() {
        this.textures.forEach(texture => {
            texture.dispose();
        });
        this.textures.clear();
        this.loadingPromises.clear();
        this.textureCache.clear();
    }
};