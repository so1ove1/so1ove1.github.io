import Graph from '/vertix/js/graph.js';

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const matrixSizeInput = document.getElementById('matrix-size');
    const generateMatrixBtn = document.getElementById('generate-matrix');
    const resetMatrixBtn = document.getElementById('reset-matrix');
    const loadExampleBtn = document.getElementById('load-example');
    const encodePruferBtn = document.getElementById('encode-prufer');
    const matrixContainer = document.getElementById('matrix-container');
    const resultsContainer = document.getElementById('results-container');
    const graphCanvas = document.getElementById('graph-canvas');

    // Prüfer Controls
    const startPruferBtn = document.getElementById('start-prufer');
    const stepPruferBtn = document.getElementById('step-prufer');
    const restartPruferBtn = document.getElementById('restart-prufer');
    const animationSpeedInput = document.getElementById('animation-speed');
    const currentStepEl = document.getElementById('current-step');
    const currentLeafEl = document.getElementById('current-leaf');
    const pruferCodeEl = document.getElementById('prufer-code');
    const pruferSequenceEl = document.getElementById('prufer-sequence');

    // State Variables
    let graph = null;
    let matrixSize = 5;
    let matrixData = [];
    let pruferInterval = null;
    let animationSpeed = 5;
    let pruferState = {
        adjacencyList: [],
        degrees: [],
        pruferCode: [],
        currentLeaf: null,
        removedVertices: new Set(),
        leafs: new Set(),
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
                const td = document.createElement('td');
                const input = document.createElement('button');
                input.className = 'matrix-cell';
                input.textContent = '0';
                input.dataset.row = i;
                input.dataset.col = j;
                
                input.addEventListener('click', function() {
                    const r = parseInt(this.dataset.row);
                    const c = parseInt(this.dataset.col);
                    
                    if (matrixData[r][c] === 0) {
                        // Check if adding this edge would create a cycle
                        if (wouldCreateCycle(r, c)) {
                            alert('Добавление этого ребра создаст цикл!');
                            return;
                        }
                        
                        matrixData[r][c] = 1;
                        matrixData[c][r] = 1; // For undirected graph
                        this.textContent = '1';
                        this.classList.add('active');
                        
                        // Update symmetric cell
                        if (r !== c) {
                            const symmetricCell = document.querySelector(`.matrix-cell[data-row="${c}"][data-col="${r}"]`);
                            if (symmetricCell) {
                                symmetricCell.textContent = '1';
                                symmetricCell.classList.add('active');
                            }
                        }
                    } else {
                        matrixData[r][c] = 0;
                        matrixData[c][r] = 0; // For undirected graph
                        this.textContent = '0';
                        this.classList.remove('active');
                        
                        // Update symmetric cell
                        if (r !== c) {
                            const symmetricCell = document.querySelector(`.matrix-cell[data-row="${c}"][data-col="${r}"]`);
                            if (symmetricCell) {
                                symmetricCell.textContent = '0';
                                symmetricCell.classList.remove('active');
                            }
                        }
                    }
                });
                
                td.appendChild(input);
                row.appendChild(td);
            }
            
            table.appendChild(row);
        }
        
        matrixContainer.appendChild(table);
        
        // Initialize matrix data
        matrixData = Array(matrixSize).fill().map(() => Array(matrixSize).fill(0));
        
        resetMatrixBtn.disabled = false;
        encodePruferBtn.disabled = false;
    }

    // Check if adding an edge would create a cycle
    function wouldCreateCycle(v1, v2) {
        if (matrixData[v1][v2] === 1) return false;
        
        const visited = new Set();
        const parent = new Map();
        
        function dfs(vertex) {
            visited.add(vertex);
            
            for (let i = 0; i < matrixSize; i++) {
                if (matrixData[vertex][i] === 1) {
                    if (!visited.has(i)) {
                        parent.set(i, vertex);
                        if (dfs(i)) return true;
                    } else if (i !== parent.get(vertex)) {
                        return true;
                    }
                }
            }
            
            return false;
        }
        
        // Temporarily add the edge
        matrixData[v1][v2] = 1;
        matrixData[v2][v1] = 1;
        
        const hasCycle = dfs(v1);
        
        // Remove the temporary edge
        matrixData[v1][v2] = 0;
        matrixData[v2][v1] = 0;
        
        return hasCycle;
    }

    // Load Example Tree
    function loadExample() {
        matrixSize = 6;
        matrixSizeInput.value = matrixSize;
        
        // Create the matrix UI first
        createMatrixInput();
        
        // Example tree adjacency matrix
        const exampleMatrix = [
            [0, 1, 0, 1, 0, 0],
            [1, 0, 1, 0, 0, 0],
            [0, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 0],
            [0, 0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0, 0]
        ];
        
        // Update the UI and data
        for (let i = 0; i < matrixSize; i++) {
            for (let j = 0; j < matrixSize; j++) {
                if (exampleMatrix[i][j] === 1) {
                    matrixData[i][j] = 1;
                    const cell = document.querySelector(`.matrix-cell[data-row="${i}"][data-col="${j}"]`);
                    if (cell) {
                        cell.textContent = '1';
                        cell.classList.add('active');
                    }
                }
            }
        }
    }

    // Reset Matrix
    function resetMatrix() {
        matrixContainer.innerHTML = '';
        matrixData = [];
        createMatrixInput();
    }

    // Encode Tree to Prüfer Code
    function encodePrufer() {
        // Verify that the graph is a tree
        if (!isTree()) {
            alert('Граф должен быть деревом!');
            return;
        }
        
        initGraph();
        graph.loadFromAdjacencyMatrix(matrixData);
        
        // Show results container
        resultsContainer.classList.remove('hidden');
        
        // Draw the initial tree
        graph.draw();
        
        // Reset Prüfer state
        resetPruferState();
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Check if the graph is a tree
    function isTree() {
        // Count edges
        let edgeCount = 0;
        for (let i = 0; i < matrixSize; i++) {
            for (let j = i + 1; j < matrixSize; j++) {
                if (matrixData[i][j] === 1) {
                    edgeCount++;
                }
            }
        }
        
        // A tree must have exactly n-1 edges
        if (edgeCount !== matrixSize - 1) return false;
        
        // Check if the graph is connected using DFS
        const visited = new Set();
        
        function dfs(vertex) {
            visited.add(vertex);
            for (let i = 0; i < matrixSize; i++) {
                if (matrixData[vertex][i] === 1 && !visited.has(i)) {
                    dfs(i);
                }
            }
        }
        
        dfs(0);
        
        // A tree must be connected
        return visited.size === matrixSize;
    }

    // Reset Prüfer state
    function resetPruferState() {
        clearInterval(pruferInterval);
        
        // Initialize adjacency list and degrees
        pruferState.adjacencyList = Array(matrixSize).fill().map(() => []);
        pruferState.degrees = Array(matrixSize).fill(0);
        pruferState.leafs = new Set();
        
        // Build adjacency list and calculate degrees
        for (let i = 0; i < matrixSize; i++) {
            for (let j = 0; j < matrixSize; j++) {
                if (matrixData[i][j] === 1) {
                    pruferState.adjacencyList[i].push(j);
                    pruferState.degrees[i]++;
                }
            }
            // Add initial leaves
            if (pruferState.degrees[i] === 1) {
                pruferState.leafs.add(i);
            }
        }
        
        pruferState.pruferCode = [];
        pruferState.currentLeaf = null;
        pruferState.removedVertices = new Set();
        pruferState.step = 0;
        pruferState.isRunning = false;
        pruferState.complete = false;
        
        // Update UI
        currentStepEl.textContent = '0';
        currentLeafEl.textContent = '-';
        pruferCodeEl.textContent = '[]';
        pruferSequenceEl.innerHTML = '<p>Построение не начато</p>';
        
        // Draw initial state
        drawPruferState();
    }

    // Draw current Prüfer state
    function drawPruferState() {
        const ctx = graph.ctx;
        ctx.clearRect(0, 0, graph.canvas.width, graph.canvas.height);
        
        // Draw edges
        for (let i = 0; i < matrixSize; i++) {
            for (let j = i + 1; j < matrixSize; j++) {
                if (matrixData[i][j] === 1) {
                    // Skip edges connected to removed vertices
                    if (pruferState.removedVertices.has(i) || pruferState.removedVertices.has(j)) {
                        continue;
                    }
                    
                    let edgeColor = graph.colors.edge;
                    
                    // Highlight edge being removed
                    if (pruferState.currentLeaf !== null && 
                        ((i === pruferState.currentLeaf && pruferState.adjacencyList[i].includes(j)) ||
                         (j === pruferState.currentLeaf && pruferState.adjacencyList[j].includes(i)))) {
                        edgeColor = '#a3e635';
                    }
                    
                    graph.drawEdge(i, j, edgeColor);
                }
            }
        }
        
        // Draw vertices
        for (let i = 0; i < matrixSize; i++) {
            // Skip removed vertices
            if (pruferState.removedVertices.has(i)) continue;
            
            let nodeColor = graph.colors.node;
            
            if (i === pruferState.currentLeaf) {
                nodeColor = '#f97316';
            } else if (pruferState.currentLeaf !== null && 
                      pruferState.adjacencyList[pruferState.currentLeaf].includes(i)) {
                nodeColor = '#10b981';
            }
            
            graph.drawNode(i, nodeColor);
        }
    }

    // Perform one step of Prüfer encoding
    function stepPrufer() {
        if (pruferState.complete) {
            return false;
        }
        
        pruferState.step++;
        currentStepEl.textContent = pruferState.step;
        
        // Find the smallest leaf from the set
        const leaf = pruferState.leafs.size > 0 ? Math.min(...pruferState.leafs) : null;
        pruferState.currentLeaf = leaf;
        currentLeafEl.textContent = leaf + 1;
        
        if (leaf === null || pruferState.removedVertices.size >= matrixSize - 2) {
            // Algorithm complete
            pruferState.complete = true;
            pruferState.currentLeaf = null;
            currentLeafEl.textContent = 'Завершено';
            
            // Display final Prüfer code
            pruferSequenceEl.innerHTML = `
                <p>Код Прюфера: <span class="code">[${pruferState.pruferCode.map(v => v + 1).join(', ')}]</span></p>
            `;
            
            drawPruferState();
            return false;
        }
        
        // Remove leaf from the set
        pruferState.leafs.delete(leaf);
        
        // Find the neighbor of the leaf
        let neighbor = null;
        for (const u of pruferState.adjacencyList[leaf]) {
            if (!pruferState.removedVertices.has(u)) {
                neighbor = u;
                break;
            }
        }
        
        // Add neighbor to Prüfer code
        pruferState.pruferCode.push(neighbor);
        pruferCodeEl.textContent = `[${pruferState.pruferCode.map(v => v + 1).join(', ')}]`;
        
        // Update degrees
        pruferState.degrees[leaf]--;
        pruferState.degrees[neighbor]--;
        
        // Mark leaf as removed
        pruferState.removedVertices.add(leaf);
        
        // Check if neighbor becomes a leaf
        if (pruferState.degrees[neighbor] === 1) {
            pruferState.leafs.add(neighbor);
        }
        
        // Update visualization
        drawPruferState();
        
        return true;
    }

    // Start automated Prüfer encoding
    function startPrufer() {
        if (pruferState.isRunning) {
            stopPrufer();
            return;
        }
        
        pruferState.isRunning = true;
        startPruferBtn.textContent = 'Пауза';
        
        const interval = 1100 - (animationSpeed * 100);
        
        pruferInterval = setInterval(() => {
            if (!stepPrufer()) {
                stopPrufer();
            }
        }, interval);
    }

    // Stop Prüfer animation
    function stopPrufer() {
        clearInterval(pruferInterval);
        pruferState.isRunning = false;
        startPruferBtn.textContent = 'Продолжить';
    }

    // Event Listeners
    generateMatrixBtn.addEventListener('click', function() {
        matrixSize = parseInt(matrixSizeInput.value);
        createMatrixInput();
    });
    
    resetMatrixBtn.addEventListener('click', resetMatrix);
    loadExampleBtn.addEventListener('click', loadExample);
    encodePruferBtn.addEventListener('click', encodePrufer);
    
    startPruferBtn.addEventListener('click', startPrufer);
    stepPruferBtn.addEventListener('click', function() {
        stopPrufer();
        stepPrufer();
    });
    restartPruferBtn.addEventListener('click', resetPruferState);
    
    animationSpeedInput.addEventListener('input', function() {
        animationSpeed = parseInt(this.value);
        if (pruferState.isRunning) {
            stopPrufer();
            startPrufer();
        }
    });
    
    // Initialize
    matrixSize = parseInt(matrixSizeInput.value);
    initGraph();
});