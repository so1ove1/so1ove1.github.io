document.addEventListener('DOMContentLoaded', function () {
    const functionVector = document.getElementById('function-vector');
    const inputDnf = document.getElementById('input-dnf');
    const errorDnf = document.getElementById('error-dnf');
    const checkBtn = document.getElementById('check-btn');
    const nextBtn = document.getElementById('next-btn');
    const resultContainer = document.getElementById('result-container');
    const resultMessage = document.getElementById('result-message');
    const truthTable = document.getElementById('truth-table');
    const helpContent = document.getElementById('help-content');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const correctCountEl = document.getElementById('correct-count');
    const totalCountEl = document.getElementById('total-count');

    let currentVector = '';
    let varsCount = 0;
    let correctCount = 0;
    let totalCount = 0;

    // Добавляем виртуальную клавиатуру
    const inputGroup = document.querySelector('.input-group');
    const keyboard = document.createElement('div');
    keyboard.className = 'virtual-keyboard';

    // Операторы и переменные
    const keysGroup = document.createElement('div');
    keysGroup.className = 'key-group';

    ['∨', '&', '¬', '(', ')'].forEach(symbol => {
        const key = document.createElement('button');
        key.className = 'key';
        key.textContent = symbol;
        key.onclick = () => insertAtCursor(inputDnf, symbol);
        keysGroup.appendChild(key);
    });

    for (let i = 1; i <= 9; i++) {
        const key = document.createElement('button');
        key.className = 'key';
        key.textContent = `x${i}`;
        key.onclick = () => insertAtCursor(inputDnf, `x${i}`);
        keysGroup.appendChild(key);
    }

    keyboard.appendChild(keysGroup);

    inputGroup.insertAdjacentElement('afterend', keyboard);

    // Функция для вставки символа в позицию курсора
    function insertAtCursor(input, text) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        input.value = input.value.substring(0, start) + text + input.value.substring(end);
        input.focus();
        input.selectionStart = input.selectionEnd = start + text.length;
    }

    // Функция для генерации случайного вектора
    function generateRandomVector() {
        varsCount = Math.floor(Math.random() * 2) + 2; // 2 или 3 переменные
        const length = Math.pow(2, varsCount);
        let vector = '';
        for (let i = 0; i < length; i++) {
            vector += Math.random() < 0.5 ? '0' : '1';
        }
        return vector;
    }

    // Функция для генерации набора переменных
    function generateVariableSet(index) {
        let binary = index.toString(2);
        while (binary.length < varsCount) {
            binary = '0' + binary;
        }
        return binary;
    }

    // Функция для вычисления значения ДНФ
    function evaluateDNF(dnf, variableValues) {
        try {
            // Заменяем символы на JavaScript операторы
            let expression = dnf
                .replace(/∨/g, '||')
                .replace(/&/g, '&&')
                .replace(/¬/g, '!')
                .replace(/\s+/g, ' ')
                .trim();

            // Заменяем переменные их значениями
            for (let i = 0; i < varsCount; i++) {
                const regex = new RegExp(`x${i + 1}`, 'g');
                expression = expression.replace(regex, variableValues[i]);
            }

            // Вычисляем значение выражения
            return eval(expression) ? '1' : '0';
        } catch (error) {
            return null;
        }
    }

    // Функция для проверки корректности ДНФ
    function validateDNF(dnf) {
        // Проверяем базовый синтаксис
        const validSymbols = /^[x0-9¬&∨\s()]+$/;
        if (!validSymbols.test(dnf)) {
            return { valid: false, message: 'Используйте только разрешенные символы: x1-x9, ¬, &, ∨, (, )' };
        }

        // Проверяем правильность использования переменных
        const variables = dnf.match(/x\d+/g) || [];
        for (const variable of variables) {
            const num = parseInt(variable.substring(1));
            if (num < 1 || num > varsCount) {
                return { valid: false, message: `Переменная ${variable} недопустима для текущей функции` };
            }
        }

        return { valid: true };
    }

    // Функция для проверки эквивалентности функций
    function checkEquivalence(userDnf) {
        const validation = validateDNF(userDnf);
        if (!validation.valid) {
            return { correct: false, message: validation.message };
        }

        // Проверяем все возможные наборы значений переменных
        for (let i = 0; i < currentVector.length; i++) {
            const variableValues = generateVariableSet(i).split('');
            const dnfResult = evaluateDNF(userDnf, variableValues);

            if (dnfResult === null) {
                return { correct: false, message: 'Ошибка в синтаксисе ДНФ' };
            }

            if (dnfResult !== currentVector[i]) {
                return { correct: false, message: 'ДНФ не соответствует заданной функции' };
            }
        }

        return { correct: true, message: 'Правильно! ДНФ соответствует заданной функции.' };
    }

    // Функция для генерации таблицы истинности
    function generateTruthTable() {
        truthTable.innerHTML = '';

        // Создаем заголовок таблицы
        const headerRow = document.createElement('tr');
        for (let i = 1; i <= varsCount; i++) {
            const th = document.createElement('th');
            th.textContent = `x${i}`;
            headerRow.appendChild(th);
        }
        const resultTh = document.createElement('th');
        resultTh.textContent = 'f';
        headerRow.appendChild(resultTh);
        truthTable.appendChild(headerRow);

        // Заполняем таблицу значениями
        for (let i = 0; i < currentVector.length; i++) {
            const row = document.createElement('tr');
            const variables = generateVariableSet(i);

            // Добавляем значения переменных
            for (let j = 0; j < varsCount; j++) {
                const td = document.createElement('td');
                td.textContent = variables[j];
                row.appendChild(td);
            }

            // Добавляем значение функции
            const resultTd = document.createElement('td');
            resultTd.textContent = currentVector[i];
            row.appendChild(resultTd);
            truthTable.appendChild(row);
        }
    }

    // Функция для обновления подсказки
    function updateHelp() {
        let help = '<div class="help-content">';
        help += '<h4>Горячие клавиши:</h4>';
        help += '<ul>';
        help += '<li>Alt + v — ∨ (ИЛИ)</li>';
        help += '<li>Alt + a — & (И)</li>';
        help += '<li>Alt + n — ¬ (НЕ)</li>';
        help += '<li>Alt + 1...9 — x1...x9</li>';
        help += '</ul>';
        help += '<h4>Подсказки:</h4>';
        help += '<ul>';
        help += '<li>Проверьте правильность использования операторов (∨, &, ¬)</li>';
        help += '<li>Убедитесь, что все переменные записаны правильно (x1, x2, ...)</li>';
        help += '<li>Проверьте соответствие вашей ДНФ таблице функции</li>';
        help += '</ul>';
        help += '</div>';
        helpContent.innerHTML = help;
    }

    function scrollToFunctionVector() {
        const functionVectorElement = document.getElementById('stat-container');
        functionVectorElement.scrollIntoView({ behavior: 'smooth' });
    }

    function scrollToResult() {
        const resultElement = document.getElementById('result-message');
        resultElement.scrollIntoView({ behavior: 'smooth' });
    }

    // Функция для начала новой игры
    function startNewRound() {
        currentVector = generateRandomVector();
        functionVector.textContent = currentVector;
        inputDnf.value = '';
        errorDnf.style.display = 'none';
        resultContainer.classList.add('hidden');
        generateTruthTable();
        updateHelp();
        checkBtn.disabled = false;

        // Убираем пульсацию и снова добавляем ее (для перезапуска анимации)
        functionVector.classList.remove('animate-pulse');
        setTimeout(() => {
            functionVector.classList.add('animate-pulse');
        }, 10);

        // Сбрасываем вкладки (показываем вектор)
        tabs[0].click();
    }

    // Обработчик клавиатуры для горячих клавиш
    inputDnf.addEventListener('keydown', function (e) {
        if (e.altKey) {
            let insert = '';
            if (e.key === 'v') insert = '∨';
            else if (e.key === 'a') insert = '&';
            else if (e.key === 'n') insert = '¬';
            else if (/^[1-9]$/.test(e.key)) insert = 'x' + e.key;

            if (insert) {
                e.preventDefault();
                const start = this.selectionStart;
                const end = this.selectionEnd;
                this.value = this.value.substring(0, start) + insert + this.value.substring(end);
                this.selectionStart = this.selectionEnd = start + insert.length;
            }
        }
    });

    // Обработчик нажатия кнопки проверки
    checkBtn.addEventListener('click', function () {
        const userDnf = inputDnf.value.trim();

        if (!userDnf) {
            errorDnf.textContent = 'Введите ДНФ';
            errorDnf.style.display = 'block';
            resultContainer.classList.add('hidden');
            return;
        }

        totalCount++;
        const result = checkEquivalence(userDnf);

        if (result.correct) {
            correctCount++;
        }

        correctCountEl.textContent = correctCount;
        totalCountEl.textContent = totalCount;

        errorDnf.style.display = 'none';
        resultContainer.classList.remove('hidden');

        resultMessage.textContent = result.message;
        resultMessage.className = result.correct ? 'correct' : 'incorrect';
        checkBtn.disabled = true;

        scrollToResult();
    });

    // Обработчик нажатия кнопки "Следующий раунд"
    nextBtn.addEventListener('click', function () {
        startNewRound();
        scrollToFunctionVector();
    });

    // Обработчик переключения вкладок
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');

            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Запускаем первый раунд
    startNewRound();
});