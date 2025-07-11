// UI System - User Interface Management Only
class UISystem {
    constructor() {
        this.elements = new Map();
        this.isInitialized = false;
        
        this.configSystem = null;
        this.eventSystem = null;
    }
    
    async init() {
        // Get dependencies
        this.configSystem = window.gameShell.getSystem('config');
        this.eventSystem = window.gameShell.getSystem('events');
        
        if (!this.configSystem || !this.eventSystem) {
            throw new Error('UISystem dependencies not found');
        }
        
        try {
            console.log('[UISystem] Initializing UI...');
            
            // Cache UI elements
            this.cacheElements();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize UI values
            this.initializeValues();
            
            this.isInitialized = true;
            console.log('[UISystem] UI initialized successfully');
            
        } catch (error) {
            console.error('[UISystem] Failed to initialize UI:', error);
            throw error;
        }
    }
    
    cacheElements() {
        const elementIds = [
            'energy-value',
            'crystals-value',
            'energy-rate',
            'level-value',
            'xp-fill',
            'xp-text'
        ];
        
        elementIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.elements.set(id, element);
            } else {
                console.warn(`[UISystem] Element not found: ${id}`);
            }
        });
    }
    
    setupEventListeners() {
        // Click event for canvas
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            canvas.addEventListener('click', (event) => {
                this.eventSystem.emit('canvas-click', {
                    x: event.clientX,
                    y: event.clientY
                });
            });
        }
        
        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.toggleSettings();
            });
        }
        
        // Keyboard shortcuts
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeModals();
            }
        });
    }
    
    initializeValues() {
        this.updateEnergy(0);
        this.updateCrystals(0);
        this.updateLevel(1);
        this.updateXP(0, 100);
    }
    
    updateEnergy(value, rate = 0) {
        const energyElement = this.elements.get('energy-value');
        const rateElement = this.elements.get('energy-rate');
        
        if (energyElement) {
            energyElement.textContent = this.formatNumber(value);
        }
        
        if (rateElement && rate > 0) {
            rateElement.textContent = `+${this.formatNumber(rate)} /s`;
        }
    }
    
    updateCrystals(value) {
        const element = this.elements.get('crystals-value');
        if (element) {
            element.textContent = this.formatNumber(value);
        }
    }
    
    updateLevel(level) {
        const element = this.elements.get('level-value');
        if (element) {
            element.textContent = level.toString();
        }
    }
    
    updateXP(current, required) {
        const fillElement = this.elements.get('xp-fill');
        const textElement = this.elements.get('xp-text');
        
        const percentage = Math.min((current / required) * 100, 100);
        
        if (fillElement) {
            fillElement.style.width = percentage + '%';
        }
        
        if (textElement) {
            textElement.textContent = `${this.formatNumber(current)} / ${this.formatNumber(required)} XP`;
        }
    }
    
    showFloatingText(text, x, y, color = '#00ff88') {
        const floatingTexts = document.getElementById('floating-texts');
        if (!floatingTexts) return;
        
        const element = document.createElement('div');
        element.className = 'floating-text';
        element.textContent = text;
        element.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            color: ${color};
            font-weight: bold;
            font-size: 18px;
            pointer-events: none;
            z-index: 1000;
            text-shadow: 0 0 5px rgba(0,0,0,0.8);
        `;
        
        floatingTexts.appendChild(element);
        
        // Animate and remove
        element.animate([
            { transform: 'translateY(0px)', opacity: 1 },
            { transform: 'translateY(-50px)', opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).addEventListener('finish', () => {
            element.remove();
        });
    }
    
    showNotification(text, type = 'info') {
        const notifications = document.getElementById('notifications');
        if (!notifications) return;
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = text;
        
        notifications.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    toggleSettings() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            const isVisible = modal.style.display !== 'none';
            modal.style.display = isVisible ? 'none' : 'block';
        }
    }
    
    closeModals() {
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal) {
            settingsModal.style.display = 'none';
        }
    }
    
    formatNumber(num) {
        if (num < 1000) return Math.floor(num).toString();
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
        return (num / 1000000000).toFixed(1) + 'B';
    }
    
    dispose() {
        // Remove event listeners
        this.elements.clear();
        this.isInitialized = false;
    }
}

window.UISystem = UISystem;