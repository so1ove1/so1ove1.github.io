document.addEventListener('DOMContentLoaded', function() {
    // Basic elements
    const matrixSizeInput = document.getElementById('matrix-size');
    const graphRepresentationSelect = document.getElementById('graph-representation');
    const generateMatrixBtn = document.getElementById('generate-matrix');
    const resetMatrixBtn = document.getElementById('reset-matrix');
    const loadExampleBtn = document.getElementById('load-example');
    const calculatePathsBtn = document.getElementById('calculate-paths');
    const matrixContainer = document.getElementById('matrix-container');
    const resultsContainer = document.getElementById('results-container');
    const graphCanvas = document.getElementById('graph-canvas');
    
    // Weighted graph controls
    const enableWeightsCheckbox = document.getElementById('enable-weights');
    const defaultWeightInput = document.getElementById('default-weight');
    
    // Algorithm controls
    const startAlgorithmBtn = document.getElementById('start-algorithm');
    const stepAlgorithmBtn = document.getElementById('step-algorithm');
    const restartAlgorithmBtn = document.getElementById('restart-algorithm');
    const animationSpeedInput = document.getElementById('animation-speed');
    const currentStepEl = document.getElementById('current-step');
    const currentVertexEl = document.getElementById('current-vertex');
    const verticesProcessedEl = document.getElementById('vertices-processed');
    
    // Results table
    const shortestPathsTable = document.getElementById('shortest-paths-table').querySelector('tbody');
    
    // State variables
    let graph = null;
    let matrixSize = 5;
    let representation = 'adjacency';
    let matrixData = [];
    let weightMatrix = [];
    let algorithmInterval = null;
    let animationSpeed = 5;
    let useWeights = true;
    let defaultWeight = 1;
    
    let algorithmState = {
        distances: [],
        previous: [],
        unvisited: [],
        visited: [],
        currentVertex: null,
        evaluatingEdge: null,
        step: 0,
        isRunning: false,
        isComplete: false,
        startVertex: 0,
        processedVertices: 0
    };
    
    // Initialize Graph
    function initGraph() {
        graph = new Graph(matrixSize);
        graph.setCanvas(graphCanvas);
    }
    
    // Create matrix input UI
    function createMatrixInput() {
        matrixContainer.innerHTML = '';
        matrixData = [];
        weightMatrix = [];
        
        useWeights = enableWeightsCheckbox.checked;
        defaultWeight = parseInt(defaultWeightInput.value) || 1;
        
        if (representation === 'adjacency') {
            createAdjacencyMatrixUI();
        } else if (representation === 'incidence') {
            createIncidenceMatrixUI();
        } else if (representation === 'lists') {
            createAdjacencyListsUI();
        }
        
        resetMatrixBtn.disabled = false;
        calculatePathsBtn.disabled = false;
    }
    
    // Create adjacency matrix UI
    function createAdjacencyMatrixUI() {
        matrixData = Array(matrixSize).fill().map(() => Array(matrixSize).fill(0));
        weightMatrix = Array(matrixSize).fill().map(() => Array(matrixSize).fill(defaultWeight));
        
        const table = document.createElement('table');
        table.className = 'matrix-table';
        
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
            
            const th = document.createElement('th');
            th.textContent = i + 1;
            row.appendChild(th);
            
            for (let j = 0; j < matrixSize; j++) {
                const td = document.createElement('td');
                
                if (i === j) {
                    td.textContent = '0';
                    td.classList.add('disabled');
                    row.appendChild(td);
                    continue;
                }
                
                const button = document.createElement('button');
                button.className = 'matrix-cell';
                button.textContent = '0';
                button.dataset.row = i;
                button.dataset.col = j;
                
                button.addEventListener('click', function() {
                    const r = parseInt(this.dataset.row);
                    const c = parseInt(this.dataset.col);
                    
                    if (matrixData[r][c] === 0) {
                        matrixData[r][c] = 1;
                        this.textContent = '1';
                        this.classList.add('active');
                        
                        if (useWeights) {
                            const weight = parseInt(prompt(`Enter weight for edge ${r+1} to ${c+1}:`, defaultWeight));
                            weightMatrix[r][c] = isNaN(weight) ? defaultWeight : Math.max(1, weight);
                            
                            const weightSpan = document.createElement('span');
                            weightSpan.className = 'weight-indicator';
                            weightSpan.textContent = weightMatrix[r][c];
                            this.appendChild(weightSpan);
                        }
                    } else {
                        matrixData[r][c] = 0;
                        this.textContent = '0';
                        this.classList.remove('active');
                        
                        const weightSpan = this.querySelector('.weight-indicator');
                        if (weightSpan) {
                            this.removeChild(weightSpan);
                        }
                    }
                });
                
                td.appendChild(button);
                row.appendChild(td);
            }
            
            table.appendChild(row);
        }
        
        matrixContainer.appendChild(table);
    }
    
    // Create incidence matrix UI
    function createIncidenceMatrixUI() {
        const maxEdges = matrixSize * (matrixSize - 1);
        matrixData = Array(matrixSize).fill().map(() => Array(maxEdges).fill(0));
        weightMatrix = Array(matrixSize).fill().map(() => Array(matrixSize).fill(defaultWeight));
        
        const hint = document.createElement('p');
        hint.className = 'hint';
        hint.textContent = 'For shortest path finding, adjacency matrix is recommended.';
        matrixContainer.appendChild(hint);
    }
    
    // Create adjacency lists UI
    function createAdjacencyListsUI() {
        matrixData = Array(matrixSize).fill().map(() => []);
        weightMatrix = Array(matrixSize).fill().map(() => Array(matrixSize).fill(defaultWeight));
        
        const listContainer = document.createElement('div');
        listContainer.className = 'adjacency-lists';
        
        for (let i = 0; i < matrixSize; i++) {
            const listRow = document.createElement('div');
            listRow.className = 'list-row';
            
            const vertexLabel = document.createElement('span');
            vertexLabel.className = 'vertex-label';
            vertexLabel.textContent = `Vertex ${i + 1}:`;
            listRow.appendChild(vertexLabel);
            
            const listInputContainer = document.createElement('div');
            listInputContainer.className = 'list-input-container';
            
            for (let j = 0; j < matrixSize; j++) {
                if (i !== j) {
                    const checkboxContainer = document.createElement('div');
                    checkboxContainer.className = 'checkbox-container';
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `v${i}-v${j}`;
                    checkbox.dataset.from = i;
                    checkbox.dataset.to = j;
                    
                    checkbox.addEventListener('change', function() {
                        const from = parseInt(this.dataset.from);
                        const to = parseInt(this.dataset.to);
                        
                        if (this.checked) {
                            if (!matrixData[from].includes(to)) {
                                matrixData[from].push(to);
                            }
                            
                            if (useWeights) {
                                const weight = parseInt(prompt(`Enter weight for edge ${from+1} to ${to+1}:`, defaultWeight));
                                weightMatrix[from][to] = isNaN(weight) ? defaultWeight : Math.max(1, weight);
                                
                                const label = document.querySelector(`label[for="v${from}-v${to}"]`);
                                if (label) {
                                    label.textContent = `${to + 1} (${weightMatrix[from][to]})`;
                                }
                            }
                        } else {
                            const index = matrixData[from].indexOf(to);
                            if (index !== -1) {
                                matrixData[from].splice(index, 1);
                            }
                            
                            const label = document.querySelector(`label[for="v${from}-v${to}"]`);
                            if (label) {
                                label.textContent = `${to + 1}`;
                            }
                        }
                    });
                    
                    const label = document.createElement('label');
                    label.htmlFor = `v${i}-v${j}`;
                    label.textContent = j + 1;
                    
                    checkboxContainer.appendChild(checkbox);
                    checkboxContainer.appendChild(label);
                    listInputContainer.appendChild(checkboxContainer);
                }
            }
            
            listRow.appendChild(listInputContainer);
            listContainer.appendChild(listRow);
        }
        
        matrixContainer.appendChild(listContainer);
    }
    
    // Load example graph
    function loadExample() {
        matrixSize = 5;
        representation = 'adjacency';
        matrixSizeInput.value = matrixSize;
        graphRepresentationSelect.value = representation;
        
        createMatrixInput();
        
        const exampleMatrix = [
            [0, 1, 0, 0, 1],
            [1, 0, 1, 0, 1],
            [0, 1, 0, 1, 0],
            [0, 0, 1, 0, 1],
            [1, 1, 0, 1, 0]
        ];
        
        const exampleWeights = [
            [0, 4, 0, 0, 2],
            [4, 0, 3, 0, 1],
            [0, 3, 0, 5, 0],
            [0, 0, 5, 0, 6],
            [2, 1, 0, 6, 0]
        ];
        
        for (let i = 0; i < matrixSize; i++) {
            for (let j = 0; j < matrixSize; j++) {
                if (i !== j && exampleMatrix[i][j] === 1) {
                    matrixData[i][j] = 1;
                    weightMatrix[i][j] = exampleWeights[i][j];
                    
                    const cell = document.querySelector(`.matrix-cell[data-row="${i}"][data-col="${j}"]`);
                    if (cell) {
                        cell.textContent = '1';
                        cell.classList.add('active');
                        
                        if (useWeights) {
                            const weightSpan = document.createElement('span');
                            weightSpan.className = 'weight-indicator';
                            weightSpan.textContent = weightMatrix[i][j];
                            cell.appendChild(weightSpan);
                        }
                    }
                }
            }
        }
    }
    
    // Reset matrix
    function resetMatrix() {
        matrixContainer.innerHTML = '';
        matrixData = [];
        weightMatrix = [];
        createMatrixInput();
    }
    
    // Calculate shortest paths
    function calculateShortestPaths() {
        initGraph();
        
        if (representation === 'adjacency') {
            graph.loadFromAdjacencyMatrix(matrixData);
        } else if (representation === 'incidence') {
            graph.loadFromIncidenceMatrix(matrixData);
        } else if (representation === 'lists') {
            graph.loadFromAdjacencyLists(matrixData);
        }
        
        createStartVertexSelection();
        graph.draw();
        
        extendGraphDrawingForWeights();
        
        resultsContainer.classList.remove('hidden');
        resetAlgorithmState();
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Extend graph drawing for weights
    function extendGraphDrawingForWeights() {
        if (!useWeights) return;
        
        const originalDrawEdge = graph.drawEdge;
        
        graph.drawEdge = function(from, to, color = null) {
            originalDrawEdge.call(this, from, to, color);
            
            if (from !== to && weightMatrix[from][to] > 0) {
                const fromPos = this.nodePositions[from];
                const toPos = this.nodePositions[to];
                
                const midX = (fromPos.x + toPos.x) / 2;
                const midY = (fromPos.y + toPos.y) / 2;
                
                this.ctx.fillStyle = 'white';
                this.ctx.beginPath();
                this.ctx.arc(midX, midY, 10, 0, 2 * Math.PI);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#1e293b';
                this.ctx.font = 'bold 12px Ubuntu Mono, monospace';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(weightMatrix[from][to], midX, midY);
            }
        };
        
        graph.draw();
    }
    
    // Create start vertex selection
    function createStartVertexSelection() {
        let startVertexSelection = document.querySelector('.start-vertex-selection');
        
        if (!startVertexSelection) {
            startVertexSelection = document.createElement('div');
            startVertexSelection.className = 'start-vertex-selection';
            
            const label = document.createElement('label');
            label.htmlFor = 'start-vertex';
            label.textContent = 'Start vertex:';
            
            const select = document.createElement('select');
            select.id = 'start-vertex';
            
            for (let i = 0; i < matrixSize; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i + 1;
                select.appendChild(option);
            }
            
            select.addEventListener('change', function() {
                algorithmState.startVertex = parseInt(this.value);
                resetAlgorithmState();
            });
            
            startVertexSelection.appendChild(label);
            startVertexSelection.appendChild(select);
            document.querySelector('.traversal-controls').appendChild(startVertexSelection);
        } else {
            const select = startVertexSelection.querySelector('select');
            select.innerHTML = '';
            
            for (let i = 0; i < matrixSize; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i + 1;
                select.appendChild(option);
            }
        }
    }
    
    // Reset algorithm state
    function resetAlgorithmState() {
        clearInterval(algorithmInterval);
        
        algorithmState = {
            distances: Array(matrixSize).fill(Infinity),
            previous: Array(matrixSize).fill(null),
            unvisited: Array.from({ length: matrixSize }, (_, i) => i),
            visited: [],
            currentVertex: null,
            evaluatingEdge: null,
            step: 0,
            isRunning: false,
            isComplete: false,
            startVertex: algorithmState.startVertex || 0,
            processedVertices: 0
        };
        
        algorithmState.distances[algorithmState.startVertex] = 0;
        
        currentStepEl.textContent = '0';
        currentVertexEl.textContent = '-';
        verticesProcessedEl.textContent = '0';
        
        updateShortestPathsTable();
        
        drawAlgorithmState();
    }
    
    // Update shortest paths table
    function updateShortestPathsTable() {
        shortestPathsTable.innerHTML = '';
        
        for (let i = 0; i < matrixSize; i++) {
            const row = document.createElement('tr');
            
            const vertexCell = document.createElement('td');
            vertexCell.textContent = i + 1;
            row.appendChild(vertexCell);
            
            const distanceCell = document.createElement('td');
            distanceCell.id = `distance-${i}`;
            if (algorithmState.distances[i] === Infinity) {
                distanceCell.innerHTML = '<span class="infinity">∞</span>';
            } else {
                distanceCell.textContent = algorithmState.distances[i];
            }
            row.appendChild(distanceCell);
            
            const pathCell = document.createElement('td');
            pathCell.id = `path-${i}`;
            pathCell.textContent = getPathFromStart(i);
            row.appendChild(pathCell);
            
            shortestPathsTable.appendChild(row);
        }
    }
    
    // Get path from start to target
    function getPathFromStart(target) {
        if (algorithmState.distances[target] === Infinity) {
            return '-';
        }
        
        const path = [];
        let current = target;
        
        while (current !== null) {
            path.unshift(current + 1);
            current = algorithmState.previous[current];
        }
        
        return path.join(' → ');
    }
    
    // Step through algorithm
    function stepAlgorithm() {
        if (algorithmState.isComplete || algorithmState.unvisited.length === 0) {
            stopAlgorithm();
            algorithmState.isComplete = true;
            return false;
        }
        
        algorithmState.step++;
        currentStepEl.textContent = algorithmState.step;
        
        if (algorithmState.currentVertex === null) {
            let minDistance = Infinity;
            let minVertex = null;
            
            for (const vertex of algorithmState.unvisited) {
                if (algorithmState.distances[vertex] < minDistance) {
                    minDistance = algorithmState.distances[vertex];
                    minVertex = vertex;
                }
            }
            
            if (minDistance === Infinity) {
                algorithmState.isComplete = true;
                drawAlgorithmState();
                return false;
            }
            
            algorithmState.currentVertex = minVertex;
            currentVertexEl.textContent = minVertex + 1;
            
            algorithmState.visited.push(minVertex);
            algorithmState.unvisited = algorithmState.unvisited.filter(v => v !== minVertex);
            algorithmState.processedVertices++;
            verticesProcessedEl.textContent = algorithmState.processedVertices;
            
            algorithmState.evaluatingEdge = null;
            
            drawAlgorithmState();
            return true;
        }
        
        const currentVertex = algorithmState.currentVertex;
        let neighborFound = false;
        
        for (let neighbor = 0; neighbor < matrixSize; neighbor++) {
            if (graph.adjacencyMatrix[currentVertex][neighbor] === 1 && 
                algorithmState.unvisited.includes(neighbor)) {
                
                algorithmState.evaluatingEdge = [currentVertex, neighbor];
                
                const edgeWeight = useWeights ? weightMatrix[currentVertex][neighbor] : 1;
                const newDistance = algorithmState.distances[currentVertex] + edgeWeight;
                
                if (newDistance < algorithmState.distances[neighbor]) {
                    algorithmState.distances[neighbor] = newDistance;
                    algorithmState.previous[neighbor] = currentVertex;
                    
                    const distanceCell = document.getElementById(`distance-${neighbor}`);
                    if (distanceCell) {
                        distanceCell.textContent = newDistance;
                        distanceCell.classList.add('distance-updated');
                        setTimeout(() => {
                            distanceCell.classList.remove('distance-updated');
                        }, 1000);
                    }
                    
                    const pathCell = document.getElementById(`path-${neighbor}`);
                    if (pathCell) {
                        pathCell.textContent = getPathFromStart(neighbor);
                    }
                }
                
                neighborFound = true;
                drawAlgorithmState();
                break;
            }
        }
        
        if (!neighborFound) {
            algorithmState.currentVertex = null;
            algorithmState.evaluatingEdge = null;
        }
        
        return true;
    }
    
    // Draw algorithm state
    function drawAlgorithmState() {
        const ctx = graph.ctx;
        ctx.clearRect(0, 0, graph.canvas.width, graph.canvas.height);
        
        for (let i = 0; i < matrixSize; i++) {
            for (let j = 0; j < matrixSize; j++) {
                if (graph.adjacencyMatrix[i][j] === 1) {
                    let edgeColor = graph.colors.edge;
                    
                    if (algorithmState.evaluatingEdge && 
                        ((algorithmState.evaluatingEdge[0] === i && algorithmState.evaluatingEdge[1] === j) ||
                         (algorithmState.evaluatingEdge[0] === j && algorithmState.evaluatingEdge[1] === i))) {
                        edgeColor = '#f59e0b';
                    }
                    
                    if (isEdgeInShortestPath(i, j)) {
                        edgeColor = '#8b5cf6';
                    }
                    
                    graph.drawEdge(i, j, edgeColor);
                }
            }
        }
        
        for (let i = 0; i < matrixSize; i++) {
            let nodeColor = graph.colors.node;
            
            if (i === algorithmState.currentVertex) {
                nodeColor = '#f97316';
            } else if (algorithmState.visited.includes(i)) {
                nodeColor = '#10b981';
            }
            
            if (i === algorithmState.startVertex) {
                const pos = graph.nodePositions[i];
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, graph.nodeRadius + 4, 0, 2 * Math.PI);
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            
            graph.drawNode(i, nodeColor);
        }
    }
    
    // Check if edge is in shortest path
    function isEdgeInShortestPath(v1, v2) {
        for (let i = 0; i < matrixSize; i++) {
            if (algorithmState.distances[i] === Infinity) continue;
            
            const path = [];
            let current = i;
            
            while (current !== null) {
                path.unshift(current);
                current = algorithmState.previous[current];
            }
            
            for (let j = 0; j < path.length - 1; j++) {
                if ((path[j] === v1 && path[j+1] === v2) || 
                    (path[j] === v2 && path[j+1] === v1)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Start algorithm animation
    function startAlgorithm() {
        if (algorithmState.isRunning) {
            stopAlgorithm();
            return;
        }
        
        if (algorithmState.isComplete) {
            resetAlgorithmState();
        }
        
        algorithmState.isRunning = true;
        startAlgorithmBtn.textContent = 'Pause';
        
        const interval = 1100 - (animationSpeed * 100);
        
        algorithmInterval = setInterval(() => {
            if (!stepAlgorithm()) {
                stopAlgorithm();
            }
        }, interval);
    }
    
    // Stop algorithm animation
    function stopAlgorithm() {
        clearInterval(algorithmInterval);
        algorithmState.isRunning = false;
        startAlgorithmBtn.textContent = 'Continue';
    }
    
    // Event listeners
    generateMatrixBtn.addEventListener('click', function() {
        matrixSize = parseInt(matrixSizeInput.value);
        representation = graphRepresentationSelect.value;
        createMatrixInput();
    });
    
    resetMatrixBtn.addEventListener('click', resetMatrix);
    loadExampleBtn.addEventListener('click', loadExample);
    calculatePathsBtn.addEventListener('click', calculateShortestPaths);
    
    startAlgorithmBtn.addEventListener('click', startAlgorithm);
    stepAlgorithmBtn.addEventListener('click', function() {
        stopAlgorithm();
        stepAlgorithm();
    });
    restartAlgorithmBtn.addEventListener('click', resetAlgorithmState);
    
    animationSpeedInput.addEventListener('input', function() {
        animationSpeed = parseInt(this.value);
        if (algorithmState.isRunning) {
            stopAlgorithm();
            startAlgorithm();
        }
    });
    
    enableWeightsCheckbox.addEventListener('change', function() {
        useWeights = this.checked;
        defaultWeightInput.disabled = !useWeights;
        
        if (matrixData.length > 0) {
            createMatrixInput();
        }
    });
    
    // Initialize
    matrixSize = parseInt(matrixSizeInput.value);
    representation = graphRepresentationSelect.value;
    initGraph();
});
