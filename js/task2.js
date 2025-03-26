document.addEventListener('DOMContentLoaded', function() {
    const inputVector = document.getElementById('input-vector');
    const inputValue = document.getElementById('input-value');
    const inputArg = document.getElementById('input-arg');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultContainer = document.getElementById('result-container');
    const vectorResult = document.getElementById('vector-result');
    const truthTable = document.getElementById('truth-table');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Обработка переключения вкладок
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Обновить активную вкладку
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Показать соответствующий контент
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Проверка корректности ввода
    function validateInput() {
        const vector = inputVector.value;
        const argNum = parseInt(inputArg.value);
        const varsCount = Math.log2(vector.length);

        let isValid = true;
        
        // Проверка вектора функции
        if (!/^[01]+$/.test(vector) || !isPowerOfTwo(vector.length)) {
            document.getElementById('error-vector').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('error-vector').style.display = 'none';
        }

        // Проверка номера аргумента
        if (isNaN(argNum) || argNum < 1 || argNum > varsCount) {
            document.getElementById('error-arg').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('error-arg').style.display = 'none';
        }

        return isValid;
    }

    // Проверка, является ли число степенью двойки
    function isPowerOfTwo(n) {
        return n && (n & (n - 1)) === 0;
    }

    // Получение остаточной функции
    function getResidualFunction(vector, value, argNum) {
        const varsCount = Math.log2(vector.length);
        const residualLength = vector.length / 2;
        const result = new Array(residualLength);
        
        for (let i = 0; i < residualLength; i++) {
            // Вычисляем позицию в исходном векторе
            let pos = i;
            // Вставляем значение аргумента в нужную позицию
            const shift = varsCount - argNum;
            pos = ((pos >> shift) << (shift + 1)) | (value << shift) | (pos & ((1 << shift) - 1));
            result[i] = vector[pos];
        }
        
        return result.join('');
    }

    // Генерация таблицы истинности
    function generateTruthTable(vector, value, argNum) {
        const varsCount = Math.log2(vector.length);
        const residualVarsCount = varsCount - 1;
        
        // Очистить таблицу
        truthTable.innerHTML = '';
        
        // Создать заголовок
        const headerRow = document.createElement('tr');
        
        // Добавить заголовки для переменных
        for (let i = 1; i <= varsCount; i++) {
            if (i !== argNum) {
                const th = document.createElement('th');
                th.textContent = `x${i}`;
                headerRow.appendChild(th);
            }
        }
        
        // Добавить заголовок для результата
        const resultTh = document.createElement('th');
        resultTh.textContent = 'f(x)';
        headerRow.appendChild(resultTh);
        
        truthTable.appendChild(headerRow);
        
        // Создать строки с данными
        const residualVector = getResidualFunction(vector, value, argNum);
        const rows = Math.pow(2, residualVarsCount);
        
        for (let i = 0; i < rows; i++) {
            const row = document.createElement('tr');
            
            // Преобразовать индекс в двоичное представление
            let binary = i.toString(2);
            while (binary.length < residualVarsCount) {
                binary = '0' + binary;
            }
            
            // Добавить значения переменных
            for (let j = 0; j < binary.length; j++) {
                const td = document.createElement('td');
                td.textContent = binary[j];
                row.appendChild(td);
            }
            
            // Добавить результат функции
            const resultTd = document.createElement('td');
            resultTd.textContent = residualVector[i];
            row.appendChild(resultTd);
            
            truthTable.appendChild(row);
        }
    }

    // Обработка нажатия кнопки
    calculateBtn.addEventListener('click', function() {
        if (!validateInput()) {
            return;
        }

        const vector = inputVector.value;
        const value = parseInt(inputValue.value);
        const argNum = parseInt(inputArg.value);

        // Получить остаточную функцию
        const result = getResidualFunction(vector, value, argNum);

        // Показать результат
        vectorResult.textContent = result;
        resultContainer.style.display = 'block';

        // Сгенерировать таблицу истинности
        generateTruthTable(vector, value, argNum);
    });

    // Валидация при вводе
    inputVector.addEventListener('input', validateInput);
    inputArg.addEventListener('input', validateInput);
});