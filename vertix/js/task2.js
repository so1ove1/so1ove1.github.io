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
    let correctDfsSequence = [];
    let startVertex = 0;
    let nodeColors = [];
    
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
        calculateCorrectDfsSequence();
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
        
        // Calculate correct DFS sequence
        calculateCorrectDfsSequence();
        
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

    // Calculate correct DFS sequence
    function calculateCorrectDfsSequence() {
        correctDfsSequence = [];
        const size = graph.size;
        const visited = Array(size).fill(false);
        
        // DFS implementation
        function dfs(vertex) {
            if (visited[vertex]) return;
            
            visited[vertex] = true;
            correctDfsSequence.push(vertex);
            
            // Get adjacency list for current vertex
            const neighbors = [];
            for (let i = 0; i < size; i++) {
                if (graph.adjacencyMatrix[vertex][i] === 1) {
                    neighbors.push(i);
                }
            }
            
            // Sort neighbors to ensure consistent traversal order
            neighbors.sort((a, b) => a - b);
            
            // Visit neighbors
            for (const neighbor of neighbors) {
                if (!visited[neighbor]) {
                    dfs(neighbor);
                }
            }
        }
        
        // Start DFS from selected vertex
        dfs(startVertex);
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

    // Validate DFS sequence
    function validateSequence(userSequence) {
        // Basic validation - check if lengths match
        if (userSequence.length !== correctDfsSequence.length) {
            return false;
        }
        
        // Check if user's sequence matches the correct DFS sequence
        for (let i = 0; i < userSequence.length; i++) {
            if (userSequence[i] !== correctDfsSequence[i]) {
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
                <p>Ваша последовательность обхода верна.</p>
            `;
        } else {
            validationResult.classList.add('incorrect');
            resultHTML = `
                <div class="result-icon">❌</div>
                <div class="result-message">Неверно!</div>
                <p>Ваша последовательность обхода не соответствует алгоритму DFS.</p>
                <div class="sequence-comparison">
                    <div class="sequence-row">
                        <div class="sequence-label">Ваш ответ:</div>
                        <div class="sequence-vertices">
                            ${userSequence.map((v, i) => {
                                const isCorrect = i < correctDfsSequence.length && v === correctDfsSequence[i];
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
        
        const formattedSequence = correctDfsSequence.map(v => v + 1).join(', ');
        
        validationResult.querySelector('.result-content').innerHTML = `
            <div class="result-icon">💡</div>
            <div class="result-message">Правильный ответ</div>
            <p>Правильная последовательность обхода в глубину, начиная с вершины ${startVertex + 1}:</p>
            <div class="correct-sequence">${formattedSequence}</div>
        `;
        
        // Color nodes to show correct sequence
        colorNodesForCorrectSequence();
    }

    // Color nodes based on validation results
    function colorNodesBasedOnValidation(userSequence) {
        resetNodeColors();
        
        // Determine how many vertices to check (min of user and correct sequences)
        const length = Math.min(userSequence.length, correctDfsSequence.length);
        
        for (let i = 0; i < length; i++) {
            const userVertex = userSequence[i];
            const correctVertex = correctDfsSequence[i];
            
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

    // Color nodes to show correct sequence
    function colorNodesForCorrectSequence() {
        resetNodeColors();
        
        // Gradient colors from blue to green
        const colors = [
            '#3b82f6', // Start (blue)
            '#60a5fa',
            '#818cf8',
            '#a78bfa',
            '#c084fc',
            '#e879f9',
            '#f472b6',
            '#fb7185',
            '#f59e0b',
            '#10b981'  // End (green)
        ];
        
        // Apply colors based on sequence position
        for (let i = 0; i < correctDfsSequence.length; i++) {
            const vertex = correctDfsSequence[i];
            const colorIndex = Math.min(Math.floor(i * colors.length / correctDfsSequence.length), colors.length - 1);
            nodeColors[vertex] = colors[colorIndex];
        }
        
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