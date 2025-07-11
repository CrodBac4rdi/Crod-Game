// Game State Management
window.GameState = class GameState {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        
        // Resources
        this.energy = GameConfig.INITIAL_ENERGY;
        this.crystals = GameConfig.INITIAL_CRYSTALS;
        
        // Progression
        this.level = GameConfig.INITIAL_LEVEL;
        this.xp = 0;
        this.xpRequired = GameConfig.BASE_XP_REQUIREMENT;
        
        // Click power
        this.baseClickPower = GameConfig.BASE_CLICK_VALUE;
        this.clickPower = this.baseClickPower;
        
        // Prestige
        this.prestigeCount = 0;
        this.prestigeBonus = 0;
        
        // Generators (initialize from config)
        this.generators = {};
        GameConfig.GENERATORS.forEach(gen => {
            this.generators[gen.id] = {
                level: 0,
                production: 0
            };
        });
        
        // Click upgrades
        this.clickUpgrades = {};
        GameConfig.CLICK_UPGRADES.forEach(upgrade => {
            this.clickUpgrades[upgrade.id] = {
                level: 0,
                multiplier: 1
            };
        });
        
        // Achievements
        this.achievements = {};
        GameConfig.ACHIEVEMENTS.forEach(achievement => {
            this.achievements[achievement.id] = false;
        });
        
        // Performance optimizations
        this.achievementCheckCooldown = 0;
        this.achievementCheckInterval = 100; // Only check every 100ms
        this.pendingAchievementChecks = new Set();
        this.achievementCache = new Map();
        
        // Stats
        this.stats = {
            totalClicks: 0,
            totalEnergyEarned: 0,
            totalCrystalsEarned: 0,
            highestLevel: 1,
            boostsUsed: 0,
            playTime: 0,
            startTime: Date.now(),
            lastSaveTime: Date.now()
        };
        
        // Settings
        this.soundEnabled = true;
        this.particlesEnabled = true;
        this.graphicsQuality = 'medium';
        this.autoSave = true;
        
        // Boost state
        this.boostActive = false;
        this.boostEndTime = 0;
        
        // Per second calculations
        this.energyPerSecond = 0;
        this.updateProduction();
        
        // UI update throttling
        this.lastUIUpdate = 0;
        this.uiUpdateInterval = 50; // Update UI every 50ms
    }
    
    // Add energy
    addEnergy(amount) {
        const actualAmount = Math.floor(amount * (this.boostActive ? GameConfig.BOOST_MULTIPLIER : 1));
        this.energy += actualAmount;
        this.stats.totalEnergyEarned += actualAmount;
        
        this.eventSystem.emit(GameEvents.ENERGY_CHANGED, this.energy);
        this.checkAchievements();
        
        return actualAmount;
    }
    
    // Spend energy
    spendEnergy(amount) {
        if (this.energy < amount) return false;
        
        this.energy -= amount;
        this.eventSystem.emit(GameEvents.ENERGY_CHANGED, this.energy);
        
        return true;
    }
    
    // Add crystals
    addCrystals(amount) {
        this.crystals += amount;
        this.stats.totalCrystalsEarned += amount;
        this.eventSystem.emit(GameEvents.CRYSTALS_CHANGED, this.crystals);
    }
    
    // Add XP
    addXP(amount) {
        this.xp += amount;
        
        while (this.xp >= this.xpRequired) {
            this.xp -= this.xpRequired;
            this.levelUp();
        }
        
        this.eventSystem.emit(GameEvents.XP_GAINED, { xp: this.xp, required: this.xpRequired });
    }
    
    // Level up
    levelUp() {
        this.level++;
        this.xpRequired = Math.floor(GameConfig.BASE_XP_REQUIREMENT * Math.pow(GameConfig.XP_GROWTH_RATE, this.level - 1));
        
        // Reward crystals
        const crystalReward = this.level * 5;
        this.addCrystals(crystalReward);
        
        // Update stats
        if (this.level > this.stats.highestLevel) {
            this.stats.highestLevel = this.level;
        }
        
        this.eventSystem.emit(GameEvents.LEVEL_UP, {
            level: this.level,
            crystals: crystalReward
        });
        
        this.checkAchievements();
    }
    
    // Prestige
    prestige() {
        if (this.level < GameConfig.PRESTIGE_UNLOCK_LEVEL) return false;
        
        // Calculate prestige bonus
        const newBonus = Math.floor(this.level * GameConfig.PRESTIGE_BONUS_MULTIPLIER);
        this.prestigeBonus += newBonus;
        this.prestigeCount++;
        
        // Reset progression
        this.energy = 0;
        this.level = 1;
        this.xp = 0;
        this.xpRequired = GameConfig.BASE_XP_REQUIREMENT;
        
        // Reset generators but keep prestige bonus
        Object.keys(this.generators).forEach(id => {
            this.generators[id].level = 0;
            this.generators[id].production = 0;
        });
        
        // Keep click upgrades
        this.updateClickPower();
        this.updateProduction();
        
        this.eventSystem.emit(GameEvents.PRESTIGE, {
            count: this.prestigeCount,
            bonus: newBonus,
            totalBonus: this.prestigeBonus
        });
        
        this.checkAchievements();
        return true;
    }
    
    // Update production rates
    updateProduction() {
        this.energyPerSecond = 0;
        
        GameConfig.GENERATORS.forEach(gen => {
            const genData = this.generators[gen.id];
            if (genData.level > 0) {
                genData.production = gen.baseProduction * genData.level * (1 + this.prestigeBonus);
                this.energyPerSecond += genData.production;
            }
        });
        
        // Schedule generator master check
        this.pendingAchievementChecks.add('generator_master');
    }
    
    // Update click power
    updateClickPower() {
        let multiplier = 1;
        
        GameConfig.CLICK_UPGRADES.forEach(upgrade => {
            const upgradeData = this.clickUpgrades[upgrade.id];
            if (upgradeData.level > 0) {
                multiplier *= Math.pow(upgrade.clickMultiplier, upgradeData.level);
            }
        });
        
        this.clickPower = Math.floor(this.baseClickPower * multiplier * (1 + this.prestigeBonus));
    }
    
    // Process per-second updates
    update(deltaTime) {
        // Add energy from generators
        if (this.energyPerSecond > 0) {
            const energyGain = this.energyPerSecond * deltaTime;
            this.addEnergyBatch(energyGain);
        }
        
        // Update play time
        this.stats.playTime += deltaTime * 1000;
        
        // Check boost expiry
        if (this.boostActive && Date.now() > this.boostEndTime) {
            this.boostActive = false;
            this.eventSystem.emit(GameEvents.BOOST_EXPIRED);
        }
        
        // Throttled UI updates
        this.updateUIThrottled();
    }
    
    // Optimized energy addition for batch updates
    addEnergyBatch(amount) {
        const actualAmount = Math.floor(amount * (this.boostActive ? GameConfig.BOOST_MULTIPLIER : 1));
        this.energy += actualAmount;
        this.stats.totalEnergyEarned += actualAmount;
        
        // Don't emit events for every small update
        return actualAmount;
    }
    
    // Throttled UI updates
    updateUIThrottled() {
        const now = Date.now();
        if (now - this.lastUIUpdate >= this.uiUpdateInterval) {
            this.eventSystem.emit(GameEvents.ENERGY_CHANGED, this.energy);
            this.lastUIUpdate = now;
        }
    }
    
    // Activate boost
    activateBoost() {
        if (this.boostActive) return false;
        
        this.boostActive = true;
        this.boostEndTime = Date.now() + GameConfig.BOOST_DURATION;
        this.stats.boostsUsed++;
        
        this.eventSystem.emit(GameEvents.BOOST_ACTIVATED, {
            duration: GameConfig.BOOST_DURATION,
            multiplier: GameConfig.BOOST_MULTIPLIER
        });
        
        this.checkAchievements();
        return true;
    }
    
    // Optimized achievement checking
    checkAchievements() {
        // Only check if cooldown has expired
        const now = Date.now();
        if (now - this.achievementCheckCooldown < this.achievementCheckInterval) {
            return;
        }
        this.achievementCheckCooldown = now;
        
        // First click
        if (this.stats.totalClicks > 0 && !this.achievements.first_click) {
            this.unlockAchievement('first_click');
        }
        
        // Energy milestones (cached)
        this.checkEnergyAchievements();
        
        // Level milestones (cached)
        this.checkLevelAchievements();
        
        // Prestige
        if (this.prestigeCount > 0 && !this.achievements.first_prestige) {
            this.unlockAchievement('first_prestige');
        }
        
        // Click power
        if (this.clickPower >= 1000 && !this.achievements.click_power) {
            this.unlockAchievement('click_power');
        }
        
        // Boosts
        if (this.stats.boostsUsed >= 10 && !this.achievements.speed_demon) {
            this.unlockAchievement('speed_demon');
        }
        
        // Generator master (expensive, check less frequently)
        if (this.pendingAchievementChecks.has('generator_master')) {
            this.checkGeneratorMasterAchievement();
            this.pendingAchievementChecks.delete('generator_master');
        }
    }
    
    checkEnergyAchievements() {
        const cacheKey = `energy_${Math.floor(this.energy / 100)}`;
        if (this.achievementCache.has(cacheKey)) return;
        
        if (this.energy >= 100 && !this.achievements.energy_100) {
            this.unlockAchievement('energy_100');
        }
        if (this.energy >= 1000 && !this.achievements.energy_1000) {
            this.unlockAchievement('energy_1000');
        }
        if (this.energy >= 1000000 && !this.achievements.energy_1m) {
            this.unlockAchievement('energy_1m');
        }
        
        this.achievementCache.set(cacheKey, true);
    }
    
    checkLevelAchievements() {
        const cacheKey = `level_${this.level}`;
        if (this.achievementCache.has(cacheKey)) return;
        
        if (this.level >= 5 && !this.achievements.level_5) {
            this.unlockAchievement('level_5');
        }
        if (this.level >= 10 && !this.achievements.level_10) {
            this.unlockAchievement('level_10');
        }
        
        this.achievementCache.set(cacheKey, true);
    }
    
    checkGeneratorMasterAchievement() {
        if (this.achievements.generator_master) return;
        
        let hasAllGenerators = true;
        for (const gen of GameConfig.GENERATORS) {
            if (this.generators[gen.id].level < 10) {
                hasAllGenerators = false;
                break;
            }
        }
        
        if (hasAllGenerators) {
            this.unlockAchievement('generator_master');
        }
    }
    
    // Unlock achievement
    unlockAchievement(id) {
        this.achievements[id] = true;
        const achievement = GameConfig.ACHIEVEMENTS.find(a => a.id === id);
        
        this.eventSystem.emit(GameEvents.ACHIEVEMENT_UNLOCKED, achievement);
        this.eventSystem.emit(GameEvents.NOTIFICATION, {
            text: `Achievement Unlocked: ${achievement.name}`,
            type: 'achievement'
        });
        
        // Crystal reward
        this.addCrystals(10);
    }
    
    // Load save data
    loadSave(saveData) {
        if (!saveData || !saveData.state) return;
        
        const state = saveData.state;
        
        // Load resources
        this.energy = state.energy || 0;
        this.crystals = state.crystals || 0;
        
        // Load progression
        this.level = state.level || 1;
        this.xp = state.xp || 0;
        this.xpRequired = state.xpRequired || GameConfig.BASE_XP_REQUIREMENT;
        this.clickPower = state.clickPower || GameConfig.BASE_CLICK_VALUE;
        
        // Load prestige
        this.prestigeCount = state.prestigeCount || 0;
        this.prestigeBonus = state.prestigeBonus || 0;
        
        // Load generators
        if (state.generators) {
            Object.keys(state.generators).forEach(id => {
                if (this.generators[id]) {
                    this.generators[id] = state.generators[id];
                }
            });
        }
        
        // Load click upgrades
        if (state.clickUpgrades) {
            Object.keys(state.clickUpgrades).forEach(id => {
                if (this.clickUpgrades[id]) {
                    this.clickUpgrades[id] = state.clickUpgrades[id];
                }
            });
        }
        
        // Load achievements
        if (state.achievements) {
            Object.keys(state.achievements).forEach(id => {
                this.achievements[id] = state.achievements[id];
            });
        }
        
        // Load stats
        if (state.stats) {
            Object.assign(this.stats, state.stats);
        }
        
        // Load settings
        if (saveData.settings) {
            this.soundEnabled = saveData.settings.soundEnabled ?? true;
            this.particlesEnabled = saveData.settings.particlesEnabled ?? true;
            this.graphicsQuality = saveData.settings.graphicsQuality || 'medium';
            this.autoSave = saveData.settings.autoSave ?? true;
        }
        
        // Update calculations
        this.updateClickPower();
        this.updateProduction();
    }
};