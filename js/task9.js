document.addEventListener('DOMContentLoaded', function() {
    const inputVector = document.getElementById('input-vector');
    const errorVector = document.getElementById('error-vector');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultContainer = document.getElementById('result-container');
    const pcnfResult = document.getElementById('pcnf-result');
    const truthTable = document.getElementById('truth-table');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Функция для проверки корректности ввода
    function validateInput(vector) {
        const binaryRegex = /^[01]+$/;
        const length = vector.length;
        
        // Проверяем, что вектор состоит только из 0 и 1
        if (!binaryRegex.test(vector)) {
            return { valid: false, errorMessage: 'Вектор должен содержать только 0 и 1' };
        }

        // Проверяем, что длина вектора является степенью двойки
        if ((length & (length - 1)) !== 0 || length === 0) {
            return { valid: false, errorMessage: 'Длина вектора должна быть степенью 2' };
        }

        return { valid: true };
    }

    // Функция для определения количества переменных по длине вектора
    function getVariablesCount(vectorLength) {
        return Math.log2(vectorLength);
    }

    // Функция для генерации набора переменных
    function generateVariableSet(index, varsCount) {
        let binary = index.toString(2);
        while (binary.length < varsCount) {
            binary = '0' + binary;
        }
        return binary;
    }

    // Функция для построения СКНФ
    function buildPCNF(vector) {
        const varsCount = getVariablesCount(vector.length);
        let terms = [];

        // Перебираем все наборы значений переменных
        for (let i = 0; i < vector.length; i++) {
            // Если значение функции равно 0, формируем дизъюнкцию
            if (vector[i] === '0') {
                const variables = generateVariableSet(i, varsCount);
                let term = '';

                // Формируем дизъюнкцию переменных
                for (let j = 0; j < varsCount; j++) {
                    if (j > 0) term += ' ∨ ';
                    term += variables[j] === '1' ? `¬x${j + 1}` : `x${j + 1}`;
                }

                // Добавляем скобки вокруг дизъюнкции
                term = `(${term})`;
                terms.push(term);
            }
        }

        // Если нет термов, функция тождественно равна 1
        if (terms.length === 0) {
            return '1';
        }

        // Соединяем все термы конъюнкцией
        return terms.join(' & ');
    }

    // Функция для генерации таблицы истинности
    function generateTruthTable(vector) {
        const varsCount = getVariablesCount(vector.length);
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
        for (let i = 0; i < vector.length; i++) {
            const row = document.createElement('tr');
            const variables = generateVariableSet(i, varsCount);
            
            // Добавляем значения переменных
            for (let j = 0; j < varsCount; j++) {
                const td = document.createElement('td');
                td.textContent = variables[j];
                row.appendChild(td);
            }

            // Добавляем значение функции
            const resultTd = document.createElement('td');
            resultTd.textContent = vector[i];
            row.appendChild(resultTd);
            truthTable.appendChild(row);
        }
    }

    // Обработчик нажатия кнопки
    calculateBtn.addEventListener('click', function() {
        const vector = inputVector.value.trim();

        // Проверяем корректность ввода
        const validation = validateInput(vector);
        if (!validation.valid) {
            errorVector.textContent = validation.errorMessage;
            errorVector.style.display = 'block';
            resultContainer.style.display = 'none';
            return;
        }

        errorVector.style.display = 'none';
        resultContainer.style.display = 'block';

        // Строим СКНФ и таблицу истинности
        const pcnf = buildPCNF(vector);
        pcnfResult.textContent = pcnf;
        generateTruthTable(vector);
    });

    // Обработчик переключения вкладок
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Активируем выбранную вкладку
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Показываем соответствующий контент
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
});