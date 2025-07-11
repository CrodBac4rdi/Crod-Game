// React Hooks Module
window.GameHooks = (() => {
    const { useState, useEffect, useCallback, useMemo, useRef } = React;
    
    // Use game state hook
    const useGameState = (path) => {
        const [value, setValue] = useState(() => StateManager.getState(path));
        
        useEffect(() => {
            const unsubscribe = StateManager.subscribe(path || '*', (newValue) => {
                setValue(newValue);
            });
            
            return unsubscribe;
        }, [path]);
        
        const updateValue = useCallback((newValue) => {
            if (path) {
                StateManager.setState(path, newValue);
            }
        }, [path]);
        
        return [value, updateValue];
    };
    
    // Use player stats hook
    const usePlayer = () => {
        const [player] = useGameState('player');
        
        const updateStat = useCallback((stat, value) => {
            StateManager.updateState('player', { [stat]: value });
        }, []);
        
        const gainXP = useCallback((amount) => {
            const currentXP = player.xp + amount;
            const xpForLevel = player.level * CONSTANTS.LEARNING.XP_FOR_LEVEL;
            
            if (currentXP >= xpForLevel) {
                StateManager.updateState('player', {
                    xp: currentXP - xpForLevel,
                    level: player.level + 1
                });
                EventSystem.emit(EventSystem.events.LEVEL_UP, { 
                    level: player.level + 1,
                    skillPoints: CONSTANTS.LEARNING.SKILL_POINTS_PER_LEVEL
                });
            } else {
                StateManager.updateState('player', { xp: currentXP });
            }
            
            EventSystem.emit(EventSystem.events.XP_GAINED, { amount });
        }, [player]);
        
        return {
            ...player,
            updateStat,
            gainXP
        };
    };
    
    // Use game settings hook
    const useSettings = () => {
        const [settings] = useGameState('settings');
        
        const updateSetting = useCallback((key, value) => {
            StateManager.updateState('settings', { [key]: value });
        }, []);
        
        return {
            ...settings,
            updateSetting
        };
    };
    
    // Use notifications hook
    const useNotifications = () => {
        const [notifications, setNotifications] = useState([]);
        
        const addNotification = useCallback((notification) => {
            const id = Date.now();
            const newNotification = {
                id,
                ...notification,
                timestamp: Date.now()
            };
            
            setNotifications(prev => [...prev, newNotification]);
            EventSystem.emit(EventSystem.events.NOTIFICATION_SHOW, newNotification);
            
            // Auto remove after duration
            if (notification.duration !== 0) {
                setTimeout(() => {
                    removeNotification(id);
                }, notification.duration || CONSTANTS.UI.NOTIFICATION_DURATION);
            }
            
            return id;
        }, []);
        
        const removeNotification = useCallback((id) => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, []);
        
        return {
            notifications,
            addNotification,
            removeNotification
        };
    };
    
    // Use keyboard shortcuts hook
    const useKeyboardShortcuts = (shortcuts) => {
        useEffect(() => {
            const handleKeyPress = (e) => {
                const key = e.key.toLowerCase();
                const ctrl = e.ctrlKey || e.metaKey;
                const shift = e.shiftKey;
                const alt = e.altKey;
                
                Object.entries(shortcuts).forEach(([combo, handler]) => {
                    const parts = combo.toLowerCase().split('+');
                    const comboKey = parts[parts.length - 1];
                    const comboCtrl = parts.includes('ctrl') || parts.includes('cmd');
                    const comboShift = parts.includes('shift');
                    const comboAlt = parts.includes('alt');
                    
                    if (key === comboKey && 
                        ctrl === comboCtrl && 
                        shift === comboShift && 
                        alt === comboAlt) {
                        e.preventDefault();
                        handler(e);
                    }
                });
            };
            
            window.addEventListener('keydown', handleKeyPress);
            return () => window.removeEventListener('keydown', handleKeyPress);
        }, [shortcuts]);
    };
    
    // Use timer hook
    const useTimer = (callback, delay, enabled = true) => {
        const savedCallback = useRef();
        
        useEffect(() => {
            savedCallback.current = callback;
        }, [callback]);
        
        useEffect(() => {
            if (!enabled || !delay) return;
            
            const tick = () => {
                savedCallback.current();
            };
            
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }, [delay, enabled]);
    };
    
    // Use animation frame hook
    const useAnimationFrame = (callback, enabled = true) => {
        const requestRef = useRef();
        const previousTimeRef = useRef();
        
        const animate = useCallback((time) => {
            if (previousTimeRef.current !== undefined) {
                const deltaTime = time - previousTimeRef.current;
                callback(deltaTime);
            }
            previousTimeRef.current = time;
            requestRef.current = requestAnimationFrame(animate);
        }, [callback]);
        
        useEffect(() => {
            if (enabled) {
                requestRef.current = requestAnimationFrame(animate);
                return () => {
                    if (requestRef.current) {
                        cancelAnimationFrame(requestRef.current);
                    }
                };
            }
        }, [enabled, animate]);
    };
    
    // Use local storage hook
    const useLocalStorage = (key, initialValue) => {
        const [storedValue, setStoredValue] = useState(() => {
            try {
                const item = window.localStorage.getItem(key);
                return item ? JSON.parse(item) : initialValue;
            } catch (error) {
                console.error(`Error loading ${key} from localStorage:`, error);
                return initialValue;
            }
        });
        
        const setValue = useCallback((value) => {
            try {
                setStoredValue(value);
                window.localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.error(`Error saving ${key} to localStorage:`, error);
            }
        }, [key]);
        
        return [storedValue, setValue];
    };
    
    // Use debounce hook
    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);
        
        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
            
            return () => clearTimeout(handler);
        }, [value, delay]);
        
        return debouncedValue;
    };
    
    return {
        useGameState,
        usePlayer,
        useSettings,
        useNotifications,
        useKeyboardShortcuts,
        useTimer,
        useAnimationFrame,
        useLocalStorage,
        useDebounce
    };
})();