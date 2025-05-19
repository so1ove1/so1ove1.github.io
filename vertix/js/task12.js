import Graph from '/vertix/js/graph.js';

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const matrixSizeInput = document.getElementById('matrix-size');
    const generateMatrixBtn = document.getElementById('generate-matrix');
    const resetMatrixBtn = document.getElementById('reset-matrix');
    const loadExampleBtn = document.getElementById('load-example');
    const colorGraphBtn = document.getElementById('color-graph');
    const matrixContainer = document.getElementById('matrix-container');
    const resultsContainer = document.getElementById('results-container');
    const graphCanvas = document.getElementById('graph-canvas');

    // Coloring Controls
    const startColoringBtn = document.getElementById('start-coloring');
    const stepColoringBtn = document.getElementById('step-coloring');
    const restartColoringBtn = document.getElementById('restart-coloring');
    const animationSpeedInput = document.getElementById('animation-speed');
    const currentStepEl = document.getElementById('current-step');
    const currentVertexEl = document.getElementById('current-vertex');
    const currentColorEl = document.getElementById('current-color');
    const vertexColorsEl = document.getElementById('vertex-colors');

    // State Variables
    let graph = null;
    let matrixSize = 5;
    let matrixData = [];
    let coloringInterval = null;
    let animationSpeed = 5;
    let coloringState = {
        colors: [],           // Colors assigned to vertices
        currentVertex: null,
        step: 0,
        isRunning: false,
        complete: false
    };

    // Color palette for vertices
    const colorPalette = [
        { name: 'Красный', hex: '#ef4444' },
        { name: 'Синий', hex: '#3b82f6' },
        { name: 'Зелёный', hex: '#10b981' },
        { name: 'Жёлтый', hex: '#eab308' },
        { name: 'Фиолетовый', hex: '#8b5cf6' },
        { name: 'Оранжевый', hex: '#f97316' },
        { name: 'Розовый', hex: '#ec4899' },
        { name: 'Голубой', hex: '#06b6d4' }
    ];

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
        colorGraphBtn.disabled = false;
    }

    // Load Example Graph
    function loadExample() {
        matrixSize = 5;
        matrixSizeInput.value = matrixSize;
        
        // Create the matrix UI first
        createMatrixInput();
        
        // Example graph
        const exampleEdges = [
            [0, 1], [0, 2], [1, 2], [1, 3],
            [2, 3], [3, 4]
        ];
        
        // Update the UI and data
        for (const [i, j] of exampleEdges) {
            matrixData[i][j] = 1;
            matrixData[j][i] = 1;
            
            const cell = document.querySelector(`.matrix-cell[data-row="${i}"][data-col="${j}"]`);
            if (cell) {
                cell.textContent = '1';
                cell.classList.add('active');
            }
            
            const symmetricCell = document.querySelector(`.matrix-cell[data-row="${j}"][data-col="${i}"]`);
            if (symmetricCell) {
                symmetricCell.textContent = '1';
                symmetricCell.classList.add('active');
            }
        }
    }

    // Reset Matrix
    function resetMatrix() {
        matrixContainer.innerHTML = '';
        matrixData = [];
        createMatrixInput();
    }

    // Color Graph
    function colorGraph() {
        initGraph();
        graph.loadFromAdjacencyMatrix(matrixData);
        
        // Show results container
        resultsContainer.classList.remove('hidden');
        
        // Reset coloring state
        resetColoringState();
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Reset coloring state
    function resetColoringState() {
        clearInterval(coloringInterval);
        
        coloringState = {
            colors: Array(matrixSize).fill(-1),  // -1 means no color assigned
            currentVertex: 0,
            step: 0,
            isRunning: false,
            complete: false
        };
        
        // Update UI
        currentStepEl.textContent = '0';
        currentVertexEl.textContent = '-';
        currentColorEl.textContent = '-';
        vertexColorsEl.innerHTML = '<p>Раскраска не начата</p>';
        
        // Draw initial state
        drawColoringState();
    }

    // Draw current coloring state
    function drawColoringState() {
        graph.draw();
        
        // Draw vertices with colors
        const ctx = graph.ctx;
        
        for (let i = 0; i < matrixSize; i++) {
            let nodeColor = '#3b82f6'; // Default blue for uncolored
            
            if (i === coloringState.currentVertex) {
                nodeColor = '#f97316'; // Orange for current vertex
            } else if (coloringState.colors[i] !== -1) {
                nodeColor = colorPalette[coloringState.colors[i]].hex;
            }
            
            graph.drawNode(i, nodeColor);
        }
    }

    // Find first available color for vertex
    function findAvailableColor(vertex) {
        const used = new Set();
        
        // Check colors of adjacent vertices
        for (let i = 0; i < matrixSize; i++) {
            if (matrixData[vertex][i] === 1 && coloringState.colors[i] !== -1) {
                used.add(coloringState.colors[i]);
            }
        }
        
        // Find first unused color
        for (let color = 0; color < colorPalette.length; color++) {
            if (!used.has(color)) {
                return color;
            }
        }
        
        return -1; // Should never happen with our color palette size
    }

    // Perform one step of graph coloring
    function stepColoring() {
        if (coloringState.complete) {
            return false;
        }
        
        coloringState.step++;
        currentStepEl.textContent = coloringState.step;
        
        if (coloringState.currentVertex < matrixSize) {
            currentVertexEl.textContent = coloringState.currentVertex + 1;
            
            // Find available color
            const color = findAvailableColor(coloringState.currentVertex);
            coloringState.colors[coloringState.currentVertex] = color;
            currentColorEl.textContent = colorPalette[color].name;
            
            // Update vertex colors list
            if (vertexColorsEl.querySelector('p')) {
                vertexColorsEl.innerHTML = '<ul></ul>';
            }
            
            const ul = vertexColorsEl.querySelector('ul');
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="color-indicator" style="background-color: ${colorPalette[color].hex}"></div>
                <span>Вершина ${coloringState.currentVertex + 1}: ${colorPalette[color].name}</span>
            `;
            ul.appendChild(li);
            
            coloringState.currentVertex++;
        }
        
        if (coloringState.currentVertex === matrixSize) {
            coloringState.complete = true;
            currentVertexEl.textContent = 'Завершено';
            currentColorEl.textContent = '-';
        }
        
        // Draw updated state
        drawColoringState();
        return !coloringState.complete;
    }

    // Start automated coloring
    function startColoring() {
        if (coloringState.isRunning) {
            stopColoring();
            return;
        }
        
        coloringState.isRunning = true;
        startColoringBtn.textContent = 'Пауза';
        
        const interval = 1100 - (animationSpeed * 100);
        
        coloringInterval = setInterval(() => {
            if (!stepColoring()) {
                stopColoring();
            }
        }, interval);
    }

    // Stop coloring animation
    function stopColoring() {
        clearInterval(coloringInterval);
        coloringState.isRunning = false;
        startColoringBtn.textContent = 'Продолжить';
    }

    // Event Listeners
    generateMatrixBtn.addEventListener('click', function() {
        matrixSize = parseInt(matrixSizeInput.value);
        createMatrixInput();
    });
    
    resetMatrixBtn.addEventListener('click', resetMatrix);
    loadExampleBtn.addEventListener('click', loadExample);
    colorGraphBtn.addEventListener('click', colorGraph);
    
    startColoringBtn.addEventListener('click', startColoring);
    stepColoringBtn.addEventListener('click', function() {
        stopColoring();
        stepColoring();
    });
    restartColoringBtn.addEventListener('click', resetColoringState);
    
    animationSpeedInput.addEventListener('input', function() {
        animationSpeed = parseInt(this.value);
        if (coloringState.isRunning) {
            stopColoring();
            startColoring();
        }
    });
    
    // Initialize
    matrixSize = parseInt(matrixSizeInput.value);
    initGraph();
});