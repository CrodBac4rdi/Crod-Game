// Layout Components Module
window.Layout = (() => {
    const Container = ({ children, className = '' }) => {
        return React.createElement('div', { 
            className: `container ${className}` 
        }, children);
    };
    
    const Grid = ({ children, columns = 2, gap = '1rem', className = '' }) => {
        return React.createElement('div', { 
            className: `grid ${className}`,
            style: {
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap
            }
        }, children);
    };
    
    const Card = ({ children, title, icon, className = '' }) => {
        return React.createElement('div', { className: `card ${className}` },
            title && React.createElement('div', { className: 'card-header' },
                icon && React.createElement('span', { className: 'card-icon' }, icon),
                React.createElement('h3', { className: 'card-title' }, title)
            ),
            React.createElement('div', { className: 'card-body' }, children)
        );
    };
    
    return { Container, Grid, Card };
})();