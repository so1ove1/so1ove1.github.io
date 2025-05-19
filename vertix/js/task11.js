import Graph from '/vertix/js/graph.js';

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const decodePruferBtn = document.getElementById('decode-prufer');
    const resetInputBtn = document.getElementById('reset-input');
    const loadExampleBtn = document.getElementById('load-example');
    const pruferSequenceInput = document.getElementById('prufer-sequence');
    const resultsContainer = document.getElementById('results-container');
    const graphCanvas = document.getElementById('graph-canvas');

    // Decode Controls
    const startDecodeBtn = document.getElementById('start-decode');
    const stepDecodeBtn = document.getElementById('step-decode');
    const restartDecodeBtn = document.getElementById('restart-decode');
    const animationSpeedInput = document.getElementById('animation-speed');
    const currentStepEl = document.getElementById('current-step');
    const currentVertexEl = document.getElementById('current-vertex');
    const currentEdgeEl = document.getElementById('current-edge');
    const treeEdgesEl = document.getElementById('tree-edges');

    // State Variables
    let graph = null;
    let pruferCode = [];
    let decodeInterval = null;
    let animationSpeed = 5;
    let decodeState = {
        vertices: [],           // Available vertices
        degrees: [],           // Vertex degrees
        pruferSequence: [],     // Current Prüfer sequence
        edges: [],             // Tree edges
        currentVertex: null,
        step: 0,
        isRunning: false,
        complete: false
    };

    // Initialize Graph
    function initGraph(size) {
        graph = new Graph(size);
        graph.setCanvas(graphCanvas);
    }

    // Parse and validate Prüfer sequence input
    function parsePruferInput(input) {
        try {
            const numbers = input.split(',').map(x => parseInt(x.trim()));
            return numbers.filter(x => !isNaN(x));
        } catch (e) {
            return [];
        }
    }

    // Check if Prüfer code is valid
    function isValidPruferCode(code) {
        if (!code || !Array.isArray(code) || code.length === 0) return false;
        const n = code.length + 2;
        return code.every(x => Number.isInteger(x) && x >= 1 && x <= n);
    }

    // Load Example Code
    function loadExample() {
        pruferSequenceInput.value = '3, 3, 4';
        pruferCode = [3, 3, 4];
        decodePruferBtn.disabled = false;
        resetInputBtn.disabled = false;
    }

    // Reset Input
    function resetInput() {
        pruferSequenceInput.value = '';
        pruferCode = [];
        decodePruferBtn.disabled = true;
        resetInputBtn.disabled = true;
    }

    // Decode Prüfer Code
    function decodePrufer() {
        initGraph(pruferCode.length + 2);
        
        // Show results container
        resultsContainer.classList.remove('hidden');
        
        // Reset decode state
        resetDecodeState();
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Reset decode state
    function resetDecodeState() {
        clearInterval(decodeInterval);
        
        const n = pruferCode.length + 2;
        decodeState = {
            vertices: Array.from({length: n}, (_, i) => i + 1),  // Vertices 1 to n
            degrees: Array(n + 1).fill(1),                       // Initialize degrees (1-based)
            pruferSequence: [...pruferCode],                     // Copy of Prüfer code
            edges: [],                                           // Tree edges
            currentVertex: null,
            step: 0,
            isRunning: false,
            complete: false
        };

        // Calculate initial degrees
        for (const v of pruferCode) {
            decodeState.degrees[v]++;
        }
        
        // Update UI
        currentStepEl.textContent = '0';
        currentVertexEl.textContent = '-';
        currentEdgeEl.textContent = '-';
        treeEdgesEl.innerHTML = '<p>Декодирование не начато</p>';
        
        // Draw initial state
        drawDecodeState();
    }

    // Draw current decode state
    function drawDecodeState() {
        const ctx = graph.ctx;
        ctx.clearRect(0, 0, graph.canvas.width, graph.canvas.height);
        
        // Draw edges
        for (const edge of decodeState.edges) {
            const isNewEdge = edge === decodeState.edges[decodeState.edges.length - 1];
            const color = isNewEdge ? '#a3e635' : graph.colors.edge;
            graph.drawEdge(edge.from - 1, edge.to - 1, color);
        }
        
        // Draw vertices
        for (let i = 0; i < pruferCode.length + 2; i++) {
            const vertex = i + 1;
            let nodeColor = graph.colors.node;
            
            if (vertex === decodeState.currentVertex) {
                nodeColor = '#f97316';
            } else if (decodeState.degrees[vertex] === 0) {
                nodeColor = '#10b981';
            }
            
            graph.drawNode(i, nodeColor);
        }
    }

    // Find smallest leaf (vertex with degree 1)
    function findSmallestLeaf() {
        for (let v = 1; v <= pruferCode.length + 2; v++) {
            if (decodeState.degrees[v] === 1) {
                return v;
            }
        }
        return null;
    }

    // Perform one step of Prüfer decoding
    function stepDecode() {
        if (decodeState.complete) {
            return false;
        }
        
        decodeState.step++;
        currentStepEl.textContent = decodeState.step;
        
        if (decodeState.pruferSequence.length > 0) {
            // Find smallest leaf
            const leaf = findSmallestLeaf();
            decodeState.currentVertex = leaf;
            currentVertexEl.textContent = leaf;
            
            // Get next vertex from Prüfer sequence
            const nextVertex = decodeState.pruferSequence[0];
            
            // Add edge
            const edge = { from: leaf, to: nextVertex };
            decodeState.edges.push(edge);
            currentEdgeEl.textContent = `${leaf} → ${nextVertex}`;
            
            // Update tree edges list
            const li = document.createElement('li');
            li.innerHTML = `
                <span>Добавлено ребро:</span>
                <span class="edge-vertices">${leaf} → ${nextVertex}</span>
            `;
            if (treeEdgesEl.querySelector('p')) {
                treeEdgesEl.innerHTML = '';
            }
            treeEdgesEl.appendChild(li);
            
            // Update degrees
            decodeState.degrees[leaf]--;
            decodeState.degrees[nextVertex]--;
            
            // Remove first element from Prüfer sequence
            decodeState.pruferSequence.shift();
        } else if (decodeState.pruferSequence.length === 0) {
            // Find remaining vertices with degree 1
            const remainingVertices = [];
            for (let v = 1; v <= pruferCode.length + 2; v++) {
                if (decodeState.degrees[v] === 1) {
                    remainingVertices.push(v);
                }
            }
            
            if (remainingVertices.length === 2) {
                // Connect last two vertices
                const [v1, v2] = remainingVertices;
                decodeState.currentVertex = v1;
                currentVertexEl.textContent = v1;
                
                const edge = { from: v1, to: v2 };
                decodeState.edges.push(edge);
                currentEdgeEl.textContent = `${v1} → ${v2}`;
                
                // Add final edge to list
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>Добавлено последнее ребро:</span>
                    <span class="edge-vertices">${v1} → ${v2}</span>
                `;
                treeEdgesEl.appendChild(li);
                
                // Update degrees
                decodeState.degrees[v1] = 0;
                decodeState.degrees[v2] = 0;
                
                // Complete
                decodeState.complete = true;
                currentVertexEl.textContent = 'Завершено';
                currentEdgeEl.textContent = '-';
            }
        }
        
        // Draw updated state
        drawDecodeState();
        return !decodeState.complete;
    }

    // Start automated decoding
    function startDecode() {
        if (decodeState.isRunning) {
            stopDecode();
            return;
        }
        
        decodeState.isRunning = true;
        startDecodeBtn.textContent = 'Пауза';
        
        const interval = 1100 - (animationSpeed * 100);
        
        decodeInterval = setInterval(() => {
            if (!stepDecode()) {
                stopDecode();
            }
        }, interval);
    }

    // Stop decode animation
    function stopDecode() {
        clearInterval(decodeInterval);
        decodeState.isRunning = false;
        startDecodeBtn.textContent = 'Продолжить';
    }

    // Event Listeners
    pruferSequenceInput.addEventListener('input', function() {
        const sequence = parsePruferInput(this.value);
        pruferCode = sequence;
        decodePruferBtn.disabled = !isValidPruferCode(sequence);
        resetInputBtn.disabled = !sequence.length;
    });
    
    resetInputBtn.addEventListener('click', resetInput);
    loadExampleBtn.addEventListener('click', loadExample);
    decodePruferBtn.addEventListener('click', decodePrufer);
    
    startDecodeBtn.addEventListener('click', startDecode);
    stepDecodeBtn.addEventListener('click', function() {
        stopDecode();
        stepDecode();
    });
    restartDecodeBtn.addEventListener('click', resetDecodeState);
    
    animationSpeedInput.addEventListener('input', function() {
        animationSpeed = parseInt(this.value);
        if (decodeState.isRunning) {
            stopDecode();
            startDecode();
        }
    });
    
    // Initialize
    initGraph(2);
});