import Graph from '/vertix/js/graph.js';

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const matrixSizeInput = document.getElementById('matrix-size');
    const generateMatrixBtn = document.getElementById('generate-matrix');
    const resetMatrixBtn = document.getElementById('reset-matrix');
    const loadExampleBtn = document.getElementById('load-example');
    const findPathsBtn = document.getElementById('find-paths');
    const matrixContainer = document.getElementById('matrix-container');
    const resultsContainer = document.getElementById('results-container');
    const graphCanvas = document.getElementById('graph-canvas');

    // Floyd-Warshall Controls
    const startFloydBtn = document.getElementById('start-floyd');
    const stepFloydBtn = document.getElementById('step-floyd');
    const restartFloydBtn = document.getElementById('restart-floyd');
    const animationSpeedInput = document.getElementById('animation-speed');
    const currentStepEl = document.getElementById('current-step');
    const currentKEl = document.getElementById('current-k');
    const currentPairEl = document.getElementById('current-pair');
    const shortestPathsMatrixEl = document.getElementById('shortest-paths-matrix');

    // State Variables
    let graph = null;
    let matrixSize = 5;
    let matrixData = [];
    let weightMatrix = [];
    let floydInterval = null;
    let animationSpeed = 5;
    let floydState = {
        distances: [],
        next: [],
        k: 0,
        i: 0,
        j: 0,
        step: 0,
        isRunning: false,
        complete: false
    };

    // Initialize Graph
    function initGraph() {
        graph = new Graph(matrixSize);
        graph.setCanvas(graphCanvas);
    }

    // Create Matrix Input UI
    function createMatrixInput() {
        matrixContainer.innerHTML = '';
        matrixData = [];
        weightMatrix = [];
        
        const table = document.createElement('table');
        table.className = 'matrix-table';
        
        // Header row with indices
        const headerRow = document.createElement('tr');
        headerRow.appendChild(document.createElement('th')); // Empty corner cell
        
        for (let i = 0; i < matrixSize; i++) {
            const th = document.createElement('th');
            th.textContent = i + 1;
            headerRow.appendChild(th);
        }
        
        table.appendChild(headerRow);
        
        // Matrix rows
        for (let i = 0; i < matrixSize; i++) {
            const row = document.createElement('tr');
            
            // Row header (vertex label)
            const th = document.createElement('th');
            th.textContent = i + 1;
            row.appendChild(th);
            
            for (let j = 0; j < matrixSize; j++) {
                if (i === j) {
                    // Diagonal cells are disabled (no self-loops)
                    const td = document.createElement('td');
                    const input = document.createElement('button');
                    input.className = 'matrix-cell';
                    input.textContent = '0';
                    input.disabled = true;
                    td.appendChild(input);
                    row.appendChild(td);
                    continue;
                }
                
                const td = document.createElement('td');
                const cellContainer = document.createElement('div');
                cellContainer.className = 'matrix-cell weighted';
                
                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'weight-input';
                input.min = '0';
                input.max = '99';
                input.value = '0';
                input.dataset.row = i;
                input.dataset.col = j;
                
                input.addEventListener('input', function() {
                    const r = parseInt(this.dataset.row);
                    const c = parseInt(this.dataset.col);
                    const val = parseInt(this.value) || 0;
                    
                    // Update weight and adjacency matrices
                    if (val > 0) {
                        matrixData[r][c] = 1;
                        matrixData[c][r] = 1; // For undirected graph
                        weightMatrix[r][c] = val;
                        weightMatrix[c][r] = val; // For undirected graph
                        
                        this.parentElement.classList.add('active');
                        
                        // Update symmetric cell
                        const symmetricInput = document.querySelector(`.weight-input[data-row="${c}"][data-col="${r}"]`);
                        if (symmetricInput) {
                            symmetricInput.value = val;
                            symmetricInput.parentElement.classList.add('active');
                        }
                    } else {
                        matrixData[r][c] = 0;
                        matrixData[c][r] = 0; // For undirected graph
                        weightMatrix[r][c] = 0;
                        weightMatrix[c][r] = 0; // For undirected graph
                        
                        this.parentElement.classList.remove('active');
                        
                        // Update symmetric cell
                        const symmetricInput = document.querySelector(`.weight-input[data-row="${c}"][data-col="${r}"]`);
                        if (symmetricInput) {
                            symmetricInput.value = 0;
                            symmetricInput.parentElement.classList.remove('active');
                        }
                    }
                });
                
                cellContainer.appendChild(input);
                td.appendChild(cellContainer);
                row.appendChild(td);
            }
            
            table.appendChild(row);
        }
        
        matrixContainer.appendChild(table);
        
        // Initialize matrices
        matrixData = Array(matrixSize).fill().map(() => Array(matrixSize).fill(0));
        weightMatrix = Array(matrixSize).fill().map(() => Array(matrixSize).fill(0));
        
        resetMatrixBtn.disabled = false;
        findPathsBtn.disabled = false;
    }

    // Load Example Graph
    function loadExample() {
        matrixSize = 5;
        matrixSizeInput.value = matrixSize;
        
        // Create the matrix UI first
        createMatrixInput();
        
        // Example weighted graph
        const exampleWeights = [
            [0, 3, 0, 7, 0],
            [3, 0, 4, 2, 0],
            [0, 4, 0, 5, 6],
            [7, 2, 5, 0, 4],
            [0, 0, 6, 4, 0]
        ];
        
        // Update the UI and data
        for (let i = 0; i < matrixSize; i++) {
            for (let j = 0; j < matrixSize; j++) {
                if (exampleWeights[i][j] > 0) {
                    matrixData[i][j] = 1;
                    weightMatrix[i][j] = exampleWeights[i][j];
                    
                    const input = document.querySelector(`.weight-input[data-row="${i}"][data-col="${j}"]`);
                    if (input) {
                        input.value = exampleWeights[i][j];
                        input.parentElement.classList.add('active');
                    }
                }
            }
        }
    }

    // Reset Matrix
    function resetMatrix() {
        matrixContainer.innerHTML = '';
        matrixData = [];
        weightMatrix = [];
        createMatrixInput();
    }

    // Find All-Pairs Shortest Paths
    function findPaths() {
        initGraph();
        graph.loadFromAdjacencyMatrix(matrixData);
        
        // Show results container
        resultsContainer.classList.remove('hidden');
        
        // Draw the initial graph with weights
        drawGraphWithWeights();
        
        // Reset Floyd-Warshall state
        resetFloydState();
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Draw graph with weight labels
    function drawGraphWithWeights() {
        graph.draw();
        
        // Add weight labels to edges
        const ctx = graph.ctx;
        
        for (let i = 0; i < matrixSize; i++) {
            for (let j = i + 1; j < matrixSize; j++) {
                if (matrixData[i][j] === 1) {
                    const fromPos = graph.nodePositions[i];
                    const toPos = graph.nodePositions[j];
                    
                    // Calculate midpoint for weight label
                    const midX = (fromPos.x + toPos.x) / 2;
                    const midY = (fromPos.y + toPos.y) / 2;
                    
                    // Draw weight label with background
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.arc(midX, midY, 12, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.strokeStyle = '#ccc';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    
                    // Draw weight text
                    ctx.fillStyle = '#1e293b';
                    ctx.font = 'bold 12px Ubuntu Mono, monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(weightMatrix[i][j], midX, midY);
                }
            }
        }
    }

    // Reset Floyd-Warshall state
    function resetFloydState() {
        clearInterval(floydInterval);
        
        // Initialize distances matrix
        floydState.distances = Array(matrixSize).fill().map(() => Array(matrixSize).fill(Infinity));
        floydState.next = Array(matrixSize).fill().map(() => Array(matrixSize).fill(null));
        
        // Set initial distances
        for (let i = 0; i < matrixSize; i++) {
            floydState.distances[i][i] = 0;
            for (let j = 0; j < matrixSize; j++) {
                if (weightMatrix[i][j] > 0) {
                    floydState.distances[i][j] = weightMatrix[i][j];
                    floydState.next[i][j] = j;
                }
            }
        }
        
        floydState.k = 0;
        floydState.i = 0;
        floydState.j = 0;
        floydState.step = 0;
        floydState.isRunning = false;
        floydState.complete = false;
        
        // Update UI
        currentStepEl.textContent = '0';
        currentKEl.textContent = '-';
        currentPairEl.textContent = '-';
        
        // Draw initial state
        drawFloydState();
        updateShortestPathsMatrix();
    }

    // Draw current Floyd-Warshall state
    function drawFloydState() {
        const ctx = graph.ctx;
        ctx.clearRect(0, 0, graph.canvas.width, graph.canvas.height);
        
        // Draw edges
        for (let i = 0; i < matrixSize; i++) {
            for (let j = i + 1; j < matrixSize; j++) {
                if (matrixData[i][j] === 1) {
                    let edgeColor = graph.colors.edge;
                    
                    // Highlight current path being considered
                    if (!floydState.complete && 
                        ((i === floydState.i && j === floydState.j) ||
                         (i === floydState.i && j === floydState.k) ||
                         (i === floydState.k && j === floydState.j))) {
                        edgeColor = '#a3e635';
                    }
                    
                    graph.drawEdge(i, j, edgeColor);
                    
                    // Draw weight label
                    const fromPos = graph.nodePositions[i];
                    const toPos = graph.nodePositions[j];
                    const midX = (fromPos.x + toPos.x) / 2;
                    const midY = (fromPos.y + toPos.y) / 2;
                    
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.arc(midX, midY, 12, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.strokeStyle = '#ccc';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    
                    ctx.fillStyle = '#1e293b';
                    ctx.font = 'bold 12px Ubuntu Mono, monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(weightMatrix[i][j], midX, midY);
                }
            }
        }
        
        // Draw vertices
        for (let i = 0; i < matrixSize; i++) {
            let nodeColor = graph.colors.node;
            
            if (i === floydState.k) {
                nodeColor = '#f97316';
            } else if (i === floydState.i || i === floydState.j) {
                nodeColor = '#10b981';
            }
            
            graph.drawNode(i, nodeColor);
        }
    }

    // Update shortest paths matrix display
    function updateShortestPathsMatrix() {
        const table = document.createElement('table');
        
        // Header row
        const headerRow = document.createElement('tr');
        headerRow.appendChild(document.createElement('th'));
        for (let i = 0; i < matrixSize; i++) {
            const th = document.createElement('th');
            th.textContent = i + 1;
            headerRow.appendChild(th);
        }
        table.appendChild(headerRow);
        
        // Matrix rows
        for (let i = 0; i < matrixSize; i++) {
            const row = document.createElement('tr');
            
            // Row header
            const th = document.createElement('th');
            th.textContent = i + 1;
            row.appendChild(th);
            
            // Distance cells
            for (let j = 0; j < matrixSize; j++) {
                const td = document.createElement('td');
                const distance = floydState.distances[i][j];
                
                td.textContent = distance === Infinity ? '∞' : distance;
                
                if (distance === Infinity) {
                    td.classList.add('infinity');
                }
                
                if (!floydState.complete) {
                    if (i === floydState.i && j === floydState.j) {
                        td.classList.add('updated');
                    } else if (i === floydState.k || j === floydState.k) {
                        td.classList.add('highlight');
                    }
                }
                
                row.appendChild(td);
            }
            
            table.appendChild(row);
        }
        
        shortestPathsMatrixEl.innerHTML = '';
        shortestPathsMatrixEl.appendChild(table);
    }

    // Perform one step of Floyd-Warshall algorithm
    function stepFloyd() {
        if (floydState.complete) {
            return false;
        }
        
        floydState.step++;
        currentStepEl.textContent = floydState.step;
        
        // Update current vertex information
        currentKEl.textContent = floydState.k + 1;
        currentPairEl.textContent = `(${floydState.i + 1}, ${floydState.j + 1})`;
        
        // Core Floyd-Warshall algorithm step:
        // For each pair of vertices (i,j), check if path through k is shorter
        // This matches the original C++ implementation's logic
        const throughK = floydState.distances[floydState.i][floydState.k] === Infinity || 
                        floydState.distances[floydState.k][floydState.j] === Infinity ? 
                        Infinity : 
                        floydState.distances[floydState.i][floydState.k] + 
                        floydState.distances[floydState.k][floydState.j];
        
        // Update distance if path through k is shorter
        if (throughK < floydState.distances[floydState.i][floydState.j]) {
            floydState.distances[floydState.i][floydState.j] = throughK;
            floydState.next[floydState.i][floydState.j] = floydState.next[floydState.i][floydState.k];
        }
        
        // Move to next pair of vertices
        // This follows the same nested loop structure as the C++ implementation
        floydState.j++;
        if (floydState.j === matrixSize) {
            floydState.j = 0;
            floydState.i++;
            if (floydState.i === matrixSize) {
                floydState.i = 0;
                floydState.k++;
                if (floydState.k === matrixSize) {
                    // Algorithm complete
                    floydState.complete = true;
                    currentKEl.textContent = 'Завершено';
                    currentPairEl.textContent = '-';
                }
            }
        }
        
        // Update visualization
        drawFloydState();
        updateShortestPathsMatrix();
        
        return !floydState.complete;
    }

    // Start automated Floyd-Warshall algorithm
    function startFloyd() {
        if (floydState.isRunning) {
            stopFloyd();
            return;
        }
        
        floydState.isRunning = true;
        startFloydBtn.textContent = 'Пауза';
        
        const interval = 1100 - (animationSpeed * 100);
        
        floydInterval = setInterval(() => {
            if (!stepFloyd()) {
                stopFloyd();
            }
        }, interval);
    }

    // Stop Floyd-Warshall animation
    function stopFloyd() {
        clearInterval(floydInterval);
        floydState.isRunning = false;
        startFloydBtn.textContent = 'Продолжить';
    }

    // Event Listeners
    generateMatrixBtn.addEventListener('click', function() {
        matrixSize = parseInt(matrixSizeInput.value);
        createMatrixInput();
    });
    
    resetMatrixBtn.addEventListener('click', resetMatrix);
    loadExampleBtn.addEventListener('click', loadExample);
    findPathsBtn.addEventListener('click', findPaths);
    
    startFloydBtn.addEventListener('click', startFloyd);
    stepFloydBtn.addEventListener('click', function() {
        stopFloyd();
        stepFloyd();
    });
    restartFloydBtn.addEventListener('click', resetFloydState);
    
    animationSpeedInput.addEventListener('input', function() {
        animationSpeed = parseInt(this.value);
        if (floydState.isRunning) {
            stopFloyd();
            startFloyd();
        }
    });
    
    // Initialize
    matrixSize = parseInt(matrixSizeInput.value);
    initGraph();
});