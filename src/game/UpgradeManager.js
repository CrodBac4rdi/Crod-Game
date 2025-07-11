// Upgrade Manager
window.UpgradeManager = class UpgradeManager {
    constructor(gameState, eventSystem) {
        this.gameState = gameState;
        this.eventSystem = eventSystem;
    }
    
    // Get generator cost
    getGeneratorCost(id) {
        const generator = GameConfig.GENERATORS.find(g => g.id === id);
        if (!generator) return Infinity;
        
        const level = this.gameState.generators[id].level;
        return Math.floor(generator.baseCost * Math.pow(generator.costMultiplier, level));
    }
    
    // Get click upgrade cost
    getClickUpgradeCost(id) {
        const upgrade = GameConfig.CLICK_UPGRADES.find(u => u.id === id);
        if (!upgrade) return Infinity;
        
        const level = this.gameState.clickUpgrades[id].level;
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
    }
    
    // Can afford generator
    canAffordGenerator(id) {
        return this.gameState.energy >= this.getGeneratorCost(id);
    }
    
    // Can afford click upgrade
    canAffordClickUpgrade(id) {
        return this.gameState.energy >= this.getClickUpgradeCost(id);
    }
    
    // Buy generator
    buyGenerator(id) {
        const generator = GameConfig.GENERATORS.find(g => g.id === id);
        if (!generator) return false;
        
        const genData = this.gameState.generators[id];
        if (genData.level >= generator.maxLevel) return false;
        
        const cost = this.getGeneratorCost(id);
        if (!this.gameState.spendEnergy(cost)) return false;
        
        // Upgrade generator
        genData.level++;
        this.gameState.updateProduction();
        
        // Gain XP
        this.gameState.addXP(Math.floor(Math.log10(cost + 1) * 10));
        
        this.eventSystem.emit(GameEvents.GENERATOR_PURCHASED, {
            id: id,
            level: genData.level,
            cost: cost
        });
        
        this.eventSystem.emit(GameEvents.FLOATING_TEXT, {
            text: `-${window.FormatUtils.formatNumber(cost)}`,
            color: '#ff3366',
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight * 0.5
        });
        
        return true;
    }
    
    // Buy click upgrade
    buyClickUpgrade(id) {
        const upgrade = GameConfig.CLICK_UPGRADES.find(u => u.id === id);
        if (!upgrade) return false;
        
        const upgradeData = this.gameState.clickUpgrades[id];
        if (upgradeData.level >= upgrade.maxLevel) return false;
        
        const cost = this.getClickUpgradeCost(id);
        if (!this.gameState.spendEnergy(cost)) return false;
        
        // Upgrade
        upgradeData.level++;
        this.gameState.updateClickPower();
        
        // Gain XP
        this.gameState.addXP(Math.floor(Math.log10(cost + 1) * 15));
        
        this.eventSystem.emit(GameEvents.CLICK_UPGRADE_PURCHASED, {
            id: id,
            level: upgradeData.level,
            cost: cost
        });
        
        this.eventSystem.emit(GameEvents.FLOATING_TEXT, {
            text: `-${window.FormatUtils.formatNumber(cost)}`,
            color: '#ff3366',
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight * 0.5
        });
        
        return true;
    }
    
    // Buy max generators (for a specific generator)
    buyMaxGenerator(id) {
        let bought = 0;
        while (this.canAffordGenerator(id) && 
               this.gameState.generators[id].level < GameConfig.GENERATORS.find(g => g.id === id).maxLevel) {
            if (this.buyGenerator(id)) {
                bought++;
            } else {
                break;
            }
        }
        return bought;
    }
    
    // Get generator info
    getGeneratorInfo(id) {
        const generator = GameConfig.GENERATORS.find(g => g.id === id);
        if (!generator) return null;
        
        const genData = this.gameState.generators[id];
        const nextCost = this.getGeneratorCost(id);
        const currentProduction = genData.production;
        const nextProduction = generator.baseProduction * (genData.level + 1) * (1 + this.gameState.prestigeBonus);
        
        return {
            ...generator,
            level: genData.level,
            cost: nextCost,
            canAfford: this.canAffordGenerator(id),
            currentProduction: currentProduction,
            nextProduction: nextProduction,
            isMaxed: genData.level >= generator.maxLevel
        };
    }
    
    // Get click upgrade info
    getClickUpgradeInfo(id) {
        const upgrade = GameConfig.CLICK_UPGRADES.find(u => u.id === id);
        if (!upgrade) return null;
        
        const upgradeData = this.gameState.clickUpgrades[id];
        const nextCost = this.getClickUpgradeCost(id);
        
        return {
            ...upgrade,
            level: upgradeData.level,
            cost: nextCost,
            canAfford: this.canAffordClickUpgrade(id),
            currentMultiplier: Math.pow(upgrade.clickMultiplier, upgradeData.level),
            nextMultiplier: Math.pow(upgrade.clickMultiplier, upgradeData.level + 1),
            isMaxed: upgradeData.level >= upgrade.maxLevel
        };
    }
};