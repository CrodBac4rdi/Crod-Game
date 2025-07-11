// Core Constants Module
window.CONSTANTS = {
    // Game Settings
    GAME: {
        TICK_RATE: 1000 / 60, // 60 FPS
        SAVE_INTERVAL: 30000, // 30 seconds
        VERSION: '1.0.0',
        NAME: 'DevLearn Academy'
    },
    
    // Player Stats
    PLAYER: {
        INITIAL_MONEY: 100,
        INITIAL_ENERGY: 100,
        INITIAL_STRESS: 0,
        INITIAL_XP: 0,
        ENERGY_DECAY: 0.1,
        STRESS_GAIN: 0.05,
        MAX_ENERGY: 100,
        MAX_STRESS: 100
    },
    
    // Learning System
    LEARNING: {
        XP_PER_LESSON: 50,
        XP_PER_CHALLENGE: 100,
        XP_FOR_LEVEL: 500,
        SKILL_POINTS_PER_LEVEL: 3
    },
    
    // UI Settings
    UI: {
        ANIMATION_DURATION: 300,
        NOTIFICATION_DURATION: 3000,
        THEME: 'dark'
    },
    
    // Feature Flags
    FEATURES: {
        SOUND_ENABLED: true,
        AUTO_SAVE: true,
        ACHIEVEMENTS: true,
        TUTORIALS: true,
        MULTIPLAYER: false, // Future feature
        PLUGINS: true
    },
    
    // Resource Types
    RESOURCES: {
        MONEY: { icon: '💰', color: '#00ff88' },
        ENERGY: { icon: '⚡', color: '#ffaa00' },
        STRESS: { icon: '😰', color: '#ff3333' },
        XP: { icon: '✨', color: '#00aaff' },
        CODE: { icon: '💻', color: '#ff0088' },
        COFFEE: { icon: '☕', color: '#8b4513' }
    },
    
    // Skill Categories
    SKILLS: {
        PROGRAMMING: ['JavaScript', 'Python', 'React', 'SQL', 'TypeScript'],
        TOOLS: ['Git', 'Docker', 'VS Code', 'Terminal', 'Debugging'],
        CONCEPTS: ['Algorithms', 'Data Structures', 'Design Patterns', 'Testing', 'Security'],
        SOFT: ['Communication', 'Problem Solving', 'Time Management', 'Teamwork', 'Leadership']
    },
    
    // Game Modes
    MODES: {
        TUTORIAL: 'tutorial',
        SANDBOX: 'sandbox',
        CHALLENGE: 'challenge',
        CAREER: 'career',
        MULTIPLAYER: 'multiplayer'
    },
    
    // Difficulty Levels
    DIFFICULTY: {
        BEGINNER: { multiplier: 0.5, label: 'Beginner', color: '#00ff88' },
        NORMAL: { multiplier: 1.0, label: 'Normal', color: '#00aaff' },
        HARD: { multiplier: 1.5, label: 'Hard', color: '#ffaa00' },
        EXPERT: { multiplier: 2.0, label: 'Expert', color: '#ff0088' },
        NIGHTMARE: { multiplier: 3.0, label: 'Nightmare', color: '#ff3333' }
    }
};