// Extended Graph class with MST functionality
class MSTGraph extends Graph {
    constructor(size = 0) {
        super(size);
        this.weightedMatrix = Array(size).fill().map(() => Array(size).fill(0));
        this.mst = []; // Array of edges in the MST
        this.mstTotalWeight = 0;
        this.algorithmSteps = []; // For step-by-step visualization
        this.colors = {
            ...this.colors,
            mstEdge: '#10b981', // Color for MST edges
            mstHighlight: '#f97316', // Color for highlighting steps
            edgeWeight: '#1e293b' // Color for edge weight text
        };
    }

    /**
     * Load a weighted graph from adjacency matrix
     * @param {Array} matrix - 2D array representing the adjacency matrix
     * @param {Array} weightMatrix - 2D array with edge weights
     */
    loadFromWeightedMatrix(matrix, weightMatrix) {
        this.size = matrix.length;
        this.adjacencyMatrix = JSON.parse(JSON.stringify(matrix));
        this.weightedMatrix = JSON.parse(JSON.stringify(weightMatrix));
        this.calculateNodePositions();
        return this;
    }

    /**
     * Generate a random weighted graph
     * @param {number} size - Number of vertices
     * @param {number} density - Edge density (0-1)
     * @param {number} maxWeight - Maximum edge weight
     */
    generateRandomWeightedGraph(size, density = 0.5, maxWeight = 10) {
        this.size = size;
        this.adjacencyMatrix = Array(size).fill().map(() => Array(size).fill(0));
        this.weightedMatrix = Array(size).fill().map(() => Array(size).fill(0));

        // Generate random edges
        for (let i = 0; i < size; i++) {
            for (let j = i + 1; j < size; j++) {
                if (Math.random() < density) {
                    const weight = Math.floor(Math.random() * (maxWeight - 1)) + 1;
                    this.adjacencyMatrix[i][j] = 1;
                    this.adjacencyMatrix[j][i] = 1;
                    this.weightedMatrix[i][j] = weight;
                    this.weightedMatrix[j][i] = weight;
                }
            }
        }

        // Ensure the graph is connected
        const components = this.findConnectedComponents();
        if (components.length > 1) {
            // Connect components
            for (let c = 1; c < components.length; c++) {
                const v1 = components[c - 1][0];
                const v2 = components[c][0];
                const weight = Math.floor(Math.random() * (maxWeight - 1)) + 1;
                this.adjacencyMatrix[v1][v2] = 1;
                this.adjacencyMatrix[v2][v1] = 1;
                this.weightedMatrix[v1][v2] = weight;
                this.weightedMatrix[v2][v1] = weight;
            }
        }

        this.calculateNodePositions();
        return this;
    }

    /**
     * Find the minimum spanning tree using Prim's algorithm
     * @returns {Object} MST result including edges and total weight
     */
    findMinimumSpanningTree() {
        if (this.size <= 1) {
            return { edges: [], totalWeight: 0, connected: true };
        }

        // Check if graph is connected
        const components = this.findConnectedComponents();
        if (components.length > 1) {
            return { edges: [], totalWeight: 0, connected: false, components };
        }

        // Initialize algorithm
        const visited = Array(this.size).fill(false);
        const mstEdges = [];
        let totalWeight = 0;
        this.algorithmSteps = [];

        // Start with vertex 0
        visited[0] = true;
        const verticesInMST = [0];
        
        // Repeat until all vertices are included
        while (verticesInMST.length < this.size) {
            let minWeight = Infinity;
            let minEdge = null;
            
            // Find the minimum weight edge connecting a visited vertex to an unvisited vertex
            for (const u of verticesInMST) {
                for (let v = 0; v < this.size; v++) {
                    if (!visited[v] && this.adjacencyMatrix[u][v] === 1) {
                        const weight = this.weightedMatrix[u][v];
                        if (weight < minWeight) {
                            minWeight = weight;
                            minEdge = { from: u, to: v, weight };
                        }
                    }
                }
            }
            
            // If no edge is found, the graph may not be connected
            if (minEdge === null) {
                break;
            }
            
            // Add the edge to MST
            mstEdges.push(minEdge);
            visited[minEdge.to] = true;
            verticesInMST.push(minEdge.to);
            totalWeight += minEdge.weight;
            
            // Record algorithm step
            this.algorithmSteps.push({
                addedEdge: minEdge,
                verticesInMST: [...verticesInMST],
                description: `Добавлено ребро (${minEdge.from + 1}, ${minEdge.to + 1}) с весом ${minEdge.weight}`
            });
        }
        
        this.mst = mstEdges;
        this.mstTotalWeight = totalWeight;
        
        return { 
            edges: mstEdges, 
            totalWeight, 
            connected: true,
            steps: this.algorithmSteps
        };
    }

