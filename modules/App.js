// Main App Module
const App = () => {
    const { useState, useEffect, useCallback } = React;
    const { 
        useGameState, 
        usePlayer, 
        useSettings, 
        useNotifications,
        useKeyboardShortcuts 
    } = GameHooks;
    
    // State
    const [gameState] = useGameState('game');
    const [uiState, setUIState] = useGameState('ui');
    const player = usePlayer();
    const settings = useSettings();
    const { notifications, addNotification } = useNotifications();
    
    // Initialize
    useEffect(() => {
        // Load saved state
        if (StateManager.loadFromStorage()) {
            addNotification({
                type: 'success',
                message: 'Welcome back! Game loaded successfully.',
                icon: '🎮'
            });
        } else {
            addNotification({
                type: 'info',
                message: 'Welcome to DevLearn Academy!',
                icon: '👋'
            });
        }
        
        // Subscribe to events
        const unsubscribes = [
            EventSystem.on(EventSystem.events.LEVEL_UP, (data) => {
                addNotification({
                    type: 'success',
                    message: `Level Up! You're now level ${data.level}!`,
                    icon: '🎉',
                    duration: 5000
                });
            }),
            
            EventSystem.on(EventSystem.events.ACHIEVEMENT_UNLOCKED, (data) => {
                addNotification({
                    type: 'achievement',
                    message: data.achievement.name,
                    description: data.achievement.description,
                    icon: data.achievement.icon || '🏆',
                    duration: 5000
                });
            })
        ];
        
        // Auto-save
        const saveInterval = setInterval(() => {
            if (settings.autoSave) {
                StateManager.saveToStorage();
            }
        }, CONSTANTS.GAME.SAVE_INTERVAL);
        
        return () => {
            unsubscribes.forEach(unsub => unsub());
            clearInterval(saveInterval);
        };
    }, []);
    
    // Keyboard shortcuts
    useKeyboardShortcuts({
        'ctrl+s': () => {
            StateManager.saveToStorage();
            addNotification({
                type: 'success',
                message: 'Game saved!',
                icon: '💾'
            });
        },
        'ctrl+p': () => {
            StateManager.updateState('game', { 
                paused: !gameState.paused 
            });
        },
        'escape': () => {
            setUIState({ ...uiState, modalOpen: null });
        }
    });
    
    // Tab change handler
    const handleTabChange = useCallback((tab) => {
        setUIState({ ...uiState, activeTab: tab });
        EventSystem.emit(EventSystem.events.TAB_CHANGE, { tab });
    }, [uiState]);
    
    // Modal handlers
    const openModal = useCallback((modalType) => {
        setUIState({ ...uiState, modalOpen: modalType });
        EventSystem.emit(EventSystem.events.MODAL_OPEN, { modalType });
    }, [uiState]);
    
    const closeModal = useCallback(() => {
        setUIState({ ...uiState, modalOpen: null });
        EventSystem.emit(EventSystem.events.MODAL_CLOSE);
    }, [uiState]);
    
    // Render content based on active tab
    const renderContent = () => {
        switch (uiState.activeTab) {
            case 'dashboard':
                return React.createElement(Dashboard, { player, gameState });
            case 'learn':
                return React.createElement(LearningCenter, { player });
            case 'code':
                return React.createElement(CodeEditor, { player });
            case 'skills':
                return React.createElement(SkillTree, { player });
            case 'achievements':
                return React.createElement(Achievements, { player });
            case 'settings':
                return React.createElement(Settings, { settings });
            default:
                return React.createElement(Dashboard, { player, gameState });
        }
    };
    
    return React.createElement('div', { className: 'app-container' },
        // Header
        React.createElement(Header, {
            player,
            gameState,
            onTabChange: handleTabChange,
            activeTab: uiState.activeTab
        }),
        
        // Main Content
        React.createElement('main', { className: 'main-content' },
            renderContent()
        ),
        
        // Notifications
        React.createElement(NotificationContainer, { notifications }),
        
        // Modals
        uiState.modalOpen && React.createElement(Modal, {
            type: uiState.modalOpen,
            onClose: closeModal
        })
    );
};

