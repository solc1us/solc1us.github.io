function analyzeAlgorithm() {
    const n = parseInt(document.getElementById('diskCount').value);
    const errorBox = document.getElementById('errorBox');
    const loadingContainer = document.getElementById('loadingContainer');
    
    // Clear previous error
    errorBox.classList.remove('show');
    loadingContainer.classList.remove('show');

    // Validation
    if (!n || n < 1 || n > 30) {
        errorBox.textContent = '⚠️ Please enter a number between 1 and 30';
        errorBox.classList.add('show');
        return;
    }

    // Show loading animation
    loadingContainer.classList.add('show');
    document.getElementById('resultsSection').classList.add('show');

    // Use setTimeout to allow rendering of loading animation
    setTimeout(() => {
        try {
            // Run both algorithms
            const recursiveResult = measureRecursive(n);
            const iterativeResult = measureIterative(n);

            // Calculate total moves (2^n - 1)
            const totalMoves = Math.pow(2, n) - 1;

            // Display results
            displayResults(n, totalMoves, recursiveResult, iterativeResult);
        } catch (error) {
            errorBox.textContent = '❌ Error during analysis: ' + error.message;
            errorBox.classList.add('show');
        } finally {
            // Hide loading animation
            loadingContainer.classList.remove('show');
        }
    }, 100);
}

function measureRecursive(n) {
    // Run multiple iterations for more accurate timing
    const iterations = n <= 15 ? 100 : n <= 20 ? 10 : 1;
    let totalTime = 0;
    let finalMoveCount = 0;
    
    for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        const stacks = {
            A: Array.from({length: n}, (_, i) => n - i),
            B: [],
            C: []
        };
        
        let moveCount = 0;
        
        function hanoi(n, source, destination, auxiliary) {
            if (n === 1) {
                const disk = stacks[source].pop();
                stacks[destination].push(disk);
                moveCount++;
                return;
            }
            hanoi(n - 1, source, auxiliary, destination);
            
            const disk = stacks[source].pop();
            stacks[destination].push(disk);
            moveCount++;
            
            hanoi(n - 1, auxiliary, destination, source);
        }

        hanoi(n, 'A', 'C', 'B');
        
        const endTime = performance.now();
        totalTime += (endTime - startTime);
        finalMoveCount = moveCount;
    }
    
    return {
        time: totalTime / iterations,
        moves: finalMoveCount
    };
}

function measureIterative(n) {
    // Run multiple iterations for more accurate timing
    const iterations = n <= 15 ? 100 : n <= 20 ? 10 : 1;
    let totalTime = 0;
    const totalMoves = Math.pow(2, n) - 1;
    
    for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        const stacks = {
            A: Array.from({length: n}, (_, i) => n - i),
            B: [],
            C: []
        };

        let moveCount = 0;

        for (let j = 1; moveCount < totalMoves; j++) {
            const modulo = j % 3;
            let source, destination;

            if (modulo === 1) {
                source = 'A';
                destination = 'C';
            } else if (modulo === 2) {
                source = 'A';
                destination = 'B';
            } else {
                source = 'B';
                destination = 'C';
            }

            // Ensure proper disk movement (never place larger on smaller)
            if (stacks[destination].length === 0 || stacks[source][stacks[source].length - 1] < stacks[destination][stacks[destination].length - 1]) {
                const disk = stacks[source].pop();
                stacks[destination].push(disk);
            } else {
                const disk = stacks[destination].pop();
                stacks[source].push(disk);
            }

            moveCount++;
        }

        const endTime = performance.now();
        totalTime += (endTime - startTime);
    }
    
    return {
        time: totalTime / iterations,
        moves: totalMoves
    };
}

