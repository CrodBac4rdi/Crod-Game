// Click Manager
window.ClickManager = class ClickManager {
    constructor(gameState, eventSystem) {
        this.gameState = gameState;
        this.eventSystem = eventSystem;
        this.lastClickTime = 0;
        this.clickCombo = 0;
        this.comboTimeout = null;
    }
    
    // Handle click
    handleClick(x, y) {
        const now = Date.now();
        const timeSinceLastClick = now - this.lastClickTime;
        
        // Update combo
        if (timeSinceLastClick < 1000) {
            this.clickCombo++;
        } else {
            this.clickCombo = 1;
        }
        
        // Clear previous combo timeout
        if (this.comboTimeout) {
            clearTimeout(this.comboTimeout);
        }
        
        // Set new combo timeout
        this.comboTimeout = setTimeout(() => {
            this.clickCombo = 0;
        }, 1000);
        
        this.lastClickTime = now;
        
        // Calculate energy gain
        let energyGain = this.gameState.clickPower;
        
        // Combo bonus
        if (this.clickCombo > 5) {
            const comboMultiplier = 1 + (this.clickCombo - 5) * 0.1;
            energyGain = Math.floor(energyGain * comboMultiplier);
        }
        
        // Add energy
        const actualGain = this.gameState.addEnergy(energyGain);
        
        // Update stats
        this.gameState.stats.totalClicks++;
        
        // Gain XP for clicking
        this.gameState.addXP(1);
        
        // Emit events
        this.eventSystem.emit(GameEvents.CLICK_3D, {
            x: x,
            y: y,
            energy: actualGain,
            combo: this.clickCombo
        });
        
        // Floating text
        this.eventSystem.emit(GameEvents.FLOATING_TEXT, {
            text: `+${window.FormatUtils.formatNumber(actualGain)}`,
            color: this.clickCombo > 5 ? '#ffaa00' : '#00ff88',
            x: x,
            y: y,
            size: this.clickCombo > 5 ? 1.5 : 1
        });
        
        // Particle effect
        this.eventSystem.emit(GameEvents.PARTICLE_SPAWN, {
            x: x,
            y: y,
            count: Math.min(10 + this.clickCombo, 50),
            color: this.clickCombo > 5 ? 0xffaa00 : 0x00ff88
        });
        
        // Achievement check
        this.gameState.checkAchievements();
        
        return actualGain;
    }
    
    // Get click info
    getClickInfo() {
        return {
            power: this.gameState.clickPower,
            combo: this.clickCombo,
            totalClicks: this.gameState.stats.totalClicks,
            clicksPerSecond: this.getClicksPerSecond()
        };
    }
    
    // Calculate clicks per second
    getClicksPerSecond() {
        // Simple CPS calculation based on recent clicks
        // This is a placeholder - a real implementation would track clicks over time
        return this.clickCombo > 0 ? Math.min(this.clickCombo, 10) : 0;
    }
};