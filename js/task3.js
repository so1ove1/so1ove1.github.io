document.addEventListener('DOMContentLoaded', function () {
    const inputF0 = document.getElementById('input-f0');
    const inputF1 = document.getElementById('input-f1');
    const inputArg = document.getElementById('input-arg');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultContainer = document.getElementById('result-container');
    const vectorResult = document.getElementById('vector-result');
    const truthTable = document.getElementById('truth-table');
    const errorF0 = document.getElementById('error-f0');
    const errorF1 = document.getElementById('error-f1');
    const errorArg = document.getElementById('error-arg');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Переключение вкладок
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Удалить класс active со всех вкладок
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Добавить класс active к нажатой вкладке
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Функция расчета
    calculateBtn.addEventListener('click', function () {
        // Сбросить сообщения об ошибках
        errorF0.style.display = 'none';
        errorF1.style.display = 'none';
        errorArg.style.display = 'none';

        // Получить значения из полей ввода
        const f0 = inputF0.value.trim();
        const f1 = inputF1.value.trim();
        const argNum = parseInt(inputArg.value);

        // Проверить ввод на ошибки
        let hasError = false;

        // Проверить вектор f0
        if (!isValidVector(f0)) {
            errorF0.style.display = 'block';
            hasError = true;
        }

        // Проверить вектор f1
        if (!isValidVector(f1)) {
            errorF1.style.display = 'block';
            hasError = true;
        }

        // Проверить, что векторы имеют одинаковую длину
        if (f0.length !== f1.length) {
            errorF0.textContent = 'Векторы должны иметь одинаковую длину';
            errorF0.style.display = 'block';
            hasError = true;
        }

        // Проверить номер аргумента
        if (isNaN(argNum) || argNum < 1) {
            errorArg.textContent = 'Введите положительное число';
            errorArg.style.display = 'block';
            hasError = true;
        }

        // Рассчитать количество переменных на основе длины вектора
        const residualVarsCount = Math.log2(f0.length);

        // Проверить, что длина вектора является степенью 2
        if (!Number.isInteger(residualVarsCount)) {
            errorF0.textContent = 'Длина вектора должна быть степенью 2';
            errorF0.style.display = 'block';
            hasError = true;
        }

        // Общее количество переменных равно количеству остаточных переменных + 1
        const totalVarsCount = residualVarsCount + 1;

        // Проверить номер аргумента
        if (argNum > totalVarsCount) {
            errorArg.textContent = `Номер аргумента должен быть от 1 до ${totalVarsCount}`;
            errorArg.style.display = 'block';
            hasError = true;
        }

        if (hasError) {
            return;
        }

        // Восстановить исходный вектор функции
        const functionVector = reconstructVector(f0, f1, argNum, totalVarsCount);

        // Вывести результаты
        displayResults(functionVector, argNum, totalVarsCount);

        // Показать контейнер результатов
        resultContainer.style.display = 'block';

        // Прокрутить к результатам
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Проверить, что строка содержит только 0 и 1
    function isValidVector(vector) {
        return /^[01]+$/.test(vector);
    }

    // Восстановить исходный вектор функции из остаточных функций
    function reconstructVector(f0, f1, argNum, totalVarsCount) {
        const f0Array = f0.split('').map(Number);
        const f1Array = f1.split('').map(Number);
        const resultLength = Math.pow(2, totalVarsCount);
        const result = new Array(resultLength);

        // Для каждой позиции в векторе результата
        for (let i = 0; i < resultLength; i++) {
            // Преобразовать позицию в двоичное представление
            let binaryStr = i.toString(2);
            while (binaryStr.length < totalVarsCount) {
                binaryStr = '0' + binaryStr;
            }

            // Получить значение аргумента, который нас интересует
            const argValue = parseInt(binaryStr[argNum - 1]);

            // Создать новую двоичную строку без аргумента, который нас интересует
            let residualIndex = '';
            for (let j = 0; j < totalVarsCount; j++) {
                if (j !== argNum - 1) {
                    residualIndex += binaryStr[j];
                }
            }

            // Преобразовать индекс остатка в десятичное число
            const residualDecimal = parseInt(residualIndex, 2);

            // Установить результат на основе значения аргумента
            if (argValue === 0) {
                result[i] = f0Array[residualDecimal];
            } else {
                result[i] = f1Array[residualDecimal];
            }
        }

        return result;
    }

    // Вывести результаты
    function displayResults(functionVector, argNum, totalVarsCount) {
        // Вывести вектор
        vectorResult.textContent = functionVector.join('');

        // Сгенерировать таблицу истинности
        generateTruthTable(functionVector, totalVarsCount, argNum);
    }

    // Сгенерировать таблицу истинности
    function generateTruthTable(functionVector, varsCount, highlightArg) {
        // Очистить предыдущую таблицу
        truthTable.innerHTML = '';

        // Создать строку заголовка
        const headerRow = document.createElement('tr');

        // Добавить заголовки переменных (x1, x2, ..., xn)
        for (let i = 1; i <= varsCount; i++) {
            const th = document.createElement('th');
            th.textContent = `x${i}`;

            // Выделить аргумент, использованный для остаточных функций
            if (i === highlightArg) {
                th.style.color = 'var(--accent)';
                th.style.fontWeight = 'bold';
            }

            headerRow.appendChild(th);
        }

        // Добавить заголовок результата функции
        const resultTh = document.createElement('th');
        resultTh.textContent = 'f';
        headerRow.appendChild(resultTh);

        truthTable.appendChild(headerRow);

        // Создать строки данных
        const rows = Math.pow(2, varsCount);
        for (let i = 0; i < rows; i++) {
            const row = document.createElement('tr');

            // Преобразовать индекс строки в двоичное представление и заполнить нулями
            let binaryStr = i.toString(2);
            while (binaryStr.length < varsCount) {
                binaryStr = '0' + binaryStr;
            }

            // Добавить значения переменных (0 или 1)
            for (let j = 0; j < varsCount; j++) {
                const td = document.createElement('td');
                td.textContent = binaryStr[j];

                // Выделить аргумент, использованный для остаточных функций
                if (j === highlightArg - 1) {
                    td.style.color = 'var(--accent)';
                    td.style.fontWeight = 'bold';
                }

                row.appendChild(td);
            }

            // Добавить результат функции
            const resultTd = document.createElement('td');
            resultTd.textContent = functionVector[i];
            row.appendChild(resultTd);

            truthTable.appendChild(row);
        }
    }
});
