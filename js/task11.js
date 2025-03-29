
document.addEventListener('DOMContentLoaded', function () {
    const functionVectors = document.getElementById('function-vectors');
    const membershipTable = document.getElementById('membership-table');
    const resultContainer = document.getElementById('result-container');
    const resultMessage = document.getElementById('result-message');
    const explanationContent = document.getElementById('explanation-content');
    const nextBtn = document.getElementById('next-btn');
    const checkBtn = document.getElementById('check-btn');
    const correctCountEl = document.getElementById('correct-count');
    const totalCountEl = document.getElementById('total-count');
    const checkboxes = document.querySelectorAll('.checkbox-wrapper input[type="checkbox"]');

    let currentFunctions = [];
    let correctClasses = new Set();
    let correctCount = 0;
    let totalCount = 0;

    // Функция для генерации случайного вектора
    function generateRandomVector(varsCount) {
        const length = Math.pow(2, varsCount);
        let vector = '';
        for (let i = 0; i < length; i++) {
            vector += Math.random() < 0.5 ? '0' : '1';
        }
        return vector;
    }

    // Функция для проверки сохранения нуля (T0)
    function checksT0(vector) {
        return vector[0] === '0';
    }

    // Функция для проверки сохранения единицы (T1)
    function checksT1(vector) {
        return vector[vector.length - 1] === '1';
    }

    // Функция для проверки самодвойственности (S)
    function checksS(vector) {
        const n = vector.length;
        for (let i = 0; i < n / 2; i++) {
            if (vector[i] === vector[n - 1 - i]) {
                return false;
            }
        }
        return true;
    }

    // Функция для проверки монотонности (M)
    function checksM(vector) {
        const n = Math.log2(vector.length);
        for (let i = 0; i < vector.length; i++) {
            for (let j = 0; j < vector.length; j++) {
                if (isLessOrEqual(i, j, n) && vector[i] > vector[j]) {
                    return false;
                }
            }
        }
        return true;
    }

    // Вспомогательная функция для проверки отношения порядка между наборами
    function isLessOrEqual(i, j, n) {
        // Преобразуем индексы в двоичное представление
        const binary1 = i.toString(2).padStart(n, '0');
        const binary2 = j.toString(2).padStart(n, '0');
        
        // Проверяем, что каждый бит в binary1 меньше или равен соответствующему биту в binary2
        for (let k = 0; k < n; k++) {
            if (binary1[k] > binary2[k]) {
                return false;
            }
        }
        return true;
    }

    // Функция для проверки линейности (L)
    function checksL(vector) {
        const n = vector.length;
        const log2n = Math.log2(n);
        
        // Для линейной функции должна быть возможность представить её в виде
        // f(x1,x2,...,xn) = a0 ⊕ a1x1 ⊕ a2x2 ⊕ ... ⊕ anxn ⊕ a12x1x2 ⊕ ...
        
        // Проверяем через преобразование Жегалкина
        // Используем метод треугольника (метод Мёбиуса)
        let coefficients = [...vector].map(bit => parseInt(bit));
        
        // Вычисляем коэффициенты методом треугольника
        for (let i = 0; i < log2n; i++) {
            for (let j = 0; j < n; j++) {
                if (j & (1 << i)) {
                    coefficients[j] = (coefficients[j] ^ coefficients[j ^ (1 << i)]);
                }
            }
        }
        
        // Проверяем, соответствуют ли коэффициенты линейной функции
        // Для линейной функции должны быть ненулевыми только коэффициенты при x0, x1, x2, ..., xn
        for (let i = 0; i < n; i++) {
            // Проверяем, является ли число i степенью двойки или нулем
            // Это соответствует одночленам x0, x1, x2, ..., xn
            const isPowerOfTwoOrZero = i === 0 || (i & (i - 1)) === 0;
            
            if (!isPowerOfTwoOrZero && coefficients[i] !== 0) {
                return false;
            }
        }
        
        return true;
    }

    // Функция для определения принадлежности к замкнутым классам
    function checkClosedClasses(functions) {
        const belongsTo = {
            T0: functions.every(f => checksT0(f)),
            T1: functions.every(f => checksT1(f)),
            S: functions.every(f => checksS(f)),
            M: functions.every(f => checksM(f)),
            L: functions.every(f => checksL(f))
        };

        const classes = new Set();

        // Если функция принадлежит хотя бы одному замкнутому классу
        const belongsToAnyClass = Object.values(belongsTo).some(belongs => belongs);

        if (!belongsToAnyClass) {
            classes.add('complete');
        } else {
            // Добавляем все классы, которым принадлежат функции
            for (const [className, belongs] of Object.entries(belongsTo)) {
                if (belongs) {
                    classes.add(className);
                }
            }
        }

        return classes;
    }

    // Функция для генерации таблицы принадлежности
    function generateMembershipTable(functions) {
        membershipTable.innerHTML = '';

        // Создаем заголовок таблицы
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>f</th><th>T0</th><th>T1</th><th>S</th><th>M</th><th>L</th>';
        membershipTable.appendChild(headerRow);

        // Заполняем таблицу для каждой функции
        functions.forEach((vector, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>f${index + 1}</td>
                <td>${checksT0(vector) ? '+' : '−'}</td>
                <td>${checksT1(vector) ? '+' : '−'}</td>
                <td>${checksS(vector) ? '+' : '−'}</td>
                <td>${checksM(vector) ? '+' : '−'}</td>
                <td>${checksL(vector) ? '+' : '−'}</td>
            `;
            membershipTable.appendChild(row);
        });
    }

    // Функция для начала новой игры
    function startNewRound() {
        // Генерируем 2-3 случайные функции
        const functionCount = Math.floor(Math.random() * 2) + 2; // 2 или 3 функции
        const varsCount = Math.floor(Math.random() * 2) + 2; // 2 или 3 переменные

        currentFunctions = Array.from(
            { length: functionCount },
            () => generateRandomVector(varsCount)
        );

        // Определяем правильный ответ
        correctClasses = checkClosedClasses(currentFunctions);

        // Отображаем функции
        functionVectors.innerHTML = currentFunctions
            .map((vector, index) => `
                <div class="function-vector">
                    <span class="label">f${index + 1}:</span>
                    <span class="vector">${vector}</span>
                </div>
            `)
            .join('');

        // Сбрасываем состояние
        resultContainer.classList.add('hidden');
        checkboxes.forEach(checkbox => checkbox.checked = false);
        checkBtn.disabled = false;
    }

    // Обработчик нажатия кнопки проверки
    checkBtn.addEventListener('click', function () {
        checkBtn.disabled = true;
        const selectedClasses = new Set();
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedClasses.add(checkbox.value);
            }
        });

        totalCount++;

        // Проверяем, совпадают ли выбранные классы с правильными
        const isCorrect = Array.from(selectedClasses).every(c => correctClasses.has(c)) &&
            Array.from(correctClasses).every(c => selectedClasses.has(c));

        if (isCorrect) {
            correctCount++;
        }

        correctCountEl.textContent = correctCount;
        totalCountEl.textContent = totalCount;

        // Показываем результат
        resultContainer.classList.remove('hidden');
        resultMessage.textContent = isCorrect
            ? 'Правильно! Вы верно определили принадлежность к замкнутым классам.'
            : 'Неправильно. Попробуйте еще раз.';
        resultMessage.className = isCorrect ? 'correct' : 'incorrect';

        // Добавляем объяснение и таблицу принадлежности
        let explanation = '<h4>Объяснение:</h4><ul>';
        if (correctClasses.has('complete')) {
            explanation += '<li>Система является полной, так как не принадлежит ни одному замкнутому классу.</li>';
        } else {
            explanation += `<li>Система неполная, так как принадлежит следующим замкнутым классам: ${Array.from(correctClasses).join(', ')}.</li>`;
        }
        explanation += '</ul>';
        explanationContent.innerHTML = explanation;

        // Генерируем таблицу принадлежности
        generateMembershipTable(currentFunctions);

        // Блокируем кнопку проверки
        checkBtn.disabled = true;

        // Прокручиваем к результату
        resultMessage.scrollIntoView({ behavior: 'smooth' });
    });

    // Обработчик кнопки "Следующий раунд"
    nextBtn.addEventListener('click', function () {
        startNewRound();
        checkBtn.disabled = false;
        document.getElementById('stat-container').scrollIntoView({ behavior: 'smooth' });
    });

    // Запускаем первый раунд
    startNewRound();
});