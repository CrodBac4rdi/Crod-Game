// High-Performance Event System for game-wide communication
window.EventSystem = class EventSystem {
    constructor() {
        this.listeners = new Map();
        this.onceListeners = new Map();
        this.priorityListeners = new Map();
        this.asyncListeners = new Map();
        
        // Performance monitoring
        this.eventMetrics = new Map();
        this.enableMetrics = false;
        this.maxEventHistory = 100;
        this.eventHistory = [];
        
        // Namespace support
        this.namespaces = new Map();
        
        // Pre-allocated arrays for performance
        this.tempCallbacks = [];
        this.tempPriorityCallbacks = [];
    }
    
    // Subscribe to an event with optional priority
    on(event, callback, priority = 0) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        
        const listener = { callback, priority, id: this.generateId() };
        this.listeners.get(event).push(listener);
        
        // Sort by priority if needed
        if (priority !== 0) {
            this.listeners.get(event).sort((a, b) => b.priority - a.priority);
        }
        
        // Return unsubscribe function
        return () => this.off(event, callback);
    }
    
    // Subscribe to an event once
    once(event, callback, priority = 0) {
        if (!this.onceListeners.has(event)) {
            this.onceListeners.set(event, []);
        }
        
        const listener = { callback, priority, id: this.generateId() };
        this.onceListeners.get(event).push(listener);
        
        // Sort by priority if needed
        if (priority !== 0) {
            this.onceListeners.get(event).sort((a, b) => b.priority - a.priority);
        }
        
        // Return unsubscribe function
        return () => this.offOnce(event, callback);
    }
    
    // Subscribe to async event
    onAsync(event, callback, priority = 0) {
        if (!this.asyncListeners.has(event)) {
            this.asyncListeners.set(event, []);
        }
        
        const listener = { callback, priority, id: this.generateId() };
        this.asyncListeners.get(event).push(listener);
        
        if (priority !== 0) {
            this.asyncListeners.get(event).sort((a, b) => b.priority - a.priority);
        }
        
        return () => this.offAsync(event, callback);
    }
    
    // Unsubscribe from an event
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        
        const callbacks = this.listeners.get(event);
        const index = callbacks.findIndex(l => l.callback === callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }
    
    // Unsubscribe from once event
    offOnce(event, callback) {
        if (!this.onceListeners.has(event)) return;
        
        const callbacks = this.onceListeners.get(event);
        const index = callbacks.findIndex(l => l.callback === callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }
    
    // Unsubscribe from async event
    offAsync(event, callback) {
        if (!this.asyncListeners.has(event)) return;
        
        const callbacks = this.asyncListeners.get(event);
        const index = callbacks.findIndex(l => l.callback === callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }
    
    // High-performance emit with metrics
    emit(event, data, options = {}) {
        const startTime = this.enableMetrics ? performance.now() : 0;
        let listenerCount = 0;
        let errorCount = 0;
        
        try {
            // Process regular listeners
            if (this.listeners.has(event)) {
                const listeners = this.listeners.get(event);
                listenerCount += listeners.length;
                
                for (let i = 0; i < listeners.length; i++) {
                    try {
                        listeners[i].callback(data);
                    } catch (error) {
                        errorCount++;
                        console.error(`Error in event listener for ${event}:`, error);
                        if (options.strict) throw error;
                    }
                }
            }
            
            // Process once listeners
            if (this.onceListeners.has(event)) {
                const listeners = this.onceListeners.get(event);
                listenerCount += listeners.length;
                
                for (let i = 0; i < listeners.length; i++) {
                    try {
                        listeners[i].callback(data);
                    } catch (error) {
                        errorCount++;
                        console.error(`Error in once event listener for ${event}:`, error);
                        if (options.strict) throw error;
                    }
                }
                
                // Clear once listeners after execution
                this.onceListeners.delete(event);
            }
            
            // Process async listeners
            if (this.asyncListeners.has(event)) {
                const listeners = this.asyncListeners.get(event);
                listenerCount += listeners.length;
                
                for (let i = 0; i < listeners.length; i++) {
                    Promise.resolve().then(() => {
                        try {
                            listeners[i].callback(data);
                        } catch (error) {
                            console.error(`Error in async event listener for ${event}:`, error);
                        }
                    });
                }
            }
            
        } finally {
            // Record metrics
            if (this.enableMetrics) {
                this.recordMetric(event, performance.now() - startTime, listenerCount, errorCount);
            }
            
            // Add to event history
            this.addToHistory(event, data, listenerCount, errorCount);
        }
    }
    
    // Emit with throttling
    emitThrottled(event, data, delay = 16) {
        const throttleKey = `throttle_${event}`;
        
        if (!this[throttleKey]) {
            this[throttleKey] = true;
            
            setTimeout(() => {
                this.emit(event, data);
                this[throttleKey] = false;
            }, delay);
        }
    }
    
    // Emit with debouncing
    emitDebounced(event, data, delay = 100) {
        const debounceKey = `debounce_${event}`;
        
        if (this[debounceKey]) {
            clearTimeout(this[debounceKey]);
        }
        
        this[debounceKey] = setTimeout(() => {
            this.emit(event, data);
            delete this[debounceKey];
        }, delay);
    }
    
    // Emit multiple events in batch for performance
    emitBatch(events) {
        for (let i = 0; i < events.length; i++) {
            const { event, data } = events[i];
            this.emit(event, data);
        }
    }
    
    // Clear all listeners for an event
    clear(event) {
        if (event) {
            this.listeners.delete(event);
            this.onceListeners.delete(event);
            this.asyncListeners.delete(event);
        } else {
            this.listeners.clear();
            this.onceListeners.clear();
            this.asyncListeners.clear();
        }
    }
    
    // Namespace support
    namespace(name) {
        if (!this.namespaces.has(name)) {
            this.namespaces.set(name, new EventSystem());
        }
        return this.namespaces.get(name);
    }
    
    // Performance monitoring
    enablePerformanceMonitoring(enabled = true) {
        this.enableMetrics = enabled;
    }
    
    getEventMetrics(event) {
        return this.eventMetrics.get(event) || {
            totalCalls: 0,
            totalTime: 0,
            avgTime: 0,
            maxTime: 0,
            minTime: Infinity,
            totalListeners: 0,
            totalErrors: 0
        };
    }
    
    getAllMetrics() {
        const metrics = {};
        for (const [event, data] of this.eventMetrics) {
            metrics[event] = data;
        }
        return metrics;
    }
    
    resetMetrics() {
        this.eventMetrics.clear();
        this.eventHistory = [];
    }
    
    getEventHistory() {
        return [...this.eventHistory];
    }
    
    // Internal methods
    generateId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    recordMetric(event, duration, listenerCount, errorCount) {
        if (!this.eventMetrics.has(event)) {
            this.eventMetrics.set(event, {
                totalCalls: 0,
                totalTime: 0,
                avgTime: 0,
                maxTime: 0,
                minTime: Infinity,
                totalListeners: 0,
                totalErrors: 0
            });
        }
        
        const metrics = this.eventMetrics.get(event);
        metrics.totalCalls++;
        metrics.totalTime += duration;
        metrics.avgTime = metrics.totalTime / metrics.totalCalls;
        metrics.maxTime = Math.max(metrics.maxTime, duration);
        metrics.minTime = Math.min(metrics.minTime, duration);
        metrics.totalListeners += listenerCount;
        metrics.totalErrors += errorCount;
    }
    
    addToHistory(event, data, listenerCount, errorCount) {
        this.eventHistory.push({
            event,
            timestamp: Date.now(),
            listenerCount,
            errorCount,
            dataSize: JSON.stringify(data || {}).length
        });
        
        // Keep history size manageable
        if (this.eventHistory.length > this.maxEventHistory) {
            this.eventHistory.shift();
        }
    }
    
    // Debug helpers
    listAllEvents() {
        const events = new Set();
        for (const event of this.listeners.keys()) events.add(event);
        for (const event of this.onceListeners.keys()) events.add(event);
        for (const event of this.asyncListeners.keys()) events.add(event);
        return Array.from(events);
    }
    
    getListenerCount(event) {
        return (this.listeners.get(event)?.length || 0) +
               (this.onceListeners.get(event)?.length || 0) +
               (this.asyncListeners.get(event)?.length || 0);
    }
    
    getTotalListenerCount() {
        let total = 0;
        for (const listeners of this.listeners.values()) total += listeners.length;
        for (const listeners of this.onceListeners.values()) total += listeners.length;
        for (const listeners of this.asyncListeners.values()) total += listeners.length;
        return total;
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
    SCENE_UPDATE: 'scene_update',
    
    // Performance events
    FRAME_UPDATE: 'frame_update',
    PERFORMANCE_UPDATE: 'performance_update',
    
    // Error events
    GAME_ERROR: 'game_error'
};