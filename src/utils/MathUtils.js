// Math Utilities - Performance Optimized
window.MathUtils = {
    // Pre-calculated constants for performance
    PI: Math.PI,
    TAU: Math.PI * 2,
    PI_2: Math.PI / 2,
    PI_4: Math.PI / 4,
    DEG_TO_RAD: Math.PI / 180,
    RAD_TO_DEG: 180 / Math.PI,
    SQRT2: Math.sqrt(2),
    SQRT3: Math.sqrt(3),
    GOLDEN_RATIO: (1 + Math.sqrt(5)) / 2,
    
    // Fast random number generator (LCG)
    _seed: Date.now() & 0xffffffff,
    
    // Fast random using LCG (faster than Math.random for lots of calls)
    fastRandom() {
        this._seed = (this._seed * 1664525 + 1013904223) & 0xffffffff;
        return (this._seed >>> 0) / 0x100000000;
    },
    
    // Seed the fast random
    setSeed(seed) {
        this._seed = seed & 0xffffffff;
    },
    
    // Optimized lerp between two values
    lerp(a, b, t) {
        return a + (b - a) * t;
    },
    
    // Fast lerp using bit operations for clamping
    fastLerp(a, b, t) {
        t = t > 1 ? 1 : t < 0 ? 0 : t; // Branchless clamp
        return a + (b - a) * t;
    },
    
    // Clamp value between min and max - OPTIMIZED
    clamp(value, min, max) {
        return value > max ? max : value < min ? min : value;
    },
    
    // Clamp to 0-1 range (very common)
    clamp01(value) {
        return value > 1 ? 1 : value < 0 ? 0 : value;
    },
    
    // Random between min and max - OPTIMIZED
    random(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    // Fast random between min and max
    fastRandomRange(min, max) {
        return this.fastRandom() * (max - min) + min;
    },
    
    // Random integer between min and max (inclusive) - OPTIMIZED
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Fast random integer
    fastRandomInt(min, max) {
        return Math.floor(this.fastRandom() * (max - min + 1)) + min;
    },
    
    // Distance between two points - OPTIMIZED
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    // Fast distance squared (no sqrt for comparisons)
    distanceSq(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    },
    
    // Manhattan distance (faster than euclidean)
    manhattanDistance(x1, y1, x2, y2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    },
    
    // Angle between two points - OPTIMIZED
    angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },
    
    // Fast angle approximation (less precise but faster)
    fastAngle(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        if (dx === 0 && dy === 0) return 0;
        
        const ax = Math.abs(dx);
        const ay = Math.abs(dy);
        const a = Math.min(ax, ay) / Math.max(ax, ay);
        const s = a * a;
        let r = ((-0.0464964749 * s + 0.15931422) * s - 0.327622764) * s * a + a;
        
        if (ay > ax) r = 1.5707963267948966 - r;
        if (dx < 0) r = 3.141592653589793 - r;
        if (dy < 0) r = -r;
        
        return r;
    },
    
    // Convert degrees to radians - OPTIMIZED
    degToRad(degrees) {
        return degrees * this.DEG_TO_RAD;
    },
    
    // Convert radians to degrees - OPTIMIZED
    radToDeg(radians) {
        return radians * this.RAD_TO_DEG;
    },
    
    // Smooth step function - OPTIMIZED
    smoothStep(edge0, edge1, x) {
        x = this.clamp01((x - edge0) / (edge1 - edge0));
        return x * x * (3 - 2 * x);
    },
    
    // Smoother step (5th order)
    smootherStep(edge0, edge1, x) {
        x = this.clamp01((x - edge0) / (edge1 - edge0));
        return x * x * x * (x * (x * 6 - 15) + 10);
    },
    
    // Exponential ease out - OPTIMIZED
    easeOutExpo(x) {
        return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    },
    
    // Fast exponential approximation
    fastEaseOutExpo(x) {
        return x === 1 ? 1 : 1 - (1 / (1 + 10 * x));
    },
    
    // Bounce ease out - OPTIMIZED with pre-calculated constants
    easeOutBounce(x) {
        const n1 = 7.5625;
        const d1 = 2.75;
        
        if (x < 0.36363636) { // 1/2.75
            return n1 * x * x;
        } else if (x < 0.72727272) { // 2/2.75
            return n1 * (x -= 0.54545454) * x + 0.75; // 1.5/2.75
        } else if (x < 0.90909090) { // 2.5/2.75
            return n1 * (x -= 0.81818181) * x + 0.9375; // 2.25/2.75
        } else {
            return n1 * (x -= 0.95454545) * x + 0.984375; // 2.625/2.75
        }
    },
    
    // Elastic ease out - OPTIMIZED
    easeOutElastic(x) {
        const c4 = 2.0943951023931953; // (2 * Math.PI) / 3
        
        return x === 0 ? 0 : x === 1 ? 1 : 
            Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    },
    
    // Calculate logarithmic scale - OPTIMIZED
    logScale(value, base = 10) {
        return Math.log(value + 1) / Math.log(base);
    },
    
    // NEW: Fast square root approximation
    fastSqrt(x) {
        if (x < 0) return NaN;
        if (x === 0) return 0;
        
        // Fast inverse square root (Quake III algorithm)
        let i = new Float32Array(1);
        let j = new Int32Array(i.buffer);
        i[0] = x;
        j[0] = 0x5f3759df - (j[0] >> 1);
        return x * i[0] * (1.5 - 0.5 * x * i[0] * i[0]);
    },
    
    // NEW: Fast power function for integer exponents
    fastPow(base, exp) {
        if (exp === 0) return 1;
        if (exp === 1) return base;
        if (exp === 2) return base * base;
        if (exp === 3) return base * base * base;
        if (exp === 4) return base * base * base * base;
        
        // For other exponents, use traditional method
        return Math.pow(base, exp);
    },
    
    // NEW: Vector2 utilities
    vec2: {
        create: (x = 0, y = 0) => ({ x, y }),
        add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y }),
        subtract: (a, b) => ({ x: a.x - b.x, y: a.y - b.y }),
        multiply: (a, scalar) => ({ x: a.x * scalar, y: a.y * scalar }),
        divide: (a, scalar) => ({ x: a.x / scalar, y: a.y / scalar }),
        dot: (a, b) => a.x * b.x + a.y * b.y,
        length: (a) => Math.sqrt(a.x * a.x + a.y * a.y),
        lengthSq: (a) => a.x * a.x + a.y * a.y,
        normalize: (a) => {
            const len = Math.sqrt(a.x * a.x + a.y * a.y);
            return len > 0 ? { x: a.x / len, y: a.y / len } : { x: 0, y: 0 };
        },
        distance: (a, b) => {
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            return Math.sqrt(dx * dx + dy * dy);
        },
        distanceSq: (a, b) => {
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            return dx * dx + dy * dy;
        }
    },
    
    // NEW: Color utilities
    color: {
        // Convert RGB to HSV
        rgbToHsv: (r, g, b) => {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const diff = max - min;
            
            let h = 0;
            const s = max === 0 ? 0 : diff / max;
            const v = max;
            
            if (diff !== 0) {
                if (max === r) h = ((g - b) / diff) % 6;
                else if (max === g) h = (b - r) / diff + 2;
                else h = (r - g) / diff + 4;
            }
            
            return { h: h * 60, s: s * 100, v: v * 100 };
        },
        
        // Convert HSV to RGB
        hsvToRgb: (h, s, v) => {
            h /= 60; s /= 100; v /= 100;
            const c = v * s;
            const x = c * (1 - Math.abs((h % 2) - 1));
            const m = v - c;
            
            let r, g, b;
            if (h < 1) [r, g, b] = [c, x, 0];
            else if (h < 2) [r, g, b] = [x, c, 0];
            else if (h < 3) [r, g, b] = [0, c, x];
            else if (h < 4) [r, g, b] = [0, x, c];
            else if (h < 5) [r, g, b] = [x, 0, c];
            else [r, g, b] = [c, 0, x];
            
            return {
                r: Math.round((r + m) * 255),
                g: Math.round((g + m) * 255),
                b: Math.round((b + m) * 255)
            };
        },
        
        // Interpolate between two colors
        lerp: (color1, color2, t) => {
            return {
                r: Math.round(color1.r + (color2.r - color1.r) * t),
                g: Math.round(color1.g + (color2.g - color1.g) * t),
                b: Math.round(color1.b + (color2.b - color1.b) * t)
            };
        }
    },
    
    // NEW: Noise functions
    noise: {
        // Simple 1D noise
        simple1D: (x) => {
            const intX = Math.floor(x);
            const fracX = x - intX;
            const a = MathUtils.fastRandom();
            const b = MathUtils.fastRandom();
            return MathUtils.lerp(a, b, fracX);
        },
        
        // Value noise (better quality)
        value1D: (x) => {
            const i = Math.floor(x);
            const f = x - i;
            const a = ((i * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
            const b = (((i + 1) * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
            return MathUtils.lerp(a, b, f * f * (3 - 2 * f));
        }
    },
    
    // Performance monitoring
    _perfCounters: {
        calls: 0,
        totalTime: 0,
        averageTime: 0
    },
    
    // Benchmark a function
    benchmark(func, iterations = 1000) {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            func();
        }
        const end = performance.now();
        return (end - start) / iterations;
    },
    
    // Get performance stats
    getStats() {
        return { ...this._perfCounters };
    },
    
    // Reset performance counters
    resetStats() {
        this._perfCounters.calls = 0;
        this._perfCounters.totalTime = 0;
        this._perfCounters.averageTime = 0;
    }
};