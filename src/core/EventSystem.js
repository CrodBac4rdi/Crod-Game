// Event System for game-wide communication
window.EventSystem = class EventSystem {
    constructor() {
        this.listeners = new Map();
    }
    
    // Subscribe to an event
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        
        // Return unsubscribe function
        return () => this.off(event, callback);
    }
    
    // Unsubscribe from an event
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }
    
    // Emit an event
    emit(event, data) {
        if (!this.listeners.has(event)) return;
        
        this.listeners.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }
    
    // Clear all listeners for an event
    clear(event) {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }
};

// Game Events
window.GameEvents = {
    // Resource events
    ENERGY_CHANGED: 'energy_changed',
    CRYSTALS_CHANGED: 'crystals_changed',
    
    // Progression events
    LEVEL_UP: 'level_up',
    XP_GAINED: 'xp_gained',
    PRESTIGE: 'prestige',
    
    // Upgrade events
    GENERATOR_PURCHASED: 'generator_purchased',
    CLICK_UPGRADE_PURCHASED: 'click_upgrade_purchased',
    
    // Achievement events
    ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
    
    // UI events
    TAB_CHANGED: 'tab_changed',
    NOTIFICATION: 'notification',
    FLOATING_TEXT: 'floating_text',
    
    // Game state events
    GAME_LOADED: 'game_loaded',
    GAME_SAVED: 'game_saved',
    BOOST_ACTIVATED: 'boost_activated',
    BOOST_EXPIRED: 'boost_expired',
    
    // 3D events
    CLICK_3D: 'click_3d',
    PARTICLE_SPAWN: 'particle_spawn',
    SCENE_UPDATE: 'scene_update'
};