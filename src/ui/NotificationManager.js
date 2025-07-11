// Notification Manager
window.NotificationManager = class NotificationManager {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        this.container = document.getElementById('notifications');
        this.notifications = [];
        
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
        
        // Listen for specific game events
        this.eventSystem.on(GameEvents.LEVEL_UP, (data) => {
            this.show(`Level ${data.level} Reached! +${data.crystals} 💎`, 'level-up');
        });
        
        this.eventSystem.on(GameEvents.ACHIEVEMENT_UNLOCKED, (achievement) => {
            this.show(`${achievement.icon} ${achievement.name} Unlocked!`, 'achievement');
        });
        
        this.eventSystem.on(GameEvents.PRESTIGE, (data) => {
            this.show(`Prestige ${data.count}! +${data.bonus}% Permanent Bonus`, 'prestige');
        });
    }
    
    show(text, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = text;
        
        // Add to container
        this.container.appendChild(notification);
        this.notifications.push(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            this.remove(notification);
        }, 3000);
        
        // Limit notifications
        if (this.notifications.length > 5) {
            this.remove(this.notifications[0]);
        }
    }
    
    remove(notification) {
        notification.classList.remove('show');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }
    
    clear() {
        this.notifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        this.notifications = [];
    }
};