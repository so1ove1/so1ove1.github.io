document.addEventListener('DOMContentLoaded', function() {
    const inputVector = document.getElementById('input-vector');
    const inputValue = document.getElementById('input-value');
    const inputArg = document.getElementById('input-arg');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultContainer = document.getElementById('result-container');
    const vectorResult = document.getElementById('vector-result');

    // Проверка корректности ввода
    function validateInput() {
        const vector = inputVector.value;
        const argNum = parseInt(inputArg.value);
        const varsCount = Math.log2(vector.length);

        let isValid = true;

        // Проверка вектора функции (только 0 и 1)
        if (!/^[01]+$/.test(vector)) {
            document.getElementById('error-vector').textContent = 'Введите корректный вектор (только 0 и 1).';
            document.getElementById('error-vector').style.display = 'block';
            return false;
        } else {
            document.getElementById('error-vector').style.display = 'none';
        }

        // Проверка, является ли число степенью двойки
        if (!isPowerOfTwo(vector.length) || !Number.isInteger(varsCount)) {
            document.getElementById('error-vector').textContent = 'Длина вектора должна быть степенью 2';
            document.getElementById('error-vector').style.display = 'block';
            return false;
        }

        // Проверка номера аргумента
        if (isNaN(argNum) || argNum < 1 || argNum > varsCount) {
            document.getElementById('error-arg').textContent = `Номер аргумента должен быть от 1 до ${varsCount}`;
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
            let pos = i;
            const shift = varsCount - argNum;
            pos = ((pos >> shift) << (shift + 1)) | (value << shift) | (pos & ((1 << shift) - 1));
            result[i] = vector[pos];
        }

        return result.join('');
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
    });
});