// Header Component
const Header = ({ player, gameState, onTabChange, activeTab }) => {
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
        { id: 'learn', label: 'Learn', icon: '📚' },
        { id: 'code', label: 'Code', icon: '💻' },
        { id: 'skills', label: 'Skills', icon: '🌟' },
        { id: 'achievements', label: 'Achievements', icon: '🏆' },
        { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];
    
    return React.createElement('header', { className: 'app-header' },
        // Logo
        React.createElement('div', { className: 'logo' },
            React.createElement('span', { className: 'logo-icon' }, '🚀'),
            React.createElement('span', { className: 'logo-text' }, 'DevLearn Academy')
        ),
        
        // Navigation
        React.createElement('nav', { className: 'nav-tabs' },
            tabs.map(tab => 
                React.createElement('button', {
                    key: tab.id,
                    className: `nav-tab ${activeTab === tab.id ? 'active' : ''}`,
                    onClick: () => onTabChange(tab.id)
                },
                    React.createElement('span', { className: 'tab-icon' }, tab.icon),
                    React.createElement('span', { className: 'tab-label' }, tab.label)
                )
            )
        ),
        
        // Player Stats
        React.createElement('div', { className: 'header-stats' },
            React.createElement(ResourceDisplay, {
                icon: CONSTANTS.RESOURCES.MONEY.icon,
                value: Utils.formatCurrency(player.money),
                color: CONSTANTS.RESOURCES.MONEY.color
            }),
            React.createElement(ResourceDisplay, {
                icon: CONSTANTS.RESOURCES.ENERGY.icon,
                value: `${Math.floor(player.energy)}%`,
                color: CONSTANTS.RESOURCES.ENERGY.color
            }),
            React.createElement('div', { className: 'level-display' },
                React.createElement('span', { className: 'level-label' }, 'Lvl'),
                React.createElement('span', { className: 'level-value' }, player.level),
                React.createElement('div', { className: 'xp-bar' },
                    React.createElement('div', {
                        className: 'xp-fill',
                        style: { width: `${Utils.calculateLevelProgress(player.xp, player.level) * 100}%` }
                    })
                )
            )
        )
    );
};

// Resource Display Component
const ResourceDisplay = ({ icon, value, color }) => {
    return React.createElement('div', { className: 'resource-display' },
        React.createElement('span', { 
            className: 'resource-icon',
            style: { color }
        }, icon),
        React.createElement('span', { className: 'resource-value' }, value)
    );
};

// Dashboard Component (placeholder)
const Dashboard = ({ player, gameState }) => {
    return React.createElement('div', { className: 'dashboard' },
        React.createElement('h1', null, 'Dashboard'),
        React.createElement('p', null, `Welcome, ${player.name}!`)
    );
};

// Learning Center Component (placeholder)
const LearningCenter = ({ player }) => {
    return React.createElement('div', { className: 'learning-center' },
        React.createElement('h1', null, 'Learning Center'),
        React.createElement('p', null, 'Choose a lesson to begin learning!')
    );
};

// Code Editor Component (placeholder)
const CodeEditor = ({ player }) => {
    return React.createElement('div', { className: 'code-editor' },
        React.createElement('h1', null, 'Code Editor'),
        React.createElement('p', null, 'Write and test your code here!')
    );
};

// Skill Tree Component (placeholder)
const SkillTree = ({ player }) => {
    return React.createElement('div', { className: 'skill-tree' },
        React.createElement('h1', null, 'Skill Tree'),
        React.createElement('p', null, 'Unlock new skills and abilities!')
    );
};

// Achievements Component (placeholder)
const Achievements = ({ player }) => {
    return React.createElement('div', { className: 'achievements' },
        React.createElement('h1', null, 'Achievements'),
        React.createElement('p', null, 'Track your progress and unlock rewards!')
    );
};

// Settings Component (placeholder)
const Settings = ({ settings }) => {
    return React.createElement('div', { className: 'settings' },
        React.createElement('h1', null, 'Settings'),
        React.createElement('p', null, 'Customize your experience')
    );
};

// Notification Container
const NotificationContainer = ({ notifications }) => {
    return React.createElement('div', { className: 'notification-container' },
        notifications.map(notification =>
            React.createElement('div', {
                key: notification.id,
                className: `notification notification-${notification.type}`
            },
                notification.icon && React.createElement('span', { className: 'notification-icon' }, notification.icon),
                React.createElement('div', { className: 'notification-content' },
                    React.createElement('div', { className: 'notification-message' }, notification.message),
                    notification.description && React.createElement('div', { className: 'notification-description' }, notification.description)
                )
            )
        )
    );
};

// Modal Component (placeholder)
const Modal = ({ type, onClose }) => {
    return React.createElement('div', { className: 'modal-overlay', onClick: onClose },
        React.createElement('div', { 
            className: 'modal-content',
            onClick: (e) => e.stopPropagation()
        },
            React.createElement('h2', null, 'Modal'),
            React.createElement('button', { onClick: onClose }, 'Close')
        )
    );
};

// Initialize the app
window.addEventListener('DOMContentLoaded', () => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
});