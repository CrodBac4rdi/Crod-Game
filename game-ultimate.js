// Ultimate DevSim Tycoon Game
const { useState, useEffect, useCallback, useRef, useMemo } = React;
const { createRoot } = ReactDOM;

// Sound System
const sounds = {
    click: () => playSound(440, 0.1),
    success: () => playSound(880, 0.2),
    error: () => playSound(220, 0.2),
    levelUp: () => playSound([440, 550, 660, 880], 0.3),
    achievement: () => playSound([660, 880, 1100], 0.4)
};

function playSound(freq, duration) {
    if (typeof window.AudioContext === 'undefined') return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (Array.isArray(freq)) {
        freq.forEach((f, i) => {
            setTimeout(() => {
                oscillator.frequency.value = f;
            }, i * 100);
        });
    } else {
        oscillator.frequency.value = freq;
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Ultimate Game Component
function DevSimTycoonUltimate() {
    // Enhanced Game State
    const [gameState, setGameState] = useState({
        paused: false,
        speed: 1,
        money: 50000,
        cryptoCurrency: 0,
        reputation: 50,
        level: 1,
        xp: 0,
        officeLevel: 1,
        maxDevelopers: 4,
        technologies: [],
        achievements: [],
        combo: 0,
        powerMode: false,
        soundEnabled: true,
        statistics: {
            projectsCompleted: 0,
            perfectProjects: 0,
            totalEarned: 0,
            cryptoEarned: 0,
            bugsFixed: 0,
            linesOfCode: 0,
            coffeeConsumed: 0,
            pizzasOrdered: 0,
            allNighters: 0
        },
        market: {
            demandMultiplier: 1.0,
            cryptoValue: 100,
            trending: 'AI',
            competition: 50
        }
    });
    
    const [projects, setProjects] = useState([]);
    const [activeProjects, setActiveProjects] = useState([]);
    const [developers, setDevelopers] = useState([]);
    const [selectedTab, setSelectedTab] = useState('dashboard');
    const [notifications, setNotifications] = useState([]);
    const [showModal, setShowModal] = useState(null);
    const [animations, setAnimations] = useState({});
    const [achievements, setAchievements] = useState([]);
    const [events, setEvents] = useState([]);
    const [challenges, setChallenges] = useState([]);
    
    const tabIndicatorRef = useRef(null);
    const tabsRef = useRef([]);
    const comboTimeoutRef = useRef(null);
    
    // Project Types
    const PROJECT_TYPES = [
        { name: 'Web App', icon: '🌐', reward: 1.0, skills: ['Frontend', 'Backend', 'Database'] },
        { name: 'Mobile App', icon: '📱', reward: 1.2, skills: ['Mobile', 'UI/UX', 'Backend'] },
        { name: 'Game', icon: '🎮', reward: 1.5, skills: ['Graphics', 'AI', 'Audio'] },
        { name: 'API Service', icon: '🔌', reward: 0.8, skills: ['Backend', 'Database', 'DevOps'] },
        { name: 'AI Tool', icon: '🤖', reward: 2.0, skills: ['AI/ML', 'Data Science', 'Cloud'] },
        { name: 'Blockchain', icon: '⛓️', reward: 1.8, skills: ['Crypto', 'Smart Contracts', 'Security'] },
        { name: 'VR Experience', icon: '🥽', reward: 2.2, skills: ['3D', 'Graphics', 'UX'] },
        { name: 'IoT System', icon: '📡', reward: 1.6, skills: ['Hardware', 'Embedded', 'Cloud'] }
    ];
    
    // Achievements List
    const ACHIEVEMENTS_LIST = [
        { id: 'first_project', name: 'First Steps', desc: 'Complete your first project', icon: '🎯', points: 10 },
        { id: 'perfect_10', name: 'Perfectionist', desc: 'Complete 10 perfect projects', icon: '⭐', points: 50 },
        { id: 'millionaire', name: 'Millionaire', desc: 'Reach $1,000,000', icon: '💰', points: 100 },
        { id: 'crypto_whale', name: 'Crypto Whale', desc: 'Earn 1000 crypto', icon: '🐋', points: 200 },
        { id: 'team_20', name: 'Big Company', desc: 'Have 20 developers', icon: '🏢', points: 150 },
        { id: 'combo_10', name: 'Combo Master', desc: 'Reach 10x combo', icon: '🔥', points: 75 },
        { id: 'all_tech', name: 'Tech Pioneer', desc: 'Research all technologies', icon: '🔬', points: 300 },
        { id: 'no_bugs', name: 'Bug Squasher', desc: 'Complete 50 projects with no bugs', icon: '🐛', points: 250 }
    ];
    
    // Weekly Challenges
    const WEEKLY_CHALLENGES = [
        { id: 'speed_demon', name: 'Speed Demon', desc: 'Complete 5 projects in one day', reward: 50000, icon: '⚡' },
        { id: 'quality_first', name: 'Quality First', desc: 'Complete 3 projects with 100% quality', reward: 30000, icon: '✨' },
        { id: 'ai_master', name: 'AI Master', desc: 'Complete 3 AI projects', reward: 40000, icon: '🧠' }
    ];
    
    // Initialize
    useEffect(() => {
        // Generate initial content
        setTimeout(() => {
            const initialProjects = Array(8).fill().map((_, i) => generateProject(i));
            setProjects(initialProjects);
            
            const initialDevs = generateInitialDevelopers();
            setDevelopers(initialDevs);
            
            // Set initial challenges
            setChallenges(WEEKLY_CHALLENGES.slice(0, 3));
        }, 500);
        
        // Start background music (if implemented)
        if (gameState.soundEnabled) {
            // playBackgroundMusic();
        }
    }, []);
    
    // Update tab indicator
    useEffect(() => {
        const activeTab = tabsRef.current.find(tab => tab?.dataset?.tab === selectedTab);
        if (activeTab && tabIndicatorRef.current) {
            const { offsetLeft, offsetWidth } = activeTab;
            tabIndicatorRef.current.style.left = `${offsetLeft}px`;
            tabIndicatorRef.current.style.width = `${offsetWidth}px`;
        }
    }, [selectedTab]);
    
    // Game Loop
    useEffect(() => {
        if (gameState.paused) return;
        
        const interval = setInterval(() => {
            requestAnimationFrame(() => {
                updateGame();
            });
        }, 1000 / gameState.speed);
        
        return () => clearInterval(interval);
    }, [gameState.paused, gameState.speed, activeProjects, developers, gameState.powerMode]);
    
    // Generate enhanced project
    function generateProject(seed) {
        const type = PROJECT_TYPES[Math.floor(Math.random() * PROJECT_TYPES.length)];
        const difficulty = 1 + Math.floor(Math.random() * 5);
        const complexity = difficulty * (0.8 + Math.random() * 0.4);
        const isCrypto = Math.random() < 0.2;
        
        const prefixes = ['Next-Gen', 'Quantum', 'Ultra', 'Hyper', 'Meta', 'Cyber', 'Neural'];
        const suffixes = ['Pro', 'X', 'Plus', 'Max', 'Ultimate', 'Infinity', '3000'];
        
        return {
            id: Date.now() + seed + Math.random(),
            name: `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${type.name} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`,
            type: type.name,
            icon: type.icon,
            client: generateClientName(),
            reward: Math.floor((20000 + Math.random() * 80000) * type.reward * complexity),
            cryptoReward: isCrypto ? Math.floor(10 + Math.random() * 50) : 0,
            reputation: Math.floor(5 + difficulty * 4 + Math.random() * 10),
            difficulty,
            complexity,
            requiredSkills: type.skills,
            minSkillLevel: 20 + difficulty * 15,
            deadline: Math.floor(7 + difficulty * 2 + Math.random() * 7),
            features: Math.floor(3 + difficulty * 2),
            progress: 0,
            quality: 0,
            bugs: 0,
            codeQuality: 50,
            innovation: 0,
            clientSatisfaction: 50,
            momentum: 0
        };
    }
    
    function generateClientName() {
        const companies = [
            'TechCorp Industries', 'MegaSoft Solutions', 'QuantumLeap Systems',
            'CyberDyne Corp', 'NexGen Enterprises', 'ByteForge Studios',
            'Neural Networks Inc', 'Crypto Ventures', 'AI Dynamics',
            'Future Tech Labs', 'Digital Horizons', 'Code Nexus'
        ];
        return companies[Math.floor(Math.random() * companies.length)];
    }
    
    function generateInitialDevelopers() {
        const names = [
            { first: 'Alex', last: 'Chen', personality: 'Perfectionist' },
            { first: 'Jordan', last: 'Smith', personality: 'Speed Demon' },
            { first: 'Casey', last: 'Johnson', personality: 'Innovator' },
            { first: 'Morgan', last: 'Davis', personality: 'Team Player' }
        ];
        
        return names.slice(0, 2).map((name, i) => ({
            id: Date.now() + i,
            name: `${name.first} ${name.last}`,
            avatar: name.first[0],
            personality: name.personality,
            level: 1,
            xp: 0,
            skills: generateDeveloperSkills(),
            specialty: ['Frontend', 'Backend', 'Mobile', 'AI/ML', 'DevOps'][Math.floor(Math.random() * 5)],
            energy: 100,
            mood: 80,
            stress: 20,
            creativity: 75,
            focus: 80,
            salary: 4000 + Math.floor(Math.random() * 3000),
            working: false,
            productivity: 0.8 + Math.random() * 0.4,
            bugRate: 0.05 + Math.random() * 0.1,
            loyaltyPoints: 50,
            coffeeConsumed: 0,
            achievements: []
        }));
    }
    
    function generateDeveloperSkills() {
        const skills = {};
        const allSkills = [
            'Frontend', 'Backend', 'Mobile', 'DevOps', 'AI/ML', 
            'UI/UX', 'Database', 'Security', 'Cloud', 'Graphics',
            'Crypto', 'Smart Contracts', '3D', 'Hardware', 'Data Science'
        ];
        
        allSkills.forEach(skill => {
            skills[skill] = 15 + Math.floor(Math.random() * 70);
        });
        
        return skills;
    }
    
    // Enhanced game update
    function updateGame() {
        // Update active projects with enhanced mechanics
        setActiveProjects(prev => {
            const updated = [...prev];
            const completed = [];
            
            updated.forEach((project, index) => {
                const devs = developers.filter(d => project.developerIds?.includes(d.id));
                if (devs.length === 0) return;
                
                // Calculate team synergy
                let teamSynergy = 1;
                const personalities = devs.map(d => d.personality);
                if (personalities.includes('Team Player')) teamSynergy += 0.2;
                if (new Set(personalities).size === personalities.length) teamSynergy += 0.1;
                
                // Calculate performance
                let teamProductivity = 0;
                let teamQuality = 0;
                let teamCreativity = 0;
                let teamInnovation = 0;
                
                devs.forEach(dev => {
                    if (dev.energy > 10) {
                        const skillMatch = project.requiredSkills.reduce((acc, skill) => {
                            return acc + (dev.skills[skill] || 0) / project.minSkillLevel;
                        }, 0) / project.requiredSkills.length;
                        
                        const energyFactor = dev.energy / 100;
                        const moodFactor = dev.mood / 100;
                        const focusFactor = dev.focus / 100;
                        
                        teamProductivity += dev.productivity * skillMatch * energyFactor * moodFactor * focusFactor;
                        teamQuality += skillMatch * (1 - dev.stress / 100) * focusFactor;
                        teamCreativity += dev.creativity / 100 * moodFactor;
                        teamInnovation += (dev.creativity / 100) * (skillMatch > 1 ? 1.2 : 1);
                    }
                });
                
                teamProductivity = (teamProductivity / devs.length) * teamSynergy;
                teamQuality = (teamQuality / devs.length) * teamSynergy;
                teamCreativity = (teamCreativity / devs.length) * teamSynergy;
                teamInnovation = teamInnovation / devs.length;
                
                // Apply technology bonuses
                if (gameState.technologies.includes('Agile Methodology')) teamProductivity *= 1.2;
                if (gameState.technologies.includes('AI Assistant')) teamProductivity *= 1.5;
                if (gameState.technologies.includes('Quantum Computing')) teamProductivity *= 2.0;
                
                // Power mode bonus
                if (gameState.powerMode) {
                    teamProductivity *= 1.5;
                    teamQuality *= 0.9; // Trade quality for speed
                }
                
                // Update project metrics
                const progressIncrease = teamProductivity * 3 * gameState.speed;
                project.progress = Math.min(100, project.progress + progressIncrease);
                
                // Momentum system
                project.momentum = Math.min(100, project.momentum + teamProductivity * 2);
                if (project.momentum > 80) {
                    project.progress += 1; // Bonus progress
                }
                
                // Quality with innovation
                const qualityIncrease = teamQuality * 2 * gameState.speed;
                project.quality = Math.min(100, project.quality + qualityIncrease);
                
                // Innovation score
                project.innovation = Math.min(100, project.innovation + teamInnovation * gameState.speed);
                
                // Code quality with creativity
                project.codeQuality = Math.min(100, project.codeQuality + teamCreativity * gameState.speed);
                
                // Client satisfaction
                const featuresComplete = Math.floor(project.progress / (100 / project.features));
                project.clientSatisfaction = Math.min(100, 
                    50 + (featuresComplete / project.features * 30) + 
                    (project.quality / 100 * 20) +
                    (project.innovation / 100 * 10) -
                    (project.bugs * 2)
                );
                
                // Bug generation (reduced with quality)
                if (Math.random() < 0.1 * (1 - teamQuality)) {
                    project.bugs += 1;
                    
                    // Auto-fix bugs with good team
                    if (teamQuality > 0.8 && Math.random() < 0.5) {
                        project.bugs = Math.max(0, project.bugs - 1);
                        setGameState(prev => ({
                            ...prev,
                            statistics: {
                                ...prev.statistics,
                                bugsFixed: prev.statistics.bugsFixed + 1
                            }
                        }));
                    }
                }
                
                // Check completion
                if (project.progress >= 100) {
                    completed.push({ index, project });
                }
            });
            
            // Process completed projects
            completed.forEach(({ project }) => {
                const qualityMultiplier = (project.quality / 100);
                const innovationBonus = project.innovation > 80 ? 1.3 : project.innovation > 50 ? 1.1 : 1;
                const satisfactionMultiplier = project.clientSatisfaction / 100;
                const bugPenalty = Math.max(0.5, 1 - project.bugs * 0.05);
                
                let finalReward = Math.floor(
                    project.reward * qualityMultiplier * innovationBonus * 
                    satisfactionMultiplier * bugPenalty
                );
                
                // Perfect project bonus
                const isPerfect = project.quality === 100 && project.bugs === 0 && project.clientSatisfaction === 100;
                if (isPerfect) {
                    finalReward *= 1.5;
                    updateCombo();
                }
                
                // Update game state
                setGameState(prev => {
                    const newState = {
                        ...prev,
                        money: prev.money + finalReward,
                        cryptoCurrency: prev.cryptoCurrency + (project.cryptoReward || 0),
                        reputation: prev.reputation + project.reputation,
                        xp: prev.xp + project.difficulty * 20,
                        statistics: {
                            ...prev.statistics,
                            projectsCompleted: prev.statistics.projectsCompleted + 1,
                            perfectProjects: prev.statistics.perfectProjects + (isPerfect ? 1 : 0),
                            totalEarned: prev.statistics.totalEarned + finalReward,
                            cryptoEarned: prev.statistics.cryptoEarned + (project.cryptoReward || 0),
                            linesOfCode: prev.statistics.linesOfCode + 
                                Math.floor(project.features * 1500 * qualityMultiplier)
                        }
                    };
                    
                    // Check level up
                    if (newState.xp >= newState.level * 100) {
                        newState.level += 1;
                        newState.xp -= prev.level * 100;
                        showAchievement('LEVEL UP!', `🎉 Level ${newState.level}`, 'levelUp');
                    }
                    
                    return newState;
                });
                
                // Effects
                triggerMoneyAnimation();
                
                // Notification
                showNotification(
                    `✅ ${project.name} completed! Earned $${finalReward.toLocaleString()}` +
                    (project.cryptoReward ? ` + ${project.cryptoReward} 🪙` : '') +
                    (isPerfect ? ' PERFECT! 🌟' : ''),
                    'success'
                );
                
                // Free developers and give XP
                setDevelopers(prev => prev.map(dev => 
                    project.developerIds?.includes(dev.id) 
                        ? { 
                            ...dev, 
                            working: false, 
                            xp: dev.xp + project.difficulty * 8,
                            loyaltyPoints: Math.min(100, dev.loyaltyPoints + 5)
                        } 
                        : dev
                ));
            });
            
            // Remove completed
            return updated.filter((_, index) => !completed.some(c => c.index === index));
        });
        
        // Update developers
        updateDevelopers();
        
        // Market fluctuations
        updateMarket();
        
        // Generate new projects
        if (Math.random() < 0.2 && projects.length < 12) {
            setProjects(prev => [...prev, generateProject(prev.length)]);
        }
        
        // Random events
        if (Math.random() < 0.03) {
            triggerRandomEvent();
        }
        
        // Check achievements
        checkAchievements();
        
        // Check challenges
        checkChallenges();
    }
    
    function updateDevelopers() {
        setDevelopers(prev => prev.map(dev => {
            const updated = { ...dev };
            
            if (dev.working) {
                // Working effects
                updated.energy = Math.max(0, dev.energy - 2.5 * gameState.speed);
                updated.stress = Math.min(100, dev.stress + 1.5 * gameState.speed);
                updated.mood = Math.max(0, dev.mood - 1 * gameState.speed);
                updated.focus = Math.max(0, dev.focus - 0.5 * gameState.speed);
                updated.coffeeConsumed += 0.1 * gameState.speed;
                
                // Creativity fluctuates
                updated.creativity = Math.max(0, Math.min(100, 
                    dev.creativity + (Math.random() - 0.5) * 2 * gameState.speed
                ));
            } else {
                // Recovery
                updated.energy = Math.min(100, dev.energy + 6 * gameState.speed);
                updated.stress = Math.max(0, dev.stress - 4 * gameState.speed);
                updated.mood = Math.min(100, dev.mood + 3 * gameState.speed);
                updated.focus = Math.min(100, dev.focus + 2 * gameState.speed);
            }
            
            // Personality effects
            switch (dev.personality) {
                case 'Perfectionist':
                    if (dev.working) updated.stress += 0.5 * gameState.speed;
                    break;
                case 'Speed Demon':
                    updated.productivity = 1.2;
                    break;
                case 'Innovator':
                    updated.creativity = Math.min(100, updated.creativity + 0.5 * gameState.speed);
                    break;
                case 'Team Player':
                    updated.mood = Math.min(100, updated.mood + 0.5 * gameState.speed);
                    break;
            }
            
            // Level up
            if (updated.xp >= updated.level * 60) {
                updated.level += 1;
                updated.xp = 0;
                updated.salary = Math.floor(updated.salary * 1.15);
                
                // Improve skills
                Object.keys(updated.skills).forEach(skill => {
                    updated.skills[skill] = Math.min(100, updated.skills[skill] + 3 + Math.random() * 5);
                });
                
                showNotification(`🎓 ${updated.name} reached level ${updated.level}!`, 'info');
            }
            
            // Burnout check
            if (updated.stress > 90 && updated.energy < 20) {
                updated.productivity *= 0.5;
                if (Math.random() < 0.01) {
                    showNotification(`⚠️ ${updated.name} is burned out!`, 'error');
                }
            }
            
            return updated;
        }));
    }
    
    function updateMarket() {
        setGameState(prev => ({
            ...prev,
            market: {
                ...prev.market,
                demandMultiplier: Math.max(0.5, Math.min(2.0,
                    prev.market.demandMultiplier + (Math.random() - 0.5) * 0.05
                )),
                cryptoValue: Math.max(50, Math.min(500,
                    prev.market.cryptoValue + (Math.random() - 0.5) * 10
                )),
                competition: Math.max(0, Math.min(100,
                    prev.market.competition + (Math.random() - 0.5) * 2
                ))
            }
        }));
    }
    
    function updateCombo() {
        setGameState(prev => ({ ...prev, combo: prev.combo + 1 }));
        
        clearTimeout(comboTimeoutRef.current);
        comboTimeoutRef.current = setTimeout(() => {
            setGameState(prev => ({ ...prev, combo: 0 }));
        }, 10000);
        
        // Show combo
        const comboDiv = document.createElement('div');
        comboDiv.className = 'combo-indicator';
        comboDiv.textContent = `${gameState.combo + 1}x COMBO!`;
        document.body.appendChild(comboDiv);
        setTimeout(() => comboDiv.remove(), 1000);
    }
    
    function triggerMoneyAnimation() {
        setAnimations(prev => ({ ...prev, money: true }));
        setTimeout(() => setAnimations(prev => ({ ...prev, money: false })), 500);
    }
    
    function triggerRandomEvent() {
        const events = [
            {
                message: '🌟 Hackathon Victory! +$20,000 and +15 reputation!',
                effect: () => setGameState(prev => ({
                    ...prev,
                    money: prev.money + 20000,
                    reputation: prev.reputation + 15
                }))
            },
            {
                message: '📈 Crypto surge! Your crypto is worth 50% more!',
                effect: () => setGameState(prev => ({
                    ...prev,
                    market: { ...prev.market, cryptoValue: prev.market.cryptoValue * 1.5 }
                }))
            },
            {
                message: '☕ Coffee shortage! Developer productivity -20%',
                effect: () => {} // Temporary effect
            },
            {
                message: '🎮 Game jam weekend! Team creativity +30%',
                effect: () => setDevelopers(prev => prev.map(dev => ({
                    ...dev,
                    creativity: Math.min(100, dev.creativity + 30)
                })))
            },
            {
                message: '🏆 Industry award! Reputation +20!',
                effect: () => setGameState(prev => ({
                    ...prev,
                    reputation: prev.reputation + 20
                }))
            }
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        showNotification(event.message, 'info');
        event.effect();
        
        setEvents(prev => [...prev.slice(-9), { 
            message: event.message, 
            timestamp: new Date() 
        }]);
    }
    
    function checkAchievements() {
        ACHIEVEMENTS_LIST.forEach(achievement => {
            if (achievements.some(a => a.id === achievement.id)) return;
            
            let unlocked = false;
            
            switch (achievement.id) {
                case 'first_project':
                    unlocked = gameState.statistics.projectsCompleted > 0;
                    break;
                case 'perfect_10':
                    unlocked = gameState.statistics.perfectProjects >= 10;
                    break;
                case 'millionaire':
                    unlocked = gameState.money >= 1000000;
                    break;
                case 'crypto_whale':
                    unlocked = gameState.cryptoCurrency >= 1000;
                    break;
                case 'team_20':
                    unlocked = developers.length >= 20;
                    break;
                case 'combo_10':
                    unlocked = gameState.combo >= 10;
                    break;
                case 'all_tech':
                    unlocked = gameState.technologies.length >= 10;
                    break;
                case 'no_bugs':
                    unlocked = gameState.statistics.projectsCompleted >= 50 && 
                              gameState.statistics.bugsFixed < 10;
                    break;
            }
            
            if (unlocked) {
                setAchievements(prev => [...prev, achievement]);
                showAchievement(achievement.name, achievement.desc, 'achievement');
            }
        });
    }
    
    function checkChallenges() {
        challenges.forEach(challenge => {
            // Check challenge completion logic
            // This would need to track daily stats
        });
    }
    
    function showAchievement(title, description, type) {
        if (gameState.soundEnabled) sounds[type]();
        
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-icon">${type === 'levelUp' ? '🎉' : '🏆'}</div>
            <h2>${title}</h2>
            <p>${description}</p>
        `;
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.style.animation = 'achievementPop 0.5s ease-in reverse';
            setTimeout(() => popup.remove(), 500);
        }, 3000);
    }
    
    function showNotification(message, type = 'info') {
        if (gameState.soundEnabled) sounds[type === 'error' ? 'error' : 'success']();
        
        const notif = {
            id: Date.now() + Math.random(),
            message,
            type,
            icon: type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
        };
        
        setNotifications(prev => [...prev.slice(-3), notif]);
        
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notif.id));
        }, 5000);
    }
    
    function startProject(project) {
        const availableDevs = developers.filter(d => !d.working);
        
        if (availableDevs.length === 0) {
            showNotification('No available developers!', 'error');
            return;
        }
        
        setShowModal({
            type: 'teamSelection',
            project,
            availableDevs
        });
    }
    
    function assignTeam(project, selectedDevIds) {
        setActiveProjects(prev => [...prev, {
            ...project,
            developerIds: selectedDevIds,
            startTime: Date.now()
        }]);
        
        setProjects(prev => prev.filter(p => p.id !== project.id));
        
        setDevelopers(prev => prev.map(dev => 
            selectedDevIds.includes(dev.id) ? { ...dev, working: true } : dev
        ));
        
        showNotification(`🚀 Started ${project.name}!`, 'success');
        setShowModal(null);
    }
    
    function hireDeveloper() {
        const cost = 5000 + developers.length * 4000;
        
        if (gameState.money < cost) {
            showNotification('💸 Not enough money!', 'error');
            return;
        }
        
        if (developers.length >= gameState.maxDevelopers) {
            showNotification('🏢 Office at max capacity!', 'error');
            return;
        }
        
        const names = [
            { first: 'Sam', last: 'Wilson', personality: 'Creative' },
            { first: 'Taylor', last: 'Brown', personality: 'Methodical' },
            { first: 'Riley', last: 'Martinez', personality: 'Leader' },
            { first: 'Quinn', last: 'Anderson', personality: 'Mentor' }
        ];
        
        const name = names[Math.floor(Math.random() * names.length)];
        const newDev = {
            id: Date.now(),
            name: `${name.first} ${name.last}`,
            avatar: name.first[0],
            personality: name.personality,
            level: 1,
            xp: 0,
            skills: generateDeveloperSkills(),
            specialty: ['Frontend', 'Backend', 'Mobile', 'AI/ML', 'DevOps', 'Security'][
                Math.floor(Math.random() * 6)
            ],
            energy: 100,
            mood: 80,
            stress: 20,
            creativity: 70 + Math.random() * 30,
            focus: 70 + Math.random() * 30,
            salary: 4000 + Math.floor(Math.random() * 3000),
            working: false,
            productivity: 0.8 + Math.random() * 0.4,
            bugRate: 0.05 + Math.random() * 0.1,
            loyaltyPoints: 50,
            coffeeConsumed: 0,
            achievements: []
        };
        
        setDevelopers(prev => [...prev, newDev]);
        setGameState(prev => ({ ...prev, money: prev.money - cost }));
        
        showNotification(`👋 Welcome ${newDev.name}!`, 'success');
    }
    
    // UI Components
    const Header = () => (
        React.createElement('header', { className: 'header' },
            React.createElement('div', { className: 'container' },
                React.createElement('div', { className: 'header-content' },
                    // Logo
                    React.createElement('div', { 
                        className: 'logo',
                        onClick: () => setSelectedTab('dashboard')
                    },
                        React.createElement('div', { className: 'logo-icon' }, '🚀'),
                        React.createElement('div', { className: 'logo-text' }, 'DevSim Tycoon')
                    ),
                    
                    // Stats
                    React.createElement('div', { className: 'stats' },
                        React.createElement('div', { 
                            className: `stat-card ${animations.money ? 'updating' : ''}`,
                            'data-tooltip': 'Company Funds'
                        },
                            React.createElement('div', { className: 'stat-label' }, 'Money'),
                            React.createElement('div', { 
                                className: 'stat-value',
                                style: { 
                                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }
                            }, `$${gameState.money.toLocaleString()}`)
                        ),
                        React.createElement('div', { 
                            className: 'stat-card',
                            'data-tooltip': `${gameState.cryptoCurrency} Crypto @ $${gameState.market.cryptoValue}`
                        },
                            React.createElement('div', { className: 'stat-label' }, 'Crypto'),
                            React.createElement('div', { className: 'stat-value' }, 
                                `🪙 ${gameState.cryptoCurrency}`
                            )
                        ),
                        React.createElement('div', { 
                            className: `stat-card ${animations.level ? 'updating' : ''}`,
                            'data-tooltip': `${gameState.xp}/${gameState.level * 100} XP`
                        },
                            React.createElement('div', { className: 'stat-label' }, 'Level'),
                            React.createElement('div', { className: 'stat-value' }, gameState.level)
                        ),
                        React.createElement('div', { 
                            className: 'stat-card',
                            'data-tooltip': `${gameState.combo}x Combo`
                        },
                            React.createElement('div', { className: 'stat-label' }, 'Reputation'),
                            React.createElement('div', { className: 'stat-value' }, gameState.reputation)
                        )
                    ),
                    
                    // Controls
                    React.createElement('div', { className: 'controls' },
                        React.createElement('button', {
                            className: 'btn',
                            onClick: () => setGameState(prev => ({ ...prev, paused: !prev.paused }))
                        }, 
                            gameState.paused ? '▶️' : '⏸️'
                        ),
                        React.createElement('button', {
                            className: 'btn',
                            onClick: () => setGameState(prev => ({ 
                                ...prev, 
                                speed: prev.speed === 8 ? 1 : prev.speed * 2 
                            }))
                        }, `⚡ ${gameState.speed}x`),
                        React.createElement('button', {
                            className: `btn ${gameState.powerMode ? 'btn-primary' : ''}`,
                            onClick: () => {
                                setGameState(prev => ({ ...prev, powerMode: !prev.powerMode }));
                                document.body.classList.toggle('power-mode');
                            }
                        }, '🔥 Power'),
                        React.createElement('button', {
                            className: 'btn',
                            onClick: () => setShowModal({ type: 'statistics' })
                        }, '📊')
                    )
                )
            )
        )
    );
    
    const Tabs = () => (
        React.createElement('div', { className: 'tabs-container' },
            React.createElement('div', { className: 'tabs' },
                React.createElement('div', { 
                    ref: tabIndicatorRef,
                    className: 'tab-indicator' 
                }),
                [
                    { id: 'dashboard', label: 'Dashboard', icon: '🎯' },
                    { id: 'projects', label: 'Projects', icon: '📁' },
                    { id: 'active', label: 'Active', icon: '🔥' },
                    { id: 'team', label: 'Team', icon: '👥' },
                    { id: 'research', label: 'Research', icon: '🔬' },
                    { id: 'market', label: 'Market', icon: '📈' }
                ].map((tab, index) =>
                    React.createElement('button', {
                        key: tab.id,
                        ref: el => tabsRef.current[index] = el,
                        className: `tab ${selectedTab === tab.id ? 'active' : ''}`,
                        onClick: () => {
                            setSelectedTab(tab.id);
                            if (gameState.soundEnabled) sounds.click();
                        },
                        'data-tab': tab.id
                    }, 
                        React.createElement('span', { className: 'tab-icon' }, tab.icon),
                        React.createElement('span', null, tab.label)
                    )
                )
            )
        )
    );
    
    // Main render
    return React.createElement('div', null,
        React.createElement(Header),
        React.createElement('div', { className: 'container' },
            React.createElement(Tabs),
            
            // Tab content would go here...
            React.createElement('div', { className: 'content' },
                selectedTab === 'dashboard' && React.createElement('div', null,
                    React.createElement('h1', { style: { textAlign: 'center', marginBottom: '2rem' } }, 
                        'Welcome to DevSim Tycoon Ultimate! 🚀'
                    ),
                    React.createElement('p', { style: { textAlign: 'center', opacity: 0.8 } },
                        'Build your software empire with advanced features!'
                    )
                )
            )
        ),
        
        // Sound toggle
        React.createElement('div', {
            className: 'sound-toggle',
            onClick: () => setGameState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }, gameState.soundEnabled ? '🔊' : '🔇'),
        
        // Floating stats
        React.createElement('div', { className: 'floating-stats' },
            React.createElement('div', { 
                className: 'floating-stat',
                onClick: () => setShowModal({ type: 'achievements' })
            },
                React.createElement('div', null, '🏆'),
                React.createElement('div', { style: { fontSize: '0.875rem' } }, 
                    `${achievements.length}/${ACHIEVEMENTS_LIST.length}`
                )
            ),
            React.createElement('div', { 
                className: 'floating-stat',
                onClick: () => setShowModal({ type: 'challenges' })
            },
                React.createElement('div', null, '🎯'),
                React.createElement('div', { style: { fontSize: '0.875rem' } }, 
                    'Challenges'
                )
            )
        ),
        
        // Notifications
        React.createElement('div', { 
            style: { position: 'fixed', top: '6rem', right: '2rem', zIndex: 200 }
        },
            notifications.map(notif =>
                React.createElement('div', {
                    key: notif.id,
                    className: `notification notification-${notif.type}`,
                    style: { marginBottom: '1rem' }
                },
                    React.createElement('div', { className: 'notification-icon' }, notif.icon),
                    React.createElement('div', null, notif.message)
                )
            )
        )
    );
}

// Initialize app
const root = createRoot(document.getElementById('root'));
root.render(React.createElement(DevSimTycoonUltimate));