// Floating Text Manager
window.FloatingTextManager = class FloatingTextManager {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.container = document.getElementById('floating-texts');
        this.texts = [];
        
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
    }
    
    create(text, x, y, color = '#00ff88', size = 1) {
        const element = document.createElement('div');
        element.className = 'floating-text';
        element.textContent = text;
        element.style.left = x + 'px';
        element.style.top = y + 'px';
        element.style.color = color;
        element.style.fontSize = (1 * size) + 'rem';
        
        // Random offset for variety
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = -20 - Math.random() * 20;
        
        this.container.appendChild(element);
        this.texts.push(element);
        
        // Animate
        let opacity = 1;
        let currentY = 0;
        
        const startTime = Date.now();
        const duration = 1500;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                this.remove(element);
                return;
            }
            
            // Update position
            currentY = offsetY * progress;
            element.style.transform = `translate(${offsetX * progress}px, ${currentY}px)`;
            
            // Update opacity
            opacity = 1 - progress;
            element.style.opacity = opacity;
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
        
        // Limit floating texts
        if (this.texts.length > 20) {
            this.remove(this.texts[0]);
        }
    }
    
    remove(element) {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
        
        const index = this.texts.indexOf(element);
        if (index > -1) {
            this.texts.splice(index, 1);
        }
    }
    
    clear() {
        this.texts.forEach(text => {
            if (text.parentNode) {
                text.parentNode.removeChild(text);
            }
        });
        this.texts = [];
    }
};