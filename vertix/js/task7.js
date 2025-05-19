import Graph from './graph.js';

document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const matrixSizeInput = document.getElementById('matrix-size');
  const generateMatrixBtn = document.getElementById('generate-matrix');
  const resetMatrixBtn = document.getElementById('reset-matrix');
  const loadExampleBtn = document.getElementById('load-example');
  const performMstBtn = document.getElementById('perform-mst');
  const matrixContainer = document.getElementById('matrix-container');
  const resultsContainer = document.getElementById('results-container');
  const graphCanvas = document.getElementById('graph-canvas');
  const mstAlgorithmSelect = document.getElementById('mst-algorithm');

  // MST Controls
  const startMstBtn = document.getElementById('start-mst');
  const stepMstBtn = document.getElementById('step-mst');
  const restartMstBtn = document.getElementById('restart-mst');
  const animationSpeedInput = document.getElementById('animation-speed');
  const currentStepEl = document.getElementById('current-step');
  const currentEdgeEl = document.getElementById('current-edge');
  const totalWeightEl = document.getElementById('total-weight');
  const mstEdgesEl = document.getElementById('mst-edges');

  // State Variables
  let graph = null;
  let matrixSize = 5;
  let weightMatrix = [];
  let mstInterval = null;
  let animationSpeed = 5;
  let mstState = {
    step: 0,
    visitedVertices: [],
    mstEdges: [],
    totalWeight: 0,
    currentEdge: null,
    isRunning: false,
    candidateEdges: [],
    algorithm: 'prim'
  };

  // Initialize Graph
  function initGraph() {
    graph = new Graph(matrixSize);
    graph.setCanvas(graphCanvas);
    
    // Add method to draw weighted edges
    graph.drawWeightedEdge = function(from, to, weight, color = null) {
      const fromPos = this.nodePositions[from];
      const toPos = this.nodePositions[to];
      
      // Draw the edge line
      this.ctx.beginPath();
      this.ctx.moveTo(fromPos.x, fromPos.y);
      this.ctx.lineTo(toPos.x, toPos.y);
      this.ctx.strokeStyle = color || this.colors.edge;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Draw the weight label
      const midX = (fromPos.x + toPos.x) / 2;
      const midY = (fromPos.y + toPos.y) / 2;
      
      // Background for weight
      this.ctx.beginPath();
      this.ctx.arc(midX, midY, 12, 0, 2 * Math.PI);
      this.ctx.fillStyle = 'white';
      this.ctx.fill();
      this.ctx.strokeStyle = '#e2e8f0';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
      
      // Weight text
      this.ctx.fillStyle = '#1e293b';
      this.ctx.font = '12px Ubuntu Mono, monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(weight, midX, midY);
    };
  }

  // Create Weight Matrix Input UI
  function createWeightMatrixInput() {
    matrixContainer.innerHTML = '';
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
        
        if (i === j) {
          // Diagonal cells (no self-loops)
          const cell = document.createElement('div');
          cell.className = 'matrix-cell';
          cell.textContent = '×';
          cell.style.backgroundColor = '#f1f5f9';
          cell.style.cursor = 'not-allowed';
          td.appendChild(cell);
        } else {
          // Weight input cell
          const cell = document.createElement('div');
          cell.className = 'matrix-cell weight-input';
          
          const input = document.createElement('input');
          input.type = 'number';
          input.min = '0';
          input.value = '0';
          input.dataset.row = i;
          input.dataset.col = j;
          
          input.addEventListener('input', function() {
            const r = parseInt(this.dataset.row);
            const c = parseInt(this.dataset.col);
            const value = parseInt(this.value) || 0;
            
            // Update weight matrix (symmetrically for undirected graph)
            weightMatrix[r][c] = value;
            weightMatrix[c][r] = value;
            
            // Update the symmetric cell
            if (r !== c) {
              const symmetricInput = document.querySelector(`input[data-row="${c}"][data-col="${r}"]`);
              if (symmetricInput && symmetricInput.value !== this.value) {
                symmetricInput.value = this.value;
              }
            }
            
            // Highlight cells with weights
            if (value > 0) {
              cell.classList.add('active');
              const symmetricCell = document.querySelector(`.matrix-cell.weight-input input[data-row="${c}"][data-col="${r}"]`).parentNode;
              if (symmetricCell) {
                symmetricCell.classList.add('active');
              }
            } else {
              cell.classList.remove('active');
              const symmetricCell = document.querySelector(`.matrix-cell.weight-input input[data-row="${c}"][data-col="${r}"]`).parentNode;
              if (symmetricCell) {
                symmetricCell.classList.remove('active');
              }
            }
          });
          
          cell.appendChild(input);
          td.appendChild(cell);
        }
        
        row.appendChild(td);
      }
      
      table.appendChild(row);
    }
    
    matrixContainer.appendChild(table);
    resetMatrixBtn.disabled = false;
    performMstBtn.disabled = false;
  }

  // Load Example Graph
  function loadExample() {
    matrixSize = 5;
    matrixSizeInput.value = matrixSize;
    
    // Create the matrix UI first
    createWeightMatrixInput();
    
    // Example weight matrix for a connected graph
    const exampleWeights = [
      [0, 2, 0, 6, 1],
      [2, 0, 3, 0, 4],
      [0, 3, 0, 5, 7],
      [6, 0, 5, 0, 8],
      [1, 4, 7, 8, 0]
    ];
    
    // Update the UI and data
    for (let i = 0; i < matrixSize; i++) {
      for (let j = 0; j < matrixSize; j++) {
        if (i !== j && exampleWeights[i][j] > 0) {
          weightMatrix[i][j] = exampleWeights[i][j];
          const input = document.querySelector(`input[data-row="${i}"][data-col="${j}"]`);
          if (input) {
            input.value = exampleWeights[i][j];
            input.parentNode.classList.add('active');
          }
        }
      }
    }
  }

  // Reset Matrix
  function resetMatrix() {
    matrixContainer.innerHTML = '';
    weightMatrix = [];
    createWeightMatrixInput();
  }

  // Build adjacency matrix from weight matrix
  function buildAdjacencyMatrix() {
    const adjacencyMatrix = Array(matrixSize).fill().map(() => Array(matrixSize).fill(0));
    
    for (let i = 0; i < matrixSize; i++) {
      for (let j = 0; j < matrixSize; j++) {
        if (weightMatrix[i][j] > 0) {
          adjacencyMatrix[i][j] = 1;
        }
      }
    }
    
    return adjacencyMatrix;
  }

  // Perform MST Algorithm
  function performMST() {
    initGraph();
    
    // Convert weight matrix to adjacency matrix for the graph
    const adjacencyMatrix = buildAdjacencyMatrix();
    graph.loadFromAdjacencyMatrix(adjacencyMatrix);
    
    // Initialize MST state based on selected algorithm
    mstState.algorithm = mstAlgorithmSelect.value;
    initMstState();
    
    graph.draw();
    drawWeightedGraph();
    
    resultsContainer.classList.remove('hidden');
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
  }

  // Initialize MST state
  function initMstState() {
    mstState = {
      step: 0,
      visitedVertices: [0], // Start with vertex 1
      mstEdges: [],
      totalWeight: 0,
      currentEdge: null,
      isRunning: false,
      candidateEdges: [],
      algorithm: mstState.algorithm
    };
    
    updateMstUI();
    
    // Get all edges connected to the starting vertex
    updateCandidateEdges();
  }

  // Update candidate edges based on current visited vertices
  function updateCandidateEdges() {
    mstState.candidateEdges = [];
    
    // Find all edges that connect visited vertices to unvisited ones
    for (let i of mstState.visitedVertices) {
      for (let j = 0; j < matrixSize; j++) {
        if (!mstState.visitedVertices.includes(j) && weightMatrix[i][j] > 0) {
          mstState.candidateEdges.push({
            from: i,
            to: j,
            weight: weightMatrix[i][j]
          });
        }
      }
    }
    
    // Sort candidate edges by weight
    mstState.candidateEdges.sort((a, b) => a.weight - b.weight);
  }

  // Update the MST UI elements
  function updateMstUI() {
    currentStepEl.textContent = mstState.step;
    totalWeightEl.textContent = mstState.totalWeight;
    
    if (mstState.currentEdge) {
      currentEdgeEl.textContent = `${mstState.currentEdge.from + 1} → ${mstState.currentEdge.to + 1} (вес: ${mstState.currentEdge.weight})`;
    } else {
      currentEdgeEl.textContent = '-';
    }
    
    // Update MST edges display
    if (mstState.mstEdges.length > 0) {
      mstEdgesEl.innerHTML = '';
      
      for (const edge of mstState.mstEdges) {
        const edgeItem = document.createElement('div');
        edgeItem.className = 'mst-edge-item';
        
        const verticesSpan = document.createElement('span');
        verticesSpan.className = 'edge-vertices';
        verticesSpan.textContent = `${edge.from + 1} → ${edge.to + 1}`;
        
        const weightSpan = document.createElement('span');
        weightSpan.className = 'edge-weight';
        weightSpan.textContent = `Вес: ${edge.weight}`;
        
        edgeItem.appendChild(verticesSpan);
        edgeItem.appendChild(weightSpan);
        mstEdgesEl.appendChild(edgeItem);
      }
    } else {
      mstEdgesEl.innerHTML = '<span>-</span>';
    }
  }

  // Draw weighted graph
  function drawWeightedGraph() {
    const ctx = graph.ctx;
    ctx.clearRect(0, 0, graph.canvas.width, graph.canvas.height);
    
    // Draw edges with weights
    for (let i = 0; i < matrixSize; i++) {
      for (let j = i + 1; j < matrixSize; j++) {
        if (weightMatrix[i][j] > 0) {
          let edgeColor = graph.colors.edge;
          
          // Check if this edge is in MST
          const inMST = mstState.mstEdges.some(
            edge => (edge.from === i && edge.to === j) || (edge.from === j && edge.to === i)
          );
          
          if (inMST) {
            edgeColor = '#a3e635'; // MST edge color
          }
          
          // Check if this is the current edge
          const isCurrent = mstState.currentEdge && 
            ((mstState.currentEdge.from === i && mstState.currentEdge.to === j) || 
             (mstState.currentEdge.from === j && mstState.currentEdge.to === i));
          
          if (isCurrent) {
            edgeColor = '#f59e0b'; // Current edge color
          }
          
          graph.drawWeightedEdge(i, j, weightMatrix[i][j], edgeColor);
        }
      }
    }
    
    // Draw nodes
    for (let i = 0; i < matrixSize; i++) {
      let nodeColor = graph.colors.node;
      
      if (mstState.visitedVertices.includes(i)) {
        nodeColor = '#10b981'; // Visited vertex color
      }
      
      graph.drawNode(i, nodeColor);
    }
  }

  // Perform one step of Prim's MST algorithm
  function stepMST() {
    if (mstState.visitedVertices.length === matrixSize) {
      stopMST();
      return false; // Algorithm complete
    }
    
    mstState.step++;
    
    // If there are no candidate edges, the graph is disconnected
    if (mstState.candidateEdges.length === 0) {
      alert('Граф несвязный! Невозможно построить MST.');
      stopMST();
      return false;
    }
    
    // Get the minimum weight edge from candidates
    const minEdge = mstState.candidateEdges[0];
    mstState.currentEdge = minEdge;
    
    // Add the edge to MST
    mstState.mstEdges.push(minEdge);
    mstState.totalWeight += minEdge.weight;
    
    // Add the new vertex to visited set
    mstState.visitedVertices.push(minEdge.to);
    
    // Update candidate edges
    updateCandidateEdges();
    
    // Update UI
    updateMstUI();
    drawWeightedGraph();
    
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

  // Stop MST algorithm
  function stopMST() {
    clearInterval(mstInterval);
    mstState.isRunning = false;
    startMstBtn.textContent = 'Продолжить';
  }

  // Event Listeners
  generateMatrixBtn.addEventListener('click', function() {
    matrixSize = parseInt(matrixSizeInput.value);
    createWeightMatrixInput();
  });

  resetMatrixBtn.addEventListener('click', resetMatrix);
  loadExampleBtn.addEventListener('click', loadExample);
  performMstBtn.addEventListener('click', performMST);

  startMstBtn.addEventListener('click', startMST);
  stepMstBtn.addEventListener('click', function() {
    stopMST();
    stepMST();
  });
  restartMstBtn.addEventListener('click', function() {
    stopMST();
    initMstState();
    drawWeightedGraph();
  });

  animationSpeedInput.addEventListener('input', function() {
    animationSpeed = parseInt(this.value);
    if (mstState.isRunning) {
      stopMST();
      startMST();
    }
  });

  // Initialize
  matrixSize = parseInt(matrixSizeInput.value);
  initGraph();
  createWeightMatrixInput();
});