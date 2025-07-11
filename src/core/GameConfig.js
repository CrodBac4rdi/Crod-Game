// Game Configuration
window.GameConfig = {
    // Resources
    INITIAL_ENERGY: 0,
    INITIAL_CRYSTALS: 0,
    
    // Click values
    BASE_CLICK_VALUE: 1,
    
    // Progression
    INITIAL_LEVEL: 1,
    BASE_XP_REQUIREMENT: 100,
    XP_GROWTH_RATE: 1.15,
    
    // Prestige
    PRESTIGE_UNLOCK_LEVEL: 10,
    PRESTIGE_BONUS_MULTIPLIER: 0.1,
    
    // Upgrades
    GENERATORS: [
        {
            id: 'solar_panel',
            name: 'Solar Panel',
            icon: '☀️',
            baseCost: 10,
            costMultiplier: 1.15,
            baseProduction: 0.1,
            maxLevel: 100
        },
        {
            id: 'fusion_reactor',
            name: 'Fusion Reactor',
            icon: '⚛️',
            baseCost: 100,
            costMultiplier: 1.2,
            baseProduction: 1,
            maxLevel: 100
        },
        {
            id: 'quantum_harvester',
            name: 'Quantum Harvester',
            icon: '🌀',
            baseCost: 1000,
            costMultiplier: 1.25,
            baseProduction: 10,
            maxLevel: 100
        },
        {
            id: 'stellar_engine',
            name: 'Stellar Engine',
            icon: '⭐',
            baseCost: 10000,
            costMultiplier: 1.3,
            baseProduction: 100,
            maxLevel: 100
        },
        {
            id: 'cosmic_forge',
            name: 'Cosmic Forge',
            icon: '🌌',
            baseCost: 100000,
            costMultiplier: 1.35,
            baseProduction: 1000,
            maxLevel: 100
        }
    ],
    
    CLICK_UPGRADES: [
        {
            id: 'enhanced_collector',
            name: 'Enhanced Collector',
            icon: '🔧',
            baseCost: 50,
            costMultiplier: 1.5,
            clickMultiplier: 2,
            maxLevel: 10
        },
        {
            id: 'quantum_gloves',
            name: 'Quantum Gloves',
            icon: '🧤',
            baseCost: 500,
            costMultiplier: 1.8,
            clickMultiplier: 5,
            maxLevel: 10
        },
        {
            id: 'cosmic_amplifier',
            name: 'Cosmic Amplifier',
            icon: '📡',
            baseCost: 5000,
            costMultiplier: 2,
            clickMultiplier: 10,
            maxLevel: 10
        }
    ],
    
    // Visual settings
    GRAPHICS_PRESETS: {
        low: {
            particleCount: 50,
            shadowQuality: 0,
            antialias: false,
            postProcessing: false
        },
        medium: {
            particleCount: 100,
            shadowQuality: 1,
            antialias: true,
            postProcessing: false
        },
        high: {
            particleCount: 200,
            shadowQuality: 2,
            antialias: true,
            postProcessing: true
        },
        ultra: {
            particleCount: 500,
            shadowQuality: 3,
            antialias: true,
            postProcessing: true
        }
    },
    
    // Timing
    SAVE_INTERVAL: 30000, // 30 seconds
    BOOST_DURATION: 30000, // 30 seconds
    BOOST_MULTIPLIER: 2,
    
    // Achievements
    ACHIEVEMENTS: [
        { id: 'first_click', name: 'First Steps', desc: 'Click the cosmic orb', icon: '🎯' },
        { id: 'energy_100', name: 'Energy Collector', desc: 'Reach 100 energy', icon: '⚡' },
        { id: 'energy_1000', name: 'Power Plant', desc: 'Reach 1,000 energy', icon: '🏭' },
        { id: 'energy_1m', name: 'Cosmic Dynamo', desc: 'Reach 1 million energy', icon: '🌟' },
        { id: 'level_5', name: 'Rising Star', desc: 'Reach level 5', icon: '📈' },
        { id: 'level_10', name: 'Stellar Explorer', desc: 'Reach level 10', icon: '🚀' },
        { id: 'first_prestige', name: 'Transcendence', desc: 'Prestige for the first time', icon: '🌌' },
        { id: 'generator_master', name: 'Generator Master', desc: 'Own 10 of each generator', icon: '⚙️' },
        { id: 'click_power', name: 'Click Power', desc: 'Reach 1000 click power', icon: '💪' },
        { id: 'speed_demon', name: 'Speed Demon', desc: 'Use boost 10 times', icon: '⚡' }
    ]
};