// Event System - Simple and Isolated
class EventSystem {
    constructor() {
        this.listeners = new Map();
        this.isActive = false;
    }
    
    async init() {
        this.isActive = true;
        console.log('[EventSystem] Event system initialized');
    }
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }
    
    emit(event, data) {
        if (!this.isActive) return;
        
        if (!this.listeners.has(event)) return;
        
        const callbacks = this.listeners.get(event);
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`[EventSystem] Error in event handler for ${event}:`, error);
            }
        });
    }
    
    dispose() {
        this.listeners.clear();
        this.isActive = false;
    }
}

window.EventSystem = EventSystem;