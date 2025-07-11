// Sound System Module
window.SoundSystem = (() => {
    let audioContext;
    let enabled = true;
    
    const init = () => {
        if (typeof AudioContext !== 'undefined') {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    };
    
    const playSound = (frequency, duration = 0.1) => {
        if (!enabled || !audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    };
    
    const sounds = {
        click: () => playSound(440, 0.1),
        success: () => playSound(880, 0.2),
        error: () => playSound(220, 0.2),
        levelUp: () => playSound(1320, 0.3)
    };
    
    return { init, playSound, sounds, setEnabled: (value) => enabled = value };
})();