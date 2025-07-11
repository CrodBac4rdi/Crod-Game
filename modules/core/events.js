// Event System Module
window.EventSystem = (() => {
    const events = new Map();
    let eventIdCounter = 0;
    
    // Emit event
    const emit = (eventName, data = {}) => {
        const handlers = events.get(eventName);
        if (!handlers) return;
        
        const eventData = {
            name: eventName,
            data,
            timestamp: Date.now(),
            propagationStopped: false
        };
        
        handlers.forEach(handler => {
            if (!eventData.propagationStopped) {
                handler(eventData);
            }
        });
    };
    
    // Subscribe to event
    const on = (eventName, handler) => {
        if (!events.has(eventName)) {
            events.set(eventName, new Map());
        }
        
        const id = ++eventIdCounter;
        events.get(eventName).set(id, handler);
        
        // Return unsubscribe function
        return () => off(eventName, id);
    };
    
    // Unsubscribe from event
    const off = (eventName, handlerId) => {
        const handlers = events.get(eventName);
        if (handlers) {
            handlers.delete(handlerId);
            if (handlers.size === 0) {
                events.delete(eventName);
            }
        }
    };
    
    // Subscribe to event once
    const once = (eventName, handler) => {
        const unsubscribe = on(eventName, (data) => {
            handler(data);
            unsubscribe();
        });
        return unsubscribe;
    };
    
    // Clear all handlers for an event
    const clear = (eventName) => {
        if (eventName) {
            events.delete(eventName);
        } else {
            events.clear();
        }
    };
    
    // Common game events
    const GameEvents = {
        // Player events
        LEVEL_UP: 'player:levelUp',
        XP_GAINED: 'player:xpGained',
        SKILL_LEARNED: 'player:skillLearned',
        ACHIEVEMENT_UNLOCKED: 'player:achievementUnlocked',
        ENERGY_LOW: 'player:energyLow',
        STRESS_HIGH: 'player:stressHigh',
        
        // Game events
        GAME_START: 'game:start',
        GAME_PAUSE: 'game:pause',
        GAME_RESUME: 'game:resume',
        GAME_SAVE: 'game:save',
        GAME_LOAD: 'game:load',
        MODE_CHANGE: 'game:modeChange',
        
        // Progress events
        LESSON_START: 'lesson:start',
        LESSON_COMPLETE: 'lesson:complete',
        CHALLENGE_START: 'challenge:start',
        CHALLENGE_COMPLETE: 'challenge:complete',
        PROJECT_COMPLETE: 'project:complete',
        
        // UI events
        TAB_CHANGE: 'ui:tabChange',
        MODAL_OPEN: 'ui:modalOpen',
        MODAL_CLOSE: 'ui:modalClose',
        NOTIFICATION_SHOW: 'ui:notificationShow',
        THEME_CHANGE: 'ui:themeChange',
        
        // Code events
        CODE_RUN: 'code:run',
        CODE_SUCCESS: 'code:success',
        CODE_ERROR: 'code:error',
        TEST_PASS: 'code:testPass',
        TEST_FAIL: 'code:testFail'
    };
    
    return {
        emit,
        on,
        off,
        once,
        clear,
        events: GameEvents
    };
})();