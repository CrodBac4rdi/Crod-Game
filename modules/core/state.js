// State Management Module
window.StateManager = (() => {
    let state = {
        // Player State
        player: {
            name: 'Developer',
            level: 1,
            xp: 0,
            money: CONSTANTS.PLAYER.INITIAL_MONEY,
            energy: CONSTANTS.PLAYER.INITIAL_ENERGY,
            stress: CONSTANTS.PLAYER.INITIAL_STRESS,
            skills: {},
            achievements: [],
            statistics: {
                linesOfCode: 0,
                bugsFixed: 0,
                projectsCompleted: 0,
                lessonsCompleted: 0,
                challengesCompleted: 0,
                totalPlayTime: 0
            }
        },
        
        // Game State
        game: {
            mode: CONSTANTS.MODES.TUTORIAL,
            difficulty: 'NORMAL',
            paused: false,
            speed: 1,
            currentLesson: null,
            currentChallenge: null,
            activeProjects: [],
            completedProjects: [],
            unlockedFeatures: ['tutorial', 'sandbox'],
            notifications: [],
            events: []
        },
        
        // UI State
        ui: {
            activeTab: 'dashboard',
            modalOpen: null,
            theme: 'dark',
            soundEnabled: true,
            animations: true,
            showHints: true
        },
        
        // Progress State
        progress: {
            lessons: {},
            challenges: {},
            achievements: {},
            milestones: [],
            skillTree: {}
        },
        
        // Settings
        settings: {
            autoSave: true,
            difficulty: 'NORMAL',
            soundVolume: 0.5,
            musicVolume: 0.3,
            notifications: true,
            language: 'en'
        }
    };
    
    // State listeners
    const listeners = new Map();
    let listenerIdCounter = 0;
    
    // Get state or specific path
    const getState = (path) => {
        if (!path) return { ...state };
        
        const keys = path.split('.');
        let current = state;
        
        for (const key of keys) {
            if (current[key] === undefined) return undefined;
            current = current[key];
        }
        
        return current;
    };
    
    // Set state with path
    const setState = (path, value) => {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = state;
        
        for (const key of keys) {
            if (!current[key]) current[key] = {};
            current = current[key];
        }
        
        const oldValue = current[lastKey];
        current[lastKey] = value;
        
        // Notify listeners
        notifyListeners(path, value, oldValue);
        
        return true;
    };
    
    // Update state (merge)
    const updateState = (path, updates) => {
        const current = getState(path);
        if (typeof current !== 'object') return false;
        
        const newValue = { ...current, ...updates };
        return setState(path, newValue);
    };
    
    // Subscribe to state changes
    const subscribe = (path, callback) => {
        const id = ++listenerIdCounter;
        
        if (!listeners.has(path)) {
            listeners.set(path, new Map());
        }
        
        listeners.get(path).set(id, callback);
        
        // Return unsubscribe function
        return () => {
            const pathListeners = listeners.get(path);
            if (pathListeners) {
                pathListeners.delete(id);
                if (pathListeners.size === 0) {
                    listeners.delete(path);
                }
            }
        };
    };
    
    // Notify listeners
    const notifyListeners = (path, newValue, oldValue) => {
        // Notify exact path listeners
        const exactListeners = listeners.get(path);
        if (exactListeners) {
            exactListeners.forEach(callback => {
                callback(newValue, oldValue, path);
            });
        }
        
        // Notify parent path listeners
        const pathParts = path.split('.');
        for (let i = pathParts.length - 1; i > 0; i--) {
            const parentPath = pathParts.slice(0, i).join('.');
            const parentListeners = listeners.get(parentPath);
            if (parentListeners) {
                parentListeners.forEach(callback => {
                    callback(getState(parentPath), null, parentPath);
                });
            }
        }
        
        // Notify root listeners
        const rootListeners = listeners.get('*');
        if (rootListeners) {
            rootListeners.forEach(callback => {
                callback(state, null, '*');
            });
        }
    };
    
    // Reset state
    const resetState = () => {
        state = {
            player: {
                name: 'Developer',
                level: 1,
                xp: 0,
                money: CONSTANTS.PLAYER.INITIAL_MONEY,
                energy: CONSTANTS.PLAYER.INITIAL_ENERGY,
                stress: CONSTANTS.PLAYER.INITIAL_STRESS,
                skills: {},
                achievements: [],
                statistics: {
                    linesOfCode: 0,
                    bugsFixed: 0,
                    projectsCompleted: 0,
                    lessonsCompleted: 0,
                    challengesCompleted: 0,
                    totalPlayTime: 0
                }
            },
            game: {
                mode: CONSTANTS.MODES.TUTORIAL,
                difficulty: 'NORMAL',
                paused: false,
                speed: 1,
                currentLesson: null,
                currentChallenge: null,
                activeProjects: [],
                completedProjects: [],
                unlockedFeatures: ['tutorial', 'sandbox'],
                notifications: [],
                events: []
            },
            ui: {
                activeTab: 'dashboard',
                modalOpen: null,
                theme: 'dark',
                soundEnabled: true,
                animations: true,
                showHints: true
            },
            progress: {
                lessons: {},
                challenges: {},
                achievements: {},
                milestones: [],
                skillTree: {}
            },
            settings: {
                autoSave: true,
                difficulty: 'NORMAL',
                soundVolume: 0.5,
                musicVolume: 0.3,
                notifications: true,
                language: 'en'
            }
        };
        
        notifyListeners('*', state, null);
    };
    
    // Save/Load functionality
    const saveToStorage = () => {
        try {
            localStorage.setItem('devlearn_state', JSON.stringify(state));
            return true;
        } catch (e) {
            console.error('Failed to save state:', e);
            return false;
        }
    };
    
    const loadFromStorage = () => {
        try {
            const saved = localStorage.getItem('devlearn_state');
            if (saved) {
                state = JSON.parse(saved);
                notifyListeners('*', state, null);
                return true;
            }
        } catch (e) {
            console.error('Failed to load state:', e);
        }
        return false;
    };
    
    return {
        getState,
        setState,
        updateState,
        subscribe,
        resetState,
        saveToStorage,
        loadFromStorage,
        // Helper methods
        getPlayer: () => getState('player'),
        getGame: () => getState('game'),
        getUI: () => getState('ui'),
        getSettings: () => getState('settings')
    };
})();