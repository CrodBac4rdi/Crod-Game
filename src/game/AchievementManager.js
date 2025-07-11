// Achievement Manager
window.AchievementManager = class AchievementManager {
    constructor(gameState, eventSystem) {
        this.gameState = gameState;
        this.eventSystem = eventSystem;
    }
    
    // Get all achievements with their status
    getAllAchievements() {
        return GameConfig.ACHIEVEMENTS.map(achievement => ({
            ...achievement,
            unlocked: this.gameState.achievements[achievement.id] || false
        }));
    }
    
    // Get unlocked achievements
    getUnlockedAchievements() {
        return this.getAllAchievements().filter(a => a.unlocked);
    }
    
    // Get locked achievements
    getLockedAchievements() {
        return this.getAllAchievements().filter(a => !a.unlocked);
    }
    
    // Get achievement progress
    getAchievementProgress() {
        const total = GameConfig.ACHIEVEMENTS.length;
        const unlocked = this.getUnlockedAchievements().length;
        return {
            unlocked,
            total,
            percentage: Math.floor((unlocked / total) * 100)
        };
    }
    
    // Get next achievable achievements
    getNextAchievements() {
        const locked = this.getLockedAchievements();
        const suggestions = [];
        
        // Check which ones are close to being achieved
        locked.forEach(achievement => {
            let progress = null;
            
            switch (achievement.id) {
                case 'energy_100':
                    if (this.gameState.energy < 100) {
                        progress = {
                            current: this.gameState.energy,
                            target: 100,
                            percentage: Math.floor((this.gameState.energy / 100) * 100)
                        };
                    }
                    break;
                    
                case 'energy_1000':
                    if (this.gameState.energy < 1000) {
                        progress = {
                            current: this.gameState.energy,
                            target: 1000,
                            percentage: Math.floor((this.gameState.energy / 1000) * 100)
                        };
                    }
                    break;
                    
                case 'energy_1m':
                    if (this.gameState.energy < 1000000) {
                        progress = {
                            current: this.gameState.energy,
                            target: 1000000,
                            percentage: Math.floor((this.gameState.energy / 1000000) * 100)
                        };
                    }
                    break;
                    
                case 'level_5':
                    if (this.gameState.level < 5) {
                        progress = {
                            current: this.gameState.level,
                            target: 5,
                            percentage: Math.floor((this.gameState.level / 5) * 100)
                        };
                    }
                    break;
                    
                case 'level_10':
                    if (this.gameState.level < 10) {
                        progress = {
                            current: this.gameState.level,
                            target: 10,
                            percentage: Math.floor((this.gameState.level / 10) * 100)
                        };
                    }
                    break;
                    
                case 'click_power':
                    if (this.gameState.clickPower < 1000) {
                        progress = {
                            current: this.gameState.clickPower,
                            target: 1000,
                            percentage: Math.floor((this.gameState.clickPower / 1000) * 100)
                        };
                    }
                    break;
                    
                case 'speed_demon':
                    if (this.gameState.stats.boostsUsed < 10) {
                        progress = {
                            current: this.gameState.stats.boostsUsed,
                            target: 10,
                            percentage: Math.floor((this.gameState.stats.boostsUsed / 10) * 100)
                        };
                    }
                    break;
            }
            
            if (progress && progress.percentage > 0) {
                suggestions.push({
                    ...achievement,
                    progress
                });
            }
        });
        
        // Sort by progress percentage
        suggestions.sort((a, b) => b.progress.percentage - a.progress.percentage);
        
        return suggestions.slice(0, 3); // Return top 3
    }
    
    // Format achievement for display
    formatAchievement(achievement) {
        const unlocked = this.gameState.achievements[achievement.id];
        return {
            icon: achievement.icon,
            name: achievement.name,
            description: achievement.desc,
            unlocked: unlocked,
            unlockedClass: unlocked ? 'unlocked' : 'locked'
        };
    }
};