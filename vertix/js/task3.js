import Graph from '/vertix/js/graph.js';

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const matrixSizeInput = document.getElementById('matrix-size');
    const graphRepresentationSelect = document.getElementById('graph-representation');
    const generateMatrixBtn = document.getElementById('generate-matrix');
    const resetMatrixBtn = document.getElementById('reset-matrix');
    const loadExampleBtn = document.getElementById('load-example');
    const performBfsBtn = document.getElementById('perform-bfs');
    const matrixContainer = document.getElementById('matrix-container');
    const resultsContainer = document.getElementById('results-container');
    const graphCanvas = document.getElementById('graph-canvas');

    // BFS Controls
    const startBfsBtn = document.getElementById('start-bfs');
    const stepBfsBtn = document.getElementById('step-bfs');
    const restartBfsBtn = document.getElementById('restart-bfs');
    const animationSpeedInput = document.getElementById('animation-speed');
    const currentStepEl = document.getElementById('current-step');
    const currentVertexEl = document.getElementById('current-vertex');
    const queueEl = document.getElementById('queue');
    const traversalSequenceEl = document.getElementById('traversal-sequence').querySelector('span');

    // State Variables
    let graph = null;
    let matrixSize = 5;
    let representation = 'adjacency';
    let matrixData = [];
    let bfsInterval = null;
    let animationSpeed = 5;
    let bfsState = {
        visited: [],
        queue: [],
        currentVertex: null,
        traversalSequence: [],
        step: 0,
        isRunning: false,
        startVertex: 0
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

        if (representation === 'adjacency') {
            createAdjacencyMatrixUI();
        } else if (representation === 'incidence') {
            createIncidenceMatrixUI();
        } else if (representation === 'lists') {
            createAdjacencyListsUI();
        }

        resetMatrixBtn.disabled = false;
        performBfsBtn.disabled = false;
    }

    // Create Adjacency Matrix UI
    function createAdjacencyMatrixUI() {
        matrixData = Array(matrixSize).fill().map(() => Array(matrixSize).fill(0));
        
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
    }

    // Create Incidence Matrix UI
    function createIncidenceMatrixUI() {
        const maxEdges = (matrixSize * (matrixSize - 1)) / 2;
        matrixData = Array(matrixSize).fill().map(() => Array(maxEdges).fill(0));
        
        const table = document.createElement('table');
        table.className = 'matrix-table';
        
        // Header row with edge indices
        const headerRow = document.createElement('tr');
        headerRow.appendChild(document.createElement('th')); // Empty corner cell
        
        for (let i = 0; i < maxEdges; i++) {
            const th = document.createElement('th');
            th.textContent = `e${i + 1}`;
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
            
            for (let j = 0; j < maxEdges; j++) {
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
                        matrixData[r][c] = 1;
                        this.textContent = '1';
                        this.classList.add('active');
                    } else if (matrixData[r][c] === 1) {
                        matrixData[r][c] = -1;
                        this.textContent = '-1';
                        this.classList.remove('active');
                        this.classList.add('active-negative');
                    } else {
                        matrixData[r][c] = 0;
                        this.textContent = '0';
                        this.classList.remove('active');
                        this.classList.remove('active-negative');
                    }
                });
                
                td.appendChild(input);
                row.appendChild(td);
            }
            
            table.appendChild(row);
        }
        
        matrixContainer.appendChild(table);
    }

    // Create Adjacency Lists UI
    function createAdjacencyListsUI() {
        matrixData = Array(matrixSize).fill().map(() => []);
        
        const listContainer = document.createElement('div');
        listContainer.className = 'adjacency-lists';
        
        for (let i = 0; i < matrixSize; i++) {
            const listRow = document.createElement('div');
            listRow.className = 'list-row';
            
            const vertexLabel = document.createElement('span');
            vertexLabel.className = 'vertex-label';
            vertexLabel.textContent = `Вершина ${i + 1}:`;
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
                            
                            const reverseCheckbox = document.getElementById(`v${to}-v${from}`);
                            if (reverseCheckbox && !reverseCheckbox.checked) {
                                reverseCheckbox.checked = true;
                                if (!matrixData[to].includes(from)) {
                                    matrixData[to].push(from);
                                }
                            }
                        } else {
                            const index = matrixData[from].indexOf(to);
                            if (index !== -1) {
                                matrixData[from].splice(index, 1);
                            }
                            
                            const reverseCheckbox = document.getElementById(`v${to}-v${from}`);
                            if (reverseCheckbox && reverseCheckbox.checked) {
                                reverseCheckbox.checked = false;
                                const reverseIndex = matrixData[to].indexOf(from);
                                if (reverseIndex !== -1) {
                                    matrixData[to].splice(reverseIndex, 1);
                                }
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

    // Load Example Graph
    function loadExample() {
        matrixSize = 5;
        representation = 'adjacency';
        matrixSizeInput.value = matrixSize;
        graphRepresentationSelect.value = representation;
        
        // Create the matrix UI first
        createMatrixInput();
        
        // Example matrix data
        const exampleMatrix = [
            [0, 1, 0, 0, 1],
            [1, 0, 1, 0, 1],
            [0, 1, 0, 1, 0],
            [0, 0, 1, 0, 1],
            [1, 1, 0, 1, 0]
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

    // Perform BFS
    function performBFS() {
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
        resultsContainer.classList.remove('hidden');
        resetBfsState();
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Create Start Vertex Selection
    function createStartVertexSelection() {
        let startVertexSelection = document.querySelector('.start-vertex-selection');
        
        if (!startVertexSelection) {
            startVertexSelection = document.createElement('div');
            startVertexSelection.className = 'start-vertex-selection';
            
            const label = document.createElement('label');
            label.htmlFor = 'start-vertex';
            label.textContent = 'Начальная вершина:';
            
            const select = document.createElement('select');
            select.id = 'start-vertex';
            
            for (let i = 0; i < matrixSize; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i + 1;
                select.appendChild(option);
            }
            
            select.addEventListener('change', function() {
                bfsState.startVertex = parseInt(this.value);
                resetBfsState();
                graph.draw();
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

    // Reset BFS State
    function resetBfsState() {
        clearInterval(bfsInterval);
        
        bfsState = {
            visited: Array(matrixSize).fill(false),
            queue: [bfsState.startVertex],
            currentVertex: null,
            traversalSequence: [],
            step: 0,
            isRunning: false,
            startVertex: bfsState.startVertex || 0
        };
        
        currentStepEl.textContent = '0';
        currentVertexEl.textContent = '-';
        queueEl.textContent = `[${bfsState.startVertex + 1}]`;
        traversalSequenceEl.textContent = '-';
        
        graph.draw();
    }

    // Perform one step of BFS
    function stepBFS() {
        if (bfsState.queue.length === 0) {
            stopBFS();
            return false;
        }
        
        bfsState.step++;
        currentStepEl.textContent = bfsState.step;
        
        const currentVertex = bfsState.queue.shift();
        bfsState.currentVertex = currentVertex;
        
        if (!bfsState.visited[currentVertex]) {
            bfsState.visited[currentVertex] = true;
            bfsState.traversalSequence.push(currentVertex + 1);
            traversalSequenceEl.textContent = bfsState.traversalSequence.join(' → ');
            currentVertexEl.textContent = currentVertex + 1;
            
            for (let i = 0; i < matrixSize; i++) {
                if (graph.adjacencyMatrix[currentVertex][i] === 1 && !bfsState.visited[i] && !bfsState.queue.includes(i)) {
                    bfsState.queue.push(i);
                }
            }
            
            queueEl.textContent = `[${bfsState.queue.map(v => v + 1).join(', ')}]`;
            drawBfsState();
        }
        
        return true;
    }

    // Draw current BFS state
    function drawBfsState() {
        const ctx = graph.ctx;
        ctx.clearRect(0, 0, graph.canvas.width, graph.canvas.height);
        
        // Draw edges
        for (let i = 0; i < matrixSize; i++) {
            for (let j = 0; j < matrixSize; j++) {
                if (graph.adjacencyMatrix[i][j] === 1) {
                    let edgeColor = graph.colors.edge;
                    
                    if (isEdgeInQueue(i, j)) {
                        edgeColor = '#f59e0b';
                    }
                    
                    if (bfsState.visited[i] && bfsState.visited[j]) {
                        edgeColor = '#a3e635';
                    }
                    
                    graph.drawEdge(i, j, edgeColor);
                }
            }
        }
        
        // Draw vertices
        for (let i = 0; i < matrixSize; i++) {
            let nodeColor = graph.colors.node;
            
            if (i === bfsState.currentVertex) {
                nodeColor = '#f97316';
            } else if (bfsState.visited[i]) {
                nodeColor = '#10b981';
            }
            
            graph.drawNode(i, nodeColor);
        }
    }

    // Check if edge is in queue
    function isEdgeInQueue(v1, v2) {
        return (bfsState.visited[v1] && bfsState.queue.includes(v2)) || (bfsState.visited[v2] && bfsState.queue.includes(v1));
    }

    // Start automated BFS
    function startBFS() {
        if (bfsState.isRunning) {
            stopBFS();
            return;
        }
        
        bfsState.isRunning = true;
        startBfsBtn.textContent = 'Пауза';
        
        const interval = 1100 - (animationSpeed * 100);
        
        bfsInterval = setInterval(() => {
            if (!stepBFS()) {
                stopBFS();
            }
        }, interval);
    }

    // Stop BFS
    function stopBFS() {
        clearInterval(bfsInterval);
        bfsState.isRunning = false;
        startBfsBtn.textContent = 'Продолжить';
    }

    // Event Listeners
    generateMatrixBtn.addEventListener('click', function() {
        matrixSize = parseInt(matrixSizeInput.value);
        representation = graphRepresentationSelect.value;
        createMatrixInput();
    });
    
    resetMatrixBtn.addEventListener('click', resetMatrix);
    loadExampleBtn.addEventListener('click', loadExample);
    performBfsBtn.addEventListener('click', performBFS);
    
    startBfsBtn.addEventListener('click', startBFS);
    stepBfsBtn.addEventListener('click', function() {
        stopBFS();
        stepBFS();
    });
    restartBfsBtn.addEventListener('click', resetBfsState);
    
    animationSpeedInput.addEventListener('input', function() {
        animationSpeed = parseInt(this.value);
        if (bfsState.isRunning) {
            stopBFS();
            startBFS();
        }
    });
    
    // Initialize
    matrixSize = parseInt(matrixSizeInput.value);
    representation = graphRepresentationSelect.value;
    initGraph();
});