// Optimized Notification Manager
window.NotificationManager = class NotificationManager {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.container = document.getElementById('notifications');
        this.notifications = [];
        
        // Performance optimizations
        this.notificationPool = [];
        this.maxPoolSize = 10;
        this.maxNotifications = 5;
        this.animationQueue = [];
        
        this.init();
    }
    
    init() {
        // Create container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notifications';
            this.container.className = 'notifications';
            document.querySelector('.game-ui').appendChild(this.container);
        }
        
        // Listen for notification events
        this.eventSystem.on(GameEvents.NOTIFICATION, (data) => {
            this.show(data.text, data.type);
        });
        
        // Listen for specific game events with enhanced notifications
        this.eventSystem.on(GameEvents.LEVEL_UP, (data) => {
            this.showEnhanced(`Level ${data.level} Reached! +${data.crystals} 💎`, 'level-up', {
                icon: '🎊',
                holographic: true,
                duration: 4000
            });
        });
        
        this.eventSystem.on(GameEvents.ACHIEVEMENT_UNLOCKED, (achievement) => {
            this.showEnhanced(`${achievement.icon} ${achievement.name} Unlocked!`, 'achievement', {
                neon: true,
                duration: 5000
            });
        });
        
        this.eventSystem.on(GameEvents.PRESTIGE, (data) => {
            this.showEnhanced(`Prestige ${data.count}! +${data.bonus}% Permanent Bonus`, 'prestige', {
                icon: '⭐',
                glitch: true,
                holographic: true,
                duration: 6000
            });
        });
    }
    
    show(text, type = 'info') {
        // Limit notifications for performance
        if (this.notifications.length >= this.maxNotifications) {
            this.remove(this.notifications[0]);
        }
        
        // Get or create notification from pool
        let notification = this.getFromPool();
        if (!notification) {
            notification = this.createNotification();
        }
        
        // Setup notification
        notification.className = `notification notification-${type}`;
        notification.textContent = text;
        notification.style.display = 'block';
        
        // Add to container
        this.container.appendChild(notification);
        this.notifications.push(notification);
        
        // Animate in with RAF for smoother performance
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Remove after delay
        setTimeout(() => {
            this.remove(notification);
        }, 3000);
    }
    
    createNotification() {
        const notification = document.createElement('div');
        notification.className = 'notification';
        return notification;
    }
    
    getFromPool() {
        return this.notificationPool.pop() || null;
    }
    
    returnToPool(notification) {
        if (this.notificationPool.length < this.maxPoolSize) {
            notification.style.display = 'none';
            notification.className = 'notification';
            notification.classList.remove('show');
            notification.textContent = '';
            this.notificationPool.push(notification);
        }
    }
    
    remove(notification) {
        notification.classList.remove('show');
        
        // Use transition end event instead of setTimeout for better performance
        const handleTransitionEnd = () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
            
            // Return to pool
            this.returnToPool(notification);
            
            notification.removeEventListener('transitionend', handleTransitionEnd);
        };
        
        notification.addEventListener('transitionend', handleTransitionEnd);
        
        // Fallback timeout in case transition event doesn't fire
        setTimeout(() => {
            if (notification.parentNode) {
                handleTransitionEnd();
            }
        }, 400);
    }
    
    clear() {
        this.notifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.returnToPool(notification);
        });
        this.notifications = [];
    }
    
    // Enhanced notification with custom styling
    showEnhanced(text, type = 'info', options = {}) {
        const notification = this.getFromPool() || this.createNotification();
        
        // Setup basic properties
        notification.className = `notification notification-${type}`;
        notification.textContent = text;
        
        // Apply custom options
        if (options.duration) {
            notification.dataset.duration = options.duration;
        }
        if (options.icon) {
            notification.innerHTML = `<span class="notification-icon">${options.icon}</span>${text}`;
        }
        if (options.persistent) {
            notification.classList.add('persistent');
        }
        
        // Add enhanced effects
        if (options.glitch) {
            notification.classList.add('glitch');
        }
        if (options.holographic) {
            notification.classList.add('holographic');
        }
        if (options.neon) {
            notification.classList.add('neon-text');
        }
        
        this.container.appendChild(notification);
        this.notifications.push(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Auto-remove unless persistent
        if (!options.persistent) {
            const duration = options.duration || 3000;
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }
        
        return notification;
    }
    
    // Stack notifications properly
    repositionNotifications() {
        this.notifications.forEach((notification, index) => {
            const offset = index * 70; // 70px spacing
            notification.style.transform = `translateX(-50%) translateY(${offset}px)`;
        });
    }
};