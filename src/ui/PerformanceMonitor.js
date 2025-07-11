// Performance Monitor UI Component
window.PerformanceMonitor = class PerformanceMonitor {
    constructor(eventSystem) {
        this.eventSystem = eventSystem;
        
        // Performance metrics
        this.metrics = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0,
            domNodes: 0,
            renderTime: 0,
            eventListeners: 0,
            animations: 0
        };
        
        // UI elements
        this.isVisible = false;
        this.container = null;
        this.overlay = null;
        
        // Performance tracking
        this.frameCount = 0;
        this.lastFrameTime = 0;
        this.fpsHistory = [];
        this.maxHistoryLength = 60;
        
        // Memory tracking
        this.memoryHistory = [];
        this.performanceObserver = null;
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.setupPerformanceObserver();
        this.startMonitoring();
        
        // Toggle with F1 key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                this.toggle();
            }
        });
    }
    
    createUI() {
        // Create container
        this.container = document.createElement('div');
        this.container.id = 'performance-monitor';
        this.container.className = 'performance-monitor';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            background: rgba(10, 10, 15, 0.95);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: var(--spacing-md);
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: var(--text-primary);
            backdrop-filter: blur(10px);
            z-index: 9999;
            display: none;
            contain: layout style;
            transform: translateZ(0);
        `;
        
        // Create overlay for graph
        this.overlay = document.createElement('div');
        this.overlay.className = 'performance-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
            display: none;
        `;
        
        document.body.appendChild(this.container);
        document.body.appendChild(this.overlay);
        
        this.updateUI();
    }
    
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            this.performanceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'measure') {
                        this.metrics.renderTime = entry.duration;
                    }
                });
            });
            
            this.performanceObserver.observe({
                entryTypes: ['measure', 'navigation', 'resource']
            });
        }
    }
    
    startMonitoring() {
        let lastTime = performance.now();
        
        const monitor = (currentTime) => {
            // Calculate FPS
            const deltaTime = currentTime - lastTime;
            this.metrics.frameTime = deltaTime;
            this.metrics.fps = 1000 / deltaTime;
            
            // Store FPS history
            this.fpsHistory.push(this.metrics.fps);
            if (this.fpsHistory.length > this.maxHistoryLength) {
                this.fpsHistory.shift();
            }
            
            // Update memory usage
            if (performance.memory) {
                this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
                this.memoryHistory.push(this.metrics.memoryUsage);
                if (this.memoryHistory.length > this.maxHistoryLength) {
                    this.memoryHistory.shift();
                }
            }
            
            // Count DOM nodes
            this.metrics.domNodes = document.querySelectorAll('*').length;
            
            // Count active animations
            this.metrics.animations = document.getAnimations().length;
            
            // Update UI if visible
            if (this.isVisible) {
                this.updateUI();
                this.drawGraphs();
            }
            
            lastTime = currentTime;
            requestAnimationFrame(monitor);
        };
        
        requestAnimationFrame(monitor);
    }
    
    updateUI() {
        if (!this.container) return;
        
        const avgFps = this.fpsHistory.length > 0 ? 
            this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length : 0;
        
        const minFps = Math.min(...this.fpsHistory);
        const maxFps = Math.max(...this.fpsHistory);
        
        this.container.innerHTML = `
            <div class="performance-header">
                <strong>🚀 Performance Monitor</strong>
                <span style="float: right; font-size: 10px;">F1 to toggle</span>
            </div>
            <div class="performance-metrics">
                <div class="metric">
                    <span class="metric-label">FPS:</span>
                    <span class="metric-value ${this.getFpsColor(this.metrics.fps)}">${Math.round(this.metrics.fps)}</span>
                    <span class="metric-detail">(${Math.round(minFps)}-${Math.round(maxFps)})</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Frame Time:</span>
                    <span class="metric-value">${this.metrics.frameTime.toFixed(2)}ms</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Memory:</span>
                    <span class="metric-value">${this.metrics.memoryUsage.toFixed(2)}MB</span>
                </div>
                <div class="metric">
                    <span class="metric-label">DOM Nodes:</span>
                    <span class="metric-value">${this.metrics.domNodes}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Animations:</span>
                    <span class="metric-value">${this.metrics.animations}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Render Time:</span>
                    <span class="metric-value">${this.metrics.renderTime.toFixed(2)}ms</span>
                </div>
            </div>
            <div class="performance-graphs">
                <canvas id="fps-graph" width="280" height="60"></canvas>
                <canvas id="memory-graph" width="280" height="60"></canvas>
            </div>
            <div class="performance-controls">
                <button onclick="window.performanceMonitor.clearHistory()">Clear History</button>
                <button onclick="window.performanceMonitor.exportData()">Export Data</button>
                <button onclick="window.performanceMonitor.runBenchmark()">Run Benchmark</button>
            </div>
        `;
        
        // Add CSS for metrics
        const style = document.createElement('style');
        style.textContent = `
            .performance-header {
                margin-bottom: 10px;
                padding-bottom: 5px;
                border-bottom: 1px solid var(--border-color);
            }
            .metric {
                display: flex;
                justify-content: space-between;
                margin: 3px 0;
            }
            .metric-label {
                color: var(--text-secondary);
            }
            .metric-value {
                font-weight: bold;
            }
            .metric-detail {
                color: var(--text-dim);
                font-size: 10px;
            }
            .fps-good { color: var(--color-success); }
            .fps-okay { color: var(--color-accent); }
            .fps-bad { color: var(--color-error); }
            .performance-graphs {
                margin: 10px 0;
            }
            .performance-controls {
                margin-top: 10px;
                display: flex;
                gap: 5px;
            }
            .performance-controls button {
                flex: 1;
                padding: 5px;
                font-size: 10px;
                background: var(--bg-tertiary);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-sm);
                color: var(--text-primary);
                cursor: pointer;
            }
            .performance-controls button:hover {
                background: var(--bg-secondary);
            }
        `;
        
        if (!document.getElementById('performance-monitor-style')) {
            style.id = 'performance-monitor-style';
            document.head.appendChild(style);
        }
    }
    
    drawGraphs() {
        // Draw FPS graph
        const fpsCanvas = document.getElementById('fps-graph');
        const memoryCanvas = document.getElementById('memory-graph');
        
        if (fpsCanvas && memoryCanvas) {
            this.drawGraph(fpsCanvas, this.fpsHistory, 'FPS', 0, 120, '#00ff88');
            this.drawGraph(memoryCanvas, this.memoryHistory, 'Memory (MB)', 0, 
                Math.max(...this.memoryHistory) * 1.2, '#00d4ff');
        }
    }
    
    drawGraph(canvas, data, label, min, max, color) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, width, height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw data
        if (data.length > 1) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            data.forEach((value, index) => {
                const x = (index / (data.length - 1)) * width;
                const y = height - ((value - min) / (max - min)) * height;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        }
        
        // Draw label
        ctx.fillStyle = 'white';
        ctx.font = '10px monospace';
        ctx.fillText(label, 5, 15);
        
        // Draw current value
        const currentValue = data[data.length - 1];
        if (currentValue !== undefined) {
            ctx.fillText(currentValue.toFixed(1), width - 40, 15);
        }
    }
    
    getFpsColor(fps) {
        if (fps >= 55) return 'fps-good';
        if (fps >= 30) return 'fps-okay';
        return 'fps-bad';
    }
    
    toggle() {
        this.isVisible = !this.isVisible;
        this.container.style.display = this.isVisible ? 'block' : 'none';
        this.overlay.style.display = this.isVisible ? 'block' : 'none';
    }
    
    clearHistory() {
        this.fpsHistory = [];
        this.memoryHistory = [];
    }
    
    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            metrics: this.metrics,
            fpsHistory: this.fpsHistory,
            memoryHistory: this.memoryHistory
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    runBenchmark() {
        // Simple benchmark test
        const start = performance.now();
        let operations = 0;
        
        // Run intensive operations
        for (let i = 0; i < 1000000; i++) {
            Math.random() * Math.random();
            operations++;
        }
        
        const duration = performance.now() - start;
        const opsPerSecond = operations / (duration / 1000);
        
        // Show results
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10, 10, 15, 0.95);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 20px;
            color: var(--text-primary);
            font-family: monospace;
            z-index: 10000;
            backdrop-filter: blur(10px);
        `;
        
        notification.innerHTML = `
            <h3>Benchmark Results</h3>
            <p>Operations: ${operations.toLocaleString()}</p>
            <p>Duration: ${duration.toFixed(2)}ms</p>
            <p>Ops/sec: ${opsPerSecond.toFixed(0)}</p>
            <button onclick="this.parentElement.remove()">Close</button>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
    
    destroy() {
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
        
        if (this.container) {
            this.container.remove();
        }
        
        if (this.overlay) {
            this.overlay.remove();
        }
    }
};

// Make it globally available
window.performanceMonitor = new PerformanceMonitor(window.eventSystem);