import Graph from '/vertix/js/graph.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const graphSizeInput = document.getElementById('graph-size');
    const graphRepresentationSelect = document.getElementById('graph-representation-type');
    const generateGraphButton = document.getElementById('generate-random-graph');
    const graphMatrixContainer = document.getElementById('graph-matrix-container');
    const graphContainer = document.getElementById('graph-container');
    const componentsCountInput = document.getElementById('components-count');
    const checkComponentsButton = document.getElementById('check-components');
    const showSolutionButton = document.getElementById('show-solution');
    const validationResult = document.getElementById('validation-result');
    const graphCanvas = document.getElementById('graph-canvas');

    // Graph state
    let graph = null;
    let connectedComponents = [];
    
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

    // Check user's answer
    checkComponentsButton.addEventListener('click', function() {
        validateUserAnswer();
    });

    // Show solution
    showSolutionButton.addEventListener('click', function() {
        showSolution();
    });

    // Generate a random graph with specified number of components
    function generateRandomGraph(size, representationType) {
        // Create new graph instance
        graph = new Graph(size);
        
        // Generate random adjacency matrix with 1-4 components
        const maxComponents = Math.min(4, Math.floor(size / 2));
        const numComponents = Math.max(1, Math.floor(Math.random() * maxComponents) + 1);
        
        const adjMatrix = createRandomGraphWithComponents(size, numComponents);
        
        // Load the graph
        graph.loadFromAdjacencyMatrix(adjMatrix);
        
        // Update representation based on selected type
        updateGraphRepresentation(representationType);
        
        // Setup graph visualization
        setupGraphVisualization();
        
        // Calculate connected components
        findConnectedComponents();
        
        // Reset validation result
        resetValidation();
        
        // Show graph container
        graphContainer.classList.remove('hidden');
    }

    // Create random adjacency matrix with specified number of components
    function createRandomGraphWithComponents(size, numComponents) {
        const matrix = Array(size).fill().map(() => Array(size).fill(0));
        
        // Partition vertices into components
        const vertices = Array.from({length: size}, (_, i) => i);
        const componentSizes = partitionIntoComponents(size, numComponents);
        let startIdx = 0;
        
        // Create connections within each component
        for (let c = 0; c < numComponents; c++) {
            const componentSize = componentSizes[c];
            const componentVertices = vertices.slice(startIdx, startIdx + componentSize);
            
            // Create a connected component (using at least a spanning tree)
            if (componentSize > 1) {
                // Connect vertices to form a tree
                for (let i = 1; i < componentSize; i++) {
                    const v1 = componentVertices[i];
                    const v2 = componentVertices[Math.floor(Math.random() * i)]; // Connect to a previous vertex
                    
                    matrix[v1][v2] = 1;
                    matrix[v2][v1] = 1;
                }
                
                // Add some additional random edges within the component (not too many)
                const maxAdditionalEdges = Math.floor(componentSize * 0.7);
                const additionalEdges = Math.floor(Math.random() * maxAdditionalEdges);
                
                for (let e = 0; e < additionalEdges; e++) {
                    const v1 = componentVertices[Math.floor(Math.random() * componentSize)];
                    const v2 = componentVertices[Math.floor(Math.random() * componentSize)];
                    
                    if (v1 !== v2 && matrix[v1][v2] === 0) {
                        matrix[v1][v2] = 1;
                        matrix[v2][v1] = 1;
                    }
                }
            }
            
            startIdx += componentSize;
        }
        
        return matrix;
    }

    // Partition size into numComponents roughly equal parts
    function partitionIntoComponents(size, numComponents) {
        const components = Array(numComponents).fill(0);
        let remaining = size;
        
        for (let i = 0; i < numComponents - 1; i++) {
            // Ensure each component has at least one vertex
            // and the last component also has at least one vertex
            const max = remaining - (numComponents - i - 1);
            components[i] = Math.max(1, Math.floor(Math.random() * max) + 1);
            remaining -= components[i];
        }
        
        components[numComponents - 1] = remaining;
        
        return components;
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
        
        // Draw the graph
        graph.draw();
    }

    // Find connected components
    function findConnectedComponents() {
        connectedComponents = graph.findConnectedComponents();
    }

    // Validate user's answer
    function validateUserAnswer() {
        const userAnswer = parseInt(componentsCountInput.value);
        const correctAnswer = connectedComponents.length;
        
        // Check answer
        const isCorrect = userAnswer === correctAnswer;
        
        // Show validation result
        displayValidationResult(userAnswer, isCorrect);
    }

    // Display validation result
    function displayValidationResult(userAnswer, isCorrect) {
        validationResult.classList.remove('hidden', 'correct', 'incorrect');
        
        // Prepare result content
        let resultHTML = '';
        
        if (isCorrect) {
            validationResult.classList.add('correct');
            resultHTML = `
                <div class="result-icon">✅</div>
                <div class="result-message">Правильно!</div>
                <p>В данном графе действительно ${userAnswer} компонент${getComponentsWord(userAnswer)} связности.</p>
            `;
            
            // Show colored components in the graph
            graph.drawConnectedComponents(connectedComponents);
            
        } else {
            validationResult.classList.add('incorrect');
            resultHTML = `
                <div class="result-icon">❌</div>
                <div class="result-message">Неверно!</div>
                <p>Ваш ответ: ${userAnswer} компонент${getComponentsWord(userAnswer)} связности.</p>
                <p>Попробуйте еще раз или нажмите "Показать решение".</p>
            `;
        }
        
        // Set content and show result
        validationResult.querySelector('.result-content').innerHTML = resultHTML;
        validationResult.classList.add('show');
    }

    // Show solution
    function showSolution() {
        validationResult.classList.remove('hidden', 'correct', 'incorrect');
        validationResult.classList.add('show');
        
        // Create component visualization
        let componentsVisualization = '';
        connectedComponents.forEach((component, index) => {
            // Sort the vertices for cleaner display
            const sortedVertices = [...component].sort((a, b) => a - b);
            
            componentsVisualization += `
                <div class="component-row component-${index % 5} fade-in" style="animation-delay: ${index * 0.1}s">
                    <div class="component-label">Компонента ${index + 1}:</div>
                    <div class="component-vertices">
                        ${sortedVertices.map(v => `<div class="vertex-chip">${v + 1}</div>`).join('')}
                    </div>
                </div>
            `;
        });
        
        validationResult.querySelector('.result-content').innerHTML = `
            <div class="result-icon">💡</div>
            <div class="result-message">Решение</div>
            <p>В данном графе ${connectedComponents.length} компонент${getComponentsWord(connectedComponents.length)} связности:</p>
            
            <div class="components-visualization">
                ${componentsVisualization}
            </div>
            
            <p class="solution-explanation">
                Компонента связности — это максимальный связный подграф графа. 
                Вершины разных компонент не имеют путей между собой.
            </p>
        `;
        
        // Show colored components in the graph
        graph.drawConnectedComponents(connectedComponents);
    }

    // Get correct word ending for Russian word "компонента" based on number
    function getComponentsWord(count) {
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return '';
        }
        
        if (lastDigit === 1) {
            return 'а';
        } else if (lastDigit >= 2 && lastDigit <= 4) {
            return 'ы';
        } else {
            return '';
        }
    }

    // Reset validation display
    function resetValidation() {
        validationResult.classList.add('hidden');
        validationResult.classList.remove('show', 'correct', 'incorrect');
        componentsCountInput.value = 1;
    }
});