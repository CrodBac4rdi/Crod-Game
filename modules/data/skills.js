// Skills Data Module
window.SkillsData = {
    trees: {
        frontend: {
            name: 'Frontend Development',
            icon: '🎨',
            skills: [
                {
                    id: 'html-basics',
                    name: 'HTML Fundamentals',
                    description: 'Master HTML structure and semantics',
                    maxLevel: 5,
                    cost: 1,
                    benefits: {
                        codingSpeed: 0.05,
                        bugRate: -0.02
                    },
                    requirements: {}
                },
                {
                    id: 'css-styling',
                    name: 'CSS Styling',
                    description: 'Create beautiful, responsive designs',
                    maxLevel: 5,
                    cost: 1,
                    benefits: {
                        projectQuality: 0.1,
                        clientSatisfaction: 0.05
                    },
                    requirements: {
                        skills: ['html-basics']
                    }
                },
                {
                    id: 'react-mastery',
                    name: 'React Mastery',
                    description: 'Build modern React applications',
                    maxLevel: 10,
                    cost: 2,
                    benefits: {
                        codingSpeed: 0.15,
                        projectValue: 0.2
                    },
                    requirements: {
                        skills: ['css-styling'],
                        level: 10
                    }
                }
            ]
        },
        backend: {
            name: 'Backend Development',
            icon: '⚙️',
            skills: [
                {
                    id: 'nodejs-basics',
                    name: 'Node.js Fundamentals',
                    description: 'Server-side JavaScript development',
                    maxLevel: 5,
                    cost: 1,
                    benefits: {
                        serverPerformance: 0.1,
                        apiSpeed: 0.05
                    },
                    requirements: {}
                },
                {
                    id: 'database-design',
                    name: 'Database Design',
                    description: 'Design efficient database schemas',
                    maxLevel: 5,
                    cost: 2,
                    benefits: {
                        dataEfficiency: 0.15,
                        querySpeed: 0.1
                    },
                    requirements: {
                        skills: ['nodejs-basics']
                    }
                }
            ]
        },
        productivity: {
            name: 'Productivity',
            icon: '🚀',
            skills: [
                {
                    id: 'fast-typing',
                    name: 'Fast Typing',
                    description: 'Type faster and more accurately',
                    maxLevel: 10,
                    cost: 1,
                    benefits: {
                        codingSpeed: 0.02,
                        typoRate: -0.05
                    },
                    requirements: {}
                },
                {
                    id: 'time-management',
                    name: 'Time Management',
                    description: 'Work more efficiently',
                    maxLevel: 5,
                    cost: 1,
                    benefits: {
                        energyEfficiency: 0.1,
                        stressReduction: 0.05
                    },
                    requirements: {
                        level: 5
                    }
                }
            ]
        }
    }
};