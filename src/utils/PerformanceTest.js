// Performance Tests for Optimized Utils
window.PerformanceTest = {
    // Test results storage
    results: {},
    
    // Run all performance tests
    runAllTests() {
        console.log('🚀 Starting Performance Tests...');
        
        this.testFormatUtils();
        this.testMathUtils();
        this.testCacheEfficiency();
        this.testMemoryUsage();
        this.generateReport();
        
        console.log('✅ All performance tests completed!');
        return this.results;
    },
    
    // Test FormatUtils performance
    testFormatUtils() {
        console.log('📊 Testing FormatUtils performance...');
        
        const iterations = 100000;
        const testNumbers = [
            123, 1234, 12345, 123456, 1234567, 12345678, 123456789,
            1234567890, 12345678901, 123456789012, 1234567890123
        ];
        
        // Test formatNumber performance
        const formatNumberTime = MathUtils.benchmark(() => {
            const num = testNumbers[Math.floor(Math.random() * testNumbers.length)];
            FormatUtils.formatNumber(num);
        }, iterations);
        
        // Test formatRate performance
        const formatRateTime = MathUtils.benchmark(() => {
            const num = testNumbers[Math.floor(Math.random() * testNumbers.length)];
            FormatUtils.formatRate(num);
        }, iterations);
        
        // Test formatTime performance
        const formatTimeTime = MathUtils.benchmark(() => {
            const seconds = Math.random() * 100000;
            FormatUtils.formatTime(seconds);
        }, iterations);
        
        // Test cache efficiency
        const cacheStats = FormatUtils.getStats();
        
        this.results.formatUtils = {
            formatNumber: formatNumberTime,
            formatRate: formatRateTime,
            formatTime: formatTimeTime,
            cacheStats: cacheStats
        };
        
        console.log('📊 FormatUtils Results:', this.results.formatUtils);
    },
    
    // Test MathUtils performance
    testMathUtils() {
        console.log('🧮 Testing MathUtils performance...');
        
        const iterations = 100000;
        
        // Test basic math operations
        const lerpTime = MathUtils.benchmark(() => {
            MathUtils.lerp(0, 100, Math.random());
        }, iterations);
        
        const clampTime = MathUtils.benchmark(() => {
            MathUtils.clamp(Math.random() * 200 - 100, 0, 100);
        }, iterations);
        
        const distanceTime = MathUtils.benchmark(() => {
            MathUtils.distance(0, 0, Math.random() * 100, Math.random() * 100);
        }, iterations);
        
        // Test fast versions
        const fastLerpTime = MathUtils.benchmark(() => {
            MathUtils.fastLerp(0, 100, Math.random());
        }, iterations);
        
        const fastRandomTime = MathUtils.benchmark(() => {
            MathUtils.fastRandom();
        }, iterations);
        
        const mathRandomTime = MathUtils.benchmark(() => {
            Math.random();
        }, iterations);
        
        // Test vector operations
        const vec2Time = MathUtils.benchmark(() => {
            const a = MathUtils.vec2.create(Math.random(), Math.random());
            const b = MathUtils.vec2.create(Math.random(), Math.random());
            MathUtils.vec2.add(a, b);
        }, iterations);
        
        this.results.mathUtils = {
            lerp: lerpTime,
            fastLerp: fastLerpTime,
            clamp: clampTime,
            distance: distanceTime,
            fastRandom: fastRandomTime,
            mathRandom: mathRandomTime,
            vec2Operations: vec2Time,
            speedupRatio: {
                lerp: lerpTime / fastLerpTime,
                random: mathRandomTime / fastRandomTime
            }
        };
        
        console.log('🧮 MathUtils Results:', this.results.mathUtils);
    },
    
    // Test cache efficiency
    testCacheEfficiency() {
        console.log('💾 Testing cache efficiency...');
        
        // Reset cache stats
        FormatUtils.resetStats();
        
        // Test with repeated values (should hit cache)
        const testValues = [1234, 5678, 9012, 3456, 7890];
        
        for (let i = 0; i < 10000; i++) {
            const value = testValues[i % testValues.length];
            FormatUtils.formatNumber(value);
            FormatUtils.formatRate(value);
            FormatUtils.formatWithCommas(value);
        }
        
        const cacheStats = FormatUtils.getStats();
        
        this.results.cacheEfficiency = {
            hitRate: cacheStats.hitRate,
            totalCalls: cacheStats.calls,
            cacheHits: cacheStats.cacheHits,
            cacheMisses: cacheStats.cacheMisses,
            cacheSize: cacheStats.cacheSize
        };
        
        console.log('💾 Cache Efficiency Results:', this.results.cacheEfficiency);
    },
    
    // Test memory usage
    testMemoryUsage() {
        console.log('🧠 Testing memory usage...');
        
        // Test memory usage before operations
        const beforeMemory = this.getMemoryUsage();
        
        // Perform intensive operations
        for (let i = 0; i < 50000; i++) {
            const num = Math.random() * 1000000000;
            FormatUtils.formatNumber(num);
            FormatUtils.formatRate(num);
            FormatUtils.formatTime(Math.random() * 86400);
            
            MathUtils.lerp(0, 100, Math.random());
            MathUtils.distance(0, 0, Math.random() * 100, Math.random() * 100);
            MathUtils.fastRandom();
        }
        
        // Test memory usage after operations
        const afterMemory = this.getMemoryUsage();
        
        this.results.memoryUsage = {
            before: beforeMemory,
            after: afterMemory,
            difference: afterMemory - beforeMemory,
            cacheSize: FormatUtils.getStats().cacheSize
        };
        
        console.log('🧠 Memory Usage Results:', this.results.memoryUsage);
    },
    
    // Get memory usage (approximate)
    getMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        return 0;
    },
    
    // Generate comprehensive report
    generateReport() {
        console.log('\n📈 PERFORMANCE OPTIMIZATION REPORT');
        console.log('=====================================');
        
        if (this.results.formatUtils) {
            console.log('\n📊 FormatUtils Performance:');
            console.log(`  formatNumber: ${this.results.formatUtils.formatNumber.toFixed(4)}ms avg`);
            console.log(`  formatRate: ${this.results.formatUtils.formatRate.toFixed(4)}ms avg`);
            console.log(`  formatTime: ${this.results.formatUtils.formatTime.toFixed(4)}ms avg`);
            console.log(`  Cache Hit Rate: ${this.results.formatUtils.cacheStats.hitRate.toFixed(1)}%`);
        }
        
        if (this.results.mathUtils) {
            console.log('\n🧮 MathUtils Performance:');
            console.log(`  Standard lerp: ${this.results.mathUtils.lerp.toFixed(4)}ms avg`);
            console.log(`  Fast lerp: ${this.results.mathUtils.fastLerp.toFixed(4)}ms avg`);
            console.log(`  Lerp speedup: ${this.results.mathUtils.speedupRatio.lerp.toFixed(2)}x`);
            console.log(`  Math.random(): ${this.results.mathUtils.mathRandom.toFixed(4)}ms avg`);
            console.log(`  Fast random: ${this.results.mathUtils.fastRandom.toFixed(4)}ms avg`);
            console.log(`  Random speedup: ${this.results.mathUtils.speedupRatio.random.toFixed(2)}x`);
        }
        
        if (this.results.cacheEfficiency) {
            console.log('\n💾 Cache Efficiency:');
            console.log(`  Hit Rate: ${this.results.cacheEfficiency.hitRate.toFixed(1)}%`);
            console.log(`  Total Calls: ${this.results.cacheEfficiency.totalCalls}`);
            console.log(`  Cache Size: ${this.results.cacheEfficiency.cacheSize} entries`);
        }
        
        if (this.results.memoryUsage) {
            console.log('\n🧠 Memory Usage:');
            console.log(`  Before: ${this.results.memoryUsage.before.toFixed(2)} MB`);
            console.log(`  After: ${this.results.memoryUsage.after.toFixed(2)} MB`);
            console.log(`  Difference: ${this.results.memoryUsage.difference.toFixed(2)} MB`);
        }
        
        console.log('\n✅ OPTIMIZATION SUMMARY:');
        console.log('- Added comprehensive caching system');
        console.log('- Optimized string operations');
        console.log('- Pre-calculated constants');
        console.log('- Fast math approximations');
        console.log('- Enhanced vector operations');
        console.log('- Color utilities');
        console.log('- Noise functions');
        console.log('- Performance monitoring');
        console.log('=====================================\n');
    },
    
    // Test specific game scenarios
    testGameScenarios() {
        console.log('🎮 Testing game-specific scenarios...');
        
        // Simulate UI updates
        const uiUpdateTime = MathUtils.benchmark(() => {
            const energy = Math.random() * 1000000000;
            const rate = Math.random() * 1000000;
            const crystals = Math.random() * 100000;
            
            FormatUtils.formatNumber(energy);
            FormatUtils.formatRate(rate);
            FormatUtils.formatNumber(crystals);
            FormatUtils.formatPercent(Math.random());
        }, 10000);
        
        // Simulate click calculations
        const clickTime = MathUtils.benchmark(() => {
            const x = Math.random() * 1920;
            const y = Math.random() * 1080;
            const clickPower = Math.random() * 10000;
            
            MathUtils.randomInt(1, 10);
            FormatUtils.formatNumber(clickPower);
            MathUtils.distance(x, y, 960, 540);
        }, 10000);
        
        // Simulate animation calculations
        const animationTime = MathUtils.benchmark(() => {
            const progress = Math.random();
            MathUtils.smoothStep(0, 1, progress);
            MathUtils.easeOutBounce(progress);
            MathUtils.lerp(0, 100, progress);
        }, 10000);
        
        console.log('🎮 Game Scenario Results:');
        console.log(`  UI Updates: ${uiUpdateTime.toFixed(4)}ms avg`);
        console.log(`  Click Processing: ${clickTime.toFixed(4)}ms avg`);
        console.log(`  Animation Calculations: ${animationTime.toFixed(4)}ms avg`);
        
        return {
            uiUpdates: uiUpdateTime,
            clickProcessing: clickTime,
            animationCalculations: animationTime
        };
    },
    
    // Clear all test results
    clearResults() {
        this.results = {};
        FormatUtils.resetStats();
        MathUtils.resetStats();
        console.log('🧹 Test results cleared');
    }
};

// Auto-run basic test when loaded
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.FormatUtils && window.MathUtils) {
            console.log('🎯 Utils loaded - ready for performance testing!');
            console.log('💡 Run PerformanceTest.runAllTests() to see optimization results');
        }
    }, 1000);
});