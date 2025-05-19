import Graph from './graph.js';

document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const matrixSizeInput = document.getElementById('matrix-size');
    const generateMatrixBtn = document.getElementById('generate-matrix');
    const matrixContainer = document.getElementById('matrix-container');
    const analyzeGraphBtn = document.getElementById('analyze-graph');
    const resetMatrixBtn = document.getElementById('reset-matrix');
    const loadExampleBtn = document.getElementById('load-example');
    const resultsContainer = document.getElementById('results-container');
    const graphCanvas = document.getElementById('graph-canvas');
    const representationSelect = document.getElementById('graph-representation');
    const viewDefaultBtn = document.getElementById('view-default');
    const viewComponentsBtn = document.getElementById('view-components');
    const componentsCount = document.getElementById('components-count');
    const componentsDetails = document.getElementById('components-details');
    const componentsLegend = document.getElementById('components-legend');

    // Graph instance and data
    let graph = new Graph();
    let currentMatrix = [];
    let currentIncidenceMatrix = [];
    let currentAdjLists = [];
    let components = [];

    function initCanvas() {
        if (!graphCanvas) return;

        // Make sure the container is visible before measuring
        if (resultsContainer.classList.contains('hidden')) {
            resultsContainer.style.visibility = 'hidden';
            resultsContainer.classList.remove('hidden');
        }

        const container = graphCanvas.parentElement;
        const containerWidth = container.clientWidth;
        const size = Math.min(containerWidth, 600);

        // Set both HTML attributes and CSS styles
        graphCanvas.width = size;
        graphCanvas.height = size;
        graphCanvas.style.width = size + 'px';
        graphCanvas.style.height = size + 'px';

        // Configure graph with canvas
        graph.setCanvas(graphCanvas);

        // Hide container again if it was hidden
        if (resultsContainer.style.visibility === 'hidden') {
            resultsContainer.classList.add('hidden');
            resultsContainer.style.visibility = '';
        }

        // Redraw if we have data
        if (components.length > 0) {
            graph.drawConnectedComponents(components);
        } else if (currentMatrix.length > 0) {
            graph.loadFromAdjacencyMatrix(currentMatrix);
            graph.draw();
        }
    }

    // Initialize canvas and handle window resize
    initCanvas();
    window.addEventListener('resize', initCanvas);

    function generateInput(size) {
        if (size < 1 || size > 20) {
            alert('Размер матрицы должен быть от 1 до 20');
            return;
        }

        const representation = representationSelect.value;

        switch (representation) {
            case 'adjacency':
                generateAdjacencyMatrix(size);
                break;
            case 'incidence':
                generateIncidenceMatrix(size);
                break;
            case 'lists':
                generateAdjacencyLists(size);
                break;
        }

        analyzeGraphBtn.disabled = false;
        resetMatrixBtn.disabled = false;
        initCanvas();
    }

    function generateAdjacencyMatrix(size) {
        currentMatrix = graph.createAdjacencyMatrix(size);

        let tableHTML = '<table class="matrix-table">';
        tableHTML += '<tr><th></th>';
        for (let i = 0; i < size; i++) {
            tableHTML += `<th>${i + 1}</th>`;
        }
        tableHTML += '</tr>';

        for (let i = 0; i < size; i++) {
            tableHTML += `<tr><th>${i + 1}</th>`;
            for (let j = 0; j < size; j++) {
                tableHTML += `<td><div class="matrix-cell" data-row="${i}" data-col="${j}">0</div></td>`;
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</table>';
        matrixContainer.innerHTML = tableHTML;

        const cells = document.querySelectorAll('.matrix-cell');
        cells.forEach(cell => {
            cell.addEventListener('click', toggleAdjacencyCell);
        });
    }

    function generateIncidenceMatrix(size) {
        currentIncidenceMatrix = graph.createIncidenceMatrix(size);
        const maxEdges = (size * (size - 1)) / 2;

        let tableHTML = '<table class="matrix-table">';
        tableHTML += '<tr><th>V\\E</th>';
        for (let i = 0; i < maxEdges; i++) {
            tableHTML += `<th>e${i + 1}</th>`;
        }
        tableHTML += '</tr>';

        for (let i = 0; i < size; i++) {
            tableHTML += `<tr><th>${i + 1}</th>`;
            for (let j = 0; j < maxEdges; j++) {
                tableHTML += `<td><div class="matrix-cell incidence" data-vertex="${i}" data-edge="${j}">0</div></td>`;
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</table>';
        matrixContainer.innerHTML = tableHTML;

        const cells = document.querySelectorAll('.matrix-cell.incidence');
        cells.forEach(cell => {
            cell.addEventListener('click', toggleIncidenceCell);
        });
    }

    function generateAdjacencyLists(size) {
        currentAdjLists = graph.createAdjacencyLists(size);

        let html = '<div class="adjacency-lists">';
        for (let i = 0; i < size; i++) {
            html += `
                <div class="list-row">
                    <span class="vertex-label">${i + 1}:</span>
                    <input type="text" class="list-input" data-vertex="${i}" 
                           placeholder="Введите номера смежных вершин через пробел">
                </div>
            `;
        }
        html += '</div>';
        matrixContainer.innerHTML = html;

        const inputs = document.querySelectorAll('.list-input');
        inputs.forEach(input => {
            input.addEventListener('change', updateAdjacencyList);
        });
    }

    function toggleAdjacencyCell(event) {
        const cell = event.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        currentMatrix[row][col] = currentMatrix[row][col] === 0 ? 1 : 0;
        cell.textContent = currentMatrix[row][col];
        cell.classList.toggle('active', currentMatrix[row][col] === 1);

        if (row !== col) {
            const symmetricCell = document.querySelector(`.matrix-cell[data-row="${col}"][data-col="${row}"]`);
            currentMatrix[col][row] = currentMatrix[row][col];
            symmetricCell.textContent = currentMatrix[col][row];
            symmetricCell.classList.toggle('active', currentMatrix[col][row] === 1);
        }

        graph.loadFromAdjacencyMatrix(currentMatrix);
        graph.draw();
    }

    function toggleIncidenceCell(event) {
        const cell = event.target;
        const vertex = parseInt(cell.dataset.vertex);
        const edge = parseInt(cell.dataset.edge);

        const currentValue = parseInt(cell.textContent);
        const newValue = (currentValue + 1) % 2;

        currentIncidenceMatrix[vertex][edge] = newValue;
        cell.textContent = newValue;
        cell.classList.toggle('active', newValue === 1);

        graph.loadFromIncidenceMatrix(currentIncidenceMatrix);
        graph.draw();
    }

    function updateAdjacencyList(event) {
        const input = event.target;
        const vertex = parseInt(input.dataset.vertex);
        const values = input.value.trim().split(/\s+/).map(v => parseInt(v) - 1);

        if (values.some(v => isNaN(v) || v < 0 || v >= currentAdjLists.length)) {
            alert('Неверный формат ввода. Используйте числа от 1 до ' + currentAdjLists.length);
            return;
        }

        currentAdjLists[vertex] = values;
        graph.loadFromAdjacencyLists(currentAdjLists);
        graph.draw();
    }

    function resetInput() {
        const size = parseInt(matrixSizeInput.value);
        const representation = representationSelect.value;

        switch (representation) {
            case 'adjacency':
                currentMatrix = graph.createAdjacencyMatrix(size);
                document.querySelectorAll('.matrix-cell').forEach(cell => {
                    cell.textContent = '0';
                    cell.classList.remove('active');
                });
                graph.loadFromAdjacencyMatrix(currentMatrix);
                break;

            case 'incidence':
                currentIncidenceMatrix = graph.createIncidenceMatrix(size);
                document.querySelectorAll('.matrix-cell.incidence').forEach(cell => {
                    cell.textContent = '0';
                    cell.classList.remove('active');
                });
                graph.loadFromIncidenceMatrix(currentIncidenceMatrix);
                break;

            case 'lists':
                currentAdjLists = graph.createAdjacencyLists(size);
                document.querySelectorAll('.list-input').forEach(input => {
                    input.value = '';
                });
                graph.loadFromAdjacencyLists(currentAdjLists);
                break;
        }

        resultsContainer.classList.add('hidden');
        components = [];
        graph.draw();
    }

    function loadExample() {
        const exampleSize = 8;
        matrixSizeInput.value = exampleSize;

        const example = [
            [0, 1, 0, 0, 0, 0, 0, 0],
            [1, 0, 1, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 0, 0],
            [0, 0, 0, 1, 0, 1, 0, 0],
            [0, 0, 0, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0, 1, 0]
        ];

        representationSelect.value = 'adjacency';
        generateInput(exampleSize);

        for (let i = 0; i < exampleSize; i++) {
            for (let j = 0; j < exampleSize; j++) {
                currentMatrix[i][j] = example[i][j];
                const cell = document.querySelector(`.matrix-cell[data-row="${i}"][data-col="${j}"]`);
                cell.textContent = example[i][j];
                cell.classList.toggle('active', example[i][j] === 1);
            }
        }

        graph.loadFromAdjacencyMatrix(currentMatrix);
        graph.draw();
    }

    function analyzeGraph() {
        let adjMatrix;
        const representation = representationSelect.value;

        switch (representation) {
            case 'adjacency':
                adjMatrix = currentMatrix;
                break;
            case 'incidence':
                adjMatrix = graph.incidenceToAdjacency(currentIncidenceMatrix);
                break;
            case 'lists':
                adjMatrix = graph.listsToAdjacency(currentAdjLists);
                break;
        }

        // Show results container before initializing canvas
        resultsContainer.classList.remove('hidden');
        
        graph.loadFromAdjacencyMatrix(adjMatrix);
        components = graph.findConnectedComponents();
        
        // Initialize canvas after container is visible
        initCanvas();
        
        displayResults();
        graph.drawConnectedComponents(components);
        
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    function displayResults() {
        componentsCount.textContent = components.length;
        componentsCount.classList.add('animate');
        setTimeout(() => componentsCount.classList.remove('animate'), 500);
        
        displayComponentDetails();
        createLegend();
    }

    function displayComponentDetails() {
        let html = '';
        
        components.forEach((component, index) => {
            const color = graph.colors.connected[index % graph.colors.connected.length];
            
            html += `
                <div class="component-item" style="border-left-color: ${color}">
                    <div class="component-header">
                        <div class="component-title">Компонента ${index + 1}</div>
                        <div class="component-badge">${component.length} ${getVerticesWord(component.length)}</div>
                    </div>
                    <div class="component-vertices">
                        Вершины: ${component.map(v => v + 1).join(', ')}
                    </div>
                </div>
            `;
        });
        
        componentsDetails.innerHTML = html;
    }

    function createLegend() {
        let html = '';
        
        components.forEach((component, index) => {
            const color = graph.colors.connected[index % graph.colors.connected.length];
            
            html += `
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${color}"></div>
                    <span>Компонента ${index + 1}</span>
                </div>
            `;
        });
        
        componentsLegend.innerHTML = html;
    }

    function getVerticesWord(count) {
        if (count % 10 === 1 && count % 100 !== 11) {
            return "вершина";
        } else if ((count % 10 === 2 || count % 10 === 3 || count % 10 === 4) && 
                   (count % 100 < 10 || count % 100 >= 20)) {
            return "вершины";
        } else {
            return "вершин";
        }
    }

    generateMatrixBtn.addEventListener('click', () => {
        const size = parseInt(matrixSizeInput.value);
        generateInput(size);
    });

    representationSelect.addEventListener('change', () => {
        const size = parseInt(matrixSizeInput.value);
        generateInput(size);
    });

    analyzeGraphBtn.addEventListener('click', analyzeGraph);
    resetMatrixBtn.addEventListener('click', resetInput);
    loadExampleBtn.addEventListener('click', loadExample);

    viewDefaultBtn.addEventListener('click', () => {
        graph.draw();
    });
    
    viewComponentsBtn.addEventListener('click', () => {
        if (components.length > 0) {
            graph.drawConnectedComponents(components);
        }
    });
});