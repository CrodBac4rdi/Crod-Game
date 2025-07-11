// Game Logic Module

// Helper Functions
function formatMoney(amount) {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
}

function formatTime(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// Project Generation
function generateProject(gameState) {
  const types = Object.keys(PROJECT_TYPES);
  const type = types[Math.floor(Math.random() * types.length)];
  const projectType = PROJECT_TYPES[type];
  
  const difficulty = Math.min(5, Math.max(1, Math.floor(gameState.company.level / 3) + Math.random() * 2));
  const size = difficulty * (20 + Math.random() * 30);
  const deadline = new Date(gameState.currentTime.getTime() + (size * 8 * 60 * 60 * 1000 / difficulty)); // hours to ms
  const baseReward = size * 100 * projectType.baseReward * difficulty;
  
  return {
    id: Date.now() + Math.random(),
    name: generateProjectName(type),
    client: generateClientName(),
    type,
    icon: projectType.icon,
    requirements: generateRequirements(type, difficulty),
    features: generateFeatures(difficulty),
    size,
    progress: 0,
    quality: 0,
    bugs: 0,
    difficulty,
    deadline,
    reward: Math.floor(baseReward * (0.8 + Math.random() * 0.4) * gameState.market.demandMultiplier),
    reputation: difficulty * 5,
    active: false,
    completed: false,
    failed: false,
    assignedDevs: []
  };
}

function generateProjectName(type) {
  const prefixes = PROJECT_NAMES_PREFIXES;
  const suffixes = PROJECT_NAMES_SUFFIXES;
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  const typeSpecific = {
    web_app: ['Dashboard', 'Analytics', 'CRM', 'CMS'],
    mobile_app: ['Fitness', 'Social', 'Shopping', 'Travel'],
    game: ['Quest', 'Battle', 'Adventure', 'Puzzle'],
    api: ['Data', 'Integration', 'Service', 'Gateway'],
    desktop_app: ['Editor', 'Manager', 'Studio', 'Workspace'],
    ai_tool: ['Assistant', 'Analyzer', 'Predictor', 'Optimizer']
  };
  
  const specific = typeSpecific[type][Math.floor(Math.random() * typeSpecific[type].length)];
  return Math.random() > 0.5 ? `${prefix} ${specific}` : `${specific} ${suffix}`;
}

function generateClientName() {
  return CLIENT_NAMES[Math.floor(Math.random() * CLIENT_NAMES.length)];
}

function generateRequirements(type, difficulty) {
  const reqs = {};
  const skillPool = Object.keys(SKILL_TYPES);
  const numSkills = Math.min(skillPool.length, 2 + Math.floor(difficulty / 2));
  
  const typeSkills = {
    web_app: ['frontend', 'backend', 'database'],
    mobile_app: ['mobile', 'ui_ux', 'backend'],
    game: ['frontend', 'ui_ux', 'testing'],
    api: ['backend', 'database', 'devops'],
    desktop_app: ['frontend', 'backend', 'testing'],
    ai_tool: ['ai_ml', 'backend', 'database']
  };
  
  const relevantSkills = typeSkills[type] || skillPool;
  relevantSkills.slice(0, numSkills).forEach(skill => {
    reqs[skill] = 20 + difficulty * 15 + Math.floor(Math.random() * 20);
  });
  
  return reqs;
}

function generateFeatures(difficulty) {
  const featureNames = [
    'User Authentication', 'Dashboard', 'Analytics', 'Reporting', 'API Integration',
    'Real-time Updates', 'Mobile Responsive', 'Data Export', 'Search Functionality',
    'Notifications', 'Dark Mode', 'Multi-language', 'Payment Processing', 'Social Sharing'
  ];
  
  const numFeatures = 3 + Math.floor(difficulty / 2) + Math.floor(Math.random() * 3);
  const features = [];
  
  for (let i = 0; i < numFeatures; i++) {
    features.push({
      name: featureNames[Math.floor(Math.random() * featureNames.length)],
      complexity: 1 + Math.floor(Math.random() * difficulty),
      implemented: false
    });
  }
  
  return features;
}

// Developer Generation
function generateDeveloper(gameState) {
  const skills = {};
  Object.keys(SKILL_TYPES).forEach(skill => {
    skills[skill] = 10 + Math.floor(Math.random() * 40);
  });
  
  // Give them a specialty
  const specialty = Object.keys(SKILL_TYPES)[Math.floor(Math.random() * Object.keys(SKILL_TYPES).length)];
  skills[specialty] = Math.max(skills[specialty], 50 + Math.floor(Math.random() * 30));
  
  const level = Math.floor((Object.values(skills).reduce((a, b) => a + b, 0) / Object.keys(skills).length) / 20) + 1;
  
  return {
    id: Date.now() + Math.random(),
    name: DEVELOPER_NAMES[Math.floor(Math.random() * DEVELOPER_NAMES.length)],
    level,
    skills,
    specialty,
    energy: 100,
    mood: 80,
    stress: 20,
    experience: 0,
    personality: DEVELOPER_PERSONALITIES[Math.floor(Math.random() * DEVELOPER_PERSONALITIES.length)],
    currentProject: null,
    salary: 3000 + level * 1000 + Math.floor(Math.random() * 2000),
    productivity: 0.8 + Math.random() * 0.4,
    bugRate: 0.05 + Math.random() * 0.1,
    burnoutRisk: false,
    trainingProgress: null
  };
}

// Processing Functions
function processProjects(projects, developers, gameState, deltaTime) {
  const updatedProjects = { ...projects };
  const notifications = [];
  
  Object.entries(updatedProjects.active).forEach(([id, project]) => {
    if (project.completed || project.failed) return;
    
    // Calculate team productivity
    let teamProductivity = 0;
    let teamQuality = 0;
    let bugChance = 0;
    
    project.assignedDevs.forEach(devId => {
      const dev = developers[devId];
      if (dev && dev.energy > 20) {
        const skillMatch = Object.entries(project.requirements).reduce((acc, [skill, req]) => {
          return acc + Math.min(1, (dev.skills[skill] || 0) / req);
        }, 0) / Object.keys(project.requirements).length;
        
        teamProductivity += dev.productivity * skillMatch * (dev.energy / 100) * (dev.mood / 100);
        teamQuality += skillMatch * (1 - dev.stress / 100);
        bugChance += dev.bugRate * (dev.stress / 100);
      }
    });
    
    if (project.assignedDevs.length > 0) {
      teamProductivity /= project.assignedDevs.length;
      teamQuality /= project.assignedDevs.length;
      bugChance /= project.assignedDevs.length;
    }
    
    // Apply technology bonuses
    if (gameState.company.technologies.includes('agile')) teamProductivity *= 1.2;
    if (gameState.company.technologies.includes('ci_cd')) teamQuality *= 1.3;
    
    // Progress the project
    const progressIncrease = teamProductivity * deltaTime * 2;
    project.progress = Math.min(100, project.progress + progressIncrease);
    
    // Quality improvements
    const qualityIncrease = teamQuality * deltaTime * 1.5;
    project.quality = Math.min(100, project.quality + qualityIncrease);
    
    // Bug generation
    if (Math.random() < bugChance * deltaTime) {
      project.bugs += 1;
      project.quality = Math.max(0, project.quality - 5);
    }
    
    // Feature implementation
    let featuresImplemented = 0;
    project.features.forEach(feature => {
      if (!feature.implemented && project.progress > (featuresImplemented + 1) * (100 / project.features.length)) {
        feature.implemented = true;
        featuresImplemented++;
      }
    });
    
    // Check deadline
    if (gameState.currentTime > project.deadline) {
      project.failed = true;
      updatedProjects.completed.push(project);
      delete updatedProjects.active[id];
      notifications.push({
        type: 'error',
        message: `Project "${project.name}" failed - Deadline missed!`
      });
    }
    
    // Check completion
    if (project.progress >= 100 && !project.completed) {
      project.completed = true;
      const finalReward = calculateFinalReward(project, gameState);
      gameState.company.money += finalReward;
      gameState.company.reputation += project.failed ? -project.reputation : project.reputation;
      gameState.company.completedProjects++;
      gameState.company.xp += project.difficulty * 10;
      
      updatedProjects.completed.push(project);
      delete updatedProjects.active[id];
      
      notifications.push({
        type: 'success',
        message: `Project "${project.name}" completed! Earned ${formatMoney(finalReward)}`
      });
    }
  });
  
  return { projects: updatedProjects, notifications };
}

function processDevelopers(developers, projects, gameState, deltaTime) {
  const updatedDevelopers = { ...developers };
  const notifications = [];
  
  Object.values(updatedDevelopers).forEach(dev => {
    // Energy recovery/drain
    if (dev.currentProject) {
      dev.energy = Math.max(0, dev.energy - deltaTime * 5);
      dev.stress = Math.min(100, dev.stress + deltaTime * 3);
      
      // Gain experience
      dev.experience += deltaTime * 0.5;
      
      // Skill improvement
      const project = projects.active[dev.currentProject];
      if (project) {
        Object.keys(project.requirements).forEach(skill => {
          if (dev.skills[skill]) {
            dev.skills[skill] = Math.min(100, dev.skills[skill] + deltaTime * 0.1);
          }
        });
      }
    } else {
      dev.energy = Math.min(100, dev.energy + deltaTime * 10);
      dev.stress = Math.max(0, dev.stress - deltaTime * 5);
    }
    
    // Mood calculation
    dev.mood = Math.max(0, Math.min(100,
      100 - dev.stress * 0.5 + (dev.energy > 50 ? 10 : -10)
    ));
    
    // Burnout risk
    dev.burnoutRisk = dev.stress > 80 && dev.energy < 30;
    
    if (dev.burnoutRisk && Math.random() < 0.01 * deltaTime) {
      notifications.push({
        type: 'warning',
        message: `${dev.name} is at risk of burnout!`
      });
    }
    
    // Level up check
    if (dev.experience >= dev.level * 50) {
      dev.level++;
      dev.experience = 0;
      dev.salary = Math.floor(dev.salary * 1.1);
      notifications.push({
        type: 'info',
        message: `${dev.name} leveled up to ${dev.level}!`
      });
    }
  });
  
  return { developers: updatedDevelopers, notifications };
}

function processMarket(market, gameState, deltaTime) {
  const updatedMarket = { ...market };
  
  // Market fluctuations
  if (Math.random() < 0.01 * deltaTime) {
    updatedMarket.demandMultiplier = Math.max(0.5, Math.min(2.0,
      updatedMarket.demandMultiplier + (Math.random() - 0.5) * 0.2
    ));
  }
  
  // Trending tech changes
  if (Math.random() < 0.005 * deltaTime) {
    const types = Object.keys(PROJECT_TYPES);
    updatedMarket.trendingTech = types[Math.floor(Math.random() * types.length)];
  }
  
  return updatedMarket;
}

function processFinances(gameState, developers) {
  let monthlyExpenses = 0;
  
  // Developer salaries
  Object.values(developers).forEach(dev => {
    monthlyExpenses += dev.salary;
  });
  
  // Office rent
  monthlyExpenses += gameState.company.officeLevel * 1000;
  
  // Technology maintenance
  monthlyExpenses += gameState.company.technologies.length * 500;
  
  gameState.company.monthlyExpenses = monthlyExpenses;
  
  // Deduct expenses (assuming monthly)
  if (gameState.tickCount % 720 === 0) { // 720 ticks = 1 month at normal speed
    gameState.company.money -= monthlyExpenses;
  }
}

// Additional Game Functions
function calculateFinalReward(project, gameState) {
  let reward = project.reward;
  
  // Quality bonus/penalty
  const qualityMultiplier = project.quality / 100;
  reward *= qualityMultiplier;
  
  // Bug penalty
  reward *= Math.max(0.5, 1 - (project.bugs * 0.05));
  
  // Features bonus
  const implementedFeatures = project.features.filter(f => f.implemented).length;
  const featureBonus = implementedFeatures / project.features.length;
  reward *= (0.8 + featureBonus * 0.4);
  
  // Trending bonus
  if (project.type === gameState.market.trendingTech) {
    reward *= 1.25;
  }
  
  return Math.floor(reward);
}

function generateRandomEvent(gameState) {
  if (Math.random() > 0.02) return null; // 2% chance per tick
  
  const event = MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)];
  return {
    id: Date.now(),
    timestamp: gameState.currentTime,
    ...event
  };
}

function checkAchievements(gameState, stats, achievements) {
  const newAchievements = [];
  
  ACHIEVEMENTS.forEach(achievement => {
    if (achievements.some(a => a.id === achievement.id)) return;
    
    let unlocked = false;
    
    switch (achievement.id) {
      case 'first_project':
        unlocked = gameState.company.completedProjects > 0;
        break;
      case 'perfect_project':
        unlocked = stats.perfectProjects > 0;
        break;
      case 'bug_free':
        unlocked = stats.perfectProjects >= 5;
        break;
      case 'team_of_10':
        unlocked = Object.keys(gameState.developers || {}).length >= 10;
        break;
      case 'millionaire':
        unlocked = gameState.company.money >= 1000000;
        break;
      case 'tech_leader':
        unlocked = gameState.company.technologies.length === Object.keys(TECHNOLOGIES).length;
        break;
    }
    
    if (unlocked) {
      newAchievements.push(achievement);
    }
  });
  
  return newAchievements;
}