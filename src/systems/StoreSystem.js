// src/systems/StoreSystem.js

class StoreSystem {
    constructor() {
        this.events = null;
        this.ui = null;
        this.game = null;
        this.buildings = [];
        this.upgrades = [];
    }

    async init() {
        this.events = window.gameShell.getSystem('events');
        this.ui = window.gameShell.getSystem('ui');
        this.game = window.gameShell.getSystem('game');

        console.log('🛒 StoreSystem initialized');
        this.initBuildings();
        this.initUpgrades();
        this.renderStore();
    }

    initBuildings() {
        this.buildings = [
            { id: 'gen1', name: 'Energy Condenser', baseCost: 15, cost: 15, owned: 0, production: 1 },
            { id: 'gen2', name: 'Quantum Collector', baseCost: 120, cost: 120, owned: 0, production: 8 },
            { id: 'gen3', name: 'Stellar Forge', baseCost: 1500, cost: 1500, owned: 0, production: 50 },
        ];
    }

    initUpgrades() {
        this.upgrades = [
            { id: 'upg1', name: 'Reinforced Clicks', cost: 150, purchased: false, effect: { type: 'click', multiplier: 2 } },
            { id: 'upg2', name: 'Efficient Condensers', cost: 600, purchased: false, effect: { type: 'building', buildingId: 'gen1', multiplier: 2 } },
        ];
    }

    renderStore() {
        const storeContainer = document.createElement('div');
        storeContainer.id = 'store-container';
        storeContainer.className = 'store-container';
        document.body.appendChild(storeContainer);

        this.buildings.forEach(building => {
            const buildingElement = document.createElement('div');
            buildingElement.className = 'store-item';
            buildingElement.id = `building-${building.id}`;
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
        if (this.game.spendEnergy(building.cost)) {
            building.owned++;
            building.cost = Math.ceil(building.baseCost * Math.pow(1.15, building.owned));
            this.updateBuildingUI(building);
            this.events.emit('building-purchased');
        }
    }

    updateBuildingUI(building) {
        const buildingElement = document.getElementById(`building-${building.id}`);
        buildingElement.querySelector('.item-cost').textContent = building.cost;
        buildingElement.querySelector('.item-owned').textContent = building.owned;
    }

    buyUpgrade(upgradeId) {
        const upgrade = this.upgrades.find(u => u.id === upgradeId);
        if (!upgrade.purchased && this.game.spendEnergy(upgrade.cost)) {
            upgrade.purchased = true;
            this.applyUpgrade(upgrade);
            this.updateUpgradeUI(upgrade);
        }
    }

    applyUpgrade(upgrade) {
        if (upgrade.effect.type === 'click') {
            this.game.gameState.clickPower *= upgrade.effect.multiplier;
        } else if (upgrade.effect.type === 'building') {
            const building = this.buildings.find(b => b.id === upgrade.effect.buildingId);
            if (building) {
                building.production *= upgrade.effect.multiplier;
                this.game.recalculateEnergyPerSecond();
            }
        }
    }

    updateUpgradeUI(upgrade) {
        const upgradeElement = document.getElementById(`upgrade-${upgrade.id}`);
        upgradeElement.classList.add('purchased');
    }
}
