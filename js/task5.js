document.addEventListener('DOMContentLoaded', function() {
    const functionVector = document.getElementById('function-vector');
    const truthTable = document.getElementById('truth-table-body');
    const checkAnswerBtn = document.getElementById('check-answer');
    const nextRoundBtn = document.getElementById('next-round');
    const resultContainer = document.getElementById('result-container');
    const resultMessage = document.getElementById('result-message');
    const correctAnswerContainer = document.getElementById('correct-answer-container');
    const correctVariablesList = document.getElementById('correct-variables');
    const functionDescription = document.getElementById('function-description');
    const correctCountEl = document.getElementById('correct-count');
    const totalCountEl = document.getElementById('total-count');
    const variableOptions = document.querySelectorAll('.variable-option');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Инициализация счетчиков
    let correctCount = 0;
    let totalCount = 0;

    // Текущая функция
    let currentFunction = null;

    // Переключение вкладок
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Убираем класс active со всех вкладок
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Добавляем класс active к выбранной вкладке
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Выбор переменных (обработка клика на блок)
    variableOptions.forEach(option => {
        const checkbox = option.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('click', function(event) {
            event.stopPropagation();
        });
        option.addEventListener('click', function() {
            checkbox.checked = !checkbox.checked;
            option.classList.toggle('selected', checkbox.checked);
        });
    });

    // Функция для генерации случайного вектора булевой функции
    function generateRandomFunction() {
        const vars = Math.floor(Math.random() * 2) + 2;
        const vectorLength = Math.pow(2, vars);
        let vector = [];

        // Генерируем случайный вектор
        for (let i = 0; i < vectorLength; i++) {
            vector.push(Math.round(Math.random()));
        }

        // Определяем существенные переменные
        const essentialVars = findEssentialVariables(vector, vars);

        return {
            vector: vector,
            essentialVars: essentialVars,
            vars: vars
        };
    }

    // Функция для определения существенных переменных
    function findEssentialVariables(vector, vars) {
        const essentialVars = [];

        // Проверяем каждую переменную на существенность
        for (let i = 0; i < vars; i++) {
            if (isEssentialVariable(vector, i)) {
                essentialVars.push(i + 1); // +1 потому что нумеруем с 1, а не с 0
            }
        }

        return essentialVars;
    }

    // Функция для проверки, является ли переменная существенной
    function isEssentialVariable(vector, varIndex) {
        const vars = Math.log2(vector.length);
    
        for (let i = 0; i < vector.length; i++) {
            // Инвертируем выбранную переменную
            const pairedIndex = i ^ (1 << (vars - varIndex - 1));
    
            if (vector[i] !== vector[pairedIndex]) {
                return true; // Переменная существенна
              }
            }
          
            return false; // Переменная несущественна
    }

    function generateTruthTable(n, functionVector) {
        // Clear previous table
        truthTable.innerHTML = '';

        // Create header row
        const headerRow = document.createElement('tr');
        
        // Add variable headers (x1, x2, ..., xn)
        for (let i = 1; i <= n; i++) {
            const th = document.createElement('th');
            th.textContent = `x${i}`;
            headerRow.appendChild(th);
        }

        // Add function result header
        const resultTh = document.createElement('th');
        resultTh.textContent = 'f';
        headerRow.appendChild(resultTh);
        
        truthTable.appendChild(headerRow);

        // Create data rows
        const rows = Math.pow(2, n);
        for (let i = 0; i < rows; i++) {
            const row = document.createElement('tr');
            
            // Convert row index to binary and pad with zeros
            let binaryStr = i.toString(2);
            while (binaryStr.length < n) {
                binaryStr = '0' + binaryStr;
            }
            
            // Add variable values (0 or 1)
            for (let j = 0; j < n; j++) {
                const td = document.createElement('td');
                td.textContent = binaryStr[j];
                row.appendChild(td);
            }
            
            // Add function result
            const resultTd = document.createElement('td');
            resultTd.textContent = functionVector[i];
            row.appendChild(resultTd);
            
            truthTable.appendChild(row);
        }
    }

    // Функция для запуска нового раунда
    function startNewRound() {
        currentFunction = null;
        checkAnswerBtn.disabled = false;
        // Генерируем новую функцию
        currentFunction = generateRandomFunction();

        // Отображаем вектор
        functionVector.textContent = currentFunction.vector.join('');

        // Отображаем таблицу истинности
        generateTruthTable(currentFunction.vars, currentFunction.vector);

        // Очищаем выбранные переменные
        document.querySelectorAll('.var-checkbox').forEach(checkbox => {
            checkbox.checked = false;
            checkbox.closest('.variable-option').classList.remove('selected');
        });

        // Скрываем результат
        resultContainer.classList.add('hidden');
        correctAnswerContainer.classList.add('hidden');

        // Сбрасываем вкладки (показываем вектор)
        tabs[0].click();

        // Убираем пульсацию и снова добавляем ее (для перезапуска анимации)
        functionVector.classList.remove('animate-pulse');
        setTimeout(() => {
            functionVector.classList.add('animate-pulse');
        }, 10);

        // Обновляем количество переменных
        const variableOptions = document.querySelectorAll('.variable-option');
        variableOptions.forEach(option => {
            option.classList.remove('hidden');
        });
        for (let i = currentFunction.vars; i < 3; i++) {
            variableOptions[i].classList.add('hidden');
        }
    }

    // Функция для проверки ответа
    function checkAnswer() {
        // Получаем выбранные переменные
        const selectedVars = [];
        document.querySelectorAll('.var-checkbox').forEach((checkbox, index) => {
            if (checkbox.checked && index < currentFunction.vars) {
                selectedVars.push(index + 1); // +1 потому что нумеруем с 1, а не с 0
            }
        });

        // Сравниваем с правильным ответом
        const isCorrect = arraysEqual(selectedVars.sort(), currentFunction.essentialVars.sort());

        // Обновляем счетчики
        totalCount++;
        if (isCorrect) {
            correctCount++;
        }

        // Обновляем отображение счетчиков
        correctCountEl.textContent = correctCount;
        totalCountEl.textContent = totalCount;

        checkAnswerBtn.disabled = true;

        // Отображаем результат
        resultContainer.classList.remove('hidden');

        if (isCorrect) {
            resultMessage.textContent = 'Верно! Вы правильно определили существенные и фиктивные переменные.';
            resultMessage.className = 'correct';
        } else {
            resultMessage.textContent = 'Неверно. Изучите информацию выше.';
            resultMessage.className = 'incorrect';
            correctAnswerContainer.classList.remove('hidden');

            // Отображаем правильный ответ
            correctVariablesList.innerHTML = '';

            if (currentFunction.essentialVars.length === 0) {
                const li = document.createElement('li');
                li.textContent = 'Нет существенных переменных (все переменные фиктивные)';
                correctVariablesList.appendChild(li);
            } else {
                currentFunction.essentialVars.forEach(varIndex => {
                    const li = document.createElement('li');
                    li.textContent = `x${varIndex} - существенная`;
                    correctVariablesList.appendChild(li);
                });
            }

            // Добавляем фиктивные переменные в список
            const fakeVars = Array.from({length: currentFunction.vars}, (_, i) => i + 1).filter(v => !currentFunction.essentialVars.includes(v));
            if (fakeVars.length > 0) {
                fakeVars.forEach(varIndex => {
                    const li = document.createElement('li');
                    li.textContent = `x${varIndex} - фиктивная`;
                    correctVariablesList.appendChild(li);
                });
            }
        }

        // Описание функции
        let description = '';
        if (currentFunction.essentialVars.length === 0) {
            description = 'Эта функция является константой (не зависит ни от одной переменной).';
        } else if (currentFunction.essentialVars.length === 1) {
            description = `Эта функция зависит только от переменной x${currentFunction.essentialVars[0]}.`;
        } else {
            description = `Эта функция зависит от переменных: ${currentFunction.essentialVars.map(v => `x${v}`).join(', ')}.`;
        }

        functionDescription.textContent = description;
    }

    // Функция для сравнения массивов
    function arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }

    // Обработчики событий
    checkAnswerBtn.addEventListener('click', checkAnswer);
    nextRoundBtn.addEventListener('click', startNewRound);

    // Запускаем первый раунд
    startNewRound();
});