    /**
     * Draw the weighted graph with edge weights
     */
    drawWeightedGraph() {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw edges with weights
        for (let i = 0; i < this.size; i++) {
            for (let j = i + 1; j < this.size; j++) {
                if (this.adjacencyMatrix[i][j] === 1) {
                    this.drawWeightedEdge(i, j, this.weightedMatrix[i][j]);
                }
            }
        }

        // Draw nodes
        for (let i = 0; i < this.size; i++) {
            this.drawNode(i);
        }
    }

    /**
     * Draw edge with weight label
     * @param {number} from - Source vertex
     * @param {number} to - Target vertex
     * @param {number} weight - Edge weight
     * @param {string} color - Optional color override
     */
    drawWeightedEdge(from, to, weight, color = null) {
        const fromPos = this.nodePositions[from];
        const toPos = this.nodePositions[to];

        // Draw the edge
        this.ctx.beginPath();
        this.ctx.moveTo(fromPos.x, fromPos.y);
        this.ctx.lineTo(toPos.x, toPos.y);
        this.ctx.strokeStyle = color || this.colors.edge;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw weight label
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;
        
        // Add small offset for better readability
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const offsetX = -dy * 15 / dist;
        const offsetY = dx * 15 / dist;
        
        // Background for the weight label
        this.ctx.beginPath();
        this.ctx.arc(midX + offsetX, midY + offsetY, 12, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
        this.ctx.strokeStyle = color || this.colors.edge;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Draw weight text
        this.ctx.fillStyle = this.colors.edgeWeight;
        this.ctx.font = 'bold 12px Ubuntu Mono, monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(weight, midX + offsetX, midY + offsetY);
    }

    /**
     * Draw the minimum spanning tree
     */
    drawMST() {
        if (!this.ctx || !this.mst) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw all edges lightly
        for (let i = 0; i < this.size; i++) {
            for (let j = i + 1; j < this.size; j++) {
                if (this.adjacencyMatrix[i][j] === 1) {
                    // Draw non-MST edges with reduced opacity
                    this.ctx.globalAlpha = 0.2;
                    this.drawWeightedEdge(i, j, this.weightedMatrix[i][j]);
                    this.ctx.globalAlpha = 1.0;
                }
            }
        }

        // Draw MST edges
        for (const edge of this.mst) {
            this.drawWeightedEdge(edge.from, edge.to, edge.weight, this.colors.mstEdge);
        }

        // Draw nodes
        for (let i = 0; i < this.size; i++) {
            this.drawNode(i);
        }
    }

    /**
     * Draw a specific step of the MST algorithm
     * @param {number} step - Step index
     */
    drawMSTStep(step) {
        if (!this.ctx || !this.algorithmSteps || step >= this.algorithmSteps.length) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Get the current step
        const currentStep = this.algorithmSteps[step];
        const verticesInMST = currentStep.verticesInMST;
        const mstEdges = this.algorithmSteps.slice(0, step + 1).map(s => s.addedEdge);

        // Draw all edges lightly
        for (let i = 0; i < this.size; i++) {
            for (let j = i + 1; j < this.size; j++) {
                if (this.adjacencyMatrix[i][j] === 1) {
                    // Draw non-MST edges with reduced opacity
                    this.ctx.globalAlpha = 0.2;
                    this.drawWeightedEdge(i, j, this.weightedMatrix[i][j]);
                    this.ctx.globalAlpha = 1.0;
                }
            }
        }

        // Draw MST edges up to current step
        for (let i = 0; i < mstEdges.length - 1; i++) {
            const edge = mstEdges[i];
            this.drawWeightedEdge(edge.from, edge.to, edge.weight, this.colors.mstEdge);
        }

        // Highlight the current edge being added
        if (mstEdges.length > 0) {
            const currentEdge = mstEdges[mstEdges.length - 1];
            this.drawWeightedEdge(currentEdge.from, currentEdge.to, currentEdge.weight, this.colors.mstHighlight);
        }

        // Draw nodes
        for (let i = 0; i < this.size; i++) {
            const inMST = verticesInMST.includes(i);
            this.drawNode(i, inMST ? this.colors.mstEdge : this.colors.node);
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const matrixSizeInput = document.getElementById('matrix-size');
    const generateMatrixBtn = document.getElementById('generate-matrix');
    const generateRandomBtn = document.getElementById('generate-random');
    const resetMatrixBtn = document.getElementById('reset-matrix');
    const loadExampleBtn = document.getElementById('load-example');
    const findMSTBtn = document.getElementById('find-mst');
    const matrixContainer = document.getElementById('matrix-container');
    const resultsContainer = document.getElementById('results-container');
    const mstResultContainer = document.getElementById('mst-result');
    const algorithmDetailsContainer = document.getElementById('algorithm-details');
    const graphCanvas = document.getElementById('graph-canvas');

    // View control buttons
    const viewOriginalBtn = document.getElementById('view-original');
    const viewMSTBtn = document.getElementById('view-mst');
    const viewStepByStepBtn = document.getElementById('view-step-by-step');

    // Create MST Graph instance
    let graph = new MSTGraph();
    let currentMatrix = [];
    let currentWeightMatrix = [];
    let mstResult = null;
    let currentStep = 0;
    let stepInterval = null;

    // Initialize canvas
    initCanvas();

    // Initialize canvas for graph visualization
    function initCanvas() {
        if (!graphCanvas) return;

        // Set canvas size based on container size
        const container = graphCanvas.parentElement;
        const containerWidth = container.clientWidth;
        const size = Math.min(containerWidth, 600);
        graphCanvas.width = size;
        graphCanvas.height = size;

        // Set up graph with canvas
        graph.setCanvas(graphCanvas);
        graph.draw();
    }

    // Generate weighted adjacency matrix input
    function generateMatrix(size) {
        if (size < 2 || size > 10) {
            alert('Размер матрицы должен быть от 2 до 10');
            return;
        }

        // Initialize matrices
        currentMatrix = Array(size).fill().map(() => Array(size).fill(0));
        currentWeightMatrix = Array(size).fill().map(() => Array(size).fill(0));

        // Generate HTML table for the matrix
        let tableHTML = '<table class="matrix-table">';
        tableHTML += '<tr><th></th>';
        for (let i = 0; i < size; i++) {
            tableHTML += `<th>${i + 1}</th>`;
        }
        tableHTML += '</tr>';

        for (let i = 0; i < size; i++) {
            tableHTML += `<tr><th>${i + 1}</th>`;
            for (let j = 0; j < size; j++) {
                if (i === j) {
                    // No self-loops
                    tableHTML += `<td><div class="matrix-cell disabled">0</div></td>`;
                } else {
                    tableHTML += `<td><div class="matrix-cell" data-row="${i}" data-col="${j}">
                        <input type="number" class="weight-input" 
                               data-row="${i}" data-col="${j}" 
                               min="0" max="99" value="0">
                    </div></td>`;
                }
            }
            tableHTML += '</tr>';
        }

        tableHTML += '</table>';
        matrixContainer.innerHTML = tableHTML;

        // Add event listeners to weight inputs
        const inputs = document.querySelectorAll('.weight-input');
        inputs.forEach(input => {
            input.addEventListener('input', updateWeight);
            input.addEventListener('focus', function() {
                this.select();
            });
        });

        // Initialize the graph
        graph = new MSTGraph(size);
        graph.setCanvas(graphCanvas);
        graph.draw();

        // Enable buttons
        resetMatrixBtn.disabled = false;
        findMSTBtn.disabled = false;
    }

    // Update weight in the matrix
    function updateWeight(event) {
        const input = event.target;
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        let value = parseInt(input.value);

        // Validate input
        if (isNaN(value) || value < 0) {
            value = 0;
            input.value = "0";
        } else if (value > 99) {
            value = 99;
            input.value = "99";
        }

        // Update matrices
        if (value === 0) {
            currentMatrix[row][col] = 0;
            currentMatrix[col][row] = 0;
            currentWeightMatrix[row][col] = 0;
            currentWeightMatrix[col][row] = 0;
            input.parentElement.classList.remove('has-weight');
            
            // Update symmetric cell
            if (row !== col) {
                const symmetricInput = document.querySelector(`.weight-input[data-row="${col}"][data-col="${row}"]`);
                if (symmetricInput) {
                    symmetricInput.value = "0";
                    symmetricInput.parentElement.classList.remove('has-weight');
                }
            }
        } else {
            currentMatrix[row][col] = 1;
            currentMatrix[col][row] = 1;
            currentWeightMatrix[row][col] = value;
            currentWeightMatrix[col][row] = value;
            input.parentElement.classList.add('has-weight');
            
            // Update symmetric cell
            if (row !== col) {
                const symmetricInput = document.querySelector(`.weight-input[data-row="${col}"][data-col="${row}"]`);
                if (symmetricInput) {
                    symmetricInput.value = value;
                    symmetricInput.parentElement.classList.add('has-weight');
                }
            }
        }

        // Update graph visualization
        graph.loadFromWeightedMatrix(currentMatrix, currentWeightMatrix);
        graph.drawWeightedGraph();
    }

    // Generate random weighted graph
    function generateRandomGraph() {
        const size = parseInt(matrixSizeInput.value);
        if (size < 2 || size > 10) {
            alert('Размер матрицы должен быть от 2 до 10');
            return;
        }

        // Generate random graph
        graph = new MSTGraph();
        graph.generateRandomWeightedGraph(size, 0.5, 10);
        graph.setCanvas(graphCanvas);

        // Get the matrices
        currentMatrix = graph.adjacencyMatrix;
        currentWeightMatrix = graph.weightedMatrix;

        // Update the UI
        generateMatrix(size);
        
        // Fill in the values
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (i !== j && currentMatrix[i][j] === 1) {
                    const input = document.querySelector(`.weight-input[data-row="${i}"][data-col="${j}"]`);
                    if (input) {
                        input.value = currentWeightMatrix[i][j];
                        input.parentElement.classList.add('has-weight');
                    }
                }
            }
        }

        // Draw the graph
        graph.drawWeightedGraph();
    }

    // Load example weighted graph
    function loadExample() {
        const size = 6;
        matrixSizeInput.value = size;

        // Example weighted adjacency matrix
        const example = [
            [0, 4, 0, 0, 0, 2],
            [4, 0, 6, 0, 0, 3],
            [0, 6, 0, 3, 0, 1],
            [0, 0, 3, 0, 5, 0],
            [0, 0, 0, 5, 0, 7],
            [2, 3, 1, 0, 7, 0]
        ];

        generateMatrix(size);

        // Fill the weights
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (i !== j && example[i][j] !== 0) {
                    const input = document.querySelector(`.weight-input[data-row="${i}"][data-col="${j}"]`);
                    if (input) {
                        input.value = example[i][j];
                        input.parentElement.classList.add('has-weight');
                        
                        // Update matrices
                        currentMatrix[i][j] = 1;
                        currentWeightMatrix[i][j] = example[i][j];
                    }
                }
            }
        }