function displayResults(n, totalMoves, recursiveResult, iterativeResult) {
    // Format numbers with commas
    const formatNumber = (num) => {
        return num.toLocaleString();
    };

    // Format time with appropriate units
    const formatTime = (ms) => {
        if (ms < 1) {
            return (ms * 1000).toFixed(4) + ' µs';
        } else if (ms < 1000) {
            return ms.toFixed(4) + ' ms';
        } else {
            return (ms / 1000).toFixed(4) + ' s';
        }
    };

    // Update recursive results
    document.getElementById('recursiveMoves').textContent = formatNumber(totalMoves);
    document.getElementById('recursiveTime').textContent = formatTime(recursiveResult.time);

    // Update iterative results
    document.getElementById('iterativeMoves').textContent = formatNumber(totalMoves);
    document.getElementById('iterativeTime').textContent = formatTime(iterativeResult.time);

    // Determine faster algorithm
    const isFasterIterative = iterativeResult.time < recursiveResult.time;
    const fasterName = isFasterIterative ? 'Iterative' : 'Recursive';
    const timeDiff = Math.abs(recursiveResult.time - iterativeResult.time);
    const speedRatio = Math.max(recursiveResult.time, iterativeResult.time) / Math.min(recursiveResult.time, iterativeResult.time);

    document.getElementById('fasterAlgo').innerHTML = `${fasterName} <span class="faster-badge">✓ Faster</span>`;
    document.getElementById('timeDifference').textContent = formatTime(timeDiff);
    document.getElementById('speedRatio').textContent = `${speedRatio.toFixed(2)}x`;
}

// Allow Enter key to trigger analysis
document.getElementById('diskCount').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        analyzeAlgorithm();
    }
});

// Run initial analysis on page load
window.addEventListener('load', function() {
    analyzeAlgorithm();
});

// Automated testing function
async function runAutomatedTests() {
    const testLoading = document.getElementById('testLoading');
    const testProgress = document.getElementById('testProgress');
    const testResultsTable = document.getElementById('testResultsTable');
    
    testLoading.style.display = 'block';
    testResultsTable.innerHTML = '';
    
    const results = [];
    
    for (let n = 2; n <= 30; n++) {
        testProgress.textContent = `Testing n=${n}/30`;
        
        // Small delay to allow UI update
        await new Promise(resolve => setTimeout(resolve, 10));
        
        try {
            const recursiveResult = measureRecursive(n);
            const iterativeResult = measureIterative(n);
            
            results.push({
                n: n,
                moves: Math.pow(2, n) - 1,
                recursiveTime: recursiveResult.time,
                iterativeTime: iterativeResult.time,
                faster: recursiveResult.time < iterativeResult.time ? 'Recursive' : 'Iterative',
                ratio: (Math.max(recursiveResult.time, iterativeResult.time) / Math.min(recursiveResult.time, iterativeResult.time)).toFixed(2)
            });
        } catch (error) {
            console.error(`Error testing n=${n}:`, error);
        }
    }
    
    testLoading.style.display = 'none';
    displayTestResults(results);
}

function displayTestResults(results) {
    const testResultsTable = document.getElementById('testResultsTable');
    
    const formatTime = (ms) => {
        if (ms < 1) {
            return (ms * 1000).toFixed(4) + ' µs';
        } else if (ms < 1000) {
            return ms.toFixed(4) + ' ms';
        } else {
            return (ms / 1000).toFixed(4) + ' s';
        }
    };
    
    const formatNumber = (num) => {
        return num.toLocaleString();
    };
    
    let tableHTML = `
        <div class="test-results">
            <h4>Test Results (n=2 to n=30)</h4>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>n</th>
                        <th>Total Moves</th>
                        <th>Recursive Time</th>
                        <th>Iterative Time</th>
                        <th>Faster</th>
                        <th>Speed Ratio</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    results.forEach(result => {
        const fasterClass = result.faster === 'Recursive' ? 'faster-recursive' : 'faster-iterative';
        tableHTML += `
            <tr>
                <td>${result.n}</td>
                <td>${formatNumber(result.moves)}</td>
                <td class="${result.faster === 'Recursive' ? 'faster-cell' : ''}">${formatTime(result.recursiveTime)}</td>
                <td class="${result.faster === 'Iterative' ? 'faster-cell' : ''}">${formatTime(result.iterativeTime)}</td>
                <td class="${fasterClass}">${result.faster}</td>
                <td>${result.ratio}x</td>
            </tr>
        `;
    });
    
    tableHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    testResultsTable.innerHTML = tableHTML;
}
