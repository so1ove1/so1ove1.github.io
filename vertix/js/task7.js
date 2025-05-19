import Graph from '/vertix/js/graph.js';

document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const matrixSizeInput = document.getElementById('matrix-size');
  const graphRepresentationSelect = document.getElementById('graph-representation');
  const generateMatrixBtn = document.getElementById('generate-matrix');
  const resetMatrixBtn = document.getElementById('reset-matrix');
  const loadExampleBtn = document.getElementById('load-example');
  const findMstBtn = document.getElementById('find-mst');
  const matrixContainer = document.getElementById('matrix-container');
  const resultsContainer = document.getElementById('results-container');
  const graphCanvas = document.getElementById('graph-canvas');

  // MST Controls
  const startMstBtn = document.getElementById('start-mst');
  const stepMstBtn = document.getElementById('step-mst');
  const restartMstBtn = document.getElementById('restart-mst');
  const animationSpeedInput = document.getElementById('animation-speed');
  const currentStepEl = document.getElementById('current-step');
  const currentVertexEl = document.getElementById('current-vertex');
  const totalWeightEl = document.getElementById('total-weight');
  const mstEdgesList = document.getElementById('mst-edges-list');

  // State Variables
  let graph = null;
  let matrixSize = 5;
  let representation = 'adjacency';
  let matrixData = [];
  let weightMatrix = [];
  let mstInterval = null;
  let animationSpeed = 5;
  let mstState = {
    inTree: [],         // Vertices in the MST
    minEdges: [],       // Minimum weight edges for each vertex
    parent: [],         // Parent of each vertex in the MST
    currentVertex: null,
    mstEdges: [],       // Edges in the MST
    totalWeight: 0,
    step: 0,
    isRunning: false,
    complete: false
  };

  // Initialize Graph
  function initGraph() {
    graph = new Graph(matrixSize);
    graph.setCanvas(graphCanvas);
  }

  // Create Matrix Input UI based on representation
  function createMatrixInput() {
    matrixContainer.innerHTML = '';
    matrixData = [];
    weightMatrix = [];

    if (representation === 'adjacency') {
      createAdjacencyMatrixUI();
    } else if (representation === 'weighted') {
      createWeightedMatrixUI();
    }

    resetMatrixBtn.disabled = false;
    findMstBtn.disabled = false;
  }

  // Create Adjacency Matrix UI
  function createAdjacencyMatrixUI() {
    matrixData = Array(matrixSize).fill().map(() => Array(matrixSize).fill(0));
    weightMatrix = Array(matrixSize).fill().map(() => Array(matrixSize).fill(0));

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

        input.addEventListener('click', function () {
          const r = parseInt(this.dataset.row);
          const c = parseInt(this.dataset.col);

          if (matrixData[r][c] === 0) {
            matrixData[r][c] = 1;
            matrixData[c][r] = 1; // For undirected graph

            // Generate random weight between 1 and 10
            const weight = Math.floor(Math.random() * 10) + 1;
            weightMatrix[r][c] = weight;
            weightMatrix[c][r] = weight; // For undirected graph

            this.textContent = weight;
            this.classList.add('active');

            // Update symmetric cell
            if (r !== c) {
              const symmetricCell = document.querySelector(`.matrix-cell[data-row="${c}"][data-col="${r}"]`);
              if (symmetricCell) {
                symmetricCell.textContent = weight;
                symmetricCell.classList.add('active');
              }
            }
          } else {
            matrixData[r][c] = 0;
            matrixData[c][r] = 0; // For undirected graph
            weightMatrix[r][c] = 0;
            weightMatrix[c][r] = 0; // For undirected graph

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

  // Create Weighted Matrix UI
  function createWeightedMatrixUI() {
    matrixData = Array(matrixSize).fill().map(() => Array(matrixSize).fill(0));
    weightMatrix = Array(matrixSize).fill().map(() => Array(matrixSize).fill(0));

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

        input.addEventListener('input', function () {
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
  }

  // Load Example Graph
  function loadExample() {
    matrixSize = 6;
    representation = 'weighted';
    matrixSizeInput.value = matrixSize;
    graphRepresentationSelect.value = representation;

    // Create the matrix UI first
    createMatrixInput();

    // Example weighted graph
    const exampleWeights = [
      [0, 3, 0, 0, 6, 5],
      [3, 0, 1, 0, 0, 4],
      [0, 1, 0, 6, 0, 4],
      [0, 0, 6, 0, 8, 5],
      [6, 0, 0, 8, 0, 2],
      [5, 4, 4, 5, 2, 0]
    ];

    // Update the UI and data
    for (let i = 0; i < matrixSize; i++) {
      for (let j = 0; j < matrixSize; j++) {
        if (exampleWeights[i][j] > 0) {
          matrixData[i][j] = 1;
          weightMatrix[i][j] = exampleWeights[i][j];

          // Update UI based on representation
          if (representation === 'adjacency') {
            const cell = document.querySelector(`.matrix-cell[data-row="${i}"][data-col="${j}"]`);
            if (cell) {
              cell.textContent = exampleWeights[i][j];
              cell.classList.add('active');
            }
          } else if (representation === 'weighted') {
            const input = document.querySelector(`.weight-input[data-row="${i}"][data-col="${j}"]`);
            if (input) {
              input.value = exampleWeights[i][j];
              input.parentElement.classList.add('active');
            }
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

  // Find Minimum Spanning Tree
  function findMST() {
    initGraph();
    graph.loadFromAdjacencyMatrix(matrixData);

    // Check if graph is connected before proceeding
    const components = graph.findConnectedComponents();
    if (components.length > 1) {
      alert('Граф не связный. Невозможно построить MST.');
      return;
    }

    // Show results container
    resultsContainer.classList.remove('hidden');

    // Draw the initial graph with weights
    drawGraphWithWeights();

    // Reset MST state
    resetMstState();

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

  // Reset MST state
  function resetMstState() {
    clearInterval(mstInterval);

    mstState = {
      inTree: [0],             // Start with the first vertex
      minEdges: Array(matrixSize).fill(Infinity),
      parent: Array(matrixSize).fill(-1),
      currentVertex: 0,
      mstEdges: [],
      totalWeight: 0,
      step: 0,
      isRunning: false,
      complete: false
    };

    // Initialize minEdges with weights from first vertex
    for (let i = 0; i < matrixSize; i++) {
      if (matrixData[0][i] === 1) {
        mstState.minEdges[i] = weightMatrix[0][i];
        mstState.parent[i] = 0;
      }
    }

    // Update UI
    currentStepEl.textContent = '0';
    currentVertexEl.textContent = '1'; // 1-indexed
    totalWeightEl.textContent = '0';
    mstEdgesList.innerHTML = '<li>Построение начинается с вершины 1</li>';

    // Draw initial state
    drawMstState();
  }

  // Draw current MST state
  function drawMstState() {
    const ctx = graph.ctx;
    ctx.clearRect(0, 0, graph.canvas.width, graph.canvas.height);

    // Draw all edges with weights first
    for (let i = 0; i < matrixSize; i++) {
      for (let j = i + 1; j < matrixSize; j++) {
        if (matrixData[i][j] === 1) {
          // Check if this edge is in MST
          const isInMST = mstState.mstEdges.some(
            edge => (edge.from === i && edge.to === j) || (edge.from === j && edge.to === i)
          );

          // Draw edge with appropriate color
          const color = isInMST ? '#a3e635' : graph.colors.edge;
          graph.drawEdge(i, j, color);

          // Draw weight label
          const fromPos = graph.nodePositions[i];
          const toPos = graph.nodePositions[j];
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

    // Draw vertices with appropriate colors
    for (let i = 0; i < matrixSize; i++) {
      let nodeColor = graph.colors.node; // Default blue

      if (i === mstState.currentVertex) {
        nodeColor = '#f97316'; // Current vertex (orange)
      } else if (mstState.inTree.includes(i)) {
        nodeColor = '#10b981'; // In MST (green)
      }

      graph.drawNode(i, nodeColor);
    }
  }

  // Perform one step of Prim's algorithm
  function stepMST() {
    if (mstState.complete) {
      return false;
    }

    mstState.step++;
    currentStepEl.textContent = mstState.step;

    // Find vertex with minimum edge weight that's not in the tree
    let minVertex = -1;
    let minWeight = Infinity;

    for (let i = 0; i < matrixSize; i++) {
      if (!mstState.inTree.includes(i) && mstState.minEdges[i] < minWeight) {
        minVertex = i;
        minWeight = mstState.minEdges[i];
      }
    }

    if (minVertex === -1) {
      // MST is complete
      mstState.complete = true;
      mstState.currentVertex = null;
      currentVertexEl.textContent = 'Завершено';

      // Add final summary to the edges list
      mstEdgesList.innerHTML += `
                <li class="summary">
                    <span>Итоговый вес MST:</span>
                    <span class="edge-weight">${mstState.totalWeight}</span>
                </li>`;

      drawMstState();
      return false;
    }

    // Add the new vertex to the tree
    mstState.inTree.push(minVertex);
    mstState.currentVertex = minVertex;
    currentVertexEl.textContent = minVertex + 1; // 1-indexed

    // Add the edge to MST
    const parentVertex = mstState.parent[minVertex];
    const edgeWeight = weightMatrix[parentVertex][minVertex];
    mstState.totalWeight += edgeWeight;
    totalWeightEl.textContent = mstState.totalWeight;

    // Update the edges list
    const edgeEntry = document.createElement('li');
    edgeEntry.innerHTML = `
            <span>Добавлено ребро: ${parentVertex + 1} → ${minVertex + 1}</span>
            <span class="edge-weight">Вес: ${edgeWeight}</span>
        `;
    mstEdgesList.appendChild(edgeEntry);

    // Store the MST edge
    mstState.mstEdges.push({
      from: parentVertex,
      to: minVertex,
      weight: edgeWeight
    });

    // Update min edges for all vertices not in tree
    for (let i = 0; i < matrixSize; i++) {
      if (!mstState.inTree.includes(i) && matrixData[minVertex][i] === 1) {
        const weight = weightMatrix[minVertex][i];
        if (weight < mstState.minEdges[i]) {
          mstState.minEdges[i] = weight;
          mstState.parent[i] = minVertex;
        }
      }
    }

    // Draw the updated state
    drawMstState();
    return true;
  }

  // Start automated MST algorithm
  function startMST() {
    if (mstState.isRunning) {
      stopMST();
      return;
    }

    mstState.isRunning = true;
    startMstBtn.textContent = 'Пауза';

    const interval = 1100 - (animationSpeed * 100);

    mstInterval = setInterval(() => {
      if (!stepMST()) {
        stopMST();
      }
    }, interval);
  }

  // Stop MST animation
  function stopMST() {
    clearInterval(mstInterval);
    mstState.isRunning = false;
    startMstBtn.textContent = 'Продолжить';
  }

  // Event Listeners
  generateMatrixBtn.addEventListener('click', function () {
    matrixSize = parseInt(matrixSizeInput.value);
    representation = graphRepresentationSelect.value;
    createMatrixInput();
  });

  resetMatrixBtn.addEventListener('click', resetMatrix);
  loadExampleBtn.addEventListener('click', loadExample);
  findMstBtn.addEventListener('click', findMST);

  startMstBtn.addEventListener('click', startMST);
  stepMstBtn.addEventListener('click', function () {
    stopMST();
    stepMST();
  });
  restartMstBtn.addEventListener('click', resetMstState);

  animationSpeedInput.addEventListener('input', function () {
    animationSpeed = parseInt(this.value);
    if (mstState.isRunning) {
      stopMST();
      startMST();
    }
  });

  // Initialize
  matrixSize = parseInt(matrixSizeInput.value);
  representation = graphRepresentationSelect.value;
  initGraph();
});