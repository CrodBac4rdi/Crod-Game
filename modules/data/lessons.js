// Lessons Data Module
window.LessonsData = {
    // JavaScript Lessons
    javascript: [
        {
            id: 'js-basics',
            title: 'JavaScript Basics',
            description: 'Learn variables, data types, and basic operations',
            difficulty: 'beginner',
            xp: 50,
            duration: 15,
            topics: ['Variables', 'Data Types', 'Operators', 'Console'],
            tasks: [
                {
                    id: 'js-hello',
                    title: 'Hello JavaScript',
                    description: 'Write your first JavaScript code',
                    instructions: 'Use console.log() to print "Hello, World!"',
                    starterCode: '// Write your code here\n',
                    solution: 'console.log("Hello, World!");',
                    tests: [
                        {
                            description: 'Should print Hello, World!',
                            test: (output) => output.includes('Hello, World!')
                        }
                    ]
                },
                {
                    id: 'js-variables',
                    title: 'Variables and Constants',
                    description: 'Learn about let, const, and var',
                    instructions: 'Create a constant PI with value 3.14159 and a variable radius with value 5',
                    starterCode: '// Define PI and radius\n',
                    solution: 'const PI = 3.14159;\nlet radius = 5;',
                    tests: [
                        {
                            description: 'PI should be defined as const',
                            test: (code) => code.includes('const PI')
                        },
                        {
                            description: 'radius should be defined with let',
                            test: (code) => code.includes('let radius')
                        }
                    ]
                }
            ]
        },
        {
            id: 'js-functions',
            title: 'Functions',
            description: 'Master function declarations and arrow functions',
            difficulty: 'beginner',
            xp: 75,
            duration: 20,
            topics: ['Function Declaration', 'Arrow Functions', 'Parameters', 'Return'],
            tasks: [
                {
                    id: 'js-function-basic',
                    title: 'Create a Function',
                    description: 'Write a function that adds two numbers',
                    instructions: 'Create a function called add that takes two parameters and returns their sum',
                    starterCode: '// Create your add function\n',
                    solution: 'function add(a, b) {\n  return a + b;\n}',
                    tests: [
                        {
                            description: 'add(2, 3) should return 5',
                            test: (code, context) => context.add && context.add(2, 3) === 5
                        },
                        {
                            description: 'add(10, 20) should return 30',
                            test: (code, context) => context.add && context.add(10, 20) === 30
                        }
                    ]
                }
            ]
        },
        {
            id: 'js-arrays',
            title: 'Arrays and Array Methods',
            description: 'Work with arrays and their powerful methods',
            difficulty: 'intermediate',
            xp: 100,
            duration: 25,
            topics: ['Arrays', 'map', 'filter', 'reduce', 'forEach'],
            tasks: [
                {
                    id: 'js-array-filter',
                    title: 'Filter Array',
                    description: 'Filter an array to get only even numbers',
                    instructions: 'Use the filter method to get only even numbers from the numbers array',
                    starterCode: 'const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\n// Filter even numbers\n',
                    solution: 'const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\nconst evens = numbers.filter(n => n % 2 === 0);',
                    tests: [
                        {
                            description: 'Should use filter method',
                            test: (code) => code.includes('.filter')
                        },
                        {
                            description: 'Should return [2, 4, 6, 8, 10]',
                            test: (code, context) => context.evens && JSON.stringify(context.evens) === '[2,4,6,8,10]'
                        }
                    ]
                }
            ]
        }
    ],
    
    // React Lessons
    react: [
        {
            id: 'react-basics',
            title: 'React Fundamentals',
            description: 'Learn components, JSX, and props',
            difficulty: 'intermediate',
            xp: 100,
            duration: 30,
            topics: ['Components', 'JSX', 'Props', 'State'],
            tasks: [
                {
                    id: 'react-component',
                    title: 'First Component',
                    description: 'Create your first React component',
                    instructions: 'Create a functional component called Greeting that displays "Hello, React!"',
                    starterCode: '// Create a Greeting component\n',
                    solution: 'function Greeting() {\n  return <h1>Hello, React!</h1>;\n}',
                    tests: [
                        {
                            description: 'Should be a function component',
                            test: (code) => code.includes('function Greeting') || code.includes('const Greeting')
                        },
                        {
                            description: 'Should return JSX',
                            test: (code) => code.includes('return') && (code.includes('<h1>') || code.includes('<div>'))
                        }
                    ]
                }
            ]
        },
        {
            id: 'react-hooks',
            title: 'React Hooks',
            description: 'Master useState, useEffect, and custom hooks',
            difficulty: 'intermediate',
            xp: 150,
            duration: 40,
            topics: ['useState', 'useEffect', 'Custom Hooks', 'Rules of Hooks'],
            tasks: [
                {
                    id: 'react-usestate',
                    title: 'Counter with useState',
                    description: 'Create a counter component using useState',
                    instructions: 'Create a Counter component with increment and decrement buttons',
                    starterCode: 'import { useState } from "react";\n\n// Create Counter component\n',
                    solution: `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  );
}`,
                    tests: [
                        {
                            description: 'Should use useState hook',
                            test: (code) => code.includes('useState')
                        },
                        {
                            description: 'Should have increment and decrement buttons',
                            test: (code) => code.includes('onClick') && code.includes('+') && code.includes('-')
                        }
                    ]
                }
            ]
        }
    ],
    
    // SQL Lessons
    sql: [
        {
            id: 'sql-basics',
            title: 'SQL Fundamentals',
            description: 'Learn SELECT, WHERE, and basic queries',
            difficulty: 'beginner',
            xp: 75,
            duration: 20,
            topics: ['SELECT', 'WHERE', 'ORDER BY', 'LIMIT'],
            tasks: [
                {
                    id: 'sql-select',
                    title: 'Basic SELECT',
                    description: 'Select all users from the users table',
                    instructions: 'Write a query to select all columns from the users table',
                    starterCode: '-- Select all users\n',
                    solution: 'SELECT * FROM users;',
                    tests: [
                        {
                            description: 'Should use SELECT statement',
                            test: (code) => code.toUpperCase().includes('SELECT')
                        },
                        {
                            description: 'Should select from users table',
                            test: (code) => code.toLowerCase().includes('from users')
                        }
                    ]
                }
            ]
        },
        {
            id: 'sql-joins',
            title: 'SQL Joins',
            description: 'Master INNER, LEFT, and RIGHT joins',
            difficulty: 'intermediate',
            xp: 150,
            duration: 35,
            topics: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'JOIN conditions'],
            tasks: [
                {
                    id: 'sql-inner-join',
                    title: 'Inner Join',
                    description: 'Join users and orders tables',
                    instructions: 'Write a query to get user names and their order totals',
                    starterCode: '-- Join users and orders\n',
                    solution: `SELECT users.name, orders.total 
FROM users 
INNER JOIN orders ON users.id = orders.user_id;`,
                    tests: [
                        {
                            description: 'Should use JOIN',
                            test: (code) => code.toUpperCase().includes('JOIN')
                        },
                        {
                            description: 'Should join on user_id',
                            test: (code) => code.includes('user_id')
                        }
                    ]
                }
            ]
        }
    ],
    
    // Python Lessons
    python: [
        {
            id: 'python-basics',
            title: 'Python Fundamentals',
            description: 'Learn Python syntax and data structures',
            difficulty: 'beginner',
            xp: 75,
            duration: 25,
            topics: ['Variables', 'Lists', 'Dictionaries', 'Functions'],
            tasks: [
                {
                    id: 'python-hello',
                    title: 'Hello Python',
                    description: 'Write your first Python program',
                    instructions: 'Print "Hello, Python!" to the console',
                    starterCode: '# Write your code here\n',
                    solution: 'print("Hello, Python!")',
                    tests: [
                        {
                            description: 'Should use print function',
                            test: (code) => code.includes('print')
                        }
                    ]
                }
            ]
        }
    ],
    
    // Git Lessons
    git: [
        {
            id: 'git-basics',
            title: 'Git Fundamentals',
            description: 'Learn version control with Git',
            difficulty: 'beginner',
            xp: 50,
            duration: 20,
            topics: ['init', 'add', 'commit', 'push'],
            tasks: [
                {
                    id: 'git-init',
                    title: 'Initialize Repository',
                    description: 'Create a new Git repository',
                    instructions: 'Initialize a new Git repository in the current directory',
                    starterCode: '# Initialize git repo\n',
                    solution: 'git init',
                    tests: [
                        {
                            description: 'Should use git init',
                            test: (code) => code.includes('git init')
                        }
                    ]
                }
            ]
        }
    ]
};