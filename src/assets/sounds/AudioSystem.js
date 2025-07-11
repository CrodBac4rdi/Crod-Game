// Performance-optimized Audio System
window.AudioSystem = class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.buffers = new Map();
        this.masterVolume = 0.7;
        this.soundEnabled = true;
        this.loadingPromises = new Map();
        
        // Performance settings
        this.maxConcurrentSounds = 8;
        this.currentSounds = 0;
        this.soundPool = new Map();
        
        this.initAudioContext();
    }
    
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.masterVolume;
        } catch (error) {
            console.warn('Audio not supported:', error);
            this.soundEnabled = false;
        }
    }
    
    // Load audio buffer with performance optimization
    async loadSound(name, url) {
        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name);
        }
        
        const promise = this.loadAudioBuffer(url);
        this.loadingPromises.set(name, promise);
        
        try {
            const buffer = await promise;
            this.buffers.set(name, buffer);
            return buffer;
        } catch (error) {
            console.error(`Failed to load sound ${name}:`, error);
            this.loadingPromises.delete(name);
            return null;
        }
    }
    
    async loadAudioBuffer(url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await this.audioContext.decodeAudioData(arrayBuffer);
    }
    
    // Play sound with performance optimization
    playSound(name, options = {}) {
        if (!this.soundEnabled || !this.audioContext || this.currentSounds >= this.maxConcurrentSounds) {
            return;
        }
        
        const buffer = this.buffers.get(name);
        if (!buffer) {
            console.warn(`Sound ${name} not loaded`);
            return;
        }
        
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        // Apply options
        gainNode.gain.value = (options.volume || 1) * this.masterVolume;
        source.playbackRate.value = options.pitch || 1;
        
        // Performance tracking
        this.currentSounds++;
        source.onended = () => {
            this.currentSounds--;
        };
        
        source.start(0);
        
        // Auto-stop after reasonable time for performance
        setTimeout(() => {
            try {
                source.stop();
            } catch (e) {
                // Already stopped
            }
        }, 5000);
        
        return source;
    }
    
    // Preload all game sounds
    async preloadSounds() {
        const soundDefinitions = [
            { name: 'click', url: './src/assets/sounds/click.mp3' },
            { name: 'upgrade', url: './src/assets/sounds/upgrade.mp3' },
            { name: 'achievement', url: './src/assets/sounds/achievement.mp3' },
            { name: 'prestige', url: './src/assets/sounds/prestige.mp3' },
            { name: 'boost', url: './src/assets/sounds/boost.mp3' },
            { name: 'ambient', url: './src/assets/sounds/ambient.mp3' },
            { name: 'notification', url: './src/assets/sounds/notification.mp3' },
            { name: 'whoosh', url: './src/assets/sounds/whoosh.mp3' }
        ];
        
        const loadPromises = soundDefinitions.map(({ name, url }) => 
            this.loadSound(name, url).catch(error => {
                console.warn(`Failed to preload sound ${name}:`, error);
                return null;
            })
        );
        
        await Promise.all(loadPromises);
        console.log('Audio preloading complete');
    }
    
    // Performance optimized click sound with variations
    playClickSound(intensity = 1) {
        const volume = Math.min(0.1 + (intensity * 0.05), 0.8);
        const pitch = 0.9 + (Math.random() * 0.2);
        
        this.playSound('click', {
            volume: volume,
            pitch: pitch
        });
    }
    
    // Ambient sound management
    playAmbientSound() {
        if (!this.soundEnabled || !this.buffers.has('ambient')) return;
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = this.buffers.get('ambient');
        source.loop = true;
        source.connect(gainNode);
        gainNode.connect(this.masterGain);
        gainNode.gain.value = 0.1;
        
        source.start(0);
        this.ambientSource = source;
    }
    
    stopAmbientSound() {
        if (this.ambientSource) {
            this.ambientSource.stop();
            this.ambientSource = null;
        }
    }
    
    // Volume controls
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }
    
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        if (!enabled) {
            this.stopAmbientSound();
        }
    }
    
    // Performance cleanup
    cleanup() {
        this.stopAmbientSound();
        this.buffers.clear();
        this.sounds.clear();
        this.loadingPromises.clear();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
};