// Achievements Data Module
window.AchievementsData = {
    categories: {
        learning: {
            name: 'Learning',
            icon: '📚',
            achievements: [
                {
                    id: 'first-lesson',
                    name: 'First Steps',
                    description: 'Complete your first lesson',
                    icon: '🎯',
                    xp: 50,
                    requirements: {
                        lessonsCompleted: 1
                    }
                },
                {
                    id: 'polyglot',
                    name: 'Polyglot',
                    description: 'Complete lessons in 3 different languages',
                    icon: '🌍',
                    xp: 200,
                    requirements: {
                        languagesLearned: 3
                    }
                },
                {
                    id: 'speed-learner',
                    name: 'Speed Learner',
                    description: 'Complete 10 lessons in one day',
                    icon: '⚡',
                    xp: 300,
                    requirements: {
                        dailyLessons: 10
                    }
                }
            ]
        },
        coding: {
            name: 'Coding',
            icon: '💻',
            achievements: [
                {
                    id: 'bug-hunter',
                    name: 'Bug Hunter',
                    description: 'Fix 100 bugs',
                    icon: '🐛',
                    xp: 150,
                    requirements: {
                        bugsFixed: 100
                    }
                },
                {
                    id: 'code-warrior',
                    name: 'Code Warrior',
                    description: 'Write 10,000 lines of code',
                    icon: '⚔️',
                    xp: 500,
                    requirements: {
                        linesOfCode: 10000
                    }
                }
            ]
        },
        progress: {
            name: 'Progress',
            icon: '🏆',
            achievements: [
                {
                    id: 'level-10',
                    name: 'Double Digits',
                    description: 'Reach level 10',
                    icon: '🔟',
                    xp: 100,
                    requirements: {
                        level: 10
                    }
                },
                {
                    id: 'level-50',
                    name: 'Master Developer',
                    description: 'Reach level 50',
                    icon: '👑',
                    xp: 1000,
                    requirements: {
                        level: 50
                    }
                }
            ]
        }
    }
};