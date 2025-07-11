// Terminal Component Module
window.Terminal = (() => {
    const Terminal = ({ output = [], onCommand }) => {
        const [input, setInput] = React.useState('');
        const terminalRef = React.useRef(null);
        
        const handleSubmit = (e) => {
            e.preventDefault();
            if (input.trim() && onCommand) {
                onCommand(input);
                setInput('');
            }
        };
        
        React.useEffect(() => {
            if (terminalRef.current) {
                terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
            }
        }, [output]);
        
        return React.createElement('div', { className: 'terminal' },
            React.createElement('div', { 
                className: 'terminal-output',
                ref: terminalRef
            },
                output.map((line, i) => 
                    React.createElement('div', { 
                        key: i,
                        className: `terminal-line ${line.type || ''}`
                    }, line.text)
                )
            ),
            React.createElement('form', { 
                className: 'terminal-input',
                onSubmit: handleSubmit
            },
                React.createElement('span', { className: 'terminal-prompt' }, '$'),
                React.createElement('input', {
                    type: 'text',
                    value: input,
                    onChange: (e) => setInput(e.target.value),
                    className: 'terminal-input-field',
                    placeholder: 'Type command...'
                })
            )
        );
    };
    
    return Terminal;
})();