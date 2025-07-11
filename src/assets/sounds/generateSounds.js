// Sound generation utility for creating optimized game sounds
// This creates small, performance-optimized audio files

class SoundGenerator {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sampleRate = 22050; // Reduced sample rate for smaller files
    }
    
    // Generate click sound - short, punchy
    generateClickSound() {
        const duration = 0.1;
        const length = this.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, this.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            const t = i / this.sampleRate;
            const envelope = Math.exp(-t * 20);
            const frequency = 800 + Math.exp(-t * 10) * 400;
            data[i] = envelope * Math.sin(2 * Math.PI * frequency * t) * 0.3;
        }
        
        return buffer;
    }
    
    // Generate upgrade sound - ascending chime
    generateUpgradeSound() {
        const duration = 0.5;
        const length = this.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, this.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            const t = i / this.sampleRate;
            const envelope = Math.exp(-t * 3);
            const frequency = 440 + t * 220;
            data[i] = envelope * Math.sin(2 * Math.PI * frequency * t) * 0.4;
        }
        
        return buffer;
    }
    
    // Generate achievement sound - triumphant
    generateAchievementSound() {
        const duration = 0.8;
        const length = this.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, this.sampleRate);
        const data = buffer.getChannelData(0);
        
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        for (let i = 0; i < length; i++) {
            const t = i / this.sampleRate;
            const envelope = Math.exp(-t * 2);
            let sample = 0;
            
            notes.forEach((freq, index) => {
                const delay = index * 0.15;
                if (t >= delay) {
                    sample += envelope * Math.sin(2 * Math.PI * freq * (t - delay)) * 0.2;
                }
            });
            
            data[i] = sample;
        }
        
        return buffer;
    }
    
    // Generate prestige sound - cosmic whoosh
    generatePrestigeSound() {
        const duration = 1.2;
        const length = this.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, this.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            const t = i / this.sampleRate;
            const envelope = Math.exp(-t * 1.5);
            const noise = (Math.random() - 0.5) * 2;
            const sweep = Math.sin(2 * Math.PI * (200 + t * 300) * t);
            data[i] = envelope * (noise * 0.1 + sweep * 0.3);
        }
        
        return buffer;
    }
    
    // Generate boost sound - energizing
    generateBoostSound() {
        const duration = 0.3;
        const length = this.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, this.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            const t = i / this.sampleRate;
            const envelope = Math.exp(-t * 8);
            const frequency = 220 + Math.pow(t, 2) * 880;
            data[i] = envelope * Math.sin(2 * Math.PI * frequency * t) * 0.5;
        }
        
        return buffer;
    }
    
    // Generate ambient sound - subtle space atmosphere
    generateAmbientSound() {
        const duration = 10; // Loop-able
        const length = this.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, this.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            const t = i / this.sampleRate;
            let sample = 0;
            
            // Low frequency rumble
            sample += Math.sin(2 * Math.PI * 60 * t) * 0.05;
            sample += Math.sin(2 * Math.PI * 80 * t) * 0.03;
            
            // High frequency sparkles
            sample += Math.sin(2 * Math.PI * 1200 * t) * 0.01 * Math.sin(t * 0.5);
            sample += Math.sin(2 * Math.PI * 1600 * t) * 0.008 * Math.sin(t * 0.3);
            
            data[i] = sample;
        }
        
        return buffer;
    }
    
    // Generate notification sound - gentle chime
    generateNotificationSound() {
        const duration = 0.4;
        const length = this.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, this.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            const t = i / this.sampleRate;
            const envelope = Math.exp(-t * 4);
            const frequency = 880;
            data[i] = envelope * Math.sin(2 * Math.PI * frequency * t) * 0.3;
        }
        
        return buffer;
    }
    
    // Generate whoosh sound - UI transitions
    generateWhooshSound() {
        const duration = 0.2;
        const length = this.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, this.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            const t = i / this.sampleRate;
            const envelope = Math.exp(-t * 10);
            const noise = (Math.random() - 0.5) * 2;
            const filter = Math.sin(2 * Math.PI * 400 * t);
            data[i] = envelope * noise * filter * 0.2;
        }
        
        return buffer;
    }
    
    // Export buffer to WAV format (for file creation)
    bufferToWav(buffer) {
        const length = buffer.length;
        const arrayBuffer = new ArrayBuffer(44 + length * 2);
        const view = new DataView(arrayBuffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, this.sampleRate, true);
        view.setUint32(28, this.sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * 2, true);
        
        // Convert float samples to 16-bit PCM
        const data = buffer.getChannelData(0);
        let offset = 44;
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, data[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }
        
        return arrayBuffer;
    }
}

// Export for use in other modules
window.SoundGenerator = SoundGenerator;