// UI Components Module

// Header Component
function Header({ gameState, setGameState, formatMoney, formatTime }) {
  return React.createElement('div', {
    style: {
      background: 'linear-gradient(to right, #1e293b, #334155)',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
    }
  }, [
    // Company Info
    React.createElement('div', { key: 'company-info' }, [
      React.createElement('h1', {
        key: 'title',
        style: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }
      }, gameState.company.name),
      React.createElement('div', {
        key: 'stats',
        style: { display: 'flex', gap: '1rem', fontSize: '0.875rem', opacity: 0.8 }
      }, [
        React.createElement('span', { key: 'level' }, `Level ${gameState.company.level}`),
        React.createElement('span', { key: 'rep' }, `Rep: ${gameState.company.reputation}`),
        React.createElement('span', { key: 'xp' }, `XP: ${gameState.company.xp}/${gameState.company.level * 100}`)
      ])
    ]),
    
    // Stats
    React.createElement('div', {
      key: 'money-stats',
      style: { textAlign: 'center' }
    }, [
      React.createElement('div', {
        key: 'money',
        style: { fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }
      }, formatMoney(gameState.company.money)),
      React.createElement('div', {
        key: 'expenses',
        style: { fontSize: '0.875rem', opacity: 0.8 }
      }, `Monthly Expenses: ${formatMoney(gameState.company.monthlyExpenses)}`)
    ]),
    
    // Time Controls
    React.createElement('div', {
      key: 'time-controls',
      style: { display: 'flex', alignItems: 'center', gap: '1rem' }
    }, [
      React.createElement('div', { key: 'time-display' }, [
        React.createElement('div', {
          key: 'time',
          style: { fontSize: '0.875rem', fontWeight: 'bold' }
        }, formatTime(gameState.currentTime)),
        React.createElement('div', {
          key: 'speed',
          style: { fontSize: '0.75rem', opacity: 0.8 }
        }, `Speed: ${gameState.speed}x`)
      ]),
      React.createElement('div', {
        key: 'controls',
        style: { display: 'flex', gap: '0.5rem' }
      }, [
        React.createElement('button', {
          key: 'pause',
          onClick: () => setGameState(prev => ({ ...prev, paused: !prev.paused })),
          style: {
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            background: gameState.paused ? '#10b981' : '#ef4444',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, gameState.paused ? '▶️' : '⏸️'),
        React.createElement('button', {
          key: 'speed-down',
          onClick: () => setGameState(prev => ({ ...prev, speed: Math.max(1, prev.speed / 2) })),
          style: {
            padding: '0.5rem',
            borderRadius: '0.25rem',
            background: '#475569',
            border: 'none',
            cursor: 'pointer'
          }
        }, '🐢'),
        React.createElement('button', {
          key: 'speed-up',
          onClick: () => setGameState(prev => ({ ...prev, speed: Math.min(8, prev.speed * 2) })),
          style: {
            padding: '0.5rem',
            borderRadius: '0.25rem',
            background: '#475569',
            border: 'none',
            cursor: 'pointer'
          }
        }, '🚀')
      ])
    ])
  ]);
}

// Tab Navigation Component
function TabNav({ selectedTab, setSelectedTab }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'projects', label: 'Projects', icon: '📁' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'research', label: 'Research', icon: '🔬' },
    { id: 'market', label: 'Market', icon: '📈' }
  ];
  
  return React.createElement('div', {
    style: {
      display: 'flex',
      borderBottom: '2px solid #334155',
      background: '#1e293b'
    }
  }, tabs.map(tab =>
    React.createElement('button', {
      key: tab.id,
      onClick: () => setSelectedTab(tab.id),
      style: {
        padding: '1rem 2rem',
        background: selectedTab === tab.id ? '#334155' : 'transparent',
        border: 'none',
        color: selectedTab === tab.id ? '#3b82f6' : '#94a3b8',
        cursor: 'pointer',
        fontWeight: selectedTab === tab.id ? 'bold' : 'normal',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }
    }, [
      React.createElement('span', { key: 'icon' }, tab.icon),
      React.createElement('span', { key: 'label' }, tab.label)
    ])
  ));
}

