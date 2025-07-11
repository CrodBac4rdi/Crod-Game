// Game Engine Module
window.GameEngine = (() => {
    let running = false;
    let lastTime = 0;
    
    const start = () => {
        running = true;
        lastTime = performance.now();
        gameLoop();
    };
    
    const stop = () => {
        running = false;
    };
    
    const gameLoop = (currentTime = 0) => {
        if (!running) return;
        
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        // Update game state
        update(deltaTime);
        
        requestAnimationFrame(gameLoop);
    };
    
    const update = (deltaTime) => {
        // Update player energy
        const player = StateManager.getPlayer();
        if (player.energy > 0) {
            StateManager.updateState('player', {
                energy: Math.max(0, player.energy - CONSTANTS.PLAYER.ENERGY_DECAY * deltaTime / 1000)
            });
        }
        
        // Update stress
        if (player.stress < CONSTANTS.PLAYER.MAX_STRESS) {
            StateManager.updateState('player', {
                stress: Math.min(CONSTANTS.PLAYER.MAX_STRESS, player.stress + CONSTANTS.PLAYER.STRESS_GAIN * deltaTime / 1000)
            });
        }
    };
    
    return { start, stop };
})();