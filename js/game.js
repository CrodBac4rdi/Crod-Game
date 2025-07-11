// Main Game Component
window.DevSimTycoon = () => {
  const { useState, useEffect, useRef, useCallback } = React;
  
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

  // Generate initial content
  const generateInitialContent = () => {
    // Generate initial projects
    const initialProjects = [];
    for (let i = 0; i < 5; i++) {
      initialProjects.push(generateProject(gameState));
    }
    setProjects(prev => ({ ...prev, available: initialProjects }));

    // Generate initial developers
    const initialDevs = {};
    for (let i = 0; i < 2; i++) {
      const dev = generateDeveloper(gameState);
      initialDevs[dev.id] = dev;
    }
    setDevelopers(initialDevs);
  };

  // Initialize code animation
  const initCodeAnimation = () => {
    const codeLines = [
      "function createAwesomeApp() {",
      "  const idea = generateIdea();",
      "  const code = writePerfectCode(idea);",
      "  const bugs = Math.random() * 100;",
      "  if (bugs > 50) {",
      "    debug(code);",
      "    refactor(code);",
      "  }",
      "  return deployToProduction(code);",
      "}"
    ];
    setCodeAnimation({ lines: codeLines, currentLine: 0 });
  };

  // Update code animation
  const updateCodeAnimation = () => {
    setCodeAnimation(prev => ({
      ...prev,
      currentLine: (prev.currentLine + 1) % prev.lines.length
    }));
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
    }, 100 / gameState.speed);
    
    return () => clearInterval(interval);
  }, [gameState.paused, gameState.speed]);

  // Process game tick
  const processGameTick = () => {
    const deltaTime = 0.1 * gameState.speed;
    
    // Process projects
    const projectResult = processProjects(projects, developers, gameState, deltaTime);
    setProjects(projectResult.projects);
    projectResult.notifications.forEach(addNotification);
    
    // Process developers
    const devResult = processDevelopers(developers, projects, gameState, deltaTime);
    setDevelopers(devResult.developers);
    devResult.notifications.forEach(addNotification);
    
    // Process market
    const newMarket = processMarket(gameState.market, gameState, deltaTime);
    setGameState(prev => ({ ...prev, market: newMarket }));
    
    // Process finances
    processFinances(gameState, developers);
    
    // Generate new projects
    if (projects.available.length < 8 && Math.random() < 0.1 * deltaTime) {
      setProjects(prev => ({
        ...prev,
        available: [...prev.available, generateProject(gameState)]
      }));
    }
    
    // Check for events
    const event = generateRandomEvent(gameState);
    if (event) {
      addEvent(event);
    }
    
    // Check achievements
    const newAchievements = checkAchievements(gameState, stats, achievements);
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      newAchievements.forEach(ach => addNotification({
        type: 'success',
        message: `Achievement Unlocked: ${ach.name} - ${ach.description}`
      }));
    }
    
    // Update code animation
    if (gameState.tickCount % 10 === 0) {
      updateCodeAnimation();
    }
    
    // Check level up
    if (gameState.company.xp >= gameState.company.level * 100) {
      levelUp();
    }
  };

  // Add notification
  const addNotification = (notification) => {
    const newNotif = {
      ...notification,
      id: Date.now() + Math.random()
    };
    setNotifications(prev => [...prev.slice(-4), newNotif]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 5000);
  };

  // Add event
  const addEvent = (event) => {
    setEvents(prev => [...prev.slice(-19), event]);
    addNotification({
      type: 'info',
      message: event.message
    });
  };

  // Level up
  const levelUp = () => {
    setGameState(prev => ({
      ...prev,
      company: {
        ...prev.company,
        level: prev.company.level + 1,
        xp: prev.company.xp - prev.company.level * 100
      }
    }));
    addNotification({
      type: 'success',
      message: `Company leveled up to ${gameState.company.level + 1}!`
    });
  };

  // Start project
  const startProject = (project) => {
    if (Object.keys(projects.active).length >= Object.keys(developers).length) {
      addNotification({
        type: 'error',
        message: 'Not enough free developers!'
      });
      return;
    }
    
    setProjects(prev => ({
      available: prev.available.filter(p => p.id !== project.id),
      active: {
        ...prev.active,
        [project.id]: { ...project, active: true }
      },
      completed: prev.completed
    }));
    
    // Auto-assign best matching developers
    const availableDevs = Object.values(developers).filter(d => !d.currentProject);
    const assigned = [];
    
    Object.entries(project.requirements).forEach(([skill, req]) => {
      const bestDev = availableDevs
        .filter(d => !assigned.includes(d.id))
        .sort((a, b) => (b.skills[skill] || 0) - (a.skills[skill] || 0))[0];
      
      if (bestDev && bestDev.skills[skill] >= req * 0.5) {
        assigned.push(bestDev.id);
        setDevelopers(prev => ({
          ...prev,
          [bestDev.id]: { ...prev[bestDev.id], currentProject: project.id }
        }));
      }
    });
    
    setProjects(prev => ({
      ...prev,
      active: {
        ...prev.active,
        [project.id]: { ...prev.active[project.id], assignedDevs: assigned }
      }
    }));
    
    addNotification({
      type: 'info',
      message: `Started project: ${project.name}`
    });
  };

  // Hire developer
  const hireDeveloper = () => {
    const cost = calculateHiringCost();
    if (gameState.company.money < cost) {
      addNotification({
        type: 'error',
        message: 'Not enough money to hire!'
      });
      return;
    }
    
    if (Object.keys(developers).length >= gameState.company.maxDevelopers) {
      addNotification({
        type: 'error',
        message: 'Office at max capacity! Upgrade needed.'
      });
      return;
    }
    
    const newDev = generateDeveloper(gameState);
    setDevelopers(prev => ({
      ...prev,
      [newDev.id]: newDev
    }));
    
    setGameState(prev => ({
      ...prev,
      company: {
        ...prev.company,
        money: prev.company.money - cost
      }
    }));
    
    addNotification({
      type: 'success',
      message: `Hired ${newDev.name}!`
    });
  };

  // Calculate hiring cost
  const calculateHiringCost = () => {
    return 5000 + Object.keys(developers).length * 2000;
  };

  // Research technology
  const researchTechnology = (techId) => {
    const tech = TECHNOLOGIES[techId];
    if (gameState.company.money < tech.cost) {
      addNotification({
        type: 'error',
        message: 'Not enough money!'
      });
      return;
    }
    
    if (gameState.company.level < tech.level) {
      addNotification({
        type: 'error',
        message: `Requires company level ${tech.level}!`
      });
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      company: {
        ...prev.company,
        money: prev.company.money - tech.cost,
        technologies: [...prev.company.technologies, techId]
      }
    }));
    
    addNotification({
      type: 'success',
      message: `Researched ${tech.name}!`
    });
  };

  // Upgrade office
  const upgradeOffice = () => {
    const nextLevel = gameState.company.officeLevel + 1;
    if (!OFFICE_UPGRADES[nextLevel]) return;
    
    const upgrade = OFFICE_UPGRADES[nextLevel];
    if (gameState.company.money < upgrade.cost) {
      addNotification({
        type: 'error',
        message: 'Not enough money for office upgrade!'
      });
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
    
    addNotification({
      type: 'success',
      message: `Upgraded to ${upgrade.name}!`
    });
  };

  // Render game
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: '#0f172a',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }
  }, [
    // Header
    React.createElement(Header, {
      key: 'header',
      gameState,
      setGameState,
      formatMoney,
      formatTime
    }),
    
    // Tab Navigation
    React.createElement(TabNav, {
      key: 'tabs',
      selectedTab,
      setSelectedTab
    }),
    
    // Tab Content
    React.createElement('div', {
      key: 'content',
      style: {
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }
    }, [
      // Overview Tab
      selectedTab === 'overview' && React.createElement('div', {
        key: 'overview',
        style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }
      }, [
        // Active Projects
        React.createElement('div', { key: 'active-projects' }, [
          React.createElement('h2', {
            style: { fontSize: '1.5rem', marginBottom: '1rem' }
          }, 'Active Projects'),
          Object.values(projects.active).length === 0 
            ? React.createElement('p', {
                style: { opacity: 0.6 }
              }, 'No active projects')
            : Object.values(projects.active).map(project =>
                React.createElement(ProjectCard, {
                  key: project.id,
                  project,
                  developers,
                  onAssign: () => {},
                  onStart: () => {}
                })
              )
        ]),
        
        // Team Status
        React.createElement('div', { key: 'team-status' }, [
          React.createElement('h2', {
            style: { fontSize: '1.5rem', marginBottom: '1rem' }
          }, 'Team Status'),
          Object.values(developers).map(dev =>
            React.createElement(DeveloperCard, {
              key: dev.id,
              developer: dev,
              onAssign: () => {},
              onTrain: () => {},
              onFire: () => {}
            })
          )
        ])
      ]),
      
      // Projects Tab
      selectedTab === 'projects' && React.createElement('div', {
        key: 'projects'
      }, [
        React.createElement('h2', {
          style: { fontSize: '1.5rem', marginBottom: '1rem' }
        }, 'Available Projects'),
        React.createElement('div', {
          style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1rem' }
        }, projects.available.map(project =>
          React.createElement(ProjectCard, {
            key: project.id,
            project,
            developers,
            onAssign: () => {},
            onStart: startProject
          })
        ))
      ]),
      
      // Team Tab
      selectedTab === 'team' && React.createElement('div', {
        key: 'team'
      }, [
        React.createElement('div', {
          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }
        }, [
          React.createElement('h2', {
            style: { fontSize: '1.5rem' }
          }, `Team (${Object.keys(developers).length}/${gameState.company.maxDevelopers})`),
          React.createElement('button', {
            onClick: hireDeveloper,
            style: {
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              border: 'none',
              borderRadius: '0.25rem',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold'
            }
          }, `Hire Developer (${formatMoney(calculateHiringCost())})`)
        ]),
        React.createElement('div', {
          style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }
        }, Object.values(developers).map(dev =>
          React.createElement(DeveloperCard, {
            key: dev.id,
            developer: dev,
            onAssign: () => {},
            onTrain: () => {},
            onFire: () => {}
          })
        ))
      ]),
      
      // Research Tab
      selectedTab === 'research' && React.createElement('div', {
        key: 'research'
      }, [
        React.createElement('h2', {
          style: { fontSize: '1.5rem', marginBottom: '1rem' }
        }, 'Research & Development'),
        React.createElement('div', {
          style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }
        }, Object.entries(TECHNOLOGIES).map(([id, tech]) => {
          const owned = gameState.company.technologies.includes(id);
          const canAfford = gameState.company.money >= tech.cost;
          const levelMet = gameState.company.level >= tech.level;
          
          return React.createElement('div', {
            key: id,
            style: {
              background: owned ? '#065f46' : '#1e293b',
              borderRadius: '0.5rem',
              padding: '1rem',
              border: owned ? '2px solid #10b981' : '1px solid #334155',
              opacity: !owned && !levelMet ? 0.5 : 1
            }
          }, [
            React.createElement('h3', {
              style: { fontWeight: 'bold', marginBottom: '0.5rem' }
            }, tech.name),
            React.createElement('p', {
              style: { fontSize: '0.875rem', marginBottom: '0.5rem', opacity: 0.8 }
            }, `Requires Level ${tech.level}`),
            Object.entries(tech.bonus).map(([key, value]) =>
              React.createElement('div', {
                key,
                style: { fontSize: '0.875rem', color: '#10b981' }
              }, `+${((value - 1) * 100).toFixed(0)}% ${key}`)
            ),
            !owned && React.createElement('button', {
              onClick: () => researchTechnology(id),
              disabled: !canAfford || !levelMet,
              style: {
                width: '100%',
                marginTop: '0.5rem',
                padding: '0.5rem',
                background: canAfford && levelMet ? '#3b82f6' : '#475569',
                border: 'none',
                borderRadius: '0.25rem',
                color: 'white',
                cursor: canAfford && levelMet ? 'pointer' : 'not-allowed',
                fontWeight: 'bold'
              }
            }, formatMoney(tech.cost))
          ]);
        })),
        
        // Office Upgrades
        React.createElement('div', {
          style: { marginTop: '2rem' }
        }, [
          React.createElement('h3', {
            style: { fontSize: '1.25rem', marginBottom: '1rem' }
          }, 'Office Upgrades'),
          React.createElement('div', {
            style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }
          }, Object.entries(OFFICE_UPGRADES).map(([level, upgrade]) => {
            const owned = gameState.company.officeLevel >= parseInt(level);
            const current = gameState.company.officeLevel === parseInt(level);
            
            return React.createElement('div', {
              key: level,
              style: {
                background: current ? '#065f46' : owned ? '#334155' : '#1e293b',
                borderRadius: '0.5rem',
                padding: '1rem',
                border: current ? '2px solid #10b981' : '1px solid #334155',
                textAlign: 'center'
              }
            }, [
              React.createElement('h4', {
                style: { fontWeight: 'bold' }
              }, upgrade.name),
              React.createElement('div', {
                style: { fontSize: '0.875rem', margin: '0.5rem 0' }
              }, `Max ${upgrade.maxDevs} developers`),
              !owned && parseInt(level) === gameState.company.officeLevel + 1 &&
                React.createElement('button', {
                  onClick: upgradeOffice,
                  disabled: gameState.company.money < upgrade.cost,
                  style: {
                    padding: '0.5rem',
                    background: gameState.company.money >= upgrade.cost ? '#3b82f6' : '#475569',
                    border: 'none',
                    borderRadius: '0.25rem',
                    color: 'white',
                    cursor: gameState.company.money >= upgrade.cost ? 'pointer' : 'not-allowed'
                  }
                }, formatMoney(upgrade.cost))
            ]);
          }))
        ])
      ]),
      
      // Market Tab
      selectedTab === 'market' && React.createElement('div', {
        key: 'market'
      }, [
        React.createElement('h2', {
          style: { fontSize: '1.5rem', marginBottom: '1rem' }
        }, 'Market Analysis'),
        React.createElement('div', {
          style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }
        }, [
          // Market Info
          React.createElement('div', {
            key: 'market-info',
            style: { background: '#1e293b', borderRadius: '0.5rem', padding: '1.5rem' }
          }, [
            React.createElement('h3', {
              style: { marginBottom: '1rem' }
            }, 'Market Conditions'),
            React.createElement('div', {
              style: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
            }, [
              React.createElement('div', null, [
                React.createElement('span', { style: { opacity: 0.8 } }, 'Demand: '),
                React.createElement('span', {
                  style: { color: gameState.market.demandMultiplier > 1 ? '#10b981' : '#ef4444' }
                }, `${(gameState.market.demandMultiplier * 100).toFixed(0)}%`)
              ]),
              React.createElement('div', null, [
                React.createElement('span', { style: { opacity: 0.8 } }, 'Trending: '),
                React.createElement('span', null, 
                  `${PROJECT_TYPES[gameState.market.trendingTech].icon} ${PROJECT_TYPES[gameState.market.trendingTech].name}`)
              ]),
              React.createElement('div', null, [
                React.createElement('span', { style: { opacity: 0.8 } }, 'Economy: '),
                React.createElement('span', null, gameState.market.economyHealth)
              ])
            ])
          ]),
          
          // Company Stats
          React.createElement('div', {
            key: 'company-stats',
            style: { background: '#1e293b', borderRadius: '0.5rem', padding: '1.5rem' }
          }, [
            React.createElement('h3', {
              style: { marginBottom: '1rem' }
            }, 'Company Statistics'),
            React.createElement('div', {
              style: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
            }, [
              React.createElement('div', null, `Completed Projects: ${gameState.company.completedProjects}`),
              React.createElement('div', null, `Failed Projects: ${gameState.company.failedProjects}`),
              React.createElement('div', null, `Total Revenue: ${formatMoney(gameState.company.totalRevenue)}`),
              React.createElement('div', null, `Success Rate: ${
                gameState.company.completedProjects > 0 
                  ? ((gameState.company.completedProjects / (gameState.company.completedProjects + gameState.company.failedProjects)) * 100).toFixed(0)
                  : 0
              }%`)
            ])
          ])
        ])
      ])
    ]),
    
    // Notifications
    React.createElement('div', {
      key: 'notifications',
      style: {
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        maxWidth: '400px'
      }
    }, notifications.map(notif =>
      React.createElement(Notification, {
        key: notif.id,
        notification: notif,
        onClose: (id) => setNotifications(prev => prev.filter(n => n.id !== id))
      })
    ))
  ]);
};