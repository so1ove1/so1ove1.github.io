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

    // Dijkstra Controls
    const startVertexSelect = document.getElementById('start-vertex');
    const startDijkstraBtn = document.getElementById('start-dijkstra');
    const stepDijkstraBtn = document.getElementById('step-dijkstra');
    const restartDijkstraBtn = document.getElementById('restart-dijkstra');
    const animationSpeedInput = document.getElementById('animation-speed');
    const currentStepEl = document.getElementById('current-step');
    const currentVertexEl = document.getElementById('current-vertex');
    const currentDistanceEl = document.getElementById('current-distance');
    const pathsList = document.getElementById('paths-list');

    // State Variables
    let graph = null;
    let matrixSize = 5;
    let matrixData = [];
    let weightMatrix = [];
    let dijkstraInterval = null;
    let animationSpeed = 5;
    let dijkstraState = {
        distances: [],
        previous: [],
        visited: [],
        currentVertex: null,
        startVertex: 0,
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
        matrixSize = 6;
        matrixSizeInput.value = matrixSize;
        
        // Create the matrix UI first
        createMatrixInput();
        
        // Example weighted graph
        const exampleWeights = [
            [0, 4, 0, 0, 8, 0],
            [4, 0, 8, 0, 11, 0],
            [0, 8, 0, 7, 0, 2],
            [0, 0, 7, 0, 2, 6],
            [8, 11, 0, 2, 0, 7],
            [0, 0, 2, 6, 7, 0]
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

    // Find Shortest Paths
    function findPaths() {
        initGraph();
        graph.loadFromAdjacencyMatrix(matrixData);
        
        // Show results container
        resultsContainer.classList.remove('hidden');
        
        // Update start vertex selection
        startVertexSelect.innerHTML = '';
        for (let i = 0; i < matrixSize; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i + 1;
            startVertexSelect.appendChild(option);
        }
        
        // Draw the initial graph with weights
        drawGraphWithWeights();
        
        // Reset Dijkstra state
        resetDijkstraState();
        
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

    // Reset Dijkstra state
    function resetDijkstraState() {
        clearInterval(dijkstraInterval);
        
        dijkstraState = {
            distances: Array(matrixSize).fill(Infinity),
            previous: Array(matrixSize).fill(null),
            visited: Array(matrixSize).fill(false),
            currentVertex: parseInt(startVertexSelect.value),
            startVertex: parseInt(startVertexSelect.value),
            step: 0,
            isRunning: false,
            complete: false
        };
        
        // Set distance to start vertex as 0
        dijkstraState.distances[dijkstraState.startVertex] = 0;
        
        // Update UI
        currentStepEl.textContent = '0';
        currentVertexEl.textContent = dijkstraState.startVertex + 1;
        currentDistanceEl.textContent = '0';
        pathsList.innerHTML = '<li>Алгоритм не запущен</li>';
        
        // Draw initial state
        drawDijkstraState();
    }

    // Draw current Dijkstra state
    function drawDijkstraState() {
        const ctx = graph.ctx;
        ctx.clearRect(0, 0, graph.canvas.width, graph.canvas.height);
        
        // Draw edges
        for (let i = 0; i < matrixSize; i++) {
            for (let j = i + 1; j < matrixSize; j++) {
                if (matrixData[i][j] === 1) {
                    let edgeColor = graph.colors.edge;
                    
                    // Check if edge is part of a shortest path
                    if (isEdgeInShortestPath(i, j)) {
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
            
            if (i === dijkstraState.currentVertex) {
                nodeColor = '#f97316';
            } else if (dijkstraState.visited[i]) {
                nodeColor = '#10b981';
            }
            
            graph.drawNode(i, nodeColor);
        }
    }

    // Check if edge is part of a shortest path
    function isEdgeInShortestPath(v1, v2) {
        return (dijkstraState.previous[v2] === v1) || (dijkstraState.previous[v1] === v2);
    }

    // Get shortest path to vertex
    function getPath(vertex) {
        const path = [];
        let current = vertex;
        
        while (current !== null) {
            path.unshift(current);
            current = dijkstraState.previous[current];
        }
        
        return path;
    }

    // Perform one step of Dijkstra's algorithm
    function stepDijkstra() {
        if (dijkstraState.complete) {
            return false;
        }
        
        dijkstraState.step++;
        currentStepEl.textContent = dijkstraState.step;
        
        // Find unvisited vertex with minimum distance
        let minDistance = Infinity;
        let minVertex = null;
        
        for (let i = 0; i < matrixSize; i++) {
            if (!dijkstraState.visited[i] && dijkstraState.distances[i] < minDistance) {
                minDistance = dijkstraState.distances[i];
                minVertex = i;
            }
        }
        
        if (minVertex === null) {
            // Algorithm complete
            dijkstraState.complete = true;
            dijkstraState.currentVertex = null;
            currentVertexEl.textContent = 'Завершено';
            currentDistanceEl.textContent = '-';
            
            // Display final paths
            pathsList.innerHTML = '';
            for (let i = 0; i < matrixSize; i++) {
                if (i !== dijkstraState.startVertex) {
                    const path = getPath(i);
                    const distance = dijkstraState.distances[i];
                    const pathStr = path.map(v => v + 1).join(' → ');
                    
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span>Путь до ${i + 1}: ${pathStr}</span>
                
                        <span class="path-distance">Расстояние: ${distance}</span>
                    `;
                    pathsList.appendChild(li);
                }
            }
            
            drawDijkstraState();
            return false;
        }
        
        // Mark vertex as visited
        dijkstraState.visited[minVertex] = true;
        dijkstraState.currentVertex = minVertex;
        currentVertexEl.textContent = minVertex + 1;
        currentDistanceEl.textContent = dijkstraState.distances[minVertex];
        
        // Update distances to neighbors
        for (let i = 0; i < matrixSize; i++) {
            if (matrixData[minVertex][i] === 1 && !dijkstraState.visited[i]) {
                const newDistance = dijkstraState.distances[minVertex] + weightMatrix[minVertex][i];
                
                if (newDistance < dijkstraState.distances[i]) {
                    dijkstraState.distances[i] = newDistance;
                    dijkstraState.previous[i] = minVertex;
                }
            }
        }
        
        // Draw the updated state
        drawDijkstraState();
        return true;
    }

    // Start automated Dijkstra's algorithm
    function startDijkstra() {
        if (dijkstraState.isRunning) {
            stopDijkstra();
            return;
        }
        
        dijkstraState.isRunning = true;
        startDijkstraBtn.textContent = 'Пауза';
        
        const interval = 1100 - (animationSpeed * 100);
        
        dijkstraInterval = setInterval(() => {
            if (!stepDijkstra()) {
                stopDijkstra();
            }
        }, interval);
    }

    // Stop Dijkstra animation
    function stopDijkstra() {
        clearInterval(dijkstraInterval);
        dijkstraState.isRunning = false;
        startDijkstraBtn.textContent = 'Продолжить';
    }

    // Event Listeners
    generateMatrixBtn.addEventListener('click', function() {
        matrixSize = parseInt(matrixSizeInput.value);
        createMatrixInput();
    });
    
    resetMatrixBtn.addEventListener('click', resetMatrix);
    loadExampleBtn.addEventListener('click', loadExample);
    findPathsBtn.addEventListener('click', findPaths);
    
    startVertexSelect.addEventListener('change', resetDijkstraState);
    startDijkstraBtn.addEventListener('click', startDijkstra);
    stepDijkstraBtn.addEventListener('click', function() {
        stopDijkstra();
        stepDijkstra();
    });
    restartDijkstraBtn.addEventListener('click', resetDijkstraState);
    
    animationSpeedInput.addEventListener('input', function() {
        animationSpeed = parseInt(this.value);
        if (dijkstraState.isRunning) {
            stopDijkstra();
            startDijkstra();
        }
    });
    
    // Initialize
    matrixSize = parseInt(matrixSizeInput.value);
    initGraph();
});