// Project Card Component
function ProjectCard({ project, onAssign, developers, onStart }) {
  const progress = project.progress || 0;
  const quality = project.quality || 0;
  
  return React.createElement('div', {
    style: {
      background: '#1e293b',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '1rem',
      border: project.active ? '2px solid #3b82f6' : '1px solid #334155',
      transition: 'all 0.2s'
    }
  }, [
    // Header
    React.createElement('div', {
      key: 'header',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem'
      }
    }, [
      React.createElement('div', { key: 'title' }, [
        React.createElement('h3', {
          style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }
        }, [
          React.createElement('span', { key: 'icon' }, project.icon),
          React.createElement('span', { key: 'name' }, project.name)
        ]),
        React.createElement('div', {
          style: { fontSize: '0.875rem', opacity: 0.8 }
        }, `${project.client} • ${PROJECT_TYPES[project.type].name}`)
      ]),
      React.createElement('div', {
        key: 'reward',
        style: { textAlign: 'right' }
      }, [
        React.createElement('div', {
          style: { color: '#10b981', fontWeight: 'bold' }
        }, formatMoney(project.reward)),
        React.createElement('div', {
          style: { fontSize: '0.75rem', opacity: 0.8 }
        }, `+${project.reputation} Rep`)
      ])
    ]),
    
    // Requirements
    React.createElement('div', {
      key: 'requirements',
      style: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '0.5rem',
        flexWrap: 'wrap'
      }
    }, Object.entries(project.requirements).map(([skill, level]) =>
      React.createElement('span', {
        key: skill,
        style: {
          background: SKILL_TYPES[skill].color,
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.75rem'
        }
      }, `${SKILL_TYPES[skill].icon} ${level}+`)
    )),
    
    // Progress bars (if active)
    project.active && React.createElement('div', {
      key: 'progress-bars',
      style: { marginBottom: '0.5rem' }
    }, [
      React.createElement('div', {
        key: 'progress',
        style: { marginBottom: '0.25rem' }
      }, [
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            marginBottom: '0.25rem'
          }
        }, [
          React.createElement('span', { key: 'label' }, 'Progress'),
          React.createElement('span', { key: 'value' }, `${progress.toFixed(0)}%`)
        ]),
        React.createElement('div', {
          style: {
            height: '0.5rem',
            background: '#334155',
            borderRadius: '0.25rem',
            overflow: 'hidden'
          }
        }, React.createElement('div', {
          style: {
            width: `${progress}%`,
            height: '100%',
            background: '#3b82f6',
            transition: 'width 0.3s'
          }
        }))
      ]),
      React.createElement('div', {
        key: 'quality'
      }, [
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            marginBottom: '0.25rem'
          }
        }, [
          React.createElement('span', { key: 'label' }, 'Quality'),
          React.createElement('span', { key: 'value' }, `${quality.toFixed(0)}%`)
        ]),
        React.createElement('div', {
          style: {
            height: '0.5rem',
            background: '#334155',
            borderRadius: '0.25rem',
            overflow: 'hidden'
          }
        }, React.createElement('div', {
          style: {
            width: `${quality}%`,
            height: '100%',
            background: '#10b981',
            transition: 'width 0.3s'
          }
        }))
      ])
    ]),
    
    // Actions
    !project.active && React.createElement('button', {
      key: 'start-button',
      onClick: () => onStart(project),
      style: {
        width: '100%',
        padding: '0.5rem',
        background: '#3b82f6',
        border: 'none',
        borderRadius: '0.25rem',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.2s'
      }
    }, 'Start Project')
  ]);
}

// Developer Card Component
function DeveloperCard({ developer, onAssign, onTrain, onFire }) {
  return React.createElement('div', {
    style: {
      background: '#1e293b',
      borderRadius: '0.5rem',
      padding: '1rem',
      border: developer.burnoutRisk ? '2px solid #ef4444' : '1px solid #334155',
      transition: 'all 0.2s'
    }
  }, [
    // Header
    React.createElement('div', {
      key: 'header',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem'
      }
    }, [
      React.createElement('h4', {
        key: 'name',
        style: { fontWeight: 'bold' }
      }, developer.name),
      React.createElement('span', {
        key: 'level',
        style: {
          background: '#3b82f6',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.75rem'
        }
      }, `Lvl ${developer.level}`)
    ]),
    
    // Status bars
    React.createElement('div', {
      key: 'status',
      style: { marginBottom: '0.5rem' }
    }, [
      // Energy
      React.createElement('div', {
        key: 'energy',
        style: { marginBottom: '0.25rem' }
      }, [
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem'
          }
        }, [
          React.createElement('span', { key: 'label' }, '⚡ Energy'),
          React.createElement('span', { key: 'value' }, `${developer.energy.toFixed(0)}%`)
        ]),
        React.createElement('div', {
          style: {
            height: '0.25rem',
            background: '#334155',
            borderRadius: '0.125rem',
            overflow: 'hidden'
          }
        }, React.createElement('div', {
          style: {
            width: `${developer.energy}%`,
            height: '100%',
            background: developer.energy > 50 ? '#10b981' : developer.energy > 20 ? '#f59e0b' : '#ef4444'
          }
        }))
      ]),
      
      // Mood
      React.createElement('div', {
        key: 'mood',
        style: { marginBottom: '0.25rem' }
      }, [
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem'
          }
        }, [
          React.createElement('span', { key: 'label' }, '😊 Mood'),
          React.createElement('span', { key: 'value' }, `${developer.mood.toFixed(0)}%`)
        ]),
        React.createElement('div', {
          style: {
            height: '0.25rem',
            background: '#334155',
            borderRadius: '0.125rem',
            overflow: 'hidden'
          }
        }, React.createElement('div', {
          style: {
            width: `${developer.mood}%`,
            height: '100%',
            background: '#3b82f6'
          }
        }))
      ])
    ]),
    
    // Skills
    React.createElement('div', {
      key: 'skills',
      style: {
        display: 'flex',
        gap: '0.25rem',
        flexWrap: 'wrap',
        marginBottom: '0.5rem'
      }
    }, Object.entries(developer.skills)
      .filter(([_, level]) => level > 30)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3)
      .map(([skill, level]) =>
        React.createElement('span', {
          key: skill,
          style: {
            background: skill === developer.specialty ? SKILL_TYPES[skill].color : '#334155',
            padding: '0.125rem 0.25rem',
            borderRadius: '0.125rem',
            fontSize: '0.75rem'
          }
        }, `${SKILL_TYPES[skill].icon} ${level}`)
      )
    ),
    
    // Salary
    React.createElement('div', {
      key: 'salary',
      style: {
        fontSize: '0.875rem',
        opacity: 0.8,
        textAlign: 'center'
      }
    }, `Salary: ${formatMoney(developer.salary)}/mo`)
  ]);
}

// Notification Component
function Notification({ notification, onClose }) {
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };
  
  return React.createElement('div', {
    style: {
      background: colors[notification.type],
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '0.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      animation: 'slideIn 0.3s ease-out'
    }
  }, [
    React.createElement('span', { key: 'message' }, notification.message),
    React.createElement('button', {
      key: 'close',
      onClick: () => onClose(notification.id),
      style: {
        background: 'none',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        fontSize: '1.25rem'
      }
    }, '×')
  ]);
}