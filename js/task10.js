document.addEventListener('DOMContentLoaded', function () {
    const functionVector = document.getElementById('function-vector');
    const checkBtn = document.getElementById('check-btn');
    const nextBtn = document.getElementById('next-btn');
    const resultContainer = document.getElementById('result-container');
    const resultMessage = document.getElementById('result-message');
    const explanation = document.getElementById('explanation');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    let currentVector = '';
    let correctClasses = new Set();

    // Add animation class toggle effect on checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
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

    // Генерация случайного вектора функции
    function generateVector(length = 8) {
        return Array.from({ length }, () => Math.random() > 0.5 ? '1' : '0').join('');
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
        let exp = '<h4>Объяснение:</h4><ul>';
        
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
        
        // Анимация вектора
        animateVector();
    }

    // Проверка ответа
    checkBtn.addEventListener('click', function() {
        checkBtn.disabled = true;
        const selectedClasses = new Set();
        checkboxes.forEach(cb => {
            if (cb.checked) selectedClasses.add(cb.value);
        });

        const isCorrect = Array.from(correctClasses).every(c => selectedClasses.has(c)) &&
                         Array.from(selectedClasses).every(c => correctClasses.has(c));

        resultMessage.className = 'result-message ' + (isCorrect ? 'correct' : 'incorrect');
        resultMessage.textContent = isCorrect ? 'Правильно!' : 'Неправильно. Попробуйте еще раз!';
        
        explanation.innerHTML = generateExplanation(currentVector, selectedClasses, correctClasses);
        
        resultContainer.style.display = 'block';
        nextBtn.style.display = 'block';
        
        // Прокрутить к результатам
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Следующая функция
    nextBtn.addEventListener('click', function() {
        startNewGame();
         // Разблокировка кнопки "Проверить"
    checkBtn.disabled = false;
        // Прокрутить наверх
        document.querySelector('.task-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Начинаем игру
    startNewGame();
});
