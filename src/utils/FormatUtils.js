// Format Utilities - Performance Optimized
window.FormatUtils = {
    // Cache for expensive calculations
    _cache: new Map(),
    _cacheSize: 0,
    _maxCacheSize: 1000,
    
    // Pre-calculated constants for performance
    _units: ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg', 'Uvg'],
    _log10_3: Math.log10(1000), // Pre-calculated log10(3)
    _scales: [1, 1000, 1000000, 1000000000, 1000000000000], // Pre-calculated scales
    
    // Performance counters
    _stats: {
        calls: 0,
        cacheHits: 0,
        cacheMisses: 0
    },
    
    // Clear cache when it gets too large
    _clearCacheIfNeeded() {
        if (this._cacheSize >= this._maxCacheSize) {
            this._cache.clear();
            this._cacheSize = 0;
        }
    },
    
    // Format large numbers with abbreviations - OPTIMIZED
    formatNumber(num) {
        this._stats.calls++;
        
        // Handle edge cases quickly
        if (num === 0) return '0';
        if (num < 0) return '-' + this.formatNumber(-num);
        if (num < 1000) return Math.floor(num).toString();
        
        // Create cache key
        const cacheKey = Math.floor(num / 100) * 100; // Round to nearest 100 for cache efficiency
        
        // Check cache first
        if (this._cache.has(cacheKey)) {
            this._stats.cacheHits++;
            return this._cache.get(cacheKey);
        }
        
        this._stats.cacheMisses++;
        
        // Fast tier calculation using bit operations
        const tier = Math.min(Math.floor(Math.log10(num) / 3), this._units.length - 1);
        
        if (tier === 0) {
            const result = Math.floor(num).toString();
            this._cache.set(cacheKey, result);
            this._cacheSize++;
            this._clearCacheIfNeeded();
            return result;
        }
        
        // Use pre-calculated scales when possible
        const scale = tier < this._scales.length ? this._scales[tier] : Math.pow(10, tier * 3);
        const scaled = num / scale;
        const suffix = this._units[tier];
        
        // Optimized decimal formatting
        const result = (scaled < 10 ? scaled.toFixed(2) : scaled.toFixed(1)) + suffix;
        
        // Cache the result
        this._cache.set(cacheKey, result);
        this._cacheSize++;
        this._clearCacheIfNeeded();
        
        return result;
    },
    
    // Fast number formatting for small numbers
    formatSmallNumber(num) {
        if (num < 1000) return Math.floor(num).toString();
        return this.formatNumber(num);
    },
    
    // Format time in seconds to readable format - OPTIMIZED
    formatTime(seconds) {
        const s = Math.floor(seconds);
        
        if (s < 60) return s + 's';
        if (s < 3600) {
            const m = Math.floor(s / 60);
            const sec = s % 60;
            return m + 'm ' + sec + 's';
        }
        if (s < 86400) {
            const h = Math.floor(s / 3600);
            const m = Math.floor((s % 3600) / 60);
            return h + 'h ' + m + 'm';
        }
        const d = Math.floor(s / 86400);
        const h = Math.floor((s % 86400) / 3600);
        return d + 'd ' + h + 'h';
    },
    
    // Format time in milliseconds
    formatTimeMs(ms) {
        return this.formatTime(ms / 1000);
    },
    
    // Format percentage - OPTIMIZED
    formatPercent(value, decimals = 0) {
        return (value * 100).toFixed(decimals) + '%';
    },
    
    // Format with commas - OPTIMIZED with cache
    formatWithCommas(num) {
        const numStr = num.toString();
        const cacheKey = 'comma_' + numStr;
        
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }
        
        const result = numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        this._cache.set(cacheKey, result);
        this._cacheSize++;
        this._clearCacheIfNeeded();
        
        return result;
    },
    
    // Format production rate - OPTIMIZED
    formatRate(rate) {
        // Cache the rate format to avoid double formatNumber calls
        const cacheKey = 'rate_' + Math.floor(rate);
        
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }
        
        const result = this.formatNumber(rate) + ' /s';
        this._cache.set(cacheKey, result);
        this._cacheSize++;
        this._clearCacheIfNeeded();
        
        return result;
    },
    
    // Format multiplier - OPTIMIZED
    formatMultiplier(mult) {
        if (mult < 10) {
            return mult.toFixed(2) + 'x';
        } else if (mult < 100) {
            return mult.toFixed(1) + 'x';
        } else {
            return this.formatNumber(mult) + 'x';
        }
    },
    
    // Format cost
    formatCost(cost, current) {
        const formatted = this.formatNumber(cost);
        if (current !== undefined) {
            const canAfford = current >= cost;
            return {
                text: formatted,
                className: canAfford ? 'can-afford' : 'cannot-afford'
            };
        }
        return formatted;
    },
    
    // Format level
    formatLevel(level, max) {
        if (max !== undefined) {
            return `Lv. ${level}/${max}`;
        }
        return `Lv. ${level}`;
    },
    
    // Format date - OPTIMIZED with cache
    formatDate(timestamp) {
        const dayKey = Math.floor(timestamp / 86400000); // Cache by day
        const cacheKey = 'date_' + dayKey;
        
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }
        
        const date = new Date(timestamp);
        const result = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        this._cache.set(cacheKey, result);
        this._cacheSize++;
        this._clearCacheIfNeeded();
        
        return result;
    },
    
    // NEW: Format currency with symbols
    formatCurrency(value, symbol = '⚡') {
        return this.formatNumber(value) + ' ' + symbol;
    },
    
    // NEW: Format duration in a more readable way
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        return this.formatTime(seconds);
    },
    
    // NEW: Format with scientific notation for very large numbers
    formatScientific(num) {
        if (num < 1e6) return this.formatNumber(num);
        return num.toExponential(2);
    },
    
    // NEW: Format bytes
    formatBytes(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    },
    
    // NEW: Format ordinal numbers (1st, 2nd, 3rd, etc.)
    formatOrdinal(num) {
        const j = num % 10;
        const k = num % 100;
        if (j === 1 && k !== 11) return num + 'st';
        if (j === 2 && k !== 12) return num + 'nd';
        if (j === 3 && k !== 13) return num + 'rd';
        return num + 'th';
    },
    
    // NEW: Format compact numbers (like 1.2K instead of 1,234)
    formatCompact(num) {
        if (num < 1000) return num.toString();
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
        return (num / 1000000000).toFixed(1) + 'B';
    },
    
    // NEW: Format progress bar
    formatProgressBar(current, max, width = 20) {
        const progress = Math.max(0, Math.min(1, current / max));
        const filled = Math.floor(progress * width);
        const empty = width - filled;
        return '█'.repeat(filled) + '░'.repeat(empty) + ' ' + this.formatPercent(progress, 1);
    },
    
    // Performance and debugging utilities
    getStats() {
        return {
            ...this._stats,
            cacheSize: this._cacheSize,
            hitRate: this._stats.cacheHits / (this._stats.cacheHits + this._stats.cacheMisses) * 100
        };
    },
    
    clearCache() {
        this._cache.clear();
        this._cacheSize = 0;
    },
    
    resetStats() {
        this._stats.calls = 0;
        this._stats.cacheHits = 0;
        this._stats.cacheMisses = 0;
    }
};