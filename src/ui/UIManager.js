// Optimized UI Manager
window.UIManager = class UIManager {
    constructor(gameState, eventSystem, upgradeManager, achievementManager) {
        this.gameState = gameState;
        this.eventSystem = eventSystem;
        this.upgradeManager = upgradeManager;
        this.achievementManager = achievementManager;
        
        this.currentTab = 'upgrades';
        this.updateInterval = null;
        
        // Performance optimizations
        this.lastUpdateTime = 0;
        this.updateThrottle = 16; // ~60fps
        this.elementsCache = new Map();
        this.domPool = new Map();
        this.pendingUpdates = new Set();
        this.isVisible = true;
        this.rafId = null;
        
        // Element pools for recycling
        this.initElementPools();
        
        this.init();
    }
    
    init() {
        // Setup tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Setup buttons
        document.getElementById('prestige-btn').addEventListener('click', () => {
            if (this.gameState.level >= GameConfig.PRESTIGE_UNLOCK_LEVEL) {
                if (confirm(`Prestige will reset your progress but grant you a ${Math.floor(this.gameState.level * GameConfig.PRESTIGE_BONUS_MULTIPLIER * 100)}% permanent bonus. Continue?`)) {
                    this.gameState.prestige();
                }
            }
        });
        
        document.getElementById('boost-btn').addEventListener('click', () => {
            this.gameState.activateBoost();
        });
        
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showSettings();
        });
        
        // Start update loop
        this.startUpdateLoop();
        
        // Listen to events
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Optimized event listeners - schedule updates instead of immediate execution
        this.eventSystem.on(GameEvents.ENERGY_CHANGED, () => this.scheduleUpdate('resources'));
        this.eventSystem.on(GameEvents.CRYSTALS_CHANGED, () => this.scheduleUpdate('resources'));
        
        // Progression updates
        this.eventSystem.on(GameEvents.XP_GAINED, () => this.scheduleUpdate('level'));
        this.eventSystem.on(GameEvents.LEVEL_UP, (data) => {
            this.scheduleUpdate('level');
            this.scheduleUpdate('prestige');
        });
        
        // Upgrade updates
        this.eventSystem.on(GameEvents.GENERATOR_PURCHASED, () => {
            this.scheduleUpdate('upgrades');
            this.scheduleUpdate('resources');
        });
        
        this.eventSystem.on(GameEvents.CLICK_UPGRADE_PURCHASED, () => {
            this.scheduleUpdate('upgrades');
        });
        
        // Achievement updates
        this.eventSystem.on(GameEvents.ACHIEVEMENT_UNLOCKED, () => {
            this.scheduleUpdate('achievements');
        });
        
        // Boost updates
        this.eventSystem.on(GameEvents.BOOST_ACTIVATED, () => {
            this.scheduleUpdate('boost');
        });
        
        this.eventSystem.on(GameEvents.BOOST_EXPIRED, () => {
            this.scheduleUpdate('boost');
        });
    }
    
    startUpdateLoop() {
        // Optimized update loop using RAF and throttling
        const update = (timestamp) => {
            if (timestamp - this.lastUpdateTime >= this.updateThrottle && this.isVisible) {
                this.processPendingUpdates();
                this.lastUpdateTime = timestamp;
            }
            this.rafId = requestAnimationFrame(update);
        };
        this.rafId = requestAnimationFrame(update);
        
        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (this.isVisible) {
                this.scheduleUpdate('resources');
                this.scheduleUpdate('upgrades');
            }
        });
    }
    
    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tab}-tab`);
        });
        
        // Update content based on tab
        switch (tab) {
            case 'upgrades':
                this.updateUpgrades();
                break;
            case 'skills':
                this.updateSkills();
                break;
            case 'achievements':
                this.updateAchievements();
                break;
            case 'stats':
                this.updateStats();
                break;
        }
        
        this.eventSystem.emit(GameEvents.TAB_CHANGED, tab);
    }
    
    updateResources() {
        // Cached DOM elements for performance
        if (!this.elementsCache.has('resources')) {
            this.elementsCache.set('resources', {
                energyValue: document.getElementById('energy-value'),
                energyRate: document.getElementById('energy-rate'),
                crystalsValue: document.getElementById('crystals-value')
            });
        }
        
        const elements = this.elementsCache.get('resources');
        
        // Only update if values changed
        const energyText = FormatUtils.formatNumber(this.gameState.energy);
        const rateText = FormatUtils.formatRate(this.gameState.energyPerSecond);
        const crystalsText = FormatUtils.formatNumber(this.gameState.crystals);
        
        if (elements.energyValue.textContent !== energyText) {
            elements.energyValue.textContent = energyText;
            this.pulseElement(elements.energyValue.closest('.resource'));
        }
        
        if (elements.energyRate.textContent !== rateText) {
            elements.energyRate.textContent = rateText;
        }
        
        if (elements.crystalsValue.textContent !== crystalsText) {
            elements.crystalsValue.textContent = crystalsText;
            this.pulseElement(elements.crystalsValue.closest('.resource'));
        }
    }
    
    updateLevel() {
        document.getElementById('level-value').textContent = this.gameState.level;
        
        const xpPercent = (this.gameState.xp / this.gameState.xpRequired) * 100;
        document.getElementById('xp-fill').style.width = xpPercent + '%';
        document.getElementById('xp-text').textContent = `${Math.floor(this.gameState.xp)} / ${this.gameState.xpRequired} XP`;
    }
    
    updateUpgrades() {
        // Efficient upgrade updates using virtual DOM and recycling
        if (!this.elementsCache.has('upgrades')) {
            this.elementsCache.set('upgrades', {
                generators: new Map(),
                clickUpgrades: new Map(),
                generatorsList: document.getElementById('generators-list'),
                clickUpgradesList: document.getElementById('click-upgrades-list')
            });
        }
        
        const cache = this.elementsCache.get('upgrades');
        
        // Update generators efficiently
        this.updateUpgradeList(GameConfig.GENERATORS, cache.generators, 
            cache.generatorsList, 'generator');
        
        // Update click upgrades efficiently  
        this.updateUpgradeList(GameConfig.CLICK_UPGRADES, cache.clickUpgrades,
            cache.clickUpgradesList, 'click');
    }
    
    updateUpgradeList(configs, cache, container, type) {
        const fragment = document.createDocumentFragment();
        
        configs.forEach(config => {
            const info = type === 'generator' ? 
                this.upgradeManager.getGeneratorInfo(config.id) :
                this.upgradeManager.getClickUpgradeInfo(config.id);
            
            let item = cache.get(config.id);
            if (!item) {
                item = this.createUpgradeItem(info, type);
                cache.set(config.id, item);
            } else {
                this.updateUpgradeItem(item, info, type);
            }
            
            fragment.appendChild(item);
        });
        
        // Batch DOM update
        container.innerHTML = '';
        container.appendChild(fragment);
    }
    
    updateUpgradeItem(item, info, type) {
        // Update existing item efficiently
        const header = item.querySelector('.upgrade-header');
        const nameSpan = header.querySelector('.upgrade-name');
        const levelSpan = header.querySelector('.upgrade-level');
        const desc = item.querySelector('.upgrade-desc');
        const cost = item.querySelector('.upgrade-cost');
        
        // Update classes
        item.className = 'upgrade-item';
        if (info.canAfford && !info.isMaxed) item.classList.add('can-afford');
        if (info.isMaxed) item.classList.add('maxed');
        
        // Update content only if changed
        const newName = `${info.icon} ${info.name}`;
        if (nameSpan.textContent !== newName) {
            nameSpan.textContent = newName;
        }
        
        const newLevel = FormatUtils.formatLevel(info.level, info.maxLevel);
        if (levelSpan.textContent !== newLevel) {
            levelSpan.textContent = newLevel;
        }
        
        // Update description
        let newDesc;
        if (type === 'generator') {
            newDesc = info.level > 0 ? 
                `Producing ${FormatUtils.formatRate(info.currentProduction)}` :
                `Will produce ${FormatUtils.formatRate(info.nextProduction)}`;
        } else {
            newDesc = `Click power x${FormatUtils.formatMultiplier(info.nextMultiplier)}`;
        }
        
        if (desc.textContent !== newDesc) {
            desc.textContent = newDesc;
        }
        
        // Update cost
        const newCost = info.isMaxed ? 'MAX LEVEL' : `Cost: ${FormatUtils.formatNumber(info.cost)} ⚡`;
        if (cost.textContent !== newCost) {
            cost.innerHTML = newCost;
        }
    }
    
    createUpgradeItem(info, type) {
        const div = document.createElement('div');
        div.className = 'upgrade-item';
        
        if (info.canAfford && !info.isMaxed) {
            div.classList.add('can-afford');
        }
        if (info.isMaxed) {
            div.classList.add('maxed');
        }
        
        const header = document.createElement('div');
        header.className = 'upgrade-header';
        header.innerHTML = `
            <span class="upgrade-name">${info.icon} ${info.name}</span>
            <span class="upgrade-level">${FormatUtils.formatLevel(info.level, info.maxLevel)}</span>
        `;
        
        const desc = document.createElement('div');
        desc.className = 'upgrade-desc';
        
        if (type === 'generator') {
            if (info.level > 0) {
                desc.textContent = `Producing ${FormatUtils.formatRate(info.currentProduction)}`;
            } else {
                desc.textContent = `Will produce ${FormatUtils.formatRate(info.nextProduction)}`;
            }
        } else {
            desc.textContent = `Click power x${FormatUtils.formatMultiplier(info.nextMultiplier)}`;
        }
        
        const cost = document.createElement('div');
        cost.className = 'upgrade-cost';
        
        if (!info.isMaxed) {
            cost.innerHTML = `Cost: ${FormatUtils.formatNumber(info.cost)} ⚡`;
            
            // Add click handler
            div.addEventListener('click', () => {
                if (type === 'generator') {
                    this.upgradeManager.buyGenerator(info.id);
                } else {
                    this.upgradeManager.buyClickUpgrade(info.id);
                }
            });
        } else {
            cost.textContent = 'MAX LEVEL';
        }
        
        div.appendChild(header);
        div.appendChild(desc);
        div.appendChild(cost);
        
        return div;
    }
    
    updateSkills() {
        const skillsTree = document.getElementById('skills-tree');
        skillsTree.innerHTML = '<p style="color: var(--text-dim); text-align: center; margin-top: 50px;">Skills coming soon!</p>';
    }
    
    updateAchievements() {
        const achievementsList = document.getElementById('achievements-list');
        achievementsList.innerHTML = '';
        
        const achievements = this.achievementManager.getAllAchievements();
        const progress = this.achievementManager.getAchievementProgress();
        
        // Progress bar
        const progressDiv = document.createElement('div');
        progressDiv.style.marginBottom = '20px';
        progressDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Progress</span>
                <span>${progress.unlocked} / ${progress.total}</span>
            </div>
            <div class="xp-bar" style="width: 100%;">
                <div class="xp-fill" style="width: ${progress.percentage}%"></div>
            </div>
        `;
        achievementsList.appendChild(progressDiv);
        
        // Achievement grid
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
        grid.style.gap = '12px';
        
        achievements.forEach(achievement => {
            const item = document.createElement('div');
            item.className = 'upgrade-item';
            item.style.opacity = achievement.unlocked ? '1' : '0.5';
            
            item.innerHTML = `
                <div class="upgrade-header">
                    <span class="upgrade-name">${achievement.icon} ${achievement.name}</span>
                    ${achievement.unlocked ? '<span style="color: var(--color-success);">✓</span>' : ''}
                </div>
                <div class="upgrade-desc">${achievement.desc}</div>
            `;
            
            grid.appendChild(item);
        });
        
        achievementsList.appendChild(grid);
    }
    
    updateStats() {
        const statsList = document.getElementById('stats-list');
        
        const stats = [
            { label: 'Total Clicks', value: FormatUtils.formatNumber(this.gameState.stats.totalClicks) },
            { label: 'Total Energy Earned', value: FormatUtils.formatNumber(this.gameState.stats.totalEnergyEarned) },
            { label: 'Total Crystals Earned', value: FormatUtils.formatNumber(this.gameState.stats.totalCrystalsEarned) },
            { label: 'Highest Level', value: this.gameState.stats.highestLevel },
            { label: 'Prestige Count', value: this.gameState.prestigeCount },
            { label: 'Prestige Bonus', value: FormatUtils.formatPercent(this.gameState.prestigeBonus) },
            { label: 'Boosts Used', value: this.gameState.stats.boostsUsed },
            { label: 'Play Time', value: FormatUtils.formatTimeMs(this.gameState.stats.playTime) },
            { label: 'Click Power', value: FormatUtils.formatNumber(this.gameState.clickPower) },
            { label: 'Energy per Second', value: FormatUtils.formatRate(this.gameState.energyPerSecond) }
        ];
        
        statsList.innerHTML = stats.map(stat => `
            <div class="upgrade-item" style="cursor: default;">
                <div style="display: flex; justify-content: space-between;">
                    <span>${stat.label}</span>
                    <span style="color: var(--color-primary); font-weight: 600;">${stat.value}</span>
                </div>
            </div>
        `).join('');
    }
    
    updatePrestigeButton() {
        const btn = document.getElementById('prestige-btn');
        const info = document.getElementById('prestige-info');
        
        if (this.gameState.level >= GameConfig.PRESTIGE_UNLOCK_LEVEL) {
            btn.classList.add('can-use');
            const bonus = Math.floor(this.gameState.level * GameConfig.PRESTIGE_BONUS_MULTIPLIER * 100);
            info.textContent = `+${bonus}% Permanent Bonus`;
        } else {
            btn.classList.remove('can-use');
            info.textContent = `Requires Level ${GameConfig.PRESTIGE_UNLOCK_LEVEL}`;
        }
    }
    
    updateBoostButton() {
        const btn = document.getElementById('boost-btn');
        const info = btn.querySelector('.btn-info');
        
        if (this.gameState.boostActive) {
            btn.classList.add('active');
            const remaining = Math.ceil((this.gameState.boostEndTime - Date.now()) / 1000);
            info.textContent = `Active (${remaining}s)`;
        } else {
            btn.classList.remove('active');
            info.textContent = '2x Speed (30s)';
        }
    }
    
    showSettings() {
        const modal = document.getElementById('settings-modal');
        modal.style.display = 'flex';
        
        // Load current settings
        document.getElementById('sound-enabled').checked = this.gameState.soundEnabled;
        document.getElementById('particles-enabled').checked = this.gameState.particlesEnabled;
        document.getElementById('auto-save').checked = this.gameState.autoSave;
        document.getElementById('graphics-quality').value = this.gameState.graphicsQuality;
    }
    
    destroy() {
        // Improved cleanup
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        
        // Clear caches
        this.elementsCache.clear();
        this.domPool.clear();
        this.pendingUpdates.clear();
        
        // Remove event listeners
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    
    // New performance helper methods
    initElementPools() {
        // Pre-create element pools for common elements
        this.domPool.set('upgrade-item', []);
        this.domPool.set('notification', []);
        this.domPool.set('floating-text', []);
    }
    
    scheduleUpdate(type) {
        this.pendingUpdates.add(type);
    }
    
    processPendingUpdates() {
        if (this.pendingUpdates.has('resources')) {
            this.updateResources();
        }
        if (this.pendingUpdates.has('upgrades')) {
            this.updateUpgrades();
        }
        if (this.pendingUpdates.has('level')) {
            this.updateLevel();
        }
        if (this.pendingUpdates.has('stats')) {
            this.updateStats();
        }
        if (this.pendingUpdates.has('achievements')) {
            this.updateAchievements();
        }
        if (this.pendingUpdates.has('boost')) {
            this.updateBoostButton();
        }
        
        this.pendingUpdates.clear();
    }
    
    pulseElement(element) {
        if (element && !element.classList.contains('pulse')) {
            element.classList.add('pulse');
            setTimeout(() => element.classList.remove('pulse'), 300);
        }
    }
    
    // Enhanced virtual scrolling for large lists
    setupVirtualScrolling(container, itemHeight = 60) {
        const viewport = container.parentElement;
        const scrollTop = viewport.scrollTop;
        const viewportHeight = viewport.clientHeight;
        
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(startIndex + Math.ceil(viewportHeight / itemHeight) + 1, 
            container.children.length);
        
        // Hide/show elements based on visibility
        for (let i = 0; i < container.children.length; i++) {
            const child = container.children[i];
            if (i < startIndex || i > endIndex) {
                child.style.display = 'none';
            } else {
                child.style.display = '';
            }
        }
    }
};

// Global settings close function
window.closeSettings = function() {
    const modal = document.getElementById('settings-modal');
    modal.style.display = 'none';
    
    // Save settings
    if (window.game) {
        window.game.gameState.soundEnabled = document.getElementById('sound-enabled').checked;
        window.game.gameState.particlesEnabled = document.getElementById('particles-enabled').checked;
        window.game.gameState.autoSave = document.getElementById('auto-save').checked;
        window.game.gameState.graphicsQuality = document.getElementById('graphics-quality').value;
        
        // Apply graphics settings
        window.game.sceneManager.updateGraphicsQuality(window.game.gameState.graphicsQuality);
        
        // Update auto-save
        if (window.game.gameState.autoSave) {
            window.game.saveManager.enableAutoSave(window.game.gameState);
        } else {
            window.game.saveManager.disableAutoSave();
        }
    }
};