// Game Constants Module
// Make constants available globally
window.PROJECT_TYPES = {
  web_app: { name: 'Web App', icon: '🌐', baseReward: 1.0, complexity: 1.0 },
  mobile_app: { name: 'Mobile App', icon: '📱', baseReward: 1.2, complexity: 1.3 },
  game: { name: 'Game', icon: '🎮', baseReward: 1.5, complexity: 1.8 },
  api: { name: 'API', icon: '🔌', baseReward: 0.8, complexity: 0.9 },
  desktop_app: { name: 'Desktop App', icon: '💻', baseReward: 1.1, complexity: 1.2 },
  ai_tool: { name: 'AI Tool', icon: '🤖', baseReward: 2.0, complexity: 2.5 }
};

window.SKILL_TYPES = {
  frontend: { name: 'Frontend', icon: '🎨', color: '#3b82f6' },
  backend: { name: 'Backend', icon: '⚙️', color: '#10b981' },
  mobile: { name: 'Mobile', icon: '📱', color: '#8b5cf6' },
  database: { name: 'Database', icon: '🗄️', color: '#f59e0b' },
  devops: { name: 'DevOps', icon: '🚀', color: '#ef4444' },
  testing: { name: 'Testing', icon: '🧪', color: '#06b6d4' },
  ui_ux: { name: 'UI/UX', icon: '✨', color: '#ec4899' },
  ai_ml: { name: 'AI/ML', icon: '🧠', color: '#6366f1' }
};

window.TECHNOLOGIES = {
  agile: { name: 'Agile Development', cost: 10000, level: 5, bonus: { productivity: 1.2 } },
  ci_cd: { name: 'CI/CD Pipeline', cost: 15000, level: 10, bonus: { quality: 1.3 } },
  cloud: { name: 'Cloud Infrastructure', cost: 20000, level: 15, bonus: { scalability: 1.5 } },
  ai_assist: { name: 'AI Code Assistant', cost: 30000, level: 20, bonus: { productivity: 1.5 } }
};

window.OFFICE_UPGRADES = {
  1: { name: 'Garage Startup', maxDevs: 4, cost: 0 },
  2: { name: 'Small Office', maxDevs: 8, cost: 50000 },
  3: { name: 'Tech Hub', maxDevs: 16, cost: 150000 },
  4: { name: 'Corporate Tower', maxDevs: 32, cost: 500000 }
};

window.DEVELOPER_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Quinn', 'Sage',
  'Blake', 'Drew', 'Avery', 'Reese', 'Cameron', 'Finley', 'Emerson', 'River'
];

window.DEVELOPER_PERSONALITIES = [
  'perfectionist', 'innovator', 'team_player', 'lone_wolf', 
  'speedster', 'methodical', 'creative', 'analytical'
];

window.PROJECT_NAMES_PREFIXES = [
  'Super', 'Ultra', 'Mega', 'Hyper', 'Next', 'Future', 'Smart', 'Pro',
  'Elite', 'Prime', 'Alpha', 'Beta', 'Cloud', 'Quantum', 'Digital', 'Cyber'
];

window.PROJECT_NAMES_SUFFIXES = [
  'Manager', 'Tracker', 'System', 'Platform', 'Suite', 'Hub', 'Portal', 'Engine',
  'Framework', 'Solution', 'Tool', 'App', 'Connect', 'Link', 'Base', 'Core'
];

window.CLIENT_NAMES = [
  'TechCorp', 'Digital Dynamics', 'StartupHub', 'Innovation Labs', 'FutureSoft',
  'CloudWorks', 'DataFlow Inc', 'CyberSolutions', 'WebMasters Co', 'AppFactory',
  'CodeCraft', 'DevHouse', 'ByteBuilders', 'PixelPerfect', 'SystemSync'
];

window.MARKET_EVENTS = [
  { type: 'tech_boom', message: 'Tech boom! Project demand increased!' },
  { type: 'economic_downturn', message: 'Economic downturn affects project budgets' },
  { type: 'new_framework', message: 'New framework released - developers need training' },
  { type: 'security_breach', message: 'Major security breach - security projects in demand' },
  { type: 'ai_revolution', message: 'AI revolution - AI projects paying premium' }
];

window.ACHIEVEMENTS = [
  { id: 'first_project', name: 'First Steps', description: 'Complete your first project', icon: '🎯' },
  { id: 'perfect_project', name: 'Perfectionist', description: 'Complete a project with 100% quality', icon: '⭐' },
  { id: 'bug_free', name: 'Bug Free', description: 'Complete 5 projects without bugs', icon: '🐛' },
  { id: 'team_of_10', name: 'Growing Team', description: 'Have 10 developers', icon: '👥' },
  { id: 'millionaire', name: 'Millionaire', description: 'Reach $1,000,000', icon: '💰' },
  { id: 'tech_leader', name: 'Tech Leader', description: 'Research all technologies', icon: '🔬' }
];