        // Update graph visualization
        graph.loadFromWeightedMatrix(currentMatrix, currentWeightMatrix);
        graph.drawWeightedGraph();
    }

    // Reset matrix
    function resetMatrix() {
        const size = parseInt(matrixSizeInput.value);
        generateMatrix(size);
        
        // Clear results
        mstResult = null;
        resultsContainer.classList.add('hidden');
        
        // Reset view buttons
        setActiveViewButton(viewOriginalBtn);
    }

    // Find minimum spanning tree
    function findMST() {
        // Load current matrix to graph
        graph.loadFromWeightedMatrix(currentMatrix, currentWeightMatrix);
        
        // Find MST
        mstResult = graph.findMinimumSpanningTree();
        
        // Display results
        displayMSTResults();
        
        // Show results container
        resultsContainer.classList.remove('hidden');
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
        
        // Set view to MST
        setActiveViewButton(viewMSTBtn);
        graph.drawMST();
    }

    // Display MST results
    function displayMSTResults() {
        if (!mstResult) return;
        
        let html = '';
        
        if (!mstResult.connected) {
            html += `<div class="mst-not-connected">
                <p>Граф несвязный, невозможно построить минимальное остовное дерево</p>
                <p>Количество компонент связности: ${mstResult.components.length}</p>
            </div>`;
        } else {
            html += `<p>Ребра минимального остовного дерева:</p>`;
            html += `<ul class="mst-edge-list">`;
            
            mstResult.edges.forEach(edge => {
                html += `<li>
                    <span class="edge-vertices">(${edge.from + 1}, ${edge.to + 1})</span>
                    <span class="edge-weight">Вес: ${edge.weight}</span>
                </li>`;
            });
            
            html += `</ul>`;
            html += `<div class="mst-total">Общий вес: ${mstResult.totalWeight}</div>`;
        }
        
        mstResultContainer.innerHTML = html;
        
        // Display algorithm details
        displayAlgorithmDetails();
    }

    // Display algorithm details
    function displayAlgorithmDetails() {
        if (!mstResult || !mstResult.steps) return;
        
        let html = `<p>Алгоритм Прима для нахождения MST:</p>`;
        
        html += `<div class="algorithm-steps">`;
        mstResult.steps.forEach((step, index) => {
            html += `<div class="algorithm-step" data-step="${index}">
                <p><strong>Шаг ${index + 1}:</strong> ${step.description}</p>
                <p>Вершины в MST: ${step.verticesInMST.map(v => v + 1).join(', ')}</p>
            </div>`;
        });
        html += `</div>`;
        
        if (mstResult.steps.length > 0) {
            html += `<div class="step-controls">
                <button id="prev-step" class="btn secondary">←</button>
                <button id="play-steps" class="btn primary">Воспроизвести</button>
                <button id="next-step" class="btn secondary">→</button>
            </div>`;
            html += `<div class="step-info" id="step-info">Шаг 1 из ${mstResult.steps.length}</div>`;
        }
        
        algorithmDetailsContainer.innerHTML = html;
        
        // Add event listeners for step controls
        const prevStepBtn = document.getElementById('prev-step');
        const nextStepBtn = document.getElementById('next-step');
        const playStepsBtn = document.getElementById('play-steps');
        
        if (prevStepBtn && nextStepBtn && playStepsBtn) {
            prevStepBtn.addEventListener('click', showPreviousStep);
            nextStepBtn.addEventListener('click', showNextStep);
            playStepsBtn.addEventListener('click', togglePlaySteps);
        }
    }

    // Show a specific step in the algorithm
    function showStep(stepIndex) {
        if (!mstResult || !mstResult.steps) return;
        
        // Validate step index
        currentStep = Math.max(0, Math.min(stepIndex, mstResult.steps.length - 1));
        
        // Update step info
        const stepInfo = document.getElementById('step-info');
        if (stepInfo) {
            stepInfo.textContent = `Шаг ${currentStep + 1} из ${mstResult.steps.length}`;
        }
        
        // Highlight current step in the details
        const stepElements = document.querySelectorAll('.algorithm-step');
        stepElements.forEach((el, index) => {
            el.classList.toggle('active', index === currentStep);
        });
        
        // Draw the step
        graph.drawMSTStep(currentStep);
    }

    // Show previous step
    function showPreviousStep() {
        showStep(currentStep - 1);
    }

    // Show next step
    function showNextStep() {
        showStep(currentStep + 1);
    }

    // Toggle automatic step playback
    function togglePlaySteps() {
        const playBtn = document.getElementById('play-steps');
        
        if (stepInterval) {
            // Stop playback
            clearInterval(stepInterval);
            stepInterval = null;
            playBtn.textContent = 'Воспроизвести';
        } else {
            // Start playback
            currentStep = 0;
            showStep(currentStep);
            
            playBtn.textContent = 'Стоп';
            stepInterval = setInterval(() => {
                if (currentStep >= mstResult.steps.length - 1) {
                    // End of steps, stop playback
                    clearInterval(stepInterval);
                    stepInterval = null;
                    playBtn.textContent = 'Воспроизвести';
                } else {
                    // Show next step
                    showStep(currentStep + 1);
                }
            }, 1500);
        }
    }

    // Set active view button
    function setActiveViewButton(activeBtn) {
        [viewOriginalBtn, viewMSTBtn, viewStepByStepBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    // View handlers
    function viewOriginal() {
        setActiveViewButton(viewOriginalBtn);
        graph.drawWeightedGraph();
        stopStepPlayback();
    }

    function viewMST() {
        if (!mstResult) {
            alert('Сначала найдите минимальное остовное дерево');
            return;
        }
        
        setActiveViewButton(viewMSTBtn);
        graph.drawMST();
        stopStepPlayback();
    }

    function viewStepByStep() {
        if (!mstResult || !mstResult.steps || mstResult.steps.length === 0) {
            alert('Сначала найдите минимальное остовное дерево');
            return;
        }
        
        setActiveViewButton(viewStepByStepBtn);
        currentStep = 0;
        showStep(currentStep);
    }

    // Stop step playback
    function stopStepPlayback() {
        if (stepInterval) {
            clearInterval(stepInterval);
            stepInterval = null;
            
            const playBtn = document.getElementById('play-steps');
            if (playBtn) {
                playBtn.textContent = 'Воспроизвести';
            }
        }
    }

    // Event listeners
    generateMatrixBtn.addEventListener('click', () => {
        const size = parseInt(matrixSizeInput.value);
        generateMatrix(size);
    });

    generateRandomBtn.addEventListener('click', generateRandomGraph);
    resetMatrixBtn.addEventListener('click', resetMatrix);
    loadExampleBtn.addEventListener('click', loadExample);
    findMSTBtn.addEventListener('click', findMST);

    viewOriginalBtn.addEventListener('click', viewOriginal);
    viewMSTBtn.addEventListener('click', viewMST);
    viewStepByStepBtn.addEventListener('click', viewStepByStep);

    // Handle window resize
    window.addEventListener('resize', initCanvas);

    // Initialize the UI
    generateMatrix(parseInt(matrixSizeInput.value));
});