// Utility Functions Module
window.Utils = (() => {
    // Format number with commas
    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
    
    // Format currency
    const formatCurrency = (amount) => {
        return `$${formatNumber(Math.floor(amount))}`;
    };
    
    // Format time
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };
    
    // Format percentage
    const formatPercent = (value, decimals = 0) => {
        return `${(value * 100).toFixed(decimals)}%`;
    };
    
    // Random number between min and max
    const random = (min, max) => {
        return Math.random() * (max - min) + min;
    };
    
    // Random integer between min and max
    const randomInt = (min, max) => {
        return Math.floor(random(min, max + 1));
    };
    
    // Random element from array
    const randomChoice = (array) => {
        return array[randomInt(0, array.length - 1)];
    };
    
    // Shuffle array
    const shuffle = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };
    
    // Clamp value between min and max
    const clamp = (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    };
    
    // Linear interpolation
    const lerp = (start, end, t) => {
        return start + (end - start) * t;
    };
    
    // Smooth step
    const smoothStep = (edge0, edge1, x) => {
        const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
    };
    
    // Debounce function
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };
    
    // Throttle function
    const throttle = (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };
    
    // Deep clone object
    const deepClone = (obj) => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => deepClone(item));
        if (obj instanceof Object) {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    };
    
    // Generate unique ID
    const generateId = () => {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };
    
    // Calculate level from XP
    const calculateLevel = (xp) => {
        return Math.floor(Math.sqrt(xp / CONSTANTS.LEARNING.XP_FOR_LEVEL)) + 1;
    };
    
    // Calculate XP for level
    const calculateXPForLevel = (level) => {
        return Math.pow(level - 1, 2) * CONSTANTS.LEARNING.XP_FOR_LEVEL;
    };
    
    // Calculate progress to next level
    const calculateLevelProgress = (xp, level) => {
        const currentLevelXP = calculateXPForLevel(level);
        const nextLevelXP = calculateXPForLevel(level + 1);
        const progress = (xp - currentLevelXP) / (nextLevelXP - currentLevelXP);
        return clamp(progress, 0, 1);
    };
    
    // Color manipulation
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };
    
    const rgbToHex = (r, g, b) => {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    };
    
    const adjustColor = (color, amount) => {
        const rgb = hexToRgb(color);
        if (!rgb) return color;
        
        const r = clamp(rgb.r + amount, 0, 255);
        const g = clamp(rgb.g + amount, 0, 255);
        const b = clamp(rgb.b + amount, 0, 255);
        
        return rgbToHex(r, g, b);
    };
    
    // Animation easing functions
    const easing = {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInElastic: t => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
        },
        easeOutElastic: t => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        },
        easeOutBounce: t => {
            const n1 = 7.5625;
            const d1 = 2.75;
            if (t < 1 / d1) {
                return n1 * t * t;
            } else if (t < 2 / d1) {
                return n1 * (t -= 1.5 / d1) * t + 0.75;
            } else if (t < 2.5 / d1) {
                return n1 * (t -= 2.25 / d1) * t + 0.9375;
            } else {
                return n1 * (t -= 2.625 / d1) * t + 0.984375;
            }
        }
    };
    
    return {
        formatNumber,
        formatCurrency,
        formatTime,
        formatPercent,
        random,
        randomInt,
        randomChoice,
        shuffle,
        clamp,
        lerp,
        smoothStep,
        debounce,
        throttle,
        deepClone,
        generateId,
        calculateLevel,
        calculateXPForLevel,
        calculateLevelProgress,
        hexToRgb,
        rgbToHex,
        adjustColor,
        easing
    };
})();