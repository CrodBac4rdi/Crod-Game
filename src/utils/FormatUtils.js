// Format Utilities
window.FormatUtils = {
    // Format large numbers with abbreviations
    formatNumber(num) {
        if (num < 1000) {
            return Math.floor(num).toString();
        }
        
        const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
        const tier = Math.log10(Math.abs(num)) / 3 | 0;
        
        if (tier === 0) return num.toString();
        
        const suffix = units[tier];
        const scale = Math.pow(10, tier * 3);
        const scaled = num / scale;
        
        return scaled.toFixed(scaled < 10 ? 2 : 1) + suffix;
    },
    
    // Format time in seconds to readable format
    formatTime(seconds) {
        if (seconds < 60) {
            return Math.floor(seconds) + 's';
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}m ${secs}s`;
        } else if (seconds < 86400) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
        } else {
            const days = Math.floor(seconds / 86400);
            const hours = Math.floor((seconds % 86400) / 3600);
            return `${days}d ${hours}h`;
        }
    },
    
    // Format time in milliseconds
    formatTimeMs(ms) {
        return this.formatTime(ms / 1000);
    },
    
    // Format percentage
    formatPercent(value, decimals = 0) {
        return (value * 100).toFixed(decimals) + '%';
    },
    
    // Format with commas
    formatWithCommas(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    // Format production rate
    formatRate(rate) {
        return this.formatNumber(rate) + ' /s';
    },
    
    // Format multiplier
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
    
    // Format date
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
};