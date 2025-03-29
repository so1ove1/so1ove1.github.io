document.addEventListener('DOMContentLoaded', function () {
    const functionVector = document.getElementById('function-vector');
    const checkBtn = document.getElementById('check-btn');
    const nextBtn = document.getElementById('next-btn');
    const resultContainer = document.getElementById('result-container');
    const resultMessage = document.getElementById('result-message');
    const explanation = document.getElementById('explanation');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const correctCountEl = document.getElementById('correct-count');
    const totalCountEl = document.getElementById('total-count');

    let currentVector = '';
    let correctClasses = new Set();
    let usesTwoVariables = false;
    
    // Инициализация счетчиков результатов
    let correctCount = 0;
    let totalCount = 0;

    // Add animation class toggle effect on checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Если выбран "Никому", снимаем все остальные чекбоксы
            if (this.value === 'NONE' && this.checked) {
                checkboxes.forEach(cb => {
                    if (cb.value !== 'NONE') {
                        cb.checked = false;
                        const label = cb.closest('.checkbox-label');
                        label.style.borderColor = 'var(--border, #e2e8f0)';
                        label.style.borderWidth = '1px';
                        label.style.backgroundColor = 'rgba(51, 65, 85, 0.3)';
                    }
                });
            } else if (this.checked && this.value !== 'NONE') {
                // Если выбран любой класс кроме "Никому", снимаем чекбокс с "Никому"
                checkboxes.forEach(cb => {
                    if (cb.value === 'NONE') {
                        cb.checked = false;
                        const label = cb.closest('.checkbox-label');
                        label.style.borderColor = 'var(--border, #e2e8f0)';
                        label.style.borderWidth = '1px';
                        label.style.backgroundColor = 'rgba(51, 65, 85, 0.3)';
                    }
                });
            }

            const label = this.closest('.checkbox-label');
            if (this.checked) {
                label.style.borderColor = 'var(--accent, #0ea5e9)';
                label.style.borderWidth = '2px';
                label.style.backgroundColor = 'rgba(14, 165, 233, 0.1)';
            } else {
                label.style.borderColor = 'var(--border, #e2e8f0)';
                label.style.borderWidth = '1px';
                label.style.backgroundColor = 'rgba(51, 65, 85, 0.3)';
            }
        });
    });

    // Генерация случайного вектора функции от одной или двух переменных
    function generateVector() {
        // С вероятностью 50% генерируем функцию от двух переменных
        usesTwoVariables = Math.random() > 0.5;
        
        if (usesTwoVariables) {
            // Функция от двух переменных - 4 значения (2^2)
            const vector = Array.from({ length: 4 }, () => Math.random() > 0.5 ? '1' : '0').join('');
            return vector;
        } else {
            // Функция от трех переменных - 8 значений (2^3)
            const vector = Array.from({ length: 8 }, () => Math.random() > 0.5 ? '1' : '0').join('');
            return vector;
        }
    }

    // Проверка сохранения константы 0
    function checksT0(vector) {
        return vector[0] === '0';
    }

    // Проверка сохранения константы 1
    function checksT1(vector) {
        return vector[vector.length - 1] === '1';
    }

    // Проверка линейности
    function checksL(vector) {
        const n = Math.log2(vector.length);
        if (!Number.isInteger(n)) return false;

        // Преобразование вектора в числа
        const nums = vector.split('').map(Number);
        
        // Проверка через преобразование Жегалкина
        const zhegalkin = new Array(vector.length).fill(0);
        for (let i = 0; i < vector.length; i++) {
            let temp = nums[i];
            for (let j = 0; j < i; j++) {
                if ((i & j) === j) {
                    temp ^= zhegalkin[j];
                }
            }
            zhegalkin[i] = temp;
        }

        // Функция линейна, если коэффициенты при всех произведениях переменных равны 0
        for (let i = 0; i < vector.length; i++) {
            if (zhegalkin[i] !== 0 && (i & (i - 1)) !== 0) {
                return false;
            }
        }
        return true;
    }

    // Проверка самодвойственности
    function checksS(vector) {
        const n = vector.length;
        for (let i = 0; i < n / 2; i++) {
            if (vector[i] === vector[n - 1 - i]) {
                return false;
            }
        }
        return true;
    }

    // Проверка монотонности
    function checksM(vector) {
        const n = Math.log2(vector.length);
        if (!Number.isInteger(n)) return false;

        for (let i = 0; i < vector.length; i++) {
            for (let j = i + 1; j < vector.length; j++) {
                if ((i & j) === i && vector[i] > vector[j]) {
                    return false;
                }
            }
        }
        return true;
    }

    // Определение предполных классов для вектора
    function determineClasses(vector) {
        const classes = new Set();
        if (checksT0(vector)) classes.add('T0');
        if (checksT1(vector)) classes.add('T1');
        if (checksL(vector)) classes.add('L');
        if (checksS(vector)) classes.add('S');
        if (checksM(vector)) classes.add('M');
        return classes;
    }

    // Генерация объяснения для каждого класса
    function generateExplanation(vector, selectedClasses, correctClasses) {
        const variablesCount = Math.log2(vector.length);
        let exp = '<h4>Объяснение:</h4>';
        
        // Добавляем информацию о количестве переменных
        exp += `<p>Данная функция зависит от ${variablesCount} переменных.</p>`;
        
        // Проверяем, не принадлежит ли функция ни одному из классов
        if (correctClasses.size === 0) {
            exp += `<p>Эта функция не принадлежит ни одному из предполных классов.</p>`;
        }
        
        exp += '<ul>';
        
        // T0
        exp += `<li><strong>T₀</strong> (сохранение 0): функция ${checksT0(vector) ? '' : 'не '}принадлежит классу T₀, так как f(0,0,...,0) = ${vector[0]}${checksT0(vector) ? ' = 0' : ' ≠ 0'}</li>`;
        
        // T1
        exp += `<li><strong>T₁</strong> (сохранение 1): функция ${checksT1(vector) ? '' : 'не '}принадлежит классу T₁, так как f(1,1,...,1) = ${vector[vector.length-1]}${checksT1(vector) ? ' = 1' : ' ≠ 1'}</li>`;
        
        // L
        exp += `<li><strong>L</strong> (линейность): функция ${checksL(vector) ? '' : 'не '}является линейной</li>`;
        
        // S
        exp += `<li><strong>S</strong> (самодвойственность): функция ${checksS(vector) ? '' : 'не '}является самодвойственной</li>`;
        
        // M
        exp += `<li><strong>M</strong> (монотонность): функция ${checksM(vector) ? '' : 'не '}является монотонной</li>`;
        
        exp += '</ul>';
        return exp;
    }

    // Анимация пульсации вектора
    function animateVector() {
        functionVector.classList.remove('animate-pulse');
        setTimeout(() => {
            functionVector.classList.add('animate-pulse');
        }, 10);
    }

    // Начать новую игру
    function startNewGame() {
        // Генерируем новый вектор
        currentVector = generateVector();
        functionVector.textContent = currentVector;
        
        // Определяем правильные классы
        correctClasses = determineClasses(currentVector);
        
        // Сбрасываем UI
        checkboxes.forEach(cb => {
            cb.checked = false;
            const label = cb.closest('.checkbox-label');
            label.style.borderColor = 'var(--border, #e2e8f0)';
            label.style.borderWidth = '1px';
            label.style.backgroundColor = 'rgba(51, 65, 85, 0.3)';
        });
        
        resultContainer.style.display = 'none';
        nextBtn.style.display = 'none';
        checkBtn.style.display = 'block';
        checkBtn.disabled = false;
        
        // Анимация вектора
        animateVector();
    }

    // Прокрутка к результатам
    function scrollToResult() {
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Прокрутка к вектору функции
    function scrollToFunctionVector() {
        const functionVectorElement = document.getElementById('stat-container');
        functionVectorElement.scrollIntoView({ behavior: 'smooth' });
    }

    // Проверка ответа
    checkBtn.addEventListener('click', function() {
        checkBtn.disabled = true;
        const selectedClasses = new Set();
        checkboxes.forEach(cb => {
            if (cb.checked && cb.value !== 'NONE') {
                selectedClasses.add(cb.value);
            }
        });

        // Получаем значение чекбокса "Никому"
        const noneSelected = Array.from(checkboxes).find(cb => cb.value === 'NONE')?.checked || false;

        // Проверяем правильность ответа
        let isCorrect = false;
        if (correctClasses.size === 0 && noneSelected) {
            // Если функция не принадлежит ни одному классу и выбран "Никому"
            isCorrect = true;
        } else if (correctClasses.size > 0 && !noneSelected) {
            // Если функция принадлежит классам и проверяем совпадение выбранных и правильных классов
            isCorrect = Array.from(correctClasses).every(c => selectedClasses.has(c)) &&
                        Array.from(selectedClasses).every(c => correctClasses.has(c));
        }

        // Обновляем счетчики
        totalCount++;
        if (isCorrect) {
            correctCount++;
        }

        // Обновляем отображение счетчиков
        correctCountEl.textContent = correctCount;
        totalCountEl.textContent = totalCount;

        resultMessage.className = 'result-message ' + (isCorrect ? 'correct' : 'incorrect');
        resultMessage.textContent = isCorrect ? 'Правильно!' : 'Неправильно. Попробуйте еще раз!';
        
        explanation.innerHTML = generateExplanation(currentVector, selectedClasses, correctClasses);
        
        resultContainer.style.display = 'block';
        nextBtn.style.display = 'block';
        
        // Прокрутить к результатам
        scrollToResult();
    });

    // Следующая функция
    nextBtn.addEventListener('click', function() {
        startNewGame();
        // Прокрутить наверх
        scrollToFunctionVector();
    });

    // Начинаем игру
    startNewGame();
});