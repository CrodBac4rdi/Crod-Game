// src/systems/StoreSystem.js

class StoreSystem {
    constructor() {
        this.events = null;
        this.ui = null;
        this.buildings = [];
        this.upgrades = [];
    }

    async init() {
        this.events = window.gameShell.getSystem('events');
        this.ui = window.gameShell.getSystem('ui');

        console.log('🛒 StoreSystem initialized');
        this.initBuildings();
        this.initUpgrades();
        this.renderStore();
    }

    initBuildings() {
        this.buildings = [
            { id: 'gen1', name: 'Energy Condenser', description: 'Generates 1 energy per second.', baseCost: 15, cost: 15, owned: 0, production: 1 },
            { id: 'gen2', name: 'Quantum Collector', description: 'Generates 8 energy per second.', baseCost: 120, cost: 120, owned: 0, production: 8 },
            { id: 'gen3', name: 'Stellar Forge', description: 'Generates 50 energy per second.', baseCost: 1500, cost: 1500, owned: 0, production: 50 },
            { id: 'gen4', name: 'Photon Weaver', description: 'Generates 250 energy per second.', baseCost: 10000, cost: 10000, owned: 0, production: 250 },
            { id: 'gen5', name: 'Neutrino Drill', description: 'Generates 1500 energy per second.', baseCost: 75000, cost: 75000, owned: 0, production: 1500 },
        ];
    }

    initUpgrades() {
        this.upgrades = [
            { id: 'upg1', name: 'Reinforced Clicks', description: 'Doubles click power.', cost: 150, purchased: false, effect: { type: 'click', multiplier: 2 } },
            { id: 'upg2', name: 'Efficient Condensers', description: 'Doubles the production of Energy Condensers.', cost: 600, purchased: false, effect: { type: 'building', buildingId: 'gen1', multiplier: 2 } },
            { id: 'upg3', name: 'Synergistic Overdrive', description: 'Boosts production of all buildings by 10%.', cost: 5000, purchased: false, effect: { type: 'all_buildings', multiplier: 1.1 } },
            { id: 'upg4', name: 'Architectural Acumen', description: 'Adds a small passive energy bonus for each building owned.', cost: 10000, purchased: false, effect: { type: 'passive', bonus_per_building: 0.1 } },
        ];
    }

    renderStore() {
        let storeContainer = document.getElementById('store-container');
        if (!storeContainer) {
            storeContainer = document.createElement('div');
            storeContainer.id = 'store-container';
            storeContainer.className = 'store-container';
            document.body.appendChild(storeContainer);
        }

        // Clear existing content before re-rendering
        storeContainer.innerHTML = '';

        this.buildings.forEach(building => {
            const buildingElement = document.createElement('div');
            buildingElement.className = 'store-item';
            buildingElement.id = `building-${building.id}`;
            buildingElement.title = building.description;
            buildingElement.innerHTML = `
                <span class="item-name">${building.name}</span>
                <span class="item-cost">${building.cost}</span>
                <span class="item-owned">${building.owned}</span>
            `;
            buildingElement.addEventListener('click', () => this.buyBuilding(building.id));
            storeContainer.appendChild(buildingElement);
        });

        this.upgrades.forEach(upgrade => {
            const upgradeElement = document.createElement('div');
            upgradeElement.className = 'store-item';
            upgradeElement.id = `upgrade-${upgrade.id}`;
            upgradeElement.title = upgrade.description;
            upgradeElement.innerHTML = `
                <span class="item-name">${upgrade.name}</span>
                <span class="item-cost">${upgrade.cost}</span>
            `;
            upgradeElement.addEventListener('click', () => this.buyUpgrade(upgrade.id));
            storeContainer.appendChild(upgradeElement);
        });
    }

    buyBuilding(buildingId) {
        const building = this.buildings.find(b => b.id === buildingId);
        const game = window.gameShell.getSystem('game');
        if (game.spendEnergy(building.cost)) {
            building.owned++;
            building.cost = Math.ceil(building.baseCost * Math.pow(1.15, building.owned));
            this.updateBuildingUI(building);
            this.events.emit('building-purchased', building);
        }
    }

    updateBuildingUI(building) {
        const buildingElement = document.getElementById(`building-${building.id}`);
        buildingElement.querySelector('.item-cost').textContent = building.cost;
        buildingElement.querySelector('.item-owned').textContent = building.owned;
    }

    buyUpgrade(upgradeId) {
        const upgrade = this.upgrades.find(u => u.id === upgradeId);
        const game = window.gameShell.getSystem('game');
        if (!upgrade.purchased && game.spendEnergy(upgrade.cost)) {
            upgrade.purchased = true;
            this.applyUpgrade(upgrade);
            this.updateUpgradeUI(upgrade);
        }
    }

    applyUpgrade(upgrade) {
        const game = window.gameShell.getSystem('game');
        if (upgrade.effect.type === 'click') {
            game.gameState.clickPower *= upgrade.effect.multiplier;
        } else if (upgrade.effect.type === 'building') {
            const building = this.buildings.find(b => b.id === upgrade.effect.buildingId);
            if (building) {
                building.production *= upgrade.effect.multiplier;
                game.recalculateEnergyPerSecond();
            }
        } else if (upgrade.effect.type === 'all_buildings') {
            this.buildings.forEach(building => {
                building.production *= upgrade.effect.multiplier;
            });
            game.recalculateEnergyPerSecond();
        } else if (upgrade.effect.type === 'passive') {
            const totalBuildings = this.buildings.reduce((sum, b) => sum + b.owned, 0);
            game.gameState.passiveEnergyBonus += totalBuildings * upgrade.effect.bonus_per_building;
            game.recalculateEnergyPerSecond();
        }
    }

    updateUpgradeUI(upgrade) {
        const upgradeElement = document.getElementById(`upgrade-${upgrade.id}`);
        upgradeElement.classList.add('purchased');
    }
}
