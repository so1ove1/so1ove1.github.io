document.addEventListener('DOMContentLoaded', function() {
    const functionVector = document.getElementById('function-vector');
    const truthTableBody = document.getElementById('truth-table-body');
    const functionOptions = document.getElementById('function-options');
    const checkAnswerBtn = document.getElementById('check-answer');
    const nextRoundBtn = document.getElementById('next-round');
    const resultContainer = document.getElementById('result-container');
    const resultMessage = document.getElementById('result-message');
    const correctAnswerContainer = document.getElementById('correct-answer-container');
    const correctFunctionName = document.getElementById('correct-function-name');
    const correctFunctionDisplay = document.getElementById('correct-function-display');
    const functionExpression = document.getElementById('function-expression');
    const correctCountElement = document.getElementById('correct-count');
    const totalCountElement = document.getElementById('total-count');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Game State
    let currentFunction = null;
    let selectedFunctionId = null;
    let score = 0;
    let rounds = 0;

    // Boolean functions with 2 variables
    const booleanFunctions = [
        {
            id: "0000",
            name: "Константа 0",
            displayName: "0",
            vector: "0000",
            expression: "f(x,y) = 0"
        },
        {
            id: "0001",
            name: "Конъюнкция",
            displayName: "x & y",
            vector: "0001",
            expression: "f(x,y) = x & y"
        },
        {
            id: "0010",
            name: "Коимпликация",
            displayName: "x /→ y",
            vector: "0010",
            expression: "f(x,y) = x & ¬y"
        },
        {
            id: "0011",
            name: "Переменная x",
            displayName: "x",
            vector: "0011",
            expression: "f(x,y) = x"
        },
        {
            id: "0100",
            name: "Обратная коимпликация",
            displayName: "y /→ x",
            vector: "0100",
            expression: "f(x,y) = ¬x & y"
        },
        {
            id: "0101",
            name: "Переменная y",
            displayName: "y",
            vector: "0101",
            expression: "f(x,y) = y"
        },
        {
            id: "0110",
            name: "Сложение по модулю 2",
            displayName: "x ⊕ y",
            vector: "0110",
            expression: "f(x,y) = x ⊕ y"
        },
        {
            id: "0111",
            name: "Дизъюнкция",
            displayName: "x ∨ y",
            vector: "0111",
            expression: "f(x,y) = x ∨ y"
        },
        {
            id: "1000",
            name: "Стрелка Пирса",
            displayName: "x ↓ y",
            vector: "1000",
            expression: "f(x,y) = ¬(x ∨ y)"
        },
        {
            id: "1001",
            name: "Эквивалентность",
            displayName: "x ≡ y",
            vector: "1001",
            expression: "f(x,y) = x ≡ y"
        },
        {
            id: "1010",
            name: "Отрицание y",
            displayName: "¬y",
            vector: "1010",
            expression: "f(x,y) = ¬y"
        },
        {
            id: "1011",
            name: "Обратная импликация",
            displayName: "y → x",
            vector: "1011",
            expression: "f(x,y) = y → x"
        },
        {
            id: "1100",
            name: "Отрицание x",
            displayName: "¬x",
            vector: "1100",
            expression: "f(x,y) = ¬x"
        },
        {
            id: "1101",
            name: "Импликация",
            displayName: "x → y",
            vector: "1101",
            expression: "f(x,y) = x → y"
        },
        {
            id: "1110",
            name: "Штрих Шеффера",
            displayName: "x | y",
            vector: "1110",
            expression: "f(x,y) = ¬(x & y)"
        },
        {
            id: "1111",
            name: "Константа 1",
            displayName: "1",
            vector: "1111",
            expression: "f(x,y) = 1"
        }
    ];

    // Initialize the game
    initGame();

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and tab contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to the clicked tab
            tab.classList.add('active');
            
            // Show the corresponding tab content
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Event listeners
    checkAnswerBtn.addEventListener('click', checkAnswer);
    nextRoundBtn.addEventListener('click', startNewRound);

    // Functions
    function initGame() {
        // Populate function options
        populateFunctionOptions();
        
        // Start the first round
        startNewRound();
    }

    function populateFunctionOptions() {
        functionOptions.innerHTML = '';
        
        booleanFunctions.forEach(func => {
            const option = document.createElement('div');
            option.className = 'function-option';
            option.dataset.vector = func.vector;
            
            option.innerHTML = `
                <div class="function-name">${func.displayName}</div>
                <div class="function-code">${func.name}</div>
            `;
            
            option.addEventListener('click', () => selectFunction(func.vector, option));
            
            functionOptions.appendChild(option);
        });
    }

    function selectFunction(vectorId, element) {
        // If result is already shown, do nothing
        if (!resultContainer.classList.contains('hidden')) {
            return;
        }
        
        // Remove selected class from all options
        document.querySelectorAll('.function-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Add selected class to the clicked option
        element.classList.add('selected');
        
        // Set the selected function
        selectedFunctionId = vectorId;
        
        // Enable the check button
        checkAnswerBtn.disabled = false;
    }

    function getRandomBooleanFunction() {
        const randomIndex = Math.floor(Math.random() * booleanFunctions.length);
        return booleanFunctions[randomIndex];
    }

    function generateTruthTable(vector) {
        const tableData = [];
        
        for (let i = 0; i < 4; i++) {
            // Convert i to binary to get input values
            const binary = i.toString(2).padStart(2, '0');
            const x = parseInt(binary[0]);
            const y = parseInt(binary[1]);
            
            // Get output value from vector
            const output = vector[i];
            
            tableData.push({ x, y, output });
        }
        
        return tableData;
    }

    function updateTruthTable(vector) {
        truthTableBody.innerHTML = '';
        
        const tableData = generateTruthTable(vector);
        
        tableData.forEach(row => {
            const tr = document.createElement('tr');
            
            const tdX = document.createElement('td');
            tdX.textContent = row.x;
            tr.appendChild(tdX);
            
            const tdY = document.createElement('td');
            tdY.textContent = row.y;
            tr.appendChild(tdY);
            
            const tdOutput = document.createElement('td');
            tdOutput.textContent = row.output;
            tr.appendChild(tdOutput);
            
            truthTableBody.appendChild(tr);
        });
    }

    function startNewRound() {
        // Get a random boolean function
        currentFunction = getRandomBooleanFunction();
        
        // Update the function vector display
        functionVector.textContent = currentFunction.vector;
        
        // Update the truth table
        updateTruthTable(currentFunction.vector);
        
        // Reset selected function
        selectedFunctionId = null;
        
        // Reset UI
        document.querySelectorAll('.function-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        checkAnswerBtn.disabled = true;
        resultContainer.classList.add('hidden');
        correctAnswerContainer.classList.add('hidden');
        
        // Switch to vector tab
        tabs[0].click();
    }

    function checkAnswer() {
        if (!selectedFunctionId || !currentFunction) return;
        
        const isCorrect = selectedFunctionId === currentFunction.vector;
        
        // Update score
        rounds++;
        if (isCorrect) {
            score++;
        }
        
        // Update score display
        correctCountElement.textContent = score;
        totalCountElement.textContent = rounds;
        
        // Show result
        resultContainer.classList.remove('hidden');
        resultMessage.textContent = isCorrect ? 
            'Верно! Вы правильно определили функцию.' : 
            'Неверно. Правильный ответ:';
        
        resultMessage.className = isCorrect ? 'correct' : 'incorrect';
        
        // Show correct answer if wrong
        if (!isCorrect) {
            correctAnswerContainer.classList.remove('hidden');
            correctFunctionName.textContent = currentFunction.displayName;
            correctFunctionDisplay.textContent = currentFunction.name;
            functionExpression.textContent = currentFunction.expression;
        } else {
            correctAnswerContainer.classList.add('hidden');
        }

        checkAnswerBtn.disabled = true;
    }
});