// Optimized Floating Text Manager
window.FloatingTextManager = class FloatingTextManager {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.container = document.getElementById('floating-texts');
        this.texts = [];
        
        // Performance optimizations
        this.textPool = [];
        this.maxPoolSize = 30;
        this.maxActiveTexts = 20;
        this.animationQueue = [];
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        // Create container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'floating-texts';
            this.container.className = 'floating-texts';
            document.querySelector('.game-ui').appendChild(this.container);
        }
        
        // Listen for floating text events
        this.eventSystem.on(GameEvents.FLOATING_TEXT, (data) => {
            this.create(data.text, data.x, data.y, data.color, data.size);
        });
        
        // Periodic cleanup
        setInterval(() => {
            this.optimizedCleanup();
        }, 2000);
    }
    
    create(text, x, y, color = '#00ff88', size = 1) {
        // Limit active texts for performance
        if (this.texts.length >= this.maxActiveTexts) {
            this.remove(this.texts[0]);
        }
        
        // Get or create element from pool
        let element = this.getFromPool();
        if (!element) {
            element = this.createElement();
        }
        
        // Setup element
        element.textContent = text;
        element.style.left = x + 'px';
        element.style.top = y + 'px';
        element.style.color = color;
        element.style.fontSize = (1 * size) + 'rem';
        element.style.opacity = '1';
        element.style.transform = 'translate(0, 0)';
        element.style.display = 'block';
        
        // Random offset for variety
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = -20 - Math.random() * 20;
        
        this.container.appendChild(element);
        this.texts.push(element);
        
        // Use CSS animation for better performance
        this.animateWithCSS(element, offsetX, offsetY);
    }
    
    createElement() {
        const element = document.createElement('div');
        element.className = 'floating-text';
        return element;
    }
    
    getFromPool() {
        return this.textPool.pop() || null;
    }
    
    returnToPool(element) {
        if (this.textPool.length < this.maxPoolSize) {
            element.style.display = 'none';
            element.removeAttribute('style');
            element.className = 'floating-text';
            this.textPool.push(element);
        }
    }
    
    animateWithCSS(element, offsetX, offsetY) {
        // Use CSS custom properties for animation
        element.style.setProperty('--offset-x', offsetX + 'px');
        element.style.setProperty('--offset-y', offsetY + 'px');
        element.classList.add('floating-text-animate');
        
        // Clean up after animation
        setTimeout(() => {
            if (element.parentNode) {
                this.remove(element);
            }
        }, 1500);
    }
    
    remove(element) {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
        
        const index = this.texts.indexOf(element);
        if (index > -1) {
            this.texts.splice(index, 1);
        }
        
        // Return element to pool
        this.returnToPool(element);
    }
    
    clear() {
        this.texts.forEach(text => {
            if (text.parentNode) {
                text.parentNode.removeChild(text);
            }
            this.returnToPool(text);
        });
        this.texts = [];
    }
    
    // Batch create floating texts for better performance
    createBatch(textData) {
        const fragment = document.createDocumentFragment();
        
        textData.forEach(data => {
            const element = this.getFromPool() || this.createElement();
            element.textContent = data.text;
            element.style.left = data.x + 'px';
            element.style.top = data.y + 'px';
            element.style.color = data.color || '#00ff88';
            element.style.fontSize = (data.size || 1) + 'rem';
            
            fragment.appendChild(element);
            this.texts.push(element);
        });
        
        this.container.appendChild(fragment);
    }
    
    // Optimized cleanup - run periodically
    optimizedCleanup() {
        const now = Date.now();
        this.texts = this.texts.filter(text => {
            if (text.dataset.createdAt && now - text.dataset.createdAt > 2000) {
                this.remove(text);
                return false;
            }
            return true;
        });
    }
};