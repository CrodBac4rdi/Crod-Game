import React, { useState, useEffect, useRef, useCallback } from 'react';

const DevSimTycoon = () => {
  // Core Game State
  const [gameState, setGameState] = useState({
    currentTime: new Date(2025, 0, 1, 9, 0, 0),
    paused: false,
    speed: 1,
    tickCount: 0,
    company: {
      name: "DevSim Studios",
      money: 50000,
      reputation: 50,
      level: 1,
      xp: 0,
      officeLevel: 1,
      maxDevelopers: 4,
      technologies: [],
      completedProjects: 0,
      failedProjects: 0,
      totalRevenue: 0,
      monthlyExpenses: 0
    },
    market: {
      demandMultiplier: 1.0,
      trendingTech: 'web_app',
      economyHealth: 'stable',
      competitorStrength: 50
    }
  });

  // Game Entities
  const [projects, setProjects] = useState({ available: [], active: {}, completed: [] });
  const [developers, setDevelopers] = useState({});
  const [bugs, setBugs] = useState([]);
  const [events, setEvents] = useState([]);
  const [technologies, setTechnologies] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    totalLinesOfCode: 0,
    totalBugsFixed: 0,
    totalBugsCreated: 0,
    perfectProjects: 0,
    overtimeHours: 0
  });

  // UI State
  const [selectedTab, setSelectedTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [codeAnimation, setCodeAnimation] = useState({ lines: [], currentLine: 0 });

  // Constants
  const PROJECT_TYPES = {
    web_app: { name: 'Web App', icon: '🌐', baseReward: 1.0, complexity: 1.0 },
    mobile_app: { name: 'Mobile App', icon: '📱', baseReward: 1.2, complexity: 1.3 },
    game: { name: 'Game', icon: '🎮', baseReward: 1.5, complexity: 1.8 },
    api: { name: 'API', icon: '🔌', baseReward: 0.8, complexity: 0.9 },
    desktop_app: { name: 'Desktop App', icon: '💻', baseReward: 1.1, complexity: 1.2 },
    ai_tool: { name: 'AI Tool', icon: '🤖', baseReward: 2.0, complexity: 2.5 }
  };

  const SKILL_TYPES = {
    frontend: { name: 'Frontend', icon: '🎨', color: '#3b82f6' },
    backend: { name: 'Backend', icon: '⚙️', color: '#10b981' },
    mobile: { name: 'Mobile', icon: '📱', color: '#8b5cf6' },
    database: { name: 'Database', icon: '🗄️', color: '#f59e0b' },
    devops: { name: 'DevOps', icon: '🚀', color: '#ef4444' },
    testing: { name: 'Testing', icon: '🧪', color: '#06b6d4' },
    ui_ux: { name: 'UI/UX', icon: '✨', color: '#ec4899' },
    ai_ml: { name: 'AI/ML', icon: '🧠', color: '#6366f1' }
  };

  const TECHNOLOGIES = {
    agile: { name: 'Agile Development', cost: 10000, level: 5, bonus: { productivity: 1.2 } },
    ci_cd: { name: 'CI/CD Pipeline', cost: 15000, level: 10, bonus: { quality: 1.3 } },
    cloud: { name: 'Cloud Infrastructure', cost: 20000, level: 15, bonus: { scalability: 1.5 } },
    ai_assist: { name: 'AI Code Assistant', cost: 30000, level: 20, bonus: { productivity: 1.5 } }
  };

  const OFFICE_UPGRADES = {
    1: { name: 'Garage Startup', maxDevs: 4, cost: 0 },
    2: { name: 'Small Office', maxDevs: 8, cost: 50000 },
    3: { name: 'Tech Hub', maxDevs: 16, cost: 150000 },
    4: { name: 'Corporate Tower', maxDevs: 32, cost: 500000 }
  };

  // Initialize
  useEffect(() => {
    generateInitialContent();
    initCodeAnimation();
  }, []);

  // Game Loop
  useEffect(() => {
    if (gameState.paused) return;
    
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        currentTime: new Date(prev.currentTime.getTime() + (1000 * prev.speed)),
        tickCount: prev.tickCount + 1
      }));
      
      processGameTick();
    }, 100);
    
    return () => clearInterval(interval);
  }, [gameState.paused, gameState.speed]);

  // Core Functions
  const generateInitialContent = () => {
    // Generate initial projects
    const initialProjects = [];
    for (let i = 0; i < 5; i++) {
      initialProjects.push(generateProject());
    }
    setProjects(prev => ({ ...prev, available: initialProjects }));

    // Generate initial developers
    const initialDevs = {};
    for (let i = 0; i < 2; i++) {
      const dev = generateDeveloper();
      initialDevs[dev.id] = dev;
    }
    setDevelopers(initialDevs);
  };

  const generateProject = () => {
    const types = Object.keys(PROJECT_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const typeData = PROJECT_TYPES[type];
    const difficulty = 10 + Math.floor(Math.random() * 50);
    
    return {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: generateProjectName(type),
      client: generateClientName(),
      type: type,
      difficulty: difficulty,
      baseReward: Math.round(difficulty * 100 * typeData.baseReward),
      currentReward: Math.round(difficulty * 100 * typeData.baseReward),
      deadline: new Date(gameState.currentTime.getTime() + (difficulty * 24 * 60 * 60 * 1000 / 10)),
      requirements: generateRequirements(type),
      features: generateFeatures(type, difficulty),
      progress: 0,
      quality: 100,
      bugs: 0,
      status: 'available',
      assignedDevelopers: [],
      codeLines: 0,
      targetCodeLines: difficulty * 100
    };
  };

  const generateProjectName = (type) => {
    const names = {
      web_app: ["Dashboard", "Portal", "Platform", "Hub", "Suite"],
      mobile_app: ["Tracker", "Manager", "Assistant", "Companion", "Guide"],
      game: ["Quest", "Adventure", "Saga", "Chronicles", "Legends"],
      api: ["Service", "Gateway", "Interface", "Endpoint", "Bridge"],
      desktop_app: ["Studio", "Pro", "Master", "Expert", "Professional"],
      ai_tool: ["Intelligence", "Brain", "Mind", "Neural", "Cognitive"]
    };
    const prefixes = ["Super", "Ultra", "Mega", "Pro", "Advanced", "Next-Gen"];
    const base = names[type][Math.floor(Math.random() * names[type].length)];
    return Math.random() > 0.5 ? `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${base}` : base;
  };

  const generateClientName = () => {
    const clients = ["TechCorp", "Digital Ventures", "StartupHub", "MegaSoft", "CloudFirst", "DataDrive"];
    return clients[Math.floor(Math.random() * clients.length)];
  };

  const generateRequirements = (type) => {
    const reqs = {
      web_app: ['frontend', 'backend', 'database'],
      mobile_app: ['mobile', 'ui_ux', 'backend'],
      game: ['frontend', 'ui_ux', 'testing'],
      api: ['backend', 'database', 'testing'],
      desktop_app: ['frontend', 'backend', 'testing'],
      ai_tool: ['ai_ml', 'backend', 'database']
    };
    return reqs[type] || reqs.web_app;
  };

  const generateFeatures = (type, difficulty) => {
    const count = Math.floor(difficulty / 15) + 2;
    const features = [];
    for (let i = 0; i < count; i++) {
      features.push({
        id: `feat_${i}`,
        name: `Feature ${i + 1}`,
        progress: 0,
        implemented: false
      });
    }
    return features;
  };

  const generateDeveloper = () => {
    const firstNames = ["Alex", "Jordan", "Sam", "Casey", "Morgan", "Taylor", "Riley", "Drew"];
    const lastNames = ["Smith", "Chen", "Kumar", "Johnson", "Garcia", "Williams", "Brown", "Davis"];
    
    const skills = {};
    const skillTypes = Object.keys(SKILL_TYPES);
    const numSkills = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < numSkills; i++) {
      const skill = skillTypes[Math.floor(Math.random() * skillTypes.length)];
      skills[skill] = {
        level: 30 + Math.floor(Math.random() * 40),
        experience: 0
      };
    }
    
    return {
      id: `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      level: 1,
      experience: 0,
      skills: skills,
      energy: 100,
      mood: 75 + Math.floor(Math.random() * 25),
      stress: 0,
      salary: 3000 + Math.floor(Math.random() * 2000),
      productivity: 50 + Math.floor(Math.random() * 30),
      quality: 70 + Math.floor(Math.random() * 20),
      assignedProject: null,
      personality: ['perfectionist', 'speedster', 'team_player', 'innovator'][Math.floor(Math.random() * 4)],
      burnoutRisk: 0
    };
  };

  const initCodeAnimation = () => {
    const codeSnippets = [
      "// Building amazing software...",
      "function deployToProduction() {",
      "  const features = await implementFeatures();",
      "  const bugs = await findAndFixBugs();",
      "  return deploy(features, bugs);",
      "}",
      "",
      "class Developer {",
      "  constructor(coffee, motivation) {",
      "    this.productivity = coffee * motivation;",
      "  }",
      "}"
    ];
    setCodeAnimation({ lines: codeSnippets, currentLine: 0 });
  };

  const processGameTick = () => {
    processProjects();
    processDevelopers();
    processMarket();
    processFinances();
    
    if (gameState.tickCount % 10 === 0) {
      updateCodeAnimation();
    }
    
    if (gameState.tickCount % 300 === 0) {
      generateNewProjects();
    }
    
    if (Math.random() < 0.01) {
      generateRandomEvent();
    }
  };

  const processProjects = () => {
    setProjects(prev => {
      const updated = { ...prev };
      
      Object.entries(updated.active).forEach(([id, project]) => {
        const assignedDevs = Object.values(developers).filter(d => d.assignedProject === id);
        if (assignedDevs.length === 0) return;
        
        let totalProductivity = 0;
        assignedDevs.forEach(dev => {
          const effectiveness = (dev.energy / 100) * (dev.mood / 100);
          totalProductivity += dev.productivity * effectiveness;
        });
        
        const progressIncrease = (totalProductivity / 100) * gameState.speed;
        project.progress = Math.min(100, project.progress + progressIncrease);
        project.codeLines += Math.floor(progressIncrease * project.targetCodeLines / 100);
        
        // Update features
        project.features.forEach(feature => {
          if (!feature.implemented && feature.progress < 100) {
            feature.progress = Math.min(100, feature.progress + progressIncrease / project.features.length);
            if (feature.progress >= 100) {
              feature.implemented = true;
            }
          }
        });
        
        // Random bugs
        if (Math.random() < 0.02 * gameState.speed) {
          project.bugs += 1;
        }
        
        if (project.progress >= 100) {
          completeProject(project);
        }
        
        updated.active[id] = project;
      });
      
      return updated;
    });
  };

  const processDevelopers = () => {
    setDevelopers(prev => {
      const updated = { ...prev };
      
      Object.values(updated).forEach(dev => {
        if (dev.assignedProject) {
          dev.energy = Math.max(0, dev.energy - (0.5 * gameState.speed));
          dev.stress = Math.min(100, dev.stress + (0.1 * gameState.speed));
          dev.experience += 0.1 * gameState.speed;
        } else {
          dev.energy = Math.min(100, dev.energy + (1 * gameState.speed));
          dev.stress = Math.max(0, dev.stress - (0.5 * gameState.speed));
        }
        
        // Update mood
        dev.mood = Math.max(0, Math.min(100, 
          50 + (dev.energy / 2) - (dev.stress / 2) + (gameState.company.officeLevel * 5)
        ));
        
        // Burnout risk
        if (dev.stress > 80 && dev.energy < 20) {
          dev.burnoutRisk = Math.min(100, dev.burnoutRisk + 1);
        } else {
          dev.burnoutRisk = Math.max(0, dev.burnoutRisk - 0.5);
        }
        
        // Level up
        if (dev.experience >= dev.level * 100) {
          dev.level += 1;
          dev.experience = 0;
          dev.productivity += 5;
          addNotification(`${dev.name} leveled up to ${dev.level}!`, 'success');
        }
      });
      
      return updated;
    });
  };

  const processMarket = () => {
    setGameState(prev => {
      const market = { ...prev.market };
      
      if (Math.random() < 0.01 * gameState.speed) {
        market.demandMultiplier = Math.max(0.5, Math.min(2.0, 
          market.demandMultiplier + (Math.random() - 0.5) * 0.2
        ));
      }
      
      if (Math.random() < 0.005 * gameState.speed) {
        const techs = Object.keys(PROJECT_TYPES);
        market.trendingTech = techs[Math.floor(Math.random() * techs.length)];
      }
      
      return { ...prev, market };
    });
  };

  const processFinances = () => {
    setGameState(prev => {
      const company = { ...prev.company };
      const salaries = Object.values(developers).reduce((sum, dev) => sum + dev.salary, 0);
      company.monthlyExpenses = salaries + (prev.company.officeLevel * 1000);
      
      if (gameState.tickCount % 10 === 0) {
        company.money -= company.monthlyExpenses / 30 / 24 * gameState.speed;
      }
      
      return { ...prev, company };
    });
  };

  const updateCodeAnimation = () => {
    setCodeAnimation(prev => ({
      ...prev,
      currentLine: (prev.currentLine + 1) % prev.lines.length
    }));
  };

  const generateNewProjects = () => {
    if (projects.available.length < 8) {
      const newProject = generateProject();
      setProjects(prev => ({
        ...prev,
        available: [...prev.available, newProject]
      }));
    }
  };

  const generateRandomEvent = () => {
    const eventTypes = [
      { message: "New technology trend emerging!", type: "market" },
      { message: "Client referral received!", type: "opportunity" },
      { message: "Developer found optimization!", type: "bonus" }
    ];
    
    const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    addEvent(event.message, event.type);
  };

  // Actions
  const acceptProject = (project) => {
    if (gameState.company.money < 1000) {
      addNotification('Not enough money!', 'error');
      return;
    }
    
    project.status = 'active';
    setProjects(prev => ({
      ...prev,
      available: prev.available.filter(p => p.id !== project.id),
      active: { ...prev.active, [project.id]: project }
    }));
    
    setGameState(prev => ({
      ...prev,
      company: { ...prev.company, money: prev.company.money - 1000 }
    }));
    
    addEvent(`Started ${project.name}`, 'success');
  };

  const completeProject = (project) => {
    let finalReward = project.currentReward;
    
    if (project.quality > 90) finalReward *= 1.2;
    if (project.bugs > 0) finalReward *= Math.max(0.5, 1 - (project.bugs * 0.1));
    
    setGameState(prev => ({
      ...prev,
      company: {
        ...prev.company,
        money: prev.company.money + Math.round(finalReward),
        reputation: Math.min(100, prev.company.reputation + 5),
        xp: prev.company.xp + project.difficulty,
        completedProjects: prev.company.completedProjects + 1,
        totalRevenue: prev.company.totalRevenue + Math.round(finalReward)
      }
    }));
    
    setProjects(prev => ({
      ...prev,
      active: Object.fromEntries(
        Object.entries(prev.active).filter(([id]) => id !== project.id)
      ),
      completed: [...prev.completed, { ...project, finalReward }]
    }));
    
    // Free developers
    setDevelopers(prev => {
      const updated = { ...prev };
      Object.values(updated).forEach(dev => {
        if (dev.assignedProject === project.id) {
          dev.assignedProject = null;
        }
      });
      return updated;
    });
    
    setStats(prev => ({
      ...prev,
      totalLinesOfCode: prev.totalLinesOfCode + project.codeLines,
      perfectProjects: prev.perfectProjects + (project.bugs === 0 ? 1 : 0)
    }));
    
    addEvent(`Completed ${project.name}! Earned $${Math.round(finalReward)}`, 'success');
    checkAchievements();
  };

  const hireDeveloper = () => {
    const cost = 5000 + (gameState.company.level * 1000);
    
    if (gameState.company.money < cost) {
      addNotification('Not enough money!', 'error');
      return;
    }
    
    if (Object.keys(developers).length >= gameState.company.maxDevelopers) {
      addNotification('Office full! Upgrade first.', 'error');
      return;
    }
    
    const newDev = generateDeveloper();
    setDevelopers(prev => ({ ...prev, [newDev.id]: newDev }));
    setGameState(prev => ({
      ...prev,
      company: { ...prev.company, money: prev.company.money - cost }
    }));
    
    addEvent(`Hired ${newDev.name}!`, 'success');
  };

  const assignDeveloper = (devId, projectId) => {
    setDevelopers(prev => ({
      ...prev,
      [devId]: { ...prev[devId], assignedProject: projectId }
    }));
  };

  const unassignDeveloper = (devId) => {
    setDevelopers(prev => ({
      ...prev,
      [devId]: { ...prev[devId], assignedProject: null }
    }));
  };

  const trainDeveloper = (devId, skill) => {
    const cost = 2000;
    
    if (gameState.company.money < cost) {
      addNotification('Not enough money!', 'error');
      return;
    }
    
    setDevelopers(prev => {
      const dev = { ...prev[devId] };
      if (!dev.skills[skill]) {
        dev.skills[skill] = { level: 20, experience: 0 };
      } else {
        dev.skills[skill].level = Math.min(100, dev.skills[skill].level + 10);
      }
      return { ...prev, [devId]: dev };
    });
    
    setGameState(prev => ({
      ...prev,
      company: { ...prev.company, money: prev.company.money - cost }
    }));
    
    addEvent(`${developers[devId].name} trained in ${SKILL_TYPES[skill].name}!`, 'success');
  };

  const purchaseTechnology = (techId) => {
    const tech = TECHNOLOGIES[techId];
    
    if (gameState.company.money < tech.cost) {
      addNotification('Not enough money!', 'error');
      return;
    }
    
    if (gameState.company.level < tech.level) {
      addNotification(`Requires level ${tech.level}!`, 'error');
      return;
    }
    
    setTechnologies(prev => ({ ...prev, [techId]: true }));
    setGameState(prev => ({
      ...prev,
      company: { 
        ...prev.company, 
        money: prev.company.money - tech.cost,
        technologies: [...prev.company.technologies, techId]
      }
    }));
    
    addEvent(`Researched ${tech.name}!`, 'success');
  };

  const upgradeOffice = () => {
    const nextLevel = gameState.company.officeLevel + 1;
    if (nextLevel > 4) return;
    
    const upgrade = OFFICE_UPGRADES[nextLevel];
    if (gameState.company.money < upgrade.cost) {
      addNotification('Not enough money!', 'error');
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      company: {
        ...prev.company,
        money: prev.company.money - upgrade.cost,
        officeLevel: nextLevel,
        maxDevelopers: upgrade.maxDevs
      }
    }));
    
    addEvent(`Upgraded to ${upgrade.name}!`, 'success');
  };

  const checkAchievements = () => {
    if (gameState.company.completedProjects >= 10 && !achievements.find(a => a.id === 'first_10')) {
      const newAchievement = {
        id: 'first_10',
        name: 'Startup Success',
        description: 'Complete 10 projects',
        icon: '🏆'
      };
      setAchievements(prev => [...prev, newAchievement]);
      addNotification(`Achievement: ${newAchievement.name}!`, 'achievement');
    }
    
    if (gameState.company.money >= 1000000 && !achievements.find(a => a.id === 'millionaire')) {
      const newAchievement = {
        id: 'millionaire',
        name: 'Tech Millionaire',
        description: 'Earn $1,000,000',
        icon: '💰'
      };
      setAchievements(prev => [...prev, newAchievement]);
      addNotification(`Achievement: ${newAchievement.name}!`, 'achievement');
    }
  };

  const addEvent = (message, type) => {
    setEvents(prev => [{
      id: Date.now(),
      message,
      type,
      timestamp: new Date(gameState.currentTime)
    }, ...prev].slice(0, 20));
  };

  const addNotification = (message, type) => {
    const notif = {
      id: Date.now(),
      message,
      type
    };
    setNotifications(prev => [...prev, notif]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
    }, 3000);
  };

  // UI Helpers
  const formatMoney = (amount) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${Math.round(amount).toLocaleString()}`;
  };

  const formatTime = (date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Main Render
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)', color: '#e0e0e0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Background Animation */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.03, pointerEvents: 'none', 
                   background: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 80%, #8b5cf6 0%, transparent 50%), radial-gradient(circle at 40% 20%, #10b981 0%, transparent 50%)',
                   animation: 'float 20s ease-in-out infinite' }}></div>
      
      {/* Notifications */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
        {notifications.map(notif => (
          <div key={notif.id} style={{
            padding: '16px 24px',
            marginBottom: '12px',
            borderRadius: '12px',
            backgroundColor: notif.type === 'error' ? '#dc2626' : 
                           notif.type === 'success' ? '#10b981' : 
                           notif.type === 'achievement' ? '#f59e0b' : '#3b82f6',
            color: 'white',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3), 0 0 40px rgba(59, 130, 246, 0.1)',
            backdropFilter: 'blur(10px)',
            animation: 'slideIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            transform: 'translateX(0)',
            transition: 'all 0.3s ease'
          }}>
            {notif.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ backgroundColor: 'rgba(26, 26, 26, 0.8)', backdropFilter: 'blur(10px)', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '20px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
          DevSim Tycoon
        </h1>
        
        {/* Stats */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ backgroundColor: 'rgba(42, 42, 42, 0.5)', padding: '20px 30px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'all 0.3s ease', cursor: 'pointer' }}
               onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: gameState.company.money < 10000 ? '#ef4444' : '#10b981' }}>
              {formatMoney(gameState.company.money)}
            </div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
              {gameState.company.monthlyExpenses > 0 && `−${formatMoney(gameState.company.monthlyExpenses)}/mo`}
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(42, 42, 42, 0.5)', padding: '20px 30px', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.3)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'all 0.3s ease', cursor: 'pointer' }}
               onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reputation</div>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>⭐ {gameState.company.reputation}</div>
            <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${gameState.company.reputation}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)', borderRadius: '2px', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(42, 42, 42, 0.5)', padding: '20px 30px', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'all 0.3s ease', cursor: 'pointer' }}
               onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#8b5cf6' }}>Lvl {gameState.company.level}</div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
              {gameState.company.xp}/{gameState.company.level * 100} XP
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(42, 42, 42, 0.5)', padding: '20px 30px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'all 0.3s ease', cursor: 'pointer' }}
               onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Team</div>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>👥 {Object.keys(developers).length}/{gameState.company.maxDevelopers}</div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
              {OFFICE_UPGRADES[gameState.company.officeLevel].name}
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(42, 42, 42, 0.5)', padding: '20px 30px', borderRadius: '16px', border: '1px solid rgba(236, 72, 153, 0.3)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'all 0.3s ease', cursor: 'pointer' }}
               onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Projects</div>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>📁 {Object.keys(projects.active).length}</div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
              {projects.available.length} available
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(42, 42, 42, 0.5)', padding: '20px 30px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'all 0.3s ease', cursor: 'pointer' }}
               onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Market</div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>
              {gameState.market.economyHealth === 'booming' ? '📈 Boom' : gameState.market.economyHealth === 'recession' ? '📉 Bust' : '📊 Stable'}
            </div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
              {(gameState.market.demandMultiplier * 100).toFixed(0)}% demand
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: 'rgba(42, 42, 42, 0.5)', padding: '15px 25px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
          <span style={{ fontFamily: '"SF Mono", Monaco, monospace', fontSize: '16px', color: '#10b981', fontWeight: '500' }}>
            {formatTime(gameState.currentTime)}
          </span>
          <div style={{ height: '30px', width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
          <button onClick={() => setGameState(prev => ({ ...prev, paused: !prev.paused }))}
                  style={{ padding: '10px 20px', backgroundColor: gameState.paused ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                          border: `1px solid ${gameState.paused ? '#10b981' : '#ef4444'}`, borderRadius: '10px', color: 'white', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            {gameState.paused ? '▶️' : '⏸️'} {gameState.paused ? 'Resume' : 'Pause'}
          </button>
          <div style={{ display: 'flex', gap: '8px', padding: '4px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
            {[1, 2, 5, 10].map(speed => (
              <button key={speed} onClick={() => setGameState(prev => ({ ...prev, speed }))}
                      style={{ padding: '8px 16px', backgroundColor: gameState.speed === speed ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                              border: gameState.speed === speed ? '1px solid #3b82f6' : '1px solid transparent', borderRadius: '8px', 
                              color: gameState.speed === speed ? '#3b82f6' : '#888', cursor: 'pointer', fontWeight: '600',
                              transition: 'all 0.2s ease' }}>
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: 'rgba(26, 26, 26, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', position: 'sticky', top: '140px', zIndex: 99 }}>
        <div style={{ display: 'flex', padding: '0 20px' }}>
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'projects', label: 'Projects', icon: '💼' },
            { id: 'team', label: 'Team', icon: '👥' },
            { id: 'research', label: 'Research', icon: '🔬' },
            { id: 'market', label: 'Market', icon: '📈' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setSelectedTab(tab.id)}
                    style={{ 
                      padding: '18px 30px', 
                      backgroundColor: 'transparent',
                      border: 'none', 
                      borderBottom: selectedTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
                      color: selectedTab === tab.id ? '#fff' : '#888', 
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = selectedTab === tab.id ? '#fff' : '#ccc'}
                    onMouseLeave={(e) => e.currentTarget.style.color = selectedTab === tab.id ? '#fff' : '#888'}>
              <span style={{ fontSize: '20px' }}>{tab.icon}</span>
              {tab.label}
              {selectedTab === tab.id && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', 
                             background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)', 
                             animation: 'glow 2s ease-in-out infinite' }}></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            {/* Active Projects */}
            <div style={{ backgroundColor: 'rgba(26, 26, 26, 0.6)', borderRadius: '20px', padding: '25px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '20px', color: '#3b82f6' }}>Active Projects</h2>
              {Object.values(projects.active).length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>No active projects. Start accepting projects to begin!</p>
              ) : (
                Object.values(projects.active).map(project => (
                  <div key={project.id} style={{ backgroundColor: 'rgba(42, 42, 42, 0.6)', padding: '20px', borderRadius: '16px', marginBottom: '15px', 
                                                border: '1px solid rgba(59, 130, 246, 0.2)', transition: 'all 0.3s ease' }}
                       onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'; e.currentTarget.style.transform = 'translateX(5px)'; }}
                       onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                    <h3 style={{ fontWeight: '700', fontSize: '18px', marginBottom: '12px' }}>{PROJECT_TYPES[project.type].icon} {project.name}</h3>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ color: '#888' }}>Progress</span>
                        <span style={{ fontWeight: '600' }}>{Math.round(project.progress)}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${project.progress}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', 
                                     borderRadius: '4px', transition: 'width 0.3s ease', boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }}></div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#888' }}>
                      <span>💰 {formatMoney(project.currentReward)}</span>
                      <span>🐛 {project.bugs} bugs</span>
                      <span>⚡ {project.quality}% quality</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Team Status */}
            <div style={{ backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Team Status</h2>
              {Object.values(developers).slice(0, 4).map(dev => (
                <div key={dev.id} style={{ backgroundColor: '#2a2a2a', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold' }}>{dev.name}</span>
                    <span style={{ fontSize: '12px', color: '#666' }}>Lvl {dev.level}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                    <div>
                      <div style={{ color: '#888', marginBottom: '2px' }}>Energy</div>
                      <div style={{ width: '100%', height: '4px', backgroundColor: '#444', borderRadius: '2px' }}>
                        <div style={{ width: `${dev.energy}%`, height: '100%', 
                                     backgroundColor: dev.energy > 50 ? '#10b981' : dev.energy > 25 ? '#f59e0b' : '#ef4444',
                                     borderRadius: '2px' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#888', marginBottom: '2px' }}>Mood</div>
                      <div style={{ width: '100%', height: '4px', backgroundColor: '#444', borderRadius: '2px' }}>
                        <div style={{ width: `${dev.mood}%`, height: '100%', backgroundColor: '#8b5cf6', borderRadius: '2px' }}></div>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '11px', color: '#666' }}>
                    {dev.assignedProject ? '🔨 Working' : '☕ Resting'}
                  </div>
                </div>
              ))}
            </div>

            {/* Code & Events */}
            <div>
              {/* Code Preview */}
              <div style={{ backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>💻 Live Coding</h2>
                <div style={{ backgroundColor: '#0a0a0a', padding: '15px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px' }}>
                  {codeAnimation.lines.map((line, i) => (
                    <div key={i} style={{ color: i === codeAnimation.currentLine ? '#10b981' : '#666' }}>
                      {line || '\u00A0'}
                    </div>
                  ))}
                </div>
              </div>

              {/* Events */}
              <div style={{ backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Recent Events</h2>
                <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {events.slice(0, 10).map(event => (
                    <div key={event.id} style={{ marginBottom: '8px', fontSize: '13px' }}>
                      <span style={{ color: event.type === 'success' ? '#10b981' : 
                                            event.type === 'error' ? '#ef4444' : '#888' }}>
                        • {event.message}
                      </span>
                      <span style={{ color: '#666', marginLeft: '10px', fontSize: '11px' }}>
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {selectedTab === 'projects' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Available Projects */}
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Available Projects</h2>
              {projects.available.map(project => (
                <div key={project.id} style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '10px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      {PROJECT_TYPES[project.type].icon} {project.name}
                    </h3>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                      {formatMoney(project.currentReward)}
                    </span>
                  </div>
                  <p style={{ color: '#888', marginBottom: '10px' }}>{project.client}</p>
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', fontSize: '14px' }}>
                    <span>💪 Difficulty: {project.difficulty}</span>
                    <span>📏 {project.targetCodeLines} lines</span>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Requirements:</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {project.requirements.map(req => (
                        <span key={req} style={{ padding: '4px 8px', backgroundColor: '#2a2a2a', borderRadius: '4px', fontSize: '12px' }}>
                          {SKILL_TYPES[req]?.icon} {SKILL_TYPES[req]?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => acceptProject(project)}
                          style={{ width: '100%', padding: '10px', backgroundColor: '#3b82f6', border: 'none',
                                  borderRadius: '6px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                    Accept Project (-$1,000)
                  </button>
                </div>
              ))}
            </div>

            {/* Active Projects */}
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Active Projects</h2>
              {Object.values(projects.active).map(project => (
                <div key={project.id} style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '10px', marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                    {PROJECT_TYPES[project.type].icon} {project.name}
                  </h3>
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Progress</span>
                      <span>{Math.round(project.progress)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#444', borderRadius: '4px' }}>
                      <div style={{ width: `${project.progress}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ backgroundColor: '#2a2a2a', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#888' }}>Quality</div>
                      <div style={{ fontWeight: 'bold' }}>{Math.round(project.quality)}%</div>
                    </div>
                    <div style={{ backgroundColor: '#2a2a2a', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#888' }}>Code Lines</div>
                      <div style={{ fontWeight: 'bold' }}>{project.codeLines}</div>
                    </div>
                    <div style={{ backgroundColor: '#2a2a2a', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#888' }}>Bugs</div>
                      <div style={{ fontWeight: 'bold', color: project.bugs > 0 ? '#ef4444' : '#10b981' }}>{project.bugs}</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>Assigned Developers:</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {project.assignedDevelopers.map(devId => {
                        const dev = developers[devId];
                        return dev ? (
                          <span key={devId} style={{ padding: '4px 8px', backgroundColor: '#2a2a2a', borderRadius: '4px', fontSize: '12px' }}>
                            {dev.name}
                          </span>
                        ) : null;
                      })}
                      <select onChange={(e) => e.target.value && assignDeveloper(e.target.value, project.id)}
                              style={{ padding: '4px', backgroundColor: '#333', border: 'none', borderRadius: '4px', 
                                      color: 'white', fontSize: '12px' }}>
                        <option value="">+ Add Developer</option>
                        {Object.values(developers).filter(d => !d.assignedProject).map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Tab */}
        {selectedTab === 'team' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Development Team</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={hireDeveloper}
                        style={{ padding: '10px 20px', backgroundColor: '#10b981', border: 'none',
                                borderRadius: '6px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                  + Hire Developer ({formatMoney(5000 + gameState.company.level * 1000)})
                </button>
                <button onClick={upgradeOffice}
                        disabled={gameState.company.officeLevel >= 4}
                        style={{ padding: '10px 20px', backgroundColor: gameState.company.officeLevel >= 4 ? '#666' : '#8b5cf6', 
                                border: 'none', borderRadius: '6px', color: 'white', fontWeight: 'bold', 
                                cursor: gameState.company.officeLevel >= 4 ? 'not-allowed' : 'pointer' }}>
                  🏢 Upgrade Office {gameState.company.officeLevel < 4 && `(${formatMoney(OFFICE_UPGRADES[gameState.company.officeLevel + 1].cost)})`}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {Object.values(developers).map(dev => (
                <div key={dev.id} style={{ backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>{dev.name}</h3>
                      <div style={{ fontSize: '14px', color: '#888' }}>
                        Level {dev.level} • {dev.personality} • {formatMoney(dev.salary)}/mo
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                        <span>Energy</span>
                        <span>{Math.round(dev.energy)}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#333', borderRadius: '3px' }}>
                        <div style={{ width: `${dev.energy}%`, height: '100%', 
                                     backgroundColor: dev.energy > 50 ? '#10b981' : dev.energy > 25 ? '#f59e0b' : '#ef4444',
                                     borderRadius: '3px' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                        <span>Mood</span>
                        <span>{Math.round(dev.mood)}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#333', borderRadius: '3px' }}>
                        <div style={{ width: `${dev.mood}%`, height: '100%', backgroundColor: '#8b5cf6', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                        <span>Stress</span>
                        <span>{Math.round(dev.stress)}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#333', borderRadius: '3px' }}>
                        <div style={{ width: `${dev.stress}%`, height: '100%', 
                                     backgroundColor: dev.stress < 30 ? '#10b981' : dev.stress < 70 ? '#f59e0b' : '#ef4444',
                                     borderRadius: '3px' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                        <span>Experience</span>
                        <span>{Math.round(dev.experience)}/{dev.level * 100}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#333', borderRadius: '3px' }}>
                        <div style={{ width: `${(dev.experience / (dev.level * 100)) * 100}%`, height: '100%', 
                                     backgroundColor: '#f59e0b', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Skills</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {Object.entries(dev.skills).map(([skill, data]) => (
                        <div key={skill} style={{ padding: '6px 10px', backgroundColor: '#2a2a2a', borderRadius: '6px', fontSize: '12px' }}>
                          {SKILL_TYPES[skill]?.icon} {SKILL_TYPES[skill]?.name} 
                          <span style={{ fontWeight: 'bold', marginLeft: '6px', color: SKILL_TYPES[skill]?.color }}>
                            {data.level}
                          </span>
                        </div>
                      ))}
                    </div>
                    <select onChange={(e) => e.target.value && trainDeveloper(dev.id, e.target.value)}
                            style={{ marginTop: '8px', padding: '6px', backgroundColor: '#333', border: 'none', 
                                    borderRadius: '6px', color: 'white', fontSize: '12px', width: '100%' }}>
                      <option value="">Train new skill... ($2,000)</option>
                      {Object.entries(SKILL_TYPES).filter(([key]) => !dev.skills[key]).map(([key, skill]) => (
                        <option key={key} value={key}>{skill.icon} {skill.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                    Productivity: {dev.productivity} • Quality: {dev.quality}
                  </div>

                  {dev.assignedProject ? (
                    <button onClick={() => unassignDeveloper(dev.id)}
                            style={{ width: '100%', padding: '10px', backgroundColor: '#ef4444', border: 'none',
                                    borderRadius: '6px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                      Unassign from Project
                    </button>
                  ) : (
                    <select onChange={(e) => e.target.value && assignDeveloper(dev.id, e.target.value)}
                            style={{ width: '100%', padding: '10px', backgroundColor: '#3b82f6', border: 'none',
                                    borderRadius: '6px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                      <option value="">Assign to Project...</option>
                      {Object.values(projects.active).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  )}

                  {dev.burnoutRisk > 70 && (
                    <div style={{ marginTop: '10px', padding: '8px', backgroundColor: 'rgba(239, 68, 68, 0.2)', 
                                 borderRadius: '6px', fontSize: '12px', color: '#ef4444', textAlign: 'center' }}>
                      ⚠️ High burnout risk!
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Research Tab */}
        {selectedTab === 'research' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Research & Development</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {Object.entries(TECHNOLOGIES).map(([id, tech]) => {
                const isUnlocked = technologies[id];
                const canAfford = gameState.company.money >= tech.cost;
                const meetsLevel = gameState.company.level >= tech.level;
                
                return (
                  <div key={id} style={{ backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '20px',
                                         border: isUnlocked ? '2px solid #10b981' : '1px solid #333' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                      {tech.name} {isUnlocked && '✅'}
                    </h3>
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>Benefits:</div>
                      {Object.entries(tech.bonus).map(([key, value]) => (
                        <div key={key} style={{ fontSize: '13px', color: '#10b981' }}>
                          • {key}: +{((value - 1) * 100).toFixed(0)}%
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 'bold' }}>{formatMoney(tech.cost)}</span>
                      <span style={{ fontSize: '13px', color: meetsLevel ? '#888' : '#ef4444' }}>
                        Requires Lvl {tech.level}
                      </span>
                    </div>
                    <button onClick={() => purchaseTechnology(id)}
                            disabled={isUnlocked || !canAfford || !meetsLevel}
                            style={{ width: '100%', padding: '10px', 
                                    backgroundColor: isUnlocked ? '#444' : !canAfford || !meetsLevel ? '#666' : '#3b82f6',
                                    border: 'none', borderRadius: '6px', color: 'white', fontWeight: 'bold',
                                    cursor: isUnlocked || !canAfford || !meetsLevel ? 'not-allowed' : 'pointer' }}>
                      {isUnlocked ? 'Researched' : 'Research'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Market Tab */}
        {selectedTab === 'market' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Market Analysis</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Market Conditions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#888' }}>Economy Status</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {gameState.market.economyHealth === 'booming' ? '📈 Booming' : 
                       gameState.market.economyHealth === 'recession' ? '📉 Recession' : '📊 Stable'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#888' }}>Demand Multiplier</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                      {(gameState.market.demandMultiplier * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#888' }}>Trending Technology</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      {PROJECT_TYPES[gameState.market.trendingTech]?.icon} {PROJECT_TYPES[gameState.market.trendingTech]?.name}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Company Stats</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Completed Projects:</span>
                    <span style={{ fontWeight: 'bold' }}>{gameState.company.completedProjects}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Failed Projects:</span>
                    <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{gameState.company.failedProjects}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Revenue:</span>
                    <span style={{ fontWeight: 'bold', color: '#10b981' }}>{formatMoney(gameState.company.totalRevenue)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Monthly Expenses:</span>
                    <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{formatMoney(gameState.company.monthlyExpenses)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Lines of Code:</span>
                    <span style={{ fontWeight: 'bold' }}>{stats.totalLinesOfCode.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Bugs Fixed:</span>
                    <span style={{ fontWeight: 'bold' }}>{stats.totalBugsFixed}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Achievements</h3>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  {achievements.map(achievement => (
                    <div key={achievement.id} style={{ backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '8px', 
                                                       display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>{achievement.icon}</span>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{achievement.name}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(10px) rotate(-1deg); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        * {
          box-sizing: border-box;
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  );
};

export default DevSimTycoon;