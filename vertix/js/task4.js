import Graph from '/vertix/js/graph.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const graphSizeInput = document.getElementById('graph-size');
    const graphRepresentationSelect = document.getElementById('graph-representation-type');
    const generateGraphButton = document.getElementById('generate-random-graph');
    const graphMatrixContainer = document.getElementById('graph-matrix-container');
    const graphContainer = document.getElementById('graph-container');
    const startVertexSelect = document.getElementById('start-vertex');
    const userSequenceInput = document.getElementById('user-sequence');
    const checkSequenceButton = document.getElementById('check-sequence');
    const showSolutionButton = document.getElementById('show-solution');
    const validationResult = document.getElementById('validation-result');
    const graphCanvas = document.getElementById('graph-canvas');

    // Graph state
    let graph = null;
    let correctBfsSequence = [];
    let startVertex = 0;
    let nodeColors = [];
    let bfsLevels = []; // Array to store vertices by BFS level
    
    // Generate random graph
    generateGraphButton.addEventListener('click', function() {
        const size = parseInt(graphSizeInput.value);
        const representationType = graphRepresentationSelect.value;
        
        generateRandomGraph(size, representationType);
    });

    // Change representation type
    graphRepresentationSelect.addEventListener('change', function() {
        if (graph) {
            updateGraphRepresentation(graphRepresentationSelect.value);
        }
    });

    // Change starting vertex
    startVertexSelect.addEventListener('change', function() {
        startVertex = parseInt(startVertexSelect.value) - 1; // Convert to 0-based index
        calculateCorrectBfsSequence();
        resetNodeColors();
        graph.draw();
    });

    // Check user sequence
    checkSequenceButton.addEventListener('click', function() {
        validateUserSequence();
    });

    // Show solution
    showSolutionButton.addEventListener('click', function() {
        showSolution();
    });

    // Generate a random graph
    function generateRandomGraph(size) {
        // Create new graph instance
        graph = new Graph(size);
        
        // Generate random adjacency matrix
        const adjMatrix = createRandomAdjacencyMatrix(size);
        
        // Load the graph
        graph.loadFromAdjacencyMatrix(adjMatrix);
        
        // Update representation based on selected type
        updateGraphRepresentation(graphRepresentationSelect.value);
        
        // Setup graph visualization
        setupGraphVisualization();
        
        // Update starting vertex dropdown
        populateStartVertexDropdown(size);
        
        // Calculate correct BFS sequence
        calculateCorrectBfsSequence();
        
        // Reset validation result
        resetValidation();
        
        // Show graph container
        graphContainer.classList.remove('hidden');
    }

    // Create random adjacency matrix
    function createRandomAdjacencyMatrix(size) {
        const matrix = Array(size).fill().map(() => Array(size).fill(0));
        
        for (let i = 0; i < size; i++) {
            for (let j = i + 1; j < size; j++) {
                if (Math.random() < 0.5) {
                    matrix[i][j] = 1;
                    matrix[j][i] = 1;
                }
            }
        }
        
        return matrix;
    }

    // Update graph representation display
    function updateGraphRepresentation(representationType) {
        if (representationType === 'adjacency') {
            displayAdjacencyMatrix(graph.adjacencyMatrix);
        } else if (representationType === 'incidence') {
            const incMatrix = adjacencyToIncidence(graph.adjacencyMatrix);
            displayIncidenceMatrix(incMatrix);
        } else if (representationType === 'lists') {
            const adjLists = adjacencyToLists(graph.adjacencyMatrix);
            displayAdjacencyLists(adjLists);
        }
    }

    // Convert adjacency matrix to incidence matrix
    function adjacencyToIncidence(adjMatrix) {
        const size = adjMatrix.length;
        let edgeCount = 0;
        
        // Count edges
        for (let i = 0; i < size; i++) {
            for (let j = i + 1; j < size; j++) {
                if (adjMatrix[i][j] === 1) {
                    edgeCount++;
                }
            }
        }
        
        // Create incidence matrix
        const incMatrix = Array(size).fill().map(() => Array(edgeCount).fill(0));
        
        // Fill incidence matrix
        let edgeIdx = 0;
        for (let i = 0; i < size; i++) {
            for (let j = i + 1; j < size; j++) {
                if (adjMatrix[i][j] === 1) {
                    incMatrix[i][edgeIdx] = 1;
                    incMatrix[j][edgeIdx] = 1;
                    edgeIdx++;
                }
            }
        }
        
        return incMatrix;
    }

    // Convert adjacency matrix to adjacency lists
    function adjacencyToLists(adjMatrix) {
        const size = adjMatrix.length;
        const lists = Array(size).fill().map(() => []);
        
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (adjMatrix[i][j] === 1) {
                    lists[i].push(j);
                }
            }
            lists[i].sort((a, b) => a - b);
        }
        
        return lists;
    }

    // Display adjacency matrix
    function displayAdjacencyMatrix(matrix) {
        const size = matrix.length;
        let html = '<h4>Матрица смежности</h4>';
        html += '<table>';
        
        // Header row
        html += '<tr><th></th>';
        for (let i = 0; i < size; i++) {
            html += `<th>${i + 1}</th>`;
        }
        html += '</tr>';
        
        // Matrix rows
        for (let i = 0; i < size; i++) {
            html += `<tr><th>${i + 1}</th>`;
            for (let j = 0; j < size; j++) {
                html += `<td>${matrix[i][j]}</td>`;
            }
            html += '</tr>';
        }
        
        html += '</table>';
        graphMatrixContainer.innerHTML = html;
    }

    // Display incidence matrix
    function displayIncidenceMatrix(matrix) {
        const vertices = matrix.length;
        const edges = matrix[0].length;
        let html = '<h4>Матрица инцидентности</h4>';
        html += '<table>';
        
        // Header row
        html += '<tr><th>Вершина/Ребро</th>';
        for (let e = 0; e < edges; e++) {
            html += `<th>e${e + 1}</th>`;
        }
        html += '</tr>';
        
        // Matrix rows
        for (let v = 0; v < vertices; v++) {
            html += `<tr><th>${v + 1}</th>`;
            for (let e = 0; e < edges; e++) {
                html += `<td>${matrix[v][e]}</td>`;
            }
            html += '</tr>';
        }
        
        html += '</table>';
        graphMatrixContainer.innerHTML = html;
    }

    // Display adjacency lists
    function displayAdjacencyLists(lists) {
        const size = lists.length;
        let html = '<h4>Списки смежности</h4>';
        html += '<table>';
        
        // List rows
        for (let i = 0; i < size; i++) {
            const neighbors = lists[i].map(n => n + 1).join(', ');
            html += `<tr><th>${i + 1}</th><td>[${neighbors}]</td></tr>`;
        }
        
        html += '</table>';
        graphMatrixContainer.innerHTML = html;
    }

    // Setup graph visualization
    function setupGraphVisualization() {
        // Set canvas
        graph.setCanvas(graphCanvas);
        
        // Initialize node colors for all nodes as default color
        resetNodeColors();
        
        // Draw the graph
        graph.draw();
    }

    // Reset node colors to default
    function resetNodeColors() {
        const size = graph.size;
        nodeColors = Array(size).fill(null);
    }

    // Populate starting vertex dropdown
    function populateStartVertexDropdown(size) {
        startVertexSelect.innerHTML = '';
        
        for (let i = 0; i < size; i++) {
            const option = document.createElement('option');
            option.value = i + 1;
            option.textContent = `Вершина ${i + 1}`;
            startVertexSelect.appendChild(option);
        }
        
        // Set default starting vertex
        startVertex = 0;
    }

    // Calculate correct BFS sequence
    function calculateCorrectBfsSequence() {
        correctBfsSequence = [];
        bfsLevels = [];
        const size = graph.size;
        const visited = Array(size).fill(false);
        const queue = [];
        
        // Mark the starting vertex as visited and enqueue it
        visited[startVertex] = true;
        queue.push(startVertex);
        correctBfsSequence.push(startVertex);
        
        // Store current level vertices
        let currentLevel = [startVertex];
        bfsLevels.push(currentLevel);
        
        // For tracking next level vertices
        let nextLevel = [];
        
        while (queue.length > 0) {
            // Dequeue a vertex
            const currentVertex = queue.shift();
            
            // Get all adjacent vertices of the dequeued vertex
            // If an adjacent vertex has not been visited, mark it as visited and enqueue it
            const neighbors = [];
            for (let i = 0; i < size; i++) {
                if (graph.adjacencyMatrix[currentVertex][i] === 1) {
                    neighbors.push(i);
                }
            }
            
            // Sort neighbors to ensure consistent traversal order
            neighbors.sort((a, b) => a - b);
            
            // Process all unvisited neighbors
            for (const neighbor of neighbors) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    queue.push(neighbor);
                    correctBfsSequence.push(neighbor);
                    nextLevel.push(neighbor);
                }
            }
            
            // If we've processed all vertices in the current level
            if (queue.length > 0 && !currentLevel.includes(queue[0])) {
                if (nextLevel.length > 0) {
                    bfsLevels.push(nextLevel.slice());
                    currentLevel = nextLevel;
                    nextLevel = [];
                }
            }
        }
    }

    // Validate user sequence
    function validateUserSequence() {
        // Parse user input
        const userInput = userSequenceInput.value.trim();
        const userSequence = parseUserInput(userInput);
        
        if (userSequence.length === 0) {
            showErrorMessage("Пожалуйста, введите последовательность вершин.");
            return;
        }
        
        // Validate sequence
        const isValid = validateSequence(userSequence);
        
        // Display result
        displayValidationResult(userSequence, isValid);
    }

    // Parse user input
    function parseUserInput(input) {
        // Allow both comma and space separated values
        const values = input.split(/[\s,]+/);
        
        // Convert to numbers and adjust to 0-based indexing
        return values
            .filter(v => v.trim() !== '')
            .map(v => parseInt(v.trim()) - 1)
            .filter(v => !isNaN(v) && v >= 0 && v < graph.size);
    }

    // Validate BFS sequence
    function validateSequence(userSequence) {
        // Basic validation - check if lengths match
        if (userSequence.length !== correctBfsSequence.length) {
            return false;
        }
        
        // Check if user's sequence follows BFS ordering
        for (let i = 0; i < userSequence.length; i++) {
            if (userSequence[i] !== correctBfsSequence[i]) {
                return false;
            }
        }
        
        return true;
    }

    // Display validation result
    function displayValidationResult(userSequence, isValid) {
        validationResult.classList.remove('hidden', 'correct', 'incorrect');
        
        // Prepare result content
        let resultHTML = '';
        
        if (isValid) {
            validationResult.classList.add('correct');
            resultHTML = `
                <div class="result-icon">✅</div>
                <div class="result-message">Правильно!</div>
                <p>Ваша последовательность обхода в ширину верна.</p>
            `;
        } else {
            validationResult.classList.add('incorrect');
            resultHTML = `
                <div class="result-icon">❌</div>
                <div class="result-message">Неверно!</div>
                <p>Ваша последовательность обхода не соответствует алгоритму BFS.</p>
                <div class="sequence-comparison">
                    <div class="sequence-row">
                        <div class="sequence-label">Ваш ответ:</div>
                        <div class="sequence-vertices">
                            ${userSequence.map((v, i) => {
                                const isCorrect = i < correctBfsSequence.length && v === correctBfsSequence[i];
                                return `<div class="vertex-chip ${isCorrect ? 'correct' : 'incorrect'}">${v + 1}</div>`;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            // Color nodes on graph based on validation
            colorNodesBasedOnValidation(userSequence);
        }
        
        // Set content and show result
        validationResult.querySelector('.result-content').innerHTML = resultHTML;
        validationResult.classList.add('show');
    }

    // Show error message
    function showErrorMessage(message) {
        validationResult.classList.remove('hidden', 'correct', 'incorrect');
        validationResult.classList.add('incorrect', 'show');
        
        validationResult.querySelector('.result-content').innerHTML = `
            <div class="result-icon">⚠️</div>
            <div class="result-message">Ошибка</div>
            <p>${message}</p>
        `;
    }

    // Show solution
    function showSolution() {
        validationResult.classList.remove('hidden', 'correct', 'incorrect');
        validationResult.classList.add('show');
        
        const formattedSequence = correctBfsSequence.map(v => v + 1).join(', ');
        
        // Create BFS level visualization
        let levelVisualization = '';
        bfsLevels.forEach((level, index) => {
            levelVisualization += `
                <div class="level-row">
                    <div class="level-label">Уровень ${index}:</div>
                    <div class="level-vertices">
                        ${level.map(v => `<div class="vertex-chip" style="background-color: #3b82f6;">${v + 1}</div>`).join('')}
                    </div>
                </div>
            `;
        });
        
        validationResult.querySelector('.result-content').innerHTML = `
            <div class="result-icon">💡</div>
            <div class="result-message">Правильный ответ</div>
            <p>Правильная последовательность обхода в ширину, начиная с вершины ${startVertex + 1}:</p>
            <div class="correct-sequence">${formattedSequence}</div>
            
            <div class="sequence-level-container">
                <h4>Распределение по уровням BFS:</h4>
                <div class="level-visualization">
                    ${levelVisualization}
                </div>
            </div>
        `;
        
        // Color nodes to show correct sequence with BFS levels
        colorNodesForCorrectSequence();
    }

    // Color nodes based on validation results
    function colorNodesBasedOnValidation(userSequence) {
        resetNodeColors();
        
        // Determine how many vertices to check (min of user and correct sequences)
        const length = Math.min(userSequence.length, correctBfsSequence.length);
        
        for (let i = 0; i < length; i++) {
            const userVertex = userSequence[i];
            const correctVertex = correctBfsSequence[i];
            
            if (userVertex === correctVertex) {
                // Correct vertex
                nodeColors[userVertex] = '#10b981'; // Green
            } else {
                // Incorrect vertex
                nodeColors[userVertex] = '#ef4444'; // Red
                break; // Stop at first mistake
            }
        }
        
        // Draw graph with colored nodes
        drawGraphWithCustomColors();
    }

    // Color nodes to show correct sequence with BFS levels
    function colorNodesForCorrectSequence() {
        resetNodeColors();
        
        // Different colors for different BFS levels
        const levelColors = [
            '#3b82f6', // Level 0 (start) - blue
            '#8b5cf6', // Level 1 - purple
            '#f97316', // Level 2 - orange
            '#10b981', // Level 3 - green
            '#f59e0b', // Level 4 - amber
            '#ec4899', // Level 5 - pink
            '#6366f1', // Level 6 - indigo
            '#14b8a6', // Level 7 - teal
            '#a855f7', // Level 8 - violet
            '#ef4444'  // Level 9 - red
        ];
        
        // Apply colors based on BFS level
        bfsLevels.forEach((level, levelIndex) => {
            const color = levelColors[levelIndex % levelColors.length];
            level.forEach(vertex => {
                nodeColors[vertex] = color;
            });
        });
        
        // Draw graph with colored nodes
        drawGraphWithCustomColors();
    }

    // Draw graph with custom node colors
    function drawGraphWithCustomColors() {
        if (!graph || !graph.ctx) return;
        
        // Clear canvas
        graph.ctx.clearRect(0, 0, graph.canvas.width, graph.canvas.height);
        
        // Draw edges
        for (let i = 0; i < graph.size; i++) {
            for (let j = 0; j < graph.size; j++) {
                if (graph.adjacencyMatrix[i][j] === 1) {
                    graph.drawEdge(i, j);
                }
            }
        }
        
        // Draw nodes with custom colors
        for (let i = 0; i < graph.size; i++) {
            const nodeColor = nodeColors[i] || graph.colors.node;
            graph.drawNode(i, nodeColor);
        }
    }

    // Reset validation display
    function resetValidation() {
        validationResult.classList.add('hidden');
        validationResult.classList.remove('show', 'correct', 'incorrect');
        userSequenceInput.value = '';
        resetNodeColors();
    }
});